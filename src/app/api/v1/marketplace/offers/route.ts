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
      request_id,
      price,
      currency,
      mentor_pitch,
      is_counter_offer,
      counter_to_offer_id,
    } = body;

    if (!request_id || !price || !mentor_pitch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: offer, error: insertError } = await supabase
      .from("service_offers")
      .insert({
        request_id,
        mentor_id: user.id,
        price,
        currency: currency || "INR",
        mentor_pitch,
        is_counter_offer: is_counter_offer || false,
        counter_to_offer_id: counter_to_offer_id || null,
        status: "pending",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
      })
      .select()
      .single();

    if (insertError) {
      console.error("Offer insert error:", insertError);
      return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
    }

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Marketplace offer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
