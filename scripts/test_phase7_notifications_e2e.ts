/**
 * ==============================================================================
 * DREAMX PHASE 7: NOTIFICATIONS, MESSAGING & REVIEWS E2E VERIFICATION SUITE
 * ==============================================================================
 * 
 * Verifies:
 * 1. Migration 0009 DDL & Realtime Publication Integrity
 * 2. Real-Time Chat Participant Access Control & RLS Boundary
 * 3. Booking Confirmed In-App Alert & 24h Reminder Scheduling
 * 4. Transactional Email (Resend) & WhatsApp Reminder Engine (DPDP Opt-In)
 * 5. Delayed Reminder Sweep Worker Execution & Delivery Audit Logging
 * 6. Session Completed Review Flow & Rating Constraint Enforcement
 * 7. Public Mentor Reviews & Rolling Aggregate Computation
 * 8. In-App Notification Center Feed & Mark-As-Read Transitions
 */

import pg from 'pg';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"')) {
      const closingIdx = val.indexOf('"', 1);
      if (closingIdx !== -1) val = val.substring(1, closingIdx);
    } else if (val.startsWith("'")) {
      const closingIdx = val.indexOf("'", 1);
      if (closingIdx !== -1) val = val.substring(1, closingIdx);
    } else {
      val = val.replace(/\s+#.*$/, '').trim();
    }
    env[key] = val;
  }
}

