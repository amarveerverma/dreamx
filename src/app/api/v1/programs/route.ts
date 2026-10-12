import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Filtering parameters
    const duration = searchParams.get('duration_weeks');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const mentorId = searchParams.get('mentor_id');
    const track = searchParams.get('track');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Start query
    let query = supabase
      .from('programs')
      .select(`
        id,
        title,
        slug,
        duration_weeks,
        price_inr,
        description,
        is_active,
        profiles:mentor_id (
          id,
          full_name,
          avatar_url,
          headline
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .is('deleted_at', null);

    // Apply filters
    if (duration) {
      query = query.eq('duration_weeks', parseInt(duration, 10));
    }
    
    if (minPrice) {
      query = query.gte('price_inr', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price_inr', parseFloat(maxPrice));
    }
    
    if (mentorId) {
      query = query.eq('mentor_id', mentorId);
    }
    
    // In Phase 3, track filtering could be implemented via a JSONB column or tags.
    // We'll skip complex tagging for this iteration unless added to schema.

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching programs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch programs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count,
        total_pages: count ? Math.ceil(count / limit) : 0,
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
