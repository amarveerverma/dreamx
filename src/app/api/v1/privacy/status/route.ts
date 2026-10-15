import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Check Profile Deletion Status
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_deletion_requested, scheduled_purge_at, deleted_at')
      .eq('id', user.id)
      .single();

    // 2. Check Recent Export Request
    const { data: recentRequests } = await adminSupabase
      .from('data_export_requests')
      .select('created_at, record_counts')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    let canExport = true;
    let nextExportAvailableAt: string | null = null;
    let lastExportAt: string | null = null;

    if (recentRequests && recentRequests.length > 0) {
      lastExportAt = recentRequests[0].created_at;
      const lastRequestDate = new Date(recentRequests[0].created_at);
      const nextDate = new Date(lastRequestDate.getTime() + 24 * 60 * 60 * 1000);
      if (Date.now() < nextDate.getTime()) {
        canExport = false;
        nextExportAvailableAt = nextDate.toISOString();
      }
    }

    return NextResponse.json({
      dpdp_compliance_region: 'IN (India DPDP Act 2023)',
      can_export: canExport,
      last_export_at: lastExportAt,
      next_export_available_at: nextExportAvailableAt,
      is_deletion_requested: profile?.is_deletion_requested || false,
      scheduled_purge_at: profile?.scheduled_purge_at || null,
      deleted_at: profile?.deleted_at || null,
    });
  } catch (err: any) {
    console.error('Error in /api/v1/privacy/status:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
