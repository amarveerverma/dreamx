/**
 * 14-Dimension Composite Scoring Math Engine (PRD §6.1 & Architecture.md §10.2)
 * Evaluates candidate mentors across 14 weighted signals summing to exactly 1.00.
 */

export interface CandidateEvaluationInput {
  mentorId: string;
  vectorSimilarity: number; // Dimension 1 (0.0 to 1.0)
  careerMarketId: string; // Dimension 2 (e.g. 'CM-IN')
  targetCareerMarketId: string;
  isServiceApproved: boolean; // Dimension 3
  studentSkills: string[]; // Dimension 4
  mentorSkills: string[];
  mentorIndustry?: string; // Dimension 5
  studentIndustry?: string;
  mentorLanguages: string[]; // Dimension 6
  studentLanguage: string;
  timezoneDifferenceHours: number; // Dimension 7
  hasSlotOnPreferredTime: boolean; // Dimension 8
  hasSlotWithinOneDay: boolean;
  rollingRating: number; // Dimension 9 (1.0 to 5.0)
  completedBookingsCount: number; // Dimension 10
  cancelledBookingsCount: number;
  mentorPrice: number; // Dimension 11
  studentBudgetMax: number;
  mentorYearsExperience: number; // Dimension 12
  requiredExperienceYears: number;
  avgResponseHours: number; // Dimension 13
  cancellationRatePercentage: number; // Dimension 14
  activeBookingsCount: number; // Tie-breaker 1
  recentRequestsCount: number; // Tie-breaker 2
}

export interface DimensionScoreBreakdown {
  careerGoalAlignment: number; // 0.12
  careerMarketMatch: number; // 0.12
  serviceExpertise: number; // 0.15
  skillsAlignment: number; // 0.10
  industryMatch: number; // 0.06
  languageCompatibility: number; // 0.08
  timeZoneCompatibility: number; // 0.05
  availability: number; // 0.08
  ratingScore: number; // 0.06
  successRate: number; // 0.06
  budgetMatch: number; // 0.05
  experienceMatch: number; // 0.04
  responseTime: number; // 0.02
  cancellationRate: number; // 0.01
  totalScore: number; // 0.0 to 1.0
  totalScorePercentage: number; // 0.0 to 100.0%
}

export const DIMENSION_WEIGHTS = {
  careerGoalAlignment: 0.12,
  careerMarketMatch: 0.12,
  serviceExpertise: 0.15,
  skillsAlignment: 0.1,
  industryMatch: 0.06,
  languageCompatibility: 0.08,
  timeZoneCompatibility: 0.05,
  availability: 0.08,
  ratingScore: 0.06,
  successRate: 0.06,
  budgetMatch: 0.05,
  experienceMatch: 0.04,
  responseTime: 0.02,
  cancellationRate: 0.01,
};

/**
 * Calculates cosine similarity between two unit vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0.5;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.5;
  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Bound to [0, 1]
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}

/**
 * Jaccard Index on string sets
 */
function jaccardSimilarity(setA: string[], setB: string[]): number {
  if (!setA.length || !setB.length) return 0.0;
  const sA = new Set(setA.map((s) => s.toLowerCase().trim()));
  const sB = new Set(setB.map((s) => s.toLowerCase().trim()));
  let intersection = 0;
  for (const item of sA) {
    if (sB.has(item)) intersection++;
  }
  const union = sA.size + sB.size - intersection;
  return union > 0 ? intersection / union : 0.0;
}

/**
 * Evaluates a candidate across all 14 dimensions deterministically
 */
