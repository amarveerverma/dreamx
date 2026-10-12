import crypto from 'crypto';
import { adminDb, PayoutService } from '../src/lib/payments/payout-service';
import { RazorpayAdapter } from '../src/lib/payments/adapters/razorpay-adapter';

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exit(1);
  }
}

async function runMilestone3Verification() {
  console.log('====================================================');
  console.log('   MILESTONE 3: WEBHOOK & PAYOUT ORCHESTRATOR TESTS ');
  console.log('====================================================\n');

  // 1. Get test student and mentor
  const { data: student } = await adminDb.from('profiles').select('id, email').eq('role', 'student').limit(1).single();
  const { data: mentor } = await adminDb.from('profiles').select('id, email').eq('role', 'mentor').limit(1).single();

  assert(!!student && !!mentor, 'Test student and mentor exist in database');

  // 2. Create test booking
  const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const scheduledEnd = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

  const { data: booking, error: bkErr } = await adminDb
    .from('service_bookings')
    .insert({
      booking_source: 'direct_catalog',
      student_id: student!.id,
      mentor_id: mentor!.id,
      service_type_id: 1,
      scheduled_start_utc: scheduledStart,
      scheduled_end_utc: scheduledEnd,
      gross_amount: 1000.00,
      membership_discount: 0.00,
      net_amount: 1000.00,
      platform_fee: 200.00,
      mentor_earning: 800.00,
      currency: 'INR',
      status: 'pending_payment',
      checkout_ttl: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  assert(!bkErr && !!booking, `Test booking created in pending_payment state (ID: ${booking?.id})`);

  // 3. Test PayoutService.createPayoutSchedule
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;

  const schedule = await PayoutService.createPayoutSchedule({
    bookingId: booking.id,
    gatewayOrderId: testOrderId,
    gatewayPaymentId: testPaymentId
  });

  assert(schedule.status === 'on_hold', 'Payout schedule created in on_hold status');
  assert(Number(schedule.gross_amount) === 1000.00, 'Gross amount is ₹1,000.00');
  assert(Number(schedule.platform_commission) === 200.00, '20% platform commission is ₹200.00');
  assert(Number(schedule.gst_amount) === 36.00, '18% GST on platform fee is ₹36.00');
  assert(Number(schedule.net_payout_amount) === 764.00, 'Net mentor payout is exactly ₹764.00');
  assert(schedule.frozen === false, 'New schedule is not frozen');

  // Verify hold_until is ~3 days out
  const holdDate = new Date(schedule.hold_until).getTime();
  const diffHours = (holdDate - Date.now()) / (1000 * 60 * 60);
  assert(diffHours >= 71 && diffHours <= 73, `Hold window verified: ~72 hours (Actual: ${diffHours.toFixed(1)}h)`);

  // 4. Test Payout Logs Audit Trail
  const { data: logs } = await adminDb
    .from('payout_logs')
    .select('*')
    .eq('payout_schedule_id', schedule.id);

  assert(!!(logs && logs.length > 0 && logs[0].event_type === 'payout_held'), 'Immutable audit log recorded: payout_held');

  // 5. Test Webhook Idempotency & Signature Verification
  console.log('\n--- Webhook Idempotency & Security Verification ---');
  const adapter = new RazorpayAdapter();
  const testEventId = `evt_idempotency_test_${Date.now()}`;

  const webhookPayload = JSON.stringify({
    id: testEventId,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          order_id: testOrderId,
          notes: { booking_id: booking.id }
        }
      }
    }
  });

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret';
  const validSig = crypto.createHmac('sha256', webhookSecret).update(webhookPayload).digest('hex');

  // First webhook delivery
  const verifyRes1 = await fetch('http://localhost:3000/api/v1/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validSig,
      'x-razorpay-event-id': testEventId
    },
    body: webhookPayload
  });
  const json1 = await verifyRes1.json();
  assert(verifyRes1.status === 200 && json1.success === true, 'First webhook delivery accepted and processed (HTTP 200)');

  // Duplicate webhook delivery (replayed payload)
  const verifyRes2 = await fetch('http://localhost:3000/api/v1/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validSig,
      'x-razorpay-event-id': testEventId
    },
    body: webhookPayload
  });
  const json2 = await verifyRes2.json();
  assert(verifyRes2.status === 200 && json2.status === 'already_processed', 'Duplicate webhook detected and rejected safely as already_processed (HTTP 200)');

  // Tampered webhook signature
  const tamperedRes = await fetch('http://localhost:3000/api/v1/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'tampered_bad_signature',
      'x-razorpay-event-id': `evt_tampered_${Date.now()}`
    },
    body: webhookPayload
  });
  assert(tamperedRes.status === 400, 'Tampered webhook signature rejected (HTTP 400)');

  // 6. Test Dispute Freezing
  console.log('\n--- Dispute Freezing & Sweep Worker Exclusion ---');
  const frozenSchedule = await PayoutService.freezePayout(schedule.id, 'Student filed rubric quality dispute');
  assert(frozenSchedule.frozen === true && frozenSchedule.status === 'frozen', 'Dispute freeze sets frozen=true and status=frozen');

  // Fast-forward hold_until into the past to test sweep eligibility
  await adminDb
    .from('payout_schedules')
    .update({ hold_until: new Date(Date.now() - 1000).toISOString() })
    .eq('id', schedule.id);

  // Sweep should NOT release frozen schedule
  const sweepRes1 = await PayoutService.sweepEligiblePayouts();
  const stillFrozen = await adminDb.from('payout_schedules').select('status, frozen').eq('id', schedule.id).single();
  assert(stillFrozen.data?.status === 'frozen', 'Automated sweep worker strictly skips frozen dispute schedule');

  // 7. Test Admin Force Release Override
  console.log('\n--- Admin Force Release Override ---');
  const forceReleaseRes = await PayoutService.forceReleasePayout(schedule.id, 'admin_super_user');
  assert(forceReleaseRes.success === true && forceReleaseRes.status === 'released', 'Admin force-release executed successfully');

  const releasedSchedule = await adminDb.from('payout_schedules').select('*').eq('id', schedule.id).single();
  assert(releasedSchedule.data?.status === 'released' && !!releasedSchedule.data?.released_at, 'Schedule transitioned to released with timestamp');

  // Verify booking payout_status updated to released
  const updatedBk = await adminDb.from('service_bookings').select('payout_status').eq('id', booking.id).single();
  assert(updatedBk.data?.payout_status === 'released', 'Parent booking payout_status updated to released');

  // 8. Cleanup test data
  console.log('\n--- Cleaning up test records ---');
  await adminDb.from('payout_logs').delete().eq('payout_schedule_id', schedule.id);
  await adminDb.from('payout_schedules').delete().eq('id', schedule.id);
  await adminDb.from('service_bookings').delete().eq('id', booking.id);
  await adminDb.from('processed_webhook_events').delete().eq('event_id', testEventId);

  console.log('\n====================================================');
  console.log('✅ ALL MILESTONE 3 TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runMilestone3Verification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
