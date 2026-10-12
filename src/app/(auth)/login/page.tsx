'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activeRole, setActiveRole] = useState<'seeker' | 'mentor'>('seeker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRoleSwitch = (role: 'seeker' | 'mentor') => {
    setActiveRole(role)
    setErrorMessage(null)
  }

  const fillDemoCredentials = (demoEmail: string, role: 'seeker' | 'mentor') => {
    setEmail(demoEmail)
    setPassword('CareerMobility2025!')
    setActiveRole(role)
    setErrorMessage(null)
    setStatusMessage(`Auto-filled ${role === 'seeker' ? 'Job Seeker' : 'Mentor'} credentials. Ready to submit!`)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setLoading(true)
    setErrorMessage(null)
    setStatusMessage(`Redirecting to ${provider === 'google' ? 'Google' : 'LinkedIn'} OAuth verification pipeline...`)
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
      setStatusMessage(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setStatusMessage(`Verifying token session for ${email}...`)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setStatusMessage('Authentication successful! Launching workspace...')
      const userRole = data.user?.app_metadata?.user_role || (activeRole === 'mentor' ? 'mentor' : 'student')
      router.push(`/dashboard/${userRole}`)
      router.refresh()
      setTimeout(() => {
        window.location.href = `/dashboard/${userRole}`
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.')
      setStatusMessage(null)
    } finally {
      // Small timeout allows unmount to happen before flipping state if successful
      setTimeout(() => setLoading(false), 2000)
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Header */}
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

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-margin py-space-xl relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-gradient-to-b from-primary-fixed-dim/30 to-transparent blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[640px] mx-auto relative z-10">
          <div className="flex flex-col w-full">
            {/* Elevated Clean Card Surface */}
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl p-space-md sm:p-space-xl relative overflow-hidden">
              {/* Ambient Spectral Runner */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

              {/* Header Section */}
              <div className="text-center mb-space-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container/10 text-primary mb-space-sm shadow-sm">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    insights
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                  Welcome Back
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Your career mobility operating system awaits
                </p>
              </div>

              {/* Quick Role Context Switcher */}
              <div className="relative bg-surface-container-low p-1 rounded-lg flex items-center mb-space-lg text-center" role="tablist">
                <button
                  aria-selected={activeRole === 'seeker'}
                  className={`flex-1 flex items-center justify-center gap-space-xs py-2 px-3 rounded-md font-label-md text-label-md transition-all duration-200 ${
                    activeRole === 'seeker'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface font-medium'
                  }`}
                  onClick={() => handleRoleSwitch('seeker')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                  <span>Student &amp; Job Seeker</span>
                </button>

                <button
                  aria-selected={activeRole === 'mentor'}
                  className={`flex-1 flex items-center justify-center gap-space-xs py-2 px-3 rounded-md font-label-md text-label-md transition-all duration-200 ${
                    activeRole === 'mentor'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface font-medium'
                  }`}
                  onClick={() => handleRoleSwitch('mentor')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">workspace_premium</span>
                  <span>Industry Mentor</span>
                </button>
              </div>

              {/* Social OAuth Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
                <button
                  className="flex items-center justify-center gap-space-sm h-11 px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm transition-all duration-150 active:scale-[0.99] group border border-surface-container-high"
                  onClick={() => handleOAuth('google')}
                  type="button"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
                    <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  className="flex items-center justify-center gap-space-sm h-11 px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm transition-all duration-150 active:scale-[0.99] group border border-surface-container-high"
                  onClick={() => handleOAuth('linkedin_oidc')}
                  type="button"
                >
                  <svg className="w-4 h-4 fill-[#0A66C2] transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>

              {/* Visual Divider */}
              <div className="relative flex items-center justify-center mb-space-lg">
                <div className="w-full h-[1px] bg-surface-container-high"></div>
                <span className="absolute px-3 bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  or continue with credentials
                </span>
              </div>

              {/* Sign In Form */}
              <form className="space-y-space-md" onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="email">
                    <span>Email address</span>
                    <span className={`font-label-sm text-label-sm font-medium ${activeRole === 'seeker' ? 'text-primary' : 'text-secondary'}`}>
                      {activeRole === 'seeker' ? 'Student & Seeker Login' : 'Verified Mentor Portal'}
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">mail</span>
                    <input
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-150 border border-surface-container-high"
                      id="email"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@college.edu or name@company.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="password">
                      Password
                    </label>
                    <Link className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors" href="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">lock</span>
                    <input
                      autoComplete="current-password"
                      className="w-full h-11 pl-10 pr-11 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all duration-150 border border-surface-container-high"
                      id="password"
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-3 p-1 text-outline hover:text-on-surface focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="font-body-sm text-body-sm text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>

                {/* Remember Device Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-space-sm cursor-pointer select-none">
                    <input
                      checked={rememberDevice}
                      className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
                      id="remember-device"
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface">Remember this device for 30 days</span>
                  </label>
                  <span className="hidden sm:inline-block font-label-sm text-label-sm text-tertiary">Rotating token</span>
                </div>

                {/* Submit Action Button */}
                <button
                  className="w-full h-11 px-space-lg rounded-lg bg-primary hover:bg-primary-container active:bg-on-primary-fixed-variant text-on-primary font-title-md text-title-md flex items-center justify-center gap-space-sm shadow-md transition-all duration-150 mt-space-md cursor-pointer disabled:opacity-60"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                      </svg>
                      <span className="font-body-sm text-body-sm font-medium">Authenticating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>Sign In to DreamX</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </span>
                  )}
                </button>

                {/* Status Notification Banner */}
                {statusMessage && (
                  <div className="p-space-sm rounded-lg bg-surface-container text-on-surface-variant font-body-sm text-body-sm flex items-center gap-space-xs transition-opacity duration-200">
                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                    <span>{statusMessage}</span>
                  </div>
                )}
              </form>

              {/* Demo Evaluator Credentials Ribbon */}
              <div className="mt-space-lg p-space-sm rounded-lg bg-surface-container-low shadow-sm border border-surface-container-high">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">badge</span> Evaluator Quick Fill
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Click to autofill</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    className="flex-1 min-w-[140px] text-left px-2.5 py-1.5 rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors font-body-sm text-body-sm text-on-surface flex items-center justify-between group shadow-xs"
                    onClick={() => fillDemoCredentials('student@dreamx.com', 'seeker')}
                    type="button"
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Job Seeker</span>
                      <span className="truncate font-mono text-label-sm text-primary">student@dreamx.com</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">touch_app</span>
                  </button>
                  <button
                    className="flex-1 min-w-[140px] text-left px-2.5 py-1.5 rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors font-body-sm text-body-sm text-on-surface flex items-center justify-between group shadow-xs"
                    onClick={() => fillDemoCredentials('mentor.google@dreamx.com', 'mentor')}
                    type="button"
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Senior Mentor</span>
                      <span className="truncate font-mono text-label-sm text-secondary">mentor.google@dreamx.com</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-secondary transition-colors">touch_app</span>
                  </button>
                  <button
                    className="flex-1 min-w-[140px] text-left px-2.5 py-1.5 rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors font-body-sm text-body-sm text-on-surface flex items-center justify-between group shadow-xs"
                    onClick={() => fillDemoCredentials('vermaamarveeer0@gamail.com', 'seeker')}
                    type="button"
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Your Account</span>
                      <span className="truncate font-mono text-label-sm text-primary">vermaamarveeer0@gamail.com</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">touch_app</span>
                  </button>
                </div>
              </div>

              {/* Security & Architecture Trust Chips */}
              <div className="mt-space-md pt-space-sm flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 font-label-sm text-label-sm text-tertiary">
                  <span className="inline-flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px] text-primary">lock</span> 256-bit AES
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px] text-secondary">verified_user</span> RLS Enforced
                  </span>
                  <span>•</span>
                  <span>1h Short-lived JWT • 30d Rotating Refresh</span>
                </div>
              </div>

              {/* Bottom Registration Redirection */}
              <div className="mt-space-lg pt-space-md bg-surface-container-low/60 -mx-space-md sm:-mx-space-xl -mb-space-md sm:-mb-space-xl p-space-md text-center border-t border-surface-container-high">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Don&apos;t have an account?{' '}
                  <Link className="font-label-md text-label-md text-primary font-bold hover:underline transition-all ml-1" href="/signup">
                    Sign up free →
                  </Link>
                </p>
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
