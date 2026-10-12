# Phase 3 Implementation Plan: Structured Programs

## 1. Executive Summary
Phase 3 builds upon the Marketplace & Catalog (Phase 2) to introduce **Structured Programs (2, 4, and 6-week mentorship cohorts)**. This phase implements the flagship offering of DreamX, enabling mentors to create long-term structured learning paths with weekly milestones, and allowing students to enroll in cohorts, track progress, and submit private deliverables.

## 2. Repository & Phase Foundation Audit
- **Phase 0 (Foundation):** DevOps, Next.js 14, Supabase architecture, zero-trust PostgreSQL setup completed.
- **Phase 1 (Identity):** Gotrue auth, role-based profiles (`student`, `mentor`), and strict RLS middleware are fully operational.
- **Phase 2 (Marketplace):** The one-time services catalog, mentor scheduling, `mentor_services`, and caching architecture are live and verified. 
- **Phase 3 Readiness:** Ready for integration. Phase 3 will reuse Phase 1 authentication and Phase 2 scheduling paradigms.

## 3. Architectural Continuity & Constraints
- **Do NOT implement:** Bookings, payments, AI Smart Match, career scoring, or administrative back-office platforms.
- **Strict Scope:** Focus **exclusively** on Programs, Cohorts, Milestones, and Enrollment workflows.
- **Single Source of Truth:** Next.js and FastAPI business logic will not be duplicated. Each domain operation will have a canonical owner.
- **Storage:** Deliverables and milestone attachments must use a private Supabase Storage bucket with server-side generated 15-minute signed URLs.

## 4. Documentation Audit & Requirements Traceability
- **PRD (§13, §35):** Support 2-week, 4-week, and 6-week durations; program template expansion.
- **Database (Part 5):** `programs`, `program_milestones`, `program_enrollments`, `program_session_checkins` implementation.
- **Security (Part 5):** Zero-trust storage policies and private file access strictly limited to the enrolled student and their assigned mentor.
- **Frontend References:** Strict 1:1 mapping from `src/app/programs`, `src/app/programs/[id]`, `src/app/(dashboard)/mentor/programs`, and `src/app/(dashboard)/student/programs`.

## 5. Database Architecture: Migrations Strategy
We will introduce Migration `0004_structured_programs.sql` to instantiate the core cohort management tables, indexes, and full-text search extensions.

## 6. Database Architecture: `programs` Table
- **Schema:** `public`
- **Purpose:** Defines the overarching mentorship program catalog (2, 4, and 6-week variations).
- **Columns:** `id`, `mentor_id`, `title`, `slug`, `duration_weeks` (2, 4, 6), `price_inr`, `description`, `is_active`, `deleted_at`.

## 7. Database Architecture: `program_milestones` Table
- **Schema:** `public`
- **Purpose:** Defines weekly roadmap objectives and required deliverables per program.
- **Columns:** `id`, `program_id`, `week_number`, `title`, `deliverable_schema` (JSONB for requirements), `estimated_hours`.

## 8. Database Architecture: `program_enrollments` Table
- **Schema:** `public`
- **Purpose:** Active student enrollments tracking cohorts.
- **Columns:** `id`, `program_id`, `student_id`, `cohort_start_date`, `status` (`pending`, `active`, `completed`, `dropped`), `created_at`.

## 9. Database Architecture: `program_session_checkins` Table
- **Schema:** `public`
- **Purpose:** Logged mentor check-in notes and milestone progress approvals.
- **Columns:** `id`, `enrollment_id`, `week_number`, `student_notes`, `mentor_feedback`, `deliverable_url`, `status` (`submitted`, `needs_revision`, `approved`).

## 10. Row-Level Security (RLS) Strategy Matrix
- **`programs`**: Public read for `is_active = true`. Mentors can INSERT/UPDATE their own.
- **`program_milestones`**: Public read. Mentors can INSERT/UPDATE associated with their programs.
- **`program_enrollments`**: Read restricted to the enrolled student and the program's mentor. 
- **`program_session_checkins`**: Restricted entirely to the enrolled student and the program's mentor. No public access.

## 11. Security Architecture: Private Storage Buckets
- A dedicated Supabase Storage bucket `program_deliverables` will be provisioned.
- The bucket will be completely **private**.
- RLS policies on the `storage.objects` table will explicitly restrict access based on the `program_enrollments` relationships.

