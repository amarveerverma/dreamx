import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let category: string | undefined;
    try {
      const body = await req.json();
      category = body?.category;
    } catch {
      // Body is optional
    }

    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('[Notification Mark All Read Error]:', error);
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      marked_count: data?.length || 0,
    });
  } catch (err: any) {
    console.error('[Notification Mark All Read Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
