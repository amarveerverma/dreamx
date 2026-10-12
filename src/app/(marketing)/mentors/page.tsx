'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MENTORS_CATALOG, MentorItem } from '@/lib/catalog-data'

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [marketFilter, setMarketFilter] = useState('CM-IN')
  const [serviceFilter, setServiceFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [seniorityFilter, setSeniorityFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sortBy, setSortBy] = useState('highest_rated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const resetFilters = () => {
    setSearchQuery('')
    setMarketFilter('')
    setServiceFilter('')
    setCompanyFilter('')
    setSeniorityFilter('')
    setPriceFilter('')
    setLanguageFilter('')
    setAvailabilityFilter('')
    setRatingFilter('')
  }

  // Filter mentors
  const filteredMentors = useMemo(() => {
    return MENTORS_CATALOG.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = m.fullName.toLowerCase().includes(q)
        const matchesCompany = m.currentCompany.toLowerCase().includes(q) || m.pastCompanies.some(c => c.toLowerCase().includes(q))
        const matchesRole = m.currentRole.toLowerCase().includes(q) || m.headline.toLowerCase().includes(q)
        const matchesSkill = m.skills.some(s => s.toLowerCase().includes(q))
        if (!matchesName && !matchesCompany && !matchesRole && !matchesSkill) return false
      }

      // Market
      if (marketFilter && !m.marketsServed.includes(marketFilter)) return false

      // Service Type
      if (serviceFilter && !m.services.some(s => s.slug.includes(serviceFilter) || s.title.toLowerCase().includes(serviceFilter.toLowerCase()))) return false

      // Target Company
      if (companyFilter) {
        const matchesComp = m.currentCompany.toLowerCase().includes(companyFilter.toLowerCase()) ||
          m.pastCompanies.some(c => c.toLowerCase().includes(companyFilter.toLowerCase()))
        if (!matchesComp) return false
      }

      // Seniority
      if (seniorityFilter === 'junior' && m.yearsExperience > 2) return false
      if (seniorityFilter === 'mid' && (m.yearsExperience < 3 || m.yearsExperience > 5)) return false
      if (seniorityFilter === 'senior' && (m.yearsExperience < 5 || m.yearsExperience > 8)) return false
      if (seniorityFilter === 'staff' && m.yearsExperience < 8) return false

      // Price
      if (priceFilter === 'under-499' && m.startingPriceInr >= 500) return false
      if (priceFilter === '500-999' && (m.startingPriceInr < 500 || m.startingPriceInr > 999)) return false
      if (priceFilter === '1000-1499' && (m.startingPriceInr < 1000 || m.startingPriceInr > 1499)) return false
      if (priceFilter === '1500-plus' && m.startingPriceInr < 1500) return false

      // Language
      if (languageFilter && !m.languages.some(l => l.toLowerCase().includes(languageFilter.toLowerCase()))) return false

      // Rating
      if (ratingFilter && m.rollingRating < parseFloat(ratingFilter)) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'highest_rated') return b.rollingRating - a.rollingRating
      if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience
      if (sortBy === 'price_asc') return a.startingPriceInr - b.startingPriceInr
      if (sortBy === 'price_desc') return b.startingPriceInr - a.startingPriceInr
      if (sortBy === 'sessions') return b.totalReviews - a.totalReviews
      return 0
    })
  }, [searchQuery, marketFilter, serviceFilter, companyFilter, seniorityFilter, priceFilter, languageFilter, ratingFilter, sortBy])

  const getCompanyInitial = (company: string) => {
    if (company.toLowerCase().includes('google')) return 'G'
    if (company.toLowerCase().includes('microsoft')) return 'MS'
    if (company.toLowerCase().includes('amazon')) return 'A'
    if (company.toLowerCase().includes('meta')) return 'M'
    if (company.toLowerCase().includes('razorpay')) return 'RZ'
    if (company.toLowerCase().includes('uber')) return 'U'
    if (company.toLowerCase().includes('atlassian')) return 'AT'
    return company.slice(0, 2).toUpperCase()
  }

  const activeFiltersCount = [
    marketFilter,
    serviceFilter,
    companyFilter,
    seniorityFilter,
    priceFilter,
    languageFilter,
    availabilityFilter,
    ratingFilter,
  ].filter(Boolean).length

  return (
    <>
      <Navbar activePage="mentors" />
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="flex flex-col w-full">
          {/* Ambient Glow */}
          <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-16">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-20 left-10 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* 1. HERO HEADER */}
            <div className="flex flex-col items-start gap-4 max-w-4xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs font-label font-semibold tracking-wider uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Vetted Industry Mentors • Top 3% Acceptance Rate
              </div>

              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight leading-[1.08] font-normal">
                Learn Directly from Engineers &amp; Leaders at Your{' '}
                <span className="italic text-primary">Dream Companies</span>
              </h1>

              <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed mt-1">
                Browse 412+ verified professionals from Google, Microsoft, Amazon, Meta, and high-growth unicorns. Book
                structured 1-on-1 sessions with hold-and-release escrow protection.
              </p>

              {/* Quick Metrics Bar */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-3 mt-1 text-xs sm:text-sm font-label text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="font-bold text-on-surface">412</span> Mentors Active
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-bold text-on-surface">4.92★</span> Avg Rating
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <span className="font-bold text-on-surface">100%</span> Escrow Protected
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                  <span>
                    Avg response: <strong className="text-on-surface">18 mins</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* HERO SEARCH BAR */}
            <div className="mt-8 w-full bg-surface-container-lowest p-2.5 sm:p-3 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1 flex items-center min-w-0">
                <span className="material-symbols-outlined text-outline ml-3.5 text-2xl select-none">search</span>
                <input
                  className="w-full bg-transparent pl-3 pr-4 py-2.5 text-sm sm:text-base font-body text-on-surface placeholder:text-outline focus:outline-none"
                  id="global-mentor-search"
                  placeholder="Search by mentor name, role ('SDE-2', 'AI/ML'), target company, or skill..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-3 text-outline hover:text-on-surface"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
              <button
                className="h-11 sm:h-auto px-6 bg-primary hover:bg-on-primary-fixed-variant text-on-primary rounded-xl font-label font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shrink-0 shadow-sm active:scale-95"
                type="button"
              >
                <span>Explore Mentors</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            {/* 2. GLOBAL 8-POINT SEARCH & FILTER BAR */}
            <section className="mt-8 bg-surface-container-low rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <span className="font-label text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface">
                    Precision Discovery Filters
                  </span>
                  <span className="text-xs text-on-surface-variant font-label">(8 Parameters)</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs font-label text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  id="reset-filters-btn"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Filter 1: Market */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant flex items-center justify-between">
                    <span>Career Market</span>
                    <span className="text-[10px] text-primary uppercase font-bold">PRD §13.3</span>
                  </label>
                  <div className="relative">
                    <select
                      value={marketFilter}
                      onChange={(e) => setMarketFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">All Markets</option>
                      <option value="CM-IN">India (CM-IN)</option>
                      <option value="CM-US">United States (CM-US)</option>
                      <option value="CM-GLB">Remote Global (CM-GLB)</option>
                      <option value="CM-EU">Europe / UK (CM-EU)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 2: Service Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Service Type</label>
                  <div className="relative">
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">All Services (10 Standardized)</option>
                      <option value="mock-interview">Mock Interview (FAANG Style)</option>
                      <option value="resume-review">ATS Resume Architecture</option>
                      <option value="system-design">System Design Deep-Dive</option>
                      <option value="coding-dsa-prep">DSA &amp; Live Coding</option>
                      <option value="salary-negotiation">Offer &amp; Salary Negotiation</option>
                      <option value="career-roadmap">1-on-1 Career Strategy</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 3: Target Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Target Company</label>
                  <div className="relative">
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">All Companies</option>
                      <option value="google">Google</option>
                      <option value="microsoft">Microsoft</option>
                      <option value="amazon">Amazon</option>
                      <option value="meta">Meta</option>
                      <option value="atlassian">Atlassian</option>
                      <option value="uber">Uber</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="flipkart">Flipkart</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 4: Experience Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">
                    Seniority &amp; Experience
                  </label>
                  <div className="relative">
                    <select
                      value={seniorityFilter}
                      onChange={(e) => setSeniorityFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">All Experience Levels</option>
                      <option value="junior">0-2 yrs • Junior Engineer</option>
                      <option value="mid">3-5 yrs • Mid-Level SDE-2</option>
                      <option value="senior">5-8 yrs • Senior / Tech Lead</option>
                      <option value="staff">8+ yrs • Staff / Principal / Director</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 5: Price Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Price per Session</label>
                  <div className="relative">
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">Any Price Range</option>
                      <option value="under-499">Under ₹499</option>
                      <option value="500-999">₹500 - ₹999 (Most Popular)</option>
                      <option value="1000-1499">₹1,000 - ₹1,499</option>
                      <option value="1500-plus">₹1,500+ (Executive/Staff)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 6: Language Compatibility */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Spoken Language</label>
                  <div className="relative">
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">Any Language</option>
                      <option value="english">English (Fluent / Professional)</option>
                      <option value="hindi">Hindi</option>
                      <option value="tamil">Tamil</option>
                      <option value="bengali">Bengali</option>
                      <option value="marathi">Marathi</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 7: Availability / Time Window */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Availability Window</label>
                  <div className="relative">
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">Any Day &amp; Time</option>
                      <option value="today">Available Today</option>
                      <option value="tomorrow">Available Tomorrow</option>
                      <option value="weekend">This Weekend (Sat/Sun)</option>
                      <option value="evening">IST Evening (7:00 PM - 10:30 PM)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Filter 8: Minimum Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-semibold text-on-surface-variant">Mentor Trust &amp; Rating</label>
                  <div className="relative">
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest text-on-surface text-xs sm:text-sm rounded-lg py-2.5 pl-3 pr-8 focus:outline-none focus:bg-surface-container transition-colors font-body cursor-pointer"
                    >
                      <option value="">All Ratings</option>
                      <option value="4.5">4.5+ ★ Very Good</option>
                      <option value="4.8">4.8+ ★ Super Mentors</option>
                      <option value="4.9">4.9+ ★ Top 1% Hall of Fame</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Pill Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-surface-container-high/60">
                  <span className="text-xs font-label text-on-surface-variant">Active criteria:</span>
                  {marketFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-label text-on-surface">
                      Market: <strong>{marketFilter}</strong>
                      <button onClick={() => setMarketFilter('')} className="hover:text-primary">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  )}
                  {companyFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-label text-on-surface">
                      Company: <strong className="capitalize">{companyFilter}</strong>
                      <button onClick={() => setCompanyFilter('')} className="hover:text-primary">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  )}
                  {ratingFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-label text-on-surface">
                      Rating: <strong>Min {ratingFilter}★</strong>
                      <button onClick={() => setRatingFilter('')} className="hover:text-primary">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  )}
                  {serviceFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-label text-on-surface">
                      Service: <strong>{serviceFilter}</strong>
                      <button onClick={() => setServiceFilter('')} className="hover:text-primary">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-xs text-primary font-label hover:underline ml-1 font-semibold cursor-pointer"
                  >
                    Clear all active
                  </button>
                </div>
              )}
            </section>

            {/* 3. RESULTS TOOLBAR */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline text-2xl text-on-surface">Available Mentors</h2>
                <span className="text-xs font-label text-on-surface-variant">
                  Showing {filteredMentors.length} of {MENTORS_CATALOG.length} verified guides
                </span>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-label text-on-surface-variant hidden sm:inline">Sort by:</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-surface-container-lowest text-on-surface text-xs font-label font-semibold rounded-lg py-2 pl-3 pr-8 focus:outline-none shadow-sm cursor-pointer"
                    >
                      <option value="highest_rated">Highest Rated (Default)</option>
                      <option value="experience">Most Experienced</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="sessions">Most Completed Sessions</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-2 text-outline text-sm pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-surface-container p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="Grid View"
                  >
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="List View"
                  >
                    <span className="material-symbols-outlined text-lg">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. MENTOR CARDS GRID */}
            <div className={`grid gap-6 sm:gap-7 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredMentors.map((mentor) => (
                <article
                  key={mentor.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Avatar, Identity, Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            className="w-14 h-14 rounded-full object-cover shadow-sm"
                            alt={mentor.fullName}
                            src={mentor.avatarUrl}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest p-0.5 shadow-sm flex items-center justify-center"
                            title={`Verified ${mentor.currentCompany}`}
                          >
                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {getCompanyInitial(mentor.currentCompany)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/mentors/${mentor.slug}`}>
                              <h3 className="font-headline text-lg sm:text-xl text-on-surface font-semibold truncate hover:text-primary transition-colors">
                                {mentor.fullName}
                              </h3>
                            </Link>
                            <span className="material-symbols-outlined text-primary text-base" title="Verified Corporate Identity">
                              verified
                            </span>
                          </div>
                          <p className="font-body text-xs text-on-surface-variant truncate">
                            {mentor.currentRole} @ {mentor.currentCompany}
                          </p>
                          <span className="font-label text-[11px] text-outline">
                            {mentor.yearsExperience} yrs experience
                          </span>
                        </div>
                      </div>

                      {/* Rating Chip */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="font-label text-xs font-bold text-on-surface">
                            {mentor.rollingRating.toFixed(2)}
                          </span>
                        </div>
                        <span className="font-label text-[10px] text-outline mt-0.5">{mentor.totalReviews} reviews</span>
                      </div>
                    </div>

                    {/* Markets Badge Row */}
                    <div className="flex items-center gap-1.5 mt-3.5">
                      {mentor.marketsServed.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] font-label font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface-variant"
                        >
                          {m}
                        </span>
                      ))}
                      <span className="text-[10px] font-label text-outline ml-auto">
                        Languages: {mentor.languages.join(', ')}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mentor.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface text-xs font-label"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Availability & Next Slot */}
                    <div className="mt-4 p-2.5 rounded-xl bg-surface-container-low/70 flex items-center justify-between text-xs font-label">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">schedule</span>
                        Next Slot:
                      </span>
                      <span className="font-semibold text-on-surface">Tomorrow, 7:30 PM IST</span>
                    </div>
                  </div>

                  {/* Footer / Price & Actions */}
                  <div className="mt-5 pt-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-label text-outline">Starting from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline text-xl font-bold text-on-surface">
                            ₹{mentor.startingPriceInr}
                          </span>
                          <span className="text-xs font-body text-on-surface-variant">/ 45m session</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1 text-[10px] text-primary font-label font-semibold"
                        title="Hold-and-release escrow protection active"
                      >
                        <span className="material-symbols-outlined text-xs">shield</span>
                        T+2 Escrow Guarantee
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/mentors/${mentor.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-label font-semibold transition-colors duration-150 text-center"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/mentors/${mentor.slug}#services`}
                        className="py-2.5 px-3 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-label font-semibold transition-colors duration-150 text-center shadow-xs"
                      >
                        Book 1-on-1
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 5. SMART MATCH ALTERNATIVE CALLOUT BANNER */}
            <section className="mt-12 bg-surface-container rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-xs font-label font-bold tracking-wide uppercase mb-3">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Algorithmic Matching Engine
                  </div>
                  <h3 className="font-headline text-2xl sm:text-3xl text-on-surface font-normal">
                    Can’t find the exact slot or mentor fit?
                  </h3>
                  <p className="font-body text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
                    Let our 14-Dimension Smart Match Engine analyze your target company, interview timeline, and budget.
                    We match you with the top 3 verified mentors in under 30 minutes.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-label text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> 98.4% First-match satisfaction
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Automated calendar re-synch
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Zero booking fee
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-command-menu'))
                      }
                    }}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label font-semibold text-sm transition-all duration-150 shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">bolt</span>
                    <span>Try AI Smart Match (Free)</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 6. PAGINATION & TRUST BAR */}
            <div className="mt-12 flex flex-col items-center gap-8">
              {/* Pagination */}
              <nav aria-label="Mentors pagination" className="flex items-center gap-1 sm:gap-2">
                <button
                  className="h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-label font-semibold transition-colors flex items-center gap-1"
                  disabled
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  <span>Previous</span>
                </button>
                <button className="w-10 h-10 rounded-lg bg-primary text-on-primary text-xs font-label font-bold" type="button">
                  1
                </button>
                <button className="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-label font-semibold" type="button">
                  2
                </button>
                <button className="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-label font-semibold" type="button">
                  3
                </button>
                <span className="w-8 text-center text-outline font-label text-xs select-none">…</span>
                <button className="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-label font-semibold" type="button">
                  18
                </button>
                <button className="h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-label font-semibold transition-colors flex items-center gap-1" type="button">
                  <span>Next</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </nav>

              {/* Trust Bar Architecture */}
              <div className="w-full bg-surface-container-low/60 rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <div>
                      <h4 className="font-label text-sm font-bold text-on-surface">100% Escrow Guarantee</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-normal">
                        Payment held securely until the 45-minute advisory is concluded. No questions asked instant full
                        refund if the mentor fails to join.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">domain_verification</span>
                    </div>
                    <div>
                      <h4 className="font-label text-sm font-bold text-on-surface">Corporate Identity Verification</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-normal">
                        Every listed practitioner undergoes mandatory corporate work-email SSO validation, LinkedIn
                        audit, and mock session peer review.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center md:items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest shadow-xs flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                    </div>
                    <div>
                      <h4 className="font-label text-sm font-bold text-on-surface">T+2 Fast Settlement</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-normal">
                        Compliant marketplace payouts straight to Indian UPI / NEFT and global Stripe Connect rails upon
                        confirmed session delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
