import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offerId = params.id;

    // 1. Fetch offer and request
    const { data: offer, error: fetchError } = await supabase
      .from("service_offers")
      .select("*, request:service_requests!request_id(*)")
      .eq("id", offerId)
      .single();

    if (fetchError || !offer || !offer.request) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const request = offer.request;

    // Verify ownership
    if (request.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the request owner" }, { status: 403 });
    }

    if (offer.status !== "pending") {
      return NextResponse.json({ error: `Offer is already ${offer.status}` }, { status: 400 });
    }

    // 2. Schedule times
    const startIso = `${request.preferred_date}T${request.preferred_time_utc}Z`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 60 min default

    // 3. Financial math
    const grossAmount = Number(offer.price);
    const membershipDiscount = 0.00;
    const netAmount = grossAmount - membershipDiscount;
    const platformFee = Number((grossAmount * 0.20).toFixed(2));
    const mentorEarning = Number((grossAmount * 0.80).toFixed(2));

    // 4. Create Booking with 15-minute checkout TTL
    const { data: booking, error: bookingError } = await supabase
      .from("service_bookings")
      .insert({
        booking_source: "smart_match",
        student_id: user.id,
        mentor_id: offer.mentor_id,
        service_type_id: request.service_type_id,
        accepted_offer_id: offer.id,
        scheduled_start_utc: startDate.toISOString(),
        scheduled_end_utc: endDate.toISOString(),
        gross_amount: grossAmount,
        membership_discount: membershipDiscount,
        net_amount: netAmount,
        platform_fee: platformFee,
        mentor_earning: mentorEarning,
        currency: offer.currency || "INR",
        status: "pending_payment",
        checkout_ttl: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      if (bookingError.code === "23505") { // Unique lock contention
        return NextResponse.json({
          error: "CONCURRENCY_ERROR",
          message: "The mentor is already booked for this specific time slot."
        }, { status: 409 });
      }
      console.error("Booking insert error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // 5. Update Offer Status
    await supabase
      .from("service_offers")
      .update({ status: "accepted" })
      .eq("id", offer.id);

    // 6. Decline sibling offers
    await supabase
      .from("service_offers")
      .update({ status: "declined" })
      .eq("request_id", request.id)
      .neq("id", offer.id);

    // 7. Update Request Status to 'booked'
    await supabase
      .from("service_requests")
      .update({ status: "booked" })
      .eq("id", request.id);

    return NextResponse.json({ booking, offer }, { status: 200 });

  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
