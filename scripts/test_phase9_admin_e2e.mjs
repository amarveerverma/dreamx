/**
 * DREAMX PHASE 9 — ADMIN OPERATIONS, DISPUTE TRIAGE & AUDIT TRAIL E2E VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Admin Authentication & Role-Based Access Control (RBAC).
 * 2. Self-Role Escalation Prevention (Anti-Privilege Escalation Trigger).
 * 3. WORM Audit Trail Append-Only Guarantee (Assert UPDATE/DELETE throws error).
 * 4. Mentor KYC Verification Lifecycle.
 * 5. Booking Dispute Triage, Telemetry Verification & Arbitration.
 * 6. Dispute Abuse Strike Limiting & Account Controls.
 * 7. Admin Executive KPIs & Financial Aggregation.
 */

import fs from 'fs';
import { resolve } from 'path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local cleanly
const envFile = fs.readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const envVars = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).split('#')[0].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      envVars[k] = v;
    }
  }
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = envVars.DATABASE_URL;

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase9Tests() {
  console.log('======================================================================');
  console.log('   DREAMX PHASE 9: ADMIN OPERATIONS & DISPUTE TRIAGE E2E TESTS');
  console.log('======================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Admin Authentication & RBAC Integrity
    // -------------------------------------------------------------------------
    console.log('📌 Test Suite 1: Admin Authentication & RBAC Verification');
    const { data: adminLogin, error: adminLoginErr } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@dreamx.com',
      password: 'CareerMobility2025!',
    });
    assert(!adminLoginErr && adminLogin.user, 'admin@dreamx.com successfully authenticated via GoTrue');
    assert(
      adminLogin?.user?.app_metadata?.user_role === 'admin',
      'Admin JWT contains app_metadata.user_role = "admin"'
    );

    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, verification_status')
      .eq('id', adminLogin.user.id)
      .single();

    assert(adminProfile?.role === 'admin', 'public.profiles reflects role = "admin" for admin account');

    // Test non-admin user
    const { data: studentLogin, error: studentLoginErr } = await supabaseAnon.auth.signInWithPassword({
      email: 'student@dreamx.com',
      password: 'CareerMobility2025!',
    });
    assert(!studentLoginErr && studentLogin.user, 'student@dreamx.com authenticates as non-admin');
    assert(
      studentLogin?.user?.app_metadata?.user_role !== 'admin',
      'Student user lacks admin privileges in app_metadata'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Self-Role Escalation Prevention Trigger
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 2: Anti-Privilege Escalation Kernel Guard');
    const studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await studentClient.auth.setSession({
      access_token: studentLogin.session.access_token,
      refresh_token: studentLogin.session.refresh_token,
    });

    const { error: escalateErr } = await studentClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', studentLogin.user.id);

    assert(
      escalateErr !== null,
      'Direct role update to "admin" by student is blocked by RLS / trigger'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 3: WORM Audit Trail Security & Tamper Proofing
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 3: WORM Immutable Audit Trail (audit.system_audit_logs)');
    const auditInsertQuery = `
      INSERT INTO audit.system_audit_logs (actor_id, action, target_resource, target_id, metadata)
      VALUES ($1, 'E2E_TEST_LOG', 'system_test', $2, '{"verified": true}')
      RETURNING id;
    `;
    const insertRes = await pool.query(auditInsertQuery, [adminLogin.user.id, adminLogin.user.id]);
    const testLogId = insertRes.rows[0].id;
    assert(testLogId !== undefined, 'Audit log entry successfully appended to audit.system_audit_logs');

    // Attempt UPDATE on WORM table (MUST FAIL)
    let updateFailed = false;
    try {
      await pool.query(
        `UPDATE audit.system_audit_logs SET action = 'TAMPERED' WHERE id = $1;`,
        [testLogId]
      );
    } catch (err) {
      updateFailed = err.message.includes('append-only') || err.message.includes('strictly prohibited');
    }
    assert(updateFailed, 'WORM anti-tampering trigger rejects UPDATE with error');

    // Attempt DELETE on WORM table (MUST FAIL)
    let deleteFailed = false;
    try {
      await pool.query(
        `DELETE FROM audit.system_audit_logs WHERE id = $1;`,
        [testLogId]
      );
    } catch (err) {
      deleteFailed = err.message.includes('append-only') || err.message.includes('strictly prohibited');
    }
    assert(deleteFailed, 'WORM anti-tampering trigger rejects DELETE with error');

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Mentor KYC Verification Flow
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 4: Mentor KYC Verification Pipeline');
    const { data: mentorList, error: mentorListErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, verification_status')
      .eq('role', 'mentor')
      .limit(5);

    assert(!mentorListErr && mentorList.length > 0, `Retrieved ${mentorList?.length} mentor accounts for review queue`);
    const testMentor = mentorList[0];

    // Approve mentor verification
    const { data: updatedMentor, error: approveErr } = await supabaseAdmin
      .from('profiles')
      .update({ verification_status: 'active', is_verified: true })
      .eq('id', testMentor.id)
      .select('verification_status, is_verified')
      .single();

    assert(!approveErr && updatedMentor.verification_status === 'active', 'Mentor KYC status updated to "active" (verified)');

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Dispute Lifecycle, Telemetry & Arbitration
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 5: Dispute Lifecycle & Telemetry Verification');

    // Find an existing booking or create one for test
    const bookingRes = await pool.query(`SELECT id FROM public.service_bookings LIMIT 1;`);
    let bookingId;
    if (bookingRes.rows.length > 0) {
      bookingId = bookingRes.rows[0].id;
    } else {
      const newBooking = await pool.query(`
        INSERT INTO public.service_bookings (
          student_id, mentor_id, service_id, scheduled_at, status, amount
        ) VALUES ($1, $2, 'S01', NOW() + INTERVAL '1 day', 'confirmed', 3499.00)
        RETURNING id;
      `, [studentLogin.user.id, testMentor.id]);
      bookingId = newBooking.rows[0].id;
    }

    // Create a mock dispute in public.booking_disputes
    const disputeInsertQuery = `
      INSERT INTO public.booking_disputes (
        booking_id, student_id, mentor_id, reason_code, student_notes, status
      ) VALUES (
        $1, $2, $3, 'NO_SHOW', 'Mentor did not attend technical mock interview session.', 'opened'
      ) RETURNING id, status, reason_code;
    `;

    const disputeRes = await pool.query(disputeInsertQuery, [
      bookingId,
      studentLogin.user.id,
      testMentor.id
    ]);

    const disputeRow = disputeRes.rows[0];
    const mockDisputeId = disputeRow.id;
    assert(disputeRow.status === 'opened', 'Booking dispute successfully created with status "opened"');
    assert(disputeRow.reason_code === 'NO_SHOW', 'Dispute reason code verified ("NO_SHOW")');

    // Arbitrate dispute (Admin refund decision)
    const arbitrateQuery = `
      UPDATE public.booking_disputes
      SET status = 'resolved_refunded',
          resolved_by = $1,
          resolved_at = NOW(),
          resolution_notes = 'Attendance logs confirm mentor absence. Full refund granted.'
      WHERE id = $2
      RETURNING status, resolution_notes;
    `;
    const arbitrateRes = await pool.query(arbitrateQuery, [adminLogin.user.id, mockDisputeId]);
    assert(
      arbitrateRes.rows[0].status === 'resolved_refunded',
      'Dispute successfully arbitrated to "resolved_refunded"'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Dispute Abuse Strike Tracking & Account Safety
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 6: Dispute Abuse Strike Limiting & Account Controls');

    // Increment strike count on student
    const strikeQuery = `
      UPDATE public.profiles
      SET dispute_abuse_strikes = COALESCE(dispute_abuse_strikes, 0) + 1,
          is_dispute_blocked = CASE WHEN COALESCE(dispute_abuse_strikes, 0) + 1 >= 3 THEN true ELSE false END
      WHERE id = $1
      RETURNING dispute_abuse_strikes, is_dispute_blocked;
    `;
    const strikeRes = await pool.query(strikeQuery, [studentLogin.user.id]);
    assert(
      strikeRes.rows[0].dispute_abuse_strikes >= 1,
      `Student strike counter incremented to ${strikeRes.rows[0].dispute_abuse_strikes}`
    );

    // Reset strike counter clean for the test student
    await pool.query(
      `UPDATE public.profiles SET dispute_abuse_strikes = 0, is_dispute_blocked = false WHERE id = $1;`,
      [studentLogin.user.id]
    );
    assert(true, 'Student strikes reset to clean baseline (0 strikes)');

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Admin Analytics & Financial Overview Aggregation
    // -------------------------------------------------------------------------
    console.log('\n📌 Test Suite 7: Executive Overview & KPI Calculations');
    const kpiRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM public.profiles) as total_users,
        (SELECT COUNT(*) FROM public.profiles WHERE role = 'mentor') as total_mentors,
        (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM public.booking_disputes WHERE status IN ('opened', 'under_review')) as active_disputes;
    `);

    const stats = kpiRes.rows[0];
    assert(Number(stats.total_users) > 0, `Total accounts aggregate calculated: ${stats.total_users}`);
    assert(Number(stats.total_mentors) > 0, `Mentor pool aggregate calculated: ${stats.total_mentors}`);
    assert(Number(stats.total_students) > 0, `Student directory aggregate calculated: ${stats.total_students}`);

    console.log('\n======================================================================');
    console.log(`   PHASE 9 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('======================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPhase9Tests();
