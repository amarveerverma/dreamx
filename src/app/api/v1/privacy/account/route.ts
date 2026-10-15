import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { AuditService } from '@/lib/audit/audit-service';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session required for account deletion' }, { status: 401 });
    }

    const body = await req.json();
    const { password, confirmationText, reason } = body;

    // 1. Mandatory Confirmation Text Guard
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation text mismatch. You must explicitly type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    // 2. Re-authentication Security Challenge
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to verify account ownership before deletion.' },
        { status: 400 }
      );
    }

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (verifyErr) {
      return NextResponse.json(
        { error: 'Re-authentication failed. Incorrect password provided.' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Apply Compliant Soft-Delete with 30-Day DPDP Grace Period
    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: updatedProfile, error: profileErr } = await adminSupabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        scheduled_purge_at: purgeDate,
        is_deletion_requested: true,
        deletion_reason: reason || 'User requested account closure',
      })
      .eq('id', user.id)
      .select('id, email, full_name, scheduled_purge_at')
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 4. Record Immutable WORM Audit Trail
    await AuditService.recordAction({
      actorId: user.id,
      action: 'USER_ACCOUNT_DELETION_SCHEDULED',
      targetResource: 'profiles',
      targetId: user.id,
      metadata: {
        scheduled_purge_at: purgeDate,
        reason: reason || 'User requested account closure',
        user_email: user.email,
      },
    });

    // 5. Invalidate Sessions and Log Out User
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account successfully scheduled for deletion. In compliance with the India DPDP Act (2023), you have a 30-day grace period to cancel before permanent database purging.',
      scheduled_purge_at: purgeDate,
    });
  } catch (err: any) {
    console.error('Error in /api/v1/privacy/account:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
