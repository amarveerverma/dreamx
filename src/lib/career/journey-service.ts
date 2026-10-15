import { createClient } from '@supabase/supabase-js';
import type { JourneyProgressResponse, JourneyStageItem, JourneyStageStatus } from '@/types/career';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const STAGE_DEFINITIONS: Array<{
  stage: number;
  name: string;
  description: string;
  prerequisites: number[];
  recommended_service_slug?: string;
}> = [
  {
    stage: 1,
    name: 'Career Assessment',
    description: 'Understand where you are, set target goals and establish baseline diagnostics.',
    prerequisites: [],
    recommended_service_slug: 'career-roadmap',
  },
  {
    stage: 2,
    name: 'Resume Building',
    description: 'Create an ATS-optimized, placement-ready resume tailored to target roles.',
    prerequisites: [],
    recommended_service_slug: 'resume-review',
  },
  {
    stage: 3,
    name: 'LinkedIn Optimization',
    description: 'Make your profile discoverable to recruiters and build your professional brand.',
    prerequisites: [],
    recommended_service_slug: 'linkedin-optimization',
  },
  {
    stage: 4,
    name: 'Portfolio Development',
    description: 'Showcase production-grade projects and teardowns for technical & product roles.',
    prerequisites: [3],
    recommended_service_slug: 'portfolio-review',
  },
  {
    stage: 5,
    name: 'Interview Preparation',
    description: 'Practice behavioral communication and live coding/system design under pressure.',
    prerequisites: [2, 3],
    recommended_service_slug: 'mock-interview',
  },
  {
    stage: 6,
    name: 'Career Strategy',
    description: 'Develop a comprehensive target company strategy and application plan.',
    prerequisites: [2, 3, 5],
    recommended_service_slug: 'career-roadmap',
  },
  {
    stage: 7,
    name: 'Job Application',
    description: 'Track and submit 10+ targeted applications with customized resumes and referrals.',
    prerequisites: [6],
  },
  {
    stage: 8,
    name: 'Offer Evaluation',
    description: 'Evaluate role fit, equity, compensation bands, and competing offers.',
    prerequisites: [7],
    recommended_service_slug: 'offer-evaluation',
  },
  {
    stage: 9,
    name: 'Salary Negotiation',
    description: 'Confidently negotiate top-of-band base salary, joining bonuses, and equity grants.',
    prerequisites: [8],
    recommended_service_slug: 'salary-negotiation',
  },
  {
    stage: 10,
    name: 'Career Growth',
    description: 'Establish a 30-60-90 day post-placement growth plan for fast promotion.',
    prerequisites: [9],
  },
];

