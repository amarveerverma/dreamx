'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface MilestoneItem {
  week: number
  title: string
  deliverable: string
  approvedCount: number
  pendingCount: number
  totalCount: number
  status: 'completed' | 'active' | 'upcoming'
}

interface CohortProgramItem {
  id: string
  title: string
  durationWeeks: number
  priceInr: number
  enrolledFellows: number
  maxCapacity: number
  currentWeek: number
  status: 'active' | 'completed' | 'upcoming'
  nextSession: string
  milestones: MilestoneItem[]
}

export default function MentorProgramsPage() {
  const initialPrograms: CohortProgramItem[] = [
    {
      id: 'prog-1',
      title: 'Distributed Systems & Cloud Architecture Fellowship',
      durationWeeks: 4,
      priceInr: 14999,
      enrolledFellows: 12,
      maxCapacity: 15,
      currentWeek: 2,
      status: 'active',
      nextSession: 'Sat, 6:00 PM IST (Google Meet)',
      milestones: [
        {
          week: 1,
          title: 'High-Throughput Ingestion & Kafka Partitioning',
          deliverable: 'Kafka Cluster Benchmark Report & Tradeoff Matrix',
          approvedCount: 12,
          pendingCount: 0,
          totalCount: 12,
          status: 'completed',
        },
        {
          week: 2,
          title: 'Distributed Consensus & Raft Implementation',
          deliverable: 'Raft Leader Election Pull Request & Consensus Logs',
          approvedCount: 9,
          pendingCount: 3,
          totalCount: 12,
          status: 'active',
        },
        {
          week: 3,
          title: 'Database Sharding & Consistent Hashing Design',
          deliverable: 'Dynamo-style Key-Value Storage Architecture RFC',
          approvedCount: 0,
          pendingCount: 0,
          totalCount: 12,
          status: 'upcoming',
        },
        {
          week: 4,
          title: 'Bar-Raiser Capstone Architecture Defense',
          deliverable: 'Production RFC Defense & Peer Review Scorecard',
          approvedCount: 0,
          pendingCount: 0,
          totalCount: 12,
          status: 'upcoming',
        },
      ],
    },
    {
      id: 'prog-2',
      title: 'Big Tech L5+ Staff Engineering Accelerator',
      durationWeeks: 2,
      priceInr: 8999,
      enrolledFellows: 6,
      maxCapacity: 8,
      currentWeek: 2,
      status: 'completed',
      nextSession: 'Cohort Completed — All Credentials Issued',
      milestones: [
        {
          week: 1,
          title: 'Cross-Organizational Influence & RFC Authorship',
          deliverable: 'High-Impact Multi-Team Initiative Document',
          approvedCount: 6,
          pendingCount: 0,
          totalCount: 6,
          status: 'completed',
        },
        {
          week: 2,
          title: 'Executive Promotion Packet Construction',
          deliverable: 'Calibrated L5-to-L6 Promotion Dossier',
          approvedCount: 6,
          pendingCount: 0,
          totalCount: 6,
          status: 'completed',
        },
      ],
    },
  ]

  const [programs, setPrograms] = useState<CohortProgramItem[]>(initialPrograms)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false)
  const [selectedReviewMilestone, setSelectedReviewMilestone] = useState<MilestoneItem | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // New cohort form state
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState<number>(4)
  const [newPrice, setNewPrice] = useState<number>(12999)
  const [newCapacity, setNewCapacity] = useState<number>(10)
  const [newDescription, setNewDescription] = useState('')

  const totalFellows = programs.reduce((acc, p) => acc + p.enrolledFellows, 0)
  const totalPendingReviews = programs.reduce(
    (acc, p) => acc + p.milestones.reduce((mAcc, m) => mAcc + m.pendingCount, 0),
    0
  )

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault()

    const created: CohortProgramItem = {
      id: `prog-${Date.now()}`,
      title: newTitle,
      durationWeeks: newDuration,
      priceInr: newPrice,
      enrolledFellows: 0,
      maxCapacity: newCapacity,
      currentWeek: 1,
      status: 'upcoming',
      nextSession: 'Kickoff scheduled post-enrollment',
      milestones: Array.from({ length: newDuration }, (_, i) => ({
        week: i + 1,
        title: `Week ${i + 1} Core Technical Milestone`,
        deliverable: `Week ${i + 1} Production Code or RFC Deliverable`,
        approvedCount: 0,
        pendingCount: 0,
        totalCount: 0,
        status: i === 0 ? 'active' : 'upcoming',
      })),
    }

    setPrograms([created, ...programs])
    setIsCreateModalOpen(false)
    setNewTitle('')
    setNewDescription('')
    setStatusMessage(`🎉 Fellowship Cohort "${newTitle}" created successfully!`)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleApproveSubmission = () => {
    if (!selectedReviewMilestone) return
    setPrograms((prev) =>
      prev.map((prog) => ({
        ...prog,
        milestones: prog.milestones.map((m) =>
          m.title === selectedReviewMilestone.title && m.pendingCount > 0
            ? { ...m, approvedCount: m.approvedCount + 1, pendingCount: m.pendingCount - 1 }
            : m
        ),
      }))
    )
    setSelectedReviewMilestone((prev) =>
      prev ? { ...prev, approvedCount: prev.approvedCount + 1, pendingCount: prev.pendingCount - 1 } : null
    )
    setStatusMessage('✅ Submission approved & feedback logged in student portal.')
    setTimeout(() => setStatusMessage(null), 3000)
  }

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
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>1:1 Services (Max 5)</span>
              </Link>
              <Link
                href="/dashboard/mentor/programs"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-semibold font-body-md text-body-md shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">groups</span>
                <span>My Cohorts</span>
              </Link>
              <Link
                href="/programs"
                className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>Public Cohorts Catalog</span>
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
                Program Escrow
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-fixed bg-primary-fixed px-2 py-0.5 rounded-full font-bold">
                T+14 Days Hold
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Multi-week cohort funds released via milestone checks (PRD §14.1).
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
              <span className="text-on-surface font-medium">Programs & Cohort Management</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-tertiary">public</span>
              <span>Target: CM-IN • Active Fellowship Season</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
              <span className="font-semibold">⚡ {totalPendingReviews} Pending Reviews</span>
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
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
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

          {/* Top Title & CTA */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                  Phase 3 Structured Cohorts
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-medium">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  {programs.filter((p) => p.status === 'active').length} Active Cohorts Running
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Programs &amp; Cohort Management
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Design, launch, and instruct multi-week career accelerator fellowships (2, 4, 6 weeks per Database.md Part 5.4). Track weekly milestone progress, evaluate private deliverables, and issue verifiable graduation credentials.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-title-md text-title-md font-semibold hover:bg-surface-container-low transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">visibility</span>
                <span>View Public Catalog</span>
              </Link>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md font-semibold hover:bg-primary-container transition-all shadow-sm hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>Create Fellowship Cohort</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Active Fellows
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">{totalFellows} Enrolled</div>
                <p className="font-body-sm text-body-sm text-tertiary mt-1">Across 2 cohorts</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Pending Submissions
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[18px]">assignment</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">
                  {totalPendingReviews} to Review
                </div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">48h SLA turnaround guarantee</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Completion Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">94.2%</div>
                <p className="font-body-sm text-body-sm text-tertiary mt-1">100% on-time milestone discipline</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
                  Total Cohort Volume
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-metric-num text-metric-num text-on-surface">₹2,33,980</div>
                <p className="font-body-sm text-body-sm text-primary mt-1">Direct Gateway Escrow Hold</p>
              </div>
            </div>
          </div>

          {/* Active Cohorts Program Cards */}
          <div className="space-y-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-surface-container-high">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed">
                        {program.durationWeeks} Weeks Fellowship
                      </span>
                      <span
                        className={`font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-full ${
                          program.status === 'active'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container-high text-tertiary'
                        }`}
                      >
                        {program.status === 'active'
                          ? `Active • Week ${program.currentWeek} of ${program.durationWeeks}`
                          : 'Completed & Certified'}
                      </span>
                      <span className="font-body-sm text-body-sm text-tertiary">
                        ₹{program.priceInr.toLocaleString('en-IN')} / fellow
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                      {program.title}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {program.enrolledFellows} of {program.maxCapacity} Fellows Enrolled • Next live sync:{' '}
                      <span className="font-semibold text-primary">{program.nextSession}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
                    <button
                      onClick={() => {
                        const activeMilestone = program.milestones.find((m) => m.pendingCount > 0) || program.milestones[0]
                        setSelectedReviewMilestone(activeMilestone)
                        setIsReviewDrawerOpen(true)
                      }}
                      className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">assignment</span>
                      <span>Review Submissions ({program.milestones.reduce((acc, m) => acc + m.pendingCount, 0)})</span>
                    </button>
                    <Link
                      href={`/programs/${program.id === 'prog-1' ? 'distributed-systems' : 'tech-leadership-accelerator'}`}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span>Public Syllabus</span>
                      <span className="material-symbols-outlined text-[16px]">north_east</span>
                    </Link>
                  </div>
                </div>

                {/* Milestone Progression Grid */}
                <div className="pt-6">
                  <h3 className="font-title-md text-sm font-semibold uppercase tracking-wider text-tertiary mb-4">
                    Weekly Milestone Curriculums & Deliverable Tracking
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {program.milestones.map((m) => (
                      <div
                        key={m.week}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                          m.status === 'completed'
                            ? 'bg-surface-container-low/60 border-surface-container-high'
                            : m.status === 'active'
                            ? 'bg-surface-container-lowest border-primary shadow-sm'
                            : 'bg-surface-container-lowest/40 border-outline-variant/50 opacity-65'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-label-sm text-xs font-bold text-primary">
                              WEEK {m.week}
                            </span>
                            <span
                              className={`font-label-sm text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                m.status === 'completed'
                                  ? 'bg-surface-container-high text-on-surface-variant'
                                  : m.status === 'active'
                                  ? 'bg-secondary-fixed text-on-secondary-fixed animate-pulse'
                                  : 'bg-surface-container-low text-tertiary'
                              }`}
                            >
                              {m.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-title-md text-sm font-semibold text-on-surface leading-tight mb-2">
                            {m.title}
                          </h4>
                          <p className="font-body-sm text-xs text-tertiary line-clamp-2">
                            {m.deliverable}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between text-xs font-medium">
                          <span className="text-on-surface">
                            {m.approvedCount} / {m.totalCount} Approved
                          </span>
                          {m.pendingCount > 0 ? (
                            <span className="text-secondary font-bold">
                              {m.pendingCount} Pending
                            </span>
                          ) : (
                            <span className="text-tertiary">All clear</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Program Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="font-title-md text-lg font-bold text-on-surface">
                Create Fellowship Cohort Program
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Fellowship Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Engineering & Consensus (4 Weeks)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                    Duration (Weeks per Database.md)
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value={2}>2 Weeks (Sprint Masterclass)</option>
                    <option value={4}>4 Weeks (Standard Fellowship)</option>
                    <option value={6}>6 Weeks (Deep Architecture Immersion)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                    Tuition Fee in INR (₹)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Cohort Capacity (Max Fellows)
                </label>
                <input
                  type="number"
                  min="3"
                  max="25"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md font-semibold text-on-surface block mb-1">
                  Syllabus Overview & Prerequisites
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline what students will build and the weekly commitment expected..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-high bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-tertiary hover:bg-surface-container-low font-label-md text-label-md font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Launch Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {isReviewDrawerOpen && selectedReviewMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div>
                <span className="font-label-sm text-xs font-bold text-primary block">
                  WEEK {selectedReviewMilestone.week} DELIVERABLE REVIEW
                </span>
                <h3 className="font-title-md text-base font-bold text-on-surface">
                  {selectedReviewMilestone.title}
                </h3>
              </div>
              <button
                onClick={() => setIsReviewDrawerOpen(false)}
                className="text-tertiary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low">
                <span className="font-label-sm text-xs text-tertiary block mb-1">
                  Required Deliverable Spec:
                </span>
                <p className="font-body-sm text-sm text-on-surface font-medium">
                  {selectedReviewMilestone.deliverable}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-surface-container-high space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <span className="font-title-md text-sm font-semibold text-on-surface">
                      Ananya Sharma (Fellow)
                    </span>
                  </div>
                  <span className="font-label-sm text-xs text-secondary font-medium">
                    Submitted 3 hours ago
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low text-xs font-mono text-on-surface-variant flex items-center justify-between">
                  <span>raft-consensus-pr#42-raft.patch (1.4MB)</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                </div>
                <p className="font-body-sm text-xs text-tertiary">
                  &ldquo;Implemented heartbeat election timeouts and log replication matching the Raft specification. Included test cases with network partition simulation.&rdquo;
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg text-tertiary hover:bg-surface-container-low font-label-md text-label-md font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApproveSubmission}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Approve & Sign-off</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
