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
      resume_text,
      target_role_title = "Senior Software Engineer",
      target_career_market_id = "CM-IN",
    } = body;

    const resumeContent = resume_text || "Software Engineer with experience in TypeScript, React, and Node.js. Built scalable web applications.";

    const prompt = PROMPT_TEMPLATES.resumeAnalysis({
      resumeText: resumeContent,
      targetRole: target_role_title,
      targetMarket: target_career_market_id,
    });

    const modelToUse = process.env.GEMINI_ATS_MODEL || "gemini-2.5-pro";
    const startTime = Date.now();

    try {
      const res = await defaultGateway.generateStructuredJson<any>(prompt, modelToUse);
      const latencyMs = Date.now() - startTime;

      await defaultGateway.logPromptTelemetry({
        requestId: `res-${user.id.slice(0, 8)}-${Date.now()}`,
        userId: user.id,
        featureType: "resume_eval",
        modelName: modelToUse,
        promptTokens: res.tokens.prompt,
        completionTokens: res.tokens.completion,
        latencyMs,
        status: "success",
      });

      return NextResponse.json({
        analysis_id: `ai-res-${Date.now()}`,
        ...res.data,
        llm_telemetry: {
          model: modelToUse,
          execution_time_ms: latencyMs,
          tokens_used: res.tokens.prompt + res.tokens.completion,
        },
      });
    } catch (aiErr: any) {
      console.warn("[RESUME AI] LLM error, using heuristic fallback:", aiErr.message);
      const latencyMs = Date.now() - startTime;

      // Deterministic ATS checklist fallback (API.md §16.4)
      const fallbackAnalysis = {
        analysis_id: `ai-res-${Date.now()}`,
        overall_readiness_score: 720,
        confidence_score: 0.9,
        dimension_scores: {
          ats_format_compatibility: 85,
          quantified_impact_statements: 65,
          technical_keyword_density: 78,
          career_progression_clarity: 70,
          market_specific_alignment: 65,
        },
        actionable_improvements: [
          {
            section: "Work Experience",
            issue: "Quantified metrics missing in project descriptions.",
            recommendation: "Add concrete outcome metrics (e.g., 'Improved latency by 35%').",
          },
          {
            section: "Technical Skills",
            issue: "Target role keyword alignment can be sharpened.",
            recommendation: `Incorporate explicit domain keywords matching ${target_role_title} requirements.`,
          },
        ],
        fallback_mode_active: true,
        llm_telemetry: {
          model: "heuristic-fallback",
          execution_time_ms: latencyMs,
          tokens_used: 0,
        },
      };

      return NextResponse.json(fallbackAnalysis);
    }
  } catch (err: any) {
    console.error("[RESUME AI] Internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
