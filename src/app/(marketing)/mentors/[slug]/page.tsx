'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MENTORS_CATALOG, MentorItem } from '@/lib/catalog-data'

export default function MentorProfilePage() {
  const params = useParams()
  const slugParam = (params?.slug as string) || 'vikram-singh-8f7e'

  const mentor: MentorItem = useMemo(() => {
    const found = MENTORS_CATALOG.find((m) => m.slug === slugParam)
    return found || MENTORS_CATALOG[0]
  }, [slugParam])

  // Active browsing mode
  const [activeMode, setActiveMode] = useState<'all' | 'services' | 'pods' | 'qa' | 'cohort' | 'about'>('all')

  // Booking Card State
  const [selectedService, setSelectedService] = useState<{
    title: string
    price: number
    duration: number
    type: string
  }>({
    title: mentor.services[0]?.title || 'System Design Mock Interview',
    price: mentor.services[0]?.price || 1199,
    duration: mentor.services[0]?.durationMinutes || 60,
    type: '1:1',
  })

  const [selectedDate, setSelectedDate] = useState('Today (24 Jul)')
  const [selectedSlot, setSelectedSlot] = useState('07:00 PM IST')
  const [isSaved, setIsSaved] = useState(false)
  const [showSmartModal, setShowSmartModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null)
  const [quickQueryText, setQuickQueryText] = useState('')

  const triggerToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle })
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  const handleSelectServiceFromList = (title: string, price: number, duration: number) => {
    setSelectedService({ title, price, duration, type: '1:1' })
    triggerToast(`Selected: ${title}`, `Price: ₹${price} with 100% Escrow Protection`)
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href)
      triggerToast('Profile Link Copied!', 'Share link copied to clipboard.')
    }
  }

  const handleToggleSave = () => {
    setIsSaved(!isSaved)
    triggerToast(
      isSaved ? 'Removed from Saved' : 'Mentor Saved',
      isSaved ? 'Removed from saved mentors.' : `Added ${mentor.fullName} to your saved mentors.`
    )
  }

  const handleBookingConfirm = () => {
    triggerToast(
      `Securing Escrow Hold (₹${selectedService.price})`,
      'Ready for checkout. Booking locked with hold-and-release escrow guarantee.'
    )
  }

  const handleSendQuickQuery = () => {
    if (!quickQueryText.trim()) {
      triggerToast('Please enter your query', 'Type your question before submitting.')
      return
    }
    triggerToast('Query Submitted (₹249)', `${mentor.fullName} will respond with audio + text within 12 hours.`)
    setQuickQueryText('')
  }

  return (
    <>
      <Navbar activePage="mentors" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        {/* Background glow accents */}
        <div className="relative w-full max-w-7xl mx-auto px-margin py-space-md">
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-64 right-12 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* 1. Top Live Win Ticker & Breadcrumbs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
            <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
              <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
                <span className="material-symbols-outlined text-[16px]">home</span>Home
              </Link>
              <span className="text-outline-variant">/</span>
              <Link className="hover:text-primary transition-colors" href="/mentors">
                Mentors
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold">{mentor.fullName}</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs text-on-surface-variant">
                slug: {mentor.slug}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">campaign</span>
                <span className="font-semibold">Recent Win:</span> Karthik shortlisted at Google L4 (3d ago)
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online • Bookings Open
              </div>
            </div>
          </div>

          {/* 2. Hero Profile Header Card */}
          <div className="mt-space-md bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg border border-surface-container-high flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row gap-space-lg items-start justify-between">
              <div className="flex flex-col sm:flex-row gap-space-lg items-start">
                <div className="relative shrink-0">
                  <img
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-md border-2 border-surface-container-highest"
                    alt={mentor.fullName}
                    src={mentor.avatarUrl}
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  </span>
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-surface/90 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                    <span className="material-symbols-outlined text-[12px]">verified</span>Vetted
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                      {mentor.fullName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Verified Mentor
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">military_tech</span>
                      Top 1% Mentor
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                      <span className="material-symbols-outlined text-[13px]">verified_user</span>
                      100% Escrow
                    </span>
                  </div>
                  <p className="font-title-md text-title-md text-on-surface font-semibold">
                    {mentor.headline}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant font-label-md text-label-md">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                      {mentor.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">public</span>
                      Markets: {mentor.marketsServed.join(' & ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">work_history</span>
                      {mentor.yearsExperience}+ Years Big Tech
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">translate</span>
                      {mentor.languages.join(' & ')}
                    </span>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container text-on-surface">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-bold font-headline-sm text-headline-sm">
                        {mentor.rollingRating.toFixed(2)}
                      </span>
                      <span className="text-xs text-on-surface-variant font-normal">({mentor.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      <span className="font-bold font-label-md text-label-md">92% Shortlist Rate</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-secondary-fixed/40 text-on-secondary-fixed">
                      <span className="material-symbols-outlined text-[16px]">school</span>
                      <span className="font-bold font-label-md text-label-md">200+ Interview Loops Conducted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => {
                    handleSelectServiceFromList('Mock Interview (Technical & System Design)', 1199, 60)
                  }}
                  className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Book a Session
                </button>
                <button
                  onClick={() => setActiveMode('qa')}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                  Quick Doubts (₹249)
                </button>
                <button
                  onClick={() => setShowSmartModal(true)}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md font-medium flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  Send Smart Request
                </button>
              </div>
            </div>

            {/* Specialization Pillars */}
            <div className="border-t border-surface-container pt-3 flex flex-wrap items-center gap-1.5">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface uppercase tracking-wider mr-1">
                Pillars:
              </span>
              <span className="px-2.5 py-1 rounded-md bg-secondary-fixed/30 text-on-secondary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                Group Pods (Max 5, ₹399)
              </span>
              {mentor.skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Need-First Psychological Navigation & Dual Browsing Modes */}
          <div className="sticky top-16 z-40 bg-surface/95 backdrop-blur-md py-3 mt-space-sm border-b border-surface-container">
            <div className="flex items-center justify-between gap-space-sm overflow-x-auto">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'Overview (All)' },
                  { id: 'services', label: `1:1 Services (${mentor.services.length})` },
                  { id: 'pods', label: 'Group Pods (₹399+)' },
                  { id: 'qa', label: 'Quick Q&A Chat' },
                  { id: 'cohort', label: '4-Week Cohort' },
                  { id: 'about', label: 'About & Career' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id as any)}
                    className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all shrink-0 cursor-pointer ${
                      activeMode === mode.id
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface font-medium'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm shrink-0">
                <span className="text-outline-variant">Quick jump:</span>
                <button onClick={() => setActiveMode('all')} className="hover:text-primary cursor-pointer">
                  Reviews ({mentor.totalReviews})
                </button>
                <span className="text-outline-variant">•</span>
                <button onClick={() => setActiveMode('services')} className="hover:text-primary cursor-pointer">
                  1-on-1s
                </button>
                <span className="text-outline-variant">•</span>
                <button onClick={() => setActiveMode('pods')} className="hover:text-primary cursor-pointer">
                  Pods
                </button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mt-space-md">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
              {/* SECTION 1: Verified Outcomes & Reviews */}
              {(activeMode === 'all' || activeMode === 'about') && (
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
                  <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                        Verified Track Record
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Student Outcomes &amp; Placements
                      </h2>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span>{mentor.rollingRating.toFixed(2)} / 5.0 ({mentor.totalReviews} Verified)</span>
                    </div>
                  </div>

                  {/* Trust Metrics Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                    <div className="p-3 rounded-xl bg-surface-container-low">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">FAANG Shortlist Rate</span>
                      <span className="font-metric-num text-metric-num text-on-surface font-bold">92%</span>
                      <span className="text-xs text-emerald-600 font-medium block">within 60 days</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">Avg Offer Hike</span>
                      <span className="font-metric-num text-metric-num text-primary font-bold">+42%</span>
                      <span className="text-xs text-on-surface-variant font-medium block">post negotiation</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">SLA Rubric Turnaround</span>
                      <span className="font-metric-num text-metric-num text-secondary font-bold">100%</span>
                      <span className="text-xs text-on-surface-variant font-medium block">within 24 hours</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">Mock Interview Score</span>
                      <span className="font-metric-num text-metric-num text-on-surface font-bold">4.98</span>
                      <span className="text-xs text-on-surface-variant font-medium block">bar-raiser fidelity</span>
                    </div>
                  </div>

                  {/* Testimonial Cards */}
                  <div className="space-y-3 mt-space-xs">
                    <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            className="w-9 h-9 rounded-full object-cover"
                            alt="Ananya Sharma"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                          />
                          <div>
                            <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                              Ananya Sharma · <span className="text-primary font-medium text-sm">Incoming SDE-2 @ Uber</span>
                            </h4>
                            <span className="text-xs text-on-surface-variant">System Design Mock Interview · Verified Booking</span>
                          </div>
                        </div>
                        <div className="flex text-amber-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">
                        &quot;{mentor.fullName}&apos;s system design mock was the absolute turning point in my Uber loop. He pinpointed exact flaws in my cache invalidation scheme and gave me the exact Bar-Raiser grading rubric. Two weeks later I cracked the L4 round!&quot;
                      </p>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            className="w-9 h-9 rounded-full object-cover"
                            alt="Rohan Deshmukh"
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                          />
                          <div>
                            <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                              Rohan Deshmukh · <span className="text-primary font-medium text-sm">Joined Atlassian P40</span>
                            </h4>
                            <span className="text-xs text-on-surface-variant">Salary Negotiation + Staff Roadmap · Verified Booking</span>
                          </div>
                        </div>
                        <div className="flex text-amber-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">
                        &quot;Helped me negotiate a 45% increase on my initial Atlassian base offer and structured my first 90-day multi-team impact roadmap. Absolute game-changer.&quot;
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION 2: 1:1 Services & Pricing Catalog (Strict 5 Max) */}
              {(activeMode === 'all' || activeMode === 'services') && (
                <section id="services" className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                        Immediate 1:1 Booking
                      </span>
                      <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                        1-on-1 Outcome Services ({mentor.services.length})
                      </h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                      T+2 Escrow Protected
                    </span>
                  </div>

                  <div className="space-y-space-sm">
                    {mentor.services.map((svc, idx) => (
                      <div
                        key={svc.id}
                        className={`bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md ${
                          selectedService.title === svc.title
                            ? 'border-primary ring-1 ring-primary/20'
                            : 'border-surface-container hover:border-primary'
                        }`}
                      >
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                                Popular
                              </span>
                            )}
                            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                              {svc.title}
                            </h3>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {svc.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-secondary font-medium pt-1">
                            <span>• {svc.deliverable}</span>
                            <span>• 4K Video Recording</span>
                            <span>• Priority 24h SLA</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs text-on-surface-variant block">{svc.durationMinutes} min slot</span>
                            <span className="font-metric-num text-metric-num font-bold text-on-surface">
                              ₹{svc.price}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectServiceFromList(svc.title, svc.price, svc.durationMinutes)}
                            className={`px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              selectedService.title === svc.title
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                            }`}
                          >
                            Select &amp; Book{' '}
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION 3: Small Group Masterclasses & Pods */}
              {(activeMode === 'all' || activeMode === 'pods') && (
                <section className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-2xl p-space-lg shadow-sm border border-secondary-fixed/40 flex flex-col gap-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">groups</span>
                        High-Impact Micro-Cohorts
                      </span>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Topic-Based Small Group Pods (Max 5 Mentees)
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold self-start sm:self-auto">
                      From ₹399 / seat
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Max 5 engineers per session. Includes deep-dive architectural presentation + guaranteed 10-minute hotseat critique per participant with live Q&amp;A.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    {/* Pod 1 */}
                    <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary font-bold uppercase tracking-wider">Distributed Systems</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">2 seats left</span>
                        </div>
                        <h4 className="font-title-md text-title-md font-bold text-on-surface">Distributed Key-Value &amp; Consensus (Raft/Paxos)</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Design consistent replication, split-brain recovery, and vector clocks under network partitioning.</p>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>Sat, 27 Jul · 5:00 PM IST (75m)
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <span className="font-bold font-title-md text-title-md text-on-surface">₹449</span>
                        <button
                          onClick={() => handleSelectServiceFromList('Group Pod: Distributed KV & Raft', 449, 75)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-container transition-all cursor-pointer"
                        >
                          Reserve Seat
                        </button>
                      </div>
                    </div>

                    {/* Pod 2 */}
                    <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary font-bold uppercase tracking-wider">LeetCode Masterclass</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">1 seat left</span>
                        </div>
                        <h4 className="font-title-md text-title-md font-bold text-on-surface">Hard &amp; Optimal DP on Trees &amp; Graphs</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">State compression DP, rerooting trees, and DAG transitions with live whiteboard proofs.</p>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>Sun, 28 Jul · 11:00 AM IST (75m)
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <span className="font-bold font-title-md text-title-md text-on-surface">₹399</span>
                        <button
                          onClick={() => handleSelectServiceFromList('Group Pod: Hard DP Patterns', 399, 75)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-container transition-all cursor-pointer"
                        >
                          Reserve Seat
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION 4: Direct Q&A / Asynchronous Query Chat */}
              {(activeMode === 'all' || activeMode === 'qa') && (
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        Fast Async Support
                      </span>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Ask Quick Doubts &amp; Queries (12h SLA)
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold self-start sm:self-auto">
                      ₹249 / query
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Have 1–2 specific questions and don&apos;t need a full video call? Submit your doubt with context or code snippets. Receive an in-depth annotated text + audio breakdown within 12 hours.
                  </p>

                  <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface" htmlFor="quick-query-input">
                      Your Question or Doubt:
                    </label>
                    <textarea
                      id="quick-query-input"
                      rows={3}
                      value={quickQueryText}
                      onChange={(e) => setQuickQueryText(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-surface-container focus:outline-none focus:border-primary"
                      placeholder="e.g. How do I defend my choice of DynamoDB vs Cassandra in Google's distributed cache interview? Or how should I describe a 2-month career gap on my resume?"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                        100% Refund if response exceeds 12h SLA
                      </span>
                      <button
                        onClick={handleSendQuickQuery}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        Send Query (₹249)
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION 5: 4-Week Cohort Track */}
              {(activeMode === 'all' || activeMode === 'cohort') && (
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
                  <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                        Flagship 4-Week Mentorship
                      </span>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Elite Systems &amp; Big Tech Placement Program
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      Cohort 04 Enrolling
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Intensive structured accelerator limited to 6 engineers per cohort. Includes 4 weekend live architectural teardowns, 2 guaranteed 1:1 mocks, weekly code reviews, and personal office hours with {mentor.fullName}.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-xs text-primary font-bold block">Week 1</span>
                      <h5 className="font-title-md text-title-md font-semibold text-on-surface mt-1">Advanced Algorithms</h5>
                      <p className="text-xs text-on-surface-variant mt-1">DP state-space, DAG transitions, and competitive concurrency.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-xs text-primary font-bold block">Week 2</span>
                      <h5 className="font-title-md text-title-md font-semibold text-on-surface mt-1">Distributed Storage</h5>
                      <p className="text-xs text-on-surface-variant mt-1">LSM Trees, Raft replication, sharding schemes, and CAP tradeoffs.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-xs text-primary font-bold block">Week 3</span>
                      <h5 className="font-title-md text-title-md font-semibold text-on-surface mt-1">Production Design</h5>
                      <p className="text-xs text-on-surface-variant mt-1">LLM serving pipelines, custom RAG caching, and Kafka streaming.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-xs text-primary font-bold block">Week 4</span>
                      <h5 className="font-title-md text-title-md font-semibold text-on-surface mt-1">Bar Raiser &amp; Offers</h5>
                      <p className="text-xs text-on-surface-variant mt-1">Official rubric mocks, leadership principles, and salary negotiation.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
                      <div>
                        <span className="font-label-md text-label-md font-bold text-on-surface block">Program Fee: ₹1,999 / month</span>
                        <span className="text-xs text-on-surface-variant">Guaranteed interview readiness or full refund.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectServiceFromList('4-Week Mentorship Cohort', 1999, 120)}
                      className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all cursor-pointer"
                    >
                      Apply for Cohort 04
                    </button>
                  </div>
                </section>
              )}

              {/* SECTION 6: About & Career Background */}
              {(activeMode === 'all' || activeMode === 'about') && (
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
                  <div className="border-b border-surface-container pb-space-sm">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                      Background
                    </span>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      About {mentor.fullName} &amp; Mentoring Philosophy
                    </h2>
                  </div>
                  <div className="font-body-md text-body-md text-on-surface-variant space-y-3">
                    <p>{mentor.bio}</p>
                    <p>
                      My mentoring methodology is strictly no-fluff: we eliminate generic answers and build precise,
                      production-grounded reasoning frameworks. Whether evaluating partition tolerance in custom
                      consensus algorithms or negotiating an equity package, I teach the exact mental models used by
                      top-tier engineering leads.
                    </p>
                  </div>

                  {/* Career Timeline */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                      Career Timeline
                    </span>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-surface-container-low flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">domain</span>
                          <div>
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">
                              {mentor.currentRole}
                            </h5>
                            <span className="text-xs text-on-surface-variant">{mentor.currentCompany} · 2021 – Present</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-medium text-on-surface-variant">
                          Current
                        </span>
                      </div>
                      {mentor.pastCompanies.map((past, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-surface-container-low flex items-start justify-between">
                          <div className="flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">history</span>
                            <div>
                              <h5 className="font-label-md text-label-md font-bold text-on-surface">
                                Staff / Senior Engineer
                              </h5>
                              <span className="text-xs text-on-surface-variant">{past} · Past Experience</span>
                            </div>
                          </div>
                          <span className="text-xs text-on-surface-variant">3+ yrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Booking & Reservation Card */}
            <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container-high p-space-md flex flex-col gap-space-sm">
                {/* Pricing Header */}
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Selected Session
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-metric-num text-metric-num font-bold text-on-surface">
                        ₹{selectedService.price}
                      </span>
                      <span className="text-xs text-on-surface-variant">/ {selectedService.duration}m session</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Online Now
                  </span>
                </div>

                {/* Pro Membership Discount Banner */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/40 flex items-start gap-2 border border-secondary-fixed">
                  <span
                    className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  <div className="text-on-surface">
                    <span className="text-xs font-bold block">DreamX Pro Savings Applied</span>
                    <span className="text-[11px] text-on-surface-variant leading-tight block">
                      You save 15% (₹{Math.round(selectedService.price * 0.15)}) with your AI Credits subscription.
                    </span>
                  </div>
                </div>

                {/* Service Selection Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface" htmlFor="right-service-select">
                    Choose Offering:
                  </label>
                  <select
                    id="right-service-select"
                    value={selectedService.title}
                    onChange={(e) => {
                      const found = mentor.services.find((s) => s.title === e.target.value)
                      if (found) {
                        setSelectedService({
                          title: found.title,
                          price: found.price,
                          duration: found.durationMinutes,
                          type: '1:1',
                        })
                      }
                    }}
                    className="w-full p-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm font-medium border border-surface-container focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                  >
                    <optgroup label="1:1 Mentorship Sessions">
                      {mentor.services.map((svc) => (
                        <option key={svc.id} value={svc.title}>
                          {svc.title} ({svc.durationMinutes}m) - ₹{svc.price}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Date Picker Strip */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">Select Date:</span>
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">public</span>IST (UTC+5:30)
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {['Today (24 Jul)', '25 Jul', '26 Jul', '27 Jul', '28 Jul'].map((dateStr, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex flex-col items-center transition-colors cursor-pointer ${
                          selectedDate === dateStr
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        <span className="text-[10px] font-normal uppercase opacity-80">
                          {i === 0 ? 'Today' : ['Thu', 'Fri', 'Sat', 'Sun'][i - 1]}
                        </span>
                        <span>{dateStr.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Slots */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">Available Slots</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">4 Slots Left</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { slot: '07:00 PM IST', tag: 'Fastest Slot' },
                      { slot: '08:30 PM IST', tag: 'Evening' },
                      { slot: '09:30 PM IST', tag: 'Night' },
                      { slot: '10:15 PM IST', tag: 'Late Night' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(item.slot)}
                        className={`p-2 rounded-lg text-xs text-left border flex flex-col transition-all cursor-pointer ${
                          selectedSlot === item.slot
                            ? 'bg-surface-container-highest text-primary font-semibold border-primary/30'
                            : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-transparent'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-bold ${idx === 0 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {item.tag}
                        </span>
                        <span>{item.slot}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleBookingConfirm}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-body-md hover:bg-primary-container shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Confirm &amp; Pay ₹{selectedService.price}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSmartModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
                    Custom Time / Smart Request
                  </button>
                </div>

                {/* Escrow & Security Trust Strip */}
                <div className="pt-2 border-t border-surface-container flex flex-col gap-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                    <span>
                      <strong>100% Escrow Hold</strong> — Funds released only after delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">videocam</span>
                    <span>Automated Google Meet link generated instantly</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">update</span>
                    <span>Free reschedule up to 24h prior</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                    <span>UPI · NetBanking · Cards · EMI</span>
                    <span className="flex items-center gap-0.5 text-on-surface-variant font-semibold">
                      <span className="material-symbols-outlined text-[13px]">shield</span>256-Bit SSL
                    </span>
                  </div>
                </div>
              </div>

              {/* Share & Save Widget */}
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Share {mentor.fullName}&apos;s Profile</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyLink}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>Copy
                  </button>
                  <button
                    onClick={handleToggleSave}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[14px] text-primary"
                      style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      bookmark
                    </span>
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Request Modal Dialog */}
        {showSmartModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-surface-container flex flex-col gap-space-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-surface-container pb-2">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary">mail</span>
                  Smart Request to {mentor.fullName}
                </h3>
                <button
                  onClick={() => setShowSmartModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Need a tailored corporate training, custom mock interview schedule, or multiple sessions bundle? Send your exact requirements directly.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Target Outcome / Goal</label>
                <input
                  type="text"
                  className="p-2 rounded-lg bg-surface-container-low text-xs border border-surface-container text-on-surface focus:outline-none focus:border-primary"
                  placeholder="e.g. Google L5 Interview in 3 weeks"
                />
                <label className="text-xs font-semibold text-on-surface">Specific Needs or Timeline</label>
                <textarea
                  rows={3}
                  className="p-2 rounded-lg bg-surface-container-low text-xs border border-surface-container text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Describe target level, current company, preferred days/times..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  onClick={() => setShowSmartModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-medium text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSmartModal(false)
                    triggerToast(
                      'Smart Request Dispatched',
                      `${mentor.fullName} will review and respond with custom slots within 2 hours.`
                    )
                  }}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Action Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
              <div>
                <p className="font-label-md text-label-md font-semibold">{toastMessage.title}</p>
                <p className="font-body-sm text-body-sm opacity-80 text-xs">{toastMessage.subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
