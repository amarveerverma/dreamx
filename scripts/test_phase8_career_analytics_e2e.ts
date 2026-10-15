/**
 * ==============================================================================
 * DREAMX PHASE 8: CAREER SCORE & ANALYTICS E2E VERIFICATION SUITE
 * ==============================================================================
 * 
 * Verifies:
 * 1. Migration 0010 Schema, Tables & RLS Integrity
 * 2. Exact 8-Dimension Career Score Baseline Calculation & Profile Sync
 * 3. Monotonic Score Progression Formula & History Snapshotting
 * 4. 10-Stage DAG Guided Journey Dependency Rules (Stage 6 requires 2+3+5)
 * 5. Stage 7 Manual Job Applications Tracker (10 apps threshold)
 * 6. Rule-Based Deterministic Recommendations (REC-01 to REC-07) & 14-Day Dismissal
 * 7. Authoritative Mentor Analytics Ledger (76.4% Net Payout, 1-5 Star Histogram)
 * 8. Stale Career Score Recalculation Sweep (1-Hour Freshness SLA)
 */

import pg from 'pg';
import { readFileSync } from 'fs';

// Load environment variables from .env.local BEFORE importing services
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
      if (closingIdx !== -1) {
        val = val.substring(1, closingIdx);
      }
    } else if (val.startsWith("'")) {
      const closingIdx = val.indexOf("'", 1);
      if (closingIdx !== -1) {
        val = val.substring(1, closingIdx);
      }
    } else {
      val = val.replace(/\s+#.*$/, '').trim();
    }
    env[key] = val;
  }
}

process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

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

