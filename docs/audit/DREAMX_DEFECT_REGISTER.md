# DREAMX — DEFECT REGISTER & VULNERABILITY LOG

**Document Version:** 1.0.0  
**Audit Scope:** Complete Defect Taxonomy, Severity Classification, Root Cause Analysis, and Reproduction Steps  
**Auditor:** Principal Software Auditor & Lead QA Architect  

---

## 1. Severity Taxonomy & Classification Matrix

- **P0 (Critical / Blocker):** Security exposure, unauthorized fund movement, catastrophic data loss, core production outage.
- **P1 (High):** Core authentication, authorization, booking state machine, payment gateway, or essential user journey broken.
- **P2 (Medium):** Feature inconsistency, test harness configuration friction, performance latency, or sub-optimal batch processing.
- **P3 (Low):** Minor UI defect, accessibility attribute warning, missing image alt tag, or non-breaking linter notice.

---

## 2. Defect Register

### Summary by Severity:
- **P0 Critical:** `0` (Zero critical exposures found)
- **P1 High:** `0` (Zero core user journey failures found)
- **P2 Medium:** `3` (Documented below)
- **P3 Low:** `4` (Documented below)

---

### P2 (Medium Severity) Defects

#### DEF-01: Standalone Node ESM vs TypeScript CLI Module Resolution
- **Severity:** P2
- **Affected Area:** `scripts/test_phase5_e2e.mjs` and developer test tooling
- **Symptom:** Running `node scripts/test_phase5_e2e.mjs` fails with `ERR_MODULE_NOT_FOUND: Cannot find module 'src/lib/ai/scrubber' imported from prompts.ts`.
- **Root Cause:** Node's native ESM loader requires explicit `.js` or `.ts` extensions when resolving relative module paths, whereas the TypeScript codebase uses extensionless imports.
- **Workaround / Resolution:** Running the test via `npx tsx scripts/test_phase5_e2e.ts` resolves imports smoothly.
- **Recommended Remediation:** Configure a unified test runner (e.g. Vitest) or update scripts to use `tsx` exclusively in `package.json` scripts.

#### DEF-02: Test Matrix Expects Active Local HTTP Server on Port 3000
- **Severity:** P2
- **Affected Area:** `scripts/test_phase0_3_auth_matrix.mjs`
- **Symptom:** Running the auth matrix test when the Next.js local server is stopped results in `ECONNREFUSED` on Suite 6 (`fetch('http://localhost:3000/api/v1/...')`).
- **Root Cause:** The script mixes direct database SDK calls with live HTTP fetches against `localhost:3000` without checking if the local server is listening.
- **Workaround / Resolution:** Start `npm run start` or `npm run dev` before executing the integration suite.
- **Recommended Remediation:** Add a pre-flight probe in the script that verifies `http://localhost:3000` availability or falls back to Next.js route testing.

#### DEF-03: Sequential Network Latency in Stale Score Recalculation Sweep
- **Severity:** P2
- **Affected Area:** `src/lib/career/career-score-service.ts` (`recalculateStaleScores`)
- **Symptom:** The stale score sweep worker processes student records sequentially inside a `for...of` loop. For 24 stale students, execution took ~50 seconds over WAN.
- **Root Cause:** Each student requires 3 queries (`profiles`, `service_bookings`, `career_journey_progress`) and 2 writes (`career_scores`, `profiles`).
- **Recommended Remediation:** Implement batching with `Promise.all()` in chunks of 5–10 concurrent requests to reduce sweep duration from 50s to <10s.

---

### P3 (Low Severity) Defects

#### DEF-04: ESLint React Hook Exhaustive Dependencies
- **Severity:** P3
- **Affected Files:**
  - `src/app/(dashboard)/admin/mentors/page.tsx` (Line 31: missing `loadMentors`)
  - `src/app/(dashboard)/admin/moderation/page.tsx` (Line 34: missing `loadDisputes`)
  - `src/app/(dashboard)/admin/users/page.tsx` (Line 51: missing `fetchUsers`)
  - `src/app/dashboard/mentor/analytics/page.tsx` (Line 36: missing `loadAnalytics`)
- **Symptom:** ESLint warnings emitted during `npm run lint` and `npm run build`.
- **Root Cause:** Helper functions defined inside component scope referenced in `useEffect` without being wrapped in `useCallback`.
- **Impact:** Minor code quality notice; does not cause runtime crashes.

#### DEF-05: Non-Standard Accessibility Attribute on Login Role Button
- **Severity:** P3
- **Affected File:** `src/app/(auth)/login/page.tsx` (Lines 147, 161)
- **Symptom:** Warning: `The attribute aria-selected is not supported by the role button. This role is implicit on the element button.`
- **Root Cause:** Role switcher buttons use `aria-selected` without declaring explicit `role="tab"`.
- **Impact:** Minor screen-reader accessibility inconsistency.

#### DEF-06: Raw `<img>` Tags Missing Optimization & Alt Text
- **Severity:** P3
- **Affected Files:**
  - `src/app/(marketing)/mentors/page.tsx` (Line 507)
  - `src/app/(marketing)/mentors/[slug]/page.tsx` (Lines 127, 344, 372)
  - `src/app/dashboard/student/programs/page.tsx` (Lines 193, 378, 428)
  - `src/app/dashboard/student/programs/[id]/milestones/page.tsx` (Line 434)
  - `src/app/programs/page.tsx` (Line 304), `programs/[id]/page.tsx` (Line 253)
  - `src/app/services/[slug]/page.tsx` (Line 389), `src/components/CommandMenu.tsx` (Line 154)
- **Symptom:** ESLint warnings for unoptimized `<img>` tags and missing `alt` attributes.
- **Impact:** Slower LCP (Largest Contentful Paint) and bandwidth overhead.

#### DEF-07: Custom Font Optimization Discouraged in `layout.tsx`
- **Severity:** P3
- **Affected File:** `src/app/layout.tsx` (Lines 20, 24)
- **Symptom:** `Custom fonts not added in pages/_document.js will only load for a single page.`
- **Root Cause:** Google Fonts loaded via `<link>` tag in HTML `<head>` rather than using Next.js `next/font/google`.
- **Impact:** Sub-optimal font preloading; flash of unstyled text (FOUT).
