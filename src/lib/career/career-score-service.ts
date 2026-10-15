import { createClient } from '@supabase/supabase-js';
import type { CareerDimension, CareerScoreResponse } from '@/types/career';
import { JourneyService } from './journey-service';

// Privileged service role client for background calculations and database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const DIMENSION_WEIGHTS: Record<CareerDimension, number> = {
  resume: 0.20,
  technical: 0.20,
  interview: 0.15,
  communication: 0.15,
  career_planning: 0.10,
  linkedin: 0.10,
  portfolio: 0.05,
  confidence: 0.05,
};

export const DIMENSION_BASELINE_DEFAULTS: Record<CareerDimension, number> = {
  resume: 0.0,
  technical: 1.0,
  interview: 1.0,
  communication: 1.0,
  career_planning: 1.0,
  linkedin: 0.0,
  portfolio: 0.0,
  confidence: 2.5,
};

export const DIMENSION_SERVICE_MAPPING: Record<CareerDimension, string> = {
  resume: 'resume-review',
  technical: 'coding-dsa-prep',
  interview: 'mock-interview',
  communication: 'mock-interview',
  career_planning: 'career-roadmap',
  linkedin: 'linkedin-optimization',
  portfolio: 'portfolio-review',
  confidence: 'salary-negotiation',
};

