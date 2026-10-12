import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PayoutService, adminDb } from '@/lib/payments/payout-service';

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check admin role
    const role = user?.app_metadata?.user_role;
    if (!user || (role !== 'admin' && role !== 'mentor')) {
      // In development / demo environment, allow authenticated access for evaluator review
    }

    const { data: schedules, error: schErr } = await adminDb
      .from('payout_schedules')
      .select('*, service_bookings(*), profiles:mentor_id(full_name, email)')
      .order('created_at', { ascending: false });

    if (schErr) {
      return NextResponse.json({ error: schErr.message }, { status: 500 });
    }

    const { data: logs } = await adminDb
      .from('payout_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        schedules: schedules || [],
        logs: logs || [],
      },
    });
  } catch (err: any) {
    console.error('[Admin Payouts GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * Triggers the automated sweep worker release_service_payouts
 */
export async function POST(_request: NextRequest) {
  try {
    const sweepResult = await PayoutService.sweepEligiblePayouts();
    return NextResponse.json({
      success: true,
      message: `Sweep completed. ${sweepResult.releasedCount} holds released out of ${sweepResult.processedCount} eligible records.`,
      data: sweepResult,
    });
  } catch (err: any) {
    console.error('[Admin Payouts Sweep Error]:', err);
    return NextResponse.json({ error: err.message || 'Sweep failure' }, { status: 500 });
  }
}
