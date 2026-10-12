import { jaccardSimilarity, cosineSimilarity, evaluateCandidate, compareCandidates, CandidateEvaluationInput, DimensionScoreBreakdown } from "../src/lib/ai/math";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function runTests() {
  console.log("=== RUNNING FOCUSED AI MATH & SMART MATCH UNIT TESTS ===");

  // 1. Jaccard: Empty sets
  assert(jaccardSimilarity([], []) === 0.0, "Empty sets yield 0.0");
  assert(jaccardSimilarity(["React"], []) === 0.0, "One empty set yields 0.0");
  assert(jaccardSimilarity([], ["Python"]) === 0.0, "Other empty set yields 0.0");

  // 2. Jaccard: Identical sets
  assert(jaccardSimilarity(["React", "TypeScript"], ["React", "TypeScript"]) === 1.0, "Identical sets yield 1.0");

  // 3. Jaccard: Disjoint sets
  assert(jaccardSimilarity(["React", "Next"], ["Python", "Django"]) === 0.0, "Disjoint sets yield 0.0");

  // 4. Jaccard: Mixed-case and whitespace-normalized strings
  assert(
    jaccardSimilarity(["  ReACT  ", "typeSCRIPT\t"], ["react", "   typescript "]) === 1.0,
    "Case & whitespace normalized strings yield 1.0"
  );

  // 5. Jaccard: Duplicate inputs
  assert(
    jaccardSimilarity(["React", "react", "REACT "], ["react"]) === 1.0,
    "Duplicate inputs are normalized by Set to 1.0"
  );

  // 6. Jaccard: Partial overlap
  const partial = jaccardSimilarity(["A", "B", "C"], ["B", "C", "D"]);
  // Intersection = {B, C} (2), Union = {A, B, C, D} (4) -> 2/4 = 0.5
  assert(Math.abs(partial - 0.5) < 0.0001, "Partial overlap (2 of 4) yields 0.5");

  // 7. Cosine similarity
  const vecA = [1, 0, 0];
  const vecB = [1, 0, 0];
  const vecC = [0, 1, 0];
  assert(Math.abs(cosineSimilarity(vecA, vecB) - 1.0) < 0.0001, "Orthogonal cosine bounds correctly");
  assert(Math.abs(cosineSimilarity(vecA, vecC) - 0.5) < 0.0001, "Perpendicular vectors bound to 0.5");

  // 8. evaluateCandidate 14-dimension breakdown
  const mockInput1: CandidateEvaluationInput = {
    mentorId: "mentor-1111-aaaa",
    vectorSimilarity: 0.92,
    careerMarketId: "CM-IN",
    targetCareerMarketId: "CM-IN",
    isServiceApproved: true,
    mentorSkills: ["React", "TypeScript", "Node"],
    studentSkills: ["React", "TypeScript"],
    mentorIndustry: "Fintech",
    studentIndustry: "Fintech",
    mentorLanguages: ["English", "Hindi"],
    studentLanguage: "English",
    timezoneDifferenceHours: 0,
    hasSlotOnPreferredTime: true,
    hasSlotWithinOneDay: true,
    rollingRating: 4.95,
    completedBookingsCount: 20,
    cancelledBookingsCount: 0,
    mentorPrice: 1500,
    studentBudgetMax: 2000,
    mentorYearsExperience: 8,
    requiredExperienceYears: 4,
    avgResponseHours: 1.0,
    cancellationRatePercentage: 0.0,
    activeBookingsCount: 2,
    recentRequestsCount: 1,
  };

  const eval1 = evaluateCandidate(mockInput1);
  console.log("Evaluation 1 breakdown:", eval1);
  assert(eval1.careerGoalAlignment === 0.92, "Vector similarity mapped correctly");
  assert(eval1.careerMarketMatch === 1.0, "Career market exact match is 1.0");
  assert(eval1.serviceExpertise === 1.0, "Service expertise is 1.0");
  assert(eval1.totalScore >= 0.0 && eval1.totalScore <= 1.0, "Total score is bounded in [0, 1]");
  assert(eval1.totalScorePercentage === Number((eval1.totalScore * 100).toFixed(1)), "Percentage matches total score");

  // 9. compareCandidates sorting & tie-breaking
  const mockInput2: CandidateEvaluationInput = {
    ...mockInput1,
    mentorId: "mentor-2222-bbbb",
    activeBookingsCount: 4, // More active bookings
  };
  const eval2 = evaluateCandidate(mockInput2); // same score

  // Tie-breaker 1: Fewer active bookings
  const tie1 = compareCandidates(
    { evaluation: eval1, input: mockInput1 },
    { evaluation: eval2, input: mockInput2 }
  );
  assert(tie1 < 0, "Candidate 1 with fewer active bookings ranks before Candidate 2 on tie");

  // Tie-breaker 2: Same active bookings, fewer recent requests
  const mockInput3: CandidateEvaluationInput = {
    ...mockInput1,
    mentorId: "mentor-3333-cccc",
    recentRequestsCount: 5,
  };
  const eval3 = evaluateCandidate(mockInput3);
  const tie2 = compareCandidates(
    { evaluation: eval1, input: mockInput1 },
    { evaluation: eval3, input: mockInput3 }
  );
  assert(tie2 < 0, "Candidate 1 with fewer recent requests ranks before Candidate 3 on tie");

  // Tie-breaker 3: Same load, deterministic UUID sort
  const mockInput4: CandidateEvaluationInput = {
    ...mockInput1,
    mentorId: "mentor-0000-zero", // alphabetically earlier
  };
  const eval4 = evaluateCandidate(mockInput4);
  const tie3 = compareCandidates(
    { evaluation: eval1, input: mockInput1 },
    { evaluation: eval4, input: mockInput4 }
  );
  assert(tie3 > 0, "Alphabetically earlier mentor UUID 'mentor-0000' ranks before 'mentor-1111'");

  console.log("=== ALL AI MATH & COMPARISON UNIT TESTS PASSED ===");
}

runTests();
