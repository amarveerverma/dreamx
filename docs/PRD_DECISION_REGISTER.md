# DREAMX PLATFORM — ARCHITECTURAL & PRODUCT DECISION REGISTER
**Document Reference:** `PRD_DECISION_REGISTER.md`  
**Date:** 2026-10-13  
**Status:** Under Active Review — Awaiting Executive Sign-Off  
**Target Canonical Document:** `PRD_CANONICAL_V1.md`  

---

## 1. PURPOSE & GOVERNANCE

This Decision Register records all architectural, product, security, and financial decisions requiring explicit human alignment. Each record captures the business context, competing options, trade-offs, financial implications, recommended resolution, decision owner, and current approval status.

No decision in this register may be silently resolved in application source code or production database migrations without formal sign-off.

---

## 2. DECISION MATRIX SUMMARY

| Decision ID | Area / Category | Short Description | Competing Options | Recommended Option | Owner | Status |
|---|---|---|---|---|---|---|
| **DEC-01** | Monetization | Membership Pricing Model | Model A (₹149/₹299) vs Model B (₹399/₹799) | **Model B (₹399/₹799)** | Product Owner / CEO | **Pending Approval** |
| **DEC-02** | Monetization | Membership Discount Percentages | 5%/10% vs 10%/20% vs 15%/25% | **10% (Pro) / 20% (Elite)** | Head of Growth | **Pending Approval** |
| **DEC-03** | Financial / Tax | Tax Invariance & Mentor Earning | ₹800 fixed vs ₹764 post-GST vs Tax added at checkout | **₹800 fixed (GST absorbed)** | Finance & Legal | **Pending Approval** |
| **DEC-04** | Architecture | Backend System Boundary | Pure Next.js Monolith vs Next.js + FastAPI Hybrid | **Next.js Modular Monolith** | CTO / Lead Architect | **Pending Approval** |
| **DEC-05** | AI Architecture | Primary AI Provider & Vector Dim | Google Gemini (768-dim) vs OpenAI (1536-dim) | **Google Gemini (768-dim)** | AI Systems Architect | **Approved for Canonical** |
| **DEC-06** | Marketplace | Offer Lifecycle on Acceptance | Immediate Hard Decline vs Soft Reservation TTL | **Soft Reservation TTL (15 min)** | Marketplace Product Lead | **Approved for Canonical** |
| **DEC-07** | Security | Role Assignment & Escalation Defense | Client-provided role vs Strict 'student' default | **Strict 'student' default** | Security Specialist | **Approved for Canonical** |
| **DEC-08** | Scope / Strategy | India MVP vs Global Infrastructure | Full multi-currency active vs India-first config | **India-first config (IN/INR/IST)** | CEO / GTM Lead | **Approved for Canonical** |
| **DEC-09** | AI & Scoring | Career Score Weight Redistribution | Fixed 4-dim sum vs Dynamic redistribution | **Dynamic Redistribution** | Product Architect | **Approved for Canonical** |
| **DEC-10** | Programs | Structured Program Durations | Fixed 4-week only vs 2, 4, 6-week templates | **2, 4, and 6-week templates** | Head of Product | **Approved for Canonical** |
| **DEC-11** | Customer Trust | Money-Back Guarantee Alignment | Uniform 60-day vs Service Rubric vs Program Outcome | **Service Rubric / Program Outcome** | Head of Operations | **Approved for Canonical** |
| **DEC-12** | AI Economy | Credit Expiry & Rollover Policy | Unlimited rollover vs Monthly reset + Top-up roll | **Monthly Reset + Top-up Roll** | FinOps Lead | **Approved for Canonical** |

---

## 3. COMPREHENSIVE DECISION SPECIFICATIONS

