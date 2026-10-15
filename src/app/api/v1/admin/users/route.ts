import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuditService } from '@/lib/audit/audit-service';

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
    const roleFilter = searchParams.get('role');
    const searchQuery = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, current_country, verification_status, is_verified, career_score, dispute_abuse_strikes, is_dispute_blocked, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data: users, error: fetchErr } = await query;
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { targetUserId, action, reason } = body;

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'targetUserId and action are required' }, { status: 400 });
    }

    let updateData: Record<string, any> = {};
    if (action === 'suspend') {
      updateData = { verification_status: 'suspended' };
    } else if (action === 'restore') {
      updateData = { verification_status: 'active' };
    } else if (action === 'block_disputes') {
      updateData = { is_dispute_blocked: true };
    } else if (action === 'unblock_disputes') {
      updateData = { is_dispute_blocked: false };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Write audit log
    await AuditService.recordAction({
      actorId: user.id,
      action: `USER_ACTION_${action.toUpperCase()}`,
      targetResource: 'profiles',
      targetId: targetUserId,
      metadata: { reason: reason || 'Admin action', action, updateData },
    });

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
  } catch (error: any) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
