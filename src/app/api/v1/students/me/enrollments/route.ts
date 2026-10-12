import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch enrollments for the student
    const { data: enrollments, error: fetchError } = await supabase
      .from('program_enrollments')
      .select(`
        id,
        cohort_start_date,
        status,
        created_at,
        programs (
          id,
          title,
          slug,
          duration_weeks,
          profiles:mentor_id (
            id,
            full_name,
            avatar_url
          )
        ),
        program_session_checkins (
          id,
          week_number,
          status
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching student enrollments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: enrollments });
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/students/me/enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
