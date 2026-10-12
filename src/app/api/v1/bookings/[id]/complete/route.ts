import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const bookingId = params.id;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify booking belongs to the mentor
    const { data: booking, error: fetchError } = await supabase
      .from("service_bookings")
      .select("mentor_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.mentor_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not the assigned mentor" }, { status: 403 });
    }

    // According to API.md 9.3, state transition & payout hold:
    // 1. status -> completed
    // 2. payout_status -> held, payout_eligible_at -> NOW + 3 days (simulated here)
    const payoutEligibleAt = new Date();
    payoutEligibleAt.setDate(payoutEligibleAt.getDate() + 3);

    const { data: updatedBooking, error: updateError } = await supabase
      .from("service_bookings")
      .update({
        status: "completed",
        payout_status: "held",
        payout_eligible_at: payoutEligibleAt.toISOString(),
        deliverable_submitted_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Booking complete update error:", updateError);
      return NextResponse.json({ error: "Failed to complete booking" }, { status: 500 });
    }

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error("Booking complete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
