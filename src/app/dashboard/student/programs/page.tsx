
import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto"><div className="flex flex-col"><div className="h-16 px-space-lg flex items-center justify-between"><div className="flex items-center gap-space-sm"><div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span></div><div className="flex flex-col"><span className="font-title-md text-title-md font-bold text-on-surface leading-tight tracking-tight">DreamX</span><span className="font-label-sm text-label-sm text-tertiary tracking-wide uppercase font-semibold">Student Portal</span></div></div><button className="p-space-xs text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">dock_to_left</span></button></div><div className="px-space-md py-space-sm"><nav className="flex flex-col gap-1" data-active-classes="bg-primary-container text-on-primary-container font-semibold"><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="student-home" href="#"><span className="material-symbols-outlined text-[20px]">home</span><span>Home</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="discover-goals" href="#"><span className="material-symbols-outlined text-[20px]">explore</span><span>Discover Goals</span></a><div className="pt-2 pb-1"><div className="flex items-center justify-between px-space-md py-1.5 text-on-surface-variant"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-[20px]">event_available</span><span className="font-body-md text-body-md font-medium">Services &amp; Bookings</span></div><span className="material-symbols-outlined text-[16px]">expand_more</span></div><div className="ml-6 pl-space-sm flex flex-col gap-0.5 mt-1"><a className="flex items-center px-space-md py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="active-bookings" href="#">Active Bookings</a><a className="flex items-center px-space-md py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="smart-requests-offers" href="#">Smart Requests &amp; Offers</a></div></div><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="programs-cohorts" href="#"><span className="material-symbols-outlined text-[20px]">groups</span><span>Programs &amp; Cohorts</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="career-journey" href="#"><span className="material-symbols-outlined text-[20px]">alt_route</span><span>Career Journey Roadmap</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="readiness-score" href="#"><span className="material-symbols-outlined text-[20px]">speed</span><span>Career Readiness Score</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="ai-assistant" href="#"><span className="material-symbols-outlined text-[20px]">neurology</span><span>AI Assistant &amp; Recomms</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="deliverables-reports" href="#"><span className="material-symbols-outlined text-[20px]">description</span><span>Deliverables &amp; Reports</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="membership-billing" href="#"><span className="material-symbols-outlined text-[20px]">credit_card</span><span>Membership &amp; Billing</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="settings" href="#"><span className="material-symbols-outlined text-[20px]">settings</span><span>Settings</span></a></nav></div></div><div className="p-space-md flex flex-col gap-space-sm"><div className="p-space-md rounded-xl bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-xs"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">Pro Plan</span><span className="font-label-sm text-label-sm text-tertiary">Active</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">100 Monthly AI Credits • Renews Aug 1</p><button className="mt-space-xs w-full py-1.5 px-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors shadow-sm" type="button">Upgrade to Elite</button></div><div className="flex items-center justify-between px-space-sm py-space-xs"><button className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">swap_horiz</span><span>Switch Portal</span></button><button className="flex items-center gap-space-xs text-on-surface-variant hover:text-error font-body-sm text-body-sm transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">logout</span><span>Log out</span></button></div></div></aside><div className="pl-72"><header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><button className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">menu_open</span></button><div className="flex items-center gap-space-xs font-body-sm text-body-sm"><span className="text-tertiary">Dashboard</span><span className="text-tertiary">/</span><span className="text-on-surface font-medium">Student Home</span></div></div><div className="flex items-center gap-space-md"><button className="flex items-center gap-space-sm px-space-md py-1.5 rounded-lg bg-surface-container-lowest shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[18px] text-primary">search</span><span className="font-body-sm text-body-sm text-on-surface-variant">⌘K AI Search</span></button><div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary">public</span><span>Target: CM-IN (India Tech) • IST</span></div><div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md"><span className="font-medium">⚡ 47 AI Credits</span><button className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary-container transition-colors" type="button"><span className="material-symbols-outlined text-[14px]">add</span></button></div><button className="relative p-space-xs text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[22px]">notifications</span><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span></button><div className="flex items-center gap-space-sm pl-space-xs"><div className="flex flex-col text-right hidden sm:flex"><div className="flex items-center gap-space-xs justify-end"><span className="font-title-md text-body-md font-semibold text-on-surface leading-none">Ananya S.</span><span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold">PRO</span></div><span className="font-label-sm text-label-sm text-tertiary">3rd Yr CS @ IIT Delhi</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 px-gutter bg-surface min-h-screen"><div className="flex flex-col w-full">


