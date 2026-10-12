
import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md"><div className="flex items-center gap-space-lg"><a className="flex items-center gap-space-xs" data-path="programs" href="#"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[20px]">rocket_launch</span></div><span className="font-title-md text-title-md text-on-surface tracking-tight font-bold">Dream<span className="text-primary">X</span></span></a><nav className="hidden xl:flex items-center gap-1" data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg px-3 py-1.5"><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="discover-goals" href="#">Discover Goals</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="search-marketplace" href="#">Search Marketplace</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="services" href="#">Services</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="programs" href="#">Structured Programs</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="browse-mentors" href="#">Browse Mentors</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors px-3 py-1.5 rounded-lg" data-path="pricing-memberships" href="#">Pricing &amp; Memberships</a></nav></div><div className="flex items-center gap-space-sm"><div className="hidden md:flex items-center gap-space-xs bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)]"><span className="material-symbols-outlined text-outline text-[18px]">search</span><input className="bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none w-32 lg:w-44" placeholder="Search catalog..." type="text"/><kbd className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">⌘K</kbd></div><div className="hidden lg:flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-primary text-[16px]">public</span><span className="font-label-sm text-label-sm text-on-surface">India CM-IN ₹</span></div><div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-secondary text-[16px]">auto_awesome</span><span className="font-label-sm text-label-sm font-semibold">50 Credits</span></div><button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">notifications</span></button><a className="hidden sm:inline-flex font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors" data-path="sign-in" href="#">Sign In</a><a className="font-label-md text-label-md font-semibold bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.06)]" data-path="get-started" href="#">Get Started</a><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)]"><div className="flex flex-col w-full">

<div className="w-full bg-surface-container-high py-2.5 px-4 sm:px-6 lg:px-12">
<div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-on-surface">
<div className="flex items-center gap-2 flex-wrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary text-on-primary">
<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          ENROLLING NOW
        </span>
<span className="text-body-sm font-body-sm font-semibold">August 1st Cohort: 5 of 8 Seats Reserved</span>
<span className="hidden md:inline text-outline-variant">•</span>
<span className="hidden md:inline-flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
          RBI Escrow Protected (14-Day 100% Refundable)
        </span>
</div>
<div className="flex items-center gap-3">
<span className="text-label-sm font-label-sm text-on-surface-variant">Batch Cap: 8 Engineers</span>
<a className="text-label-sm font-label-sm font-semibold text-primary hover:underline" href="#enroll-panel">Claim Seat →</a>
</div>
</div>
</div>

<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-2">
<div className="flex flex-wrap items-center justify-between gap-3">
<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
<a className="hover:text-primary transition-colors" href="#">Home</a>
<span className="text-outline-variant">/</span>
<a className="hover:text-primary transition-colors" href="#">Programs</a>
<span className="text-outline-variant">/</span>
<span className="text-on-surface font-semibold">prg-dist-sys-fellowship-4w</span>
</nav>
<div className="flex items-center gap-2 flex-wrap">
<span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-lg text-label-sm font-label-sm">
<span className="material-symbols-outlined text-[15px] text-primary">lock_clock</span>
          14-Day 100% Escrow Guarantee
        </span>
<span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-lg text-label-sm font-label-sm">
<span className="material-symbols-outlined text-[15px] text-secondary">groups</span>
          Max 8 Mentees/Cohort
        </span>
<span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-1 rounded-lg text-label-sm font-label-sm">
<span className="material-symbols-outlined text-[15px] text-primary">rule</span>
          Google L5/L6 Bar-Raiser Rubrics
        </span>
</div>
</div>
</div>

<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-8 flex flex-col gap-8">

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
<div className="flex flex-wrap items-center gap-2 mb-4">
<span className="px-3 py-1 rounded-full text-label-sm font-label-sm bg-secondary-fixed text-on-secondary-fixed font-semibold tracking-wide">
              FLAGSHIP 4-WEEK CORE FELLOWSHIP • CODE PRG-S06
            </span>
<span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant font-medium">
              Targeting L5 / L6 / Staff Loops
            </span>
</div>
<h1 className="text-display-hero-mobile sm:text-headline-lg font-headline-lg text-on-surface tracking-tight mb-4">
            Distributed Systems &amp; Backend Bar-Raiser Fellowship
          </h1>
