# Phase 2 Implementation Plan: Marketplace & Catalog

## Executive Summary
Phase 2 establishes the core discovery, catalog, and mentor scheduling foundation of DreamX. It builds directly upon Phase 0 (DevOps, Next.js, Supabase) and Phase 1 (Gotrue auth, profiles, zero-trust RLS kernel, role-based middleware). In Phase 2, we implement the 5 primary user-facing pages, the ⌘K command menu, database migrations 0002 and 0003, backend APIs for mentors, services, and schedules, timezone projection, and caching with real-time invalidation.

---

## 1. Repository & Phase Foundation Audit

### 1.1 Phase 0 & Phase 1 Readiness Status
- **Phase 0 Status:** Monorepo architecture configured as standalone Next.js 14+ root with nested `src/backend/` for FastAPI. Git repository, Tailwind configuration, PostCSS, ESLint, TypeScript strict mode, and CI/CD pipelines verified.
- **Phase 1 Status:** Live and operational.
  - Supabase Gotrue Auth: Email OTP verification, magic links, session cookies (`@supabase/ssr`), OAuth callbacks (`/auth/callback`).
  - Profiles & RLS Kernel: `public.profiles`, `public.session_audit_logs`, trigger `on_auth_user_created`, RLS enabled on all tables.
  - Route Guards: `src/middleware.ts` & `src/lib/supabase/middleware.ts` protecting routes with SSR token refresh and role checks (redirecting wrong roles to `/403`).
  - Auth Pages: Built 1:1 from `src/` mockups (`/`, `/login`, `/signup`, `/verify`, `/onboard`, `/forgot-password`, `/reset-password`, `/403`, `/not-found`, `/error`).
  - Build Validation: `npm run build` exits with code 0 across all 12 routes.

### 1.2 Architectural Continuity
- **Environment:** Relies on `.env.local` containing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, etc.
- **No Duplicate Auth:** Phase 2 uses Phase 1's Supabase session and `profiles` table.
- **No Bypass of RLS:** All database queries respect the PostgreSQL zero-trust RLS policies.

---

## 2. Documentation Audit & Requirements Traceability

| Requirement Document | Section / Topic | Phase 2 Implication |
| :--- | :--- | :--- |
| **`Database.md`** | Part 5.1 & 5.3 | DDL for `configuration.platform_countries`, `configuration.career_markets`, `configuration.platform_languages`, `configuration.platform_currencies`, `public.service_types`, `public.mentor_services`, `public.mentor_schedules`. |
| **`Database.md`** | Part 8 | RLS Matrix: Public read on active services & verified mentors; mentors write own services/schedules; admin manages configuration. |
| **`Database.md`** | Part 9.1 | Full-Text Search (FTS) GIN index on `profiles.fts_tsvector` and compound index on `mentor_services(service_type_id, price, is_active)`. |
| **`API.md`** | Part 4 (Mentors) | `GET /api/v1/mentors`, `GET /api/v1/mentors/{slug}`, `POST /api/v1/mentors/verification-submit`, `GET/POST/PATCH/DELETE /api/v1/mentors/me/services`. |
| **`API.md`** | Part 7 (Marketplace) | `GET /api/v1/marketplace/mentors` (search & filter), `GET /api/v1/marketplace/service-types`. |
| **`API.md`** | Part 9 (Services) | `GET /api/v1/services`, `GET /api/v1/services/{slug}`. |
| **`API.md`** | Part 17 (Search) | Unified search endpoint `/api/v1/search/mentors` with FTS matching across name, headline, bio, and company. |
| **`Frontend.md`** | Part 8.15 | ⌘K Command Menu (`cmdk` pattern, modal overlay with blur backdrop, debounced search, grouped results: Mentors, Services, Navigation). |
| **`Frontend.md`** | Part 9.1 & 9.4 | Visual and functional layout for `/mentors`, `/services`, and `/dashboard/mentor/services`. |
| **`Security.md`** | Part 6 | Mentor verification security: Client cannot self-promote to `is_verified = true`. Admin/workflow-governed verification status (`pending_review`, `active`, `rejected`). |

---

## 3. Database Architecture & Migrations

