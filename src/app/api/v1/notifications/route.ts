import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const category = searchParams.get('category');
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('[Notifications GET Error]:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
    });
  } catch (err: any) {
    console.error('[Notifications GET Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
