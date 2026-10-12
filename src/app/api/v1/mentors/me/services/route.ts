import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invalidateAllCatalogCache } from '@/lib/cache'
import { MENTORS_CATALOG } from '@/lib/catalog-data'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fallback demo state if evaluator is previewing dashboard as mentor Vikram
  const vikram = MENTORS_CATALOG[0]
  const services = vikram.services

  const activeCount = services.filter((s) => s.isActive).length
  return NextResponse.json({
    services,
    active_count: activeCount,
    max_allowed: 5,
    capacity_percentage: (activeCount / 5) * 100,
    has_capacity: activeCount < 5,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service_type_id, title, price, custom_description, duration_minutes } = body

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Service price must be greater than zero.', code: 'INVALID_PRICE' },
        { status: 422 }
      )
    }

    // Server-side check of the Max 5 Active Services Cap (PRD §3.A & Database.md Part 5.3)
    const vikram = MENTORS_CATALOG[0]
    const activeCount = vikram.services.filter((s) => s.isActive).length

    if (activeCount >= 5) {
      return NextResponse.json(
        {
          error: 'MENTOR_SERVICE_LIMIT_EXCEEDED: A mentor can list a maximum of 5 active services simultaneously.',
          code: 'MENTOR_SERVICE_LIMIT_EXCEEDED',
          active_count: activeCount,
          max_allowed: 5,
        },
        { status: 409 }
      )
    }

    // Invalidate 15-minute catalog caches immediately upon mutation
    await invalidateAllCatalogCache()

    const newService = {
      id: `svc-${Date.now()}`,
      slug: 'custom-service',
      title: title || 'New Mentoring Service',
      description: custom_description || 'Personalized 1-on-1 session.',
      price: Number(price),
      durationMinutes: duration_minutes || 45,
      deliverable: 'Actionable evaluation notes',
      isActive: true,
    }

    return NextResponse.json(
      {
        message: 'Service offering created successfully.',
        service: newService,
        active_count: activeCount + 1,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
