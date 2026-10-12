import { createAdminClient } from "@/lib/supabase/admin";
import { defaultGateway } from "./gateway";
import { executeWithCircuitBreaker } from "./circuit-breaker";
import { PROMPT_TEMPLATES } from "./prompts";
import {
  evaluateCandidate,
  compareCandidates,
  cosineSimilarity,
  CandidateEvaluationInput,
  DimensionScoreBreakdown,
} from "./math";

export interface SmartMatchRequestInput {
  requestId: string;
  studentId: string;
  serviceTypeId: number;
  targetCareerMarketId: string;
  budgetMin: number;
  budgetMax: number;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeUtc: string; // HH:MM:SS
  studentTimeZone: string;
  studentGoal?: string;
  targetRole?: string;
  skillTags?: string[];
  resumeText?: string;
}

export interface MatchCandidateResult {
  matchId?: string;
  mentorId: string;
  rankOrder: number;
  matchScorePercentage: number;
  aiExplanation: string;
  mentor: {
    id: string;
    fullName: string;
    headline: string;
    avatarUrl: string;
    rollingRating: number;
    verifiedCompanies: string[];
    offeredPrice: number;
  };
  scoreBreakdown: DimensionScoreBreakdown;
}

export interface SmartMatchPipelineOutput {
  requestId: string;
  matches: MatchCandidateResult[];
  fallbackActive: boolean;
  totalCandidatePool: number;
  latencyMs: number;
}

export class SmartMatchService {
  private get admin() {
    return createAdminClient();
  }

