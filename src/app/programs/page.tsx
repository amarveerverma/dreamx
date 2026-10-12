'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface MentorProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  duration_weeks: number;
  price_inr: number;
  description: string;
  is_active: boolean;
  profiles?: MentorProfile;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durationFilter, setDurationFilter] = useState<'all' | '2' | '4' | '6'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPrograms() {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (durationFilter !== 'all') {
          queryParams.set('duration_weeks', durationFilter);
        }
        const res = await fetch(`/api/v1/programs?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load programs (HTTP ${res.status})`);
        }
        const json = await res.json();
        setPrograms(json.data || []);
      } catch (err: any) {
        console.error('Error fetching programs:', err);
        setError(err.message || 'Unable to load programs catalog');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrograms();
  }, [durationFilter]);

  const filteredPrograms = programs.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.profiles?.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar activePage="programs" />

      <main className="flex-1 w-full pt-16">
        {/* Enrolling Banner */}
        <section className="w-full bg-surface-container-high text-on-surface py-2.5 px-6 lg:px-12 border-b border-outline-variant/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-label-sm font-label-sm">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                STRUCTURED COHORTS
              </span>
              <span className="text-on-surface-variant">
                14-Day 100% Escrow Guarantee • Capped 6–8 Fellows per Cohort • 1:1 Live Bar-Raiser Feedback
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-label-sm font-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                100% Escrow Protected
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                FAANG Bar Raisers
              </span>
            </div>
          </div>
        </section>

        {/* Hero & Title */}
        <section className="w-full bg-surface py-10 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-semibold">Structured Programs</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm font-semibold mb-4">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  Outcome-Accountable Structured Mentorship Tracks
                </div>
                <h1 className="text-display-hero font-display-hero text-on-surface tracking-tight mb-4">
                  Structured Mentorship Programs & Career Accelerators
                </h1>
                <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
                  Outcome-accountable 2-Week Sprints, 4-Week Core Career Fellowships, and 6-Week Deep Transformations led by verified Staff & Principal Bar-Raisers from top Tier-1 product firms.
                </p>
              </div>

              <div className="bg-surface-container-low p-5 rounded-xl shadow-sm flex flex-row lg:flex-col gap-4 min-w-[260px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Max Cohort Density</p>
                    <p className="text-title-md font-title-md text-on-surface font-semibold">6 to 8 Fellows</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                  </div>
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Platform Escrow</p>
                    <p className="text-title-md font-title-md text-on-surface font-semibold">14-Day 100% Refund</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-4 pt-6 bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/15">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
                  <span className="text-label-md font-label-md text-on-surface font-semibold">Filter by Duration:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationFilter('all')}
                    className={`px-4 py-2 rounded-lg text-label-md font-label-md font-semibold transition-all ${
                      durationFilter === 'all'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    All Programs
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationFilter('2')}
                    className={`px-4 py-2 rounded-lg text-label-md font-label-md font-semibold transition-all ${
                      durationFilter === '2'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    ⚡ 2-Week Sprints
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationFilter('4')}
                    className={`px-4 py-2 rounded-lg text-label-md font-label-md font-semibold transition-all ${
                      durationFilter === '4'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    ⭐ 4-Week Core
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationFilter('6')}
                    className={`px-4 py-2 rounded-lg text-label-md font-label-md font-semibold transition-all ${
                      durationFilter === '6'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    🚀 6-Week Accelerators
                  </button>
                </div>

                <div className="relative min-w-[220px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search programs..."
                    className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Listing Content */}
        <section className="w-full bg-surface-container-low/30 py-10 px-6 lg:px-12 flex-1">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-body-md text-on-surface-variant font-medium">Loading live programs catalog...</p>
              </div>
            ) : error ? (
              <div className="bg-error-container/20 border border-error/20 p-8 rounded-2xl text-center max-w-xl mx-auto">
                <span className="material-symbols-outlined text-error text-[40px] mb-2">error</span>
                <h3 className="text-title-md font-semibold text-on-surface mb-2">Failed to Load Programs</h3>
                <p className="text-body-sm text-on-surface-variant mb-6">{error}</p>
                <button
                  type="button"
                  onClick={() => setDurationFilter(durationFilter)}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:bg-primary-container transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredPrograms.length === 0 ? (
              /* Genuine Empty State when database has 0 programs */
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">school</span>
                </div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold mb-3">
                  No Cohort Programs Currently Enrolling
                </h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-8">
                  Active cohort programs are scheduled periodically by verified Bar Raisers with strictly capped cohort sizes (max 6–8 fellows) to ensure rigorous 1:1 attention. New cohort dates will open soon.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/services"
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary font-semibold text-label-md rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Explore 1-on-1 Services
                  </Link>
                  <Link
                    href="/mentors"
                    className="w-full sm:w-auto px-6 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-label-md rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_search</span>
                    Browse Verified Mentors
                  </Link>
                </div>
              </div>
            ) : (
              /* Real Programs from Database */
              <div className="flex flex-col gap-6">
                {filteredPrograms.map((program) => (
                  <article
                    key={program.id}
                    className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md border border-outline-variant/15 p-6 lg:p-8 transition-all relative"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-on-primary text-label-sm font-bold uppercase tracking-wide px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">military_tech</span>
                          {program.duration_weeks}-Week Track
                        </span>
                        <span className="bg-secondary-fixed text-on-secondary-fixed text-label-sm px-2.5 py-1 rounded-full font-medium">
                          Outcome-Accountable Cohort
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-label-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
                        <span>14-Day Escrow Protected</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 flex flex-col gap-4">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                          <Link href={`/programs/${program.slug || program.id}`} className="hover:text-primary transition-colors">
                            {program.title}
                          </Link>
                        </h2>
                        <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                          {program.description}
                        </p>

                        {program.profiles && (
                          <div className="flex items-center gap-3 bg-surface-container-low p-3.5 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-title-sm shrink-0">
                              {program.profiles.avatar_url ? (
                                <img
                                  src={program.profiles.avatar_url}
                                  alt={program.profiles.full_name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                program.profiles.full_name?.charAt(0) || 'M'
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-title-sm font-semibold text-on-surface truncate">
                                {program.profiles.full_name}
                              </p>
                              {program.profiles.headline && (
                                <p className="text-body-xs text-on-surface-variant truncate">
                                  {program.profiles.headline}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-full gap-5">
                        <div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-headline-lg font-headline-lg text-on-surface font-bold">
                              ₹{Number(program.price_inr).toLocaleString('en-IN')}
                            </span>
                            <span className="text-label-md font-label-md text-on-surface-variant">all-inclusive</span>
                          </div>
                          <p className="text-body-xs text-on-surface-variant mt-1">
                            Includes live 1:1 sessions, milestone teardowns & verified rubrics.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/programs/${program.slug || program.id}`}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md rounded-lg text-center shadow-sm transition-all flex items-center justify-center gap-2"
                          >
                            <span>Inspect Syllabus & Enroll</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