<div className="pt-6 pb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
<div className="flex flex-col gap-2 max-w-3xl">
<div className="flex items-center gap-3 flex-wrap">
<span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
          Active Fellowship Enrolled
        </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-medium">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          1 Active Fellowship • 2 Completed
        </span>
</div>
<h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
        Programs &amp; Cohorts
      </h1>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        Track multi-week structured cohorts, submit weekly milestone deliverables, review mentor check-ins, and access verifiable graduation credentials.
      </p>
</div>

<div className="flex items-center gap-3 flex-wrap">
<a className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-title-md text-title-md font-semibold hover:bg-surface-container-low transition-colors shadow-sm" href="#">
<span className="material-symbols-outlined text-[18px] text-tertiary">school</span>
<span>Academic Transcript</span>
</a>
<a className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-title-md text-title-md font-semibold hover:bg-primary-container transition-all shadow-sm hover:shadow-md" href="#">
<span>Explore Programs Catalog</span>
<span className="material-symbols-outlined text-[18px]">north_east</span>
</a>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

<div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">Active Cohort</span>
<div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[18px]">pace</span>
</div>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-metric-num text-metric-num text-on-surface">Week 2</span>
<span className="font-body-sm text-body-sm text-tertiary">of 4 (50%)</span>
</div>
<p className="font-label-md text-label-md font-medium text-primary mt-1 truncate">
          Distributed Systems Fellowship
        </p>
</div>
<div className="mt-4 pt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px] text-secondary">videocam</span>
          Next Sync: Sat, 6:00 PM IST
        </span>
<span className="font-semibold text-secondary">48h</span>
</div>
</div>

<div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">Milestones Completed</span>
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
</div>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-metric-num text-metric-num text-on-surface">9</span>
<span className="font-body-sm text-body-sm text-tertiary">of 12 Total</span>
</div>
<div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2.5 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{"width":"75%"}}></div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<span>Submission Discipline</span>
<span className="font-semibold text-primary">100% On-time</span>
</div>
</div>

<div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">Credentials Issued</span>
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
</div>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-metric-num text-metric-num text-on-surface">2 Certs</span>
<span className="font-body-sm text-body-sm text-tertiary">Issued</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">
          Polygon Ledger &amp; LinkedIn Verified
        </p>
</div>
<div className="mt-4 pt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<span>Graduation Portfolio</span>
<span className="font-semibold text-on-surface">Tier-1 Ready</span>
</div>
</div>

<div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">Outcome Guarantee</span>
<div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
</div>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-metric-num text-metric-num text-secondary">4 Days</span>
<span className="font-body-sm text-body-sm text-tertiary">Remaining</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">
          14-Day 100% Refund Escrow
        </p>
</div>
<div className="mt-4 pt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<span className="text-tertiary">Status</span>
<span className="font-semibold text-secondary">Protected Escrow</span>
</div>
</div>
</div>

<div className="flex items-center gap-2 mb-6 p-1 rounded-xl bg-surface-container-low w-fit max-w-full overflow-x-auto shadow-sm">
<button className="px-5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-title-md text-title-md font-semibold shadow-sm transition-all flex items-center gap-2" type="button">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span>Active Fellowships (1)</span>
</button>
<button className="px-5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium transition-colors flex items-center gap-2" type="button">
<span>Completed Programs (2)</span>
</button>
<button className="px-5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-body-md text-body-md font-medium transition-colors flex items-center gap-2" type="button">
<span>Archived &amp; Waitlisted (1)</span>
</button>
</div>

<div className="mb-10 rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden">

<div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
<div className="p-6 lg:p-8 flex flex-col gap-8">

<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 bg-surface-container-lowest">
<div className="flex flex-col gap-3">
<div className="flex items-center gap-2.5 flex-wrap">
<span className="px-3 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              Cohort #COHORT-2026-DIST-04
            </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
              4-Week Intensive Cohort
            </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
              Live Whiteboard Capstone
            </span>
</div>
<h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Distributed Systems &amp; Backend Bar-Raiser Fellowship
          </h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Master production-grade distributed consensus, high-throughput RPC pipelines, fault tolerance, and live Google bar-raiser systems design rounds with real Silicon Valley principals.
          </p>