## 12. Security Architecture: Signed URL Generation (15-min TTL)
- Students and mentors will never access direct S3 URLs.
- Next.js server actions / API endpoints will generate 15-minute temporary signed URLs via `@supabase/supabase-js` `storage.from('program_deliverables').createSignedUrl()`.
- Audit logs will record every time a deliverable is accessed.

## 13. Backend Architecture: Dual Framework Strategy
- **Next.js (Edge):** Read-heavy catalog queries, cache invalidation, and server actions for standard mutations.
- **FastAPI (Core):** Cohort state machine transitions, complex enrollment logic (mocked for now prior to payments in Phase 6), and data validation.

## 14. Backend API: Catalog Discovery (Next.js/Supabase)
- `GET /api/v1/programs`: Paginated discovery endpoint with filters (duration, price, mentor).
- `GET /api/v1/programs/{slug}`: Deep-dive details including milestone previews.

## 15. Backend API: Mentor Program Management
- `GET /api/v1/mentors/me/programs`: Retrieve all programs owned by the authenticated mentor.
- `POST /api/v1/mentors/me/programs`: Create a new structured program.
- `PUT /api/v1/mentors/me/programs/{id}/milestones`: Upsert milestones for the template.

## 16. Backend API: Cohort Enrollment Workflows
- `POST /api/v1/programs/{id}/enroll`: Creates a `program_enrollments` record (bypassing payment logic for this phase).
- `GET /api/v1/students/me/enrollments`: Dashboard data fetch for active cohorts.

## 17. Backend API: Milestone Deliverable Submission
- `POST /api/v1/enrollments/{id}/milestones/{week}/submit`: Action for students to submit text notes and file attachments.
- `PATCH /api/v1/enrollments/{id}/milestones/{week}/review`: Action for mentors to approve/reject deliverables with feedback.

## 18. Caching & Invalidation Architecture (Edge Cache)
- Catalog queries will utilize Next.js `unstable_cache` with a 15-minute TTL.
- Tags: `catalog:programs`, `mentor:programs:{id}`.
- Cache will be aggressively invalidated using `revalidateTag` when mentors edit program details.

## 19. Frontend UI Architecture: 1:1 Reference Mapping
All Phase 3 pages will strictly replicate the provided `src/` mockups.

## 20. Frontend UI: `/programs` (Discovery Catalog)
- **Reference:** `src/app/programs/code.html`
- **Features:** 2, 4, 6-week filtering, mentor matching, pricing comparisons, and search grid.

## 21. Frontend UI: `/programs/[id]` (Program Detail View)
- **Reference:** `src/app/programs/[id]/code.html`
- **Features:** Comprehensive syllabus breakdown, weekly milestones, mentor bio, pricing table, and enrollment CTA.

## 22. Frontend UI: `/dashboard/mentor/programs`
- **Reference:** `src/app/(dashboard)/mentor/programs/code.html`
- **Features:** Table of active programs, builder interface for milestones, and active cohort tracking.

## 23. Frontend UI: `/dashboard/student/programs`
- **Reference:** `src/app/(dashboard)/student/programs/code.html`
- **Features:** Active enrollments grid, quick progress bars, and upcoming session indicators.

## 24. Frontend UI: `/dashboard/student/programs/[id]` (Cohort LMS Engine)
- **Reference:** `src/app/(dashboard)/student/programs/[id]/code.html` (if applicable) or nested detail view.
- **Features:** Weekly timeline, milestone submission forms, secure file upload zones, and mentor feedback viewers.

## 25. Testing & Quality Assurance Plan
- **Database:** Ensure RLS prevents Student A from accessing Student B's enrollments.
- **Storage:** Verify that attempting to access a private object without a signed URL returns a 403.
- **Frontend:** Verify Next.js routes match mockups visually and responsively. Build process (`npm run build`) must pass with 0 errors.

## 26. Approval Request & Pre-Flight Handoff
This implementation plan strictly adheres to the provided Phase 3 constraints and the overarching DreamX architecture.

**STOPPED AS REQUIRED.**
Awaiting explicit approval before proceeding with Phase 3 code implementation.
