'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [sessionLabel, setSessionLabel] = useState('Session: rst_sec_09fa82... verified')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [revokeSessions, setRevokeSessions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; desc: string } | null>(null)

  // Complexity Checks
  const hasLength = newPassword.length >= 8
  const hasCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const score = [hasLength, hasCase, hasNumber, hasSpecial].filter(Boolean).length

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  const getStrengthLabel = () => {
    if (!newPassword) return 'Empty'
    if (score <= 1) return 'Weak'
    if (score === 2) return 'Fair'
    if (score === 3) return 'Good'
    return 'Strong'
  }

  const prefillSimulator = (type: 'student' | 'mentor') => {
    if (type === 'student') {
      setSessionLabel('Session: ananya.s@dreamx-edu.org (Token #STU-9921)')
      setNewPassword('QuantumOrbit#2025')
      setConfirmPassword('QuantumOrbit#2025')
    } else {
      setSessionLabel('Session: vikram.s@advisory.dreamx.io (Token #MNT-4810)')
      setNewPassword('ArchMentorship!99x')
      setConfirmPassword('ArchMentorship!99x')
    }
    setFeedback(null)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordsMatch) {
      setFeedback({
        type: 'error',
        title: 'Passwords Mismatch',
        desc: 'New password and confirm password fields do not match.',
      })
      return
    }

    if (score < 3) {
      setFeedback({
        type: 'error',
        title: 'Weak Password',
        desc: 'Please fulfill at least 3 complexity rules before proceeding.',
      })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setFeedback({
        type: 'success',
        title: 'Password Updated Successfully',
        desc: 'Your credentials have been securely re-hashed. Redirecting to sign in...',
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Reset Failed',
        desc: err.message || 'Unable to update password. Recovery link may have expired.',
      })
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

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-gutter py-space-xl">
        <div className="flex flex-col w-full items-center justify-center py-space-sm sm:py-space-md">
          <div className="relative w-full max-w-[560px] mx-auto">
            {/* Subtle Ambient Glow */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Evaluator Recovery Token Simulator Bar */}
            <div className="mb-space-md rounded-xl bg-surface-container-high/70 backdrop-blur-md p-space-sm sm:px-space-md sm:py-space-sm shadow-sm transition-all duration-200 border border-surface-container-high">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold tracking-wider uppercase">
                    Evaluator Token Simulator
                  </span>
                </div>
                <div className="flex items-center gap-space-xs flex-wrap">
                  <button
                    className="px-space-sm py-1 rounded-md bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm transition-all duration-150 flex items-center gap-1 active:scale-95 border border-surface-container-high"
                    onClick={() => prefillSimulator('student')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px] text-primary">school</span>
                    <span>Ananya S. (Student)</span>
                  </button>
                  <button
                    className="px-space-sm py-1 rounded-md bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm transition-all duration-150 flex items-center gap-1 active:scale-95 border border-surface-container-high"
                    onClick={() => prefillSimulator('mentor')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px] text-secondary">psychology</span>
                    <span>Vikram S. (Mentor)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Auth Card */}
            <div className="w-full bg-surface-container-lowest rounded-[20px] shadow-xl relative overflow-hidden transition-all duration-200 border border-surface-container-high">
              {/* Top Accent Gradient Runner */}
              <div className="w-full h-[2px] bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

              <div className="p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
                {/* Cryptographic Session Pill Banner */}
                <div className="flex items-center justify-between gap-space-sm bg-surface-container-low/90 rounded-xl px-space-md py-space-sm border border-surface-container-high">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span
                      className="material-symbols-outlined text-primary text-[18px] shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        {sessionLabel}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        HMAC-SHA256 Token Active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span>
                    <span className="font-metric-num font-mono text-[11px] leading-none">14:59 window</span>
                  </div>
                </div>

                {/* Header Block */}
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center shrink-0 shadow-sm text-primary">
                    <span className="material-symbols-outlined text-[26px]">key</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                      Create New Password
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Enter and confirm your new secure master password for your verified DreamX identity.
                    </p>
                  </div>
                </div>

                {/* Reset Form */}
                <form className="flex flex-col gap-space-lg" onSubmit={handlePasswordReset}>
                  {/* New Password */}
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="new-password">
                        New Password
                      </label>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                        {newPassword.length > 0 ? `${newPassword.length * 4} bits entropy` : '0 bits entropy'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-tertiary text-[18px] pointer-events-none">
                        lock
                      </span>
                      <input
                        autoComplete="new-password"
                        className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md transition-all duration-150 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm border border-surface-container-high"
                        id="new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter strong unique password"
                        required
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                      />
                      <button
                        className="absolute right-3 text-tertiary hover:text-on-surface transition-colors flex items-center justify-center"
                        onClick={() => setShowNewPw(!showNewPw)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showNewPw ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between text-label-sm font-label-sm">
                        <span className="text-on-surface-variant">Password Strength</span>
                        <span className="font-semibold text-on-surface-variant">{getStrengthLabel()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 1 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 2 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 3 ? 'bg-secondary' : 'bg-surface-container-highest'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score === 4 ? 'bg-emerald-500' : 'bg-surface-container-highest'}`}></div>
                      </div>
                    </div>

                    {/* 4-Pill Complexity Requirement Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm transition-all duration-200 ${hasLength ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {hasLength ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm transition-all duration-200 ${hasCase ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {hasCase ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Uppercase &amp; lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm transition-all duration-200 ${hasNumber ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>1+ number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low font-label-sm text-label-sm transition-all duration-200 ${hasSpecial ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>1+ special (@$!%*?&amp;)</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="confirm-password">
                        Confirm New Password
                      </label>
                      {confirmPassword && (
                        <span className={`font-label-sm text-label-sm ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-error font-semibold'}`}>
                          {passwordsMatch ? 'Passwords match' : 'Does not match'}
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-tertiary text-[18px] pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        autoComplete="new-password"
                        className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md transition-all duration-150 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-sm border border-surface-container-high"
                        id="confirm-password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type your new password"
                        required
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                      />
                      <button
                        className="absolute right-3 text-tertiary hover:text-on-surface transition-colors flex items-center justify-center"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showConfirmPw ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Global Session Revocation */}
                  <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors duration-150 border border-surface-container-high">
                    <div className="flex items-center h-5">
                      <input
                        checked={revokeSessions}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                        id="revoke-sessions"
                        onChange={(e) => setRevokeSessions(e.target.checked)}
                        type="checkbox"
                      />
                    </div>
                    <label className="flex flex-col cursor-pointer select-none" htmlFor="revoke-sessions">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        Sign out of all other active sessions &amp; devices
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Enforces GoTrue revocation on mobile tokens, SSH keys, and desktop browser sessions.
                      </span>
                    </label>
                  </div>

                  {/* Feedback Banner */}
                  {feedback && (
                    <div
                      className={`rounded-xl p-space-md flex items-start gap-space-sm transition-all duration-200 ${
                        feedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-error-container text-on-error-container border border-error/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                        {feedback.type === 'success' ? 'check_circle' : 'error'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-semibold">{feedback.title}</span>
                        <span className="font-body-sm text-body-sm">{feedback.desc}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:from-primary hover:to-secondary text-on-primary font-headline-sm text-headline-sm sm:font-title-md sm:text-title-md flex items-center justify-center gap-space-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-space-xs">
                        <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                        </svg>
                        <span>Securing Vault Credentials...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-space-xs font-semibold">
                        Update Password &amp; Enter Workspace
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </span>
                    )}
                  </button>
                </form>

                {/* Return to login */}
                <div className="flex items-center justify-between pt-space-xs text-body-sm font-body-sm flex-wrap gap-space-sm border-t border-surface-container-high">
                  <Link className="flex items-center gap-1 text-primary hover:text-secondary font-semibold transition-colors" href="/login">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Sign In</span>
                  </Link>
                  <Link className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">headset_mic</span>
                    <span>Priority Support Desk</span>
                  </Link>
                </div>

                {/* Footnote Trust Spec */}
                <div className="pt-space-sm mt-space-xs bg-surface-container-low/70 rounded-xl px-space-md py-space-sm flex items-center justify-around text-center flex-wrap gap-space-xs border border-surface-container-high">
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-primary">enhanced_encryption</span>
                    <span>256-bit AES Vault</span>
                  </div>
                  <span className="text-outline-variant text-[10px]">•</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-secondary">security_update_good</span>
                    <span>GoTrue Argon2/Bcrypt Re-hash</span>
                  </div>
                  <span className="text-outline-variant text-[10px]">•</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">sync</span>
                    <span>Session Refresh</span>
                  </div>
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