<p className="text-body-lg font-body-lg text-on-surface-variant mb-6 leading-relaxed">
            A surgical 4-week cohort for senior engineers, backend leads, and high-growth startup developers targeting L5/L6 staff loops at Google, Uber, Meta, and top tier-1 product engineering teams.
          </p>

<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 bg-surface-container-low p-4 rounded-xl">
<div className="flex flex-col">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Duration</span>
<span className="text-title-md font-title-md text-on-surface mt-0.5">4 Weeks</span>
<span className="text-label-sm font-label-sm text-outline">Aug 1 – Aug 28</span>
</div>
<div className="flex flex-col">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">1:1 Deep Dives</span>
<span className="text-title-md font-title-md text-primary mt-0.5">4 x 60 Min</span>
<span className="text-label-sm font-label-sm text-outline">Live Google Meet</span>
</div>
<div className="flex flex-col">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Async Audits</span>
<span className="text-title-md font-title-md text-secondary mt-0.5">8 Reviews</span>
<span className="text-label-sm font-label-sm text-outline">24h SLA Redlines</span>
</div>
<div className="flex flex-col">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Placement Rate</span>
<span className="text-title-md font-title-md text-on-surface mt-0.5">92%</span>
<span className="text-label-sm font-label-sm text-outline">Tier-1 Shortlist</span>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-4">
<span className="text-label-sm font-label-sm tracking-wider uppercase text-on-surface-variant font-semibold">Lead Fellow &amp; Hiring Bar Raiser</span>
<span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm px-2.5 py-1 rounded-full bg-surface-container text-on-surface">
<span className="w-2 h-2 rounded-full bg-primary"></span>
              Accepting 3 Mentees
            </span>
</div>
<div className="flex flex-col sm:flex-row items-start gap-5">
<div className="relative shrink-0">
<img className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md" data-alt="Professional studio portrait of Vikram Singh, an experienced Indian tech lead and Google Cloud Systems Architect in formal smart casual attire against an architectural indigo and soft gray background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuChPBgfQd-IK671q8O0flV-lwD3gOnd2tSv4hBeKWJXwSwyFoI0F0HULhxa6E79t_3U_VOuj6bvqGxmMDlg-BoZ3KKSjwykMIESsEVkfF8juJ1fvLYiDXnRPucOvViIxgPKKWJQEKyHLEe70QQ1L2zl9EUkSMz6CVtm2CrXdXHGdHQaFtPmmvXqNCsvOdgHpTS6CoV9SKH8oatHh92JYxIRhICbxn4CJloaPeF4mDhGNIfgvZJ1Lusi"/>
<div className="absolute -bottom-2 -right-2 bg-surface-container-lowest p-1 rounded-full shadow">
<span className="material-symbols-outlined text-[20px] text-primary" style={{"fontVariationSettings":"'FILL' 1"}}>verified</span>
</div>
</div>
<div className="flex-1 min-w-0">
<div className="flex flex-wrap items-center gap-2 mb-1">
<h3 className="text-headline-sm font-headline-sm text-on-surface">Vikram Singh</h3>
<span className="text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded font-semibold">Staff L6 @ Google Cloud</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant mb-3">
                Sr. Staff Distributed Systems Engineer @ Google Cloud • ex-Amazon Bar Raiser • ex-Flipkart Core Architecture Lead
              </p>
<div className="flex flex-wrap items-center gap-4 text-label-md font-label-md text-on-surface mb-4">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="font-bold">4.95</span>
<span className="text-outline">(38 Program Reviews)</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-primary">assessment</span>
<span>240+ Loops Evaluated</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-primary">history_edu</span>
<span>11+ Yrs Big Tech</span>
</div>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant bg-surface-container-low p-3.5 rounded-xl mb-4 leading-relaxed">
                "11+ years leading high-throughput distributed engines at Google Cloud. Bar Raiser and hiring committee panelist for 200+ SWE &amp; Staff loops in Bangalore &amp; Mountain View. I evaluate candidates based on deterministic trade-off defense, failure isolation, and real P99 latency discipline."
              </p>
<div className="flex flex-wrap items-center gap-3">
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md font-label-md transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Book 1:1 Discovery Call (15m)
                </button>
