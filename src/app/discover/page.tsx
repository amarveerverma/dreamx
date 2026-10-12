"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const GOALS = [
  {
    id: "mock-interview",
    title: "1-on-1 Mock Interview",
    description: "Realistic mock interview rounds with Google, Amazon, and Razorpay leads. Receive deep feedback on problem solving and communication.",
    category: "Interview Prep",
    icon: "🎯",
    defaultServiceSlug: "mock-interview",
    startingPrice: "₹999",
    popularity: "Most Popular",
  },
  {
    id: "resume-review",
    title: "ATS Resume Rebuild",
    description: "Transform your resume into a top 1% ATS-passing profile. Get line-by-line bullet rewrites tailored to target tech employers.",
    category: "Career Profile",
    icon: "📄",
    defaultServiceSlug: "resume-review",
    startingPrice: "₹799",
    popularity: "High Impact",
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    description: "Deep dive into distributed systems, concurrency, scalability, and microservices architecture with senior staff engineers.",
    category: "Technical Depth",
    icon: "🏗️",
    defaultServiceSlug: "system-design",
    startingPrice: "₹1,499",
    popularity: "Advanced",
  },
  {
    id: "dsa-prep",
    title: "DSA & Problem Solving",
    description: "Master complex dynamic programming, trees, graphs, and greedy algorithms. Get unblocked on difficult LeetCode patterns.",
    category: "Technical Depth",
    icon: "⚡",
    defaultServiceSlug: "dsa-prep",
    startingPrice: "₹899",
    popularity: "Core Skills",
  },
  {
    id: "salary-negotiation",
    title: "Salary Negotiation Strategy",
    description: "Evaluate offer letters, calculate stock grant valuations, and practice counter-offer negotiation scripts to maximize your CTC.",
    category: "Offer & Compensation",
    icon: "💼",
    defaultServiceSlug: "salary-negotiation",
    startingPrice: "₹1,299",
    popularity: "High ROI",
  },
  {
    id: "switch-to-ai",
    title: "Transition into AI & ML",
    description: "Roadmaps and portfolio reviews for software engineers pivoting into machine learning, LLM fine-tuning, and AI engineering.",
    category: "Career Transition",
    icon: "🤖",
    defaultServiceSlug: "mock-interview",
    startingPrice: "₹1,499",
    popularity: "Trending",
  },
  {
    id: "linkedin-optimization",
    title: "LinkedIn Profile Audit",
    description: "Optimize headline, summary, and work experiences to trigger inbound recruiter messages for tier-1 tech firms.",
    category: "Career Profile",
    icon: "🔍",
    defaultServiceSlug: "linkedin-optimization",
    startingPrice: "₹699",
    popularity: "Fast Results",
  },
  {
    id: "portfolio-review",
    title: "Frontend & Full-Stack Portfolio Review",
    description: "Code architecture, GitHub repo audits, and project presentation coaching that wows hiring committees.",
    category: "Technical Depth",
    icon: "💻",
    defaultServiceSlug: "portfolio-review",
    startingPrice: "₹999",
    popularity: "Portfolio",
  },
];

export default function DiscoverGoalsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Interview Prep", "Technical Depth", "Career Profile", "Offer & Compensation", "Career Transition"];

  const filteredGoals = selectedCategory === "All"
    ? GOALS
    : GOALS.filter((g) => g.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-4">
            <span>✨ Goal-Based Career Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Choose Your Goal. Let AI Match the Perfect Mentor.
          </h1>
          <p className="text-base text-slate-600">
            Tell us your target milestone. Our 6-stage matching engine evaluates candidate mentors across 14 signals to connect you with verified industry leaders.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {goal.icon}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {goal.popularity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {goal.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Starting from</span>
                  <span className="text-sm font-bold text-slate-900">{goal.startingPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/discover/${goal.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/services/${goal.defaultServiceSlug}/match`}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Match Now ✦
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
