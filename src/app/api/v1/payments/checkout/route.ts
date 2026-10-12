import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    // Fetch booking
    const { data: booking, error: bkErr } = await supabase
      .from('service_bookings')
      .select('*, service_types(*)')
      .eq('id', booking_id)
      .eq('student_id', user.id)
      .single();

    if (bkErr || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to active student' },
        { status: 404 }
      );
    }

    if (booking.status !== 'pending_payment') {
      return NextResponse.json(
        { error: `Booking is not awaiting payment (Status: ${booking.status})` },
        { status: 400 }
      );
    }

    // Check 15m checkout TTL lock
    if (booking.checkout_ttl && new Date(booking.checkout_ttl) < new Date()) {
      return NextResponse.json(
        { error: 'Booking checkout lock has expired. Please create a new booking request.' },
        { status: 409 }
      );
    }

    const provider = getPaymentProvider('razorpay');
    const order = await provider.createOrder({
      bookingId: booking.id,
      amount: Number(booking.net_amount),
      currency: booking.currency || 'INR',
      studentId: user.id,
      studentEmail: user.email || 'student@dreamx.com',
      description: `DreamX Session: ${booking.service_types?.name || '1-on-1 Mentorship'}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: order.orderId,
        key_id: order.keyId,
        amount: order.amount,
        currency: order.currency,
        checkout_options: order.checkoutOptions,
        booking: {
          id: booking.id,
          gross_amount: booking.gross_amount,
          membership_discount: booking.membership_discount,
          net_amount: booking.net_amount,
          currency: booking.currency,
        },
      },
    });
  } catch (err: any) {
    console.error('[Payments Checkout Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