<span className="text-label-sm font-label-sm text-outline">Complimentary pre-eval call for applicants</span>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-low p-6 sm:p-8 rounded-2xl relative overflow-hidden">
<div className="flex items-start gap-4">
<div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[28px]">shield</span>
</div>
<div className="flex-1">
<div className="flex flex-wrap items-center gap-2 mb-1">
<h3 className="text-title-md font-title-md text-on-surface font-semibold">14-Day 100% Money-Back Escrow Protocol</h3>
<span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-primary text-on-primary font-bold">RBI Tokenized Rails</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant mb-4">
                Student tuition is never released to the mentor upfront. Your enrollment fee is placed into a regulated RBI-tokenized escrow account and only disbursed upon completion of Week 2 milestone milestones.
              </p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
<div className="bg-surface-container-lowest p-3.5 rounded-xl">
<div className="text-label-sm font-label-sm font-semibold text-primary mb-1">1. ZERO-RISK ONBOARDING</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">Attend Week 1 and Week 2 live 1:1 teardowns and inspect all code artifacts firsthand.</p>
</div>
<div className="bg-surface-container-lowest p-3.5 rounded-xl">
<div className="text-label-sm font-label-sm font-semibold text-primary mb-1">2. ONE-CLICK ESCROW DISPUTE</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">If unsatisfied for any reason, trigger a 1-click refund from your student console before Day 14.</p>
</div>
<div className="bg-surface-container-lowest p-3.5 rounded-xl">
<div className="text-label-sm font-label-sm font-semibold text-primary mb-1">3. T+2 AUTOMATED REVERSAL</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">100% of your funds routed back to your domestic UPI or primary card in 48 banking hours.</p>
</div>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
<div>
<span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold">Rigorous Hands-On Syllabus</span>
<h2 className="text-headline-md font-headline-md text-on-surface mt-1">4-Week Surgical Curriculum</h2>
</div>
<span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full self-start sm:self-auto">
              4 Live Whiteboards • 8 Async Audits
            </span>
</div>
<div className="flex flex-col gap-4" id="curriculum-container">

<div className="curriculum-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-200">
<button className="w-full text-left p-5 flex items-center justify-between gap-4 select-none cursor-pointer" onClick={() => {}} type="button">
<div className="flex items-center gap-3 min-w-0">
<div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-label-md shrink-0">
                    W1
                  </div>
<div className="min-w-0">
<span className="text-label-sm font-label-sm text-primary uppercase font-bold tracking-wider">Week 1 • Foundations &amp; Performance</span>
<h4 className="text-title-md font-title-md text-on-surface truncate">High-Throughput Architecture, Microservices &amp; Latency Budgeting</h4>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 rotate-180">expand_more</span>
</button>
<div className="px-5 pb-5 pt-1 flex flex-col gap-4 text-on-surface">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-outline font-semibold">Core Theory &amp; Systems Primitives</span>
<ul className="mt-2 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>P99 vs P99.9 latency budgets and mitigation of tail latency spikes.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>RPC Transport: gRPC (HTTP/2 multiplexing) vs RESTful payloads.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Distributed Context Tracing (W3C standard &amp; OpenTelemetry specs).</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Edge API gateway topology, TLS termination, and ingress buffering.</li>
</ul>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-secondary font-semibold">Live 1:1 Teardown Focus</span>
<p className="mt-2 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                      Whiteboard teardown of candidate's current production service or architecture case study. Vikram challenges boundary contracts, memory bounds, and latency leakage.
                    </p>
<div className="mt-3 pt-2 bg-surface-container p-2.5 rounded-lg flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
<span className="text-label-sm font-label-sm font-medium">60-Min 1:1 Live Whiteboard Simulation</span>
</div>
</div>
</div>

<div className="bg-surface-container-high p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
<div>
<span className="text-label-sm font-label-sm font-semibold uppercase text-primary">Mandatory Deliverable</span>
<div className="text-body-md font-body-md font-semibold text-on-surface">4-Page System Architecture Diagram, Sequence Specs &amp; Capacity Calculation Sheet</div>
<span className="text-body-sm font-body-sm text-on-surface-variant">Due: Day 7 • Graded via Google L5 Rubric</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg shrink-0">
<span className="text-label-sm font-label-sm text-outline">Grading Weight:</span>
<span className="text-label-sm font-label-sm font-bold text-on-surface">Scalability (30%) • Failure Isolation (25%) • Latency (25%) • Comms (20%)</span>
</div>
</div>
</div>
</div>

