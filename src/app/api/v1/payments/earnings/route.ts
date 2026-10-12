import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load mentor's payout schedules via RLS
    const { data: schedules, error } = await supabase
      .from('payout_schedules')
      .select('*, service_bookings(id, scheduled_start_utc, service_types(name), profiles:student_id(full_name))')
      .eq('mentor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate aggregated metrics
    let totalEarnings = 0;
    let onHoldAmount = 0;
    let releasedAmount = 0;

    for (const item of schedules || []) {
      const net = Number(item.net_payout_amount);
      totalEarnings += net;
      if (item.status === 'on_hold' || item.status === 'frozen') {
        onHoldAmount += net;
      } else if (item.status === 'released') {
        releasedAmount += net;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_earnings: Number(totalEarnings.toFixed(2)),
          on_hold_amount: Number(onHoldAmount.toFixed(2)),
          released_amount: Number(releasedAmount.toFixed(2)),
          currency: 'INR',
        },
        schedules: schedules || [],
      },
    });
  } catch (err: any) {
    console.error('[Mentor Earnings API Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
