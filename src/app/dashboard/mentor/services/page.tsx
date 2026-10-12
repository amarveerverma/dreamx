'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MENTORS_CATALOG, STANDARD_SERVICES, ServiceTypeItem } from '@/lib/catalog-data'

interface MentorServiceItem {
  id: string
  slug: string
  title: string
  description: string
  price: number
  durationMinutes: number
  deliverable: string
  isActive: boolean
}

export default function MentorServicesPage() {
  // Take reference from Vikram Singh's catalog configuration in Phase 2
  const initialServices: MentorServiceItem[] = [
    {
      id: 'svc-1',
      slug: 'mock-interview',
      title: '1-on-1 Mock Interview (Tech & System Design)',
      description: 'Simulated Google/Meta 60-min round with live whiteboard drawing, distributed tradeoffs, edge cases, and instant debrief.',
      price: 1199,
      durationMinutes: 60,
      deliverable: 'Standardized 4-Page System Design & Technical Scorecard (24h SLA)',
      isActive: true,
    },
    {
      id: 'svc-2',
      slug: 'resume-review',
      title: 'Resume & ATS Optimization (Big Tech Calibrated)',
      description: 'Detailed line-by-line rewrite focused on XYZ metric formulas, distributed systems keywords, and Bar Raiser resume filters.',
      price: 799,
      durationMinutes: 45,
      deliverable: 'Annotated PDF Markup & Bullet-Rewrite Specification (24h SLA)',
      isActive: true,
    },
    {
      id: 'svc-3',
      slug: 'coding-dsa-prep',
      title: 'Coding & DSA Interview Prep (DP & Graphs Deep Dive)',
      description: 'Targeted algorithmic mastery focusing on optimal Big-O complexity, recursion-to-DP transformation, and pattern recognition.',
      price: 999,
      durationMinutes: 60,
      deliverable: 'Complexity Proofs & Pattern Cheatsheet Sandbox (24h SLA)',
      isActive: true,
    },
    {
      id: 'svc-4',
      slug: 'career-roadmap',
      title: 'Senior-to-Staff Career Strategy & Promotion Packet Prep',
      description: 'Master the L5-to-L6 leap. Design cross-team impact initiatives, author executive-level RFCs, and structure promotion packets.',
      price: 1499,
      durationMinutes: 45,
      deliverable: '90-Day Cross-Team Architectural Influence Blueprint (24h SLA)',
      isActive: true,
    },
  ]

  const [services, setServices] = useState<MentorServiceItem[]>(initialServices)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [selectedStandardServiceId, setSelectedStandardServiceId] = useState<number>(5)
  const [customPrice, setCustomPrice] = useState<number>(1299)
  const [customNotes, setCustomNotes] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const activeCount = services.filter((s) => s.isActive).length
  const MAX_SERVICES = 5
  const capacityPct = (activeCount / MAX_SERVICES) * 100

  // Calculate mentor 80% take-home pay per PRD §13.6 Direct Gateway Hold model
  const calcTakeHome = (price: number) => Math.round(price * 0.8)

  const handleToggleActive = (id: string) => {
    setServices((prev) => {
      const target = prev.find((s) => s.id === id)
      if (!target) return prev

      if (!target.isActive && activeCount >= MAX_SERVICES) {
        setStatusMessage('⚠️ Limit Reached: Maximum 5 active services allowed per Database.md Part 5.3.')
        setTimeout(() => setStatusMessage(null), 4000)
        return prev
      }

      return prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    })
  }

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    setStatusMessage('Service removed from your active catalog.')
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleUpdatePrice = (id: string, newPrice: number) => {
    if (newPrice <= 0 || isNaN(newPrice)) return
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s)))
    setEditingServiceId(null)
    setStatusMessage('Price updated. Direct Gateway Hold payouts recalibrated.')
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()

    if (activeCount >= MAX_SERVICES) {
      setStatusMessage('MENTOR_SERVICE_LIMIT_EXCEEDED: You have already filled all 5 active slots.')
      return
    }

    const standardType = STANDARD_SERVICES.find((s) => s.id === selectedStandardServiceId)
    if (!standardType) return

    const newService: MentorServiceItem = {
      id: `svc-${Date.now()}`,
      slug: standardType.slug,
      title: standardType.title,
      description: customNotes || standardType.shortDescription,
      price: customPrice,
      durationMinutes: standardType.durationMinutes,
      deliverable: `${standardType.deliverableRubric.title} (${standardType.deliverableRubric.slaHours}h SLA)`,
      isActive: true,
    }

    setServices((prev) => [...prev, newService])
    setIsModalOpen(false)
    setCustomNotes('')
    setStatusMessage(`✅ "${standardType.title}" activated into Slot ${services.length + 1}!`)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  // Available standard services not already used
  const availableStandards = STANDARD_SERVICES.filter(
    (st) => !services.some((s) => s.slug === st.slug)
  )

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mentor Portal Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col">
          <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-container-high">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[22px]">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md font-bold text-on-surface leading-tight tracking-tight">
                  DreamX
                </span>
                <span className="font-label-sm text-label-sm text-primary tracking-wide uppercase font-semibold">
                  Mentor Portal
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/mentor"
              className="p-space-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">dock_to_left</span>
            </Link>
          </div>

          <div className="px-space-md py-space-sm">
            <nav className="flex flex-col gap-1">
              <Link
                href="/dashboard/mentor"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span>Home & Overview</span>
              </Link>
              <Link
                href="/dashboard/mentor/services"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-semibold font-body-md text-body-md shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>1:1 Services (Max 5)</span>
              </Link>
              <Link
                href="/dashboard/mentor/programs"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">groups</span>
                <span>My Cohorts</span>
              </Link>
              <Link
                href="/mentors"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">public</span>
                <span>Public Marketplace</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                <span>Service Catalog</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-space-md flex flex-col gap-space-sm">
          <div className="p-space-md rounded-xl bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                Direct Gateway Holds
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-fixed bg-primary-fixed px-2 py-0.5 rounded-full font-bold">
                Razorpay Route
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              T+3 Days Automatic Hold Release upon Deliverable Sign-off (PRD §13.6).
            </p>
          </div>

          <div className="flex items-center justify-between px-space-sm py-space-xs border-t border-surface-container-high pt-3">
            <Link
              href="/dashboard/student"
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-primary font-body-sm text-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Switch to Student</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-error font-body-sm text-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Log out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-72 w-full">
        {/* Header */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm">
              <Link href="/dashboard/mentor" className="text-tertiary hover:text-primary transition-colors">
                Dashboard
              </Link>
              <span className="text-tertiary">/</span>
              <span className="text-on-surface font-medium">1:1 Mentorship Services</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-tertiary">public</span>
              <span>Market: CM-IN (India Tech) • IST</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
              <span className="font-semibold">★ 4.95 Rating</span>
              <span className="text-tertiary">(186 reviews)</span>
            </div>
            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-title-md text-body-md font-semibold text-on-surface leading-none">
                  Vikram Singh
                </span>
                <span className="font-label-sm text-label-sm text-tertiary">
                  Staff Engineer @ Google Cloud
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-sm">
                VS
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="w-full pt-20 px-gutter bg-surface min-h-screen pb-16">
          {statusMessage && (
            <div className="mb-6 p-4 rounded-xl bg-surface-container-lowest border border-primary/20 shadow-sm flex items-center justify-between animate-fade-in">
              <span className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                {statusMessage}
              </span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Page Top Headline & Action */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                  Phase 2 Verified Catalog
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeCount < MAX_SERVICES ? 'bg-secondary animate-pulse' : 'bg-primary'
                    }`}
                  ></span>
                  {activeCount} of {MAX_SERVICES} Active Slots ({capacityPct}% Capacity)
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                1:1 Mentorship Services
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Manage your standardized 1-on-1 mentorship offerings, customize delivery pricing, and manage real-time active status under the strict 5-service platform limit (Database.md Part 5.3).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={activeCount >= MAX_SERVICES}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-title-md text-title-md font-semibold transition-all shadow-sm ${
                  activeCount >= MAX_SERVICES
                    ? 'bg-surface-container-high text-tertiary cursor-not-allowed opacity-60'
                    : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-md'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>{activeCount >= MAX_SERVICES ? 'Capacity Reached (5/5)' : 'Add Service Slot'}</span>
              </button>
            </div>
          </div>

          {/* Capacity Meter Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                  Platform Service Capacity Meter
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Trigger <code>fn_enforce_max_5_mentor_services</code> guarantees optimal mentor attention and high completion rates.
                </p>
              </div>
              <span className="font-metric-num text-xl font-bold text-primary">
                {activeCount} / {MAX_SERVICES} Slots Active
              </span>
            </div>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeCount >= MAX_SERVICES ? 'bg-primary' : 'bg-primary-container'
                }`}
                style={{ width: `${capacityPct}%` }}
              ></div>
            </div>
            <div className="mt-3 flex items-center justify-between font-label-sm text-label-sm text-tertiary">
              <span>Slot 1–4: Active & Generating Bookings</span>
              <span>{MAX_SERVICES - activeCount} Slot(s) Available</span>
            </div>
          </div>

          {/* Operational Metrics 4-Card Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Active Slots
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">widgets</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">
                  {activeCount} of {MAX_SERVICES}
                </div>
                <p className="font-body-sm text-body-sm text-tertiary mt-1">
                  {MAX_SERVICES - activeCount === 0 ? 'Full capacity' : `${MAX_SERVICES - activeCount} slot available to deploy`}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Est. Monthly Payout
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">₹1,48,200</div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  80% Net Take-Home (Direct Gateway Hold)
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Satisfaction Rating
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">star</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">4.95 ★</div>
                <p className="font-body-sm text-body-sm text-tertiary mt-1">186 Verified Student Reviews</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Delivery SLA
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">100% On-Time</div>
                <p className="font-body-sm text-body-sm text-primary mt-1">24h Standard Rubric Turnaround</p>
              </div>
            </div>
          </div>

          {/* Active Services List */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Configured Offerings ({services.length} of {MAX_SERVICES} Total Slots)
            </h2>
            <span className="font-body-sm text-body-sm text-tertiary">
              Click price to edit • Toggle switch to pause without deleting
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {services.map((svc, index) => (
              <div
                key={svc.id}
                className={`p-6 rounded-2xl bg-surface-container-lowest border transition-all ${
                  svc.isActive
                    ? 'border-surface-container-high shadow-sm hover:shadow-md'
                    : 'border-dashed border-outline-variant/60 opacity-75 bg-surface-container-low/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-md bg-surface-container-high text-primary">
                      Slot {index + 1}
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary">
                      {svc.durationMinutes} mins
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(svc.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold transition-colors ${
                        svc.isActive
                          ? 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-container hover:text-on-primary-container'
                          : 'bg-surface-container-high text-tertiary hover:bg-surface-container-highest'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {svc.isActive ? 'toggle_on' : 'toggle_off'}
                      </span>
                      <span>{svc.isActive ? 'Active' : 'Paused'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      title="Remove service"
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-title-md text-lg font-bold text-on-surface mb-2">{svc.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed line-clamp-2">
                  {svc.description}
                </p>

                {/* Deliverable badge */}
                <div className="p-3 rounded-xl bg-surface-container-low mb-4 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">
                    description
                  </span>
                  <div className="text-xs">
                    <span className="font-semibold text-on-surface block">Mandatory Deliverable:</span>
                    <span className="text-tertiary">{svc.deliverable}</span>
                  </div>
                </div>

                {/* Price and Earnings calculation */}
                <div className="pt-4 border-t border-surface-container-high flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-label-sm text-tertiary block">Student Price</span>
                    {editingServiceId === svc.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          defaultValue={svc.price}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdatePrice(svc.id, Number((e.target as HTMLInputElement).value))
                            }
                          }}
                          className="w-24 px-2 py-1 text-sm rounded border border-primary focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingServiceId(null)}
                          className="text-xs text-tertiary hover:text-on-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingServiceId(svc.id)}
                        className="font-headline-sm text-xl font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1 group"
                        title="Click to edit price"
                      >
                        <span>₹{svc.price.toLocaleString('en-IN')}</span>
                        <span className="material-symbols-outlined text-[16px] text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                          edit
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-primary font-semibold block">
                      Net Take-Home (80%)
                    </span>
                    <span className="font-title-md text-base font-bold text-secondary">
                      ₹{calcTakeHome(svc.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slot Card if under 5 slots */}
            {services.length < MAX_SERVICES && (
              <div
                onClick={() => setIsModalOpen(true)}
                className="p-6 rounded-2xl border-2 border-dashed border-surface-container-high hover:border-primary/50 bg-surface-container-lowest/60 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-surface-container-low/40 min-h-[280px]"
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <h4 className="font-title-md text-title-md font-bold text-on-surface">
                  Slot {services.length + 1} of 5 Available
                </h4>
                <p className="font-body-sm text-body-sm text-tertiary max-w-xs mt-1 mb-4">
                  Deploy another standardized service offering from the S01–S10 rubric catalog.
                </p>
                <span className="px-4 py-2 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-colors">
                  + Activate Service Slot
                </span>
              </div>
            )}
          </div>

          {/* Direct Gateway Hold Compliance Notice */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <h4 className="font-title-md text-title-md font-semibold text-on-surface">
                  Regulatory Compliance: Direct Gateway Hold-and-Release (PRD §13.6)
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Student booking funds are held natively by the payment gateway (Razorpay Route). Upon verifiable deliverable submission, the 3-day holding period elapses and payout is automatically swept to your verified bank account without intermediary platform pooling.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/mentor"
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex-shrink-0"
            >
              Learn More
            </Link>
          </div>
        </main>
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="font-title-md text-lg font-bold text-on-surface">
                Activate New Service Slot ({services.length + 1} of {MAX_SERVICES})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddService} className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Select Standardized Service Type
                </label>
                <select
                  value={selectedStandardServiceId}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    setSelectedStandardServiceId(id)
                    const st = STANDARD_SERVICES.find((s) => s.id === id)
                    if (st) setCustomPrice(st.medianPrice)
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                >
                  {availableStandards.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.title} ({st.durationMinutes} mins — Min ₹{st.priceFloor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Price in INR (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-tertiary font-semibold">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <span className="font-label-sm text-xs text-secondary mt-1 block font-medium">
                  Mentor take-home pay: ₹{calcTakeHome(customPrice).toLocaleString('en-IN')} (80% net)
                </span>
              </div>

              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Custom Guidance Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Focus on distributed systems and Kafka tradeoffs. Please bring your system design doc."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-tertiary hover:bg-surface-container-low font-label-md text-label-md font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Activate Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
