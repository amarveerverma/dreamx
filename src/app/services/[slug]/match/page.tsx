"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SLUG_TO_ID: Record<string, number> = {
  "mock-interview": 1,
  "resume-review": 2,
  "coding-dsa-prep": 3,
  "dsa-prep": 3,
  "career-roadmap": 4,
  "salary-negotiation": 5,
  "system-design": 6,
  "linkedin-optimization": 7,
  "portfolio-review": 8,
  "offer-evaluation": 9,
  "bar-raiser": 10,
};

export default function SmartMatchIntakePage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = (params?.slug as string) || "mock-interview";

  // Form State
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState("Senior Distributed Systems Engineer");
  const [experienceLevel, setExperienceLevel] = useState("3-5 years (Mid-Senior)");
  const [skillTags, setSkillTags] = useState<string[]>(["Distributed Systems", "Go", "Kubernetes", "System Design"]);
  const [newSkill, setNewSkill] = useState("");

  const [marketId, setMarketId] = useState("CM-IN");
  const [budgetMin, setBudgetMin] = useState(800);
  const [budgetMax, setBudgetMax] = useState(2500);

  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [preferredTimeUtc, setPreferredTimeUtc] = useState("14:00:00");
  const [studentTimeZone, setStudentTimeZone] = useState("Asia/Kolkata");

  const [resumeUrl, setResumeUrl] = useState("https://ogpgoxikulkfpyoorisc.supabase.co/storage/v1/object/public/resumes/candidate_resume.pdf");
  const [studentGoal, setStudentGoal] = useState("I want to crack the Google L5 System Design interview and get actionable feedback on concurrency and scale.");

  // Submission & Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingSteps = [
    "Scanning candidate pool across India market...",
    "Projecting weekly mentor calendar schedules...",
    "Executing pgvector cosine similarity search...",
    "Synthesizing Gemini 2.5 Flash reasoning explanations...",
    "Locking deterministic Top-5 ranking...",
  ];

  function addSkill() {
    if (newSkill.trim() && !skillTags.includes(newSkill.trim())) {
      setSkillTags([...skillTags, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setSkillTags(skillTags.filter((s) => s !== skill));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Animate through processing steps
    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < processingSteps.length) {
        setProcessingStage(currentStage);
      }
    }, 450);

    try {
      const resolvedServiceTypeId = SLUG_TO_ID[serviceSlug] || 1;
      const payload = {
        service_type_id: resolvedServiceTypeId,
        target_career_market_id: marketId,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        preferred_date: preferredDate,
        preferred_time_utc: preferredTimeUtc,
        student_time_zone: studentTimeZone,
        attached_resume_url: resumeUrl,
        student_goal: studentGoal,
        target_role: targetRole,
        skill_tags: skillTags,
      };

      const res = await fetch("/api/v1/smart-match/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process smart match request");
      }

      const data = await res.json();
      console.log("[SMART MATCH SUCCESS]", data);

      // Brief delay to allow completion animation
      setTimeout(() => {
        router.push("/dashboard/student/requests");
      }, 600);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-indigo-600 transition-colors">Services</Link>
            <span>/</span>
            <span className="font-semibold text-slate-900 capitalize">{serviceSlug.replace(/-/g, " ")}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">AI Smart Match Intake</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              ⚡ 6-Stage Matching Engine
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              ● Live Pool: Verified Mentors Active
            </span>
          </div>
        </div>

        {/* Stepper Ribbon */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            <div
              onClick={() => !isSubmitting && setStep(1)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                step === 1 ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              1. Goals & Role
            </div>
            <div
              onClick={() => !isSubmitting && setStep(2)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                step === 2 ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              2. Market & Budget
            </div>
            <div
              onClick={() => !isSubmitting && setStep(3)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                step === 3 ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              3. Schedule
            </div>
            <div
              onClick={() => !isSubmitting && setStep(4)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                step === 4 ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              4. Review & Launch
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {isSubmitting ? (
            /* Processing Animation Screen */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl animate-pulse shadow-lg shadow-indigo-200 mb-6">
                ✦
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Executing AI Smart Match Pipeline</h2>
              <p className="text-sm text-indigo-600 font-semibold mb-6 animate-fade">
                {processingSteps[processingStage]}
              </p>
              <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((processingStage + 1) / processingSteps.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">
                Evaluating 14 weighted signals (skills, ratings, schedule overlap, budget ceiling)
              </p>
            </div>
          ) : (
            <div>
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Define Your Career Focus & Goal</h2>
                    <p className="text-sm text-slate-500">
                      Our semantic matching engine uses this narrative to identify mentors with direct hiring experience in your target role.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Target Job Role / Title
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="e.g. Senior Backend Engineer, System Design Lead"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Experience Tier
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option>0-2 years (Early Career)</option>
                      <option>3-5 years (Mid-Senior)</option>
                      <option>6-10 years (Staff / Lead)</option>
                      <option>10+ years (Principal / Engineering Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Target Domain Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skillTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeSkill(tag)}
                            className="text-indigo-400 hover:text-indigo-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        placeholder="Add skill tag (e.g., PostgreSQL, Distributed Caching)"
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100"
                    >
                      Continue to Market & Budget →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Career Market & Pricing Boundaries</h2>
                    <p className="text-sm text-slate-500">
                      Specify your target hiring region and comfortable budget ceiling in INR.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Target Career Market
                    </label>
                    <select
                      value={marketId}
                      onChange={(e) => setMarketId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    >
                      <option value="CM-IN">🇮🇳 India Career Market (CM-IN)</option>
                      <option value="CM-US">🇺🇸 United States Market (CM-US)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Budget Minimum (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        min="500"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Budget Maximum (₹)
                      </label>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        min="800"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Selected Price Range: <strong>₹{budgetMin} – ₹{budgetMax}</strong></span>
                    <span className="text-emerald-600 font-semibold">100% Escrow Protected</span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100"
                    >
                      Continue to Schedule →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Preferred Scheduling Window</h2>
                    <p className="text-sm text-slate-500">
                      Our in-memory schedule projection checks weekly templates to find mentors with open slots on your target date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Preferred Time (UTC)
                      </label>
                      <select
                        value={preferredTimeUtc}
                        onChange={(e) => setPreferredTimeUtc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="10:00:00">10:00 UTC (15:30 IST / Morning)</option>
                        <option value="14:00:00">14:00 UTC (19:30 IST / Evening)</option>
                        <option value="16:00:00">16:00 UTC (21:30 IST / Night)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Student Timezone
                    </label>
                    <input
                      type="text"
                      value={studentTimeZone}
                      onChange={(e) => setStudentTimeZone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                      readOnly
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100"
                    >
                      Review & Launch Match →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Review & Execute Smart Match</h2>
                    <p className="text-sm text-slate-500">
                      Your input will be scrubbed of personal PII before being vectorized into 768-dimensional embeddings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Detailed Stated Goal & Context
                    </label>
                    <textarea
                      rows={3}
                      value={studentGoal}
                      onChange={(e) => setStudentGoal(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Describe what you want to achieve in this session..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Attached Resume Storage URL
                    </label>
                    <input
                      type="text"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs text-slate-600 bg-slate-50"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-900">
                    <div className="font-semibold text-indigo-950">Matching Engine SLA & Security:</div>
                    <ul className="list-disc list-inside space-y-1 text-indigo-800">
                      <li>Automated PII scrubbing redacts email, phone, and PAN before AI analysis.</li>
                      <li>3,000ms SLA with deterministic SQL heuristic fallback guarantees zero downtime.</li>
                      <li>Returns Top 5 verified mentors with transparent match percentages.</li>
                    </ul>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-200"
                    >
                      ✦ Launch Smart Match Pipeline
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
