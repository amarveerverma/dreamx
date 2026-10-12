import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mentor_id,
      service_type_id,
      mentor_service_id,
      accepted_offer_id,
      scheduled_start_utc,
      scheduled_end_utc,
      gross_amount,
      net_amount,
      platform_fee,
      mentor_earning,
      currency,
    } = body;

    if (!mentor_id || !service_type_id || !scheduled_start_utc || !scheduled_end_utc || !gross_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const discount = (gross_amount && net_amount) ? Math.max(0, gross_amount - net_amount) : 0;
    const finalNet = gross_amount - discount;
    const finalPlatformFee = platform_fee ?? Number((gross_amount * 0.20).toFixed(2));
    const finalMentorEarning = mentor_earning ?? Number((gross_amount * 0.80).toFixed(2));

    // Attempt to insert the booking - if the unique slot lock constraint fails, it will throw an error
    const { data: booking, error: insertError } = await supabase
      .from("service_bookings")
      .insert({
        student_id: user.id,
        mentor_id,
        service_type_id,
        mentor_service_id,
        accepted_offer_id,
        scheduled_start_utc,
        scheduled_end_utc,
        gross_amount,
        membership_discount: discount,
        net_amount: finalNet,
        platform_fee: finalPlatformFee,
        mentor_earning: finalMentorEarning,
        currency: currency || "INR",
        status: "pending_payment",
        checkout_ttl: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") { // Unique violation
        return NextResponse.json({ error: "CONCURRENCY_ERROR", message: "This slot was just booked by someone else." }, { status: 409 });
      }
      console.error("Booking insert error:", insertError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
