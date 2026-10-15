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
    const statusFilter = searchParams.get('status') || 'pending_review';

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, headline, bio, public_slug, years_experience, verification_status, is_verified, created_at')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('verification_status', statusFilter);
    }

    const { data: mentors, error: fetchErr } = await query;
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ mentors: mentors || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Admin mentors GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
