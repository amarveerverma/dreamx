import { NextResponse, type NextRequest } from 'next/server'
import { MENTORS_CATALOG } from '@/lib/catalog-data'
import { convertUTCSlotToLocal } from '@/lib/timezone'
import { getCached, setCached } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const { searchParams } = new URL(request.url)
  const tz = searchParams.get('tz') || 'Asia/Kolkata'

  const cacheKey = `mentor:profile:${slug}:${tz}`
  const cached = await getCached<any>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  const mentor = MENTORS_CATALOG.find((m) => m.slug === slug || m.id === slug)
  if (!mentor) {
    return NextResponse.json(
      { error: 'Mentor not found', code: 'MENTOR_NOT_FOUND' },
      { status: 404 }
    )
  }

  const localizedSchedules = mentor.schedules.map((slot) =>
    convertUTCSlotToLocal(
      {
        day_of_week: slot.dayOfWeek,
        start_time_utc: slot.startTimeUtc,
        end_time_utc: slot.endTimeUtc,
      },
      tz
    )
  )

  const payload = {
    mentor: {
      ...mentor,
      localized_schedules: localizedSchedules,
      target_time_zone: tz,
    },
  }

  await setCached(cacheKey, payload, ['catalog', `mentor:${slug}`])

  return NextResponse.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
  })
}