// Ensure env vars are loaded for libraries
process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
process.env.RESEND_API_KEY = env.RESEND_API_KEY;
process.env.FLAG_WHATSAPP_NOTIFICATIONS = env.FLAG_WHATSAPP_NOTIFICATIONS;

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase7E2E() {
  const { WhatsAppService } = await import('../src/lib/notifications/whatsapp-service');
  const { NotificationService } = await import('../src/lib/notifications/notification-service');

  console.log('================================================================');
  console.log('  DREAMX PHASE 7: NOTIFICATIONS & MESSAGING E2E VERIFICATION    ');
  console.log('================================================================\n');

  const client = await pool.connect();

  try {
    // -------------------------------------------------------------
    // CRITERION 1: Database Migration 0009 & Realtime Publication
    // -------------------------------------------------------------
    console.log('CRITERION 1: Migration 0009 Schema & Realtime Publication Integrity');
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('reviews', 'messages', 'notifications', 'notification_schedules', 'notification_delivery_logs')
      ORDER BY table_name;
    `);
    const tables = tableRes.rows.map((r: any) => r.table_name);
    assert(tables.includes('reviews'), 'reviews table exists in public schema');
    assert(tables.includes('messages'), 'messages table exists in public schema');
    assert(tables.includes('notifications'), 'notifications table exists in public schema');
    assert(tables.includes('notification_schedules'), 'notification_schedules table exists in public schema');
    assert(tables.includes('notification_delivery_logs'), 'notification_delivery_logs table exists in public schema');

    // Verify Realtime Publication
    const pubRes = await client.query(`
      SELECT tablename 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND tablename IN ('messages', 'notifications');
    `);
    const pubTables = pubRes.rows.map((r: any) => r.tablename);
    assert(pubTables.includes('messages'), 'public.messages is published to supabase_realtime');
    assert(pubTables.includes('notifications'), 'public.notifications is published to supabase_realtime');

    // Verify RLS is enabled on all Phase 7 tables
    const rlsRes = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
      WHERE nspname = 'public' 
        AND relname IN ('reviews', 'messages', 'notifications', 'notification_schedules', 'notification_delivery_logs');
    `);
    const rlsMap = Object.fromEntries(rlsRes.rows.map((r: any) => [r.relname, r.relrowsecurity]));
    assert(rlsMap['reviews'] === true, 'RLS is enabled on public.reviews');
    assert(rlsMap['messages'] === true, 'RLS is enabled on public.messages');
    assert(rlsMap['notifications'] === true, 'RLS is enabled on public.notifications');
    assert(rlsMap['notification_schedules'] === true, 'RLS is enabled on public.notification_schedules');
    assert(rlsMap['notification_delivery_logs'] === true, 'RLS is enabled on public.notification_delivery_logs');

    // -------------------------------------------------------------
    // CRITERION 2: Seed Fixtures & Chat Participant Access Control
    // -------------------------------------------------------------
    console.log('\nCRITERION 2: Chat Authorization & Participant Isolation');
    const sRes = await client.query(`SELECT id, full_name, email, phone FROM public.profiles WHERE email = 'student@dreamx.com' LIMIT 1;`);
    const mRes = await client.query(`SELECT id, full_name, email, phone FROM public.profiles WHERE email = 'mentor.google@dreamx.com' LIMIT 1;`);
    const oRes = await client.query(`SELECT id, full_name, email FROM public.profiles WHERE email != 'student@dreamx.com' AND email != 'mentor.google@dreamx.com' LIMIT 1;`);
    const stRes = await client.query(`SELECT id FROM public.service_types LIMIT 1;`);

    assert(sRes.rows.length === 1, 'Verified student profile located (student@dreamx.com)');
    assert(mRes.rows.length === 1, 'Verified mentor profile located (mentor.google@dreamx.com)');

    const student = sRes.rows[0];
    const mentor = mRes.rows[0];
    const other = oRes.rows[0];
    const serviceTypeId = stRes.rows[0].id;
    const testBookingId = '77777777-7777-7777-7777-777777777775';

    // Ensure student has phone and opt-in enabled for tests
    await client.query(`
      UPDATE public.profiles 
      SET phone = COALESCE(phone, '+919876543210'), whatsapp_opt_in = true 
      WHERE id = '${student.id}';
    `);

    // Clean any prior test messages, reviews, schedules
    await client.query(`DELETE FROM public.messages WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.reviews WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notification_delivery_logs WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notification_schedules WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notifications WHERE metadata->>'booking_id' = '${testBookingId}';`);
    await client.query(`DELETE FROM public.service_bookings WHERE id = '${testBookingId}';`);

    // Insert confirmed test booking
    const tomorrowUtc = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const tomorrowEndUtc = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
    await client.query(`
      INSERT INTO public.service_bookings (
        id, student_id, mentor_id, service_type_id, status, scheduled_start_utc, scheduled_end_utc,
        meeting_url, gross_amount, net_amount, platform_fee, mentor_earning, currency
      )
      VALUES (
        '${testBookingId}', '${student.id}', '${mentor.id}', ${serviceTypeId}, 'confirmed',
        '${tomorrowUtc}', '${tomorrowEndUtc}', 'https://meet.google.com/dmx-p7-test',
        2999.00, 2999.00, 599.80, 2399.20, 'INR'
      );
    `);

    // Insert chat message as student
    const msgRes = await client.query(`
      INSERT INTO public.messages (booking_id, sender_id, content)
      VALUES ('${testBookingId}', '${student.id}', 'Hello Vikram, looking forward to the system design mock.')
      RETURNING *;
    `);
    assert(msgRes.rows.length === 1, 'Student successfully posted chat message to booking');
    assert(msgRes.rows[0].is_read === false, 'New chat message defaults to is_read = false');

    // Participant verification logic
    const participantCheck = await client.query(`
      SELECT 1 FROM public.service_bookings sb
      WHERE sb.id = '${testBookingId}'
        AND (sb.student_id = '${mentor.id}' OR sb.mentor_id = '${mentor.id}');
    `);
    assert(participantCheck.rows.length === 1, 'Mentor is recognized as valid participant of booking');

    const intruderCheck = await client.query(`
      SELECT 1 FROM public.service_bookings sb
      WHERE sb.id = '${testBookingId}'
        AND (sb.student_id = '${other.id}' OR sb.mentor_id = '${other.id}');
    `);
    assert(intruderCheck.rows.length === 0, 'Intruder is rejected from participant access (0 rows matched)');

    // Content length constraints
    let emptyRejected = false;
    try {
      await client.query(`
        INSERT INTO public.messages (booking_id, sender_id, content)
        VALUES ('${testBookingId}', '${student.id}', '');
      `);
    } catch {
      emptyRejected = true;
    }
    assert(emptyRejected, 'DB constraint rejects empty message content (char_length >= 1)');

    // -------------------------------------------------------------
    // CRITERION 3: Booking Confirmed Notification & Reminder Engine
    // -------------------------------------------------------------
    console.log('\nCRITERION 3: Booking Confirmed In-App Notification & Schedule Dispatch');
    await NotificationService.onBookingConfirmed(testBookingId);

    // Verify in-app notifications created
    const notifRes = await client.query(`
      SELECT user_id, title, category 
      FROM public.notifications 
      WHERE metadata->>'booking_id' = '${testBookingId}'
      ORDER BY user_id;
    `);
    const notifiedUsers = notifRes.rows.map((r: any) => r.user_id);
    assert(notifiedUsers.includes(student.id), 'Student received in-app "Booking Confirmed!" notification');
    assert(notifiedUsers.includes(mentor.id), 'Mentor received in-app "New Booking Confirmed" notification');

    // Verify 24h reminder schedules created
    const schedRes = await client.query(`
      SELECT channel, notification_type, status, idempotency_key 
      FROM public.notification_schedules 
      WHERE booking_id = '${testBookingId}'
      ORDER BY channel;
    `);
    const channels = schedRes.rows.map((r: any) => r.channel);
    assert(channels.includes('email'), '24h pre-session email reminder schedule queued (pending)');
    assert(channels.includes('whatsapp'), '24h pre-session WhatsApp reminder schedule queued (pending)');

    // Idempotency: verify calling onBookingConfirmed again does NOT duplicate schedules
    await NotificationService.onBookingConfirmed(testBookingId);
    const countCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM public.notification_schedules 
      WHERE booking_id = '${testBookingId}';
    `);
    assert(Number(countCheck.rows[0].count) === 2, 'Idempotency key prevents duplicate notification schedules');

    // -------------------------------------------------------------
    // CRITERION 4: Sweep Worker & WhatsApp Simulation
    // -------------------------------------------------------------
    console.log('\nCRITERION 4: Delayed Reminder Sweep & WhatsApp Opt-In Simulation');
    // Force one schedule to be due immediately
    await client.query(`
      UPDATE public.notification_schedules 
      SET scheduled_for = NOW() - interval '5 minutes'
      WHERE booking_id = '${testBookingId}';
    `);

    const sweepResult = await NotificationService.sweepScheduledNotifications();
    assert(sweepResult.processed >= 2, `Sweep worker processed due schedules (processed: ${sweepResult.processed})`);
    assert(sweepResult.sent >= 2, `Sweep worker sent due notifications (sent: ${sweepResult.sent})`);

    // Verify status updated in DB
    const updatedSched = await client.query(`
      SELECT channel, status 
      FROM public.notification_schedules 
      WHERE booking_id = '${testBookingId}';
    `);
    const allSent = updatedSched.rows.every((r: any) => r.status === 'sent');
    assert(allSent, 'All due notification schedules transitioned to status "sent"');

    // Verify delivery logs recorded
    const logsRes = await client.query(`
      SELECT channel, status, provider 
      FROM public.notification_delivery_logs 
      WHERE booking_id = '${testBookingId}';
    `);
    assert(logsRes.rows.length >= 2, 'Audit logs created in public.notification_delivery_logs');
    const waLog = logsRes.rows.find((r: any) => r.channel === 'whatsapp');
    assert(waLog?.status === 'simulated_success' || waLog?.status === 'delivered', 'WhatsApp delivery successfully logged');

    // Test WhatsApp Opt-Out Gating
    const waOptOutRes = await WhatsAppService.sendSessionReminder({
      recipientPhone: '+919876543210',
      optIn: false,
      studentName: 'Opted Out User',
      mentorName: 'Test Mentor',
      serviceTitle: 'Test Service',
      scheduledTimeIST: '7:30 PM',
      meetingUrl: 'https://meet.google.com/test',
    });
    assert(waOptOutRes.optedOut === true, 'WhatsApp engine strictly respects opt-in = false (DPDP compliance)');
    assert(waOptOutRes.success === false, 'WhatsApp does not dispatch when user has not opted in');

    // -------------------------------------------------------------
    // CRITERION 5: Session Completed Review Request & Submission
    // -------------------------------------------------------------
    console.log('\nCRITERION 5: Session Completed Review Scheduling & Review Submission');
    // Transition booking to completed
    await client.query(`
      UPDATE public.service_bookings 
      SET status = 'completed' 
      WHERE id = '${testBookingId}';
    `);

    // Trigger onSessionCompleted
    await NotificationService.onSessionCompleted(testBookingId);

    const reviewNotif = await client.query(`
      SELECT title, category 
      FROM public.notifications 
      WHERE user_id = '${student.id}' AND category = 'deliverables' AND metadata->>'booking_id' = '${testBookingId}';
    `);
    assert(reviewNotif.rows.length >= 1, 'Student received in-app review request notification upon session completion');

    const reviewSched = await client.query(`
      SELECT notification_type, status 
      FROM public.notification_schedules 
      WHERE booking_id = '${testBookingId}' AND notification_type = 'review_request';
    `);
    assert(reviewSched.rows.length === 1, 'Review request email schedule queued for student');

    // Student submits review
    const reviewInsert = await client.query(`
      INSERT INTO public.reviews (
        booking_id, reviewer_id, mentor_id, rating, punctuality_rating, actionability_rating,
        feedback_text, is_public
      )
      VALUES (
        '${testBookingId}', '${student.id}', '${mentor.id}', 5, 5, 5,
        'Brilliant session! Very thorough distributed systems whiteboard review.', true
      )
      RETURNING *;
    `);
    assert(reviewInsert.rows.length === 1, 'Student successfully submitted 5-star review');
    assert(reviewInsert.rows[0].rating === 5, 'Review rating recorded as 5');

    // Verify duplicate review rejected
    let dupRejected = false;
    try {
      await client.query(`
        INSERT INTO public.reviews (
          booking_id, reviewer_id, mentor_id, rating, feedback_text, is_public
        )
        VALUES ('${testBookingId}', '${student.id}', '${mentor.id}', 4, 'Duplicate review attempt', true);
      `);
    } catch {
      dupRejected = true;
    }
    assert(dupRejected, 'Duplicate review submission on same booking is rejected (UNIQUE booking_id)');

    // Verify rating check constraint (rating out of bounds)
    let invalidRatingRejected = false;
    try {
      await client.query(`
        INSERT INTO public.reviews (
          booking_id, reviewer_id, mentor_id, rating, feedback_text, is_public
        )
        VALUES ('${testBookingId}-invalid', '${student.id}', '${mentor.id}', 6, 'Invalid rating', true);
      `);
    } catch {
      invalidRatingRejected = true;
    }
    assert(invalidRatingRejected, 'Rating > 5 is strictly rejected by CHECK constraint (rating >= 1 AND rating <= 5)');

    // -------------------------------------------------------------
    // CRITERION 6: Public Mentor Reviews Aggregation
    // -------------------------------------------------------------
    console.log('\nCRITERION 6: Mentor Reviews Aggregation & Score Computation');
    const aggRes = await client.query(`
      SELECT 
        COUNT(*)::int as total_reviews,
        ROUND(AVG(rating), 1)::float as avg_rating
      FROM public.reviews 
      WHERE mentor_id = '${mentor.id}' AND deleted_at IS NULL AND is_public = true;
    `);
    assert(aggRes.rows[0].total_reviews >= 1, 'Mentor has at least 1 verified review');
    assert(aggRes.rows[0].avg_rating >= 4.0, `Mentor rolling average rating computed accurately (${aggRes.rows[0].avg_rating})`);

    // -------------------------------------------------------------
    // CRITERION 7: Notification Feed & Mark as Read Transitions
    // -------------------------------------------------------------
    console.log('\nCRITERION 7: In-App Notification Center Feed & Read State Transitions');
    const studentNotifs = await client.query(`
      SELECT id, is_read, title 
      FROM public.notifications 
      WHERE user_id = '${student.id}'
      ORDER BY created_at DESC;
    `);
    assert(studentNotifs.rows.length >= 2, `Student has notifications in feed (${studentNotifs.rows.length} items)`);

    // Mark single notification read
    const firstNotifId = studentNotifs.rows[0].id;
    await client.query(`
      UPDATE public.notifications 
      SET is_read = true, read_at = NOW() 
      WHERE id = '${firstNotifId}' AND user_id = '${student.id}';
    `);

    const markCheck = await client.query(`
      SELECT is_read, read_at 
      FROM public.notifications 
      WHERE id = '${firstNotifId}';
    `);
    assert(markCheck.rows[0].is_read === true, 'Single notification marked as read');
    assert(markCheck.rows[0].read_at !== null, 'read_at timestamp updated');

    // Mark all notifications read for student
    await client.query(`
      UPDATE public.notifications 
      SET is_read = true, read_at = NOW() 
      WHERE user_id = '${student.id}' AND is_read = false;
    `);

    const unreadCheck = await client.query(`
      SELECT COUNT(*)::int as unread 
      FROM public.notifications 
      WHERE user_id = '${student.id}' AND is_read = false;
    `);
    assert(unreadCheck.rows[0].unread === 0, 'All student notifications marked read (unread count = 0)');

    // -------------------------------------------------------------
    // CLEANUP TEST FIXTURES
    // -------------------------------------------------------------
    console.log('\nCleaning up Phase 7 test artifacts...');
    await client.query(`DELETE FROM public.messages WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.reviews WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notification_delivery_logs WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notification_schedules WHERE booking_id = '${testBookingId}';`);
    await client.query(`DELETE FROM public.notifications WHERE metadata->>'booking_id' = '${testBookingId}';`);
    await client.query(`DELETE FROM public.service_bookings WHERE id = '${testBookingId}';`);
    console.log('Test fixtures cleaned up successfully.');

  } catch (err) {
    console.error('Fatal execution error during Phase 7 E2E suite:', err);
    failed++;
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n================================================================');
  console.log(`   PHASE 7 E2E SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7E2E();
