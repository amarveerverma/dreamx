import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments';
import { PayoutService, adminDb } from '@/lib/payments/payout-service';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const provider = getPaymentProvider('razorpay');
    const isVerified = provider.verifyWebhookSignature(rawBody, signature);

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid HMAC webhook signature' }, { status: 400 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const eventId = request.headers.get('x-razorpay-event-id') || event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    // Idempotency Check: check if event was already recorded
    const { data: existingEvent } = await adminDb
      .from('processed_webhook_events')
      .select('event_id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      // Return 200 OK without re-processing (idempotency compliance)
      return NextResponse.json({ status: 'already_processed', event_id: eventId }, { status: 200 });
    }

    // Record processed event to prevent replay storms
    await adminDb.from('processed_webhook_events').insert({
      event_id: eventId,
      gateway: 'razorpay',
      event_type: eventType,
      payload: event,
    });

    // Handle Event: payment.captured
    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const bookingId = paymentEntity?.notes?.booking_id;

      if (bookingId) {
        // Confirm booking if not already confirmed
        const meetHash = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
        await adminDb
          .from('service_bookings')
          .update({
            status: 'confirmed',
            meeting_url: `https://meet.google.com/dmx-${meetHash}`,
            payout_status: 'held',
          })
          .eq('id', bookingId)
          .eq('status', 'pending_payment');

        // Create native hold schedule
        await PayoutService.createPayoutSchedule({
          bookingId,
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId,
        });
      }
    }

    // Handle Event: payout.released (or transfer.processed)
    if (eventType === 'payout.released' || eventType === 'transfer.processed') {
      const transferEntity = event.payload?.transfer?.entity || event.payload?.payout?.entity;
      const transferId = transferEntity?.id;

      if (transferId) {
        await adminDb
          .from('payout_schedules')
          .update({
            status: 'released',
            released_at: new Date().toISOString(),
          })
          .eq('gateway_transfer_id', transferId);
      }
    }

    return NextResponse.json({ success: true, event_id: eventId }, { status: 200 });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json({ error: err.message || 'Webhook internal error' }, { status: 500 });
  }
}
