import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // This endpoint should ideally be triggered by a Payment Webhook (e.g. Razorpay).
    // For Phase 4, we stub it to allow student/admin to confirm if Razorpay is bypassed.
    const supabase = createClient();
    const bookingId = params.id;

    // Verify auth - in real life this might be a webhook signature check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve booking
    const { data: booking, error: fetchError } = await supabase
      .from("service_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "pending_payment") {
      return NextResponse.json({ error: "Booking is not pending payment" }, { status: 400 });
    }

    // Confirm booking and generate fake Google Meet URL
    const { data: updatedBooking, error: updateError } = await supabase
      .from("service_bookings")
      .update({
        status: "confirmed",
        meeting_url: "https://meet.google.com/mock-abc-defg", // Stub GCal integration
        payout_status: "held",
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Booking confirm update error:", updateError);
      return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
    }

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });

  } catch (error) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