<div className="curriculum-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-200">
<button className="w-full text-left p-5 flex items-center justify-between gap-4 select-none cursor-pointer" onClick={() => {}} type="button">
<div className="flex items-center gap-3 min-w-0">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-label-md shrink-0">
                    W2
                  </div>
<div className="min-w-0">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Week 2 • Storage &amp; Consensus</span>
<h4 className="text-title-md font-title-md text-on-surface truncate">Distributed Data Stores, LSM-Trees vs B-Trees &amp; Raft Consensus</h4>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-5 pb-5 pt-1 flex flex-col gap-4 text-on-surface">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-outline font-semibold">Core Theory &amp; Systems Primitives</span>
<ul className="mt-2 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Storage Engine Internals: RocksDB/Cassandra LSM-Tree vs Postgres B+ Trees.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Write-Ahead Logging (WAL) and crash-recovery invariants.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Quorum writes/reads (W + R &gt; N) and CAP theorem tradeoffs under network partitions.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Raft consensus protocol: leader election, log replication &amp; split-brain safety.</li>
</ul>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-secondary font-semibold">Live 1:1 Teardown Focus</span>
<p className="mt-2 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                      Live interactive consensus protocol simulator interrogation. Vikram simulates Byzantine network splits and drops leader packets while you remediate state synchrony.
                    </p>
<div className="mt-3 pt-2 bg-surface-container p-2.5 rounded-lg flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
<span className="text-label-sm font-label-sm font-medium">60-Min 1:1 Protocol Simulator Drill</span>
</div>
</div>
</div>
<div className="bg-surface-container-high p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
<div>
<span className="text-label-sm font-label-sm font-semibold uppercase text-primary">Mandatory Deliverable</span>
<div className="text-body-md font-body-md font-semibold text-on-surface">Benchmarked Distributed Key-Value Store Prototype with Quorum Replication</div>
<span className="text-body-sm font-body-sm text-on-surface-variant">Due: Day 14 • Milestone check for Escrow satisfaction</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg shrink-0">
<span className="text-label-sm font-label-sm text-outline">Grading Weight:</span>
<span className="text-label-sm font-label-sm font-bold text-on-surface">Consistency Proof (35%) • Concurrency Safety (35%) • Code Clarity (30%)</span>
</div>
</div>
</div>
</div>

<div className="curriculum-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-200">
<button className="w-full text-left p-5 flex items-center justify-between gap-4 select-none cursor-pointer" onClick={() => {}} type="button">
<div className="flex items-center gap-3 min-w-0">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-label-md shrink-0">
                    W3
                  </div>
<div className="min-w-0">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Week 3 • Resilience &amp; Scale</span>
<h4 className="text-title-md font-title-md text-on-surface truncate">Fault-Tolerance, Circuit Breakers &amp; 100k QPS Stress Testing</h4>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-5 pb-5 pt-1 flex flex-col gap-4 text-on-surface">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-outline font-semibold">Core Theory &amp; Systems Primitives</span>
<ul className="mt-2 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Resiliency patterns: Bulkheads, thread-pool isolation &amp; exponential jitter backoff.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Distributed Rate Limiting: Token Bucket vs Sliding Window Leaky Bucket with Redis.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Distributed Idempotency Keys across asynchronous worker pipelines.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Kafka event streaming fanout: consumer group rebalancing &amp; partition skew.</li>
</ul>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-secondary font-semibold">Live 1:1 Teardown Focus</span>
<p className="mt-2 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                      Live chaos engineering drill — candidate must debug and recover a crashing multi-region cluster under artificial network partition and cascading database failover.
                    </p>
<div className="mt-3 pt-2 bg-surface-container p-2.5 rounded-lg flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
<span className="text-label-sm font-label-sm font-medium">60-Min 1:1 Live Chaos Recovery Drill</span>
</div>
</div>
</div>
<div className="bg-surface-container-high p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
<div>
<span className="text-label-sm font-label-sm font-semibold uppercase text-primary">Mandatory Deliverable</span>
<div className="text-body-md font-body-md font-semibold text-on-surface">Production Resiliency Audit with Locust/k6 Stress Test Benchmark Report</div>
<span className="text-body-sm font-body-sm text-on-surface-variant">Due: Day 21 • 100k QPS simulation profiling</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg shrink-0">
<span className="text-label-sm font-label-sm text-outline">Grading Weight:</span>
<span className="text-label-sm font-label-sm font-bold text-on-surface">Failure Mitigation (40%) • Throughput Retained (30%) • Observability (30%)</span>
</div>
</div>
</div>
</div>