<div className="flex items-center gap-3 pt-1">
<span className="font-label-sm text-label-sm text-tertiary uppercase font-medium">Cohort Peers (6):</span>
<div className="flex items-center -space-x-2">
<div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm" title="Karthik R. (IITB)">KR</div>
<div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm" title="Priya M. (BITS)">PM</div>
<div className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm" title="Rohan D. (IITD)">RD</div>
<div className="w-7 h-7 rounded-full bg-surface-container-high text-tertiary flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm" title="Sneha T. (IIIT-H)">ST</div>
<div className="w-7 h-7 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-bold shadow-sm">+2</div>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant font-medium ml-1">Ananya Sharma (You) &amp; 5 Peers</span>
</div>
</div>

<div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3 min-w-[280px] shadow-sm">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary">Lead Bar-Raiser Mentor</span>
<span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">1:1 Check-in Lead</span>
</div>
<div className="flex items-center gap-3">
<img className="w-12 h-12 rounded-xl object-cover shadow-sm" data-alt="Professional studio portrait of Vikram Singh, a senior Indian software engineer in his mid-30s with crisp eyeglasses, navy blazer, clean ambient light with subtle indigo gradients, confident friendly demeanor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_xOOmC_0D81dEXhCct-YqTTzbUbD4QtND4GZuHdNZqcdtQzs20HmMNaJ2fE3hP-XNpg2YFfbwqPjnF_zdLeg4oY84X-XZ8xRVDZ8Ahd3Pz2bO1LmKIDTzHjXYQSBdcttFdCb8BTs40TxdzvS9ztiHsJ5xdDQxst5Brld2adD95T1FUy7tQ8B5geKakwPWJJH6bQ5Hv5rfH0XXaSPOqJ-cx25ZnW2j3ZH-IErAKt2oam8fGlGa9GEW"/>
<div className="flex flex-col">
<span className="font-title-md text-title-md font-bold text-on-surface">Vikram Singh</span>
<span className="font-body-sm text-body-sm text-tertiary">Senior AI Engineer @ Google Cloud</span>
<span className="font-label-sm text-label-sm text-secondary font-medium">Ex-Amazon Bar Raiser (L6)</span>
</div>
</div>
<button className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">chat_bubble</span>
<span>Message Lead Mentor</span>
</button>
</div>
</div>

<div className="flex flex-col gap-4">
<div className="flex items-center justify-between flex-wrap gap-2">
<div className="flex items-center gap-2">
<span className="font-title-md text-title-md font-bold text-on-surface">Fellowship Milestones &amp; Progression</span>
<span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">50% Completed</span>
</div>
<span className="font-body-sm text-body-sm text-tertiary">Next Synchronous Whiteboard: Saturday, 6:00 PM IST (ISTCM Cohort Slot)</span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

<div className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between gap-3">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Week 1</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
              </span>
</div>
<div>
<h4 className="font-title-md text-body-md font-bold text-on-surface">Core Algorithms &amp; Concurrency</h4>
<p className="font-body-sm text-body-sm text-tertiary mt-1">Multi-threaded ring buffer &amp; lock-free queue in Go/C++</p>
</div>
<div className="pt-2 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span className="font-semibold text-primary">Score: 4.9 / 5.0</span>
<a className="text-secondary hover:underline flex items-center gap-0.5 font-medium" href="#">
<span>Artifact PDF</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</div>
</div>

<div className="p-4 rounded-xl bg-primary text-on-primary shadow-md flex flex-col justify-between gap-3 relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-bold text-primary-fixed">Week 2 • CURRENT</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold animate-pulse">
                In Review Prep
              </span>
</div>
<div>
<h4 className="font-title-md text-body-md font-bold text-on-primary">Distributed Storage &amp; Raft</h4>
<p className="font-body-sm text-body-sm text-primary-fixed mt-1">Consensus leader election &amp; log replication engine</p>
</div>
<div className="pt-2 flex items-center justify-between text-primary-fixed font-label-sm text-label-sm">
<span className="font-semibold text-on-primary">Due in 3 Days (Jul 29)</span>
<span className="bg-secondary px-2 py-0.5 rounded text-on-secondary font-bold">Draft v1 Up</span>
</div>
</div>

<div className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between gap-3 opacity-80">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-bold text-tertiary">Week 3</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm font-medium">
<span className="material-symbols-outlined text-[14px]">lock</span> Locked
              </span>
</div>
<div>
<h4 className="font-title-md text-body-md font-bold text-on-surface">High-Throughput System Design</h4>
<p className="font-body-sm text-body-sm text-tertiary mt-1">Designing petabyte scale CDC pipelines &amp; write-ahead caches</p>
</div>
<div className="pt-2 flex items-center justify-between text-tertiary font-label-sm text-label-sm">
<span>Unlocks Aug 1, 2026</span>
<span>Milestone 3</span>
</div>
</div>

