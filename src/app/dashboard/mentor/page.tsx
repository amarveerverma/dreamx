import Link from 'next/link'

export default async function MentorDashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mentor Dashboard</h1>
      <p className="mb-4">Welcome to your DreamX workspace.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/mentor/programs" className="p-6 bg-surface-container-low rounded-xl shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
          <h2 className="text-xl font-semibold mb-2">My Cohorts</h2>
          <p className="text-tertiary">Manage your structured mentorship programs.</p>
        </Link>
        <Link href="/dashboard/mentor/services" className="p-6 bg-surface-container-low rounded-xl shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
          <h2 className="text-xl font-semibold mb-2">Services</h2>
          <p className="text-tertiary">Manage your 1:1 mentorship services.</p>
        </Link>
        <Link href="/dashboard/mentor/earnings" className="p-6 bg-surface-container-low rounded-xl shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span>Earnings &amp; Payouts</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Phase 6</span>
          </h2>
          <p className="text-tertiary">Track released earnings, 72h escrow holds, and gateway transfers.</p>
        </Link>
        <Link href="/dashboard/mentor/bookings" className="p-6 bg-surface-container-low rounded-xl shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
          <h2 className="text-xl font-semibold mb-2">Bookings &amp; Sessions</h2>
          <p className="text-tertiary">View confirmed sessions and upload outcome deliverables.</p>
        </Link>
      </div>
    </div>
  )
}
