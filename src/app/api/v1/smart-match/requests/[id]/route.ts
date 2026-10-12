import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;

    // Fetch request with service details and student profile
    const { data: request, error: requestError } = await supabase
      .from("service_requests")
      .select("*, service:service_types!service_type_id(title, default_duration_minutes, description), student:profiles!student_id(full_name, avatar_url, public_slug)")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Fetch all offers for this request
    const { data: offers, error: offersError } = await supabase
      .from("service_offers")
      .select("*, mentor:profiles!mentor_id(full_name, avatar_url, public_slug)")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (offersError) {
      console.error("Fetch offers error:", offersError);
    }

    return NextResponse.json({
      request,
      offers: offers || []
    }, { status: 200 });
  } catch (error) {
    console.error("Smart match request detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