<div className="curriculum-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-200">
<button className="w-full text-left p-5 flex items-center justify-between gap-4 select-none cursor-pointer" onClick={() => {}} type="button">
<div className="flex items-center gap-3 min-w-0">
<div className="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-label-md shrink-0">
                    W4
                  </div>
<div className="min-w-0">
<span className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Week 4 • Staff Evaluation &amp; Offers</span>
<h4 className="text-title-md font-title-md text-on-surface truncate">Google L5/L6 Bar-Raiser Whiteboard Simulation &amp; Salary Negotiation</h4>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-5 pb-5 pt-1 flex flex-col gap-4 text-on-surface">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-outline font-semibold">Core Theory &amp; Systems Primitives</span>
<ul className="mt-2 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Real 60-minute Google Staff-level whiteboard interview loop under pressure.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Active trade-off defense against a principal bar-raising evaluator.</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Google/Meta Hiring Committee rubric breakdown (Domain Depth, Leadership, Ambiguity).</li>
<li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>Multi-offer compensation leverage playbook for India CM-IN and US loops.</li>
</ul>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<span className="text-label-sm font-label-sm uppercase text-secondary font-semibold">Live 1:1 Teardown Focus</span>
<p className="mt-2 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                      End-to-end unscripted L5/L6 interview simulation followed immediately by an authentic hiring committee calibration debrief and offer negotiation strategy call.
                    </p>
<div className="mt-3 pt-2 bg-surface-container p-2.5 rounded-lg flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
<span className="text-label-sm font-label-sm font-medium">60-Min Full Bar-Raiser Simulation + Packet</span>
</div>
</div>
</div>
<div className="bg-surface-container-high p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
<div>
<span className="text-label-sm font-label-sm font-semibold uppercase text-primary">Mandatory Deliverable</span>
<div className="text-body-md font-body-md font-semibold text-on-surface">Standardized 4-Page Graded Bar-Raiser Rubric Scorecard + Compensation Strategy Script</div>
<span className="text-body-sm font-body-sm text-on-surface-variant">Due: Day 28 • Signed by Google Cloud Staff Evaluator</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg shrink-0">
<span className="text-label-sm font-label-sm text-outline">Grading Weight:</span>
<span className="text-label-sm font-label-sm font-bold text-on-surface">L5/L6 Committee Packet Fit (100%)</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary text-[24px]">tune</span>
<h3 className="text-title-md font-title-md text-on-surface font-semibold">Cohort Prerequisites &amp; Technical Fit Check</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-surface-container-low p-4 rounded-xl">
<span className="text-label-sm font-label-sm font-bold text-primary uppercase">Target Experience</span>
<p className="text-body-sm font-body-sm text-on-surface mt-2 font-medium">SDE-1 with 2+ years exp, SDE-2 targeting Staff, or Backend Leads</p>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Designed for engineers already comfortable with concurrent programming and standard databases.</p>
</div>
<div className="bg-surface-container-low p-4 rounded-xl">
<span className="text-label-sm font-label-sm font-bold text-primary uppercase">Language / Stack</span>
<p className="text-body-sm font-body-sm text-on-surface mt-2 font-medium">Strictly Language-Agnostic</p>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Core concepts evaluate architectural blueprints. Reference implementations provided in Go, Java, Python &amp; C++.</p>
</div>
<div className="bg-surface-container-low p-4 rounded-xl">
<span className="text-label-sm font-label-sm font-bold text-primary uppercase">Time Commitment</span>
<p className="text-body-sm font-body-sm text-on-surface mt-2 font-medium">5–7 Hours Per Week</p>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1">1 hr live 1:1, 4 hrs drill/deliverable construction, 1 hr asynchronous redline review.</p>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm">
<div className="flex flex-wrap items-center justify-between gap-2 mb-6">
<div>
<span className="text-label-sm font-label-sm uppercase tracking-wider text-secondary font-semibold">Verified Career Mobility</span>
<h2 className="text-headline-md font-headline-md text-on-surface mt-1">Alumni Outcomes &amp; Hiring Packet Proof</h2>
</div>
<div className="flex items-center gap-2">
<span className="text-metric-num font-metric-num text-on-surface">4.95</span>
<div className="flex flex-col">
<div className="flex text-secondary">
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">38 Fellowship Graduates</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

