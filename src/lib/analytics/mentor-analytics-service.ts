import { createClient } from '@supabase/supabase-js';
import type { MentorAnalyticsResponse } from '@/types/career';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class MentorAnalyticsService {
  /**
   * Aggregates authoritative financial and operational analytics for a mentor
   */
  public static async getMentorAnalytics(
    mentorId: string,
    periodDays: number = 30
  ): Promise<MentorAnalyticsResponse> {
    const isAllTime = periodDays <= 0;
    const sinceDate = new Date();
    if (!isAllTime) {
      sinceDate.setDate(sinceDate.getDate() - periodDays);
    }
    const sinceIso = sinceDate.toISOString();

    // 1. Fetch financial ledger from public.payout_schedules
    let payoutQuery = supabaseAdmin
      .from('payout_schedules')
      .select('gross_amount, platform_commission, gst_amount, net_payout_amount, status, frozen, created_at')
      .eq('mentor_id', mentorId);

    if (!isAllTime) {
      payoutQuery = payoutQuery.gte('created_at', sinceIso);
    }

    const { data: payouts } = await payoutQuery;

    let totalEarnings = 0;
    let pendingPayout = 0;
    let releasedPayout = 0;

    for (const p of payouts || []) {
      const net = Number(p.net_payout_amount);
      if (['on_hold', 'eligible', 'released'].includes(p.status)) {
        totalEarnings += net;
      }
      if (['on_hold', 'eligible'].includes(p.status) && !p.frozen) {
        pendingPayout += net;
      }
      if (p.status === 'released') {
        releasedPayout += net;
      }
    }

    // 2. Fetch completed bookings count and service breakdown
    let bookingQuery = supabaseAdmin
      .from('service_bookings')
      .select('id, gross_amount, status, scheduled_start_utc, service_types(id, slug, title)')
      .eq('mentor_id', mentorId)
      .eq('status', 'completed');

    if (!isAllTime) {
      bookingQuery = bookingQuery.gte('scheduled_start_utc', sinceIso);
    }

    const { data: bookings } = await bookingQuery;
    const completedCount = bookings?.length || 0;

    // Service breakdown
    const serviceMap = new Map<string, { slug: string; title: string; count: number; revenue: number }>();
    for (const b of bookings || []) {
      const st = (b as any).service_types;
      if (!st) continue;
      const existing = serviceMap.get(st.slug) || {
        slug: st.slug,
        title: st.title || st.slug,
        count: 0,
        revenue: 0,
      };
      existing.count += 1;
      existing.revenue += Number(b.gross_amount || 0) * 0.764; // Net 76.4%
      serviceMap.set(st.slug, existing);
    }

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => ({
        slug: s.slug,
        title: s.title,
        completed_count: s.count,
        revenue_inr: Number(s.revenue.toFixed(2)),
      }));

    // 3. Fetch reviews and rating distribution
    let reviewQuery = supabaseAdmin
      .from('reviews')
      .select('rating, punctuality_rating, actionability_rating, created_at')
      .eq('mentor_id', mentorId)
      .is('deleted_at', null);

    if (!isAllTime) {
      reviewQuery = reviewQuery.gte('created_at', sinceIso);
    }

    const { data: reviews } = await reviewQuery;
    const reviewList = reviews || [];
    const totalReviews = reviewList.length;

    const ratingHistogram = {
      '5_star': reviewList.filter((r) => r.rating === 5).length,
      '4_star': reviewList.filter((r) => r.rating === 4).length,
      '3_star': reviewList.filter((r) => r.rating === 3).length,
      '2_star': reviewList.filter((r) => r.rating === 2).length,
      '1_star': reviewList.filter((r) => r.rating === 1).length,
    };

    const avgRating =
      totalReviews > 0
        ? Number((reviewList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2))
        : 5.0;

    const punctualityScores = reviewList.filter((r) => r.punctuality_rating).map((r) => r.punctuality_rating);
    const avgPunctuality =
      punctualityScores.length > 0
        ? Number((punctualityScores.reduce((acc, p) => acc + p, 0) / punctualityScores.length).toFixed(2))
        : 5.0;

    const actionabilityScores = reviewList.filter((r) => r.actionability_rating).map((r) => r.actionability_rating);
    const avgActionability =
      actionabilityScores.length > 0
        ? Number((actionabilityScores.reduce((acc, a) => acc + a, 0) / actionabilityScores.length).toFixed(2))
        : 5.0;

    // 4. Fetch offers and matches for conversion metrics
    let offerQuery = supabaseAdmin
      .from('service_offers')
      .select('id, request_id, status, created_at')
      .eq('mentor_id', mentorId);

    if (!isAllTime) {
      offerQuery = offerQuery.gte('created_at', sinceIso);
    }

    const { data: offers } = await offerQuery;
    const totalOffers = offers?.length || 0;
    const acceptedOffers = offers?.filter((o) => o.status === 'accepted').length || 0;
    const acceptanceRate = totalOffers > 0 ? Number(((acceptedOffers / totalOffers) * 100).toFixed(1)) : null;

    let matchQuery = supabaseAdmin
      .from('service_request_matches')
      .select('id, request_id, created_at')
      .eq('mentor_id', mentorId);

    if (!isAllTime) {
      matchQuery = matchQuery.gte('created_at', sinceIso);
    }

    const { data: matches } = await matchQuery;
    const totalMatches = matches?.length || 0;
    const responseRate = totalMatches > 0 ? Number(((totalOffers / totalMatches) * 100).toFixed(1)) : null;

    // Response time calculation for matching pairs
    let avgResponseTimeMinutes: number | null = null;
    if (offers && matches && offers.length > 0 && matches.length > 0) {
      const matchMap = new Map<string, string>(matches.map((m) => [m.request_id, m.created_at]));
      const diffs: number[] = [];

      for (const o of offers) {
        const matchTime = matchMap.get(o.request_id);
        if (matchTime) {
          const diffMs = new Date(o.created_at).getTime() - new Date(matchTime).getTime();
          if (diffMs >= 0) {
            diffs.push(diffMs / (1000 * 60)); // minutes
          }
        }
      }

      if (diffs.length > 0) {
        avgResponseTimeMinutes = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }
    }

    return {
      period: isAllTime ? 'all' : `${periodDays}d`,
      metrics: {
        total_earnings_inr: Number(totalEarnings.toFixed(2)),
        pending_payout_inr: Number(pendingPayout.toFixed(2)),
        released_payout_inr: Number(releasedPayout.toFixed(2)),
        completed_sessions: completedCount,
        average_rating: avgRating,
        total_reviews: totalReviews,
        response_rate_percentage: responseRate,
        acceptance_rate_percentage: acceptanceRate,
        average_response_time_minutes: avgResponseTimeMinutes,
      },
      rating_histogram: ratingHistogram,
      sub_ratings: {
        average_punctuality: avgPunctuality,
        average_actionability: avgActionability,
      },
      top_services: topServices,
    };
  }
}
