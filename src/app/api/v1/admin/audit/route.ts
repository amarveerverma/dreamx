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
    const actionFilter = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('system_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionFilter && actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    const { data: logs, error: fetchErr } = await query;
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ logs: logs || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Admin audit GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