export function evaluateCandidate(
  input: CandidateEvaluationInput
): DimensionScoreBreakdown {
  // 1. Career Goal Alignment (0.12): Vector similarity
  const s1 = Math.max(0, Math.min(1, input.vectorSimilarity));

  // 2. Career Market Match (0.12): Exact = 1.0, Adjacent = 0.5, none = 0.0
  let s2 = 0.0;
  if (input.careerMarketId === input.targetCareerMarketId) s2 = 1.0;
  else if (input.targetCareerMarketId.startsWith("CM-") && input.careerMarketId.startsWith("CM-")) s2 = 0.5;

  // 3. Service Expertise (0.15): 1.0 if approved
  const s3 = input.isServiceApproved ? 1.0 : 0.0;

  // 4. Skills Alignment (0.10): Jaccard index
  const s4 = jaccardSimilarity(input.studentSkills, input.mentorSkills);

  // 5. Industry Match (0.06): Exact = 1.0, adjacent = 0.5
  let s5 = 0.0;
  if (input.mentorIndustry && input.studentIndustry) {
    s5 = input.mentorIndustry.toLowerCase() === input.studentIndustry.toLowerCase() ? 1.0 : 0.5;
  } else {
    s5 = 0.5; // neutral fallback
  }

  // 6. Language Compatibility (0.08)
  const studentLang = (input.studentLanguage || "en").toLowerCase();
  const mentorLangs = (input.mentorLanguages || ["en"]).map((l) => l.toLowerCase());
  let s6 = 0.0;
  if (mentorLangs.includes(studentLang)) s6 = 1.0;
  else if (mentorLangs.includes("en")) s6 = 0.7; // English fallback

  // 7. Time Zone Compatibility (0.05): <=2h = 1.0, <=4h = 0.7, <=8h = 0.3, >8h = 0.0
  const tzDiff = Math.abs(input.timezoneDifferenceHours || 0);
  let s7 = 0.0;
  if (tzDiff <= 2) s7 = 1.0;
  else if (tzDiff <= 4) s7 = 0.7;
  else if (tzDiff <= 8) s7 = 0.3;
  else s7 = 0.0;

  // 8. Availability (0.08): 1.0 preferred slot, 0.5 within 1 day, 0.1 within 3 days
  let s8 = 0.1;
  if (input.hasSlotOnPreferredTime) s8 = 1.0;
  else if (input.hasSlotWithinOneDay) s8 = 0.5;

  // 9. Historical Rating (0.06): (rolling_rating - 1) / 4.0
  const rating = input.rollingRating || 4.5;
  const s9 = Math.max(0, Math.min(1, (rating - 1.0) / 4.0));

  // 10. Booking Success Rate (0.06)
  const totalBookings = (input.completedBookingsCount || 0) + (input.cancelledBookingsCount || 0);
  const s10 = totalBookings > 0 ? (input.completedBookingsCount || 0) / totalBookings : 1.0;

  // 11. Budget Compatibility (0.05): price <= max -> 1.0, within 20% -> 0.5, >20% -> 0.0
  let s11 = 0.0;
  if (input.mentorPrice <= input.studentBudgetMax) s11 = 1.0;
  else if (input.mentorPrice <= input.studentBudgetMax * 1.2) s11 = 0.5;

  // 12. Experience Match (0.04): exact = 1.0, 1 level above = 0.7, 2 levels = 0.4
  const expDiff = (input.mentorYearsExperience || 0) - (input.requiredExperienceYears || 0);
  let s12 = 0.1;
  if (expDiff >= 0 && expDiff <= 2) s12 = 1.0;
  else if (expDiff > 2 && expDiff <= 5) s12 = 0.7;
  else if (expDiff > 5) s12 = 0.4;

  // 13. Response Time (0.02): <2h = 1.0, <6h = 0.7, <12h = 0.3, <24h = 0.1
  const respHours = input.avgResponseHours || 1.5;
  let s13 = 0.1;
  if (respHours <= 2) s13 = 1.0;
  else if (respHours <= 6) s13 = 0.7;
  else if (respHours <= 12) s13 = 0.3;

  // 14. Cancellation Rate (0.01): <2% = 1.0, <5% = 0.5, >=5% = 0.0
  const cancelRate = input.cancellationRatePercentage || 0.0;
  let s14 = 0.0;
  if (cancelRate < 2.0) s14 = 1.0;
  else if (cancelRate < 5.0) s14 = 0.5;

  // Weighted Sum
  const totalScore =
    s1 * DIMENSION_WEIGHTS.careerGoalAlignment +
    s2 * DIMENSION_WEIGHTS.careerMarketMatch +
    s3 * DIMENSION_WEIGHTS.serviceExpertise +
    s4 * DIMENSION_WEIGHTS.skillsAlignment +
    s5 * DIMENSION_WEIGHTS.industryMatch +
    s6 * DIMENSION_WEIGHTS.languageCompatibility +
    s7 * DIMENSION_WEIGHTS.timeZoneCompatibility +
    s8 * DIMENSION_WEIGHTS.availability +
    s9 * DIMENSION_WEIGHTS.ratingScore +
    s10 * DIMENSION_WEIGHTS.successRate +
    s11 * DIMENSION_WEIGHTS.budgetMatch +
    s12 * DIMENSION_WEIGHTS.experienceMatch +
    s13 * DIMENSION_WEIGHTS.responseTime +
    s14 * DIMENSION_WEIGHTS.cancellationRate;

  return {
    careerGoalAlignment: Number(s1.toFixed(3)),
    careerMarketMatch: Number(s2.toFixed(3)),
    serviceExpertise: Number(s3.toFixed(3)),
    skillsAlignment: Number(s4.toFixed(3)),
    industryMatch: Number(s5.toFixed(3)),
    languageCompatibility: Number(s6.toFixed(3)),
    timeZoneCompatibility: Number(s7.toFixed(3)),
    availability: Number(s8.toFixed(3)),
    ratingScore: Number(s9.toFixed(3)),
    successRate: Number(s10.toFixed(3)),
    budgetMatch: Number(s11.toFixed(3)),
    experienceMatch: Number(s12.toFixed(3)),
    responseTime: Number(s13.toFixed(3)),
    cancellationRate: Number(s14.toFixed(3)),
    totalScore: Number(totalScore.toFixed(4)),
    totalScorePercentage: Number((totalScore * 100).toFixed(1)),
  };
}

/**
 * Deterministic Tie-Breaking Comparator (PRD §6.3)
 */
export function compareCandidates(
  a: { evaluation: DimensionScoreBreakdown; input: CandidateEvaluationInput },
  b: { evaluation: DimensionScoreBreakdown; input: CandidateEvaluationInput }
): number {
  const scoreDiff = b.evaluation.totalScore - a.evaluation.totalScore;
  if (Math.abs(scoreDiff) >= 0.005) {
    return scoreDiff;
  }
  // Tie-Breaker 1: Fewer active bookings (load balancing)
  const bookingDiff = a.input.activeBookingsCount - b.input.activeBookingsCount;
  if (bookingDiff !== 0) return bookingDiff;

  // Tie-Breaker 2: Fewer recent requests assigned (fairness)
  const reqDiff = a.input.recentRequestsCount - b.input.recentRequestsCount;
  if (reqDiff !== 0) return reqDiff;

  // Tie-Breaker 3: Deterministic UUID sort
  return a.input.mentorId.localeCompare(b.input.mentorId);
}
