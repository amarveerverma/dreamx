
import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto"><div className="flex flex-col"><div className="h-16 px-space-lg flex items-center justify-between"><div className="flex items-center gap-space-sm"><div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span></div><div className="flex flex-col"><span className="font-title-md text-title-md font-bold text-on-surface leading-tight tracking-tight">DreamX</span><span className="font-label-sm text-label-sm text-tertiary tracking-wide uppercase font-semibold">Student Portal</span></div></div><button className="p-space-xs text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">dock_to_left</span></button></div><div className="px-space-md py-space-sm"><nav className="flex flex-col gap-1" data-active-classes="bg-primary-container text-on-primary-container font-semibold"><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="student-home" href="#"><span className="material-symbols-outlined text-[20px]">home</span><span>Home</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="discover-goals" href="#"><span className="material-symbols-outlined text-[20px]">explore</span><span>Discover Goals</span></a><div className="pt-2 pb-1"><div className="flex items-center justify-between px-space-md py-1.5 text-on-surface-variant"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-[20px]">event_available</span><span className="font-body-md text-body-md font-medium">Services &amp; Bookings</span></div><span className="material-symbols-outlined text-[16px]">expand_more</span></div><div className="ml-6 pl-space-sm flex flex-col gap-0.5 mt-1"><a className="flex items-center px-space-md py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="active-bookings" href="#">Active Bookings</a><a className="flex items-center px-space-md py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-sm text-body-sm" data-path="smart-requests-offers" href="#">Smart Requests &amp; Offers</a></div></div><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="programs-cohorts" href="#"><span className="material-symbols-outlined text-[20px]">groups</span><span>Programs &amp; Cohorts</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="career-journey" href="#"><span className="material-symbols-outlined text-[20px]">alt_route</span><span>Career Journey Roadmap</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="readiness-score" href="#"><span className="material-symbols-outlined text-[20px]">speed</span><span>Career Readiness Score</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="ai-assistant" href="#"><span className="material-symbols-outlined text-[20px]">neurology</span><span>AI Assistant &amp; Recomms</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="deliverables-reports" href="#"><span className="material-symbols-outlined text-[20px]">description</span><span>Deliverables &amp; Reports</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="membership-billing" href="#"><span className="material-symbols-outlined text-[20px]">credit_card</span><span>Membership &amp; Billing</span></a><a className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md" data-path="settings" href="#"><span className="material-symbols-outlined text-[20px]">settings</span><span>Settings</span></a></nav></div></div><div className="p-space-md flex flex-col gap-space-sm"><div className="p-space-md rounded-xl bg-surface-container-low shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col gap-space-xs"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">Pro Plan</span><span className="font-label-sm text-label-sm text-tertiary">Active</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">100 Monthly AI Credits • Renews Aug 1</p><button className="mt-space-xs w-full py-1.5 px-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors shadow-sm" type="button">Upgrade to Elite</button></div><div className="flex items-center justify-between px-space-sm py-space-xs"><button className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">swap_horiz</span><span>Switch Portal</span></button><button className="flex items-center gap-space-xs text-on-surface-variant hover:text-error font-body-sm text-body-sm transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">logout</span><span>Log out</span></button></div></div></aside><div className="pl-72"><header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><button className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">menu_open</span></button><div className="flex items-center gap-space-xs font-body-sm text-body-sm"><span className="text-tertiary">Dashboard</span><span className="text-tertiary">/</span><span className="text-on-surface font-medium">Student Home</span></div></div><div className="flex items-center gap-space-md"><button className="flex items-center gap-space-sm px-space-md py-1.5 rounded-lg bg-surface-container-lowest shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[18px] text-primary">search</span><span className="font-body-sm text-body-sm text-on-surface-variant">⌘K AI Search</span></button><div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md"><span className="material-symbols-outlined text-[16px] text-tertiary">public</span><span>Target: CM-IN (India Tech) • IST</span></div><div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md"><span className="font-medium">⚡ 47 AI Credits</span><button className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary-container transition-colors" type="button"><span className="material-symbols-outlined text-[14px]">add</span></button></div><button className="relative p-space-xs text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span className="material-symbols-outlined text-[22px]">notifications</span><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span></button><div className="flex items-center gap-space-sm pl-space-xs"><div className="flex flex-col text-right hidden sm:flex"><div className="flex items-center gap-space-xs justify-end"><span className="font-title-md text-body-md font-semibold text-on-surface leading-none">Ananya S.</span><span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase font-bold">PRO</span></div><span className="font-label-sm text-label-sm text-tertiary">3rd Yr CS @ IIT Delhi</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-16 px-gutter bg-surface min-h-screen"><div className="flex flex-col w-full pb-16">

