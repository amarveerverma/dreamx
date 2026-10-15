# DREAMX — FRONTEND ROUTE & INTERACTION INVENTORY

**Document Version:** 1.0.0  
**Scope:** Complete Catalog of Frontend Routes, Components, Data Sources, Buttons, Forms, and Interactive Behaviors  
**Auditor:** Senior Full-Stack Engineer & QA Architect  

---

## 1. Route Inventory Overview

Next.js App Router exposes **45 frontend pages** across 4 distinct domains:
1. **Public & Marketing (12 pages):** Landing, services catalog, mentor directory, program catalog, privacy portal.
2. **Authentication Flow (6 pages):** Login, registration, OTP verify, password recovery, profile onboarding.
3. **Student Dashboard (10 pages):** Overview, guided career journey, career readiness score, bookings, requests, programs, notifications, AI assistant.
4. **Mentor Dashboard (7 pages):** Overview, earnings & payouts, service offerings, bookings, requests, programs, performance analytics.
5. **Administrative Console (10 pages):** Overview KPIs, users directory, mentor KYC queue, marketplace telemetry, program oversight, dispute arbitration, payment releases, audit reports, system settings.

---

## 2. Page-by-Page Detailed Inventory

### Category A: Public & Marketing Pages

#### 1. Landing Page (`/`)
- **File Path:** `src/app/page.tsx`
- **Intended Role:** Anonymous Visitor / All Roles
- **Data Sources:** Static hero content, featured mentors from `public.profiles`, services catalog from `public.service_types`.
- **Interactive Controls:**
  - `Hero Search Input`: Full-text search across mentor skills and services.
  - `"Find a Mentor" CTA Button`: Navigates to `/mentors`.
  - `"Explore Programs" CTA Button`: Navigates to `/programs`.
  - `"Get Started" Link`: Navigates to `/signup`.
- **States:** Skeleton loading cards while fetching featured mentors; empty state gracefully displays default curated categories.

#### 2. Services Catalog (`/services`)
- **File Path:** `src/app/services/page.tsx`
- **Intended Role:** Anonymous Visitor / Student
- **Data Sources:** `GET /api/v1/services`
- **Interactive Controls:**
  - `Category Filter Tabs`: Filters by 1:1 sessions, mock interviews, system design, resume review.
  - `Service Card Click`: Routes to `/services/[slug]`.
  - `"Book Service" Button`: Routes to `/services/[slug]/book`.
- **States:** Dynamic error toast on network failure with retry button.

#### 3. Service Detail (`/services/[slug]`)
- **File Path:** `src/app/services/[slug]/page.tsx`
- **Intended Role:** Anonymous Visitor / Student
- **Data Sources:** `GET /api/v1/services/[slug]`
- **Interactive Controls:**
  - `"Book with a Mentor" Button`: Opens mentor selector / routes to `/services/[slug]/book`.
  - `"AI Smart Match" Button`: Routes to `/services/[slug]/match`.
  - `FAQ Accordion`: Expands/collapses deliverable descriptions.

#### 4. Service Direct Booking (`/services/[slug]/book`)
- **File Path:** `src/app/services/[slug]/book/page.tsx`
- **Intended Role:** Authenticated Student (Redirects unauthenticated to `/login?redirect=...`)
- **Data Sources:** `GET /api/v1/bookings/availability?mentor_id=...`
- **Interactive Controls:**
  - `Date Picker Calendar`: Renders available dates.
  - `Time Slot Radio Group`: Selects 30/60 minute slot. Disables conflicting/past slots.
  - `Requirement Textarea`: Input student preparation notes.
  - `"Proceed to Checkout" Button`: Submits `POST /api/v1/bookings`, activates 15-minute slot lock, triggers Razorpay modal.
- **Validation:** Slot selection mandatory; notes capped at 1,000 characters.

