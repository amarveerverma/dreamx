import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/env.mjs'
import Link from 'next/link'

export default async function StudentDashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p className="mb-4">Welcome to your DreamX workspace.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/student/programs" className="p-6 bg-surface-container-low rounded-xl shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
          <h2 className="text-xl font-semibold mb-2">My Programs</h2>
          <p className="text-tertiary">View and manage your active structured mentorship cohorts.</p>
        </Link>
        <div className="p-6 bg-surface-container-low rounded-xl shadow-sm border border-surface-container-high opacity-70">
          <h2 className="text-xl font-semibold mb-2">Career Journey</h2>
          <p className="text-tertiary">Coming soon in Phase 4.</p>
        </div>
      </div>
    </div>
  )
}