<div className="mb-space-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-sm pb-space-md border-b border-surface-container-highest">
<div className="flex flex-wrap items-center gap-space-xs font-body-sm text-body-sm text-tertiary">
<a className="hover:text-primary transition-colors" href="#">Dashboard</a>
<span className="text-outline-variant">/</span>
<a className="hover:text-primary transition-colors" href="#">Programs &amp; Cohorts</a>
<span className="text-outline-variant">/</span>
<span className="text-on-surface-variant font-medium">Distributed Systems Fellowship</span>
<span className="text-outline-variant">/</span>
<span className="text-primary font-semibold">Milestone 2</span>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md">
<span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
<span className="font-medium">Week 2 of 4 • In Review Prep</span>
</div>
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span className="font-medium">Due in 3 Days • Jul 29, 11:59 PM IST</span>
</div>
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md shadow-sm">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
<span className="font-semibold">Escrow Active (4 Days Left)</span>
</div>
</div>
</div>

<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 text-tertiary font-label-sm text-label-sm uppercase tracking-wider font-bold">
<span>COHORT #COHORT-2026-DIST-04</span>
<span>•</span>
<span className="text-secondary">Track: Core Backend &amp; Consensus</span>
</div>
<h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
        Milestone 2: Distributed Storage &amp; Fault-Tolerant Raft Consensus
      </h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
        Engineer a production-grade 3-node Raft consensus engine in Go or C++ handling election transitions, heartbeat telemetry, log replication, and Byzantine split-brain resilience.
      </p>
</div>
<div className="flex items-center flex-wrap gap-space-sm shrink-0">
<button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
<span>Back to Program</span>
</button>
<button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>View Syllabus</span>
</button>
<button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">person_check</span>
<span>Book 1:1 Mentor Sync</span>
</button>
</div>
</div>

<div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-xl overflow-x-auto">
<div className="min-w-[760px] grid grid-cols-4 gap-space-sm">

<div className="flex flex-col p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm font-bold text-primary uppercase">Week 1</span>
<span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
            4.9 / 5.0
          </span>
</div>
<span className="font-title-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
          Core Algorithms &amp; Concurrency
        </span>
<span className="font-body-sm text-body-sm text-tertiary mt-1">Evaluated by Vikram • Passed</span>
</div>

<div className="flex flex-col p-3 rounded-lg bg-primary text-on-primary shadow-md relative overflow-hidden">
<div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary-fixed">Week 2 • CURRENT</span>
<span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-on-primary font-label-sm text-label-sm font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            Draft v1.4
          </span>
</div>
<span className="font-title-md text-body-md font-bold text-on-primary truncate">
          Distributed Storage &amp; Raft
        </span>
<span className="font-body-sm text-body-sm text-primary-fixed mt-1">Due Jul 29 • CI 88.5% Passing</span>
</div>

<div className="flex flex-col p-3 rounded-lg bg-surface-container-low opacity-60">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm font-medium text-tertiary uppercase">Week 3</span>
<span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
</div>
<span className="font-title-md text-body-md font-medium text-on-surface truncate">
          High-Throughput System Design
        </span>