#### 5. Mentor Directory (`/mentors`)
- **File Path:** `src/app/(marketing)/mentors/page.tsx`
- **Intended Role:** Public
- **Data Sources:** `GET /api/v1/search/mentors`
- **Interactive Controls:**
  - `Search Bar`: Filter by mentor name, company (e.g. Google, Microsoft), or skill.
  - `Experience Slider`: Filter by years of experience (1–15+ years).
  - `Mentor Profile Card`: Navigates to `/mentors/[slug]`.

#### 6. Mentor Profile (`/mentors/[slug]`)
- **File Path:** `src/app/(marketing)/mentors/[slug]/page.tsx`
- **Intended Role:** Public
- **Data Sources:** `GET /api/v1/mentors/[slug]`, `GET /api/v1/mentors/[slug]/reviews`
- **Interactive Controls:**
  - `Services Offering List`: Displays mentor's configured pricing and active services.
  - `Review Rating Breakdown`: Renders 5-star histogram, actionability, and punctuality ratings.
  - `"Book Session" CTA`: Initiates booking modal.

#### 7. Programs Catalog (`/programs`)
- **File Path:** `src/app/programs/page.tsx`
- **Intended Role:** Public
- **Data Sources:** `GET /api/v1/programs`
- **Interactive Controls:**
  - `Track Filters`: Career transition, FAANG accelerator, Engineering leadership.
  - `Program Card`: Navigates to `/programs/[id]`.

#### 8. Program Detail & Curriculum (`/programs/[id]`)
- **File Path:** `src/app/programs/[id]/page.tsx`
- **Intended Role:** Public
- **Data Sources:** `GET /api/v1/programs/[id]`
- **Interactive Controls:**
  - `Milestone Timeline View`: Expandable weekly curriculum milestones and deliverables.
  - `"Enroll in Program" Button`: Invokes `POST /api/v1/programs/[id]/enroll`. Requires student login.

#### 9. Privacy Portal (`/privacy`)
- **File Path:** `src/app/privacy/page.tsx`
- **Intended Role:** All Users / India DPDP Act 2023 Portal
- **Data Sources:** `GET /api/v1/privacy/status`
- **Interactive Controls:**
  - `"Export My Personal Data (ZIP)" Button`: Triggers `POST /api/v1/privacy/export`. Shows 24h rate-limiting countdown if export already requested.
  - `"Request Account Deletion" Button`: Triggers modal requiring password re-authentication. Displays 30-day grace period notice before soft-delete confirmation.

---

### Category B: Authentication Flow Pages

#### 10. Login (`/login`)
- **File Path:** `src/app/(auth)/login/page.tsx`
- **Intended Role:** Anonymous
- **Data Sources:** Supabase GoTrue Auth
- **Interactive Controls:**
  - `Role Toggle Tabs`: Student vs Mentor login mode.
  - `Email & Password Inputs`: Validated with standard formats.
  - `"Remember Me" Checkbox`.
  - `"Sign In" Button`: Submits credentials, sets session cookie, redirects based on `user_role`.
  - `"Sign in with Google" Button`: Initiates OAuth PKCE flow.
  - `"Forgot Password?" Link`: Routes to `/forgot-password`.

#### 11. Signup (`/signup`)
- **File Path:** `src/app/(auth)/signup/page.tsx`
- **Intended Role:** Anonymous
- **Interactive Controls:**
  - `Role Selector Cards`: Student / Job Seeker vs Professional Mentor.
  - `Full Name, Email, Password Inputs`.
  - `Terms & DPDP Consent Checkbox`: Required for submission.
  - `"Create Account" Button`: Creates GoTrue user, auto-provisions `public.profiles` row via trigger.

#### 12. Verification & Reset Pages
- `/verify` (`src/app/(auth)/verify/page.tsx`): OTP verification interface for email confirmation.
- `/forgot-password` (`src/app/(auth)/forgot-password/page.tsx`): Sends recovery link via Resend.
- `/reset-password` (`src/app/(auth)/reset-password/page.tsx`): Secure password update after recovery link authentication.

