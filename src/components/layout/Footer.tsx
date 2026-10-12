import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface pt-space-xl pb-space-xl">
      <div className="max-w-[1400px] mx-auto px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
          <div className="lg:col-span-1 space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-on-primary font-bold">D</span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary font-semibold">
                Dream<span className="text-primary-fixed-dim">X</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-surface-container-highest max-w-xs">
              The autonomous career mobility &amp; talent success marketplace. Engineered for high-conviction outcomes.
            </p>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container/10">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-surface-container-highest uppercase tracking-wider font-semibold">
                All Systems Operational
              </span>
            </div>
          </div>
          <div className="space-y-space-sm">
            <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">
              Product
            </div>
            <ul className="space-y-space-xs">
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/">
                  Career Copilot
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Outcome Simulator
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Credit Engine
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/">
                  Opportunity Exchange
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-space-sm">
            <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">
              Programs
            </div>
            <ul className="space-y-space-xs">
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Executive Fellowships
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Venture Apprentices
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/mentors">
                  1-on-1 Advisory
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Enterprise Sprints
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-space-sm">
            <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">
              Platform &amp; Verification
            </div>
            <ul className="space-y-space-xs">
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Skill Graph Engine
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Verifiable Credentials
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Market Benchmarks
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Developer API
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-space-sm">
            <div className="font-label-md text-label-md uppercase tracking-wider text-surface-container-high font-semibold">
              Legal &amp; Trust
            </div>
            <ul className="space-y-space-xs mb-space-sm">
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Privacy Architecture
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Terms of Service
                </Link>
              </li>
              <li className="h-7 flex items-center">
                <Link className="font-body-sm text-body-sm text-surface-container-highest hover:text-on-primary transition-colors duration-150" href="/services">
                  Trust Center
                </Link>
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5 pt-space-xs">
              <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-primary-fixed font-semibold">
                ISO/IEC 27001
              </span>
              <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-primary-fixed font-semibold">
                SOC-2 Type II
              </span>
              <span className="px-2 py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-secondary-fixed font-semibold">
                RLS Guarded
              </span>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-surface-container-highest font-body-sm text-body-sm">
          <p>© 2025 DreamX Technologies, Inc. All rights reserved. Precision career mobility platform.</p>
          <div className="flex items-center gap-space-lg">
            <Link className="hover:text-on-primary transition-colors duration-150" href="/services">
              Security Audits
            </Link>
            <Link className="hover:text-on-primary transition-colors duration-150" href="/services">
              GDPR Compliance
            </Link>
            <Link className="hover:text-on-primary transition-colors duration-150" href="/services">
              Acceptable Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