### 3.1 Migration `0002_configuration_career_markets.sql`
- **Schema:** `configuration`
- **Tables Created:**
  1. `configuration.platform_countries`: ISO 3166-1 alpha-2, country name, default currency, time zone, compliance flags, tax rules.
  2. `configuration.career_markets`: `market_id` (`CM-IN`, `CM-US`), country code, primary language, default currency, AI resume & interview configs.
  3. `configuration.platform_languages`: BCP 47 language codes (`en`, `hi`, `ta`, etc.).
  4. `configuration.platform_currencies`: Currency codes (`INR`, `USD`, `EUR`) with exchange rates to INR.
- **Seed Data (Strict India-First Scope):**
  - Country: `IN` (India, active = true).
  - Career Markets: `CM-IN` (India Market, active = true), `CM-US` (US Market, active = true for ambitious targeting).
  - Currencies: `INR` (base, active = true), `USD` (exchange_rate = 83.50), `EUR` (exchange_rate = 90.00).
  - Languages: `en` (English, default), `hi` (Hindi), `ta` (Tamil).
- **RLS:** Public read on active records; admin-only write.

### 3.2 Migration `0003_mentor_catalog_schedules.sql`
- **Schema:** `public`
- **Tables Created:**
  1. `public.service_types`: Standardized 10-type catalog (Mock Interview, Resume Review, Coding DSA Prep, Career Roadmap, Salary Negotiation, System Design, LinkedIn Optimization, Portfolio Review, Offer Evaluation, Bar Raiser Simulation).
  2. `public.mentor_services`: Unique `(mentor_id, service_type_id)`, price in INR, custom description, `is_active`, soft delete `deleted_at`.
  3. `public.mentor_schedules`: Weekly recurring availability templates (`day_of_week` 0–6, `start_time_utc` TIME, `end_time_utc` TIME, `is_active`).
  4. `public.schedule_overrides`: Date-specific overrides (`override_date`, `is_unavailable`, `reason`).
  5. `public.mentor_career_markets`: Junction table connecting mentors to served markets.
- **Constraints & Triggers:**
  - **Max 5 Active Services Cap:** PostgreSQL trigger `trg_check_max_5_services` executing `fn_enforce_max_5_mentor_services` before `INSERT` or `UPDATE` where `is_active = true`. Raises `MENTOR_SERVICE_LIMIT_EXCEEDED` on 6th active service.
  - **Positive Pricing:** `CHECK (price > 0)`.
  - **Compound Indexes:** `idx_mentor_services_catalog_search` on `(service_type_id, price, is_active) WHERE is_active = TRUE AND deleted_at IS NULL`.
  - **Full-Text Search:** Generated column `fts_tsvector` on `profiles` with GIN index `idx_profiles_fts_gin`.
- **RLS Policies:**
  - `service_types`: Public read.
  - `mentor_services`: Public read for `is_active = TRUE AND deleted_at IS NULL`; mentor can INSERT, UPDATE, DELETE (soft) only their own rows (`mentor_id = auth.uid()`).
  - `mentor_schedules`: Public read for active mentors; mentor can manage only their own schedules.

---

## 4. Backend Architecture & API Specifications

Phase 2 endpoints will be implemented via dual Next.js Route Handlers (`src/app/api/...`) and FastAPI service modules (`src/backend/app/...`):

### 4.1 Endpoints Specification

#### Mentor APIs
1. `GET /api/v1/mentors`:
   - Query params: `career_market_id`, `service_type_slug`, `max_price_inr`, `min_rating`, `company`, `is_verified`, `sort_by`, `page`, `limit`.
   - Response: Paginated list of vetted mentors with starting price, rating, reviews count, and served markets.
2. `GET /api/v1/mentors/{slug}`:
   - Response: Comprehensive mentor profile (headline, bio, companies, served markets, active services, verified outcomes, review stats).
3. `POST /api/v1/mentors/verification-submit`:
   - Authenticated mentor submits LinkedIn URL, years of experience, current title, company. Status becomes `pending_review`.
4. `GET /api/v1/mentors/me/services`:
   - Authenticated mentor gets their own 5 service slots.
5. `POST /api/v1/mentors/me/services`:
   - Enforces max 5 active services. Rejects 6th with HTTP 409 Conflict.
