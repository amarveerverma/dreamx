import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
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
        created_at,
        profiles:mentor_id (
          id,
          full_name,
          avatar_url,
          headline,
          bio
        ),
        program_milestones (
          id,
          week_number,
          title,
          deliverable_schema,
          estimated_hours
        )
      `)
      .is('deleted_at', null);

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: program, error: programError } = await query.single();

    if (programError) {
      console.error('Error fetching program:', programError);
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/programs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
