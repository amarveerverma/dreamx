import { NextResponse, type NextRequest } from 'next/server'
import { STANDARD_SERVICES, MENTORS_CATALOG } from '@/lib/catalog-data'
import { getCached, setCached } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const cacheKey = `catalog:service:${slug}`
  const cached = await getCached<any>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  const service = STANDARD_SERVICES.find((s) => s.slug === slug || String(s.id) === slug)
  if (!service) {
    return NextResponse.json(
      { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
      { status: 404 }
    )
  }

  // Find mentors who offer this service
  const offeringMentors = MENTORS_CATALOG.filter((m) =>
    m.services.some((s) => s.slug === service.slug && s.isActive)
  ).map((m) => {
    const specificService = m.services.find((s) => s.slug === service.slug)
    return {
      id: m.id,
      slug: m.slug,
      fullName: m.fullName,
      headline: m.headline,
      avatarUrl: m.avatarUrl,
      currentCompany: m.currentCompany,
      yearsExperience: m.yearsExperience,
      rollingRating: m.rollingRating,
      totalReviews: m.totalReviews,
      servicePrice: specificService?.price || service.medianPrice,
      durationMinutes: specificService?.durationMinutes || service.durationMinutes,
      deliverable: specificService?.deliverable || service.deliverableRubric.title,
    }
  })

  const payload = {
    service,
    mentors: offeringMentors,
    mentor_count: offeringMentors.length,
  }

  await setCached(cacheKey, payload, ['catalog', `service:${slug}`])

  return NextResponse.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
  })
}
