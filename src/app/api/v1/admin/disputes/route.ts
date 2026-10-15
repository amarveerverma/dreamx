import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.user_role || user.user_metadata?.user_role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let query = supabase
      .from('booking_disputes')
      .select(`
        id, booking_id, student_id, mentor_id, reason_code, student_notes, student_evidence_urls,
        mentor_rebuttal, mentor_evidence_urls, rebuttal_deadline, status, resolution_notes,
        created_at, updated_at,
        student:profiles!booking_disputes_student_id_fkey(full_name, email, dispute_count, dispute_abuse_strikes, is_dispute_blocked),
        mentor:profiles!booking_disputes_mentor_id_fkey(full_name, email, rolling_rating)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: disputes, error: fetchErr } = await query;
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ disputes: disputes || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Admin disputes GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