<div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<div className="flex text-secondary">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">July 2025</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface mb-4 leading-relaxed">
                  "Vikram's Week 2 distributed consensus drill changed how I defended Raft in my Uber onsite. Got the L4 offer with top-band CTC."
                </p>
</div>
<div className="flex items-center gap-3 pt-3 bg-surface-container-high/40 p-2.5 rounded-lg">
<img className="w-9 h-9 rounded-full object-cover shrink-0" data-alt="Headshot of Ananya S, female software engineer with glasses smiling outdoors in Bangalore technology park" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA69Rr72xvSBp4A1cAqxLWoRTQyjs6pZ9LU1XeA8E5e_7f5mLMFnoV52db7PE6xYCE2rZw7nZOENxu8yRFfbGyZ6Fm_B8au9HuTvrv_Tli-Y8AZaP0VSr1baJX2vcRF8n-f_zgMXwkqoA1WQc0udPU_XlXxb85jOxSOog2H7-yuvCSAxSoQ561KtLHRgmEuWY4nREHjwEaUmZzbqNZ5HsoDsroTwT0NKwcJwb8ULUF10cwI-LOYiU7O"/>
<div className="min-w-0">
<div className="text-label-md font-label-md font-semibold text-on-surface truncate">Ananya S.</div>
<div className="text-label-sm font-label-sm text-on-surface-variant truncate">SDE-2 at Uber</div>
</div>
</div>
</div>

<div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<div className="flex text-secondary">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">June 2025</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface mb-4 leading-relaxed">
                  "The 4-page rubric delivered after Week 4 was exact to the Google hiring committee packet. Worth 10x the enrollment fee."
                </p>
</div>
<div className="flex items-center gap-3 pt-3 bg-surface-container-high/40 p-2.5 rounded-lg">
<img className="w-9 h-9 rounded-full object-cover shrink-0" data-alt="Headshot of Karthik R, male engineering lead with clean beard in office setting with warm ambient lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6rZNXJR5VriEFMlC-EE82-LEeesowu8iWsDDoLfGB0IOcoQiCbHP-bF9AI-jYXgRGkXPMyXrJVuqMgPpAEanhSN1IZJNoorEZXXhO1z5Rdb3k8AwlqiNPUqFgYCS_RuW2M4-h60F3Lfy6OWa6o3CGjjSCNAyQ1oIM_CquA1tq1-j0B7p8qn-h7v6BzRjHRhRcjy4iarEFbUtd9oQWsBrVcG8hVlwBSIFyjG9BRwGVDKSCkUS_naPH"/>
<div className="min-w-0">
<div className="text-label-md font-label-md font-semibold text-on-surface truncate">Karthik R.</div>
<div className="text-label-sm font-label-sm text-on-surface-variant truncate">L5 at Google</div>
</div>
</div>
</div>

<div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<div className="flex text-secondary">
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="material-symbols-outlined text-[15px]" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
</div>
<span className="text-label-sm font-label-sm text-outline">May 2025</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface mb-4 leading-relaxed">
                  "The latency budgeting and LSM-tree modules were game-changers for my principal architect round. Highest signal cohort out there."
                </p>
</div>
<div className="flex items-center gap-3 pt-3 bg-surface-container-high/40 p-2.5 rounded-lg">
<img className="w-9 h-9 rounded-full object-cover shrink-0" data-alt="Headshot of Siddharth M, senior fintech engineering architect with headphone collar in modern software workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvyRceoqblTfICX6LFJACxMsexOKSpaPxZcZXwNnvSIX32W19TPHwFY1YYcR-eonn1dI8pgP7n9kpObApfKq7mM63mx8i15A4iGZK1oUCV17Cap1hP9dvkBmwZC9t8sHlDQpwfjzK5sragtZKIIujqUKuTJIHX-GEIr9P9xVQbDnYe2QZuztQbRQyrymuRoJ81Lh59nXZHmlCKVdVHx6ysX9gHykaFIVlU4qXT8xr17IkrALjFkhYK"/>
<div className="min-w-0">
<div className="text-label-md font-label-md font-semibold text-on-surface truncate">Siddharth M.</div>
<div className="text-label-sm font-label-sm text-on-surface-variant truncate">Staff at Razorpay</div>
</div>
</div>
</div>
</div>
</section>

