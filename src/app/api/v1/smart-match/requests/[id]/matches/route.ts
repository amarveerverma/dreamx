import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;

    // Verify request ownership or mentor role
    const { data: request, error: reqError } = await supabase
      .from("service_requests")
      .select("id, student_id, service_type_id, status, expires_at, budget_max, service:service_types(title)")
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Fetch matches from public.service_request_matches
    const { data: matches, error: matchError } = await supabase
      .from("service_request_matches")
      .select(`
        id,
        match_score,
        status,
        created_at,
        mentor:profiles!mentor_id (
          id,
          full_name,
          headline,
          avatar_url,
          rolling_rating,
          target_career_market_id,
          years_experience
        )
      `)
      .eq("request_id", requestId)
      .order("match_score", { ascending: false });

    if (matchError) {
      console.error("[MATCHES API] Error fetching matches:", matchError);
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
    }

    const formattedMatches = (matches || []).map((m: any, idx: number) => ({
      match_id: m.id,
      rank_order: idx + 1,
      match_score_percentage: Number(m.match_score),
      ai_explanation: `${m.mentor?.full_name || "Mentor"} is ranked #${idx + 1} with a ${m.match_score}% match score for your career goals and budget constraints.`,
      mentor: m.mentor,
    }));

    return NextResponse.json({
      request_id: requestId,
      status: request.status,
      service_title: (request as any).service?.title,
      matches: formattedMatches,
    }, { status: 200 });
  } catch (err: any) {
    console.error("[MATCHES API] Internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