### DEC-01: Membership Pricing Model
- **Context:** `prd.MD` §3.C specifies Pro at ₹149/mo (₹1,188/yr) and Elite at ₹299/mo (₹2,388/yr). However, §3.C Projections, §14.1, and §17.1 (Module 8) calculate platform revenue and feature gating using Pro at ₹399/mo (₹2,988/yr) and Elite at ₹799/mo (₹5,988/yr).
- **Options:**
  - **Option A (Low-Cost / High-Volume):** Free ₹0, Pro ₹149/mo (₹1,188/yr), Elite ₹299/mo (₹2,388/yr).
    - *Pros:* Ultra-low barrier for Indian college students; high sign-up conversion.
    - *Cons:* Destroys unit economics. Absorbing 1 service discount (~₹150) and ₹35 in AI costs results in negative gross margin per subscriber.
  - **Option B (Sustainable SaaS - RECOMMENDED):** Free ₹0, Pro ₹399/mo (₹2,988/yr, ₹249/mo eff.), Elite ₹799/mo (₹5,988/yr, ₹499/mo eff.).
    - *Pros:* Fully validates the financial projections in §3.C (₹69,550/mo net profit per 1,000 active users); covers AI token consumption and platform discount absorption.
    - *Cons:* Slightly higher friction for price-sensitive tier-3 college students.
- **Recommended Resolution:** Adopt **Option B** as the standard platform pricing. Retain ₹149 as a promotional launch credit pack or limited 30-day introductory campus rate.
- **Decision Owner:** Product Owner / CEO
- **Status:** **PENDING FORMAL APPROVAL**

---

### DEC-02: Membership Service & Program Discount Percentages
- **Context:** §3.C defines service discounts as 5% (Pro) and 10% (Elite). §14.1 and Module 8 define service discounts as 15% (Pro) and 25% (Elite). Program discounts are 5%/10% in §3.C vs 10%/20% in §14.1.
- **Options:**
  - **Option A (Conservative 5% / 10%):** Pro 5% off services & programs; Elite 10% off.
  - **Option B (Balanced 10% / 20% - RECOMMENDED):** Pro 10% off services & programs (first month); Elite 20% off services & programs (first month).
  - **Option C (Aggressive 15% / 25%):** Pro 15% off; Elite 25% off. (25% exceeds 20% platform commission, causing financial losses).
- **Recommended Resolution:** Adopt **Option B (10% / 20%)**. The platform absorbs this discount entirely from its 20% (services) or 15% (programs) commission pool. Mentors receive their full agreed payout invariance.
- **Decision Owner:** Head of Growth / Product Owner
- **Status:** **PENDING FORMAL APPROVAL**

---

### DEC-03: Tax Invariance & Mentor Earning Guarantee
- **Context:** PRD states "Mentor receives full 80% of listed price" for services. In `commission.ts`, the implementation calculates: Gross ₹1,000 -> 20% Platform Fee (₹200) -> 18% GST on platform fee (₹36) -> Net Mentor Payout = ₹764.00 (deducting GST from the mentor).
- **Options:**
  - **Option A (Contract Invariance - RECOMMENDED):** Listed price is ₹1,000. Platform fee is ₹200. Mentor payout is strictly **₹800.00 (80.0%)**. The ₹36 GST is treated as part of the platform's tax obligation and remitted from platform revenue, OR added to the student's checkout invoice as statutory tax.
  - **Option B (Net Deduction):** Listed price is ₹1,000. Mentor payout is ₹764.00. Mentors are informed that GST on platform service fees is deducted from gross settlements.
  - **Option C (Tax Exclusive Checkout):** Student pays ₹1,000 + 18% GST on platform fee (Total: ₹1,036). Mentor receives ₹800.
- **Recommended Resolution:** Adopt **Option A** for the canonical specification. To preserve mentor trust, the mentor's base payout must remain invariant at 80% of the listed price. Indian statutory TDS (1% under Section 194-O) will be deducted where applicable and credited to the mentor's PAN.
- **Decision Owner:** Finance & Legal / Product Owner
- **Status:** **PENDING FORMAL APPROVAL**

---

