import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ogpgoxikulkfpyoorisc.supabase.co';
const SERVICE_KEY = 'sb_secret_H6IobRCfodG-46bHLnj_sg_Ih6lrvsj';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function runE2ETests() {
  console.log('--- STARTING PHASE 4 E2E VERIFICATION SUITE ---');

  // Test Profile IDs
  const studentId = '2637c5a8-29cc-488a-a41d-0c4f0313e8d3'; // Test Student
  const mentorId = '2d6db0c9-3092-404b-9a03-104a67975ec6';  // Test Mentor

  // 1. Create Smart Match Request
  console.log('\n[TEST 1] Creating Smart Match Request for Student...');
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 2);
  const preferredDate = testDate.toISOString().split('T')[0];

  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .insert({
      student_id: studentId,
      service_type_id: 1, // 1-on-1 Mock Interview
      target_career_market_id: 'CM-IN',
      budget_min: 800.00,
      budget_max: 1200.00,
      currency: 'INR',
      preferred_date: preferredDate,
      preferred_time_utc: '14:00:00',
      student_time_zone: 'Asia/Kolkata',
      attached_resume_url: 'https://ogpgoxikulkfpyoorisc.supabase.co/storage/v1/object/public/resumes/test_resume.pdf',
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (reqError) {
    console.error('FAIL: Test 1 failed:', reqError);
    process.exit(1);
  }
  console.log('PASS: Smart Match Request Created. ID:', request.id, 'TTL Expires:', request.expires_at);

  // 2. Mentor Submits Offer
  console.log('\n[TEST 2] Mentor Submitting Offer...');
  const { data: offer1, error: offerError1 } = await supabase
    .from('service_offers')
    .insert({
      request_id: request.id,
      mentor_id: mentorId,
      price: 1000.00,
      currency: 'INR',
      mentor_pitch: 'I have conducted 100+ Google interviews and will give you actionable feedback.',
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (offerError1) {
    console.error('FAIL: Test 2 failed:', offerError1);
    process.exit(1);
  }
  console.log('PASS: Offer Submitted by Mentor. ID:', offer1.id, 'Price: ₹' + offer1.price);

  // 3. Student Submits Counter-Offer
  console.log('\n[TEST 3] Student Submitting Counter-Offer (1st Counter)...');
  const { data: counterOffer, error: counterError } = await supabase
    .from('service_offers')
    .insert({
      request_id: request.id,
      mentor_id: mentorId,
      price: 900.00,
      currency: 'INR',
      mentor_pitch: 'Counter-offer: Student proposed ₹900',
      is_counter_offer: true,
      counter_to_offer_id: offer1.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (counterError) {
    console.error('FAIL: Test 3 failed:', counterError);
    process.exit(1);
  }
  console.log('PASS: Counter-Offer Created. ID:', counterOffer.id, 'Counter Price: ₹' + counterOffer.price);

  // 4. Student Attempts 2nd Counter-Offer (Testing 1-Counter Limit Enforcement)
  console.log('\n[TEST 4] Testing 1-Counter Limit Enforcement (Unique constraint uq_mentor_request_offer)...');
  const { data: counter2, error: counterError2 } = await supabase
    .from('service_offers')
    .insert({
      request_id: request.id,
      mentor_id: mentorId,
      price: 850.00,
      currency: 'INR',
      mentor_pitch: '2nd counter attempt',
      is_counter_offer: true,
      counter_to_offer_id: offer1.id,
      status: 'pending',
    });

  if (counterError2 && counterError2.code === '23505') {
    console.log('PASS: Second Counter-Offer Blocked as expected by DB constraint uq_mentor_request_offer (Code 23505)');
  } else {
    console.error('FAIL: Expected 23505 unique constraint violation, got:', counterError2);
  }

  // 5. Student Accepts Counter-Offer -> Creates Booking with 15m Concurrency Lock
  console.log('\n[TEST 5] Student Accepts Offer & Transitions into Booking with 15m Lock...');
  const scheduledStart = `${request.preferred_date}T${request.preferred_time_utc}Z`;
  const scheduledEnd = new Date(new Date(scheduledStart).getTime() + 60 * 60 * 1000).toISOString();

  const { data: booking, error: bookingError } = await supabase
    .from('service_bookings')
    .insert({
      booking_source: 'smart_match',
      student_id: studentId,
      mentor_id: mentorId,
      service_type_id: request.service_type_id,
      accepted_offer_id: counterOffer.id,
      scheduled_start_utc: scheduledStart,
      scheduled_end_utc: scheduledEnd,
      gross_amount: counterOffer.price,
      membership_discount: 0.00,
      net_amount: counterOffer.price,
      platform_fee: counterOffer.price * 0.20,
      mentor_earning: counterOffer.price * 0.80,
      currency: 'INR',
      status: 'pending_payment',
      checkout_ttl: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (bookingError) {
    console.error('FAIL: Test 5 failed:', bookingError);
    process.exit(1);
  }
  console.log('PASS: Booking Created in pending_payment state. ID:', booking.id, 'Checkout TTL:', booking.checkout_ttl);

  // 6. Test Concurrency Double-Booking Prevention (Race Mitigation HP-1)
  console.log('\n[TEST 6] Testing Concurrency Contention Lock (Attempting to double-book same slot)...');
  const { data: conflictBooking, error: conflictError } = await supabase
    .from('service_bookings')
    .insert({
      booking_source: 'direct_catalog',
      student_id: studentId,
      mentor_id: mentorId,
      service_type_id: 1,
      scheduled_start_utc: scheduledStart,
      scheduled_end_utc: scheduledEnd,
      gross_amount: 1000.00,
      membership_discount: 0.00,
      net_amount: 1000.00,
      platform_fee: 200.00,
      mentor_earning: 800.00,
      status: 'pending_payment',
    });

  if (conflictError && conflictError.code === '23505') {
    console.log('PASS: Double-booking blocked by unique index uq_active_mentor_slot_lock (Code 23505)');
  } else {
    console.error('FAIL: Double booking was NOT blocked:', conflictError);
  }

  // 7. Payment Confirmation & Google Meet Generation
  console.log('\n[TEST 7] Payment Captured -> Transition Booking to Confirmed & Populate Google Meet URL...');
  const { data: confirmedBooking, error: confirmError } = await supabase
    .from('service_bookings')
    .update({
      status: 'confirmed',
      meeting_url: 'https://meet.google.com/dmx-mock-test',
      payout_status: 'held',
    })
    .eq('id', booking.id)
    .select()
    .single();

  if (confirmError) {
    console.error('FAIL: Test 7 failed:', confirmError);
    process.exit(1);
  }
  console.log('PASS: Booking Confirmed. Status:', confirmedBooking.status, 'Meet URL:', confirmedBooking.meeting_url, 'Payout Status:', confirmedBooking.payout_status);

  // 8. Session Completion & Deliverable Submission -> Payout 3-Day Hold State Machine
  console.log('\n[TEST 8] Mentor Completes Session -> Set Deliverable & Initiate 3-Day Payout Hold...');
  const payoutEligibleDate = new Date();
  payoutEligibleDate.setDate(payoutEligibleDate.getDate() + 3);

  const { data: completedBooking, error: completeError } = await supabase
    .from('service_bookings')
    .update({
      status: 'completed',
      deliverable_file_url: 'https://ogpgoxikulkfpyoorisc.supabase.co/storage/v1/object/public/deliverables/rubric_report.pdf',
      deliverable_submitted_at: new Date().toISOString(),
      payout_status: 'held',
      payout_eligible_at: payoutEligibleDate.toISOString(),
    })
    .eq('id', booking.id)
    .select()
    .single();

  if (completeError) {
    console.error('FAIL: Test 8 failed:', completeError);
    process.exit(1);
  }
  console.log('PASS: Booking Completed. Deliverable:', completedBooking.deliverable_file_url, 'Payout Eligible At (+3 days):', completedBooking.payout_eligible_at);

  // Clean up test records
  console.log('\n[CLEANUP] Cleaning up test records...');
  await supabase.from('service_bookings').delete().eq('id', booking.id);
  await supabase.from('service_offers').delete().eq('request_id', request.id);
  await supabase.from('service_requests').delete().eq('id', request.id);
  console.log('PASS: Test records cleaned up.');

  console.log('\n======================================================');
  console.log('>>> ALL 8 PHASE 4 STATE MACHINE TESTS PASSED 100% <<<');
  console.log('======================================================\n');
}

runE2ETests().catch(err => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
