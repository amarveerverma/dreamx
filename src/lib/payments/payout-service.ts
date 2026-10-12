import { CommissionCalculatorService } from './commission';
import { RazorpayAdapter } from './adapters/razorpay-adapter';
import { createClient } from '@supabase/supabase-js';

// Service role client for privileged background sweep and webhook processing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_H6IobRCfodG-46bHLnj_sg_Ih6lrvsj';

export const adminDb = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export class PayoutService {
  private static adapter = new RazorpayAdapter();

  /**
   * Creates a payout_schedules row when payment is verified/captured
   */
  public static async createPayoutSchedule(params: {
    bookingId: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
  }) {
    // 1. Fetch booking record
    const { data: booking, error: bkErr } = await adminDb
      .from('service_bookings')
      .select('*, service_types(*)')
      .eq('id', params.bookingId)
      .single();

    if (bkErr || !booking) {
      throw new Error(`Booking not found: ${params.bookingId}`);
    }

    // 2. Check if a payout schedule already exists (idempotency)
    const { data: existing } = await adminDb
      .from('payout_schedules')
      .select('id, status')
      .eq('booking_id', booking.id)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // 3. Determine booking type and calculate split
    const bookingType = booking.program_enrollment_id ? 'program' : 'service';
    const split = CommissionCalculatorService.calculatePayoutSplit(
      Number(booking.gross_amount),
      bookingType,
      Number(booking.membership_discount || 0)
    );

    const holdUntil = CommissionCalculatorService.computeHoldUntil(bookingType);

    // 4. Insert into payout_schedules
    const { data: schedule, error: schErr } = await adminDb
      .from('payout_schedules')
      .insert({
        booking_id: booking.id,
        mentor_id: booking.mentor_id,
        gross_amount: split.grossAmount,
        platform_commission: split.platformCommission,
        gst_amount: split.gstAmount,
        net_payout_amount: split.netPayoutAmount,
        currency: booking.currency || 'INR',
        hold_until: holdUntil,
        status: 'on_hold',
        frozen: false,
        gateway_order_id: params.gatewayOrderId,
        gateway_payment_id: params.gatewayPaymentId,
      })
      .select()
      .single();

    if (schErr || !schedule) {
      throw new Error(`Failed to create payout schedule: ${schErr?.message}`);
    }

    // 5. Insert immutable audit log
    await adminDb.from('payout_logs').insert({
      payout_schedule_id: schedule.id,
      event_type: 'payout_held',
      payload: {
        booking_id: booking.id,
        split,
        hold_until: holdUntil,
        gateway_order_id: params.gatewayOrderId,
        gateway_payment_id: params.gatewayPaymentId,
      },
    });

    // 6. Update booking payout status
    await adminDb
      .from('service_bookings')
      .update({
        payout_status: 'held',
        payout_eligible_at: holdUntil,
      })
      .eq('id', booking.id);

    return schedule;
  }

  /**
   * Sweeps and releases eligible holds where hold_until <= NOW() and frozen is false
   */
  public static async sweepEligiblePayouts() {
    const nowIso = new Date().toISOString();

    // Query eligible rows
    const { data: eligibleRows, error } = await adminDb
      .from('payout_schedules')
      .select('*')
      .lte('hold_until', nowIso)
      .eq('status', 'on_hold')
      .eq('frozen', false);

    if (error) {
      throw new Error(`Failed to query eligible payout schedules: ${error.message}`);
    }

    const released = [];
    for (const schedule of eligibleRows || []) {
      try {
        // Execute release via gateway adapter
        const result = await this.adapter.releasePayout({
          payoutScheduleId: schedule.id,
          amount: Number(schedule.net_payout_amount),
          currency: schedule.currency,
        });

        if (result.success) {
          const releasedAt = new Date().toISOString();

          // Update payout_schedules row
          await adminDb
            .from('payout_schedules')
            .update({
              status: 'released',
              released_at: releasedAt,
              gateway_transfer_id: result.gatewayTransferId,
            })
            .eq('id', schedule.id);

          // Update booking payout_status
          await adminDb
            .from('service_bookings')
            .update({ payout_status: 'released' })
            .eq('id', schedule.booking_id);

          // Write audit log
          await adminDb.from('payout_logs').insert({
            payout_schedule_id: schedule.id,
            event_type: 'payout_released',
            payload: {
              result,
              released_at: releasedAt,
            },
          });

          released.push({ scheduleId: schedule.id, status: 'released' });
        }
      } catch (err: any) {
        console.error(`[PayoutService] Failed to release schedule ${schedule.id}:`, err.message);
      }
    }

    return {
      processedCount: eligibleRows?.length || 0,
      releasedCount: released.length,
      released,
    };
  }

  /**
   * Freezes a payout schedule during an active dispute
   */
  public static async freezePayout(payoutScheduleId: string, reason: string, actorId?: string) {
    const { data: schedule, error } = await adminDb
      .from('payout_schedules')
      .update({
        frozen: true,
        status: 'frozen',
        freeze_reason: reason,
      })
      .eq('id', payoutScheduleId)
      .select()
      .single();

    if (error || !schedule) {
      throw new Error(`Failed to freeze payout schedule: ${error?.message}`);
    }

    // Write audit log
    await adminDb.from('payout_logs').insert({
      payout_schedule_id: schedule.id,
      event_type: 'payout_frozen',
      actor_id: actorId,
      payload: { reason, frozen_at: new Date().toISOString() },
    });

    return schedule;
  }

  /**
   * Admin force-release override
   */
  public static async forceReleasePayout(payoutScheduleId: string, adminActorId: string) {
    const { data: schedule, error } = await adminDb
      .from('payout_schedules')
      .select('*')
      .eq('id', payoutScheduleId)
      .single();

    if (error || !schedule) {
      throw new Error(`Payout schedule not found: ${payoutScheduleId}`);
    }

    const result = await this.adapter.releasePayout({
      payoutScheduleId: schedule.id,
      amount: Number(schedule.net_payout_amount),
      currency: schedule.currency,
    });

    const releasedAt = new Date().toISOString();

    await adminDb
      .from('payout_schedules')
      .update({
        status: 'released',
        frozen: false,
        released_at: releasedAt,
        gateway_transfer_id: result.gatewayTransferId,
      })
      .eq('id', schedule.id);

    await adminDb
      .from('service_bookings')
      .update({ payout_status: 'released' })
      .eq('id', schedule.booking_id);

    await adminDb.from('payout_logs').insert({
      payout_schedule_id: schedule.id,
      event_type: 'force_released',
      actor_id: adminActorId,
      payload: {
        adminActorId,
        released_at: releasedAt,
        result,
      },
    });

    return { success: true, scheduleId: schedule.id, status: 'released' };
  }
}