<span className="font-body-sm text-body-sm text-tertiary mt-1">Unlocks Aug 1, 2026</span>
</div>

<div className="flex flex-col p-3 rounded-lg bg-surface-container-low opacity-60">
<div className="flex items-center justify-between mb-1.5">
<span className="font-label-sm text-label-sm font-medium text-tertiary uppercase">Week 4</span>
<span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
</div>
<span className="font-title-md text-body-md font-medium text-on-surface truncate">
          Google Bar-Raiser Capstone
        </span>
<span className="font-body-sm text-body-sm text-tertiary mt-1">Unlocks Aug 8, 2026</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl">

<div className="xl:col-span-8 flex flex-col gap-space-xl">

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">terminal</span>
</div>
<div>
<h2 className="font-title-md text-title-md font-bold text-on-surface">Architectural Specification &amp; RFC 5.0</h2>
<p className="font-body-sm text-body-sm text-tertiary">Core state machine replication protocol &amp; strict guarantees</p>
</div>
</div>
<span className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm font-mono text-on-surface">RFC-RAFT-EXT#05</span>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm leading-relaxed flex flex-col gap-space-xs">
<p><strong className="text-on-surface">Mission Objective:</strong> Build an in-memory distributed commit log replicated across at least three Go nodes communicating via gRPC. Your Raft engine must survive arbitrary network splits without stale reads or uncommitted state mutations.</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
<span><strong>Quorum Consensus:</strong> Strict majority <code className="px-1 py-0.5 rounded bg-surface-container-highest font-mono text-label-sm">N/2 + 1</code> commits before client ACK.</span>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
<span><strong>Randomized Heartbeats:</strong> 150ms–300ms jitter window avoiding split voting cycles.</span>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
<span><strong>Monotonic Terms:</strong> Reject stale term IDs immediately with updated step-down logic.</span>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
<span><strong>Snapshot Compact:</strong> State truncation with zero memory leaks over 100,000 log entries.</span>
</div>
</div>
</div>
<div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm uppercase font-semibold text-tertiary">Reference Frameworks:</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">Go 1.23</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">protobuf/v3</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">etcd/raft testsuite</span>
</div>
<a className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:underline" href="#">
<span>Download Full RFC Spec PDF</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div>
<div className="flex items-center gap-2">
<h2 className="font-title-md text-title-md font-bold text-on-surface">Automated CI/CD Validation Harness</h2>
<span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">DreamX Sandbox v3.4</span>
</div>
<p className="font-body-sm text-body-sm text-tertiary">Isolated Linux containers executing parallel cluster failure injections</p>
</div>
<button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all shadow-sm shrink-0" id="runTestsBtn" type="button">
<span className="material-symbols-outlined text-[18px]">play_circle</span>
<span>Re-Run Automated Suite</span>
</button>
</div>

<div className="p-space-md rounded-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">

<div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
<svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
<circle className="text-surface-container-highest" cx="24" cy="24" fill="none" r="20" stroke="currentColor" stroke-width="4"></circle>
<circle className="text-secondary" cx="24" cy="24" fill="none" r="20" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset="14.4" stroke-linecap="round" stroke-width="4"></circle>
</svg>
<span className="absolute font-label-md text-label-md font-bold text-on-surface">88.5%</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-bold text-on-surface">CI Benchmark Score: 88.5%</span>
<span className="font-body-sm text-body-sm text-tertiary">3 of 4 unit &amp; stress suites currently passing • Target: ≥90% for auto-clearing</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-mono text-label-sm">Total Run: 1.48s</span>
<span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">1 Alert</span>
</div>
</div>

<div className="flex flex-col gap-space-xs">

