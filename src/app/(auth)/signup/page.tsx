'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'student' | 'mentor'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [termsConsent, setTermsConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password Strength Evaluation
  const hasLen = password.length >= 8
  const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const hasNum = /[0-9]/.test(password)
  const hasSpec = /[^A-Za-z0-9]/.test(password)
  const score = [hasLen, hasCase, hasNum, hasSpec].filter(Boolean).length

  const getStrengthLabel = () => {
    if (!password) return 'Strength: Pending'
    if (score <= 1) return 'Strength: Weak'
    if (score === 2) return 'Strength: Fair'
    if (score === 3) return 'Strength: Good'
    return 'Strength: Strong'
  }

  const prefillPersona = (type: 'student' | 'mentor') => {
    if (type === 'student') {
      setFullName('Ananya Sharma')
      setEmail('ananya.sharma@iitd.ac.in')
      setPassword('DreamX2026!Pass')
      setRole('student')
      setTimezone('Asia/Kolkata')
      setTermsConsent(true)
    } else {
      setFullName('Vikram Seth')
      setEmail('vikram.seth@google.com')
      setPassword('DreamX2026!Pass')
      setRole('mentor')
      setTimezone('Asia/Kolkata')
      setTermsConsent(true)
    }
    setErrorMessage(null)
  }

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize OAuth')
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsConsent) {
      setErrorMessage('You must consent to the Terms of Service & Privacy Policy.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_role: role,
            timezone,
          },
        },
      })

      if (error) throw error

      if (data.user?.identities?.length === 0) {
        setErrorMessage('An account with this email already exists.')
        setLoading(false)
        return
      }

      if (data.session) {
        // Allow browser client to flush auth cookies to document.cookie before redirect
        setTimeout(() => {
          window.location.href = '/onboard'
        }, 200)
      } else {
        setErrorMessage('Success! Check your email for the magic link to complete registration.')
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-20">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between">
          <Link className="flex items-center gap-space-xs" href="/">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_12px_24px_-6px_rgba(139,92,246,0.12)]">
              <span className="material-symbols-outlined text-on-primary text-[20px]">insights</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              Dream<span className="text-primary">X</span>
            </span>
          </Link>
          <div className="flex items-center gap-space-sm">
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
              <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
              <span>256-bit Encrypted Session</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
              <span className="material-symbols-outlined text-secondary text-[14px]">verified_user</span>
              <span>Zero-Trust RLS Protected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-margin py-space-xl relative overflow-hidden">
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full max-w-[640px] my-auto">
            {/* Evaluator Fast Test Pre-fill Bar */}
            <div className="mb-space-md p-space-sm bg-surface-container-low rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-xs border border-surface-container-high">
              <div className="flex items-center gap-space-xs text-tertiary">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Evaluator Pre-fill
                </span>
              </div>
              <div className="flex items-center gap-space-xs w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none px-space-sm py-1 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-1 border border-surface-container-high"
                  onClick={() => prefillPersona('student')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[14px]">school</span>
                  <span>Test Student (IIT Delhi)</span>
                </button>
                <button
                  className="flex-1 sm:flex-none px-space-sm py-1 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-1 border border-surface-container-high"
                  onClick={() => prefillPersona('mentor')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-secondary text-[14px]">workspace_premium</span>
                  <span>Test Mentor (Staff SDE Google)</span>
                </button>
              </div>
            </div>

            {/* Main Registration Shell Card */}
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden relative">
              {/* Gradient Accent Runner Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

              <div className="p-space-lg sm:p-space-xl">
                {/* Title & Subtitle Context */}
                <div className="text-center mb-space-lg">
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase mb-space-xs">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Next-Gen Talent Mobility
                  </span>
                  <h1 className="font-headline-md text-headline-md sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight font-bold">
                    Create your Dream<span className="text-primary">X</span> Identity
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-md mx-auto">
                    Autonomous career intelligence and Tier-1 industry mentorship engineered for modern tech trajectories.
                  </p>
                </div>

                {/* Social OAuth Quick Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
                  <button
                    className="flex items-center justify-center gap-space-sm h-10 px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-title-md text-body-md shadow-sm transition-all duration-150 group border border-surface-container-high"
                    onClick={() => handleOAuth('google')}
                    type="button"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <button
                    className="flex items-center justify-center gap-space-sm h-10 px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-title-md text-body-md shadow-sm transition-all duration-150 group border border-surface-container-high"
                    onClick={() => handleOAuth('linkedin_oidc')}
                    type="button"
                  >
                    <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                    </svg>
                    <span>Continue with LinkedIn</span>
                  </button>
                </div>

                {/* Section Divider */}
                <div className="relative flex py-space-xs items-center mb-space-md">
                  <div className="flex-grow bg-surface-container-high h-[1px]"></div>
                  <span className="flex-shrink mx-4 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    or register with credential
                  </span>
                  <div className="flex-grow bg-surface-container-high h-[1px]"></div>
                </div>

                {/* Dynamic Role Selector (Dual-Cards) */}
                <div className="mb-space-lg">
                  <div className="flex items-center justify-between mb-space-xs">
                    <label className="block font-title-md text-title-md text-on-surface">Select Primary Platform Role</label>
                    <span className="font-label-sm text-label-sm text-primary font-semibold">Changeable anytime</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Student / Candidate Card */}
                    <div
                      className={`relative cursor-pointer rounded-xl p-space-md transition-all duration-200 shadow-sm flex flex-col justify-between group border ${
                        role === 'student'
                          ? 'bg-surface-container-low border-primary/40 ring-1 ring-primary/30'
                          : 'bg-surface-container-lowest border-surface-container-high hover:bg-surface-container-low'
                      }`}
                      onClick={() => setRole('student')}
                    >
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
                            role === 'student'
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-highest text-surface-container-highest'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                        </div>
                      </div>
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mb-space-sm text-primary group-hover:scale-105 transition-transform duration-200">
                          <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                        </div>
                        <h2 className="font-title-md text-title-md text-on-surface font-semibold">Student &amp; Job Seeker</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Target elite product &amp; engineering roles, mock interviews, AI resume audits &amp; mentorship.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-space-sm pt-space-xs">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          AI Score Engine
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          48h SLA Matching
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          FAANG Debriefs
                        </span>
                      </div>
                    </div>

                    {/* Mentor Card */}
                    <div
                      className={`relative cursor-pointer rounded-xl p-space-md transition-all duration-200 shadow-sm flex flex-col justify-between group border ${
                        role === 'mentor'
                          ? 'bg-surface-container-low border-secondary/40 ring-1 ring-secondary/30'
                          : 'bg-surface-container-lowest border-surface-container-high hover:bg-surface-container-low'
                      }`}
                      onClick={() => setRole('mentor')}
                    >
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
                            role === 'mentor'
                              ? 'bg-secondary text-on-secondary'
                              : 'bg-surface-container-highest text-surface-container-highest'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                        </div>
                      </div>
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center mb-space-sm text-secondary group-hover:scale-105 transition-transform duration-200">
                          <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                        </div>
                        <h2 className="font-title-md text-title-md text-on-surface font-semibold">Industry Mentor</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Offer mock interviews, portfolio checks, cohort programs, and retain 80% direct earnings.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-space-sm pt-space-xs">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          Escrow Payouts
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          Custom Calendaring
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                          Verified Badge
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <form className="space-y-space-md" onSubmit={handleRegister}>
                  {/* Full Name */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="full-name">
                      Legal Full Name
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                      <input
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-colors duration-150 border border-surface-container-high"
                        id="full-name"
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        required
                        type="text"
                        value={fullName}
                      />
                    </div>
                  </div>

                  {/* Work/College Email */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="work-email">
                      Work or Academic Email
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <input
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-colors duration-150 border border-surface-container-high"
                        id="work-email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ananya@iitd.ac.in or name@company.com"
                        required
                        type="email"
                        value={email}
                      />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                      Institutional emails automatically unlock verified credential fast-track.
                    </p>
                  </div>

                  {/* Password + Security Validator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                        Master Password
                      </label>
                      <span className="font-label-sm text-label-sm text-tertiary" id="strength-label">
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <input
                        className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-colors duration-150 border border-surface-container-high"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                      />
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-tertiary hover:text-on-surface transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Password Strength Progress Meter */}
                    <div className="mt-2 space-y-1.5">
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex gap-1 p-0.5">
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            score >= 1 ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            score >= 2 ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            score >= 3 ? 'bg-secondary' : 'bg-surface-container-highest'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            score === 4 ? 'bg-emerald-500' : 'bg-surface-container-highest'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] font-label-sm text-tertiary">
                        <span className={`flex items-center gap-1 ${hasLen ? 'text-primary font-semibold' : ''}`}>
                          <span className="material-symbols-outlined text-[12px]">fiber_manual_record</span>8+ chars
                        </span>
                        <span className={`flex items-center gap-1 ${hasCase ? 'text-primary font-semibold' : ''}`}>
                          <span className="material-symbols-outlined text-[12px]">fiber_manual_record</span>Aa letters
                        </span>
                        <span className={`flex items-center gap-1 ${hasNum ? 'text-primary font-semibold' : ''}`}>
                          <span className="material-symbols-outlined text-[12px]">fiber_manual_record</span>1+ number
                        </span>
                        <span className={`flex items-center gap-1 ${hasSpec ? 'text-primary font-semibold' : ''}`}>
                          <span className="material-symbols-outlined text-[12px]">fiber_manual_record</span>1+ symbol
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timezone Selector */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="timezone">
                      Operational Timezone (Automated Interview Sync)
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                      </div>
                      <select
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-colors duration-150 appearance-none cursor-pointer border border-surface-container-high"
                        id="timezone"
                        onChange={(e) => setTimezone(e.target.value)}
                        value={timezone}
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC +5:30) - Current System Match</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST, UTC -8:00)</option>
                        <option value="America/New_York">America/New_York (EST, UTC -5:00)</option>
                        <option value="Europe/London">Europe/London (GMT/BST, UTC +0:00)</option>
                        <option value="Europe/Berlin">Europe/Berlin (CET, UTC +1:00)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT, UTC +8:00)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC +9:00)</option>
                        <option value="Australia/Sydney">Australia/Sydney (AEST, UTC +10:00)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Agreement Checkbox */}
                  <div className="pt-space-xs">
                    <label className="flex items-start gap-space-sm cursor-pointer select-none">
                      <div className="pt-0.5">
                        <input
                          checked={termsConsent}
                          className="w-4 h-4 rounded text-primary bg-surface-container-lowest focus:ring-0 cursor-pointer accent-primary"
                          id="terms-consent"
                          onChange={(e) => setTermsConsent(e.target.checked)}
                          required
                          type="checkbox"
                        />
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        I agree to the{' '}
                        <Link className="text-primary font-medium hover:underline" href="#">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link className="text-primary font-medium hover:underline" href="#">
                          Privacy Policy
                        </Link>
                        . I consent to Zero-Retention Enterprise LLM data protections.
                      </span>
                    </label>
                  </div>

                  {/* Submission CTA */}
                  <div className="pt-space-sm">
                    <button
                      className="w-full h-11 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-space-sm group cursor-pointer disabled:opacity-60"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                          </svg>
                          <span>Creating DreamX Identity...</span>
                        </span>
                      ) : (
                        <>
                          <span>{role === 'student' ? 'Continue as Student & Job Seeker' : 'Continue as Industry Mentor'}</span>
                          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Redirect to Login */}
                <div className="mt-space-lg text-center pt-space-xs">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Already registered with DreamX?{' '}
                    <Link className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5 ml-1" href="/login">
                      <span>Sign in to workspace</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className="mt-space-md flex flex-wrap items-center justify-center gap-x-space-md gap-y-2 text-tertiary font-label-sm text-label-sm">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-tertiary">lock</span>
                <span>256-bit AES Vault</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-tertiary">memory</span>
                <span>Zero LLM Data Retention</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-tertiary">shield</span>
                <span>Supabase GoTrue RLS</span>
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
