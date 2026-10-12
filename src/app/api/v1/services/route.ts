import { NextResponse, type NextRequest } from 'next/server'
import { STANDARD_SERVICES } from '@/lib/catalog-data'
import { getCached, setCached } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const maxPrice = Number(searchParams.get('max_price')) || 0

  const cacheKey = `catalog:services:${request.url}`
  const cached = await getCached<any>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  let services = STANDARD_SERVICES.filter((svc) => {
    if (category && svc.category.toLowerCase() !== category.toLowerCase()) {
      return false
    }
    if (maxPrice > 0 && svc.priceFloor > maxPrice) {
      return false
    }
    return true
  })

  const payload = {
    data: services,
    total: services.length,
    escrow_status: 'CM-IN_3_DAY_HOLD_ACTIVE',
  }

  await setCached(cacheKey, payload, ['catalog', 'services'])

  return NextResponse.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
  })
}
