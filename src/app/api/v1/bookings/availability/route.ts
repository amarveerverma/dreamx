import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mentor_id = searchParams.get("mentor_id");
    
    if (!mentor_id) {
      return NextResponse.json({ error: "mentor_id is required" }, { status: 400 });
    }

    const supabase = createClient();
    
    // In a real implementation, we would intersect public.mentor_schedules with
    // public.schedule_overrides and existing bookings to return free slots.
    // Since mentor_schedules is from Phase 2, we fetch existing bookings here to find conflicts.
    
    const { data: bookings, error: bookingsError } = await supabase
      .from("service_bookings")
      .select("scheduled_start_utc, scheduled_end_utc")
      .eq("mentor_id", mentor_id)
      .in("status", ["pending_payment", "confirmed", "in_progress"]);

    if (bookingsError) {
      console.error("Availability fetch error:", bookingsError);
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }

    // Stub: returning a mock free slot structure minus conflicts
    return NextResponse.json({ 
      mentor_id,
      conflicts: bookings,
      available_slots: [
        // Mock data to unblock Phase 4 UI implementation
        { start: "2026-08-01T10:00:00Z", end: "2026-08-01T11:00:00Z" }
      ]
    }, { status: 200 });

  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
