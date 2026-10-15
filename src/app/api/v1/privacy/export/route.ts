import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { AuditService } from '@/lib/audit/audit-service';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session required for data export' }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Rate Limit Check: 1 export request per 24 hours per user
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentRequests, error: rateErr } = await adminSupabase
      .from('data_export_requests')
      .select('created_at')
      .eq('user_id', user.id)
      .gt('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!rateErr && recentRequests && recentRequests.length > 0) {
      const lastRequestDate = new Date(recentRequests[0].created_at);
      const nextAvailableDate = new Date(lastRequestDate.getTime() + 24 * 60 * 60 * 1000);
      const remainingHours = Math.ceil((nextAvailableDate.getTime() - Date.now()) / (1000 * 60 * 60));

      return NextResponse.json(
        {
          error: `Under DPDP Act portability guidelines, only 1 data export is allowed per 24 hours. Next export available in approximately ${remainingHours} hour(s).`,
          next_export_available_at: nextAvailableDate.toISOString(),
        },
        { status: 429 }
      );
    }

    // 2. Fetch User Personal Data across all platform tables
    const [
      profileRes,
      bookingsRes,
      scoresRes,
      reviewsRes,
      disputesRes,
      notificationsRes,
      payoutsRes,
    ] = await Promise.all([
      adminSupabase.from('profiles').select('*').eq('id', user.id).single(),
      adminSupabase.from('service_bookings').select('*').or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`),
      adminSupabase.from('career_scores').select('*').eq('student_id', user.id),
      adminSupabase.from('reviews').select('*').or(`reviewer_id.eq.${user.id},mentor_id.eq.${user.id}`),
      adminSupabase.from('booking_disputes').select('*').or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`),
      adminSupabase.from('notifications').select('*').eq('user_id', user.id),
      adminSupabase.from('payout_schedules').select('*').eq('mentor_id', user.id),
    ]);

    const exportBundle = {
      manifest: {
        export_standard: 'India DPDP Act (2023) Section 11/12 Compliant Archive',
        platform: 'DreamX Career Mobility Platform',
        user_id: user.id,
        user_email: user.email,
        exported_at: new Date().toISOString(),
        jurisdiction: 'IN (India)',
        record_counts: {
          profiles: profileRes.data ? 1 : 0,
          bookings: bookingsRes.data?.length || 0,
          career_scores: scoresRes.data?.length || 0,
          reviews: reviewsRes.data?.length || 0,
          disputes: disputesRes.data?.length || 0,
          notifications: notificationsRes.data?.length || 0,
          payout_records: payoutsRes.data?.length || 0,
        },
      },
      data: {
        profile: profileRes.data || null,
        service_bookings: bookingsRes.data || [],
        career_scores: scoresRes.data || [],
        reviews: reviewsRes.data || [],
        booking_disputes: disputesRes.data || [],
        notifications: notificationsRes.data || [],
        payout_schedules: payoutsRes.data || [],
      },
    };

    // Calculate SHA-256 integrity hash
    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(exportBundle.data))
      .digest('hex');

    (exportBundle.manifest as any).sha256_checksum = checksum;

    // 3. Record Export Request in Privacy Schema
    await adminSupabase.from('data_export_requests').insert({
      user_id: user.id,
      status: 'completed',
      record_counts: exportBundle.manifest.record_counts,
      ip_address: req.headers.get('x-forwarded-for') || null,
      user_agent: req.headers.get('user-agent') || null,
    });

    // 4. Audit Log Entry (WORM)
    await AuditService.recordAction({
      actorId: user.id,
      action: 'PRIVACY_DATA_EXPORT_GENERATED',
      targetResource: 'profiles',
      targetId: user.id,
      metadata: {
        records: exportBundle.manifest.record_counts,
        checksum,
      },
    });

    return NextResponse.json(exportBundle, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dreamx-data-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/v1/privacy/export:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
