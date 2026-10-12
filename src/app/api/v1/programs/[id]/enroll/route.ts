import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id: programId } = params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Extract requested cohort start date from body
    // let cohortStartDate = new Date().toISOString().split('T')[0];
    let reqBody = {};
    try {
      reqBody = await request.json();
    } catch {}
    const cohortStartDate = (reqBody as any).cohort_start_date || new Date().toISOString().split('T')[0];

    // Check if program exists and is active
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id, price_inr, is_active')
      .eq('id', programId)
      .is('deleted_at', null)
      .single();

    if (programError || !program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (!program.is_active) {
      return NextResponse.json({ error: 'Program is currently inactive' }, { status: 400 });
    }

    // In a real scenario (Phase 6), we would transition to a payment gateway here.
    // For Phase 3, we mock the enrollment creation directly, simulating a successful transaction.
    
    // Check for existing active enrollment
    const { data: existing } = await supabase
      .from('program_enrollments')
      .select('id')
      .eq('program_id', programId)
      .eq('student_id', user.id)
      .in('status', ['pending', 'active'])
      .maybeSingle();
      
    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this program' }, { status: 409 });
    }

    // Insert new enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('program_enrollments')
      .insert({
        program_id: programId,
        student_id: user.id,
        cohort_start_date: cohortStartDate,
        status: 'active' // Auto-active for Phase 3 mock
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Successfully enrolled in program',
      data: enrollment
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/v1/programs/[id]/enroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