<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">check</span>
</span>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-semibold text-on-surface">Test 1: Leader Election Under Normal Isolation</span>
<span className="font-body-sm text-body-sm text-tertiary font-mono">pkg/raft/election_test.go • 3 node converge</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-mono text-body-sm text-tertiary hidden sm:inline">42ms</span>
<span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">PASS</span>
</div>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">check</span>
</span>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-semibold text-on-surface">Test 2: Heartbeat Timeout &amp; Monotonic Term Increment</span>
<span className="font-body-sm text-body-sm text-tertiary font-mono">pkg/raft/heartbeat_test.go • step-down verified</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-mono text-body-sm text-tertiary hidden sm:inline">18ms</span>
<span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">PASS</span>
</div>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">check</span>
</span>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-semibold text-on-surface">Test 3: Log Consistency Verification on Follower Crash</span>
<span className="font-body-sm text-body-sm text-tertiary font-mono">pkg/raft/replication_test.go • 10k entries replay</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-mono text-body-sm text-tertiary hidden sm:inline">88ms</span>
<span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">PASS</span>
</div>
</div>

<div className="p-3 rounded-lg bg-surface-container-high flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="w-6 h-6 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">warning</span>
</span>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-semibold text-on-surface">Test 4: Split-Brain 3-Way Partition Recovery &amp; Rejoin</span>
<span className="font-body-sm text-body-sm text-error font-medium">Tail-latency p99: 480ms (Violates 300ms SLA target)</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-mono text-body-sm text-tertiary hidden sm:inline">480ms</span>
<span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">WARNING</span>
</div>
</div>
</div>

<div className="rounded-lg bg-inverse-surface text-inverse-on-surface p-space-md font-mono text-body-sm leading-relaxed overflow-x-auto shadow-inner">
<div className="flex items-center justify-between text-tertiary-fixed-dim pb-2 mb-2 border-b border-white/10">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
<span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
<span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
<span className="text-label-sm text-tertiary-fixed ml-2 font-mono">runner@dreamx-worker-node-04:~/workspace/milestone2</span>
</div>
<span className="text-label-sm font-mono text-tertiary-fixed">Go test -v -race -timeout 30s</span>
</div>
<p className="text-green-300">=== RUN   TestRaftLeaderElectionSimple</p>
<p className="text-neutral-400">--- PASS: TestRaftLeaderElectionSimple (0.04s) • term: 1, leader: node_1</p>
<p className="text-green-300">=== RUN   TestRaftHeartbeatLossElectionTrigger</p>
<p className="text-neutral-400">--- PASS: TestRaftHeartbeatLossElectionTrigger (0.02s) • term: 2, leader: node_3</p>
<p className="text-green-300">=== RUN   TestRaftLogReplicationFuzz</p>
<p className="text-neutral-400">--- PASS: TestRaftLogReplicationFuzz (0.09s) • verified 10,000 operations</p>
<p className="text-yellow-300">=== RUN   TestRaftSplitBrainPartitionRejoin</p>
<p className="text-yellow-200">    raft_test.go:412: [WARN] Rejoin sync took 480ms. Lock contention identified in LogCompactorMutex.</p>
<p className="text-yellow-300">--- WARN: TestRaftSplitBrainPartitionRejoin (0.48s)</p>
<p className="text-white font-bold pt-2">RESULT: 3 PASSED, 1 WARNING • Bench Score: 88.5/100.0</p>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div>
<h2 className="font-title-md text-title-md font-bold text-on-surface">Submit Deliverables &amp; Artifacts</h2>
<p className="font-body-sm text-body-sm text-tertiary">Provide reproducible code repository, binary artifact, and context for your mentor review</p>
</div>

<div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-3 min-w-0">
<div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">folder_zip</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-title-md text-body-md font-semibold text-on-surface truncate">raft_consensus_benchmark_v1.zip</span>
<span className="font-body-sm text-body-sm text-tertiary">14.2 MB • SHA-256: 7f8c12a... • Uploaded 2 hours ago</span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors" type="button">
              Download Draft
            </button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-medium hover:bg-primary-fixed transition-colors" type="button">
              Replace ZIP
            </button>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