### DEC-04: Backend Architecture Specification Alignment
- **Context:** `Backend.md` mandates a dual-runtime "Hybrid Monolith" with FastAPI (Python) for AI orchestration and Next.js Server Actions for UI. In the actual repository, all 48 operational REST endpoints are already implemented and tested in TypeScript Next.js App Router Route Handlers (`src/app/api/v1/...`), while `src/backend/app/main.py` is a 49-line skeleton.
- **Options:**
  - **Option A (Dual Runtime):** Maintain Next.js frontend + rewrite all API routes into FastAPI Python.
    - *Impact:* Massive delay; requires rewriting 48 route handlers, maintaining two auth session verifiers, and doubling cloud deployment complexity.
  - **Option B (Unified Next.js Modular Monolith - RECOMMENDED):** Formalize Next.js 14 App Router (Node.js/TypeScript) as the single runtime for the core application, API gateway, payments, and AI orchestration. Retain Python strictly as an optional offline tool for batch ML training in V2.
- **Recommended Resolution:** Adopt **Option B**. Update `Backend.md` and `Architecture.md` to reflect the Next.js TypeScript Modular Monolith as the canonical V1 architecture.
- **Decision Owner:** CTO / Principal Architect
- **Status:** **PENDING FORMAL APPROVAL**

---

### DEC-05: AI Provider Selection & Vector Dimension Standardization
- **Context:** PRD §3.C specifies OpenAI `text-embedding-3-small` (1536 dims). Migration 0007 and runtime seed scripts configure Google `text-embedding-004` (768 dims) and Gemini 3.5 Flash.
- **Options:**
  - **Option A (Google Gemini Ecosystem - RECOMMENDED):**
    - Embeddings: Google `text-embedding-004` (768 dimensions).
    - Fast Inference: Google `gemini-3.5-flash` / `gemini-1.5-flash`.
    - Deep Analysis: Google `gemini-1.5-pro`.
    - *Rationale:* Natively matches the deployed `extensions.vector(768)` database schema, `.env.local` keys, and runtime scripts.
  - **Option B (OpenAI Ecosystem):** Alter database schema to `vector(1536)` and re-index.
- **Recommended Resolution:** Adopt **Option A (Google Gemini, 768 dimensions)** across all canonical specifications and database models.
- **Decision Owner:** AI Systems Architect
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-06: Sibling Offer Lifecycle on Acceptance
- **Context:** When a student accepts an offer, `src/app/api/v1/marketplace/offers/[id]/accept/route.ts` immediately marks sibling offers as `declined`. If checkout fails or is abandoned, sibling offers cannot be recovered.
- **Options:**
  - **Option A (Immediate Decline):** Current code. Irreversible loss of alternative offers on checkout drop-off.
  - **Option B (Soft Reservation Pattern - RECOMMENDED):**
    - On acceptance: Chosen offer transitions to `accepted_pending_payment`. Sibling offers transition to `reserved_pending_checkout` with a 15-minute TTL.
    - On payment capture webhook: Sibling offers permanently transition to `declined`.
    - On TTL expiry without payment: Sibling offers revert to `pending`, and the student request re-opens.
- **Recommended Resolution:** Adopt **Option B**. Eliminates premature offer destruction and protects marketplace liquidity.
- **Decision Owner:** Marketplace Product Lead
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-07: Public Signup Role Escalation Defense
- **Context:** `0001_initial_auth_profiles.sql` allowed `NEW.raw_user_meta_data->>'role'` to set `public.profiles.role`, and `policy_profiles_update` allowed users to update their own role column, which was then synced to `auth.users.raw_app_meta_data`.
- **Options:**
  - **Option A (Client-Side Metadata Trust):** Current vulnerable pattern.
  - **Option B (Zero-Trust Kernel Enforcement - RECOMMENDED):**
    - The trigger `handle_new_user()` unconditionally sets `role = 'student'`. Any client-supplied role is discarded.
    - `public.profiles.role` column modification is revoked from `authenticated` users via PostgreSQL column permissions or an explicit trigger check.
    - Upgrading a user to `'mentor'` or `'admin'` requires an Admin API call or service-role execution.
