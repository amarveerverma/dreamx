import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // e.g., 'completed', 'upcoming'

    let query = supabase
      .from("service_bookings")
      .select("*, student:profiles!student_id(full_name, avatar_url, public_slug), service:service_types!service_type_id(title, default_duration_minutes)")
      .eq("mentor_id", user.id)
      .order("scheduled_start_utc", { ascending: true });

    if (status === "upcoming") {
      query = query.in("status", ["confirmed", "in_progress", "pending_payment"]);
    } else if (status === "completed") {
      query = query.in("status", ["completed", "deliverable_submitted"]);
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch mentor bookings error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] }, { status: 200 });
  } catch (error) {
    console.error("Mentor bookings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