<span>GitHub Repository Link (Private or Public)</span>
<span className="text-tertiary font-normal">Linked to commit 9f2b80a</span>
</label>
<div className="flex items-center rounded-lg bg-surface-container-low px-3 py-2">
<span className="material-symbols-outlined text-tertiary text-[20px] mr-2">code</span>
<input className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none" type="text" value="https://github.com/ananya-sharma/raft-consensus-engine"/>
<span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
<span>Notes &amp; Context for Lead Mentor (Vikram Singh)</span>
<span className="text-tertiary font-normal">Optional</span>
</label>
<textarea className="w-full rounded-lg bg-surface-container-low p-3 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary placeholder-tertiary" placeholder="Explain your architectural design decisions, known trade-offs, or specific bottleneck issues you want Vikram to review..." rows={3}>Hi Vikram, I isolated the split-brain latency issue in Test 4 to lock contention in LogCompactorMutex during dynamic snapshot generation. I left inline benchmarks in benchmarks/mutex_profile.pprof for your review.</textarea>
</div>

<div className="pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-t border-surface-container">
<div className="flex items-center gap-2 text-tertiary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">info</span>
<span>Once submitted, Vikram begins review within 24h guarantee SLA.</span>
</div>
<button className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2" id="submitMilestoneBtn" type="button">
<span className="material-symbols-outlined text-[20px]">rocket_launch</span>
<span>Submit Milestone 2 for Review</span>
</button>
</div>
</div>
</div>

<div className="xl:col-span-4 flex flex-col gap-space-xl">

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<h2 className="font-title-md text-title-md font-bold text-on-surface">4-Pillar Evaluation Rubric</h2>
<span className="font-body-sm text-body-sm text-tertiary">Calibrated Google L6 / Amazon Bar-Raiser criteria</span>
</div>
<span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">100 Pts</span>
</div>
<div className="flex flex-col gap-space-sm">

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<span className="font-title-md text-body-md font-semibold text-on-surface">1. Partition Safety &amp; Quorum</span>
<span className="font-label-sm text-label-sm font-bold text-secondary">30% Weight</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Absence of split-brain state mutations during network isolation and automated majority reconnect.</p>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
<div className="bg-secondary h-1.5 rounded-full" style={{"width":"85%"}}></div>
</div>
<span className="font-label-sm text-label-sm text-tertiary text-right">Self-assessment: 26/30 Pts</span>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<span className="font-title-md text-body-md font-semibold text-on-surface">2. Log Compaction &amp; Snapshots</span>
<span className="font-label-sm text-label-sm font-bold text-secondary">25% Weight</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Non-blocking state truncation, monotonic index validation, and zero RAM leaks under continuous load.</p>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
<div className="bg-secondary h-1.5 rounded-full" style={{"width":"78%"}}></div>
</div>
<span className="font-label-sm text-label-sm text-tertiary text-right">Self-assessment: 20/25 Pts</span>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<span className="font-title-md text-body-md font-semibold text-on-surface">3. Concurrency &amp; Lock Rigor</span>
<span className="font-label-sm text-label-sm font-bold text-secondary">25% Weight</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Zero data races with <code className="font-mono text-label-sm">-race</code>, clean channel synchronization, and sub-300ms p99 tail latency.</p>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
<div className="bg-secondary h-1.5 rounded-full" style={{"width":"70%"}}></div>
</div>
<span className="font-label-sm text-label-sm text-error text-right font-medium">Contention detected: 18/25 Pts</span>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<span className="font-title-md text-body-md font-semibold text-on-surface">4. Clean Idiomatic Code &amp; Tests</span>
<span className="font-label-sm text-label-sm font-bold text-secondary">20% Weight</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Modular package structure, descriptive error wrapping, and reproducible unit/integration table tests.</p>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
<div className="bg-secondary h-1.5 rounded-full" style={{"width":"95%"}}></div>
</div>
<span className="font-label-sm text-label-sm text-tertiary text-right">Self-assessment: 19/20 Pts</span>
</div>
</div>
<div className="p-3 rounded-lg bg-surface-container flex items-center gap-2.5">
<span className="material-symbols-outlined text-[20px] text-primary">article</span>
<span className="font-body-sm text-body-sm text-on-surface">Mentor produces a <strong>4-page annotated architectural feedback PDF</strong> with line-by-line profiling.</span>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary">Dedicated Lead Mentor</span>
<span className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
<span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            Online in IST
          </span>