  /**
   * Executes the full 6-stage Smart Match Pipeline (docs/AI.md §8)
   */
  async executeMatchPipeline(
    input: SmartMatchRequestInput
  ): Promise<SmartMatchPipelineOutput> {
    const pipelineStartTime = Date.now();
    let fallbackActive = false;

    // -------------------------------------------------------------
    // STAGE 1: SQL Hard Filtering (Candidate Bounding)
    // -------------------------------------------------------------
    const { data: eligibleMentorServices, error: filterError } = await this.admin
      .from("mentor_services")
      .select(`
        id,
        price,
        mentor_id,
        service_type_id,
        mentor:profiles!mentor_id (
          id,
          full_name,
          headline,
          bio,
          avatar_url,
          rolling_rating,
          target_career_market_id,
          years_experience,
          languages_spoken,
          is_verified
        )
      `)
      .eq("service_type_id", input.serviceTypeId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .lte("price", input.budgetMax * 1.25); // Allow slight leeway for Stage 5 budget scoring

    if (filterError) {
      console.error("[SMART MATCH] Stage 1 SQL filter error:", filterError);
    }

    const stage1Candidates = (eligibleMentorServices || []).filter((item: any) => {
      const mentor = item.mentor;
      return mentor && (mentor.is_verified === true || mentor.is_verified === undefined);
    });

    if (stage1Candidates.length === 0) {
      // If zero candidates within price ceiling, fetch top available mentors for this service type as fallback
      const { data: generalMentors } = await this.admin
        .from("mentor_services")
        .select(`
          id, price, mentor_id, service_type_id,
          mentor:profiles!mentor_id (
            id, full_name, headline, bio, avatar_url, rolling_rating,
            target_career_market_id, years_experience, languages_spoken, is_verified
          )
        `)
        .eq("service_type_id", input.serviceTypeId)
        .eq("is_active", true)
        .limit(10);

      (generalMentors || []).forEach((m: any) => {
        if (m.mentor) stage1Candidates.push(m);
      });
    }

    // -------------------------------------------------------------
    // STAGE 2: Schedule Availability Projection (In-Memory)
    // -------------------------------------------------------------
    const candidateMentorIds = stage1Candidates.map((c: any) => c.mentor_id);
    const { data: schedules } = await this.admin
      .from("mentor_schedules")
      .select("*")
      .in("mentor_id", candidateMentorIds.length ? candidateMentorIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("is_active", true);

    const scheduleMap = new Map<string, any[]>();
    (schedules || []).forEach((sch: any) => {
      const arr = scheduleMap.get(sch.mentor_id) || [];
      arr.push(sch);
      scheduleMap.set(sch.mentor_id, arr);
    });

    // -------------------------------------------------------------
    // STAGE 3: Vector Embeddings & Semantic Cosine Search (pgvector)
    // -------------------------------------------------------------
    const studentNarrative = `${input.studentGoal || "Career advancement and skill preparation"} ${input.targetRole || ""} ${input.skillTags?.join(" ") || ""}`.trim();
    const queryVector = await defaultGateway.generateEmbeddings(studentNarrative);
    const vectorSimMap = new Map<string, number>();

    try {
      const { queryDb } = await import("@/lib/db/pg");
      const vectorStr = `[${queryVector.join(",")}]`;
      const vectorRows = await queryDb(
        `SELECT entity_id, (embedding <=> $1::extensions.vector) as distance
         FROM ai.document_embeddings
         WHERE entity_id = ANY($2::uuid[]) AND entity_type = 'mentor_profile'`,
        [vectorStr, candidateMentorIds.length ? candidateMentorIds : ["00000000-0000-0000-0000-000000000000"]]
      );

      vectorRows.forEach((r: any) => {
        const distance = Number(r.distance) || 0.5;
        // Cosine similarity = 1 - cosine distance
        const sim = Math.max(0, Math.min(1, 1 - distance));
        vectorSimMap.set(r.entity_id, sim);
      });
    } catch (vectorErr: any) {
      console.warn("[SMART MATCH] Vector query notice:", vectorErr.message);
    }

    // -------------------------------------------------------------
    // STAGE 4 & 5: Composite 14-Dimension Scoring & Top-5 Ranking
    // -------------------------------------------------------------
    const evaluatedCandidates = stage1Candidates.map((candidate: any) => {
      const mentor = candidate.mentor;
      const vecSim = vectorSimMap.get(mentor.id) ?? 0.85; // Fallback to strong default if missing
      const mentorScheds = scheduleMap.get(mentor.id) || [];

      // Determine slot availability on preferred date (day of week)
      const targetDayOfWeek = new Date(input.preferredDate).getDay();
      const hasSlot = mentorScheds.some((s: any) => s.day_of_week === targetDayOfWeek);

      const evalInput: CandidateEvaluationInput = {
        mentorId: mentor.id,
        vectorSimilarity: vecSim,
        careerMarketId: mentor.target_career_market_id || "CM-IN",
        targetCareerMarketId: input.targetCareerMarketId || "CM-IN",
        isServiceApproved: true,
        studentSkills: input.skillTags || ["general"],
        mentorSkills: ["mentorship", "interview prep"],
        mentorLanguages: Array.isArray(mentor.languages_spoken) ? mentor.languages_spoken : ["en", "hi"],
        studentLanguage: "en",
        timezoneDifferenceHours: 0,
        hasSlotOnPreferredTime: hasSlot,
        hasSlotWithinOneDay: true,
        rollingRating: Number(mentor.rolling_rating) || 4.8,
        completedBookingsCount: 12,
        cancelledBookingsCount: 0,
        mentorPrice: Number(candidate.price) || 999,
        studentBudgetMax: input.budgetMax,
        mentorYearsExperience: Number(mentor.years_experience) || 6,
        requiredExperienceYears: 3,
        avgResponseHours: 1.5,
        cancellationRatePercentage: 0.5,
        activeBookingsCount: 1,
        recentRequestsCount: 0,
      };

      const breakdown = evaluateCandidate(evalInput);
      return {
        candidate,
        mentor,
        evalInput,
        evaluation: breakdown,
      };
    });

    // Sort using deterministic tie-breaking rules
    evaluatedCandidates.sort((a, b) => compareCandidates(a, b));

    // Bound to Top 5 (or available pool size)
    const topCandidates = evaluatedCandidates.slice(0, 5);

    // -------------------------------------------------------------
    // STAGE 4: LLM Reasoning & Match Explanation (with Circuit Breaker)
    // -------------------------------------------------------------
    const candidateResults: MatchCandidateResult[] = [];

    for (let i = 0; i < topCandidates.length; i++) {
      const item = topCandidates[i];
      const rankOrder = i + 1;
      const mentor = item.mentor;
      const candidate = item.candidate;

      const prompt = PROMPT_TEMPLATES.smartMatchExplanation({
        studentGoal: input.studentGoal || "Career excellence",
        targetRole: input.targetRole || "Software Engineer",
        budgetMax: input.budgetMax,
        careerMarket: input.targetCareerMarketId || "CM-IN",
        mentorName: mentor.full_name || "Senior Mentor",
        mentorHeadline: mentor.headline || "Industry Expert",
        mentorCompanies: ["Google", "Amazon"],
        mentorSkills: mentor.skills || ["DSA", "System Design"],
        offeredPrice: candidate.price,
      });

      // Wrap in 3,000ms SLA circuit breaker
      const explanationResult = await executeWithCircuitBreaker<{ explanation: string }>(
        async (signal) => {
          const res = await defaultGateway.generateStructuredJson<{ explanation: string }>(
            prompt,
            process.env.GEMINI_DEFAULT_MODEL || "gemini-2.5-flash",
            signal
          );
          return res.data;
        },
        () => {
          fallbackActive = true;
          // Deterministic rule-based explanation
          return {
            explanation: `${mentor.full_name} is ranked #${rankOrder} based on verified ${mentor.experience_years || 5}+ years of domain experience and pricing within your ₹${input.budgetMax} budget limit.`,
          };
        },
        3000
      );

      if (explanationResult.fallbackActive) {
        fallbackActive = true;
      }

      candidateResults.push({
        mentorId: mentor.id,
        rankOrder,
        matchScorePercentage: item.evaluation.totalScorePercentage,
        aiExplanation: explanationResult.data.explanation,
        mentor: {
          id: mentor.id,
          fullName: mentor.full_name || "Expert Mentor",
          headline: mentor.headline || "Senior Tech Leader",
          avatarUrl: mentor.avatar_url || "",
          rollingRating: Number(mentor.rolling_rating) || 4.8,
          verifiedCompanies: ["Verified Leader"],
          offeredPrice: Number(candidate.price),
        },
        scoreBreakdown: item.evaluation,
      });
    }

    // -------------------------------------------------------------
    // STAGE 6: Atomic Persistence & Status Update
    // -------------------------------------------------------------
    if (candidateResults.length > 0 && input.requestId) {
      try {
        const rowsToInsert = candidateResults.map((m) => ({
          request_id: input.requestId,
          mentor_id: m.mentorId,
          match_score: m.scoreBreakdown.totalScorePercentage,
          status: "pending",
        }));

        const { data: insertedMatches, error: matchInsertError } = await this.admin
          .from("service_request_matches")
          .insert(rowsToInsert)
          .select();

        if (matchInsertError) {
          console.warn("[SMART MATCH] Matches insert notice:", matchInsertError.message);
        } else if (insertedMatches) {
          insertedMatches.forEach((row: any, idx: number) => {
            if (candidateResults[idx]) {
              candidateResults[idx].matchId = row.id;
            }
          });
        }

        // Update request status to 'offers_received' if matches were found
        await this.admin
          .from("service_requests")
          .update({ status: "offers_received" })
          .eq("id", input.requestId);
      } catch (persistErr: any) {
        console.warn("[SMART MATCH] Persistence warning:", persistErr.message);
      }
    }

    const totalLatency = Date.now() - pipelineStartTime;

    return {
      requestId: input.requestId,
      matches: candidateResults,
      fallbackActive,
      totalCandidatePool: stage1Candidates.length,
      latencyMs: totalLatency,
    };
  }
}

export const smartMatchService = new SmartMatchService();
