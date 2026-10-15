'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { CareerScoreResponse, JourneyProgressResponse, RecommendationItem } from '@/types/career';

export default function StudentDashboardHomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [scoreData, setScoreData] = useState<CareerScoreResponse | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyProgressResponse | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // 1. Fetch Profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (prof) setProfile(prof);

        // 2. Parallel Fetch Dashboard Data
        const [scoreRes, journeyRes, bookingsRes, requestsRes, recsRes] = await Promise.allSettled([
          fetch('/api/v1/students/me/score').then((r) => r.ok ? r.json() : null),
          fetch('/api/v1/students/me/journey').then((r) => r.ok ? r.json() : null),
          fetch('/api/v1/students/me/bookings').then((r) => r.ok ? r.json() : null),
          fetch('/api/v1/smart-match/requests').then((r) => r.ok ? r.json() : null),
          fetch('/api/v1/ai/recommendations').then((r) => r.ok ? r.json() : null),
        ]);

        if (scoreRes.status === 'fulfilled' && scoreRes.value?.data) {
          setScoreData(scoreRes.value.data);
        }
        if (journeyRes.status === 'fulfilled' && journeyRes.value?.data) {
          setJourneyData(journeyRes.value.data);
        }
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.bookings) {
          setBookings(bookingsRes.value.bookings);
        }
        if (requestsRes.status === 'fulfilled' && requestsRes.value?.requests) {
          setRequests(requestsRes.value.requests);
        }
        if (recsRes.status === 'fulfilled' && recsRes.value?.data) {
          setRecommendations(recsRes.value.data);
        }
      } catch (err: any) {
        console.error('Error loading dashboard home:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDismissRec = async (id: string) => {
    try {
      setDismissingId(id);
      await fetch(`/api/v1/ai/recommendations/${id}/dismiss`, { method: 'PATCH' });
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    } finally {
      setDismissingId(null);
    }
  };

  const upcomingBookings = bookings.filter((b) =>
    ['confirmed', 'in_progress', 'pending_payment'].includes(b.status)
  );
  const nextSession = upcomingBookings[0] || null;

  const completedStages = journeyData?.stages?.filter((s) => s.status === 'completed').length || 0;
  const totalStages = journeyData?.stages?.length || 10;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  const activeStage = journeyData?.stages?.find((s) => s.stage === journeyData.active_stage) || journeyData?.stages?.[0];

  const overallScoreVal = scoreData?.overall_score ?? (profile?.career_score || 0);
  const scoreScaled = (overallScoreVal / 200).toFixed(1);

  if (loading) {
    return (
      <div className="py-6 space-y-8 max-w-7xl mx-auto">
        {/* Skeleton Header */}
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-surface-container-high rounded-lg w-1/3"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-1/2"></div>
        </div>
        {/* Skeleton KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-surface-container-high rounded-xl animate-pulse"></div>
          ))}
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-surface-container-high rounded-xl animate-pulse lg:col-span-2"></div>
          <div className="h-64 bg-surface-container-high rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Welcome back, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Student'} 👋
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold uppercase">
              {profile?.membership_tier || 'Free'} Member
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Track your placement score, upcoming mentor check-ins, and actionable AI steps.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/student/services"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-hover shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>Book Service</span>
          </Link>
          <Link
            href="/dashboard/student/journey"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-medium border border-surface-container-high hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">explore</span>
            <span>Career Roadmap</span>
          </Link>
          <Link
            href="/dashboard/student/score"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-medium border border-surface-container-high hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">speed</span>
            <span>Scorecard</span>
          </Link>
        </div>
      </div>

      {/* 2. 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Career Score */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
              Career Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-bold">
                {scoreScaled}
              </span>
              <span className="font-body-sm text-body-sm text-tertiary">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                {overallScoreVal >= 700 ? 'Placement Ready' : overallScoreVal >= 400 ? 'Developing' : 'Foundational'}
              </span>
              <span className="text-xs text-tertiary">({overallScoreVal} pts)</span>
            </div>
          </div>
          <Link
            href="/dashboard/student/score"
            className="mt-4 pt-2 border-t border-surface-container-high/50 flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>View dimension radar</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* KPI 2: Journey Progress */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
              Journey Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">conversion_path</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-bold">
                Stage {journeyData?.active_stage || 1}
              </span>
              <span className="font-body-sm text-body-sm text-tertiary">/ {totalStages}</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs text-tertiary mt-1 block truncate">
              {activeStage?.name || 'Target Selection & Foundational Resume'}
            </span>
          </div>
          <Link
            href="/dashboard/student/journey"
            className="mt-4 pt-2 border-t border-surface-container-high/50 flex items-center justify-between text-xs font-semibold text-secondary hover:underline"
          >
            <span>Track roadmap ({progressPercent}%)</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* KPI 3: Active Bookings */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-bold">
                {upcomingBookings.length}
              </span>
              <span className="font-body-sm text-body-sm text-tertiary">Upcoming</span>
            </div>
            <p className="text-xs text-tertiary mt-1">
              {requests.length} open Smart Match requests
            </p>
          </div>
          <Link
            href="/dashboard/student/bookings"
            className="mt-4 pt-2 border-t border-surface-container-high/50 flex items-center justify-between text-xs font-semibold text-blue-700 hover:underline"
          >
            <span>Manage sessions</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* KPI 4: Next Session */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
              Next Session
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div className="mt-3">
            {nextSession ? (
              <>
                <p className="font-title-md text-body-md font-semibold text-on-surface truncate">
                  {nextSession.service?.title || '1:1 Mentorship'}
                </p>
                <p className="text-xs text-tertiary truncate">
                  With {nextSession.mentor?.full_name || 'Assigned Mentor'}
                </p>
                <span className="text-[11px] font-semibold text-amber-700 mt-1 block">
                  {new Date(nextSession.scheduled_start_utc).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </>
            ) : (
              <>
                <p className="text-xs text-on-surface-variant font-medium">No upcoming sessions</p>
                <p className="text-[11px] text-tertiary mt-0.5">Book a resume review or mock test</p>
              </>
            )}
          </div>
          <Link
            href={nextSession ? `/dashboard/student/bookings` : `/dashboard/student/services`}
            className="mt-4 pt-2 border-t border-surface-container-high/50 flex items-center justify-between text-xs font-semibold text-amber-700 hover:underline"
          >
            <span>{nextSession ? 'View meeting room' : 'Book a session'}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 3. Main Grid: Active Engagements + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Engagements & Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-title-md text-title-md font-bold text-on-surface">
                  Active Engagements & Bookings
                </h2>
                <p className="font-body-sm text-body-sm text-tertiary">
                  Direct bookings with verified mentors and escrow safeguards
                </p>
              </div>
              <Link
                href="/dashboard/student/bookings"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-surface-container-high rounded-xl space-y-3">
                <span className="material-symbols-outlined text-4xl text-tertiary">calendar_month</span>
                <h3 className="font-title-md text-body-md font-semibold text-on-surface">
                  No active bookings scheduled
                </h3>
                <p className="font-body-sm text-body-sm text-tertiary max-w-md mx-auto">
                  Submit a Smart Match request or select a verified mentor from the marketplace catalog to start your 1-on-1 prep.
                </p>
                <Link
                  href="/dashboard/student/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>Explore 1:1 Services</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container-high/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {booking.mentor?.full_name ? booking.mentor.full_name[0].toUpperCase() : 'M'}
                      </div>
                      <div>
                        <h4 className="font-title-md text-body-md font-semibold text-on-surface">
                          {booking.service?.title || 'Mentorship Session'}
                        </h4>
                        <p className="text-xs text-tertiary">
                          Mentor: <span className="text-on-surface font-medium">{booking.mentor?.full_name || 'Expert'}</span> • Status: <span className="capitalize font-semibold text-primary">{booking.status.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-tertiary">
                        {new Date(booking.scheduled_start_utc).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <Link
                        href={`/dashboard/student/bookings`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Smart Match Requests Strip */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-title-md text-title-md font-bold text-on-surface">
                  Smart Match Marketplace Requests
                </h2>
                <p className="font-body-sm text-body-sm text-tertiary">
                  Automated reverse-matching broadcasts & incoming counter-offers
                </p>
              </div>
              <Link
                href="/dashboard/student/requests"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Offers matrix ({requests.length})</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="py-6 px-4 text-center border border-dashed border-surface-container-high rounded-xl space-y-2">
                <p className="text-sm text-tertiary">You have no active match broadcasts right now.</p>
                <Link
                  href="/dashboard/student/services"
                  className="text-xs font-semibold text-primary hover:underline inline-block"
                >
                  Create your first Smart Match request →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 2).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-4 border border-surface-container-high/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-body-md font-semibold text-on-surface">
                          Budget: ₹{req.budget_min} - ₹{req.budget_max}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold uppercase">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-tertiary mt-0.5">
                        Target Market: {req.target_career_market_id || 'CM-IN'} • Preferred: {req.preferred_date}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/student/requests"
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors shrink-0"
                    >
                      View Offers
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: AI Recommendations Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
                <h2 className="font-title-md text-title-md font-bold text-on-surface">
                  AI Recommendations
                </h2>
              </div>
              <Link
                href="/dashboard/student/ai"
                className="text-xs font-semibold text-primary hover:underline"
              >
                All ({recommendations.length})
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-surface-container-high rounded-xl space-y-2">
                <span className="material-symbols-outlined text-3xl text-tertiary">check_circle</span>
                <p className="text-xs text-tertiary">You are up to date! No pending AI recommendations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40 space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {item.type}
                        </span>
                        <span className="text-[11px] font-semibold text-tertiary">
                          Priority {item.priority}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDismissRec(item.id)}
                        disabled={dismissingId === item.id}
                        title="Dismiss for 14 days"
                        className="text-tertiary hover:text-on-surface transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>

                    <h4 className="font-title-md text-body-sm font-semibold text-on-surface leading-snug">
                      {item.title}
                    </h4>
                    <p className="font-body-sm text-[12px] text-tertiary leading-relaxed line-clamp-2">
                      {item.reason}
                    </p>

                    {item.action_url && (
                      <Link
                        href={item.action_url}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        <span>{item.action_label || 'Take Action'}</span>
                        <span className="material-symbols-outlined text-[12px]">north_east</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Mentorship Cohort Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary-container/10 via-surface-container-low to-surface-container-lowest border border-primary/20 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
              <h3 className="font-title-md text-body-md font-bold text-on-surface">Structured Cohorts</h3>
            </div>
            <p className="font-body-sm text-xs text-tertiary leading-relaxed">
              Join multi-week cohort fellowships with weekly milestone deliverables, code reviews, and verifiable credentials.
            </p>
            <Link
              href="/dashboard/student/programs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Explore Programs & Cohorts</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
