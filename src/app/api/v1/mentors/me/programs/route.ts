import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch mentor's programs
    const { data: programs, error: fetchError } = await supabase
      .from('programs')
      .select(`
        id,
        title,
        slug,
        duration_weeks,
        price_inr,
        is_active,
        created_at,
        program_enrollments (id)
      `)
      .eq('mentor_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching mentor programs:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch programs' },
        { status: 500 }
      );
    }

    // Map to include enrollment counts
    const programsWithStats = programs.map(p => ({
      ...p,
      active_cohorts_count: p.program_enrollments ? p.program_enrollments.length : 0,
      program_enrollments: undefined // hide raw data
    }));

    return NextResponse.json({ data: programsWithStats });
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/mentors/me/programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, duration_weeks, price_inr, description } = body;

    if (!title || !duration_weeks || !price_inr || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a simple slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const { data: program, error: insertError } = await supabase
      .from('programs')
      .insert({
        mentor_id: user.id,
        title,
        slug,
        duration_weeks,
        price_inr,
        description,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating program:', insertError);
      return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
    }

    return NextResponse.json({ data: program }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/v1/mentors/me/programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