- **Recommended Resolution:** Adopt **Option B**. Eliminates privilege escalation at the database kernel level.
- **Decision Owner:** Security Specialist
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-08: India-First MVP Scope vs. Global Architecture
- **Context:** PRD Part 18 and architecture specifications introduce multi-country, multi-currency registries, PayPal/Stripe adapters, and cross-border tax withholding.
- **Options:**
  - **Option A (Full Multi-Region Launch):** Implement international payments and tax withholding in V1.
  - **Option B (India-First Configuration MVP - RECOMMENDED):**
    - Keep multi-market schema columns (`currency`, `target_career_market_id`), but lock system defaults to `INR`, `CM-IN`, `IN`, `Asia/Kolkata`.
    - Use Razorpay exclusively for India MVP.
    - Defer PayPal/Stripe and cross-border tax compliance to Phase 10 / V2.
- **Recommended Resolution:** Adopt **Option B**. Protects engineering focus and accelerates launch readiness.
- **Decision Owner:** CEO / GTM Lead
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-09: Career Score Dynamic Weight Redistribution
- **Context:** Career Readiness Score includes a 25% Portfolio dimension. Students in technical software engineering (SDE) roles do not typically maintain visual portfolios.
- **Options:**
  - **Option A (Fixed Penalty):** SDE students receive 0 on portfolio, capping score at 750/1000.
  - **Option B (Dynamic Weight Redistribution - RECOMMENDED):**
    - If target role configuration has `requires_portfolio = false`, the 25% weight is redistributed proportionally to Technical Readiness (+15%) and Interview Readiness (+10%).
- **Recommended Resolution:** Adopt **Option B**. Prevents unjust scoring penalties.
- **Decision Owner:** Product Architect
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-10: Structured Program Durations
- **Context:** v5 PRD restricted programs to 4 weeks. PRD Part 3.B introduces 2-week sprints and 6-week accelerators.
- **Options:**
  - **Option A (4-Week Only):** Retain rigid 4-week structure.
  - **Option B (Flexible Templates - RECOMMENDED):**
    - Launch with 2-week ("Crunch"), 4-week ("Core Flagship"), and 6-week ("Accelerator") templates.
    - Defer 8-12 week custom enterprise journeys to V2.
- **Recommended Resolution:** Adopt **Option B**.
- **Decision Owner:** Head of Product
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-11: Money-Back Guarantee Alignment
- **Context:** v5 PRD had a uniform 60-day money-back outcome guarantee. One-time services cannot sustain a 60-day placement guarantee.
- **Options:**
  - **Option A (Uniform 60-Day):** Applied to all transactions. (High refund fraud risk on one-time services).
  - **Option B (Bifurcated Guarantee - RECOMMENDED):**
    - **One-Time Services:** Deliverable Quality Guarantee. If the deliverable fails the standardized rubric, full refund within 48h dispute window.
    - **4-Week / 6-Week Programs:** 60-Day Placement Outcome Guarantee. Full refund if student attends all sessions, completes all assignments, and fails to secure interviews within 60 days.
- **Recommended Resolution:** Adopt **Option B**.
- **Decision Owner:** Head of Operations
- **Status:** **APPROVED FOR CANONICAL PRD**

---

### DEC-12: AI Credit Allocation & Expiry Rules
- **Context:** PRD §3.C introduces AI credits (Free: 5/mo, Pro: 100/mo, Elite: 300/mo) and credit top-up packs.
- **Options:**
  - **Option A (Unlimited Rollover):** Unused monthly credits accumulate indefinitely. (High deferred liability risk).
  - **Option B (Monthly Reset + Paid Rollover - RECOMMENDED):**
    - Monthly plan credits reset at the start of each billing cycle (no rollover).
    - Purchased credit top-ups never expire and roll over indefinitely (capped at 500 stored credits).
- **Recommended Resolution:** Adopt **Option B**.
- **Decision Owner:** FinOps Lead
- **Status:** **APPROVED FOR CANONICAL PRD**

---
*Decision Register maintained by Principal Product Architect.*
