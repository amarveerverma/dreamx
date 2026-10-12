import { NextResponse, type NextRequest } from 'next/server'
import { MENTORS_CATALOG, STANDARD_SERVICES } from '@/lib/catalog-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase().trim() || ''

  if (!q) {
    return NextResponse.json({
      mentors: MENTORS_CATALOG.slice(0, 4).map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.fullName,
        subtitle: `${m.currentRole} @ ${m.currentCompany}`,
        rating: m.rollingRating,
        price: m.startingPriceInr,
        avatarUrl: m.avatarUrl,
        type: 'mentor',
      })),
      services: STANDARD_SERVICES.slice(0, 4).map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        subtitle: `${s.durationMinutes} mins • Deliverable rubric`,
        price: s.medianPrice,
        category: s.category,
        type: 'service',
      })),
      actions: [
        { title: 'Explore All Mentors', url: '/mentors', icon: 'groups' },
        { title: 'Browse 10 Standard Services', url: '/services', icon: 'category' },
        { title: 'View Pricing & Memberships', url: '/pricing', icon: 'payments' },
      ],
    })
  }

  const matchingMentors = MENTORS_CATALOG.filter((m) => {
    const text = `${m.fullName} ${m.headline} ${m.bio} ${m.currentCompany} ${m.skills.join(' ')}`.toLowerCase()
    return text.includes(q)
  }).slice(0, 5).map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.fullName,
    subtitle: `${m.currentRole} @ ${m.currentCompany}`,
    rating: m.rollingRating,
    price: m.startingPriceInr,
    avatarUrl: m.avatarUrl,
    type: 'mentor',
  }))

  const matchingServices = STANDARD_SERVICES.filter((s) => {
    const text = `${s.title} ${s.shortDescription} ${s.category}`.toLowerCase()
    return text.includes(q)
  }).slice(0, 5).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    subtitle: `${s.durationMinutes} mins • ${s.category}`,
    price: s.medianPrice,
    category: s.category,
    type: 'service',
  }))

  return NextResponse.json({
    query: q,
    mentors: matchingMentors,
    services: matchingServices,
    total_matches: matchingMentors.length + matchingServices.length,
  })
}