export class JourneyService {
  /**
   * Retrieves student's current 10-stage journey progress
   */
  public static async getStudentJourney(studentId: string): Promise<JourneyProgressResponse> {
    const { data: records, error } = await supabaseAdmin
      .from('career_journey_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('stage', { ascending: true });

    if (error || !records || records.length === 0) {
      await this.initStudentJourney(studentId);
      return this.getStudentJourney(studentId);
    }

    const recordsByStage = new Map<number, any>(records.map((r) => [r.stage, r]));

    const stages: JourneyStageItem[] = STAGE_DEFINITIONS.map((def) => {
      const row = recordsByStage.get(def.stage);
      const status: JourneyStageStatus = row?.status || (def.stage <= 3 ? 'available' : 'locked');

      return {
        stage: def.stage,
        name: def.name,
        description: def.description,
        status,
        prerequisites: def.prerequisites,
        started_at: row?.started_at || null,
        completed_at: row?.completed_at || null,
        completion_source: row?.completion_source || null,
        notes: row?.notes || null,
        recommended_service_slug: def.recommended_service_slug,
      };
    });

    const completedCount = stages.filter((s) => s.status === 'completed').length;
    const progressPercentage = Math.round((completedCount / 10) * 100);

    const activeStageItem =
      stages.find((s) => s.status === 'in_progress' || s.status === 'available') || stages[9];

    return {
      overall_progress_percentage: progressPercentage,
      active_stage: activeStageItem.stage,
      stages,
    };
  }

  /**
   * Initializes 10 journey stages for a student
   */
  public static async initStudentJourney(studentId: string): Promise<void> {
    const payload = STAGE_DEFINITIONS.map((def) => ({
      student_id: studentId,
      stage: def.stage,
      status: def.stage <= 3 ? 'available' : 'locked',
    }));

    await supabaseAdmin
      .from('career_journey_progress')
      .upsert(payload, { onConflict: 'student_id,stage' });
  }

  /**
   * Automatically evaluates stage completions based on completed bookings and scores
   */
  public static async evaluateStageCompletions(
    studentId: string,
    context?: {
      resumeScore?: number;
      linkedinScore?: number;
      interviewScore?: number;
      completedList?: any[];
    }
  ): Promise<void> {
    const completedList = context?.completedList || [];

    // Stage 1: Career Assessment (Complete if student has set target career market)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('target_career_market_id, headline')
      .eq('id', studentId)
      .single();

    if (profile?.target_career_market_id) {
      await this.markStageCompleted(studentId, 1, 'assessment', 'Target career market configured');
    }

    // Stage 2: Resume Building (Complete if resumeScore >= 4.0 OR completed resume review)
    const hasResumeBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'resume-review'
    );
    if (hasResumeBooking || (context?.resumeScore && context.resumeScore >= 4.0)) {
      await this.markStageCompleted(studentId, 2, 'service', 'Resume & ATS review completed');
    }

    // Stage 3: LinkedIn Optimization (Complete if linkedinScore >= 3.5 OR completed linkedin booking)
    const hasLinkedinBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'linkedin-optimization'
    );
    if (hasLinkedinBooking || (context?.linkedinScore && context.linkedinScore >= 3.5)) {
      await this.markStageCompleted(studentId, 3, 'service', 'LinkedIn & Brand optimization completed');
    }