---

### Category C: Student Dashboard Pages

#### 13. Student Dashboard Overview (`/dashboard/student`)
- **File Path:** `src/app/dashboard/student/page.tsx`
- **Intended Role:** Student
- **Data Sources:** `GET /api/v1/students/me/score`, `GET /api/v1/students/me/bookings`, `GET /api/v1/students/me/journey`
- **Interactive Controls:**
  - `Career Mobility Score Gauge`: 0–1000 visual gauge.
  - `Next Upcoming Session Card`: Displays Google Meet link, countdown timer, and reschedule button.
  - `Quick Actions Bar`: "Book 1-on-1", "AI Resume Review", "View Notifications".

#### 14. Career Mobility Score (`/dashboard/student/score`)
- **File Path:** `src/app/dashboard/student/score/page.tsx`
- **Intended Role:** Student
- **Data Sources:** `GET /api/v1/students/me/score`
- **Interactive Controls:**
  - `8-Dimension Breakdown Radar/Bar Chart`: Resume (0.20), Technical (0.20), Interview (0.15), Communication (0.15), Planning (0.10), LinkedIn (0.10), Portfolio (0.05), Confidence (0.05).
  - `Historical Progress Chart`: Trends overall score over time using `career_score_history`.
  - `AI Recommendations Feed`: Targeted suggestions to improve lowest dimension. Includes `"Dismiss (14 Days)"` button.

#### 15. 10-Stage Guided Journey (`/dashboard/student/journey`)
- **File Path:** `src/app/dashboard/student/journey/page.tsx`
- **Intended Role:** Student
- **Data Sources:** `GET /api/v1/students/me/journey`
- **Interactive Controls:**
  - `10-Stage DAG Stepper`: Displays lock status. Stage 6 locked until Stages 2, 3, and 5 completed.
  - `Stage 7 Application Tracker Form`: Numeric input tracking submitted job applications. Increments towards the 10-application threshold.
  - `"Mark Stage Complete" Button`: Validates prerequisites and updates `career_journey_progress`.

#### 16. Student Bookings (`/dashboard/student/bookings`)
- **File Path:** `src/app/dashboard/student/bookings/page.tsx`
- **Intended Role:** Student
- **Data Sources:** `GET /api/v1/students/me/bookings`
- **Interactive Controls:**
  - `Tabs`: Upcoming vs Past vs Cancelled.
  - `"Join Google Meet" Button`: Active 15 minutes before scheduled session.
  - `"Open Chat" Dialog`: Realtime messaging channel with mentor.
  - `"Leave Review" Modal`: Triggered on completed sessions. 1–5 star rating, punctuality, and actionability sliders.

#### 17. Notification Center (`/dashboard/student/notifications`)
- **File Path:** `src/app/dashboard/student/notifications/page.tsx`
- **Intended Role:** Student
- **Data Sources:** `GET /api/v1/notifications`
- **Interactive Controls:**
  - `"Mark All as Read" Button`: Calls `POST /api/v1/notifications/read-all`.
  - `Notification Row Click`: Marks item read and routes to context (booking, message, or dispute).

---

### Category D: Mentor Dashboard Pages

#### 18. Mentor Dashboard Overview (`/dashboard/mentor`)
- **File Path:** `src/app/dashboard/mentor/page.tsx`
- **Intended Role:** Mentor
- **Data Sources:** `GET /api/v1/mentors/me/analytics`, `GET /api/v1/mentors/me/bookings`
- **Interactive Controls:**
  - `Earnings Summary Card`: Current gross, platform fee deduction, and net 76.4% available balance.
  - `Pending Session Requests Table`: Accept / Decline pending booking requests.

