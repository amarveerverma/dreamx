import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { AuditService } from '@/lib/audit/audit-service';

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    const mentorId = params.id;
    const body = await req.json();
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === 'approve') {
      // 1. Update public.profiles
      const { data: updatedProfile, error: profileErr } = await adminSupabase
        .from('profiles')
        .update({
          role: 'mentor',
          verification_status: 'active',
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mentorId)
        .select()
        .single();

      if (profileErr) {
        return NextResponse.json({ error: profileErr.message }, { status: 500 });
      }

      // 2. Sync role to auth.users.raw_app_meta_data
      await adminSupabase.auth.admin.updateUserById(mentorId, {
        app_metadata: { user_role: 'mentor' },
      });

      // 3. Write audit log
      await AuditService.recordAction({
        actorId: user.id,
        action: 'MENTOR_VERIFICATION_APPROVED',
        targetResource: 'profiles',
        targetId: mentorId,
        metadata: { notes: notes || 'Verified employment and credentials', action: 'approve' },
      });

      return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
    } else {
      // Reject action
      const { data: updatedProfile, error: profileErr } = await adminSupabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mentorId)
        .select()
        .single();

      if (profileErr) {
        return NextResponse.json({ error: profileErr.message }, { status: 500 });
      }

      // Write audit log
      await AuditService.recordAction({
        actorId: user.id,
        action: 'MENTOR_VERIFICATION_REJECTED',
        targetResource: 'profiles',
        targetId: mentorId,
        metadata: { notes: notes || 'Credentials could not be verified', action: 'reject' },
      });

      return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Mentor action error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
