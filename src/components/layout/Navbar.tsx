'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  activePage?: 'discover' | 'services' | 'programs' | 'mentors' | 'pricing'
}

export function Navbar({ activePage }: NavbarProps) {
  const pathname = usePathname()

  const openCommandMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-command-menu'))
    }
  }

  const isCurrent = (page: string) => {
    if (activePage) return activePage === page
    if (page === 'mentors') return pathname?.startsWith('/mentors')
    if (page === 'services') return pathname?.startsWith('/services')
    if (page === 'programs') return pathname?.startsWith('/programs')
    if (page === 'discover') return pathname === '/'
    return false
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-[1400px] mx-auto px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xl">
          <Link className="flex items-center gap-space-sm group focus:outline-none" href="/">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_12px_24px_-6px_rgba(139,92,246,0.12)]">
              <span className="font-headline-sm text-headline-sm text-on-primary font-bold">D</span>
            </div>
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">
              Dream<span className="text-primary">X</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-space-lg">
            <Link
              className={`font-body-md text-body-md transition-colors duration-150 ${
                isCurrent('discover') ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              href="/"
            >
              Discover
            </Link>
            <Link
              className={`font-body-md text-body-md transition-colors duration-150 ${
                isCurrent('services') ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              href="/services"
            >
              Services
            </Link>
            <Link
              className={`font-body-md text-body-md transition-colors duration-150 ${
                isCurrent('programs') ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              href="/programs"
            >
              Programs
            </Link>
            <Link
              className={`font-body-md text-body-md transition-colors duration-150 ${
                isCurrent('mentors') ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              href="/mentors"
            >
              Mentors
            </Link>
            <Link
              className={`font-body-md text-body-md transition-colors duration-150 ${
                isCurrent('pricing') ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              href="/services"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          <button
            onClick={openCommandMenu}
            className="hidden sm:flex items-center gap-space-sm h-10 px-space-md bg-surface-container-lowest rounded-lg shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06)] hover:bg-surface-container-low transition-all duration-150 group cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">neurology</span>
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface font-medium">
              Search &amp; AI
            </span>
            <div className="flex items-center gap-space-xs ml-space-xs">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                ⌘K
              </span>
              <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                50 AI Cr
              </span>
            </div>
          </button>
          <Link
            className="hidden md:inline-flex font-body-md text-body-md font-semibold text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors duration-150"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="h-10 px-space-lg rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-body-md text-body-md font-semibold inline-flex items-center justify-center shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06)] transition-all duration-150 active:scale-[0.99]"
            href="/signup"
          >
            Join Workspace
          </Link>
          <Link
            href="/dashboard/mentor/services"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
            title="Mentor Dashboard"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
