'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { STANDARD_SERVICES } from '@/lib/catalog-data'

interface ServiceCardData {
  id: string
  slug: string
  code: string
  title: string
  icon: string
  category: 'resume' | 'interview' | 'career'
  duration: number
  priceMin: number
  priceMax: number
  popularity: number
  isMostBooked?: boolean
  isHighRoi?: boolean
  shortDesc: string
  deliverable: string
  checklist: string[]
}

const SERVICES_DATA: ServiceCardData[] = [
  {
    id: 'S01',
    code: 'S01',
    slug: 'resume-review',
    title: 'Resume Review',
    icon: 'description',
    category: 'resume',
    duration: 45,
    priceMin: 499,
    priceMax: 999,
    popularity: 8,
    shortDesc: 'Live collaborative resume teardown with an L5+ practitioner from target company tier.',
    deliverable: 'Line-by-Line Resume Annotation Report (PDF)',
    checklist: [
      'Action verb cadence & impact velocity',
      'Google XYZ formula metric quantification',
      'Section visual hierarchy & JD relevance fit',
    ],
  },
  {
    id: 'S02',
    code: 'S02',
    slug: 'ats-optimization',
    title: 'ATS Resume Optimization',
    icon: 'rule_folder',
    category: 'resume',
    duration: 45,
    priceMin: 599,
    priceMax: 1199,
    popularity: 7,
    shortDesc: 'Parse-readiness inspection through Lever, Greenhouse, and Workday parser simulators.',
    deliverable: 'ATS Compatibility Scorecard & LaTeX/Word Template',
    checklist: [
      'Greenhouse / Lever parse fidelity scoring',
      'Target JD keyword density without stuffing',
      'Column & multi-tier tabular parsing traps',
    ],
  },
  {
    id: 'S03',
    code: 'S03',
    slug: 'linkedin-optimization',
    title: 'LinkedIn Profile Review',
    icon: 'contacts',
    category: 'resume',
    duration: 30,
    priceMin: 299,
    priceMax: 699,
    popularity: 6,
    shortDesc: 'Convert inbound recruiter curiosity into verified hiring manager outreach.',
    deliverable: 'LinkedIn Feedback Report & Headline Rewrite',
    checklist: [
      'Recruiter Boolean search visibility indices',
      'High-retention headline & summary hooks',
      'Featured projects and credential curation',
    ],
  },
  {
    id: 'S04',
    code: 'S04',
    slug: 'portfolio-review',
    title: 'Portfolio & Case Study Review',
    icon: 'developer_board',
    category: 'resume',
    duration: 45,
    priceMin: 499,
    priceMax: 999,
    popularity: 5,
    shortDesc: 'Critical assessment of architectural writeups, personal builds, and UI/UX flows.',
    deliverable: 'Portfolio Feedback Report & UX/Arch Teardown',
    checklist: [
      'System architecture clarity and case study rigor',
      'GitHub documentation & commit discipline',
      'Production deployment and cloud reliability',
    ],
  },
  {
    id: 'S05',
    code: 'S05',
    slug: 'behavioral-star',
    title: 'Mock Interview: Behavioral',
    icon: 'record_voice_over',
    category: 'interview',
    duration: 60,
    priceMin: 599,
    priceMax: 1199,
    popularity: 9,
    shortDesc: 'Simulated senior behavioral loop with live pressure questioning and framing feedback.',
    deliverable: 'Bar-Raiser Behavioral Rubric Report (4 Pages)',
    checklist: [
      'Strict STAR method timing & quantification',
      'Amazon LP & Google Googlyness alignment',
      'Conflict resolution and senior engineering presence',
    ],
  },
  {
    id: 'S06',
    code: 'S06',
    slug: 'mock-interview',
    title: 'Mock Interview: Tech & System Design',
    icon: 'hub',
    category: 'interview',
    duration: 60,
    priceMin: 799,
    priceMax: 1499,
    popularity: 10,
    isMostBooked: true,
    shortDesc: 'Rigorous high-concurrency whiteboard design session with L6 Staff Architect feedback.',
    deliverable: 'System Architecture Rubric Scorecard + 4K Recording',
    checklist: [
      'HLD / LLD trade-off defense and CAP theorem logic',
      'Partitioning, caching, queues & DB sharding bottlenecks',
      'Cost efficiency and high-availability failure modes',
    ],
  },
  {
    id: 'S07',
    code: 'S07',
    slug: 'career-consultation',
    title: 'Career Consultation & Clarity',
    icon: 'explore',
    category: 'career',
    duration: 30,
    priceMin: 399,
    priceMax: 799,
    popularity: 4,
    shortDesc: 'Unstick your trajectory: evaluate service-to-product leap or domestic vs overseas moves.',
    deliverable: 'Career Consultation Summary & 90-Day Action Plan',
    checklist: [
      'WITCH / service firm to Tier-1 product strategy',
      'Realistic role leveling benchmark (L4 vs L5 vs Staff)',
      'Critical skills gap diagnostic matrix',
    ],
  },
  {
    id: 'S08',
    code: 'S08',
    slug: 'salary-negotiation',
    title: 'Salary & Offer Negotiation',
    icon: 'payments',
    category: 'career',
    duration: 30,
    priceMin: 499,
    priceMax: 999,
    popularity: 8,
    isHighRoi: true,
    shortDesc: 'Extract maximum leverage from existing offers, RSUs, and competing counter-bids.',
    deliverable: 'Verbatim Recruiter Scripts & Counter-Offer Matrix',
    checklist: [
      'Indian CTC vs Fixed Base vs US RSU valuation parity',
      'Competing offer sequencing & explosive deadline defusal',
      'Joining bonus extraction and clawback safety',
    ],
  },
  {
    id: 'S09',
    code: 'S09',
    slug: 'career-roadmap',
    title: 'Career Roadmap & Senior Strategy',
    icon: 'map',
    category: 'career',
    duration: 60,
    priceMin: 599,
    priceMax: 1199,
    popularity: 3,
    shortDesc: 'Structured mapping for L5 to Staff promotion packets and cross-org initiatives.',
    deliverable: '6-Month Skill Milestone & Reading Roadmap',
    checklist: [
      'L5 to L6 promotion packet artifacts & sponsor alignment',
      'RFC authorship benchmarks and multi-team consensus',
      'Executive visibility projects and technical branding',
    ],
  },
  {
    id: 'S10',
    code: 'S10',
    slug: 'coding-dsa-prep',
    title: 'Coding & DSA Interview Prep',
    icon: 'code',
    category: 'interview',
    duration: 60,
    priceMin: 699,
    priceMax: 1299,
    popularity: 9,
    shortDesc: 'Live CoderPad problem solving under strict FAANG time limits with clean code critique.',
    deliverable: 'CoderPad Recording & Curated 50-Problem Pattern Set',
    checklist: [
      'LeetCode Hard optimal DP, Sliding Windows, Graph DAGs',
      'Clean production syntax in Python, Java, Go, or C++',
      'Big-O space-time analytical articulation under stress',
    ],
  },
]

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'resume' | 'interview' | 'career'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [discoveryMode, setDiscoveryMode] = useState<'direct' | 'smart'>('direct')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [smartTarget, setSmartTarget] = useState('')

  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = s.title.toLowerCase().includes(q)
        const matchesDesc = s.shortDesc.toLowerCase().includes(q)
        const matchesDeliv = s.deliverable.toLowerCase().includes(q)
        const matchesCheck = s.checklist.some((c) => c.toLowerCase().includes(q))
        if (!matchesTitle && !matchesDesc && !matchesDeliv && !matchesCheck) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity
      if (sortBy === 'price-low') return a.priceMin - b.priceMin
      if (sortBy === 'price-high') return b.priceMin - a.priceMin
      if (sortBy === 'duration') return a.duration - b.duration
      return 0
    })
  }, [selectedCategory, searchQuery, sortBy])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <>
      <Navbar activePage="services" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* Top Progress & Sub-Navigation Header Context Strip */}
          <section className="w-full bg-surface-container-low py-space-sm px-margin">
            <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm">
              <nav aria-label="Breadcrumbs" className="flex items-center gap-space-xs text-on-surface-variant">
                <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
                  <span className="material-symbols-outlined text-[14px]">home</span>
                  <span>Home</span>
                </Link>
                <span className="text-outline-variant">/</span>
                <Link className="hover:text-primary transition-colors font-medium" href="/services">
                  Services
                </Link>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface font-semibold">One-Time Service Catalog</span>
              </nav>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-[13px] text-secondary">verified</span>
                  <span className="uppercase tracking-wider">CM-IN Verified Escrow Hub</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                  <span>48-Hour Deliverable Turnaround SLA</span>
                </div>
              </div>
            </div>
          </section>

          {/* Hero Header Section */}
          <section className="w-full bg-surface-container-lowest shadow-sm py-space-xl px-margin">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
                <div className="flex flex-col gap-space-sm max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm w-fit font-semibold shadow-sm">
                    <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                    <span>10 STANDARDIZED CAREER OUTCOME DELIVERABLES</span>
                  </div>
                  <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
                    10 Standardized Career Services. Guaranteed Deliverables.{' '}
                    <span className="text-primary">Zero Fluff.</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    Every session is time-boxed, rubric-evaluated, and protected by DreamX 3-Day Deliverable Escrow. Book
                    verified Big Tech and top Indian unicorn practitioners directly, or submit a Smart Match request.
                  </p>
                </div>

                {/* Telemetry Floating Summary Card */}
                <div className="bg-surface-container-high rounded-xl p-space-md flex flex-col gap-space-sm shadow-md min-w-[300px]">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="font-label-md text-label-md font-semibold">Platform Quality Floors</span>
                    <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[15px]">lock_reset</span>
                      <span className="font-medium text-on-surface">100% Escrow</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-[15px]">timer</span>
                      <span className="font-medium text-on-surface">48h SLA</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[15px]">video_call</span>
                      <span className="font-medium text-on-surface">Meet Sync</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-[15px]">description</span>
                      <span className="font-medium text-on-surface">PDF Rubric</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Discovery Mode Switcher */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm border-0">
                <div className="bg-surface-container p-1 rounded-xl flex items-center w-full sm:w-auto shadow-inner">
                  <button
                    onClick={() => setDiscoveryMode('direct')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                      discoveryMode === 'direct'
                        ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">file_json</span>
                    <span>Direct Booking Catalog (10)</span>
                  </button>
                  <button
                    onClick={() => setDiscoveryMode('smart')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                      discoveryMode === 'smart'
                        ? 'bg-surface-container-lowest text-secondary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
                    <span>
                      Smart Match Request{' '}
                      <span className="hidden md:inline text-secondary font-semibold">(3 Mentors in 30m)</span>
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    142 Big Tech mentors online now
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Match Drawer / Banner */}
          {discoveryMode === 'smart' && (
            <section className="w-full bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high py-space-lg px-margin shadow-inner transition-all">
              <div className="max-w-[1440px] mx-auto bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
                <div className="flex flex-col gap-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm font-semibold uppercase">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    <span>Zero-Friction Algorithm Match</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Tell us your target company and goal.</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Our routing engine maps your profile, current skill matrix, and target role level to 3 verified Bar
                    Raisers who have conducted 50+ interviews at your target firm.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm w-full md:w-auto">
                  <input
                    value={smartTarget}
                    onChange={(e) => setSmartTarget(e.target.value)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm shadow-sm focus:bg-surface-container-lowest focus:outline-none min-w-[240px]"
                    placeholder="Target e.g. Google L5, Razorpay Staff"
                    type="text"
                  />
                  <Link
                    href={`/mentors?q=${encodeURIComponent(smartTarget || 'Google')}`}
                    className="px-space-lg py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-on-secondary-fixed-variant transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Run Smart Match</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Filter & Catalog Search Control Bar */}
          <section className="w-full bg-surface py-space-md px-margin sticky top-16 z-40 backdrop-blur-md bg-surface/95 shadow-sm">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
              {/* Category Pills */}
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Services (10)' },
                  { id: 'resume', label: 'Resume & Portfolio (4)' },
                  { id: 'interview', label: 'Interview Mastery (3)' },
                  { id: 'career', label: 'Career Strategy & Comp (3)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Input and Sort Controls */}
              <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm shadow-sm focus:outline-none focus:bg-surface-container-low transition-all"
                    placeholder="Filter by keyword (e.g. ATS, system design)..."
                    type="search"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap hidden lg:inline">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm focus:outline-none cursor-pointer"
                  >
                    <option value="popularity">Popularity / Most Booked</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration (Shortest first)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 10 Standardized Services Catalog Grid */}
          <section className="w-full px-margin py-space-xl">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Standardized Service Offerings</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Every service includes an end-of-call platform rubric PDF stored in your DreamX portfolio.
                  </p>
                </div>
                <span className="font-label-md text-label-md text-primary font-semibold hidden sm:inline">
                  Showing {filteredServices.length} of {SERVICES_DATA.length} services
                </span>
              </div>

              {filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-space-xl text-center bg-surface-container-lowest rounded-xl p-space-xl">
                  <span className="material-symbols-outlined text-[48px] text-tertiary">search_off</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mt-2">No matching services found</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1">
                    Try tweaking your keyword search or select &quot;All Services&quot; to view the complete catalog.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSearchQuery('')
                    }}
                    className="mt-space-md px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
                  {filteredServices.map((svc) => (
                    <article
                      key={svc.id}
                      className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
                    >
                      {svc.isMostBooked && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                      )}
                      <div className="flex flex-col gap-space-md">
                        <div className="flex items-start justify-between gap-space-xs">
                          <div className="flex items-center gap-space-xs">
                            <span
                              className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                                svc.isMostBooked ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                              }`}
                            >
                              {svc.code}
                            </span>
                            {svc.isMostBooked && (
                              <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-fixed text-on-secondary-fixed">
                                Most Booked
                              </span>
                            )}
                            {svc.isHighRoi && (
                              <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-secondary-fixed text-on-secondary-fixed">
                                High ROI
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[15px]">schedule</span> {svc.duration} mins
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 text-on-surface">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">from</span>
                            <span className="font-metric-num text-metric-num font-bold text-on-surface">
                              ₹{svc.priceMin}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">– ₹{svc.priceMax}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Link href={`/services/${svc.slug}`}>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center justify-between hover:text-primary transition-colors">
                              <span>{svc.title}</span>
                              <span className="material-symbols-outlined text-primary text-[22px]">{svc.icon}</span>
                            </h3>
                          </Link>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{svc.shortDesc}</p>
                        </div>

                        {/* Deliverable Banner */}
                        <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                          <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold uppercase">
                            <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                            <span>Guaranteed Deliverable</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface font-medium">{svc.deliverable}</p>
                        </div>

                        {/* Evaluates Checklist */}
                        <div className="flex flex-col gap-1.5">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            What is Evaluated:
                          </span>
                          <ul className="flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm">
                            {svc.checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="material-symbols-outlined text-primary text-[16px] shrink-0">check</span>{' '}
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-space-md flex items-center gap-space-xs">
                        <Link
                          href={`/services/${svc.slug}`}
                          className="flex-1 py-2 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-1 shadow-sm text-center"
                        >
                          <span>Direct Book</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                        <Link
                          href={`/mentors?service=${svc.slug}`}
                          className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed transition-colors flex items-center justify-center"
                          title="View Mentors offering this service"
                        >
                          <span className="material-symbols-outlined text-[20px]">person_search</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Comparison Section: DreamX vs Generic Platforms */}
          <section className="w-full bg-surface-container-low py-space-xl px-margin">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-3xl">
                <div className="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold uppercase">
                  <span className="material-symbols-outlined text-[15px]">balance</span>
                  <span>The Outcome Standard</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Why DreamX Standardized Services Beat Random Calls
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Booking on Fiverr, Topmate, or unvetted marketplace directories often results in vague verbal chit-chat with zero accountability. DreamX enforces an industrial-grade engineering framework.
                </p>
              </div>

              {/* Tabular Comparison Container */}
              <div className="w-full overflow-x-auto shadow-sm rounded-xl">
                <div className="min-w-[800px] bg-surface-container-lowest rounded-xl flex flex-col">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 bg-surface-container-high p-space-md font-title-md text-title-md text-on-surface rounded-t-xl">
                    <div className="col-span-4">Evaluation Dimension</div>
                    <div className="col-span-4 text-primary flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      DreamX Escrow Marketplace
                    </div>
                    <div className="col-span-4 text-on-surface-variant">Generic Consult Sites (Topmate / Fiverr / ADPList)</div>
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-12 p-space-md bg-surface-container-lowest items-start border-b border-surface-container">
                    <div className="col-span-4 flex flex-col gap-1 pr-space-md">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">Platform-Locked Deliverable</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Tangible output after call conclusion</span>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface pr-space-md">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <p className="font-body-sm text-body-sm">
                        <span className="font-semibold text-primary">Mandatory Rubric PDF within 48h.</span> Payout is contingent on platform deliverable submission.
                      </p>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-error text-[20px] shrink-0">cancel</span>
                      <p className="font-body-sm text-body-sm">
                        Zero deliverable enforcement. Only conversational advice or scattered ephemeral notes in Google Meet chat.
                      </p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-12 p-space-md bg-surface-container-low items-start border-b border-surface-container">
                    <div className="col-span-4 flex flex-col gap-1 pr-space-md">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">3-Day Escrow Protection</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Financial custody &amp; dispute rights</span>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface pr-space-md">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <p className="font-body-sm text-body-sm">
                        <span className="font-semibold text-primary">Funds held in escrow for 72 hours.</span> Full auto-refund + ₹100 platform credit if deliverable is missed.
                      </p>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-error text-[20px] shrink-0">cancel</span>
                      <p className="font-body-sm text-body-sm">
                        Upfront credit card charge. No refund mechanism if the mentor arrives late, drops call, or provides poor quality.
                      </p>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-12 p-space-md bg-surface-container-lowest items-start border-b border-surface-container">
                    <div className="col-span-4 flex flex-col gap-1 pr-space-md">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">Bar Raiser Verification</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Authentic hiring authority verification</span>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface pr-space-md">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <p className="font-body-sm text-body-sm">
                        <span className="font-semibold text-primary">Identity &amp; Level Verified.</span> Must possess active/recent L5/L6 hiring experience at Tier-1 product firms.
                      </p>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-error text-[20px] shrink-0">cancel</span>
                      <p className="font-body-sm text-body-sm">
                        Self-proclaimed titles without proof of actual hiring committee or debrief panel involvement.
                      </p>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-12 p-space-md bg-surface-container-low items-start rounded-b-xl">
                    <div className="col-span-4 flex flex-col gap-1 pr-space-md">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">Career Score Integration</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Long-term profile value</span>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface pr-space-md">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <p className="font-body-sm text-body-sm">
                        <span className="font-semibold text-primary">Directly recalculates your 8-dimension score.</span> Rubric scores update verified skills for partner hiring pipelines.
                      </p>
                    </div>
                    <div className="col-span-4 flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-error text-[20px] shrink-0">cancel</span>
                      <p className="font-body-sm text-body-sm">
                        Siloed, one-off interactions with no aggregate tracking or pipeline readiness recognition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upsell Cohort Accelerator Banner */}
          <section className="w-full px-margin py-space-xl">
            <div className="max-w-[1440px] mx-auto bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-low rounded-2xl p-space-xl shadow-lg relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-fixed/50 blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
                <div className="flex flex-col gap-space-sm max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      FLAGSHIP ACCELERATOR
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">14-DAY OUTCOME GUARANTEE</span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Need More Than a Single Session? Join an Intensive Cohort.
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    If you are actively targeting FAANG/Tier-1 offers within the next 60 days, our 4-Week Placement Accelerator combines weekly 1:1 sessions, real-time Slack triage, mock rounds, and recruiter referral pipelines.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md pt-space-xs font-label-md text-label-md text-on-surface font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>Weekly 1:1 Coaching</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                      <span>24/7 AI System Design Simulator</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
                      <span>Direct Big Tech Referrals</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md min-w-[280px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">All-Inclusive Cohort Tier</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-metric-num text-metric-num font-bold text-on-surface">₹1,999</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ month</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-medium">Includes 4x 1:1 Sessions + Escrow</span>
                  </div>
                  <Link
                    className="w-full py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 shadow-sm"
                    href="/mentors"
                  >
                    <span>Explore 4-Week Programs</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <span className="font-label-sm text-label-sm text-center text-on-surface-variant">
                    Next cohort begins Monday • 6 seats remaining
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Comprehensive FAQ Section */}
          <section className="w-full bg-surface-container-lowest py-space-xl px-margin">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs text-center max-w-2xl mx-auto">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Frequently Asked Questions</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Transparent policies governing session execution, deliverable escrows, and guarantees.
                </p>
              </div>

              <div className="max-w-3xl mx-auto w-full flex flex-col gap-space-sm">
                {[
                  {
                    q: 'How does the 3-day deliverable escrow work?',
                    a: 'When you complete checkout, your payment is placed into an automated smart escrow vault. The mentor only receives their payout once the standardized rubric and deliverable PDF are submitted, timestamped, and you have had 72 hours to review and confirm compliance with DreamX quality standards.',
                  },
                  {
                    q: 'Can I reschedule my session?',
                    a: 'Yes. You may reschedule any session without penalty up to 12 hours prior to the scheduled call. Every booking includes 1 free instant reschedule via the integrated Google Calendar integration. Rescheduling within 12 hours requires mutual consent or a nominal mentor-hold fee.',
                  },
                  {
                    q: 'What if the mentor does not submit the deliverable within 48 hours?',
                    a: 'Our SLA is absolute: if the verified mentor fails to upload your signed rubric PDF within the agreed 48-hour post-call window, the escrow protocol automatically triggers a 100% full refund to your original payment method, plus a complimentary ₹100 platform credit added to your account.',
                  },
                  {
                    q: 'Do Pro and Cohort members get service discounts?',
                    a: 'Yes! DreamX Pro members receive an automatic 15% discount on all 10 one-time catalog services. If you are enrolled in any 4-Week Placement Accelerator cohort, one-time mock interviews are already subsidized or included as part of your milestone check-ins.',
                  },
                ].map((faq, i) => (
                  <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full px-space-lg py-space-md flex items-center justify-between text-left hover:bg-surface-container transition-colors cursor-pointer"
                      type="button"
                    >
                      <span className="font-title-md text-title-md text-on-surface font-semibold">{faq.q}</span>
                      <span
                        className={`material-symbols-outlined text-primary text-[20px] transition-transform duration-200 ${
                          openFaq === i ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-space-lg pb-space-md text-on-surface-variant font-body-md text-body-md animate-in fade-in duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