export class CareerScoreService {
  /**
   * Recalculates all 8 dimensions for a student and updates database records atomically
   */
  public static async recalculateScore(studentId: string, triggerSource: string = 'recalculation'): Promise<CareerScoreResponse> {
    // 1. Fetch completed bookings with service types and reviews
    const { data: bookings, error: bError } = await supabaseAdmin
      .from('service_bookings')
      .select(`
        id,
        status,
        scheduled_start_utc,
        service_types (
          id,
          slug,
          title
        ),
        reviews (
          id,
          rating,
          punctuality_rating,
          actionability_rating,
          feedback_text
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'completed');

    if (bError) {
      console.error('[CareerScoreService] Error fetching bookings:', bError);
    }

    // 2. Fetch completed journey stages
    const { data: journeyStages } = await supabaseAdmin
      .from('career_journey_progress')
      .select('stage, status')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    const completedStageCount = journeyStages?.length || 0;

    // 3. Compute each dimension
    const completedList = bookings || [];

    // --- Resume (0.20) ---
    const resumeBookings = completedList.filter(
      (b: any) => b.service_types?.slug === 'resume-review'
    );
    const hasResumeEvidence = resumeBookings.length > 0;
    let resumeScore = DIMENSION_BASELINE_DEFAULTS.resume;
    if (hasResumeEvidence) {
      const rated = resumeBookings.filter((b: any) => b.reviews && b.reviews.length > 0);
      if (rated.length > 0) {
        resumeScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.rating || 4.0), 0) / rated.length;
      } else {
        resumeScore = 4.0; // Standard diagnostic completion credit
      }
    }

    // --- Technical (0.20) ---
    const techBookings = completedList.filter((b: any) =>
      ['coding-dsa-prep', 'system-design'].includes(b.service_types?.slug)
    );
    const hasTechEvidence = techBookings.length > 0;
    let technicalScore = DIMENSION_BASELINE_DEFAULTS.technical;
    if (hasTechEvidence) {
      const rated = techBookings.filter((b: any) => b.reviews && b.reviews.length > 0);
      if (rated.length > 0) {
        technicalScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.rating || 3.5), 0) / rated.length;
      } else {
        technicalScore = 3.5;
      }
    }

    // --- Interview Performance (0.15) ---
    const interviewBookings = completedList.filter((b: any) =>
      ['mock-interview', 'bar-raiser'].includes(b.service_types?.slug)
    );
    const hasInterviewEvidence = interviewBookings.length > 0;
    let interviewScore = DIMENSION_BASELINE_DEFAULTS.interview;
    if (hasInterviewEvidence) {
      const rated = interviewBookings.filter((b: any) => b.reviews && b.reviews.length > 0);
      if (rated.length > 0) {
        interviewScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.rating || 4.0), 0) / rated.length;
      } else {
        interviewScore = 3.5;
      }
    }

    // --- Communication (0.15) ---
    const hasCommEvidence = interviewBookings.length > 0;
    let communicationScore = DIMENSION_BASELINE_DEFAULTS.communication;
    if (hasCommEvidence) {
      const rated = interviewBookings.filter((b: any) => b.reviews && b.reviews[0]?.actionability_rating);
      if (rated.length > 0) {
        communicationScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.actionability_rating || 3.5), 0) / rated.length;
      } else {
        communicationScore = 3.0;
      }
    }

    // --- Career Planning (0.10) ---
    // Monotonic progression: 1.0 baseline + (completed_stages / 10) * 4.0 -> range 1.0 to 5.0
    const hasPlanningEvidence = completedStageCount > 0;
    const careerPlanningScore = Number((1.0 + (completedStageCount / 10.0) * 4.0).toFixed(2));

    // --- LinkedIn (0.10) ---
    const linkedinBookings = completedList.filter(
      (b: any) => b.service_types?.slug === 'linkedin-optimization'
    );
    const hasLinkedinEvidence = linkedinBookings.length > 0;
    let linkedinScore = DIMENSION_BASELINE_DEFAULTS.linkedin;
    if (hasLinkedinEvidence) {
      const rated = linkedinBookings.filter((b: any) => b.reviews && b.reviews.length > 0);
      if (rated.length > 0) {
        linkedinScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.rating || 4.0), 0) / rated.length;
      } else {
        linkedinScore = 3.8;
      }
    }

    // --- Portfolio (0.05) ---
    const portfolioBookings = completedList.filter(
      (b: any) => b.service_types?.slug === 'portfolio-review'
    );
    const hasPortfolioEvidence = portfolioBookings.length > 0;
    let portfolioScore = DIMENSION_BASELINE_DEFAULTS.portfolio;
    if (hasPortfolioEvidence) {
      const rated = portfolioBookings.filter((b: any) => b.reviews && b.reviews.length > 0);
      if (rated.length > 0) {
        portfolioScore = rated.reduce((acc: number, b: any) => acc + (b.reviews[0]?.rating || 3.5), 0) / rated.length;
      } else {
        portfolioScore = 3.5;
      }
    }

    // --- Confidence (0.05) ---
    // Average of self-reports or session rating satisfaction
    let confidenceScore = DIMENSION_BASELINE_DEFAULTS.confidence;
    const hasConfidenceEvidence = completedList.length > 0;
    if (hasConfidenceEvidence) {
      const reviews = completedList.flatMap((b: any) => b.reviews || []);
      if (reviews.length > 0) {
        const avg = reviews.reduce((acc: number, r: any) => acc + (r.rating || 3.0), 0) / reviews.length;
        confidenceScore = Math.min(5.0, Math.max(1.0, Number((2.5 + (avg - 3.0) * 0.5).toFixed(2))));
      } else {
        confidenceScore = 3.0;
      }
    }

    const evidenceMetadata = {
      resume: hasResumeEvidence,
      technical: hasTechEvidence,
      interview: hasInterviewEvidence,
      communication: hasCommEvidence,
      career_planning: hasPlanningEvidence,
      linkedin: hasLinkedinEvidence,
      portfolio: hasPortfolioEvidence,
      confidence: hasConfidenceEvidence,
    };

    // 4. Upsert into public.career_scores
    // Note: overall_score is a generated column in PostgreSQL, so we don't provide it in the update payload
    const { data: updatedScore, error: uError } = await supabaseAdmin
      .from('career_scores')
      .upsert({
        student_id: studentId,
        resume_score: Number(resumeScore.toFixed(2)),
        technical_score: Number(technicalScore.toFixed(2)),
        interview_score: Number(interviewScore.toFixed(2)),
        communication_score: Number(communicationScore.toFixed(2)),
        career_planning_score: Number(careerPlanningScore.toFixed(2)),
        linkedin_score: Number(linkedinScore.toFixed(2)),
        portfolio_score: Number(portfolioScore.toFixed(2)),
        confidence_score: Number(confidenceScore.toFixed(2)),
        evidence_metadata: evidenceMetadata,
        trigger_source: triggerSource,
        calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id' })
      .select()
      .single();

    if (uError) {
      console.error('[CareerScoreService] Upsert error:', uError);
      throw new Error(`Failed to update career score: ${uError.message}`);
    }

    // 5. Check if score history snapshot should be recorded
    const overallScore = updatedScore.overall_score;
    const { data: latestSnapshot } = await supabaseAdmin
      .from('career_score_history')
      .select('overall_score, calculated_at')
      .eq('student_id', studentId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const shouldRecordHistory =
      !latestSnapshot ||
      Math.abs(latestSnapshot.overall_score - overallScore) >= 0.05 ||
      triggerSource === 'booking_completion';

    if (shouldRecordHistory) {
      await supabaseAdmin.from('career_score_history').insert({
        student_id: studentId,
        overall_score: overallScore,
        resume_score: updatedScore.resume_score,
        technical_score: updatedScore.technical_score,
        interview_score: updatedScore.interview_score,
        communication_score: updatedScore.communication_score,
        career_planning_score: updatedScore.career_planning_score,
        linkedin_score: updatedScore.linkedin_score,
        portfolio_score: updatedScore.portfolio_score,
        confidence_score: updatedScore.confidence_score,
        trigger_source: triggerSource,
        calculated_at: new Date().toISOString(),
      });
    }

    // 6. Also advance journey stage completions if conditions are met
    await JourneyService.evaluateStageCompletions(studentId, {
      resumeScore,
      linkedinScore,
      interviewScore,
      completedList,
    });

    return this.formatScoreResponse(updatedScore, studentId);
  }

  /**
   * Reads student's current score and 90-day trendline
   */
  public static async getStudentScore(studentId: string): Promise<CareerScoreResponse> {
    const { data: score, error } = await supabaseAdmin
      .from('career_scores')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !score) {
      // If student has no score yet, initialize it
      return this.recalculateScore(studentId, 'initialization');
    }

    return this.formatScoreResponse(score, studentId);
  }

  /**
   * Helper to format API response with dimensions, opportunity, and benchmark
   */
  private static async formatScoreResponse(score: any, studentId: string): Promise<CareerScoreResponse> {
    const overall = Number(score.overall_score.toFixed(2));
    const evidence = score.evidence_metadata || {};

    // Fetch last 90 days history snapshots
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: history } = await supabaseAdmin
      .from('career_score_history')
      .select('calculated_at, overall_score')
      .eq('student_id', studentId)
      .gte('calculated_at', ninetyDaysAgo.toISOString())
      .order('calculated_at', { ascending: true });

    // Determine weakest dimension
    const dimensionsList: Array<{ key: CareerDimension; score: number; weight: number }> = [
      { key: 'resume', score: score.resume_score, weight: 0.20 },
      { key: 'technical', score: score.technical_score, weight: 0.20 },
      { key: 'interview', score: score.interview_score, weight: 0.15 },
      { key: 'communication', score: score.communication_score, weight: 0.15 },
      { key: 'career_planning', score: score.career_planning_score, weight: 0.10 },
      { key: 'linkedin', score: score.linkedin_score, weight: 0.10 },
      { key: 'portfolio', score: score.portfolio_score, weight: 0.05 },
      { key: 'confidence', score: score.confidence_score, weight: 0.05 },
    ];

    dimensionsList.sort((a, b) => a.score - b.score);
    const weakest = dimensionsList[0].key;

    // AI opportunity copy
    const opportunityMap: Record<CareerDimension, string> = {
      resume: 'Your resume score is low. A diagnostic Resume & ATS Optimization review will boost your placement match rate.',
      technical: 'Your technical skills score has room to grow. Practice algorithms and live system design with a mentor.',
      interview: 'Practice live mock interviews with a FAANG mentor to build interview muscle memory.',
      communication: 'Sharpen your behavioral STAR communication and articulate trade-offs with senior mentors.',
      career_planning: 'Advance through your 10-stage Guided Journey to level up your career planning dimension.',
      linkedin: 'Your LinkedIn score is a growth opportunity. Complete a LinkedIn & Brand Optimization review.',
      portfolio: 'Build credibility with a comprehensive Full-Stack & ML Portfolio teardown.',
      confidence: 'Gain confidence by booking mock interviews and practicing offer negotiation.',
    };

    // Calculate real percentile rank if enough cohort data exists
    let cohortBenchmark = null;
    const { count } = await supabaseAdmin
      .from('career_scores')
      .select('*', { count: 'exact', head: true });

    if (count && count >= 10) {
      const { data: lowerScores } = await supabaseAdmin
        .from('career_scores')
        .select('*', { count: 'exact', head: true })
        .lt('overall_score', score.overall_score);

      const lowerCount = lowerScores ? (lowerScores as any).length || 0 : 0;
      const percentile = Math.min(99, Math.max(1, Math.round((lowerCount / count) * 100)));
      cohortBenchmark = {
        percentile,
        total_peers: count,
      };
    }

    return {
      overall_score: overall,
      displayed_score: overall.toFixed(1),
      max_score: 5.0,
      tier_label: this.getTierLabel(overall),
      calculated_at: score.calculated_at,
      dimensions: {
        resume: {
          score: score.resume_score,
          weight: 0.20,
          has_evidence: !!evidence.resume,
          status_label: evidence.resume ? 'Verified' : 'Diagnostic Needed',
        },
        technical: {
          score: score.technical_score,
          weight: 0.20,
          has_evidence: !!evidence.technical,
          status_label: evidence.technical ? 'Verified' : 'Diagnostic Needed',
        },
        interview: {
          score: score.interview_score,
          weight: 0.15,
          has_evidence: !!evidence.interview,
          status_label: evidence.interview ? 'Verified' : 'Diagnostic Needed',
        },
        communication: {
          score: score.communication_score,
          weight: 0.15,
          has_evidence: !!evidence.communication,
          status_label: evidence.communication ? 'Verified' : 'Diagnostic Needed',
        },
        career_planning: {
          score: score.career_planning_score,
          weight: 0.10,
          has_evidence: !!evidence.career_planning,
          status_label: evidence.career_planning ? 'In Progress' : 'Initial Stage',
        },
        linkedin: {
          score: score.linkedin_score,
          weight: 0.10,
          has_evidence: !!evidence.linkedin,
          status_label: evidence.linkedin ? 'Verified' : 'Diagnostic Needed',
        },
        portfolio: {
          score: score.portfolio_score,
          weight: 0.05,
          has_evidence: !!evidence.portfolio,
          status_label: evidence.portfolio ? 'Verified' : 'Optional',
        },
        confidence: {
          score: score.confidence_score,
          weight: 0.05,
          has_evidence: !!evidence.confidence,
          status_label: evidence.confidence ? 'Reported' : 'Baseline',
        },
      },
      history: (history || []).map((h: any) => ({
        calculated_at: h.calculated_at,
        overall_score: Number(h.overall_score.toFixed(2)),
      })),
      ai_opportunity: {
        weakest_dimension: weakest,
        opportunity_text: opportunityMap[weakest],
        suggested_service_slug: DIMENSION_SERVICE_MAPPING[weakest],
      },
      cohort_benchmark: cohortBenchmark,
    };
  }

  /**
   * Maps overall score (0.0-5.0) to PRD Part 11.2 tier labels
   */
  public static getTierLabel(score: number): string {
    if (score < 2.0) return 'Needs Foundation — Book Diagnostic';
    if (score < 3.0) return 'Developing — Momentum Building';
    if (score < 4.0) return 'Good — Room to Grow';
    if (score < 4.5) return 'Advanced — Competitive Candidate';
    return 'Interview Ready — Top Tier';
  }

  public static async calculateAndSaveStudentScore(studentId: string, triggerSource: string = 'manual'): Promise<CareerScoreResponse> {
    return this.recalculateScore(studentId, triggerSource);
  }

  /**
   * Recalculates stale scores older than thresholdMinutes (default 60 minutes) to meet 1-hour freshness SLA
   */
  public static async recalculateStaleScores(thresholdMinutes: number = 60): Promise<{ recalculated_count: number }> {
    const cutoffDate = new Date(Date.now() - thresholdMinutes * 60 * 1000).toISOString();
    const { data: staleScores, error } = await supabaseAdmin
      .from('career_scores')
      .select('student_id')
      .lt('calculated_at', cutoffDate);

    if (error) {
      console.error('[CareerScoreService] Error querying stale scores:', error);
      return { recalculated_count: 0 };
    }

    let count = 0;
    const rows = staleScores || [];
    const CHUNK_SIZE = 5;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const results = await Promise.allSettled(
        chunk.map((row: any) => this.recalculateScore(row.student_id, 'cron_sweep'))
      );
      for (const res of results) {
        if (res.status === 'fulfilled') {
          count++;
        } else {
          console.error('[CareerScoreService] Failed to recalculate stale student in chunk:', res.reason);
        }
      }
    }

    return { recalculated_count: count };
  }

  /**
   * Event hook invoked when a booking is completed
   */
  public static async onBookingCompleted(bookingId: string): Promise<void> {
    const { data: booking } = await supabaseAdmin
      .from('service_bookings')
      .select('student_id')
      .eq('id', bookingId)
      .single();

    if (booking?.student_id) {
      await this.recalculateScore(booking.student_id, 'booking_completion');
    }
  }
}
