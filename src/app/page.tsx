'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1400px] mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xl">
            <Link className="flex items-center gap-space-sm group focus:outline-none" href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_12px_24px_-6px_rgba(139,92,246,0.12)]">
                <span className="font-headline-sm text-headline-sm text-on-primary font-bold">D</span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">
                Dream<span className="text-primary">X</span>
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-space-lg">
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#goal-discovery-section">
                Discover
              </a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#services-matrix-section">
                Services
              </a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#mentor-program-section">
                For Mentors
              </a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#featured-mentors-section">
                Mentors
              </a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="#pricing-section">
                Pricing
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-space-md">
            <button className="hidden sm:flex items-center gap-space-xs h-10 px-space-md bg-surface-container-lowest rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06)] hover:bg-surface-container-low transition-all duration-150 group border border-surface-container-high" type="button">
              <span className="material-symbols-outlined text-primary text-[18px]">neurology</span>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface font-medium">Search &amp; AI</span>
              <div className="flex items-center gap-space-xs ml-space-xs">
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">⌘K</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">50 AI Cr</span>
              </div>
            </button>
            <Link className="hidden md:inline-flex font-body-md text-body-md font-semibold text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors duration-150" href="/login">
              Sign In
            </Link>
            <Link className="h-10 px-space-lg rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06)] transition-all duration-150 active:scale-[0.99]" href="/signup">
              Join Workspace
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="flex flex-col w-full">
          {/* SECTION 1: HERO */}
          <section className="relative w-full overflow-hidden bg-surface py-space-xl lg:py-24 border-b border-outline-variant/30">
            <div className="absolute top-0 right-1/4 -z-10 w-[32rem] h-[32rem] rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 -z-10 w-[30rem] h-[30rem] rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-space-md">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high border border-outline-variant/50 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                      TRUSTED BY 12,000+ TALENTS ACROSS TOP CAMPUSES • INDIA MVP
                    </span>
                  </div>
                  <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight mt-space-sm">
                    The Right Help at Every Stage with <span className="font-headline italic text-primary font-normal">your dream company&apos;s best people</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                    State your goal and get directly matched with verified engineering leaders from Google, Microsoft, and top unicorn startups for 1-on-1 mock interviews, ATS resume audits, and flagship accelerators.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-sm w-full sm:w-auto">
                    <Link className="w-full sm:w-auto h-12 px-space-xl rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-150" href="/signup">
                      Explore Mentors &amp; Services
                      <span className="material-symbols-outlined ml-space-xs text-[18px]">arrow_forward</span>
                    </Link>
                    <a className="w-full sm:w-auto h-12 px-space-xl rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/60 font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150 gap-space-xs" href="#goal-discovery-section">
                      <span className="material-symbols-outlined text-primary text-[20px]">neurology</span>
                      Try AI Goal Discovery
                    </a>
                  </div>
                  <div className="pt-space-md flex flex-wrap items-center justify-center lg:justify-start gap-x-space-lg gap-y-space-xs text-on-surface-variant font-label-md text-label-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>100% Verified Mentors</span>
                    </div>
                    <span className="text-outline-variant hidden sm:inline">•</span>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
                      <span>3-Day Escrow Payout Protection</span>
                    </div>
                    <span className="text-outline-variant hidden sm:inline">•</span>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                      <span>48-Hour Smart Match SLA</span>
                    </div>
                  </div>
                </div>

                {/* Hero Right Card: Live Available Mentor */}
                <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                  <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xl p-space-lg relative overflow-hidden">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
                        </span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">Live Available Mentor</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">Top 1% Mentor</span>
                    </div>
                    <div className="flex items-start gap-space-md mt-space-md">
                      <div className="w-16 h-16 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary text-xl shadow-sm shrink-0">
                        PS
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-space-xs">
                          <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">Priya Sharma</h3>
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">verified</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate">SDE-2 @ Google (ex-Uber)</p>
                        <div className="flex items-center gap-space-xs mt-1 text-on-surface font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[#f59e0b] text-[16px]">star</span>
                          <span className="font-semibold">4.98</span>
                          <span className="text-on-surface-variant">(118 sessions)</span>
                          <span className="text-outline-variant">•</span>
                          <span className="text-[#10b981] font-semibold">100% Pass Rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-space-md space-y-2">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Next Available Slots</span>
                      <div className="flex gap-2 flex-wrap">
                        <button className="px-2.5 py-1.5 rounded-lg border border-primary bg-primary/10 text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1.5" type="button">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> Today, 8:00 PM
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface font-label-sm text-label-sm" type="button">
                          Tomorrow, 10:30 AM
                        </button>
                      </div>
                    </div>
                    <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold">₹499 • Held in 3-Day Escrow</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Instant Confirm</span>
                    </div>
                    <Link className="mt-space-md w-full h-11 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center transition-all shadow-sm" href="/signup">
                      Instant Book Mock Interview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: STATS BAR */}
          <section className="w-full bg-surface-container-lowest py-space-lg border-b border-outline-variant/30">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-lg divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/30">
                <div className="flex flex-col items-center lg:items-start p-space-md">
                  <div className="flex items-center gap-space-xs text-primary mb-1">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Strict Curation</span>
                  </div>
                  <div className="font-metric-num text-metric-num text-on-surface font-bold">412+</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center lg:text-left mt-0.5">
                    Verified Mentors (Top 3% Acceptance Rate)
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-start p-space-md lg:pl-space-lg">
                  <div className="flex items-center gap-space-xs text-primary mb-1">
                    <span className="material-symbols-outlined text-[18px]">hotel_class</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">High Satisfaction</span>
                  </div>
                  <div className="font-metric-num text-metric-num text-on-surface font-bold">2,620+</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center lg:text-left mt-0.5">
                    Completed Sessions (4.92 / 5.0 Rating)
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-start p-space-md lg:pl-space-lg">
                  <div className="flex items-center gap-space-xs text-primary mb-1">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Response Velocity</span>
                  </div>
                  <div className="font-metric-num text-metric-num text-on-surface font-bold">88.4%</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center lg:text-left mt-0.5">
                    Match Fill Rate (&lt;30m Time-to-First-Offer)
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-start p-space-md lg:pl-space-lg">
                  <div className="flex items-center gap-space-xs text-primary mb-1">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Placement Delta</span>
                  </div>
                  <div className="font-metric-num text-metric-num text-on-surface font-bold">₹48.5L+</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center lg:text-left mt-0.5">
                    Career Value Generated (Pan-India)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: GOAL DISCOVERY TILES */}
          <section className="w-full py-space-xl lg:py-24 bg-surface" id="goal-discovery-section">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-semibold mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">track_changes</span>
                    Autonomous Intent Mapping
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    What do you want to achieve today?
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
                    Select your milestone and let our 14-dimension AI engine find the exact mentor and structured deliverable.
                  </p>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                    ⚡ Instant Calibration
                  </span>
                  <span className="px-space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                    10 Standard Formats
                  </span>
                </div>
              </div>

              {/* 9 Goal Tiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                {[
                  { icon: 'description', title: 'Resume Review & ATS Optimization', desc: 'Line-by-line rewrite, quantified impact bullets, and 90+ ATS pass-rate score guarantee.', price: 'from ₹499', cta: 'Find Reviewers' },
                  { icon: 'videocam', title: 'FAANG / Tier-1 Mock Interview', desc: 'Live 60-min simulation on Google Meet with detailed rubric scoring and live whiteboarding.', price: 'from ₹599', cta: 'Schedule Session' },
                  { icon: 'explore', title: 'Career Roadmap & Strategy', desc: 'Personalized 6-month career flight path mapped to target tech companies and salary bands.', price: 'from ₹599', cta: 'Build Roadmap' },
                  { icon: 'terminal', title: 'Coding & DSA Technical Deep-Dive', desc: 'Live code debugging, space-time trade-off mastery, dynamic programming, and graphs.', price: 'from ₹699', cta: 'Solve DSA' },
                  { icon: 'share', title: 'LinkedIn Profile & Recruiter Visibility', desc: 'SEO optimization for recruiter search algorithms, headline overhaul, and creator positioning.', price: 'from ₹299', cta: 'Optimize Profile' },
                  { icon: 'price_change', title: 'Salary Negotiation & Multiple Offers', desc: 'Tactical counter-offer scripts, equity/ESOP breakdowns, and executive leverage guidance.', price: 'from ₹499', cta: 'Negotiate Offers' },
                  { icon: 'folder_special', title: 'Tech & Product Portfolio Review', desc: 'GitHub repository curation, full-stack deployment audit, and architecture showcase critiques.', price: 'from ₹499', cta: 'Audit Portfolio' },
                  { icon: 'sync_alt', title: 'Non-Tech to SDE Career Transition', desc: 'Pivot roadmap for mechanical, civil, support, or operations roles targeting tech software seats.', price: 'from ₹799', cta: 'Start Pivot' },
                  { icon: 'stars', title: 'Flagship 4-Week Cohort Program', desc: 'Intensive, mentor-guided sprint with weekly milestones, dedicated Slack access, and mock drills.', price: 'from ₹999/mo', cta: 'Explore Cohorts' },
                ].map((tile, i) => (
                  <Link
                    key={i}
                    className="group p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container-high"
                    href="/signup"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
                          <span className="material-symbols-outlined text-[24px]">{tile.icon}</span>
                        </div>
                        <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                          {tile.price}
                        </span>
                      </div>
                      <div className="mt-space-md">
                        <h3 className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {tile.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          {tile.desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-sm flex items-center justify-between text-primary font-label-md text-label-md font-semibold border-t border-surface-container-high">
                      <span>{tile.cta}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: HOW IT WORKS */}
          <section className="w-full py-space-xl lg:py-24 bg-surface-container-low border-y border-outline-variant/30">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="text-center max-w-3xl mx-auto mb-space-xl">
                <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-semibold mb-space-xs">
                  <span className="material-symbols-outlined text-[18px]">schema</span>
                  Precision Architecture
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                  Engineered for High-Conviction Outcomes
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  From career intent to verifiable offer letters through three systematic, escrow-backed stages.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
                {[
                  { num: '01', title: 'State Your Goal & Target Market', desc: 'Decouple your geographic location from your ambition. Configure targeting for India (CM-IN), United States (CM-US), or Global/UK tech hubs with exact skill expectations.', note: 'Targeting CM-IN, CM-US, CM-UK with INR pricing', icon: 'flag' },
                  { num: '02', title: 'AI Smart Match & Live Custom Offers', desc: 'Our 14-dimension vector engine analyzes your tech stack, seniority target, and budget to surface verified leaders who submit custom offers within 24–48 hours.', note: '<30m average time-to-first-offer with auto-Meet', icon: 'neurology' },
                  { num: '03', title: 'Guaranteed Deliverables & Escrow Release', desc: 'Sessions include rubric PDFs, annotated solutions, and session recordings. Mentor payouts remain held in 3-day secure escrow until you approve satisfaction.', note: '100% money-back escrow resolution', icon: 'task_alt' },
                ].map((step, idx) => (
                  <div key={idx} className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 font-display-hero text-surface-container-high/40 font-bold select-none text-5xl">
                      {step.num}
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-space-md">
                        <span className="material-symbols-outlined text-[24px]">{step.icon}</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                        {step.title}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="mt-space-lg p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-space-xs text-on-surface font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>{step.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5: FEATURED MENTORS */}
          <section className="w-full py-space-xl lg:py-24 bg-surface" id="featured-mentors-section">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-semibold mb-space-xs">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Vetted Leadership Pool
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    Meet Verified Mentors Ready to Guide You
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
                    Top 3% accepted leaders from FAANG and high-growth unicorns with verifiable career tracks.
                  </p>
                </div>
                <Link className="inline-flex items-center gap-space-xs font-body-md text-body-md font-semibold text-primary hover:text-primary-hover transition-colors" href="/signup">
                  <span>View All 412+ Mentors</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                {[
                  { name: 'Vikram Singh', role: 'Senior AI Engineer @ Google', rating: '4.95', reviews: '38 reviews', exp: '8 yrs exp', markets: 'CM-IN (India) & CM-US (Global Remote)', tags: ['Mock Interview', 'System Design', 'Distributed Systems'], price: '₹999', initials: 'VS' },
                  { name: 'Priya Nair', role: 'Staff SDE @ Microsoft, ex-Amazon', rating: '4.98', reviews: '52 reviews', exp: '10 yrs exp', markets: 'CM-IN (Tier-1 Indian Ecosystem)', tags: ['DSA Deep-Dive', 'Resume Review', 'Campus Day-0'], price: '₹899', initials: 'PN' },
                  { name: 'Arjun Mehta', role: 'Director of Eng @ Razorpay', rating: '4.91', reviews: '64 reviews', exp: '12 yrs exp', markets: 'CM-IN & CM-SG (Southeast Asia)', tags: ['High Concurrency', 'Salary Negotiation', 'Staff Level'], price: '₹1,199', initials: 'AM' },
                ].map((mentor, i) => (
                  <div key={i} className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between border border-surface-container-high">
                    <div className="p-space-lg">
                      <div className="flex items-start gap-space-md">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-fixed to-secondary-fixed text-primary flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                          {mentor.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-space-xs">
                            <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">{mentor.name}</h3>
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">verified</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate">{mentor.role}</p>
                          <div className="flex items-center gap-space-xs mt-1 text-on-surface font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-[#f59e0b] text-[16px]">star</span>
                            <span className="font-semibold">{mentor.rating}</span>
                            <span className="text-on-surface-variant">({mentor.reviews})</span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-on-surface-variant">{mentor.exp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-space-md pt-space-md space-y-space-sm">
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">public</span>
                          <span>Markets: {mentor.markets}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-space-xs">
                          {mentor.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-space-lg bg-surface-container-low flex items-center justify-between border-t border-surface-container-high">
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">Starting from</span>
                        <div className="font-title-md text-title-md text-on-surface font-bold">{mentor.price} <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">/ session</span></div>
                      </div>
                      <Link className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-sm text-body-sm font-semibold transition-colors shadow-sm" href="/signup">
                        Book Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6: FOR INDUSTRY MENTORS */}
          <section className="w-full py-space-xl lg:py-24 bg-surface-container-low border-b border-outline-variant/30" id="mentor-program-section">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="text-center max-w-3xl mx-auto mb-space-xl">
                <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-semibold mb-space-xs px-3 py-1 rounded-full bg-primary-fixed/60 border border-primary/20">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  ✦ FOR INDUSTRY PROFESSIONALS &amp; MENTORS
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mt-2">
                  Monetize Your Expertise on <span className="font-headline italic text-primary font-normal">Your Own Terms</span>
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Join 580+ verified engineering leaders and product architects earning up to ₹18K–₹45K/month with guaranteed T+2 payouts, zero cold outreach, and full scheduling autonomy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-xl">
                {[
                  { step: '01', title: 'Domain or OAuth Verification', desc: 'Sign up with your verified work email OTP or LinkedIn OAuth. Profile verified in under 5 minutes without bureaucratic gatekeeping.', badge: 'Instant Corporate Badge', icon: 'badge' },
                  { step: '02', title: 'Rating-Based Pricing Engine', desc: 'New mentors start on platform-calibrated rates ₹249–₹799. Hit 4.0+ rating after 10 sessions to unlock custom self-set rates with zero platform ceiling.', badge: '10 Sessions to Free Pricing', icon: 'trending_up' },
                  { step: '03', title: 'Automated 1-Click Sessions', desc: 'Zero logistics. Auto-generated Google Meet rooms, time-boxed structured rubrics, and continuous Google Calendar busy-block sync.', badge: 'Instant Google Meet Sync', icon: 'calendar_today' },
                  { step: '04', title: 'Guaranteed Payouts (T+2 / Escrow)', desc: 'Funds held securely in escrow upfront and released directly to your UPI/bank account in T+2 upon deliverable submission.', badge: 'T+2 UPI/Bank Escrow Payout', icon: 'account_balance_wallet' },
                ].map((s, idx) => (
                  <div key={idx} className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-3 -top-3 font-display-hero text-surface-container-high/40 font-bold select-none text-4xl">
                      {s.step}
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-space-md">
                        <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                        {s.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                    <div className="mt-space-md pt-space-xs border-t border-outline-variant/30 flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>{s.badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-space-md">
                <div className="flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto">
                  <Link className="w-full sm:w-auto h-12 px-space-xl rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-150 gap-space-xs" href="/signup">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Apply to Become a Mentor
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: PRICING */}
          <section className="w-full py-space-xl lg:py-24 bg-surface" id="pricing-section">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="text-center max-w-3xl mx-auto mb-space-xl">
                <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-semibold mb-space-xs">
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  Transparent Subscriptions
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                  Supercharge Your Placement Velocity
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Start free or unlock automated AI matching credits and guaranteed session fee discounts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
                {/* Plan 1 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface font-bold">Free Explorer</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">Baseline</span>
                    </div>
                    <div className="my-space-md">
                      <div className="font-metric-num text-metric-num text-on-surface">₹0 <span className="font-body-md text-body-md font-normal text-on-surface-variant">/ month</span></div>
                    </div>
                    <ul className="space-y-space-sm pt-space-xs">
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span>5 AI discovery credits / mo</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span>1 standard smart match request / mo</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span>Baseline career score diagnostic</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg pt-space-md">
                    <Link className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-md text-body-md font-semibold inline-flex items-center justify-center transition-colors" href="/signup">
                      Get Started Free
                    </Link>
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between relative overflow-hidden border border-primary/40 ring-1 ring-primary/30">
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-primary font-bold">Pro Accelerator</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                    <div className="my-space-md">
                      <div className="font-metric-num text-metric-num text-on-surface">₹149 <span className="font-body-md text-body-md font-normal text-on-surface-variant">/ month</span></div>
                    </div>
                    <ul className="space-y-space-sm pt-space-xs">
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span><strong>100 AI credits</strong> + 50 monthly bonus</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span><strong>5% discount</strong> on all 1-on-1 sessions</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span>Full 14-dimension smart match algorithm</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg pt-space-md">
                    <Link className="w-full h-11 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-md transition-all" href="/signup">
                      Join Pro Accelerator
                    </Link>
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface font-bold">Elite Placement</span>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">Executive</span>
                    </div>
                    <div className="my-space-md">
                      <div className="font-metric-num text-metric-num text-on-surface">₹299 <span className="font-body-md text-body-md font-normal text-on-surface-variant">/ month</span></div>
                    </div>
                    <ul className="space-y-space-sm pt-space-xs">
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span><strong>300 AI credits</strong> + 100 monthly bonus</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span><strong>10% discount</strong> on all services &amp; cohorts</span>
                      </li>
                      <li className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                        <span>Unlimited AI resume &amp; ATS diagnostics</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-lg pt-space-md">
                    <Link className="w-full h-11 rounded-lg bg-inverse-surface hover:bg-on-surface text-inverse-on-surface font-body-md text-body-md font-semibold inline-flex items-center justify-center transition-colors" href="/signup">
                      Upgrade to Elite
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: BOTTOM CTA BANNER */}
          <section className="w-full py-space-xl lg:py-24 bg-surface">
            <div className="max-w-[1400px] mx-auto px-margin">
              <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-container to-secondary p-space-xl lg:p-20 text-on-primary relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-3xl">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-white/20 backdrop-blur-md mb-space-md">
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Immediate Career Leap</span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg lg:text-[40px] lg:leading-[48px] font-bold tracking-tight mb-space-sm text-on-primary">
                    Accelerate Your Career Trajectory Today.
                  </h2>
                  <p className="font-body-lg text-body-lg text-surface-container-high max-w-2xl mb-space-lg leading-relaxed">
                    Join 3,400+ students and professionals unlocking elite mentorship, mock interviews, and verifiable hiring confidence.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-space-md">
                    <Link className="w-full sm:w-auto h-12 px-space-xl rounded-lg bg-surface-container-lowest hover:bg-surface-bright text-primary font-body-md text-body-md font-bold inline-flex items-center justify-center shadow-lg transition-transform hover:-translate-y-0.5" href="/signup">
                      Get Started Free
                    </Link>
                    <Link className="w-full sm:w-auto h-12 px-space-xl rounded-lg bg-white/15 hover:bg-white/25 text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center backdrop-blur-md transition-colors" href="/login">
                      Sign In to Platform
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-inverse-surface text-inverse-on-surface pt-space-xl pb-space-xl">
        <div className="max-w-[1400px] mx-auto px-margin">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
            <div className="lg:col-span-1 space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="font-headline-sm text-headline-sm text-on-primary font-bold">D</span>
                </div>
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary font-semibold">
                  Dream<span className="text-primary-fixed-dim">X</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-highest max-w-xs">
                The autonomous career mobility &amp; talent success marketplace. Engineered for high-conviction outcomes.
              </p>
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container/10">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-surface-container-highest uppercase tracking-wider font-semibold">
                  All Systems Operational
                </span>
              </div>
            </div>
            <div className="space-y-space-sm">
              <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">Product</div>
              <ul className="space-y-space-xs">
                <li className="h-7 flex items-center"><Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors" href="/signup">Career Copilot</Link></li>
                <li className="h-7 flex items-center"><Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors" href="/signup">Outcome Simulator</Link></li>
                <li className="h-7 flex items-center"><Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors" href="/signup">Credit Engine</Link></li>
              </ul>
            </div>
            <div className="space-y-space-sm">
              <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">Programs</div>
              <ul className="space-y-space-xs">
                <li className="h-7 flex items-center"><Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors" href="/signup">Executive Fellowships</Link></li>
                <li className="h-7 flex items-center"><Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors" href="/signup">1-on-1 Advisory</Link></li>
              </ul>
            </div>
            <div className="space-y-space-sm">
              <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">Trust &amp; Security</div>
              <ul className="space-y-space-xs">
                <li className="h-7 flex items-center"><span className="font-body-sm text-body-sm text-surface-container-highest">256-bit AES Vault</span></li>
                <li className="h-7 flex items-center"><span className="font-body-sm text-body-sm text-surface-container-highest">Zero LLM Data Retention</span></li>
                <li className="h-7 flex items-center"><span className="font-body-sm text-body-sm text-surface-container-highest">Supabase GoTrue RLS</span></li>
              </ul>
            </div>
            <div className="space-y-space-sm">
              <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">Compliance</div>
              <div className="flex flex-wrap gap-1.5 pt-space-xs">
                <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-primary-fixed font-semibold">ISO/IEC 27001</span>
                <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-primary-fixed font-semibold">SOC-2 Type II</span>
                <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-secondary-fixed font-semibold">RLS Guarded</span>
              </div>
            </div>
          </div>
          <div className="pt-space-lg border-t border-surface-container-highest/20 flex flex-col sm:flex-row items-center justify-between gap-space-md text-surface-container-highest font-body-sm text-body-sm">
            <p>© 2026 DreamX Technologies, Inc. All rights reserved. Precision career mobility platform.</p>
            <div className="flex items-center gap-space-lg">
              <Link className="hover:text-on-primary transition-colors" href="#">Security Audits</Link>
              <Link className="hover:text-on-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-on-primary transition-colors" href="#">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
