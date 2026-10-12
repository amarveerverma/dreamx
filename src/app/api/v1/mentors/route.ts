import { NextResponse, type NextRequest } from 'next/server'
import { MENTORS_CATALOG } from '@/lib/catalog-data'
import { getCached, setCached } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase() || ''
  const marketId = searchParams.get('market_id') || searchParams.get('career_market_id') || ''
  const serviceTypeSlug = searchParams.get('service_type_slug') || ''
  const maxPrice = Number(searchParams.get('max_price') || searchParams.get('max_price_inr')) || 0
  const minRating = Number(searchParams.get('min_rating')) || 0
  const company = searchParams.get('company')?.toLowerCase() || ''
  const sortBy = searchParams.get('sort_by') || searchParams.get('sort') || 'rating_desc'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))

  const cacheKey = `catalog:mentors:${request.url}`
  const cachedResponse = await getCached<any>(cacheKey)
  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  let filtered = MENTORS_CATALOG.filter((mentor) => {
    if (q) {
      const matchText = `${mentor.fullName} ${mentor.headline} ${mentor.bio} ${mentor.currentCompany} ${mentor.skills.join(' ')}`.toLowerCase()
      if (!matchText.includes(q)) return false
    }
    if (marketId && !mentor.marketsServed.includes(marketId)) {
      return false
    }
    if (serviceTypeSlug && !mentor.services.some((s) => s.slug === serviceTypeSlug && s.isActive)) {
      return false
    }
    if (maxPrice > 0 && mentor.startingPriceInr > maxPrice) {
      return false
    }
    if (minRating > 0 && mentor.rollingRating < minRating) {
      return false
    }
    if (company && !mentor.currentCompany.toLowerCase().includes(company) && !mentor.pastCompanies.some((c) => c.toLowerCase().includes(company))) {
      return false
    }
    return true
  })

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'price_asc') return a.startingPriceInr - b.startingPriceInr
    if (sortBy === 'price_desc') return b.startingPriceInr - a.startingPriceInr
    if (sortBy === 'experience_desc') return b.yearsExperience - a.yearsExperience
    return b.rollingRating - a.rollingRating // rating_desc default
  })

  const totalRecords = filtered.length
  const startIndex = (page - 1) * limit
  const paginatedData = filtered.slice(startIndex, startIndex + limit)

  const payload = {
    data: paginatedData,
    pagination: {
      total_records: totalRecords,
      page,
      limit,
      has_next_page: startIndex + limit < totalRecords,
      total_pages: Math.ceil(totalRecords / limit),
    },
  }

  await setCached(cacheKey, payload, ['catalog', 'mentors'])

  return NextResponse.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
  })
}