<div className="p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between gap-3 opacity-80">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-bold text-tertiary">Week 4</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm font-medium">
<span className="material-symbols-outlined text-[14px]">lock</span> Final
              </span>
</div>
<div>
<h4 className="font-title-md text-body-md font-bold text-on-surface">Google Bar-Raiser Simulation</h4>
<p className="font-body-sm text-body-sm text-tertiary mt-1">Live 60-min blind technical bar-raiser &amp; offer negotiation</p>
</div>
<div className="pt-2 flex items-center justify-between text-tertiary font-label-sm text-label-sm">
<span>Unlocks Aug 8, 2026</span>
<span>Certificate Capstone</span>
</div>
</div>
</div>
</div>

<div className="p-6 rounded-xl bg-surface-container-low shadow-inner flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
<div className="flex flex-col gap-2 max-w-2xl">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<span className="font-title-md text-title-md font-bold text-on-surface">Current Milestone Objective: Milestone 2 Raft Architecture</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
            Implement a fault-tolerant Raft consensus leader election and log replication module with simulated network partition recovery. Submit code repo and benchmark test traces.
          </p>
<div className="flex items-center gap-3 pt-2">
<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm font-body-sm text-body-sm text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary">folder_zip</span>
<span className="font-medium">raft_consensus_benchmark_v1.zip</span>
<span className="text-tertiary font-label-sm text-label-sm">(14.2 MB)</span>
</div>
<button className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold underline underline-offset-2" type="button">
              Replace Draft
            </button>
</div>
</div>
<div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 w-full lg:w-auto">
<a className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-title-md text-title-md font-semibold text-center shadow-sm" href="#">
            View Rubric &amp; Specs
          </a>
<button className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-title-md text-title-md font-semibold text-center shadow-sm flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px]">publish</span>
<span>Submit Milestone 2</span>
</button>
<a className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container transition-all font-title-md text-title-md font-semibold text-center shadow-sm flex items-center justify-center gap-2" href="#">
<span className="material-symbols-outlined text-[18px]">co_present</span>
<span>Enter Live Cohort Room</span>
</a>
</div>
</div>

<div className="p-4 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">verified_user</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md font-bold leading-tight">14-Day 100% Money-Back Outcome Guarantee Active</span>
<span className="font-body-sm text-body-sm opacity-90">
              You have 4 days remaining in your trial period. If unsatisfied with mentor check-in quality or cohort caliber, claim an instant full refund to your original payment method.
            </span>
</div>
</div>
<button className="px-4 py-2 rounded-lg bg-surface-container-lowest text-secondary font-label-md text-label-md font-bold hover:bg-surface-bright transition-colors whitespace-nowrap shadow-sm self-start sm:self-auto" type="button">
          Review Escrow Terms
        </button>
</div>
</div>
</div>

<div className="flex flex-col gap-6 mb-10">
<div className="flex items-center justify-between">
<div className="flex flex-col">
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Completed Fellowships &amp; Verifiable Credentials</h3>
<p className="font-body-sm text-body-sm text-tertiary">Cryptographically signed graduation credentials stored on polygon blockchain and recognized by top engineering hiring teams.</p>
</div>
<button className="hidden sm:flex items-center gap-1.5 text-primary font-label-md text-label-md font-semibold hover:underline" type="button">
<span>Public Credential Vault</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

<div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between gap-6">
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<span className="px-2.5 py-1 rounded bg-surface-container text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
              2-Week Sprint • Completed June 2026
            </span>
<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[14px]">workspace_premium</span>
              Grade: 96% Distinction
            </span>
</div>
<div className="flex flex-col">
<h4 className="font-title-md text-headline-sm font-bold text-on-surface">Algorithmic Problem Solving &amp; DP Sprint</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Mastery over recursive memoization, interval DP, bitmask dynamic programming, and amortized complexity analysis for Tier-1 coding bars.
            </p>
</div>

