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
      service_type_id,
      target_career_market_id,
      budget_min,
      budget_max,
      preferred_date,
      preferred_time_utc,
      student_time_zone,
      attached_resume_url,
    } = body;

    if (!service_type_id || !budget_min || !budget_max || !preferred_date || !preferred_time_utc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Rate Limiting: Max 10 requests per minute per user (Security.md §9.2)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .gte("created_at", oneMinuteAgo);

    if ((recentCount || 0) >= 10) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 10 requests per minute allowed." },
        { status: 429 }
      );
    }

    const { data: request, error: insertError } = await supabase
      .from("service_requests")
      .insert({
        student_id: user.id,
        service_type_id,
        target_career_market_id: target_career_market_id || 'CM-IN',
        budget_min,
        budget_max,
        preferred_date,
        preferred_time_utc,
        student_time_zone: student_time_zone || 'Asia/Kolkata',
        attached_resume_url: attached_resume_url || '',
        status: "pending",
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h TTL
      })
      .select()
      .single();

    if (insertError || !request) {
      console.error("Service request insert error:", insertError);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    // Execute the 6-stage Smart Match Pipeline
    const { smartMatchService } = await import("@/lib/ai/smart-match-service");
    const matchOutput = await smartMatchService.executeMatchPipeline({
      requestId: request.id,
      studentId: user.id,
      serviceTypeId: service_type_id,
      targetCareerMarketId: target_career_market_id || "CM-IN",
      budgetMin: budget_min,
      budgetMax: budget_max,
      preferredDate: preferred_date,
      preferredTimeUtc: preferred_time_utc,
      studentTimeZone: student_time_zone || "Asia/Kolkata",
      studentGoal: body.student_goal,
      targetRole: body.target_role,
      skillTags: body.skill_tags,
      resumeText: body.resume_text,
    });
    
    return NextResponse.json({
      request,
      matches: matchOutput.matches,
      fallback_mode_active: matchOutput.fallbackActive,
      candidate_pool_size: matchOutput.totalCandidatePool,
      latency_ms: matchOutput.latencyMs,
    }, { status: 201 });
  } catch (error) {
    console.error("Smart match request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isMentor = profile?.role === "mentor" || view === "marketplace";

    if (isMentor) {
      // Mentor view: open requests available for bidding
      const { data: requests, error: fetchError } = await supabase
        .from("service_requests")
        .select("*, service:service_types!service_type_id(title, default_duration_minutes), student:profiles!student_id(full_name, avatar_url, public_slug), offers:service_offers(id, mentor_id, price, status)")
        .in("status", ["pending", "offers_received"])
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Fetch marketplace requests error:", fetchError);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
      }

      return NextResponse.json({ requests: requests || [] }, { status: 200 });
    } else {
      // Student view: their own requests with detailed offers and AI matches
      const { data: requests, error: fetchError } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:service_types!service_type_id(title, default_duration_minutes),
          offers:service_offers(*, mentor:profiles!mentor_id(full_name, avatar_url, public_slug)),
          matches:service_request_matches(*, mentor:profiles!mentor_id(id, full_name, avatar_url, public_slug, headline, target_career_market_id, years_experience))
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Fetch student requests error:", fetchError);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
      }

      return NextResponse.json({ requests: requests || [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Requests fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
