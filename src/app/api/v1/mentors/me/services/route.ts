import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invalidateAllCatalogCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to manage mentor services.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('mentor_services')
      .select(`
        id,
        mentor_id,
        service_type_id,
        price,
        currency,
        custom_description,
        is_active,
        created_at,
        updated_at,
        service_types (
          id,
          slug,
          title,
          description,
          default_duration_minutes,
          deliverable_schema
        )
      `)
      .eq('mentor_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[MENTOR SERVICES] Query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const services = (data || []).map((row: any) => {
      const st = row.service_types
      let deliverable = 'Standard 4-Page Rubric (24h SLA)'
      if (st?.deliverable_schema?.template) {
        deliverable = `${st.deliverable_schema.template} (24h SLA)`
      }
      return {
        id: row.id,
        serviceTypeId: row.service_type_id,
        slug: st?.slug || 'service',
        title: st?.title || 'Mentoring Service',
        description: row.custom_description || st?.description || '',
        price: Number(row.price),
        currency: row.currency || 'INR',
        durationMinutes: st?.default_duration_minutes || 60,
        deliverable,
        isActive: row.is_active,
        createdAt: row.created_at,
      }
    })

    const activeCount = services.filter((s: any) => s.isActive).length

    return NextResponse.json({
      services,
      active_count: activeCount,
      max_allowed: 5,
      capacity_percentage: (activeCount / 5) * 100,
      has_capacity: activeCount < 5,
    })
  } catch (err: any) {
    console.error('[MENTOR SERVICES GET] Exception:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to manage mentor services.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    let { service_type_id, slug, price, custom_description, currency } = body

    const numericPrice = Number(price)
    if (!numericPrice || numericPrice <= 0 || isNaN(numericPrice)) {
      return NextResponse.json(
        { error: 'Service price must be greater than zero.', code: 'INVALID_PRICE' },
        { status: 422 }
      )
    }

    // Resolve service_type_id if slug was passed
    if (!service_type_id && slug) {
      const { data: stRow } = await supabase
        .from('service_types')
        .select('id')
        .eq('slug', slug)
        .single()
      if (stRow) {
        service_type_id = stRow.id
      }
    }

    if (!service_type_id) {
      return NextResponse.json(
        { error: 'A valid service_type_id or slug is required.', code: 'MISSING_SERVICE_TYPE' },
        { status: 400 }
      )
    }

    // Server-side check of the Max 5 Active Services Cap
    const { count, error: countErr } = await supabase
      .from('mentor_services')
      .select('*', { count: 'exact', head: true })
      .eq('mentor_id', user.id)
      .eq('is_active', true)
      .is('deleted_at', null)

    if (countErr) {
      console.error('[MENTOR SERVICES COUNT] Error:', countErr.message)
    }

    if ((count || 0) >= 5) {
      return NextResponse.json(
        {
          error: 'MENTOR_SERVICE_LIMIT_EXCEEDED: A mentor can list a maximum of 5 active services simultaneously.',
          code: 'MENTOR_SERVICE_LIMIT_EXCEEDED',
          active_count: count,
          max_allowed: 5,
        },
        { status: 409 }
      )
    }

    // Insert or update existing deleted service
    const { data: inserted, error: insertError } = await supabase
      .from('mentor_services')
      .upsert(
        {
          mentor_id: user.id,
          service_type_id,
          price: numericPrice,
          currency: currency || 'INR',
          custom_description: custom_description || null,
          is_active: true,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'mentor_id,service_type_id' }
      )
      .select(`
        id,
        mentor_id,
        service_type_id,
        price,
        currency,
        custom_description,
        is_active,
        created_at,
        updated_at,
        service_types (
          id,
          slug,
          title,
          description,
          default_duration_minutes,
          deliverable_schema
        )
      `)
      .single()

    if (insertError) {
      console.error('[MENTOR SERVICES INSERT] Error:', insertError.message)
      if (insertError.message.includes('MENTOR_SERVICE_LIMIT_EXCEEDED') || insertError.code === '23505') {
        return NextResponse.json(
          { error: insertError.message, code: 'MENTOR_SERVICE_LIMIT_EXCEEDED' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await invalidateAllCatalogCache()

    const rawSt = (inserted as any)?.service_types
    const st = Array.isArray(rawSt) ? rawSt[0] : rawSt
    const formatted = {
      id: inserted.id,
      serviceTypeId: inserted.service_type_id,
      slug: st?.slug || 'service',
      title: st?.title || 'Mentoring Service',
      description: inserted.custom_description || st?.description || '',
      price: Number(inserted.price),
      currency: inserted.currency || 'INR',
      durationMinutes: st?.default_duration_minutes || 60,
      deliverable: st?.deliverable_schema?.template || 'Standard 4-Page Rubric (24h SLA)',
      isActive: inserted.is_active,
    }

    return NextResponse.json({
      service: formatted,
      message: 'Service activated successfully',
    }, { status: 201 })
  } catch (err: any) {
    console.error('[MENTOR SERVICES POST] Exception:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to manage mentor services.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, is_active, price, custom_description } = body

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // If activating service, verify 5-service cap
    if (is_active === true) {
      const { count } = await supabase
        .from('mentor_services')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', user.id)
        .eq('is_active', true)
        .neq('id', id)
        .is('deleted_at', null)

      if ((count || 0) >= 5) {
        return NextResponse.json(
          {
            error: 'MENTOR_SERVICE_LIMIT_EXCEEDED: A mentor can list a maximum of 5 active services simultaneously.',
            code: 'MENTOR_SERVICE_LIMIT_EXCEEDED',
          },
          { status: 409 }
        )
      }
    }

    const updatePayload: any = { updated_at: new Date().toISOString() }
    if (typeof is_active === 'boolean') updatePayload.is_active = is_active
    if (price !== undefined) {
      const numPrice = Number(price)
      if (numPrice <= 0 || isNaN(numPrice)) {
        return NextResponse.json({ error: 'Price must be greater than zero.' }, { status: 422 })
      }
      updatePayload.price = numPrice
    }
    if (custom_description !== undefined) {
      updatePayload.custom_description = custom_description
    }

    const { data: updated, error: updateErr } = await supabase
      .from('mentor_services')
      .update(updatePayload)
      .eq('id', id)
      .eq('mentor_id', user.id)
      .select(`
        id,
        mentor_id,
        service_type_id,
        price,
        currency,
        custom_description,
        is_active,
        service_types (
          id,
          slug,
          title,
          description,
          default_duration_minutes,
          deliverable_schema
        )
      `)
      .single()

    if (updateErr) {
      console.error('[MENTOR SERVICES UPDATE] Error:', updateErr.message)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    await invalidateAllCatalogCache()

    const rawSt = (updated as any)?.service_types
    const st = Array.isArray(rawSt) ? rawSt[0] : rawSt
    const formatted = {
      id: updated.id,
      serviceTypeId: updated.service_type_id,
      slug: st?.slug || 'service',
      title: st?.title || 'Mentoring Service',
      description: updated.custom_description || st?.description || '',
      price: Number(updated.price),
      currency: updated.currency || 'INR',
      durationMinutes: st?.default_duration_minutes || 60,
      deliverable: st?.deliverable_schema?.template || 'Standard 4-Page Rubric (24h SLA)',
      isActive: updated.is_active,
    }

    return NextResponse.json({ service: formatted })
  } catch (err: any) {
    console.error('[MENTOR SERVICES PATCH] Exception:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to manage mentor services.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Soft-delete per schema (set deleted_at = NOW(), is_active = false)
    const { error: delErr } = await supabase
      .from('mentor_services')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('mentor_id', user.id)

    if (delErr) {
      console.error('[MENTOR SERVICES DELETE] Error:', delErr.message)
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    await invalidateAllCatalogCache()

    return NextResponse.json({ success: true, message: 'Service removed successfully', id })
  } catch (err: any) {
    console.error('[MENTOR SERVICES DELETE] Exception:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
