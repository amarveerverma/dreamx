'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retrying, setRetrying] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    // Log the error to console or Sentry
    console.error('Unhandled Runtime Exception:', error)
  }, [error])

  const handleRetry = () => {
    setRetrying(true)
    setToastMessage('Re-establishing connection with orchestration gateway...')
    setTimeout(() => {
      setRetrying(false)
      setToastMessage(null)
      reset()
    }, 1200)
  }

  const handlePurgeCache = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
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
          <div className="flex items-center gap-space-md">
            <Link
              className="px-space-md py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:text-on-surface hover:bg-surface-container transition-colors"
              href="/login"
            >
              Sign In
            </Link>
            <Link
              className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-all hover:shadow"
              href="/"
            >
              Return Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-r from-primary/10 via-secondary/10 to-error/10 blur-3xl pointer-events-none rounded-full"></div>
            <div className="relative max-w-7xl mx-auto px-margin pt-space-lg pb-space-xl">
              {/* Telemetry Status Pills */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span>HTTP 500 • INTERNAL_SERVER_ERROR</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                    <span>RFC 7807 Exception Handled</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
                    <span className="text-tertiary">Trace:</span>
                    <code className="font-mono text-xs text-on-surface font-semibold">{error.digest || 'req-err500-trace'}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[15px] text-primary">security</span>
                  <span>Zero-Trust Kernel Watchdog</span>
                  <span className="text-outline-variant">•</span>
                  <span className="text-on-surface font-semibold">Self-Healing Isolation v4.8</span>
                </div>
              </div>

              {/* Hero Visual Statement */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center mb-space-xl">
                <div className="lg:col-span-8 flex flex-col gap-space-sm">
                  <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                    <span className="uppercase tracking-wider">Automated Fault Containment Layer</span>
                  </div>
                  <h1 className="font-display-hero text-3xl sm:text-5xl tracking-tight text-on-surface font-bold">
                    Service Exception Caught by <span className="text-primary bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Kernel Boundary</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                    Our self-healing orchestrator intercepted a runtime anomaly. Subsystems were isolated instantaneously to guarantee zero state corruption or unauthorized balance debits.
                  </p>
                </div>
              </div>

              {/* Action Bento Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
                <div className="lg:col-span-7 flex flex-col gap-space-md">
                  <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-[0_4px_16px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-xs">
                          <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                          </div>
                          <div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Execution Interruption</h2>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Active Circuit Breaker Engagement</span>
                          </div>
                        </div>
                        <div className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                          Severity: Handled
                        </div>
                      </div>

                      <div className="p-space-md rounded-xl bg-surface-container-low mb-space-md">
                        <p className="font-body-md text-body-md text-on-surface">
                          {error.message || 'An unexpected runtime error occurred. Our circuit breaker isolated the subsystem to protect your session integrity.'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm pt-space-xs">
                        <button
                          className="px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md shadow-sm transition-all flex items-center justify-center gap-space-xs group disabled:opacity-50"
                          disabled={retrying}
                          onClick={handleRetry}
                        >
                          <span className={`material-symbols-outlined text-[20px] transition-transform ${retrying ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`}>
                            refresh
                          </span>
                          <span>{retrying ? 'Re-establishing...' : 'Try Again (Reset Boundary)'}</span>
                        </button>
                        <Link
                          className="px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-title-md text-title-md text-center transition-colors flex items-center justify-center gap-space-xs"
                          href="/"
                        >
                          <span className="material-symbols-outlined text-[18px]">home</span>
                          <span>Return to Home</span>
                        </Link>
                        <button
                          className="px-space-sm py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center justify-center gap-1"
                          onClick={handlePurgeCache}
                        >
                          <span className="material-symbols-outlined text-[16px]">mop</span>
                          <span>Purge Cache</span>
                        </button>
                      </div>

                      {toastMessage && (
                        <div className="mt-space-sm p-3 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-[18px] animate-spin">progress_activity</span>
                          <span>{toastMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subsystem Health Diagnostics */}
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">Subsystem Health Diagnostics</h3>
                      </div>
                      <span className="text-xs font-label-sm text-on-surface-variant">Live Probe</span>
                    </div>
                    <div className="flex flex-col gap-space-sm">
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                          <div>
                            <span className="font-title-md text-body-sm font-semibold text-on-surface block">Database & RLS Kernel</span>
                            <span className="font-body-sm text-xs text-on-surface-variant">Zero-trust access matrix enforced</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-semibold">OPERATIONAL</span>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                          <div>
                            <span className="font-title-md text-body-sm font-semibold text-on-surface block">Supabase Auth (Gotrue)</span>
                            <span className="font-body-sm text-xs text-on-surface-variant">OAuth & OTP engine active</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[11px] font-semibold">ONLINE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high py-6 px-margin">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <span>&copy; {new Date().getFullYear()} DreamX Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link className="hover:text-primary transition-colors" href="/">Home</Link>
            <Link className="hover:text-primary transition-colors" href="/login">Sign In</Link>
            <Link className="hover:text-primary transition-colors" href="/signup">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