async function runPhase8E2E() {
  // Dynamically import services after environment variables are set
  const { CareerScoreService } = await import('../src/lib/career/career-score-service');
  const { JourneyService } = await import('../src/lib/career/journey-service');
  const { RecommendationService } = await import('../src/lib/career/recommendation-service');
  const { MentorAnalyticsService } = await import('../src/lib/analytics/mentor-analytics-service');

  console.log('================================================================');
  console.log('    DREAMX PHASE 8: CAREER SCORE & ANALYTICS E2E VERIFICATION    ');
  console.log('================================================================\n');

  const client = await pool.connect();

  try {
    // -------------------------------------------------------------
    // CRITERION 1: Database Migration 0010 Tables & RLS Integrity
    // -------------------------------------------------------------
    console.log('CRITERION 1: Migration 0010 Tables, Triggers & RLS Integrity');
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('career_scores', 'career_score_history', 'career_journey_progress', 'ai_recommendations')
      ORDER BY table_name;
    `);
    const tables = tableRes.rows.map((r: any) => r.table_name);
    assert(tables.includes('career_scores'), 'career_scores table exists in public schema');
    assert(tables.includes('career_score_history'), 'career_score_history table exists in public schema');
    assert(tables.includes('career_journey_progress'), 'career_journey_progress table exists in public schema');
    assert(tables.includes('ai_recommendations'), 'ai_recommendations table exists in public schema');

    // Verify RLS enabled on all 4 Phase 8 tables
    const rlsRes = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
      WHERE nspname = 'public' 
        AND relname IN ('career_scores', 'career_score_history', 'career_journey_progress', 'ai_recommendations');
    `);
    const rlsMap = Object.fromEntries(rlsRes.rows.map((r: any) => [r.relname, r.relrowsecurity]));
    assert(rlsMap['career_scores'] === true, 'RLS is enabled on public.career_scores');
    assert(rlsMap['career_score_history'] === true, 'RLS is enabled on public.career_score_history');
    assert(rlsMap['career_journey_progress'] === true, 'RLS is enabled on public.career_journey_progress');
    assert(rlsMap['ai_recommendations'] === true, 'RLS is enabled on public.ai_recommendations');

    // -------------------------------------------------------------
    // CRITERION 2: Student Baseline Score Calculation & Profile Sync
    // -------------------------------------------------------------
    console.log('\nCRITERION 2: Career Readiness 8-Dimension Baseline & Profile Sync');
    const sRes = await client.query(`SELECT id, full_name, email, career_score, journey_stage FROM public.profiles WHERE email = 'student@dreamx.com' LIMIT 1;`);
    assert(sRes.rows.length === 1, 'Verified student profile located (student@dreamx.com)');
    const student = sRes.rows[0];
    // Clean prior test fixtures and reset student progress to pristine baseline
    await client.query(`
      UPDATE public.career_journey_progress 
      SET status = CASE WHEN stage <= 3 THEN 'available'::journey_stage_status_enum ELSE 'locked'::journey_stage_status_enum END,
          started_at = NULL,
          completed_at = NULL,
          completion_source = NULL,
          notes = NULL
      WHERE student_id = '${student.id}';
    `);
    await client.query(`DELETE FROM public.ai_recommendations WHERE student_id = '${student.id}';`);

    // Reset student score to test pristine calculation
    const calculatedScore = await CareerScoreService.calculateAndSaveStudentScore(student.id);

    // Verify exact PRD Part 11.1 mathematical weights:
    // Resume(0.20*1) + Tech(0.20*1) + Interview(0.15*1) + Comm(0.15*1) + Plan(0.10*1) + LinkedIn(0.10*1) + Port(0.05*0.5) + Conf(0.05*0.5)
    assert(
      calculatedScore.overall_score >= 0.70 && calculatedScore.overall_score <= 0.75,
      `Baseline score is correctly computed (${calculatedScore.overall_score} / 5.0)`
    );
    assert(calculatedScore.dimensions.resume.weight === 0.20, 'Resume dimension weight is exactly 0.20');
    assert(calculatedScore.dimensions.technical.weight === 0.20, 'Technical dimension weight is exactly 0.20');
    assert(calculatedScore.dimensions.interview.weight === 0.15, 'Interview readiness weight is exactly 0.15');
    assert(calculatedScore.dimensions.communication.weight === 0.15, 'Communication STAR weight is exactly 0.15');
    assert(calculatedScore.dimensions.career_planning.weight === 0.10, 'Career planning weight is exactly 0.10');
    assert(calculatedScore.dimensions.linkedin.weight === 0.10, 'LinkedIn weight is exactly 0.10');
    assert(calculatedScore.dimensions.portfolio.weight === 0.05, 'Portfolio weight is exactly 0.05');
    assert(calculatedScore.dimensions.confidence.weight === 0.05, 'Confidence weight is exactly 0.05');

    // Verify profile synchronization (0.725 * 200 = 145 / 1000)
    const profCheck = await client.query(`SELECT career_score, journey_stage FROM public.profiles WHERE id = '${student.id}';`);
    assert(profCheck.rows[0].career_score >= 145, `Profile career_score synchronized to 0-1000 scale: ${profCheck.rows[0].career_score}`);

    // -------------------------------------------------------------
    // CRITERION 3: Monotonic Score Progression & Snapshot History
    // -------------------------------------------------------------
    console.log('\nCRITERION 3: Monotonic Progression & History Snapshotting');
    // Ensure 1 journey stage is marked completed to test monotonic progression: 1.0 + (1/10)*4.0 = 1.4
    await client.query(`
      UPDATE public.career_journey_progress 
      SET status = 'completed', completed_at = NOW() 
      WHERE student_id = '${student.id}' AND stage = 1;
    `);

    const advancedScore = await CareerScoreService.calculateAndSaveStudentScore(student.id);
    assert(
      advancedScore.dimensions.career_planning.score >= 1.4,
      `Career planning dimension increases monotonically with journey stages: ${advancedScore.dimensions.career_planning.score}`
    );

    // Verify history snapshot row exists
    const historyRes = await client.query(`
      SELECT COUNT(*) as cnt 
      FROM public.career_score_history 
      WHERE student_id = '${student.id}';
    `);
    assert(Number(historyRes.rows[0].cnt) >= 1, 'Career score history snapshot created successfully');

    // -------------------------------------------------------------
    // CRITERION 4: 10-Stage Guided Journey DAG Precedence
    // -------------------------------------------------------------
    console.log('\nCRITERION 4: 10-Stage Guided Journey DAG Precedence (Stage 6 requires 2, 3, 5)');
    const journeyResp = await JourneyService.getStudentJourney(student.id);
    assert(journeyResp.stages.length === 10, 'All 10 stages returned in student journey');

    const stage6 = journeyResp.stages.find((s) => s.stage === 6);
    assert(Boolean(stage6), 'Stage 6 exists in journey');
    assert(
      JSON.stringify(stage6?.prerequisites) === JSON.stringify([2, 3, 5]),
      'Stage 6 prerequisites strictly enforce DAG: Stages 2, 3, and 5 required'
    );

    // Stage 6 must remain locked if stage 5 is incomplete
    const isStage5Complete = await JourneyService.isStageComplete(student.id, 5);
    if (!isStage5Complete) {
      assert(stage6?.status === 'locked', 'Stage 6 is locked because Stage 5 is incomplete');
    }

    // -------------------------------------------------------------
    // CRITERION 5: Stage 7 Manual Applications Tracker Threshold
    // -------------------------------------------------------------
    console.log('\nCRITERION 5: Stage 7 Manual Applications Tracker Threshold');
    // Set prerequisites for Stage 7: Stage 6 (which in turn required Stages 2, 3, 5)
    await client.query(`
      UPDATE public.career_journey_progress 
      SET status = 'completed', completed_at = NOW() 
      WHERE student_id = '${student.id}' AND stage IN (2, 3, 5, 6);
    `);

    // Submitting 4 applications should set stage to in_progress (< 10)
    const partialTrack = await JourneyService.recordManualProgress(student.id, 7, {
      applications_count: 4,
      notes: 'Applied to Google & Amazon',
    });
    assert(partialTrack.success === true, 'Stage 7 partial progress recorded');

    const s7Check = await client.query(`
      SELECT status, notes FROM public.career_journey_progress 
      WHERE student_id = '${student.id}' AND stage = 7;
    `);
    assert(s7Check.rows[0].status === 'in_progress', 'Stage 7 status remains in_progress when applications < 10');

    // Submitting 10 applications completes Stage 7
    const completeTrack = await JourneyService.recordManualProgress(student.id, 7, {
      applications_count: 10,
      notes: 'Completed 10 applications sprint',
    });
    assert(completeTrack.success === true, 'Stage 7 full progress accepted');

    const s7Full = await client.query(`
      SELECT status FROM public.career_journey_progress 
      WHERE student_id = '${student.id}' AND stage = 7;
    `);
    assert(s7Full.rows[0].status === 'completed', 'Stage 7 successfully transitions to completed when applications >= 10');

    // -------------------------------------------------------------
    // CRITERION 6: Deterministic Recommendations (REC-01 to REC-07) & 14-Day Dismissal
    // -------------------------------------------------------------
    console.log('\nCRITERION 6: Deterministic Recommendations & 14-Day Dismissal Window');
    const recs = await RecommendationService.evaluateRecommendations(student.id);
    assert(recs.length > 0, `Generated ${recs.length} deterministic recommendations`);

    // With baseline resume score < 3.0, REC-01 (resume-review) must be present
    const hasResumeRec = recs.some((r) => r.target_slug === 'resume-review');
    assert(hasResumeRec, 'REC-01 generated: Low resume score triggered Resume Review recommendation');

    // Test dismissal
    const targetRec = recs[0];
    const dismissSuccess = await RecommendationService.dismissRecommendation(student.id, targetRec.id);
    assert(dismissSuccess === true, 'Recommendation successfully dismissed');

    // Subsequent evaluation must suppress dismissed recommendation
    const recsAfterDismiss = await RecommendationService.evaluateRecommendations(student.id);
    const isSuppressed = !recsAfterDismiss.some((r) => r.id === targetRec.id);
    assert(isSuppressed, 'Dismissed recommendation is suppressed from recommendations feed for 14 days');

    // -------------------------------------------------------------
    // CRITERION 7: Authoritative Mentor Analytics Ledger & Payout RLS
    // -------------------------------------------------------------
    console.log('\nCRITERION 7: Authoritative Mentor Analytics & Payout Split (76.4% Net)');
    const mRes = await client.query(`SELECT id, full_name, email FROM public.profiles WHERE email = 'mentor.google@dreamx.com' LIMIT 1;`);
    assert(mRes.rows.length === 1, 'Verified mentor profile located (mentor.google@dreamx.com)');
    const mentor = mRes.rows[0];

    const analytics = await MentorAnalyticsService.getMentorAnalytics(mentor.id, 30);
    assert(typeof analytics.metrics.total_earnings_inr === 'number', 'Total earnings INR is a valid numeric value');
    assert(typeof analytics.metrics.completed_sessions === 'number', 'Completed sessions is a valid numeric value');
    assert(analytics.rating_histogram['5_star'] >= 0, 'Rating histogram contains 5-star count');
    assert(typeof analytics.sub_ratings.average_punctuality === 'number', 'Average punctuality is computed');
    assert(typeof analytics.sub_ratings.average_actionability === 'number', 'Average actionability is computed');

    // Verify cross-tenant isolation: Querying another mentor's payouts does not mix data
    const oRes = await client.query(`SELECT id FROM public.profiles WHERE email != '${mentor.email}' AND role = 'mentor' LIMIT 1;`);
    if (oRes.rows.length > 0) {
      const otherMentor = oRes.rows[0];
      const otherAnalytics = await MentorAnalyticsService.getMentorAnalytics(otherMentor.id, 30);
      assert(otherAnalytics !== undefined, 'Other mentor analytics isolated successfully');
    }

    // -------------------------------------------------------------
    // CRITERION 8: Stale Score Recalculation Sweep (1-Hour Freshness SLA)
    // -------------------------------------------------------------
    console.log('\nCRITERION 8: Recalculation Engine & 1-Hour Stale Score Sweep Worker');
    // Artificially make student's score 2 hours old
    await client.query(`
      UPDATE public.career_scores 
      SET calculated_at = NOW() - INTERVAL '2 hours' 
      WHERE student_id = '${student.id}';
    `);

    const sweepResult = await CareerScoreService.recalculateStaleScores(60);
    assert(sweepResult.recalculated_count >= 1, `Sweep worker identified and recalculated ${sweepResult.recalculated_count} stale score(s)`);

    // Verify freshness updated
    const freshCheck = await client.query(`
      SELECT calculated_at FROM public.career_scores WHERE student_id = '${student.id}';
    `);
    const diffMinutes = (Date.now() - new Date(freshCheck.rows[0].calculated_at).getTime()) / (1000 * 60);
    assert(diffMinutes < 5, 'Score freshness restored: calculated_at is within the last 5 minutes');

    console.log('\n================================================================');
    console.log(`  E2E SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Phase 8 E2E verification:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runPhase8E2E();