<section className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm mb-6">
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-6">Frequently Asked Questions</h3>
<div className="flex flex-col gap-3">
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<button className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-title-md text-on-surface select-none cursor-pointer" onClick={() => {}} type="button">
<span>What happens if I miss a scheduled live 1:1 session?</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-4 pb-4 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                You can reschedule any 1:1 session with at least 12 hours notice via Vikram's direct scheduling dashboard. If an unavoidable conflict occurs on short notice, Vikram provides a bespoke 20-minute video architecture audit of your codebase and deliverable in place of the live session.
              </div>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<button className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-title-md text-on-surface select-none cursor-pointer" onClick={() => {}} type="button">
<span>How does the 14-day 100% money-back escrow refund work?</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-4 pb-4 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                Your tuition stays held in DreamX's RBI-regulated tokenized escrow. You attend Week 1 and Week 2 live sessions. If you feel this fellowship isn't accelerating your Staff-level interview readiness, hit the "Request Escrow Release Refund" button in your dashboard prior to Day 14. 100% of your payment is returned automatically to your domestic UPI or payment card within 48 hours. No phone calls or retention hurdles.
              </div>
</div>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<button className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-title-md text-on-surface select-none cursor-pointer" onClick={() => {}} type="button">
<span>Can my company or employer sponsor this fellowship?</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200">expand_more</span>
</button>
<div className="hidden px-4 pb-4 text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                Yes. Over 60% of our fellows reimburse this through corporate L&amp;D (Learning &amp; Development) allowances. We provide an automated GST-compliant tax invoice along with an official Curriculum Syllabus packet formatted specifically for enterprise finance approval.
              </div>
</div>
</div>
</section>
</div>

<aside className="lg:col-span-4 sticky top-20 flex flex-col gap-6" id="enroll-panel">
<div className="bg-surface-container-lowest p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-hidden">

<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

<div className="flex items-center justify-between mb-4 pt-1">
<span className="text-label-sm font-label-sm font-bold text-primary uppercase">Cohort PRG-S06</span>
<span className="inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold text-error bg-error-container/40 px-2 py-0.5 rounded-full">
<span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              3 Seats Remaining
            </span>
</div>
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">August 1 – August 28, 2025</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-4">
            Next 4-week cohort commencing Friday, Aug 1. Applications reviewed within 4 hours.
          </p>

<div className="w-full bg-surface-container-high rounded-full h-2 mb-2 overflow-hidden">
<div className="bg-primary h-2 rounded-full w-[62.5%] transition-all duration-500"></div>
</div>
<div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant mb-6">
<span>5 of 8 seats filled</span>
<span className="font-semibold text-on-surface">62% Capacity</span>
</div>

<div className="bg-surface-container-low p-4 rounded-xl mb-6">
<div className="flex items-baseline justify-between">
<div>
<span className="text-label-sm font-label-sm text-outline uppercase">Cohort Tuition</span>
<div className="flex items-baseline gap-2">
<span className="text-metric-num font-metric-num text-on-surface">₹2,499</span>
<span className="text-body-sm font-body-sm text-outline line-through">₹4,999</span>
</div>
</div>
<span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm font-bold">50% OFF</span>
</div>
<div className="mt-3 pt-3 bg-surface-container-high/40 p-2.5 rounded-lg flex items-center justify-between">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-secondary">stars</span>
<span className="text-label-sm font-label-sm font-medium">Pro Member Price:</span>
</div>
<span className="text-label-md font-label-md font-bold text-primary">₹2,249 <span className="text-outline font-normal">(-10%)</span></span>
</div>
<div className="mt-2 text-center">
<span className="text-label-sm font-label-sm text-on-surface-variant">Or ₹833/mo (3 No-Cost EMIs via Razorpay)</span>
</div>
</div>

<div className="mb-6 space-y-2.5">
<span className="text-label-sm font-label-sm font-semibold uppercase text-outline tracking-wider">What's Included</span>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
<span><strong>4 x 60-Min</strong> Live 1:1 Video Teardowns with Vikram</span>
</div>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
<span><strong>8 Async Architectural Audits</strong> with 24h SLA</span>
</div>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
<span>Private direct chat bridge for ad-hoc debugging</span>
</div>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
<span>DreamX 4-Page Standardized Bar-Raiser Rubrics</span>
</div>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
<span>Lifetime access to cohort whiteboards &amp; recordings</span>
</div>
<div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">trending_up</span>
<span><strong>+1.4 Avg Boost</strong> to DreamX Career Mobility Score</span>
</div>
</div>