    // Stage 4: Portfolio Development (Requires Stage 3 complete)
    const hasPortfolioBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'portfolio-review'
    );
    if (hasPortfolioBooking) {
      const isStage3Complete = await this.isStageComplete(studentId, 3);
      if (isStage3Complete) {
        await this.markStageCompleted(studentId, 4, 'service', 'Portfolio review completed');
      }
    }

    // Stage 5: Interview Preparation (Requires Stages 2 AND 3 complete)
    const hasInterviewBooking = completedList.some((b: any) =>
      ['mock-interview', 'coding-dsa-prep', 'system-design', 'bar-raiser'].includes(b.service_types?.slug)
    );
    if (hasInterviewBooking || (context?.interviewScore && context.interviewScore >= 4.0)) {
      const arePrereqsMet =
        (await this.isStageComplete(studentId, 2)) && (await this.isStageComplete(studentId, 3));
      if (arePrereqsMet) {
        await this.markStageCompleted(studentId, 5, 'service', 'Mock interview completed');
      }
    }

    // Stage 6: Career Strategy (Requires Stages 2, 3, AND 5 complete)
    const hasStrategyBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'career-roadmap'
    );
    if (hasStrategyBooking) {
      const arePrereqsMet =
        (await this.isStageComplete(studentId, 2)) &&
        (await this.isStageComplete(studentId, 3)) &&
        (await this.isStageComplete(studentId, 5));
      if (arePrereqsMet) {
        await this.markStageCompleted(studentId, 6, 'service', 'Career Strategy session completed');
      }
    }

    // Stage 8: Offer Evaluation (Requires Stage 7 complete)
    const hasOfferBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'offer-evaluation'
    );
    if (hasOfferBooking) {
      const isStage7Complete = await this.isStageComplete(studentId, 7);
      if (isStage7Complete) {
        await this.markStageCompleted(studentId, 8, 'service', 'Offer evaluation completed');
      }
    }

    // Stage 9: Salary Negotiation (Requires Stage 8 complete)
    const hasNegBooking = completedList.some(
      (b: any) => b.service_types?.slug === 'salary-negotiation'
    );
    if (hasNegBooking) {
      const isStage8Complete = await this.isStageComplete(studentId, 8);
      if (isStage8Complete) {
        await this.markStageCompleted(studentId, 9, 'service', 'Salary negotiation completed');
      }
    }

    // After evaluating any completions, unlock dependent stages in the DAG
    await this.unlockDependentStages(studentId);
  }

  /**
   * Transitions unlocked stages from 'locked' to 'available' if prerequisites are satisfied
   */
  public static async unlockDependentStages(studentId: string): Promise<void> {
    const { data: records } = await supabaseAdmin
      .from('career_journey_progress')
      .select('stage, status')
      .eq('student_id', studentId);

    if (!records) return;

    const completedSet = new Set(
      records.filter((r) => r.status === 'completed').map((r) => r.stage)
    );

    for (const def of STAGE_DEFINITIONS) {
      const current = records.find((r) => r.stage === def.stage);
      if (current?.status === 'locked') {
        // Check if all prerequisites are completed
        const allPrereqsMet = def.prerequisites.every((p) => completedSet.has(p));
        if (allPrereqsMet) {
          await supabaseAdmin
            .from('career_journey_progress')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('student_id', studentId)
            .eq('stage', def.stage);
        }
      }
    }
  }

  /**
   * Marks a specific stage as completed and updates timestamps
   */
  public static async markStageCompleted(
    studentId: string,
    stage: number,
    source: string,
    notes?: string
  ): Promise<void> {
    await supabaseAdmin
      .from('career_journey_progress')
      .upsert(
        {
          student_id: studentId,
          stage,
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_source: source,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,stage' }
      );

    await this.unlockDependentStages(studentId);
  }

  /**
   * Helper checking if a given stage is completed
   */
  public static async isStageComplete(studentId: string, stage: number): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('career_journey_progress')
      .select('status')
      .eq('student_id', studentId)
      .eq('stage', stage)
      .maybeSingle();

    return data?.status === 'completed';
  }

  /**
   * Records student self-reported progress for Stage 7 (Job Application) or Stage 10 (Career Growth)
   */
  public static async recordManualProgress(
    studentId: string,
    stage: number,
    data: { notes?: string; applications_count?: number }
  ): Promise<{ success: boolean; message: string }> {
    if (stage !== 7 && stage !== 10) {
      return { success: false, message: 'Only Stages 7 and 10 permit manual student tracking' };
    }

    // Verify stage prerequisites are completed
    const def = STAGE_DEFINITIONS.find((d) => d.stage === stage);
    if (!def) return { success: false, message: 'Invalid stage' };

    for (const p of def.prerequisites) {
      const isPrereqDone = await this.isStageComplete(studentId, p);
      if (!isPrereqDone) {
        return { success: false, message: `Prerequisite Stage ${p} must be completed first` };
      }
    }

    if (stage === 7) {
      const apps = data.applications_count || 0;
      if (apps >= 10) {
        await this.markStageCompleted(studentId, 7, 'manual_tracker', `Logged ${apps} job applications`);
        return { success: true, message: 'Stage 7 completed! Stage 8 Offer Evaluation is now unlocked.' };
      } else {
        await supabaseAdmin
          .from('career_journey_progress')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
            notes: `Applications tracked: ${apps}/10`,
            updated_at: new Date().toISOString(),
          })
          .eq('student_id', studentId)
          .eq('stage', 7);

        return { success: true, message: `Progress saved: ${apps}/10 applications tracked.` };
      }
    }

    if (stage === 10) {
      await this.markStageCompleted(studentId, 10, 'manual_tracker', data.notes || 'Post-placement growth plan saved');
      return { success: true, message: 'Congratulations! Stage 10 Career Growth completed.' };
    }

    return { success: false, message: 'Unhandled stage' };
  }
}
