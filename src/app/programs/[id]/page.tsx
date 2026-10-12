'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface MentorProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
}

interface Milestone {
  id: string;
  week_number: number;
  title: string;
  deliverable_schema?: any;
  estimated_hours: number;
}

interface ProgramDetail {
  id: string;
  title: string;
  slug: string;
  duration_weeks: number;
  price_inr: number;
  description: string;
  is_active: boolean;
  created_at: string;
  profiles?: MentorProfile;
  program_milestones?: Milestone[];
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enrollment action state
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<{
    type: 'success' | 'error' | 'already_enrolled' | null;
    message: string;
  }>({ type: null, message: '' });

  // Milestone accordion toggle
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  useEffect(() => {
    if (!id) return;

    async function loadProgram() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/programs/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Program not found or has been discontinued.');
          } else {
            setError(`Failed to fetch program details (HTTP ${res.status}).`);
          }
          return;
        }
        const json = await res.json();
        setProgram(json.data);
      } catch (err: any) {
        console.error('Error fetching program:', err);
        setError(err.message || 'Unable to connect to program server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProgram();
  }, [id]);

  const handleEnroll = async () => {
    if (!program) return;

    setIsEnrolling(true);
    setEnrollStatus({ type: null, message: '' });

    try {
      const res = await fetch(`/api/v1/programs/${program.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cohort_start_date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        // Redirect to login
        router.push(`/auth/login?redirect=/programs/${id}`);
        return;
      }

      if (res.status === 409) {
        setEnrollStatus({
          type: 'already_enrolled',
          message: 'You are already enrolled in this structured program.'
        });
        return;
      }

      if (!res.ok) {
        setEnrollStatus({
          type: 'error',
          message: data.error || 'Enrollment could not be completed at this time.'
        });
        return;
      }

      setEnrollStatus({
        type: 'success',
        message: 'Congratulations! You have successfully enrolled in this cohort.'
      });
    } catch (err: any) {
      console.error('Error during enrollment:', err);
      setEnrollStatus({
        type: 'error',
        message: err.message || 'Network error encountered during enrollment.'
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const milestones = [...(program?.program_milestones || [])].sort(
    (a, b) => a.week_number - b.week_number
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar activePage="programs" />

      <main className="flex-1 w-full pt-16">
        {/* Banner */}
        <div className="w-full bg-surface-container-high py-2.5 px-6 lg:px-12 border-b border-outline-variant/10">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-on-surface">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-primary text-on-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                ACTIVE COHORT
              </span>
              <span className="text-body-sm font-medium">Outcome-Accountable Mentorship Track</span>
            </div>
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              14-Day 100% Escrow Guarantee
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-outline-variant">/</span>
            <Link href="/programs" className="hover:text-primary transition-colors">Programs</Link>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold truncate max-w-[240px]">
              {program?.title || id}
            </span>
          </nav>
        </div>

        {/* Content Body */}
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-body-md text-on-surface-variant font-medium">Loading program syllabus & details...</p>
            </div>
          ) : error || !program ? (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
              <span className="material-symbols-outlined text-outline text-[48px] mb-3">sentiment_dissatisfied</span>
              <h2 className="text-headline-sm font-bold text-on-surface mb-2">Program Unavailable</h2>
              <p className="text-body-md text-on-surface-variant mb-6">{error || 'This program record does not exist.'}</p>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-label-md hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Programs Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Program Info & Milestones */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Hero Header */}
                <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-label-sm bg-primary/10 text-primary font-bold uppercase tracking-wide">
                      {program.duration_weeks}-Week Core Track
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-label-sm bg-surface-container text-on-surface-variant font-medium">
                      Outcome-Accountable
                    </span>
                  </div>

                  <h1 className="text-headline-lg font-bold text-on-surface tracking-tight mb-4">
                    {program.title}
                  </h1>

                  <p className="text-body-lg text-on-surface-variant leading-relaxed mb-6">
                    {program.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 bg-surface-container-low p-4 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Duration</span>
                      <span className="text-title-md font-bold text-on-surface mt-0.5">{program.duration_weeks} Weeks</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Milestones</span>
                      <span className="text-title-md font-bold text-primary mt-0.5">
                        {milestones.length > 0 ? `${milestones.length} Sprints` : `${program.duration_weeks} Sprints`}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Format</span>
                      <span className="text-title-md font-bold text-secondary mt-0.5">1:1 & Async</span>
                    </div>
                  </div>
                </section>

                {/* Lead Mentor */}
                {program.profiles && (
                  <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
                    <span className="text-label-sm uppercase font-semibold text-primary tracking-wider block mb-3">
                      Lead Hiring Bar-Raiser Mentor
                    </span>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-headline-sm shrink-0">
                        {program.profiles.avatar_url ? (
                          <img
                            src={program.profiles.avatar_url}
                            alt={program.profiles.full_name}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          program.profiles.full_name?.charAt(0) || 'M'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-title-lg font-bold text-on-surface">
                          {program.profiles.full_name}
                        </h3>
                        {program.profiles.headline && (
                          <p className="text-body-md text-on-surface-variant mb-2">
                            {program.profiles.headline}
                          </p>
                        )}
                        {program.profiles.bio && (
                          <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-3.5 rounded-xl">
                            "{program.profiles.bio}"
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Curriculum Milestones */}
                <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/15">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-label-sm uppercase tracking-wider text-primary font-semibold">
                        Syllabus & Deliverables
                      </span>
                      <h2 className="text-headline-sm font-bold text-on-surface mt-1">
                        Weekly Milestones
                      </h2>
                    </div>
                    <span className="text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                      {milestones.length} Structured Modules
                    </span>
                  </div>

                  {milestones.length === 0 ? (
                    <div className="bg-surface-container-low p-6 rounded-xl text-center text-on-surface-variant text-body-sm">
                      Syllabus milestones will be finalized prior to cohort kickoff.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {milestones.map((milestone) => {
                        const isExpanded = !!expandedWeeks[milestone.week_number];
                        return (
                          <div
                            key={milestone.id}
                            className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10"
                          >
                            <button
                              type="button"
                              onClick={() => toggleWeek(milestone.week_number)}
                              className="w-full text-left p-4 flex items-center justify-between gap-4 select-none hover:bg-surface-container transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">
                                  W{milestone.week_number}
                                </span>
                                <span className="font-semibold text-body-md text-on-surface truncate">
                                  {milestone.title}
                                </span>
                              </div>
                              <span className={`material-symbols-outlined text-outline transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="px-5 pb-4 pt-1 border-t border-outline-variant/10 text-on-surface-variant text-body-sm">
                                <div className="flex items-center gap-4 py-2">
                                  <span className="inline-flex items-center gap-1 text-label-sm text-outline">
                                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                                    Est. Time: {milestone.estimated_hours} Hours
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-label-sm text-primary font-medium">
                                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                    Deliverable Submission Required
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Escrow Guarantee Box */}
                <section className="bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">shield</span>
                    </div>
                    <div>
                      <h3 className="text-title-md font-bold text-on-surface mb-1">
                        14-Day 100% Escrow Guarantee
                      </h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Your tuition is securely held in platform escrow until Week 2 milestones are delivered. If you are not completely satisfied, you can cancel within the first 14 days for a full refund.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Sticky Enrollment Box */}
              <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-6">
                <div className="bg-surface-container-lowest p-6 sm:p-7 rounded-2xl shadow-xl border border-outline-variant/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

                  <div className="flex items-center justify-between mb-4 pt-1">
                    <span className="text-label-sm font-bold text-primary uppercase">Admissions Open</span>
                    <span className="inline-flex items-center gap-1 text-label-sm font-semibold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                      Capped Cohort
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-xl mb-6">
                    <span className="text-label-sm text-outline uppercase">Tuition Fee</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-headline-lg font-bold text-on-surface">
                        ₹{Number(program.price_inr).toLocaleString('en-IN')}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">all-inclusive</span>
                    </div>
                    <span className="text-label-sm text-outline block mt-1">Includes all live sessions & materials</span>
                  </div>

                  {/* Feedback / Alert State */}
                  {enrollStatus.type === 'success' && (
                    <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-on-surface">
                      <div className="flex items-center gap-2 text-primary font-semibold text-label-md mb-1">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Enrolled Successfully!
                      </div>
                      <p className="text-body-sm text-on-surface-variant mb-3">{enrollStatus.message}</p>
                      <Link
                        href="/dashboard/student/programs"
                        className="inline-flex items-center gap-1 text-label-sm font-bold text-primary hover:underline"
                      >
                        View in Student Dashboard →
                      </Link>
                    </div>
                  )}

                  {enrollStatus.type === 'already_enrolled' && (
                    <div className="mb-6 p-4 rounded-xl bg-secondary-fixed/40 border border-secondary/20 text-on-surface">
                      <div className="flex items-center gap-2 text-secondary font-semibold text-label-md mb-1">
                        <span className="material-symbols-outlined text-[20px]">info</span>
                        Already Enrolled
                      </div>
                      <p className="text-body-sm text-on-surface-variant mb-3">{enrollStatus.message}</p>
                      <Link
                        href="/dashboard/student/programs"
                        className="inline-flex items-center gap-1 text-label-sm font-bold text-primary hover:underline"
                      >
                        Go to Program Dashboard →
                      </Link>
                    </div>
                  )}

                  {enrollStatus.type === 'error' && (
                    <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/20 text-error">
                      <div className="flex items-center gap-2 font-semibold text-label-md mb-1">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        Enrollment Failed
                      </div>
                      <p className="text-body-sm">{enrollStatus.message}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {enrollStatus.type !== 'success' && (
                    <button
                      type="button"
                      disabled={isEnrolling}
                      onClick={handleEnroll}
                      className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-on-primary font-semibold text-title-md rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? (
                        <>
                          <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>Securing Seat...</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll in Cohort</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="mt-4 flex flex-col gap-2 text-center text-label-sm text-outline">
                    <p className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                      Funds held in platform escrow
                    </p>
                    <p>100% full refund eligible up to 14 days</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
