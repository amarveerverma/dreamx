# DREAMX — REMEDIATION ROADMAP & POST-AUDIT ACTION PLAN

**Document Version:** 1.0.0  
**Status:** PROPOSED & PENDING USER APPROVAL  
**Auditor:** Principal Software Auditor & Lead Architect  
**Governing Safety Rule:** Under non-negotiable audit rules, zero remediations, schema modifications, or source code edits may commence until this roadmap has been reviewed and explicitly approved by the platform owner.  

---

## 1. Remediation Sequencing & Dependency Matrix

The remediation roadmap is ordered strictly by severity, risk, and architectural dependency:

```
[ Sprint 1: Test Tooling & CLI Standardization ] ──► [ Sprint 2: Async Sweep Batching Optimization ] ──► [ Sprint 3: Code Hygiene & Accessibility ]
  • Unify tsx test runner scripts                        • Batch CareerScoreService sweep loop                  • Wrap useEffect callbacks in useCallback
  • Add port 3000 health probe in test scripts           • Add latency metrics logging                         • Replace raw <img> with Next.js <Image />
  • Update package.json test scripts                                                                           • Correct aria-selected on login buttons
```

---

## 2. Sprint-by-Sprint Proposed Remediation Actions

### Sprint 1: Test Harness & Execution Standardization (P2 Defect Resolution)
*Objective: Eliminate test execution friction and ensure repeatable, one-command verification in CI/CD.*

1. **Standardize Test Runner in `package.json` (DEF-01):**
   - **Target:** `package.json`
   - **Proposed Action:** Add native test scripts loading `--env-file=.env.local` via `tsx`:
     ```json
     "scripts": {
       "test:auth": "tsx --env-file=.env.local scripts/test_phase0_3_auth_matrix.mjs",
       "test:ai": "tsx --env-file=.env.local scripts/test_phase5_e2e.ts",
       "test:payments": "tsx --env-file=.env.local scripts/test_phase6_payments_e2e.ts",
       "test:notifications": "tsx --env-file=.env.local scripts/test_phase7_notifications_e2e.ts",
       "test:career": "tsx --env-file=.env.local scripts/test_phase8_career_analytics_e2e.ts",
       "test:admin": "node scripts/test_phase9_admin_e2e.mjs",
       "test:privacy": "node scripts/test_phase10_privacy_e2e.mjs",
       "test:all": "npm run test:auth && npm run test:ai && npm run test:payments && npm run test:notifications && npm run test:career && npm run test:admin && npm run test:privacy"
     }
     ```
   - **Risk:** Low. No impact on production runtime.

2. **Add Server Liveness Probe to Integration Test (DEF-02):**
   - **Target:** `scripts/test_phase0_3_auth_matrix.mjs`
   - **Proposed Action:** Before executing Suite 6 (`fetch('http://localhost:3000/...')`), probe port 3000. If unavailable, output a clear notice or automatically mock the edge route response.
   - **Risk:** Low.

---

### Sprint 2: Performance & Scalability Enhancements (P2 Defect Resolution)
*Objective: Optimize stale score sweep execution and reduce database network round-trip overhead.*

1. **Batch Stale Score Recalculation Loop (DEF-03):**
   - **Target:** `src/lib/career/career-score-service.ts` (`recalculateStaleScores`)
   - **Proposed Action:** Refactor sequential `for...of` loop into concurrent chunks using `Promise.allSettled()` (chunk size: 5):
     ```typescript
     const CHUNK_SIZE = 5;
     for (let i = 0; i < staleScores.length; i += CHUNK_SIZE) {
       const chunk = staleScores.slice(i, i + CHUNK_SIZE);
       await Promise.allSettled(chunk.map((row) => this.recalculateScore(row.student_id, 'cron_sweep')));
     }
     ```
   - **Expected Impact:** Decreases 24-student sweep execution from ~50 seconds to under 12 seconds.
   - **Risk:** Low. Isolated to background cron sweep.

---

### Sprint 3: Code Hygiene, Accessibility & Image Optimization (P3 Defect Resolution)
*Objective: Resolve all 14 ESLint warnings and optimize browser rendering performance.*

1. **Fix React Hook Exhaustive Dependencies (DEF-04):**
   - **Target Files:**
     - `src/app/(dashboard)/admin/mentors/page.tsx`
     - `src/app/(dashboard)/admin/moderation/page.tsx`
     - `src/app/(dashboard)/admin/users/page.tsx`
     - `src/app/dashboard/mentor/analytics/page.tsx`
   - **Proposed Action:** Wrap `loadMentors`, `loadDisputes`, `fetchUsers`, and `loadAnalytics` in `useCallback` with their appropriate dependencies.

2. **Correct Accessibility Attributes on Login Page (DEF-05):**
   - **Target:** `src/app/(auth)/login/page.tsx`
   - **Proposed Action:** Add explicit `role="tab"` and wrap the switcher in `role="tablist"` so that `aria-selected` is compliant with WCAG accessibility guidelines.

3. **Migrate Raw `<img>` Tags to Next.js `<Image />` (DEF-06):**
   - **Target Files:** `mentors/page.tsx`, `student/programs/page.tsx`, `programs/[id]/page.tsx`, `services/[slug]/page.tsx`, `CommandMenu.tsx`
   - **Proposed Action:** Replace raw `<img>` tags with Next.js optimized `<Image src={...} alt="..." width={...} height={...} />` to enable automatic WebP conversion and responsive sizing.

4. **Migrate Custom Fonts to `next/font/google` (DEF-07):**
   - **Target:** `src/app/layout.tsx`
   - **Proposed Action:** Replace HTML `<link>` tags with Next.js built-in font loader:
     ```typescript
     import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
     ```
   - **Expected Impact:** Zero FOUT (Flash of Unstyled Text) and improved Core Web Vitals score.

---

## 3. Explicit User Approval Request

In adherence to non-negotiable audit safety protocol:
- **No changes have been made to application code, migrations, or database configurations.**
- **The audit is 100% complete and verified against physical code and empirical test runs.**
- **Please review the 9 audit deliverables in `docs/audit/` and provide explicit authorization to proceed with Sprint 1, 2, or 3 remediation.**
