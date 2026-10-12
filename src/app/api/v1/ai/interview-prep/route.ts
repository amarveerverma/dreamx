import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultGateway } from "@/lib/ai/gateway";
import { PROMPT_TEMPLATES } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      target_company = "Google",
      role_title = "Backend Engineer",
      interview_round = "System Design",
    } = body;

    const prompt = PROMPT_TEMPLATES.interviewPrep({
      targetCompany: target_company,
      roleTitle: role_title,
      interviewRound: interview_round,
    });

    const modelToUse = process.env.GEMINI_DEFAULT_MODEL || "gemini-3.5-flash";
    const startTime = Date.now();

    try {
      const res = await defaultGateway.generateStructuredJson<any>(prompt, modelToUse);
      const latencyMs = Date.now() - startTime;

      await defaultGateway.logPromptTelemetry({
        requestId: `prep-${user.id.slice(0, 8)}-${Date.now()}`,
        userId: user.id,
        featureType: "interview_prep",
        modelName: modelToUse,
        promptTokens: res.tokens.prompt,
        completionTokens: res.tokens.completion,
        latencyMs,
        status: "success",
      });

      return NextResponse.json({
        prep_id: `ai-prep-${Date.now()}`,
        ...res.data,
      });
    } catch (aiErr: any) {
      console.warn("[INTERVIEW PREP AI] LLM error, using fallback questions:", aiErr.message);

      // Deterministic fallback question bank
      return NextResponse.json({
        prep_id: `ai-prep-${Date.now()}`,
        target_company,
        role_title,
        interview_round,
        fallback_mode_active: true,
        questions: [
          {
            id: "q-1",
            question: `Describe a time at your previous role when you had to architect a scalable component under tight deadlines.`,
            category: "Behavioral",
            evaluation_criteria: "Clear STAR articulation (Situation, Task, Action, Result) with measurable metrics.",
            sample_ideal_points: [
              "Quantified scale (RPS, database QPS, users)",
              "Tradeoff analysis between latency and durability",
            ],
          },
          {
            id: "q-2",
            question: `Design a distributed rate limiter that operates across multiple geographic regions with sub-5ms latency.`,
            category: "System Design",
            evaluation_criteria: "Demonstrates token bucket or sliding window algorithms, Redis cluster replication, and race condition handling.",
            sample_ideal_points: [
              "Local caching vs centralized atomic counters",
              "Graceful degradation on network partitions",
            ],
          },
        ],
      });
    }
  } catch (err: any) {
    console.error("[INTERVIEW PREP AI] Internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