6. `PATCH /api/v1/mentors/me/services/{id}`:
   - Updates price, custom description, or toggles `is_active`.
7. `DELETE /api/v1/mentors/me/services/{id}`:
   - Soft deletes (`deleted_at = NOW()`).

#### Service Catalog APIs
8. `GET /api/v1/services`:
   - Returns all active service types and individual mentor listings. Cached with 15-minute TTL.
9. `GET /api/v1/services/{slug}`:
   - Service type detail, deliverable rubric schema, price floor/ceiling, top-rated mentors providing this service.

#### Schedule & Timezone APIs
10. `GET /api/v1/mentors/{id}/schedules`:
    - Returns UTC schedules, converted with client's requested timezone query parameter (`?tz=America/New_York` or `?tz=Asia/Kolkata`).
11. `PUT /api/v1/mentors/me/schedules`:
    - Replaces recurring weekly availability windows. Validates `end_time_utc > start_time_utc`.

#### Search & Command Palette API
12. `GET /api/v1/search/mentors`:
    - Full-text search and debounced auto-complete returning grouped results (`mentors`, `services`, `actions`).

---

## 5. Caching & Invalidation Architecture

### 5.1 Caching Policy (15-Minute TTL)
- **Target Endpoints:** `GET /api/v1/services`, `GET /api/v1/marketplace/service-types`, public mentor catalog queries.
- **Cache Store:** Dual-tier edge caching via Next.js `unstable_cache` / ISR tags and Upstash Redis client.
- **Cache Keys:**
  - `catalog:services:all`
  - `catalog:service_types`
  - `catalog:mentors:list:{queryStringHash}`
  - `mentor:profile:{slug}`

### 5.2 Real-Time Invalidation Strategy
- Whenever a mentor performs a mutation (`POST/PATCH/DELETE /api/v1/mentors/me/services` or updates schedule):
  1. Database row is committed.
  2. Cache tag `catalog:services` and `mentor:profile:{mentor_id}` are immediately invalidated using `revalidateTag()`.
  3. Subsequent visitor requests fetch fresh database state and repopulate cache.

---

## 6. Timezone Architecture

