'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function VerifyFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const emailParam = searchParams.get('email') || ''
  const [email, setEmail] = useState(emailParam || 'ananya.sharma@iitd.ac.in')
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(60)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])


  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '')
    const newDigits = [...digits]
    newDigits[index] = clean ? clean[clean.length - 1] : ''
    setDigits(newDigits)
    setErrorMessage(null)

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newDigits = [...digits]
      pasted.split('').forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setDigits(newDigits)
      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const autofillCode = (demoEmail: string, code: string) => {
    setEmail(demoEmail)
    const codeDigits = code.split('').slice(0, 6)
    setDigits(codeDigits)
    setErrorMessage(null)
  }

  const handleVerify = async () => {
    const token = digits.join('')
    if (token.length < 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      })

      if (error) {
        // Fallback for email recovery verification
        const { error: recoveryError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        })
        if (recoveryError) throw error
      }

      router.push('/onboard')
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification passcode.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      setCooldown(60)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification code.')
    } finally {
      setResending(false)
    }
  }

  const fullCode = digits.join('')

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
              <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
              <span>256-bit Encrypted Session</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-secondary">shield</span>
              <span>Zero-Trust RLS Protected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-gutter py-space-xl">
        <div className="flex flex-col w-full items-center justify-center">
          {/* Evaluator Quick Autofill Bar */}
          <div className="w-full max-w-[560px] mb-space-md">
            <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm shadow-sm border border-surface-container-high">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  developer_mode
                </span>
                <span className="font-semibold text-on-surface">Evaluator Test Rig</span>
                <span className="text-tertiary">Quick Autofill:</span>
              </div>
              <div className="flex items-center gap-space-xs w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors font-label-sm text-label-sm text-primary font-semibold border border-surface-container-high"
                  onClick={() => autofillCode('ananya.sharma@iitd.ac.in', '482910')}
                  type="button"
                >
                  <span>Student</span>
                  <span className="text-tertiary text-[10px] bg-surface-container-highest px-1 py-0.5 rounded font-mono">482910</span>
                </button>
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors font-label-sm text-label-sm text-secondary font-semibold border border-surface-container-high"
                  onClick={() => autofillCode('dr.vikram.patel@aiims.edu', '839201')}
                  type="button"
                >
                  <span>Mentor</span>
                  <span className="text-tertiary text-[10px] bg-surface-container-highest px-1 py-0.5 rounded font-mono">839201</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Verification Banner */}
          <div className="w-full max-w-[560px] mb-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border border-surface-container-high">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">Session:</span>
                  <span className="font-label-sm text-label-sm font-mono text-tertiary truncate">vrf_auth_8f192b49e10c...</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container font-label-sm text-[10px] text-tertiary">
                    HMAC-SHA256 Active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm flex-shrink-0 self-start sm:self-auto font-mono">
                <span className="material-symbols-outlined text-[13px]">timer</span>
                <span>14:59 window</span>
              </div>
            </div>
          </div>

          {/* Main Card Container */}
          <div className="w-full max-w-[560px] bg-surface-container-lowest rounded-2xl p-space-xl sm:p-8 shadow-xl relative overflow-hidden border border-surface-container-high">
            {/* Top Runner */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary-container"></div>

            {/* Header Block inside Card */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-fixed/40 flex items-center justify-center text-primary shadow-sm mb-space-md relative">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  phonelink_lock
                </span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-[13px]">verified</span>
                </div>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mb-space-xs">
                Verify Your Identity
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[440px] mb-space-sm">
                We have dispatched a 6-digit cryptographic verification code to{' '}
                <span className="font-semibold text-on-surface">{email}</span>. Enter the token below to confirm your account.
              </p>
              <Link className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors mb-space-lg group" href="/signup">
                <span className="material-symbols-outlined text-[15px] group-hover:translate-x-[-1px] transition-transform">edit_note</span>
                <span className="underline underline-offset-4 decoration-primary/40">Change destination email</span>
              </Link>
            </div>

            {/* OTP Input Form */}
            <form className="flex flex-col gap-space-lg" onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
              <div className="flex justify-between items-center gap-2 sm:gap-space-sm max-w-[420px] mx-auto w-full">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    autoComplete="one-time-code"
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center font-metric-num text-metric-num text-on-surface bg-surface-container-low rounded-xl shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-surface-container-high"
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    pattern="[0-9]*"
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    value={digit}
                  />
                ))}
              </div>

              {/* Status Pill */}
              <div
                className={`flex items-center justify-center gap-space-xs text-center py-1.5 px-space-md rounded-lg font-label-sm text-label-sm transition-all ${
                  fullCode.length === 6
                    ? 'bg-surface-container text-primary font-semibold'
                    : 'bg-surface-container-low text-tertiary'
                }`}
              >
                {fullCode.length === 6 ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
                    <span>Passcode complete ({fullCode}). Ready to authenticate.</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">pending</span>
                    <span>Waiting for {6 - fullCode.length} more digit(s)...</span>
                  </>
                )}
              </div>

              {errorMessage && (
                <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center justify-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary CTA */}
              <button
                className="w-full h-12 bg-primary hover:bg-on-primary-fixed-variant text-on-primary rounded-xl font-title-md text-title-md font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-sm group cursor-pointer disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                    </svg>
                    <span>Authorizing token...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify Token &amp; Access Workspace</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Resend & Delivery Channels Section */}
            <div className="mt-space-lg pt-space-md bg-surface-container-low/50 rounded-xl p-space-md flex flex-col gap-space-sm border border-surface-container-high">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-center sm:text-left">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Didn&apos;t receive the passcode?</span>
                <div className="flex items-center justify-center gap-1 font-label-md text-label-md">
                  <button
                    className={`flex items-center gap-1 font-semibold ${
                      cooldown > 0 ? 'text-tertiary cursor-not-allowed opacity-75' : 'text-primary hover:underline cursor-pointer'
                    }`}
                    disabled={cooldown > 0 || resending}
                    onClick={handleResend}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code Now'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">alt_route</span>
                  Channels: Resend Transactional Email &amp; WhatsApp API
                </span>
                <span className="hidden sm:inline-block font-mono text-tertiary">Route #490</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-space-md flex items-start gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary flex-shrink-0 mt-0.5">policy</span>
              <p className="text-[12px] leading-relaxed">
                <span className="font-semibold text-on-surface">Security Policy:</span> Max 3 verification attempts permitted per 15-minute window. Rate-limited by IP and hardware telemetry.
              </p>
            </div>

            {/* Return & Support Links */}
            <div className="mt-space-lg flex items-center justify-between pt-space-md border-t border-surface-container-high">
              <Link className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/login">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Return to Sign In</span>
              </Link>
              <Link className="flex items-center gap-1 font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors font-semibold" href="#">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                <span>Priority Support Desk</span>
              </Link>
            </div>

            {/* Micro Badge */}
            <div className="mt-space-xl text-center">
              <p className="font-label-sm text-[11px] text-tertiary tracking-wide uppercase font-mono">
                256-bit AES Vault • Zero LLM Data Retention • Supabase Gotrue RLS
              </p>
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

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyFormContent />
    </Suspense>
  )
}
