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

    const disputeId = params.id;
    const body = await req.json();
    const { decision, resolutionNotes, penalizeStudent } = body; // decision: 'refund' | 'dismiss'

    if (!decision || !['refund', 'dismiss'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be "refund" or "dismiss"' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch dispute
    const { data: dispute, error: disputeErr } = await adminSupabase
      .from('booking_disputes')
      .select('*, booking:service_bookings!booking_disputes_booking_id_fkey(*)')
      .eq('id', disputeId)
      .single();

    if (disputeErr || !dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (decision === 'refund') {
      // 1. Update dispute status
      await adminSupabase
        .from('booking_disputes')
        .update({
          status: 'resolved_refunded',
          resolution_notes: resolutionNotes || 'Admin approved refund after telemetry review',
          resolved_by: user.id,
          resolved_at: now,
          updated_at: now,
        })
        .eq('id', disputeId);

      // 2. Update booking status
      await adminSupabase
        .from('service_bookings')
        .update({
          status: 'refunded',
          payout_status: 'cancelled',
          updated_at: now,
        })
        .eq('id', dispute.booking_id);

      // 3. Update payout log if exists
      await adminSupabase
        .from('payout_logs')
        .update({ status: 'cancelled', updated_at: now })
        .eq('booking_id', dispute.booking_id);

      // 4. Record refund transaction in payment_transactions
      await adminSupabase.from('payment_transactions').insert({
        booking_id: dispute.booking_id,
        user_id: dispute.student_id,
        gateway: 'razorpay',
        amount: dispute.booking?.gross_amount || 0,
        currency: dispute.booking?.currency || 'INR',
        type: 'refund',
        status: 'refunded',
        metadata: { dispute_id: disputeId, resolved_by: user.id },
      });

      // 5. Audit log
      await AuditService.recordAction({
        actorId: user.id,
        action: 'DISPUTE_REFUND_APPROVED',
        targetResource: 'booking_disputes',
        targetId: disputeId,
        metadata: { booking_id: dispute.booking_id, student_id: dispute.student_id, amount: dispute.booking?.gross_amount },
      });

      return NextResponse.json({ success: true, status: 'resolved_refunded' }, { status: 200 });

    } else {
      // Decision is 'dismiss'
      await adminSupabase
        .from('booking_disputes')
        .update({
          status: 'resolved_dismissed',
          resolution_notes: resolutionNotes || 'Admin dismissed dispute based on verified telemetry',
          resolved_by: user.id,
          resolved_at: now,
          updated_at: now,
        })
        .eq('id', disputeId);

      // Unfreeze payout log
      await adminSupabase
        .from('payout_logs')
        .update({ status: 'eligible_for_release', updated_at: now })
        .eq('booking_id', dispute.booking_id);

      // Penalize student if flagged as frivolous claim
      if (penalizeStudent) {
        const { data: studentProfile } = await adminSupabase
          .from('profiles')
          .select('dispute_abuse_strikes')
          .eq('id', dispute.student_id)
          .single();

        const newStrikes = (studentProfile?.dispute_abuse_strikes || 0) + 1;
        await adminSupabase
          .from('profiles')
          .update({
            dispute_abuse_strikes: newStrikes,
            is_dispute_blocked: newStrikes >= 3,
            updated_at: now,
          })
          .eq('id', dispute.student_id);
      }

      // Audit log
      await AuditService.recordAction({
        actorId: user.id,
        action: 'DISPUTE_DISMISSED',
        targetResource: 'booking_disputes',
        targetId: disputeId,
        metadata: { booking_id: dispute.booking_id, penalizeStudent: !!penalizeStudent },
      });

      return NextResponse.json({ success: true, status: 'resolved_dismissed' }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Dispute arbitration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