### 6.1 Principles
1. **Database Storage:** All schedule start and end times are stored in UTC (`TIME` or `TIMESTAMPTZ`).
2. **Display Conversion:** Frontend utilizes native `Intl.DateTimeFormat` and client timezone detection (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
3. **Cross-Timezone Projection (IST vs Overseas):**
   - Mentor creates slot: Saturday 10:00 AM – 2:00 PM IST (UTC 04:30 – 08:30).
   - Student in New York (EDT, UTC-4): Displayed slot is Saturday 12:30 AM – 4:30 AM EDT.
   - Day transition edge cases (e.g. late evening slot in IST showing on earlier date in US) are properly computed based on UTC offset.

---

## 7. Frontend UI/UX Architecture & Strict 1:1 Reference Mapping

All 5 Phase 2 routes have verified, high-fidelity mockups in `src/`. No generic AI UI will be generated; every component will be built directly from the `code.html` reference markup.

### 7.1 Reference Mapping Table

| Route | Reference Source in `src/` | Built Route File | Key UI Components & Interactions |
| :--- | :--- | :--- | :--- |
| **`/mentors`** | `src/app/(marketing)/mentors/code.html` + `screen.png` | `src/app/mentors/page.tsx` | Hero Header, Quick metrics bar (412 active mentors, 4.92★ rating, 100% escrow), 8-Point Precision Discovery Filter Grid (Market, Service Type, Max Price, Rating, Company, Language, Experience, Availability), Vetted mentor cards with badges, starting prices, and pagination. |
| **`/mentors/[slug]`** | `src/app/(marketing)/mentors/[slug]/code.html` + `screen.png` | `src/app/mentors/[slug]/page.tsx` | Live win ticker ("Karthik shortlisted at Google L4"), Profile header with verified badge, Big Tech employment history, 6 Mode Nav Tabs (Overview, 1:1 Services, Group Pods, Quick Q&A, 4-Week Cohort, About), Verified student outcomes & reviews ribbon, 5 Service cards with price pills, and Sticky booking action card. |
| **`/services`** | `src/app/services/code.html` + `screen.png` | `src/app/services/page.tsx` | Top CM-IN escrow status strip, 10 Standardized Career Outcome Deliverables hero, Telemetry quality floors floating card, Filter chips, 10 Service type cards with price floors, duration tags, deliverable templates, and mentor count. |
| **`/services/[slug]`** | `src/app/services/[slug]/code.html` + `screen.png` | `src/app/services/[slug]/page.tsx` | Service S06 header, Standardized 4-page rubric breakdown, Turnaround SLA, Vetted practitioners list offering this service, Comparison pricing table, Escrow guarantee notes, and Direct selection CTA. |
| **`/dashboard/mentor/services`** | `src/app/(dashboard)/mentor/services/code.html` + `screen.png` | `src/app/dashboard/mentor/services/page.tsx` | Mentor dashboard sidebar + topbar, 80% Capacity meter (4/5 active slots used), "Add New Service" modal with 5-slot cap guard, Service cards with active toggle switches, price edit modals, booking count badges, and Reliable earnings badge (80% mentor share). |

### 7.2 Command Menu (⌘K / Ctrl+K)
- **Reference:** `src/app/(dashboard)/search/code.html` & `Frontend.md Part 8.15`.
- **Component:** `src/components/CommandMenu.tsx` (or integrated search overlay).
- **Triggers:** Keyboard shortcut `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) and clicking search inputs in the top navigation.
- **Features:** Modal overlay with backdrop blur, debounced input, grouped results (Top Mentors, Services, Quick Links), keyboard navigation (Up/Down/Enter/Escape).

---

## 8. Mentor Verification Foundation & Security Model

1. **State Machine:**
   `unverified` ➔ `pending_review` (submitted via form) ➔ `active` (verified by admin) OR `rejected`.
2. **Zero-Trust Rule:**
   Normal users and mentors CANNOT set `is_verified = true` or `verification_status = 'active'`. RLS policy prohibits client modification of `is_verified`.
3. **Domain Cross-Check:**
   Submission requires corporate/college domain verification (e.g. `@google.com`, `@iitd.ac.in`) and LinkedIn profile URL.
4. **Admin Approval Gate:**
   Only users with `(auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'` can transition a profile to `active` / `is_verified = true`.

---

## 9. Testing & Quality Assurance Plan

1. **Database & Constraint Testing:**
   - Run Migration 0002 & 0003. Verify `platform_countries`, `career_markets`, `service_types`, `mentor_services`, `mentor_schedules` exist with appropriate types.
   - Assert trigger `trg_check_max_5_services` blocks insertion of a 6th active service for a mentor.
   - Assert RLS blocks a mentor from editing another mentor's service.
2. **API Testing:**
   - Test `GET /api/v1/mentors` with query filters (`career_market_id=CM-IN`, `service_type_slug=mock-interview`).
   - Test `GET /api/v1/services` returns cached results on second call.
   - Test cache invalidation on service price update.
3. **Timezone Edge Case Testing:**
   - Verify IST mentor schedule (10:00 AM – 2:00 PM IST) correctly converts to UTC (04:30 – 08:30 UTC) in database.
   - Verify student in New York (EDT) views schedule converted to EDT correctly.
4. **Frontend & Accessibility Testing:**
   - Verify all 5 routes render cleanly with responsive layouts.
   - Test ⌘K / Ctrl+K keyboard shortcut opens command menu.
   - Verify `npm run build` succeeds with 0 lint, type, or prerendering errors.

---

## 10. Out-of-Scope (Strict Phase Boundaries)
- **No Phase 3:** Cohort programs, syllabus modules, or cohort enrollments.
- **No Phase 4:** Active booking checkouts, Google Meet link generation, or slot locking.
- **No Phase 5:** AI Smart Match algorithmic engine or LLM embeddings.
- **No Phase 6+:** Razorpay payments, escrow release timers, or bank payouts.

---

## 11. Approval Request
The implementation plan is complete and covers all requirements, database schemas, API contracts, 1:1 UI reference mappings, and security guarantees.

**STOPPED AS REQUIRED.** Awaiting your explicit approval before executing any Phase 2 implementation code.