<button className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md transition-all duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-3 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[20px]">bolt</span>
<span>Enroll in August Cohort — ₹2,499</span>
</button>

<button className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">workspace_premium</span>
<span>Apply with Pro Membership (-₹250)</span>
</button>

<div className="pt-4 bg-surface-container-low p-3 rounded-xl flex flex-col gap-2">
<div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                14-Day Escrow Protected
              </span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                256-Bit SSL
              </span>
</div>
<div className="text-label-sm font-label-sm text-outline text-center">
              Gateway: RBI Tokenized UPI Rail • Razorpay Secure Node
            </div>
</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">download_for_offline</span>
</div>
<div>
<div className="text-label-md font-label-md font-semibold text-on-surface">Download Syllabus PDF</div>
<div className="text-label-sm font-label-sm text-on-surface-variant">12-Page Full Rubrics &amp; Timeline</div>
</div>
</div>
<button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-label-sm font-label-sm font-semibold text-on-surface transition-colors" type="button">
            Get PDF
          </button>
</div>
</aside>
</div>
</div>


</div></main><footer className="w-full bg-surface-container-low mt-space-xl"><div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-lg mb-space-xl"><div className="lg:col-span-1"><div className="flex items-center gap-space-xs mb-space-sm"><div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">rocket_launch</span></div><span className="font-title-md text-title-md text-on-surface font-bold">Dream<span className="text-primary">X</span></span></div><p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Career mobility platform combining surgical diagnostics, vetted growth programs, and elite mentor networks.</p><div className="flex flex-col gap-space-xs"><div className="flex items-center gap-space-xs text-on-surface-variant"><span className="material-symbols-outlined text-primary text-[18px]">verified_user</span><span className="font-label-sm text-label-sm font-semibold text-on-surface">SOC-2 Type II Certified</span></div><div className="flex items-center gap-space-xs text-on-surface-variant"><span className="material-symbols-outlined text-primary text-[18px]">lock</span><span className="font-label-sm text-label-sm font-semibold text-on-surface">256-Bit SSL Encrypted</span></div></div></div><div><h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-semibold">Marketplace</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="discover-goals" href="#">Career Diagnostic Tracks</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="browse-mentors" href="#">Executive Coaching</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="search-marketplace" href="#">Skill Gap Assessments</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="services" href="#">Portfolio Reviews</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="services" href="#">Interview Simulation</a></li></ul></div><div><h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-semibold">Programs &amp; Growth</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">Structured Fellowships</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">Outcome Accelerators</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="pricing-memberships" href="#">Corporate Upskilling</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">Leadership Cohorts</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="pricing-memberships" href="#">Enterprise Invoicing</a></li></ul></div><div><h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-semibold">Regional Gateways</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm text-on-surface font-medium"><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>South Asia (CM-IN ₹)</li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">North America (CM-US $)</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">European Union (CM-EU €)</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">Southeast Asia (CM-SG S$)</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="programs" href="#">Middle East (CM-AE AED)</a></li></ul></div><div><h4 className="font-title-md text-title-md text-on-surface mb-space-sm font-semibold">Legal &amp; Compliance</h4><ul className="flex flex-col gap-space-xs"><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="privacy-policy" href="#">Privacy &amp; Data Governance</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="terms-of-service" href="#">Terms of Service</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="compliance" href="#">RBI Tokenization Standards</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="compliance" href="#">Refund &amp; Outcomes Guarantee</a></li><li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"><a data-path="security" href="#">Security &amp; Audits</a></li></ul></div></div><div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm"><div className="flex items-center gap-space-xs flex-wrap"><span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">Gateway Node: CM-IN</span><span className="font-body-sm text-body-sm text-on-surface-variant">Settlements routed via RBI Tokenized Rail &amp; Domestic UPI Protocols</span></div><div className="font-body-sm text-body-sm text-on-surface-variant">© 2025 DreamX Career Technologies Inc. All rights reserved.</div></div></div></footer>
    </>
  );
}
