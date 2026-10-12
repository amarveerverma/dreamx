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
    const body = await req.json();
    const { counter_price, counter_pitch } = body;

    if (!counter_price) {
      return NextResponse.json({ error: "counter_price is required" }, { status: 400 });
    }

    // 1. Fetch original offer
    const { data: originalOffer, error: fetchError } = await supabase
      .from("service_offers")
      .select("*, request:service_requests!request_id(*)")
      .eq("id", offerId)
      .single();

    if (fetchError || !originalOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Assert student is the request owner
    if (originalOffer.request.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the request owner" }, { status: 403 });
    }

    // 2. PRD §7 Rule: Enforce 1 Counter-Offer Limit
    // Check if a counter-offer already exists for this offer or by this student for this mentor
    const { data: existingCounters, error: counterCheckError } = await supabase
      .from("service_offers")
      .select("id")
      .or(`counter_to_offer_id.eq.${offerId},and(request_id.eq.${originalOffer.request_id},mentor_id.eq.${originalOffer.mentor_id},is_counter_offer.eq.true)`);

    if (existingCounters && existingCounters.length > 0) {
      return NextResponse.json({
        error: "COUNTER_LIMIT_REACHED",
        message: "Maximum 1 counter-offer allowed per mentor negotiation."
      }, { status: 409 });
    }

    // 3. Create Counter Offer
    const { data: counterOffer, error: insertError } = await supabase
      .from("service_offers")
      .insert({
        request_id: originalOffer.request_id,
        mentor_id: originalOffer.mentor_id,
        price: counter_price,
        currency: originalOffer.currency || "INR",
        mentor_pitch: counter_pitch || `Counter offer submitted by student: ₹${counter_price}`,
        is_counter_offer: true,
        counter_to_offer_id: originalOffer.id,
        status: "pending",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
      })
      .select()
      .single();

    if (insertError) {
      console.error("Counter offer insert error:", insertError);
      return NextResponse.json({ error: "Failed to create counter offer" }, { status: 500 });
    }

    return NextResponse.json({ offer: counterOffer }, { status: 201 });
  } catch (error) {
    console.error("Counter offer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