#### 19. Mentor Earnings & Payouts (`/dashboard/mentor/earnings`)
- **File Path:** `src/app/dashboard/mentor/earnings/page.tsx`
- **Intended Role:** Mentor
- **Data Sources:** `GET /api/v1/payments/earnings`
- **Interactive Controls:**
  - `Payout Schedule Table`: Displays each session's hold status (`on_hold`, `released`, `frozen`), hold expiration date, and gateway transfer ID.
  - `Export Statement Button`: Downloads CSV report of earnings and TDS/GST withholdings.

#### 20. Mentor Services Management (`/dashboard/mentor/services`)
- **File Path:** `src/app/dashboard/mentor/services/page.tsx`
- **Intended Role:** Mentor
- **Data Sources:** `GET /api/v1/mentors/me/services`
- **Interactive Controls:**
  - `Service Activation Toggles`: Enable/disable 10 canonical service types.
  - `Price Input Fields`: Set custom pricing (validated >= ₹500).
  - `Duration Dropdown`: 30 mins, 45 mins, 60 mins.

---

### Category E: Administrative Console Pages (AdminShell)

All 10 admin sub-routes inherit the unified navigation shell (`src/components/admin/AdminShell.tsx`), which provides role verification, active path highlighting, and session controls.

#### 21. Executive Overview (`/admin`)
- **File Path:** `src/app/(dashboard)/admin/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/overview`, `GET /api/v1/admin/analytics/kpis`
- **Controls:** Platform KPI summary cards (Total Users: 32, Mentors: 4, Students: 27), gross transaction volume, active disputes counter.

#### 22. User Management (`/admin/users`)
- **File Path:** `src/app/(dashboard)/admin/users/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/users`
- **Controls:** User search, role filter, strike counter management, suspend/activate account actions.

#### 23. Mentor KYC Verification (`/admin/mentors`)
- **File Path:** `src/app/(dashboard)/admin/mentors/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/mentors`
- **Controls:** KYC review queue, LinkedIn profile verification link, "Approve (Activate)" and "Reject" buttons.

#### 24. Moderation & Dispute Arbitration (`/admin/moderation`)
- **File Path:** `src/app/(dashboard)/admin/moderation/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/disputes`
- **Controls:** Dispute table, telemetry timeline viewer, "Resolve (Refund Student)", "Dismiss Dispute", and "Freeze Payout" buttons.

#### 25. Payment & Payout Oversight (`/admin/payments`)
- **File Path:** `src/app/(dashboard)/admin/payments/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/payouts`
- **Controls:** Payout schedule table, "Force Release" button, "Emergency Freeze" button, Razorpay gateway status indicator.

#### 26. Immutable Audit Trail Reports (`/admin/reports`)
- **File Path:** `src/app/(dashboard)/admin/reports/page.tsx`
- **Intended Role:** Admin
- **Data Sources:** `GET /api/v1/admin/audit`
- **Controls:** WORM append-only audit log viewer (`audit.system_audit_logs`), filter by action type, export audit snapshot.

#### 27. Settings, Marketplace, Programs, and Analytics
- `/admin/marketplace` (`src/app/(dashboard)/admin/marketplace/page.tsx`): Smart Match and offer negotiation metrics.
- `/admin/programs` (`src/app/(dashboard)/admin/programs/page.tsx`): Program enrollment and curriculum health.
- `/admin/analytics` (`src/app/(dashboard)/admin/analytics/page.tsx`): Cohort retention and GMV charts.
- `/admin/settings` (`src/app/(dashboard)/admin/settings/page.tsx`): Configuration toggles for India MVP lockdown.

---

## 3. Discrepancy & Dead Link Audit

1. **Dead Links / Placeholders:**
   - 0 broken navigation links in `AdminShell.tsx` (all 10 sub-routes map to real pages).
   - Marketing footer links to social channels use external placeholders (documented in Defect Register as P3).
2. **Disconnected UI Elements:**
   - None found in core booking or payment workflows; all buttons bind directly to Supabase or Next.js route handlers.
3. **Empty States:**
   - Empty state components implemented for: Mentor Reviews, Notification Feed, Student Bookings, Dispute Queue.