</div>
<div className="flex items-center gap-3">
<img className="w-14 h-14 rounded-xl object-cover shadow-sm shrink-0" data-alt="Professional headshot of Vikram Singh, a distinguished Indian male cloud architect in his late thirties wearing modern minimalist spectacles and charcoal polo shirt, warm studio lighting with high tech office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwKDVOJ-tLtbVg7dqBZQ_YDojdiOZzV-L1qGCmEpdlOTGMbDDtOn6kcBC9YBz4kyfaZ2x7_xfOucMZc6ZGHde9dDtehWlNCUnWI5HBp3xJ-nqBWNfM6oDwdPbhMypBBtUIgFvazLmeIRubPL68UN9OFyp3dNMTu8dzkpIochVLiFtxTuzOcfxCT9QkWfXoMHYaHmNwULagn667YGDoqnH9OHA6Wivx9Am4Mq0bA5PdgW7TekR-2wB4"/>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-bold text-on-surface leading-tight">Vikram Singh</span>
<span className="font-body-sm text-body-sm text-primary font-medium">Senior Staff Engineer @ Google Cloud</span>
<span className="font-label-sm text-label-sm text-tertiary">Ex-Amazon Bar Raiser • 14 Yrs Dist. Systems</span>
</div>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm font-semibold text-tertiary uppercase">Next Live Whiteboard Sync</span>
<span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">Mandatory</span>
</div>
<div className="flex items-center gap-2 text-on-surface font-title-md text-body-md font-semibold">
<span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
<span>Saturday, Jul 26 @ 6:00 PM IST</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Live deep-dive: "Surviving Raft Split-Brains Under Asymmetric Network Partitions" on Google Meet.</p>
<a className="mt-1 w-full py-1.5 px-3 rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold text-center hover:bg-surface-container transition-colors" href="#">
            Add to Google Calendar (.ics)
          </a>
</div>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<button className="py-2 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">chat</span>
<span>Ask Async Q</span>
</button>
<button className="py-2 px-3 rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md font-semibold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">calendar_today</span>
<span>Book 30m Slot</span>
</button>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border-l-4 border-primary">
<div className="flex items-start justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">shield</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-body-md font-bold text-on-surface">Escrow Guarantee</span>
<span className="font-label-sm text-label-sm text-tertiary">14-Day 100% Refund Safeguard</span>
</div>
</div>
<span className="font-mono text-label-sm font-bold text-primary">Day 10 / 14</span>
</div>

<div className="flex flex-col gap-1.5">
<div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
<div className="bg-primary h-2 rounded-full" style={{"width":"71.4%"}}></div>
</div>
<div className="flex justify-between font-label-sm text-label-sm text-tertiary">
<span>Enrolled Jul 15</span>
<span className="font-semibold text-primary">4 Days Remaining in Trial</span>
<span>Escrow Releases Jul 29</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Your ₹48,000 fellowship tuition is safely locked in DreamX escrow. If you feel the curriculum rigor or mentor caliber does not meet Google/Amazon bar standards, claim an instant 100% refund before Milestone 2 evaluation.
        </p>
<a className="text-tertiary hover:text-on-surface font-body-sm text-body-sm underline transition-colors text-right" href="#">
          Read Escrow Terms &amp; Refund Policy
        </a>
</div>
</div>
</div>
</div>
</main></div>
    </>
  );
}
