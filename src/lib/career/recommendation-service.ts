import { createClient } from '@supabase/supabase-js';
import type { RecommendationItem } from '@/types/career';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class RecommendationService {
  /**
   * Evaluates deterministic rules REC-01 to REC-07 for a student
   */
  public static async evaluateRecommendations(studentId: string): Promise<RecommendationItem[]> {
    // 1. Fetch student's score, profile, bookings, reviews, and journey progress
    const [scoreRes, profileRes, bookingsRes, journeyRes, dismissedRes] = await Promise.all([
      supabaseAdmin.from('career_scores').select('*').eq('student_id', studentId).maybeSingle(),
      supabaseAdmin.from('profiles').select('id, full_name, headline, membership_tier, target_career_market_id').eq('id', studentId).single(),
      supabaseAdmin.from('service_bookings').select('id, status, mentor_id, service_types(slug, title), reviews(rating, mentor_id, profiles:mentor_id(full_name))').eq('student_id', studentId).eq('status', 'completed'),
      supabaseAdmin.from('career_journey_progress').select('stage, status').eq('student_id', studentId),
      supabaseAdmin.from('ai_recommendations').select('target_slug, dismissed_at').eq('student_id', studentId).not('dismissed_at', 'is', null),
    ]);

    const score = scoreRes.data;
    const profile = profileRes.data;
    const bookings = bookingsRes.data || [];
    const journeyStages = journeyRes.data || [];

    // 14-day suppression set for dismissed items
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const suppressedSlugs = new Set(
      (dismissedRes.data || [])
        .filter((d: any) => new Date(d.dismissed_at) > fourteenDaysAgo)
        .map((d: any) => d.target_slug)
    );

    const candidates: Array<{
      type: 'service' | 'program' | 'membership' | 'action' | 'mentor' | 'journey_stage';
      target_slug: string;
      target_name: string;
      title: string;
      reason: string;
      action_url: string;
      action_label: string;
      price_formatted?: string;
      priority: number;
      score: number;
    }> = [];

    // --- RULE REC-01: Weakest Dimension Service ---
    if (score && score.resume_score < 3.0 && !suppressedSlugs.has('resume-review')) {
      candidates.push({
        type: 'service',
        target_slug: 'resume-review',
        target_name: 'Resume & ATS Optimization',
        title: 'Resume & ATS Optimization',
        reason: 'Your resume score is low. A diagnostic review will boost your recruiter discovery and match rate.',
        action_url: '/services/resume-review',
        action_label: 'Book Resume Review',
        price_formatted: '₹999',
        priority: 1,
        score: 0.95,
      });
    }

    // --- RULE REC-02: Interview or Technical Gap ---
    if (score && (score.technical_score < 3.0 || score.communication_score < 3.0) && !suppressedSlugs.has('mock-interview')) {
      candidates.push({
        type: 'service',
        target_slug: 'mock-interview',
        target_name: '1-on-1 Mock Interview',
        title: '1-on-1 Technical Mock Interview',
        reason: 'Practice behavioral communication and live problem solving with a verified mentor.',
        action_url: '/services/mock-interview',
        action_label: 'Book Mock Interview',
        price_formatted: '₹1,499',
        priority: 2,
        score: 0.90,
      });
    }

    // --- RULE REC-03: Program Upgrade (2+ one-time mocks completed) ---
    const mockBookings = bookings.filter((b: any) =>
      ['mock-interview', 'coding-dsa-prep', 'system-design'].includes(b.service_types?.slug)
    );

    if (mockBookings.length >= 2 && !suppressedSlugs.has('program-upgrade')) {
      // Check if an active program exists in DB
      const { data: programs } = await supabaseAdmin
        .from('programs')
        .select('id, slug, title, price_inr')
        .eq('is_active', true)
        .limit(1);

      if (programs && programs.length > 0) {
        const prog = programs[0];
        candidates.push({
          type: 'program',
          target_slug: prog.slug,
          target_name: prog.title,
          title: `Cohort Series: ${prog.title}`,
          reason: `You've completed ${mockBookings.length} mock sessions. A structured 4-week program provides continuous preparation.`,
          action_url: `/programs/${prog.slug}`,
          action_label: 'Explore Program',
          price_formatted: `₹${Number(prog.price_inr).toLocaleString('en-IN')}`,
          priority: 3,
          score: 0.85,
        });
      } else {
        candidates.push({
          type: 'program',
          target_slug: 'program-upgrade',
          target_name: '4-Week Cohort Programs',
          title: 'Structured 4-Week Cohort Programs',
          reason: `You've completed ${mockBookings.length} mock sessions. Advance to structured cohort preparation.`,
          action_url: '/dashboard/student/programs',
          action_label: 'View Programs',
          priority: 3,
          score: 0.80,
        });
      }
    }

    // --- RULE REC-04: Pro Membership (2+ purchases, membership is free) ---
    if (bookings.length >= 2 && profile?.membership_tier === 'free' && !suppressedSlugs.has('membership-pro')) {
      candidates.push({
        type: 'membership',
        target_slug: 'membership-pro',
        target_name: 'DreamX Pro Membership',
        title: 'Upgrade to DreamX Pro',
        reason: 'You have completed 2+ bookings. A Pro membership saves you 15-20% on all future services.',
        action_url: '/pricing',
        action_label: 'Upgrade to Pro',
        price_formatted: '₹299/mo',
        priority: 4,
        score: 0.75,
      });
    }

    // --- RULE REC-05: Mentor Re-booking (Rated mentor >= 4.5) ---
    const highRatedReview = bookings
      .flatMap((b: any) => b.reviews || [])
      .find((r: any) => r.rating >= 4.5);

    if (highRatedReview && !suppressedSlugs.has(`mentor-rebook-${highRatedReview.mentor_id}`)) {
      const mentorName = highRatedReview.profiles?.full_name || 'your mentor';
      candidates.push({
        type: 'mentor',
        target_slug: `mentor-rebook-${highRatedReview.mentor_id}`,
        target_name: mentorName,
        title: `Book Follow-Up with ${mentorName}`,
        reason: `You had a 5-star session with ${mentorName}. Book a follow-up to review revisions and iterate.`,
        action_url: `/services/mock-interview?mentor=${highRatedReview.mentor_id}`,
        action_label: 'Book Follow-Up',
        priority: 5,
        score: 0.80,
      });
    }

    // --- RULE REC-06: Journey Stage Action (Next available stage) ---
    const nextAvailableStage = journeyStages.find(
      (s: any) => s.status === 'available' || s.status === 'in_progress'
    );

    if (nextAvailableStage && !suppressedSlugs.has(`journey-stage-${nextAvailableStage.stage}`)) {
      candidates.push({
        type: 'journey_stage',
        target_slug: `journey-stage-${nextAvailableStage.stage}`,
        target_name: `Stage ${nextAvailableStage.stage}`,
        title: `Advance to Journey Stage ${nextAvailableStage.stage}`,
        reason: 'You have satisfied all prior prerequisites. Advance your career roadmap.',
        action_url: '/dashboard/student/journey',
        action_label: 'View Roadmap',
        priority: 6,
        score: 0.70,
      });
    }

    // --- RULE REC-07: Profile Action ---
    if ((!profile?.headline || !profile?.target_career_market_id) && !suppressedSlugs.has('profile-ambition')) {
      candidates.push({
        type: 'action',
        target_slug: 'profile-ambition',
        target_name: 'Target Ambition Settings',
        title: 'Complete Target Career Ambition',
        reason: 'Specify your target company and roles to receive tailored mentor recommendations.',
        action_url: '/dashboard/student/settings',
        action_label: 'Update Profile',
        priority: 7,
        score: 0.65,
      });
    }

    // Sort candidates by priority ascending
    candidates.sort((a, b) => a.priority - b.priority);

    // Persist candidates to public.ai_recommendations
    for (const c of candidates) {
      await supabaseAdmin.from('ai_recommendations').upsert(
        {
          student_id: studentId,
          recommendation_type: c.type,
          target_slug: c.target_slug,
          target_name: c.target_name,
          action_url: c.action_url,
          reason: c.reason,
          score: c.score,
          priority: c.priority,
        },
        { onConflict: 'student_id,recommendation_type,target_slug' }
      );
    }

    // Fetch active persisted recommendations
    const { data: recs } = await supabaseAdmin
      .from('ai_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .is('dismissed_at', null)
      .order('priority', { ascending: true })
      .limit(6);

    return (recs || []).map((r: any) => ({
      id: r.id,
      type: r.recommendation_type,
      target_slug: r.target_slug,
      target_name: r.target_name,
      title: r.target_name,
      reason: r.reason,
      action_url: r.action_url,
      action_label: 'Take Action',
      priority: r.priority,
      score: r.score,
      created_at: r.created_at,
    }));
  }

  /**
   * Dismisses a recommendation for 14 days
   */
  public static async dismissRecommendation(studentId: string, recommendationId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('ai_recommendations')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', recommendationId)
      .eq('student_id', studentId);

    return !error;
  }
}