<div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
<div className="flex items-center gap-3">
<img className="w-10 h-10 rounded-lg object-cover shadow-sm" data-alt="Corporate headshot of Rohan Verma, Indian male engineering manager with dark hair, glasses, wearing a slate grey shirt against a modern tech office background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaLgMwjnot1_c2HYRQE15uMqu4DoXG5PUDEFe8ycRUrH7filMVR-Nto0uBRkrHTCRGjOpZYLfOGiH0u4klUsqjV3KkJ3wNUQFP0Y-sga5LlZhqQIiyZH40Bey3lQqxtvDt2sS2V026UaNBANlVVkcn83h6yGZcxkRCI7YVekdc6Rne8sZz9HdDli5exc5usqQltJRA2YaP_g-4ijDXAtziBc3366JZ8_pxbhrv5rrQ5FSt57CMqEh1"/>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Rohan Verma</span>
<span className="font-label-sm text-label-sm text-tertiary">Sr. Engineering Manager @ Amazon</span>
</div>
</div>
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm text-tertiary font-mono">DX-CERT-2026-88921</span>
<span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1 justify-end">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Polygon Verified
              </span>
</div>
</div>
</div>

<div className="flex items-center gap-3 pt-2">
<button className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px]">download</span>
<span>Download Certificate (PDF)</span>
</button>
<button className="py-2 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px] text-primary">share</span>
<span>Add to LinkedIn</span>
</button>
<button className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors" title="View Milestone Archive" type="button">
<span className="material-symbols-outlined text-[20px]">folder</span>
</button>
</div>
</div>

<div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between gap-6">
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<span className="px-2.5 py-1 rounded bg-surface-container text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider">
              2-Week Sprint • Completed May 2026
            </span>
<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-secondary text-[14px]">workspace_premium</span>
              Grade: 94% (ATS 92/100)
            </span>
</div>
<div className="flex flex-col">
<h4 className="font-title-md text-headline-sm font-bold text-on-surface">Big Tech Resume Overhaul &amp; Branding Sprint</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              End-to-end transformation of tech resumes, LinkedIn profile optimization, GitHub project framing, and personal narrative alignment for high-tier referrals.
            </p>
</div>

<div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
<div className="flex items-center gap-3">
<img className="w-10 h-10 rounded-lg object-cover shadow-sm" data-alt="Portrait of Devika Rao, an Indian female tech leader in her late 30s with warm confident smile, elegant casual professional attire, studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbctst0Kq4Brn3REDAcOcIZ2mgjVRm8KCas_o3Re--SzFYotzDSYFboLkeYTuCEx4oH-IeuavD76PjF4GXgF6_gBEZQT2oBL6Y9A_fPVDAeogqvmIlrvfwziljjZNddOTlP3XYxJDKd3jAfWy3jHpdyHNzMcxw0UoXz50Ab9ms1IeVpHf7LTUYCTZuO_Ywy1IyKsNeGpOB_qcltxCqc3ekbJVFDjK6NEH40xG-al9b1s9nb19_cAKv"/>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Devika Rao</span>
<span className="font-label-sm text-label-sm text-tertiary">Principal Cloud Architect @ Scaleup</span>
</div>
</div>
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm text-tertiary font-mono">DX-CERT-2026-77402</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1 justify-end">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Polygon Verified
              </span>
</div>
</div>
</div>

<div className="flex items-center gap-3 pt-2">
<button className="flex-1 py-2 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors shadow-sm flex items-center justify-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">download</span>
<span>Download Certificate (PDF)</span>
</button>
<button className="py-2 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px] text-secondary">inventory_2</span>
<span>View Deliverables Archive</span>
</button>
<button className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors" title="View Milestone Archive" type="button">
<span className="material-symbols-outlined text-[20px]">share</span>
</button>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

<div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center flex-shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[28px] text-primary">support_agent</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<h4 className="font-title-md text-title-md font-bold text-on-surface">Need 1:1 Live Debugging on Milestone 2?</h4>
<span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">Pro Included</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Book an ad-hoc 30-min whiteboarding slot with lead mentor Vikram Singh or a fellow Google alum to unblock your Raft consensus edge cases before Saturday’s submission deadline.
          </p>
</div>
</div>
<button className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-semibold hover:bg-primary-container transition-all whitespace-nowrap shadow-sm" type="button">
        Book 30-Min Office Hour
      </button>
</div>

<div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-tertiary">Tuition &amp; Reimbursement</span>
<span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md font-bold text-on-surface">Employer Sponsorship Invoicing</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Download tax-compliant GST invoices or request university academic sponsorship verification documents.
        </p>
</div>
<div className="flex items-center justify-between pt-2">
<a className="font-label-md text-label-md font-semibold text-primary hover:underline flex items-center gap-1" href="#">
<span>Download GST Invoices</span>
<span className="material-symbols-outlined text-[16px]">file_download</span>
</a>
<span className="font-label-sm text-label-sm text-tertiary">IIT Delhi Partner Code</span>
</div>
</div>
</div>
</div></main></div>
    </>
  );
}
