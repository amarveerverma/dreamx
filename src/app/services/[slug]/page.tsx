'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { STANDARD_SERVICES } from '@/lib/catalog-data'

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slugParam = (params?.slug as string) || 'mock-interview'

  const service = useMemo(() => {
    const found = STANDARD_SERVICES.find((s) => s.slug === slugParam)
    return found || STANDARD_SERVICES[0]
  }, [slugParam])

  // Mentors roster offering this service
  const offeringMentors = [
    {
      id: 'vikram',
      name: 'Vikram Singh',
      company: 'Google Cloud',
      role: 'Sr. Staff Systems & Distributed Systems Eng • Ex-Amazon Bar Raiser',
      rating: 4.95,
      loops: '240+ Mock Loops',
      nextSlot: 'Today, 7:00 PM IST',
      price: service.medianPrice || 1199,
      proPrice: Math.round((service.medianPrice || 1199) * 0.85),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    },
    {
      id: 'priya',
      name: 'Priya Nair',
      company: 'Microsoft Core',
      role: 'Principal Tech Lead • High-Concurrency Architecture Specialist',
      rating: 4.98,
      loops: '310+ Mock Loops',
      nextSlot: 'Tomorrow, 8:30 PM IST',
      price: (service.medianPrice || 1199) + 100,
      proPrice: Math.round(((service.medianPrice || 1199) + 100) * 0.85),
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    },
    {
      id: 'rohan',
      name: 'Rohan Verma',
      company: 'Amazon India',
      role: 'Sr. Engineering Manager • Ex-Flipkart Core Platform',
      rating: 4.96,
      loops: '185+ Mock Loops',
      nextSlot: 'Today, 9:30 PM IST',
      price: service.priceFloor || 999,
      proPrice: Math.round((service.priceFloor || 999) * 0.85),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
  ]

  // Right card state
  const [selectedMentor, setSelectedMentor] = useState(offeringMentors[0])
  const [selectedDate, setSelectedDate] = useState('Today (Jul 24)')
  const [selectedTime, setSelectedTime] = useState('07:00 PM IST')
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1')
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null)

  const triggerToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle })
    setTimeout(() => setToastMessage(null), 3200)
  }

  const handleBooking = () => {
    // Route into approved Smart Match intake & slot negotiation pipeline
    router.push(`/services/${service.slug}/match?mentor=${encodeURIComponent(selectedMentor.name)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`)
  }

  return (
    <>
      <Navbar activePage="services" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* Contextual Ribbon / Escrow Guarantee Notice */}
          <div className="w-full bg-surface-container-high py-2 px-margin">
            <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  DreamX Protocol Guard
                </span>
                <span className="text-outline-variant">•</span>
                <span>
                  Funds held in South Asia Gateway CM-IN Escrow until 4-Page Standardized Rubric is verified (3-Day Lock)
                </span>
              </div>
              <div className="flex items-center gap-space-md">
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> 18 Big-Tech Bar Raisers Active Now
                </span>
                <span className="text-outline-variant">•</span>
                <span>Avg Match Speed: 24 mins</span>
              </div>
            </div>
          </div>

          <div className="max-w-[1440px] w-full mx-auto px-margin py-space-lg flex flex-col gap-space-lg">
            {/* Breadcrumbs & Service Meta Flags */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="/">
                  Home
                </Link>
                <span className="text-outline-variant">/</span>
                <Link className="hover:text-primary transition-colors" href="/services">
                  Services
                </Link>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface font-semibold">{service.title}</span>
              </nav>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-surface-container-highest text-primary font-mono font-bold font-label-sm text-label-sm tracking-wider">
                  SERVICE S0{service.id}
                </span>
                <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Most Popular (74% Book This)
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-low text-tertiary font-medium font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">lock_clock</span> 100% Escrow Protected (3-Day Hold)
                </span>
              </div>
            </div>

            {/* Hero Section */}
            <header className="relative rounded-2xl bg-surface-container-lowest p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-secondary-container/10 to-transparent blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-space-md max-w-4xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                    TECHNICAL INTERVIEW MASTERY • 1-ON-1 BIG TECH CALIBRATED
                  </span>
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]">stars</span> 4.96/5 (1,480+ Loops Cleared)
                  </span>
                </div>
                <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight">
                  {service.title} <span className="text-primary">(FAANG / Tier-1 Calibrated)</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {service.fullDescription}
                </p>

                {/* Key Specs Matrix */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm pt-space-sm">
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 transition-all hover:bg-surface-container">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[17px] text-primary">schedule</span>
                      <span>Duration</span>
                    </div>
                    <div className="font-title-md text-title-md text-on-surface font-semibold">
                      {service.durationMinutes} Mins Pairing
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      45m Session + 15m Granular Debrief
                    </div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 transition-all hover:bg-surface-container">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[17px] text-secondary">payments</span>
                      <span>Pricing Floor</span>
                    </div>
                    <div className="font-title-md text-title-md text-on-surface font-semibold">
                      ₹{service.priceFloor} – ₹{service.medianPrice + 300}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Pro members save 15%</div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 transition-all hover:bg-surface-container">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[17px] text-primary">description</span>
                      <span>Verified Deliverable</span>
                    </div>
                    <div className="font-title-md text-title-md text-on-surface font-semibold">4-Page PDF Rubric</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Plus 4K Video + Action Plan</div>
                  </div>
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 transition-all hover:bg-surface-container">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[17px] text-tertiary">timer</span>
                      <span>SLA &amp; Guarantee</span>
                    </div>
                    <div className="font-title-md text-title-md text-on-surface font-semibold">
                      {service.deliverableRubric.slaHours}h SLA Mandate
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Backed by 3-Day Escrow Lock</div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Two-Column Architectural Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* LEFT COLUMN */}
              <section className="lg:col-span-8 flex flex-col gap-space-xl">
                {/* Section A: What Is Evaluated */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col gap-1">
                    <div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Technical Rigor &amp; Dimension Audits
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      What Is Evaluated &amp; Stress-Tested in This Session
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Modeled after the exact internal calibration guidelines used by Google L6, Meta E6, and Amazon Bar Raiser hiring committees.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {service.deliverableRubric.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-space-xs"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-mono text-[14px]">
                          0{idx + 1}
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface">{sec}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Rigorous examination through simulated whiteboard prompts, capacity math, component partitioning, and real-time pushback defense.
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            Bar-Raiser Graded
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            SLO/SLA Targets
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                {/* Section B: Interactive Rubric Scorecard Preview */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                    <div>
                      <div className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                        Standardized Deliverable Deep-Dive
                      </div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Interactive 4-Page Rubric Scorecard</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Calibration Template v4.2
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Unlike informal mentorship chats, every DreamX session requires the mentor to complete this comprehensive, mathematically scored evaluation in your dashboard within 24 hours before escrow release.
                  </p>

                  {/* Rubric Interactive Metric Displays */}
                  <div className="flex flex-col gap-space-md p-space-lg bg-surface-container-low rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface">
                        Sample Candidate Evaluation: <span className="font-mono text-primary font-bold">L5/SSE Level Target</span>
                      </span>
                      <span className="font-mono font-bold text-headline-sm text-primary">82.5 / 100 (Pass Tier)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-label-md text-label-md">
                          <span className="text-on-surface font-medium">Architecture Modularity &amp; Decoupling</span>
                          <span className="font-mono text-primary font-semibold">88 / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-label-md text-label-md">
                          <span className="text-on-surface font-medium">Data Model &amp; Storage Choice</span>
                          <span className="font-mono text-primary font-semibold">84 / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '84%' }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-label-md text-label-md">
                          <span className="text-on-surface font-medium">Scalability &amp; Bottleneck Mitigation</span>
                          <span className="font-mono text-secondary font-semibold">76 / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div className="h-full bg-secondary-container rounded-full" style={{ width: '76%' }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-label-md text-label-md">
                          <span className="text-on-surface font-medium">Communication &amp; Trade-off Defense</span>
                          <span className="font-mono text-primary font-semibold">82 / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-space-sm p-space-md rounded-lg bg-surface-container-lowest shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant font-mono">
                        <span className="material-symbols-outlined text-[16px] text-primary">rate_review</span>
                        <span>AUTHENTIC RUBRIC AUDIT EXCERPT (#DX-MOCK-88412)</span>
                      </div>
                      <blockquote className="font-body-sm text-body-sm text-on-surface italic pl-3 border-l-2 border-primary/40 bg-surface-container-low/50 py-1.5 rounded-r">
                        &quot;Candidate articulated back-of-the-envelope capacity accurately (12,000 QPS peak write). Successfully chose LSM-tree (Cassandra) over B-tree for high-ingestion time series sensor logs. However, candidate overlooked partition rebalancing storms when nodes crash during high-load intervals. Recommended deeper focus on consistent hashing ring virtual nodes before Tier-1 on-site.&quot;
                      </blockquote>
                      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                        <span>Evaluator: Vikram S. (Staff Engineer @ Google Cloud)</span>
                        <span className="text-primary font-medium hover:underline cursor-pointer">
                          View Redacted 4-Page PDF Sample
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Section C: Deliverable Pack */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col gap-1">
                    <div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Post-Session Package
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Delivered to Your DreamX Dashboard within 24 Hours
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                      </div>
                      <h3 className="font-title-md text-title-md text-on-surface">4-Page Written Rubric</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Mathematical dimensional scoring, code/architecture highlights, hiring committee readiness verdict.
                      </p>
                    </div>
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">video_camera_front</span>
                      </div>
                      <h3 className="font-title-md text-title-md text-on-surface">4K Video + Whiteboard</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Full session recording with timestamped mentor flags plus high-resolution Excalidraw vector export.
                      </p>
                    </div>
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">checklist</span>
                      </div>
                      <h3 className="font-title-md text-title-md text-on-surface">14-Day Action Checklist</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Curated technical whitepapers, targeted LeetCode topics to remediate, and mock drill recommendations.
                      </p>
                    </div>
                  </div>
                </article>

                {/* Section D: Verified Mentors Roster */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
                    <div>
                      <div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                        Tier-1 Hiring Committee Vetted
                      </div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Verified System Design Mentors</h2>
                    </div>
                    <Link className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1" href="/mentors">
                      Browse all 34 verified mentors <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-space-md">
                    {offeringMentors.map((m) => (
                      <div
                        key={m.id}
                        className="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container transition-all"
                      >
                        <div className="flex items-center gap-space-md">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
                            <img className="w-full h-full object-cover" alt={m.name} src={m.avatarUrl} />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-container-lowest"></span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-title-md text-title-md text-on-surface font-semibold">{m.name}</span>
                              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
                                {m.company}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{m.role}</p>
                            <div className="flex items-center gap-space-sm pt-1 font-label-sm text-label-sm text-on-surface-variant">
                              <span className="flex items-center gap-0.5 text-primary font-semibold">
                                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>{' '}
                                {m.rating}
                              </span>
                              <span>•</span>
                              <span>{m.loops}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Next Slot: {m.nextSlot}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-space-sm">
                          <div className="text-right">
                            <div className="font-headline-sm text-headline-sm text-on-surface font-bold">₹{m.price}</div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">per 60m session</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href="/mentors/vikram-singh-8f7e"
                              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface font-label-md text-label-md transition-all shadow-sm"
                            >
                              Profile
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedMentor(m)
                                triggerToast(`Selected ${m.name}`, `Slot updated: ${m.nextSlot}`)
                              }}
                              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-md text-label-md transition-all font-semibold shadow-sm cursor-pointer"
                            >
                              Direct Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                {/* Section E: Comparison Table */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col gap-1">
                    <div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Marketplace Contrast
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      DreamX Calibrated Loops vs Generic 1-on-1 Calls
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                      <thead>
                        <tr className="border-b border-surface-container-high text-on-surface font-semibold">
                          <th className="py-3 px-3">Evaluation Feature</th>
                          <th className="py-3 px-3 text-primary bg-primary/5 rounded-t-lg">DreamX Calibrated (S0{service.id})</th>
                          <th className="py-3 px-3 text-on-surface-variant">Generic 1-on-1 Platforms</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low text-on-surface">
                        <tr>
                          <td className="py-3 px-3 font-medium">Evaluation Standard</td>
                          <td className="py-3 px-3 bg-primary/5 font-semibold text-primary">Standardized 4-Page Big-Tech Rubric</td>
                          <td className="py-3 px-3 text-on-surface-variant">Unstructured verbal feedback</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium">Payment Protection</td>
                          <td className="py-3 px-3 bg-primary/5 font-semibold text-primary">100% Escrow Hold until deliverable is vetted</td>
                          <td className="py-3 px-3 text-on-surface-variant">Upfront non-refundable release</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium">Mentor Vetting</td>
                          <td className="py-3 px-3 bg-primary/5 font-semibold text-primary">Bar-Raiser calibrated &amp; verified work email</td>
                          <td className="py-3 px-3 text-on-surface-variant">Self-proclaimed mentors</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium">Career Score Impact</td>
                          <td className="py-3 px-3 bg-primary/5 font-semibold text-primary">+0.8 Pts to DreamX Readiness Score</td>
                          <td className="py-3 px-3 text-on-surface-variant">Zero verified portfolio progression</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium">Delivery SLA</td>
                          <td className="py-3 px-3 bg-primary/5 font-semibold text-primary">{service.deliverableRubric.slaHours}h SLA or Automatic 100% Refund</td>
                          <td className="py-3 px-3 text-on-surface-variant">No recourse if mentor forgets notes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>

                {/* Section F: Frequently Asked Questions */}
                <article className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-lg">
                  <div className="flex flex-col gap-1">
                    <div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                      Pre-Booking Clarity
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Frequently Asked Questions</h2>
                  </div>
                  <div className="flex flex-col gap-space-sm">
                    {[
                      {
                        id: 'faq-1',
                        q: 'Can I pick a custom architecture problem (e.g., Design WhatsApp, Uber, or Kafka)?',
                        a: 'Yes. During booking confirmation or directly in your prep note to the mentor, you can specify target domains (e.g., streaming media, distributed ledger, financial settlement, food delivery logistics) or ask the mentor to surprise you with standard FAANG hiring committee prompts.',
                      },
                      {
                        id: 'faq-2',
                        q: 'What if the mentor does not submit the deliverable within 24 hours?',
                        a: 'DreamX guarantees a 24-hour delivery SLA under CM-IN escrow protocols. If your completed 4-Page Standardized Rubric and session assets are not filed in your dashboard within 24 hours of call completion, your payment hold is automatically released back to your bank account via UPI/NetBanking or re-assigned with priority credit.',
                      },
                      {
                        id: 'faq-3',
                        q: 'Can I reschedule if my company interview date shifts?',
                        a: 'Yes, completely free up to 12 hours before the session start time. You can choose a new slot directly from the mentor\'s updated calendar with zero penalty.',
                      },
                      {
                        id: 'faq-4',
                        q: 'Does this session update my DreamX Career Readiness Score?',
                        a: 'Yes. Completing an S06 mock session and receiving a passing rubric score adds up to +0.8 points to both your System Design Readiness and Technical Interview Confidence dimensions on your public DreamX verifiable credential portfolio.',
                      },
                    ].map((faq) => (
                      <div key={faq.id} className="rounded-xl bg-surface-container-low p-space-md">
                        <button
                          onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between text-left font-title-md text-title-md text-on-surface cursor-pointer"
                          type="button"
                        >
                          <span>{faq.q}</span>
                          <span
                            className={`material-symbols-outlined text-primary text-[20px] transition-transform ${
                              openFaqId === faq.id ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {openFaqId === faq.id && (
                          <div className="mt-2 text-on-surface-variant font-body-sm text-body-sm animate-in fade-in duration-150">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              {/* RIGHT COLUMN */}
              <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-20">
                {/* Card 1: Instant Direct Booking */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_4px_12px_rgba(15,23,42,0.06)] flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase font-semibold text-primary tracking-wider">
                      Direct Instant Booking
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Slots Today
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="font-metric-num text-metric-num text-on-surface font-bold">
                        ₹{selectedMentor.price}
                      </span>
                      <span className="text-on-surface-variant font-body-sm text-body-sm">
                        {' '}
                        / {service.durationMinutes} mins
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-label-sm line-through text-outline">
                        ₹{selectedMentor.price + 300}
                      </span>
                      <span className="font-label-sm text-label-sm text-primary font-bold ml-1">20% OFF</span>
                    </div>
                  </div>

                  {/* Pro Member Banner */}
                  <div className="p-space-sm rounded-lg bg-surface-container-high flex items-center gap-space-xs text-on-surface font-body-sm text-body-sm">
                    <span
                      className="material-symbols-outlined text-secondary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span>
                      DreamX Pro members pay{' '}
                      <strong className="text-secondary font-semibold">₹{selectedMentor.proPrice}</strong> (15% applied).
                    </span>
                  </div>

                  {/* Step 1: Select Mentor */}
                  <div className="flex flex-col gap-1.5 pt-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                      <span>Step 1: Choose Bar-Raiser Mentor</span>
                      <span className="text-on-surface-variant font-body-sm text-body-sm">{selectedMentor.name}</span>
                    </label>
                    <select
                      value={selectedMentor.id}
                      onChange={(e) => {
                        const m = offeringMentors.find((x) => x.id === e.target.value)
                        if (m) setSelectedMentor(m)
                      }}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container cursor-pointer"
                    >
                      {offeringMentors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.company}) — ₹{m.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Choose Date & IST Time Slot */}
                  <div className="flex flex-col gap-2 pt-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-medium">
                      Step 2: Select Date &amp; Time (IST)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Today (Jul 24)', 'Tomorrow (Jul 25)', 'Saturday (Jul 26)'].map((dateStr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`py-2 px-1 rounded-lg font-label-md text-label-md font-semibold text-center transition-all cursor-pointer ${
                            selectedDate === dateStr
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <div>{dateStr.split(' ')[0]}</div>
                          <div className="text-[11px] opacity-80">{dateStr.split('(')[1]?.replace(')', '')}</div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {['07:00 PM IST', '08:30 PM IST', '09:30 PM IST'].map((timeStr) => (
                        <button
                          key={timeStr}
                          type="button"
                          onClick={() => setSelectedTime(timeStr)}
                          className={`py-2 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                            selectedTime === timeStr
                              ? 'bg-primary-fixed text-on-primary-fixed ring-1 ring-primary'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {timeStr.split(' ')[0]} {timeStr.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Slot Confirmation Strip */}
                  <div className="p-space-sm rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between text-body-sm font-body-sm">
                    <span className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[17px] text-primary">event_available</span>
                      <span>Session Slot:</span>
                    </span>
                    <span className="font-semibold text-on-surface">
                      {selectedDate} @ {selectedTime}
                    </span>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    onClick={handleBooking}
                    className="w-full py-3 px-space-md rounded-xl bg-primary text-on-primary font-title-md text-title-md font-semibold flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-on-primary-fixed-variant transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    <span>Proceed to Escrow Booking — ₹{selectedMentor.price}</span>
                  </button>
                  <p className="font-label-sm text-label-sm text-center text-on-surface-variant flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">security</span>
                    Zero charge released until you receive and approve rubric.
                  </p>
                </div>

                {/* Card 2: AI Smart Match Fallback */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-sm relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                      Can&apos;t Find Your Slot or Budget?
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Let our 14-Dimension AI Matching Engine auto-negotiate with 3 vetted bar-raisers within your exact budget ceiling and availability window in under 30 minutes.
                  </p>
                  <Link
                    href={`/services/${service.slug}/match`}
                    className="w-full py-2.5 px-space-md rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold text-center hover:bg-secondary-container transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Launch AI Smart Match Request</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                {/* Trust Micro-Pillars */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    <span>3-Day Escrow Hold via RBI-Compliant Gateway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                    <span>Google Meet Auto-Calendar Sync &amp; Video Backup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">policy</span>
                    <span>100% Quality Re-Match or Full Refund Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                    <span>GST Invoice provided for company reimbursement</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Action Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
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
