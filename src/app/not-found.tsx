'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NotFound() {
  const [searchTerm, setSearchTerm] = useState('')

  const quickFill = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <Link className="flex items-center gap-space-sm group" href="/">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm shadow-sm transition-transform group-hover:scale-105">
                D
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold">
                Dream<span className="text-primary">X</span>
              </span>
            </Link>
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
              <span>256-bit encrypted</span>
              <span className="text-outline-variant">•</span>
              <span>Zero-trust architecture</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            <Link className="px-space-sm py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="/#goal-discovery-section">
              Discover
            </Link>
            <Link className="px-space-sm py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="/#services-matrix-section">
              Services
            </Link>
            <Link className="px-space-sm py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="/#mentor-program-section">
              For Mentors
            </Link>
            <Link className="px-space-sm py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="/#pricing-section">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs">
              <Link className="px-space-md py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:text-on-surface hover:bg-surface-container transition-colors" href="/login">
                Sign In
              </Link>
              <Link className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-all" href="/signup">
                Join Workspace
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="w-full pt-16 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-7xl mx-auto px-margin py-space-xl overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-48 right-12 w-64 h-64 bg-secondary/5 rounded-full blur-2xl pointer-events-none -z-10"></div>

            <div className="flex flex-col items-center text-center space-y-space-md">
              <div className="inline-flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-container shadow-sm border border-surface-container-high">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                  HTTP 404 • RESOURCE_NOT_FOUND
                </span>
                <span className="font-label-sm text-label-sm text-outline px-1.5 py-0.5 rounded bg-surface-container-lowest shadow-sm">
                  RFC 7807 Handled
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-mono bg-surface-container-high px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] text-primary">tag</span>
                  <span>req-7f8e9d-404</span>
                </span>
              </div>

              <div className="relative py-space-sm select-none">
                <div className="font-display-hero text-[110px] md:text-[144px] leading-none font-bold tracking-tight bg-gradient-to-r from-primary via-primary-container to-secondary bg-clip-text text-transparent">
                  404
                </div>
              </div>

              <div className="max-w-2xl mx-auto space-y-space-xs">
                <h1 className="font-headline-lg text-headline-lg md:font-display-hero md:text-[38px] text-on-surface tracking-tight font-bold">
                  Page Not Found on the Career Grid
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                  The link you followed may be broken, expired, or the resource has been relocated. Your session and credentials remain cryptographically safe.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl mx-auto pt-space-sm">
                <div className="relative bg-surface-container-lowest rounded-xl shadow-md p-1.5 focus-within:shadow-xl transition-all border border-surface-container-high">
                  <div className="flex items-center gap-space-sm px-space-sm">
                    <span className="material-symbols-outlined text-outline text-[22px]">search</span>
                    <input
                      autoComplete="off"
                      className="w-full bg-transparent py-2.5 text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search mentors, services (e.g. Mock Interview, Resume Review), or press ⌘K..."
                      type="text"
                      value={searchTerm}
                    />
                    <div className="hidden sm:flex items-center gap-1 px-space-xs py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      <span>⌘</span><span>K</span>
                    </div>
                    <Link
                      className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-all flex items-center gap-1"
                      href="/signup"
                    >
                      <span>Explore</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-space-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mr-1">
                    Direct Paths:
                  </span>
                  {['Mock Interview', 'Resume Review', 'Goal Discovery', 'Career Score'].map((path) => (
                    <button
                      key={path}
                      className="px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1 shadow-sm border border-surface-container-high cursor-pointer"
                      onClick={() => quickFill(path)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">touch_app</span>
                      <span>{path}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Direct Navigation Cards */}
            <div className="mt-space-xl pt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              <div className="relative group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border border-surface-container-high">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[26px]">explore</span>
                  </div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Goal-Based Discovery</h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm">
                      Fast Track
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Find the right service or tailored accelerator starting directly with the role or milestone you want to conquer today.
                  </p>
                </div>
                <div className="pt-space-lg mt-auto">
                  <Link
                    className="w-full inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-title-md transition-colors shadow-sm"
                    href="/#goal-discovery-section"
                  >
                    <span>Go to Discover</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="relative group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border border-surface-container-high">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                    <span className="material-symbols-outlined text-[26px]">category</span>
                  </div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Explore Services</h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
                      Standardized
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Browse standardized 10-type career interventions: mock technical rounds, ATS resume re-architecture, and portfolio audits.
                  </p>
                </div>
                <div className="pt-space-lg mt-auto">
                  <Link
                    className="w-full inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-title-md transition-colors shadow-sm"
                    href="/#services-matrix-section"
                  >
                    <span>Browse Services</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="relative group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border border-surface-container-high">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[26px]">dashboard_customize</span>
                  </div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Return to Workspace</h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      Zero Loss
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Resume right where you left off. Rejoin your active candidate or mentor console with zero loss of session cache or state.
                  </p>
                </div>
                <div className="pt-space-lg mt-auto">
                  <Link
                    className="w-full inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-title-md text-title-md transition-all shadow-sm"
                    href="/login"
                  >
                    <span>Go to Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-space-lg border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-tertiary text-[16px]">security</span>
            <span>ISO/IEC 27001 Certified Infrastructure • Continuous Automated Compliance</span>
          </div>
          <div className="flex items-center gap-space-md font-label-md text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </Link>
            <span className="text-outline-variant">•</span>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </Link>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant">© 2026 DreamX Global Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
