'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [targetEmail, setTargetEmail] = useState('')

  const fillEmail = (val: string) => {
    setEmail(val)
    setErrorMessage(null)
  }

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setTargetEmail(email)
      setSubmitted(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process recovery request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface font-body-md text-body-md text-on-surface">
      {/* Header */}
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-20">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between">
          <Link className="flex items-center gap-space-sm" href="/">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">DreamX</span>
          </Link>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
              <span>256-bit Encrypted Session</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-secondary">shield</span>
              <span>Zero-Trust RLS Protected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Recovery Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-gutter py-space-xl">
        <div className="w-full max-w-lg">
          <div className="flex flex-col w-full items-center">
            <div className="w-full relative bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden p-space-xl border border-surface-container-high">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>

              {!submitted ? (
                <div className="flex flex-col" id="request-state">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-sm">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent"></div>
                      <span
                        className="material-symbols-outlined text-[30px] text-primary relative z-10"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        lock_reset
                      </span>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                      </span>
                    </div>
                    <h1 className="mt-space-md font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                      Reset Your Password
                    </h1>
                    <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant max-w-sm">
                      Enter your verified work or academic email to receive a secure 15-minute recovery token and reset link.
                    </p>
                  </div>

                  {/* Quick Demo Fill */}
                  <div className="mt-space-lg flex items-center justify-between px-space-md py-space-xs rounded-xl bg-surface-container-low border border-surface-container-high">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">science</span>
                      <span>Quick Demo Fill:</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <button
                        className="px-space-sm py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm transition-all"
                        onClick={() => fillEmail('student@dreamx.com')}
                        type="button"
                      >
                        Student
                      </button>
                      <button
                        className="px-space-sm py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm transition-all"
                        onClick={() => fillEmail('mentor.google@dreamx.com')}
                        type="button"
                      >
                        Mentor
                      </button>
                    </div>
                  </div>

                  {/* Recovery Form */}
                  <form className="mt-space-lg flex flex-col gap-space-md" onSubmit={handleSendRecovery}>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold" htmlFor="recovery-email">
                        <span>Verified Work or University Email</span>
                        <span className="font-label-sm text-label-sm text-tertiary font-normal">3 attempts left</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                        </span>
                        <input
                          autoComplete="email"
                          className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all border border-surface-container-high"
                          id="recovery-email"
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alex.chen@stanford.edu"
                          required
                          type="email"
                          value={email}
                        />
                      </div>
                      <div className="flex items-center gap-space-xs mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Enter the email linked to your student or mentor identity.
                        </p>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-space-xs p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">speed</span>
                      <span className="text-tertiary font-medium">Max 3 reset attempts per 15-minute window. Rate-limited by IP.</span>
                    </div>

                    <button
                      className="relative w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-title-md text-title-md font-semibold flex items-center justify-center gap-space-xs shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? (
                        <div className="flex items-center gap-space-xs">
                          <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                          </svg>
                          <span>Verifying Credentials...</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-space-xs">
                          Send Recovery Instructions
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col" id="success-state">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-sm">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent"></div>
                      <span
                        className="material-symbols-outlined text-[30px] text-primary relative z-10"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        mark_email_read
                      </span>
                    </div>
                    <h2 className="mt-space-md font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                      Instructions Dispatched
                    </h2>
                    <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant max-w-sm">
                      Recovery link and 6-digit OTP dispatched to{' '}
                      <span className="font-semibold text-on-surface">{targetEmail}</span>
                    </p>
                    <div className="mt-space-md inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-on-primary-fixed-variant font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                      <span>Token expires in <span className="font-metric-num text-label-md">14:59</span></span>
                    </div>
                  </div>

                  <div className="mt-space-lg flex flex-col gap-space-sm">
                    <a
                      className="w-full h-11 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-semibold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-hover transition-colors"
                      href="mailto:"
                    >
                      <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                      <span>Open Email App</span>
                    </a>
                    <Link
                      className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-title-md text-title-md font-semibold flex items-center justify-center gap-space-xs transition-colors border border-surface-container-high"
                      href="/reset-password"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary">pin</span>
                      <span>Enter 6-Digit OTP Directly</span>
                    </Link>
                  </div>

                  <div className="mt-space-md pt-space-sm text-center">
                    <button
                      className="font-label-md text-label-md text-primary hover:underline"
                      onClick={() => setSubmitted(false)}
                      type="button"
                    >
                      Try another email address
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Back to Login */}
              <div className="mt-space-lg pt-space-md border-t border-surface-container-high text-center">
                <Link className="font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1" href="/login">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Return to Sign In</span>
                </Link>
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
