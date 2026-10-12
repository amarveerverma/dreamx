'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ForbiddenPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(19,27,46,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <Link className="flex items-center gap-space-sm group" href="/">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm shadow-sm transition-transform group-hover:scale-105">
              D
            </div>
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold">
              Dream<span className="text-primary">X</span>
            </span>
          </Link>
          <div className="flex items-center gap-space-md">
            <Link
              className="px-space-md py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:text-on-surface hover:bg-surface-container transition-colors"
              href="/login"
            >
              Sign In
            </Link>
            <Link
              className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-all hover:shadow"
              href="/signup"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-28 pb-16 px-margin flex-1 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center flex flex-col items-center">
          {/* Security Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span>HTTP 403 • ACCESS_DENIED</span>
          </div>

          {/* Icon Badge */}
          <div className="w-20 h-20 rounded-2xl bg-surface-container-high border border-surface-variant flex items-center justify-center text-error shadow-sm mb-6">
            <span className="material-symbols-outlined text-[44px]">shield_person</span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-4xl text-on-surface font-bold tracking-tight mb-4">
            Permission Restricted
          </h1>

          <p className="font-body-lg text-on-surface-variant max-w-md mx-auto mb-8">
            Your current account role does not have authorization to view this resource. 
            Access is enforced by our PostgreSQL kernel Zero-Trust RBAC security layer.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              href="/"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Return to Home
            </Link>
            <button
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center justify-center gap-2"
              onClick={handleSignOut}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">switch_account</span>
              Switch Account
            </button>
          </div>

          {/* Security Details Footer Card */}
          <div className="mt-12 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high text-left w-full">
            <div className="flex items-center gap-2 text-on-surface font-label-sm text-label-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
              <span>Zero-Trust Architecture Note</span>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              DreamX enforces role-based access control at both the edge middleware and database row level security (RLS). If you believe this role assignment is in error, please contact platform administrators.
            </p>
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
