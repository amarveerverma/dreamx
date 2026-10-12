"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface GoalDetail {
  id: string;
  title: string;
  category: string;
  icon: string;
  defaultServiceSlug: string;
  startingPrice: string;
  popularity: string;
  headline: string;
  description: string;
  targetAudience: string[];
  deliverables: string[];
  curriculumHighlights: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

const GOAL_DATABASE: Record<string, GoalDetail> = {
  "mock-interview": {
    id: "mock-interview",
    title: "1-on-1 Mock Interview",
    category: "Interview Prep",
    icon: "🎯",
    defaultServiceSlug: "mock-interview",
    startingPrice: "₹999",
    popularity: "Most Popular",
    headline: "Simulate Google & Meta Bar-Raiser Loops with Verified Staff Leads",
    description: "Practice real coding and behavioral rounds under strict interview conditions. Receive a formal 3-page scorecard grading problem-solving, code structure, complexity analysis, and communication.",
    targetAudience: [
      "Engineers with upcoming Big Tech & Unicorn technical phone screens",
      "Developers experiencing stage-fright or communication blocks in live coding",
      "Mid-level engineers interviewing for SDE-2 or Senior roles"
    ],
    deliverables: [
      "Full 60-minute simulated live loop over audio/video",
      "Standardized 14-point Bar Raiser evaluation scorecard",
      "Personalized 30-day interview remediation action plan"
    ],
    curriculumHighlights: [
      { step: "01", title: "Live Problem Presentation", desc: "Solve an un-googleable real production scenario under timed constraints." },
      { step: "02", title: "Whiteboard & Tradeoffs", desc: "Defend memory vs. time complexity, edge cases, and scalability bottlenecks." },
      { step: "03", title: "Standardized Rubric Debrief", desc: "Direct feedback on hiring committee criteria: coding speed, signal-to-noise, and ownership." }
    ],
    faqs: [
      { q: "What difficulty level are the questions?", a: "Calibrated to your target company (LeetCode Medium to Hard for Google/Meta/Amazon, or real system scenarios)." },
      { q: "Do I get a recording and written feedback?", a: "Yes, you receive the full session recording and the standardized 3-page deliverable rubric." },
      { q: "How does the AI Smart Match select my interviewer?", a: "Our 6-stage engine parses your target company, role level, and calendar availability to pair you with active interviewers." }
    ]
  },
  "resume-review": {
    id: "resume-review",
    title: "ATS Resume Rebuild",
    category: "Career Profile",
    icon: "📄",
    defaultServiceSlug: "resume-review",
    startingPrice: "₹799",
    popularity: "High Impact",
    headline: "Transform Your Resume into a Top 1% ATS-Passing Profile",
    description: "Get line-by-line bullet rewrites tailored to target tech employers. Replace passive task lists with Google XYZ formulas (Accomplished [X] as measured by [Y] by doing [Z]).",
    targetAudience: [
      "Job seekers applying to hundreds of roles without receiving recruiter callbacks",
      "Engineers transitioning from service-based to product-based companies",
      "Senior developers struggling to condense 8+ years of technical scope into 1-2 pages"
    ],
    deliverables: [
      "Line-by-line annotated PDF with precise bullet rewrites",
      "Automated ATS score check against 50+ tier-1 company job descriptions",
      "Targeted technical skill hierarchy matrix"
    ],
    curriculumHighlights: [
      { step: "01", title: "ATS Parser Diagnostic", desc: "Identify formatting traps, table parsing issues, and missing keyword density." },
      { step: "02", title: "XYZ Impact Quantification", desc: "Rewrite bullets to highlight latency cuts, QPS gains, and revenue velocity." },
      { step: "03", title: "Recruiter Eye-Tracking Audit", desc: "Format layout for the standard 6-second initial recruiter scan." }
    ],
    faqs: [
      { q: "Will this pass modern Taleo/Workday ATS systems?", a: "100%. We provide clean, single-column LaTeX/Markdown-compatible templates that parse flawlessly." },
      { q: "Can the mentor rewrite bullets for niche domains like ML or DevOps?", a: "Yes! AI Smart Match matches you with mentors having verified domain experience in your exact stack." }
    ]
  },
  "system-design": {
    id: "system-design",
    title: "System Design & Architecture",
    category: "Technical Depth",
    icon: "🏗️",
    defaultServiceSlug: "system-design",
    startingPrice: "₹1,499",
    popularity: "Advanced",
    headline: "Master Distributed Systems & High-Scale Architecture with Staff Engineers",
    description: "Design fault-tolerant, horizontally scalable systems handling 1M+ QPS. Deep dive into sharding, consensus protocols, idempotency, event streams, and caching tiers.",
    targetAudience: [
      "Engineers targeting SDE-3, Staff, or Principal roles at tier-1 tech firms",
      "Backend engineers who have only worked on monolithic or single-database systems",
      "Tech leads responsible for new microservices or distributed infrastructure"
    ],
    deliverables: [
      "Complete Excalidraw / Mermaid architectural blueprint",
      "Back-of-the-envelope capacity planning calculation sheet",
      "Deep-dive critique on single points of failure and consensus tradeoffs"
    ],
    curriculumHighlights: [
      { step: "01", title: "Requirements & Capacity Estimation", desc: "Derive read/write QPS, storage growth, bandwidth, and cache sizing in minutes." },
      { step: "02", title: "High-Level Architecture & Storage Selection", desc: "Select optimal SQL vs. NoSQL vs. Time-Series models, partition keys, and replication." },
      { step: "03", title: "Deep Dives & Failure Modes", desc: "Analyze split-brain scenarios, cache invalidation storms, and distributed transaction semantics." }
    ],
    faqs: [
      { q: "Is this High-Level Design (HLD) or Low-Level Design (LLD)?", a: "You can customize the focus. Both HLD (distributed systems) and LLD (object-oriented design patterns) are covered." },
      { q: "What tools do we use during the session?", a: "Live collaborative whiteboards (Excalidraw/Miro) with audio/video guidance." }
    ]
  },
  "dsa-prep": {
    id: "dsa-prep",
    title: "DSA & Problem Solving",
    category: "Technical Depth",
    icon: "⚡",
    defaultServiceSlug: "coding-dsa-prep",
    startingPrice: "₹899",
    popularity: "Core Skills",
    headline: "Conquer Advanced Dynamic Programming, Trees & Graph Algorithms",
    description: "Break down intricate algorithmic patterns with competitive programmers and ICPC regionalists. Learn mental models that turn 45-minute LeetCode puzzles into 15-minute solutions.",
    targetAudience: [
      "Engineers preparing for tier-1 online assessments and coding loops",
      "Students struggling with recursion, DP state transitions, or graph traversals",
      "Engineers wanting to advance from brute-force thinking to optimal asymptotic bounds"
    ],
    deliverables: [
      "Curated 75-pattern study roadmap customized to your weak areas",
      "Live algorithmic proof of space and time bounds",
      "Sandbox code repository with clean, production-grade solutions"
    ],
    curriculumHighlights: [
      { step: "01", title: "Pattern Recognition", desc: "Identify whether a problem maps to Monotonic Stack, Two Pointers, or Union-Find." },
      { step: "02", title: "Optimal State Transitions", desc: "Formulate recurrence relations and optimize 2D DP matrices into O(1) space." },
      { step: "03", title: "Clean Modular Implementation", desc: "Write bug-free, readable code without relying on trial-and-error debuggers." }
    ],
    faqs: [
      { q: "Can I choose the programming language?", a: "Yes, mentors support Java, C++, Python, Go, and TypeScript." }
    ]
  },
  "salary-negotiation": {
    id: "salary-negotiation",
    title: "Salary Negotiation Strategy",
    category: "Offer & Compensation",
    icon: "💼",
    defaultServiceSlug: "salary-negotiation",
    startingPrice: "₹1,299",
    popularity: "High ROI",
    headline: "Maximize Your Base, Signing Bonus & Equity with Proven Scripts",
    description: "Never leave money on the table. Analyze competing offer packets, model 4-year RSU vesting ladders, and rehearse phone negotiation calls with experienced tech managers.",
    targetAudience: [
      "Candidates with one or multiple active offers in hand",
      "Engineers unsure how to evaluate private startup ESOPs vs. public RSUs",
      "Professionals uncomfortable asking for higher compensation"
    ],
    deliverables: [
      "Total Compensation Analysis spreadsheet with tax and vesting modeling",
      "Word-for-word email and phone negotiation scripts",
      "Counter-offer strategy matrix based on current market compensation data"
    ],
    curriculumHighlights: [
      { step: "01", title: "Offer Packet Teardown", desc: "Deconstruct base salary, variable bonus, signing bonus, and equity clawback clauses." },
      { step: "02", title: "Leverage Identification", desc: "Frame competing timelines and unique skill fit without sounding adversarial." },
      { step: "03", title: "Mock Negotiation Call", desc: "Rehearse recruiter pushbacks and objections in a safe, simulated call." }
    ],
    faqs: [
      { q: "Can negotiating cause the company to revoke my offer?", a: "Legitimate tech companies do not revoke offers for polite, market-backed negotiations. Mentors coach you on professional framing." }
    ]
  },
  "switch-to-ai": {
    id: "switch-to-ai",
    title: "Transition into AI & ML",
    category: "Career Transition",
    icon: "🤖",
    defaultServiceSlug: "mock-interview",
    startingPrice: "₹1,499",
    popularity: "Trending",
    headline: "Pivot into AI Engineering, LLMs & Applied Machine Learning",
    description: "Get a clear roadmap from traditional software engineering to cutting-edge AI systems. Learn RAG architectures, model fine-tuning, vector embeddings, and evaluation pipelines.",
    targetAudience: [
      "Software engineers wanting to build production GenAI and LLM applications",
      "Backend developers transitioning to AI platform and ML infrastructure teams",
      "Data analysts aiming for Applied Data Scientist and ML Engineer roles"
    ],
    deliverables: [
      "Customized 6-month AI learning roadmap and project portfolio plan",
      "Architecture critique of your AI/RAG project repository",
      "Reading list of foundational papers and production case studies"
    ],
    curriculumHighlights: [
      { step: "01", title: "Skills Gap Audit", desc: "Map your existing math, Python, and system skills to applied ML requirements." },
      { step: "02", title: "Production GenAI Design", desc: "Learn latency optimization, semantic caching, guardrails, and vector DB tuning." },
      { step: "03", title: "Hiring Manager Review", desc: "Align your portfolio projects with what AI hiring leads actually evaluate." }
    ],
    faqs: [
      { q: "Do I need a PhD or advanced math degree to get started?", a: "No. Applied AI Engineering prioritizes software engineering, data pipelines, and production systems over theoretical math." }
    ]
  },
  "linkedin-optimization": {
    id: "linkedin-optimization",
    title: "LinkedIn Profile Audit",
    category: "Career Profile",
    icon: "🔍",
    defaultServiceSlug: "linkedin-optimization",
    startingPrice: "₹699",
    popularity: "Fast Results",
    headline: "Trigger Inbound Recruiter Messages from Tier-1 Tech Giants",
    description: "Optimize your headline, summary, and experience sections with high-intent keywords that recruiters search for daily on LinkedIn Recruiter.",
    targetAudience: [
      "Engineers who receive zero recruiter InMails",
      "Professionals planning an active job search over the next 3 months",
      "Founders and tech leads building a public personal engineering brand"
    ],
    deliverables: [
      "Complete rewrite of headline, 'About' section, and top 3 experience entries",
      "Keyword optimization report for LinkedIn search algorithms",
      "Inbound message response strategy guide"
    ],
    curriculumHighlights: [
      { step: "01", title: "Search Algorithmic Audit", desc: "Ensure your profile indexes for key titles, technologies, and seniority terms." },
      { step: "02", title: "Narrative & Hook Engineering", desc: "Craft a compelling professional story that highlights high-leverage business results." },
      { step: "03", title: "Featured Section Strategy", desc: "Showcase open-source contributions, talk videos, and high-impact blog posts." }
    ],
    faqs: [
      { q: "How quickly do inbound recruiter messages increase?", a: "Most candidates observe a 3x-5x jump in profile views and recruiter InMails within 14 days." }
    ]
  },
  "portfolio-review": {
    id: "portfolio-review",
    title: "Portfolio & GitHub Teardown",
    category: "Technical Depth",
    icon: "💻",
    defaultServiceSlug: "portfolio-review",
    startingPrice: "₹999",
    popularity: "Portfolio",
    headline: "Audit Your Repositories and Live Deployments for Production Rigor",
    description: "Turn generic tutorial clones into standout production demonstrations. Get code architecture reviews, CI/CD pipeline checks, and README presentation coaching.",
    targetAudience: [
      "Full-stack and frontend engineers looking to prove production engineering standards",
      "Self-taught developers and bootcamp graduates needing credible proof of competence",
      "Engineers building open-source projects or technical tools"
    ],
    deliverables: [
      "In-depth pull request review on your flagship repository",
      "README teardown and architecture diagram template",
      "Performance and testing coverage diagnostic"
    ],
    curriculumHighlights: [
      { step: "01", title: "Codebase & Architecture Review", desc: "Verify separation of concerns, error boundaries, state management, and typing." },
      { step: "02", title: "Production Readiness Check", desc: "Evaluate automated testing, Docker configuration, and CI/CD deployment pipelines." },
      { step: "03", title: "Presentation Polish", desc: "Craft high-converting demo GIFs, clear setup docs, and architecture diagrams." }
    ],
    faqs: [
      { q: "What kind of projects get the best recruiter response?", a: "Projects solving real problems with distributed architecture, clean UI, and test coverage." }
    ]
  }
};

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = (params?.goal as string) || "mock-interview";
  const goal = GOAL_DATABASE[goalId] || GOAL_DATABASE["mock-interview"];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/discover" className="hover:text-indigo-600 transition-colors">Career Goals</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{goal.title}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl p-2 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                  {goal.icon}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {goal.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {goal.popularity}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                {goal.headline}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                {goal.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/services/${goal.defaultServiceSlug}/match?goal=${goal.id}`}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Launch AI Smart Match</span>
                  <span className="text-xs bg-indigo-500/60 px-2 py-0.5 rounded-full">6 Stages</span>
                  <span>✦</span>
                </Link>
                <Link
                  href="/services"
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                >
                  Browse Direct Catalog
                </Link>
              </div>
            </div>

            <div className="w-full md:w-72 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shrink-0">
              <div>
                <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Guaranteed Starting Price</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">{goal.startingPrice}</span>
                  <span className="text-xs font-semibold text-slate-500">INR / session</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-200 pt-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>100% DreamX Safe Escrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Verified Tier-1 Staff Mentors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>48h SLA or Full Refund</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Standardized Deliverables</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/services/${goal.defaultServiceSlug}/match?goal=${goal.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center block transition-all"
                >
                  Start Intake Now →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - 3 Step Breakdown */}
        <div className="mb-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Roadmap</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">What You Experience in This Session</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goal.curriculumHighlights.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-200 transition-all">
                <div>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block mb-3">
                    Phase {item.step}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables & Target Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">inventory_2</span>
              Standardized Deliverables You Receive
            </h3>
            <ul className="space-y-3">
              {goal.deliverables.map((del, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">group</span>
              Who This Session Is For
            </h3>
            <ul className="space-y-3">
              {goal.targetAudience.map((aud, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{aud}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Smart Match Explanation Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 mb-3">
              <span>✦ Real-Time Matching Engine</span>
            </div>
            <h3 className="text-xl font-bold mb-2">
              Don't browse endlessly. Let our 6-Stage Algorithm find your best match.
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              We compute cosine distance over pgvector 768-dim embeddings, intersect calendar availability, and run Gemini 2.5 Flash reasoning to generate a transparent 14-dimension compatibility score.
            </p>
          </div>
          <Link
            href={`/services/${goal.defaultServiceSlug}/match?goal=${goal.id}`}
            className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-all shrink-0 shadow-lg"
          >
            Launch 6-Stage Intake Now
          </Link>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {goal.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800">{faq.q}</span>
                  <span className="text-slate-400 font-bold text-sm">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-4 py-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
