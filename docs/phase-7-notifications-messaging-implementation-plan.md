# DreamX Phase 7 — Notifications & Messaging: Preflight Audit & Implementation Plan

**Document Version:** 1.0.0  
**Status:** PENDING ARCHITECTURE APPROVAL  
**Authoring Lead:** Senior Full-Stack Architect, Supabase Specialist & QA Lead  
**Target Milestone:** Phase 7 (Notifications, Transactional Email, WhatsApp Reminders, Real-time Chat & In-App Notification Feed)  

---

## 1. Executive Summary & Readiness Verdict

### Overall Readiness Verdict: **READY FOR APPROVAL** 🎯

Phase 7 builds the mission-critical engagement and communication backbone of DreamX:
1. **Transactional Email Engine (Resend):** Booking confirmation (with Google Meet URL), 24h pre-session reminder, and post-session review requests.
2. **Scheduled WhatsApp Reminders (Meta Graph API v19):** 24-hour pre-session reminders with user opt-in, timezone awareness, and automated cancellation on reschedule.
3. **Secure Real-Time Chat (Supabase Realtime):** Sub-second messaging restricted strictly to confirmed booking participants via database-kernel Row-Level Security (RLS).
4. **Post-Session Reviews System:** 1–5 star ratings and rubric feedback linked to completed bookings with duplicate prevention.
5. **In-App Notification Feed UI:** Real-time alert feed at `/dashboard/student/notifications` with unread counts, categorical filters, and mark-as-read persistence.

All core upstream prerequisites across **Phases 0 through 6 are fully verified and operational**. Zero regressions exist in the codebase.

---

## 2. Verified Current State & Prerequisite Readiness Audit

| Prerequisite Domain | Verified Status | Evidence & Test Output |
|---|:---:|---|
| **Auth & Identity (Phase 0–1)** | **VERIFIED** ✅ | 25/25 assertions passed in `test_phase0_3_auth_matrix.mjs`. Cookie scoping bug resolved; Bearer token header support active; privilege escalation blocked at database trigger; Evaluator Quick Fill operational. |
| **Catalog & Services (Phase 2)** | **VERIFIED** ✅ | 10 active standardized services loaded from database; mentor service pricing and soft-delete verified; RLS cross-tenant isolation verified. |
| **Structured Programs (Phase 3)** | **VERIFIED** ✅ | Program catalog endpoints operational; unauthenticated enrollments rejected with HTTP 401; cohort and milestone relationships operational. |
| **Marketplace State Machine (Phase 4)** | **VERIFIED** ✅ | 8-stage negotiation & booking state machine operational (`service_requests`, `service_offers`, `service_bookings`). 15-minute checkout TTL and double-booking slot locks verified. |
| **AI Matching Engine (Phase 5)** | **VERIFIED** ✅ | Gemini 3.5 Flash active; 768-dim embeddings verified in `ai.document_embeddings`; PII masking (email, phone, Aadhaar) and prompt injection escaping active. |
| **Payments & Payouts (Phase 6)** | **VERIFIED** ✅ | 31/31 assertions passed in `test_phase6_payments_e2e.ts`. Razorpay HMAC-SHA256 signature verification active; 18% GST commission calculations verified; Direct Gateway Hold schedules active. |

---

## 3. Phase 7 Scope & Explicit Exclusions

### In-Scope (Phase 7 Deliverables):
1. **Database Migration (`0009_reviews_and_notifications.sql`):**
   - Tables: `reviews`, `messages`, `notifications`, `notification_schedules`, `notification_delivery_logs`.
   - Foreign keys to `service_bookings`, `profiles`, with ON DELETE CASCADE / RESTRICT.
   - Strict RLS policies enforcing booking participant isolation.
2. **Notification Delivery & Scheduling Engine:**
   - Transactional email dispatch via Resend API.
   - React Email templates for Booking Confirmation, Session Reminder, and Review Request.
   - Durable scheduling table `notification_schedules` for delayed triggers (24h pre-session, 2h post-session).
   - Automated sweep worker `NotificationService.sweepScheduledNotifications()` processing due reminders with idempotency.
   - WhatsApp Meta Graph API v19 adapter with strict `whatsapp_opt_in` verification and local simulation fallback.
3. **Real-Time Participant Chat:**
   - Supabase Realtime publication on `public.messages`.
   - API endpoint `POST /api/v1/bookings/[id]/messages` and `GET /api/v1/bookings/[id]/messages`.
   - Zero-Trust RLS: Only confirmed student or assigned mentor can read/write messages.
   - Embedded Chat UI component inside booking details.
4. **Student In-App Notification Center:**
   - `/dashboard/student/notifications` implemented in Next.js App Router matching approved design prototype.
   - Dynamic real-time updates via Supabase WebSockets.
   - Category filtering (All, Bookings, Offers, Deliverables, Billing), search, and mark-as-read batch actions.

### Out-of-Scope (Explicitly Deferred):
- **Phase 8:** Career Score dynamic algorithm updates from review ratings (Deferred to Phase 8).
- **Phase 9:** Admin moderation dashboard for review disputes (Deferred to Phase 9).
- **In-App Video Calling Engine:** Direct WebRTC / Agora integration (DreamX uses authenticated Google Meet URLs generated in Phase 6).
- **Automated Voice Calls / IVR:** Out of scope for MVP.

---

## 4. Upstream Dependency Graph

```
Phase 0: Base Config & DB ────────► Phase 1: Supabase Auth & RLS
                                            │
Phase 2: Services Catalog ◄─────────────────┤
Phase 3: Programs Catalog ◄─────────────────┘
                                            │
                                            ▼
Phase 4: Marketplace State Machine (Bookings: confirmed, completed, cancelled)
                                            │
Phase 5: Gemini AI Engine                   │
                                            ▼
Phase 6: Razorpay Payments & Payout Holds (payment.captured server event)
                                            │
                                            ▼
Phase 7: Notifications & Messaging (Depends on P1 Auth, P4 Bookings, P6 Verified Payments)
```

---

## 5. Architecture Decision Register (ADR): Job Scheduling & Queue Selection

### Context:
The older roadmap mentioned Upstash Redis and ARQ (Python async worker queue). In `.env.local`, the platform configuration explicitly declared:
`FLAG_REDIS_CACHE_ENABLED=false # Using pg_cron instead of Upstash+ARQ for v1`
`FLAG_WHATSAPP_NOTIFICATIONS=false # WhatsApp deferred for v1`

### Options Evaluated:

| Criteria | Option 1: Upstash Redis + Python ARQ | Option 2: PostgreSQL-Native Transactional Queue (Recommended) |
|---|---|---|
| **Infrastructure Overhead** | High (Requires external Redis instance + standalone Python worker daemon running alongside Next.js) | Zero (Runs inside existing Supabase PostgreSQL kernel and Next.js server runtime) |
| **ACID Guarantees** | Dual-system risk (If DB transaction commits but Redis write fails, or vice versa, notifications desync) | **100% ACID Compliant** (Notification schedule row is inserted in the exact same transaction as booking creation) |
| **Booking Cancellation Handling** | Complex (Requires querying Redis queue by job ID to cancel delayed task) | **Instant SQL Update** (`UPDATE notification_schedules SET status = 'cancelled' WHERE booking_id = ...`) |
| **Consistency with Phase 6** | Inconsistent (Phase 6 uses TypeScript `PayoutService.sweepEligiblePayouts()`) | **100% Consistent** (Reuses established pattern from `PayoutService.sweepEligiblePayouts()`) |
| **Dead-Letter & Audit Trail** | Requires Redis DLQ monitoring | Native SQL table (`notification_delivery_logs`) queryable via Supabase dashboard |

### Architecture Recommendation:
**Adopt Option 2 (PostgreSQL-Native Transactional Queue + Sweep Worker).**  
- Immediate notifications (e.g. Booking Confirmed email on payment verification) fire asynchronously during the API route handler.
- Delayed notifications (24h pre-session reminder, 2h post-session review request) are inserted into `public.notification_schedules`.
- A sweep worker `NotificationService.sweepScheduledNotifications()` processes due rows where `scheduled_for <= NOW()` and `status = 'pending'`, callable via:
  1. Cron endpoint `POST /api/v1/cron/notifications-sweep` secured by `CRON_SECRET`.
  2. Scheduled Supabase `pg_cron` or Vercel Cron.

---

## 6. Database Migration Plan (`0009_reviews_and_notifications.sql`)

> **Critical Index Check:** Migration `0008_payments_and_payouts.sql` is already applied in production. Phase 7 MUST be sequentially numbered **`0009_reviews_and_notifications.sql`**.

### Schema DDL Specification:

```sql
-- ============================================================================
-- MIGRATION 0009: REVIEWS, NOTIFICATIONS, MESSAGES & REALTIME ENGINE
-- ============================================================================

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.service_bookings(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  actionability_rating INTEGER CHECK (actionability_rating >= 1 AND actionability_rating <= 5),
  feedback_text TEXT NOT NULL CHECK (char_length(feedback_text) >= 10 AND char_length(feedback_text) <= 2000),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_reviews_mentor_id ON public.reviews(mentor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);

-- 2. MESSAGES TABLE (Real-Time Booking Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_booking_created ON public.messages(booking_id, created_at ASC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- 3. NOTIFICATIONS TABLE (In-App Alert Center)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bookings', 'offers', 'deliverables', 'milestones', 'billing', 'system')),
  action_url VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- 4. NOTIFICATION SCHEDULES (Delayed Transactional Queue)
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app')),
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('session_reminder', 'review_request', 'booking_confirmed')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  idempotency_key VARCHAR(120) NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_schedules_sweep ON public.notification_schedules(scheduled_for, status)
  WHERE status = 'pending';

-- 5. NOTIFICATION DELIVERY LOGS (Audit & Idempotency Proof)
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.notification_schedules(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.service_bookings(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  provider VARCHAR(30) NOT NULL, -- 'resend', 'meta_whatsapp', 'in_app'
  provider_message_id VARCHAR(150),
  status VARCHAR(20) NOT NULL CHECK (status IN ('delivered', 'simulated_success', 'failed', 'opted_out')),
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Reviews: Anyone can view active public reviews; only student who booked and completed session can insert review
CREATE POLICY "policy_reviews_select" ON public.reviews
  FOR SELECT TO authenticated, anon
  USING (deleted_at IS NULL);

CREATE POLICY "policy_reviews_insert_student" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.service_bookings sb
      WHERE sb.id = reviews.booking_id
        AND sb.student_id = auth.uid()
        AND sb.status = 'completed'
    )
  );

-- Messages: Only confirmed booking participants can read and write chat messages
CREATE POLICY "policy_messages_select_participants" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_bookings sb
      WHERE sb.id = messages.booking_id
        AND (sb.student_id = auth.uid() OR sb.mentor_id = auth.uid())
    )
  );

CREATE POLICY "policy_messages_insert_participants" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.service_bookings sb
      WHERE sb.id = messages.booking_id
        AND (sb.student_id = auth.uid() OR sb.mentor_id = auth.uid())
        AND sb.status IN ('confirmed', 'in_progress', 'deliverable_submitted', 'completed')
    )
  );

-- Notifications: Users can only read and update their own in-app notifications
CREATE POLICY "policy_notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "policy_notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. ENABLE SUPABASE REALTIME ON MESSAGES AND NOTIFICATIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## 7. API & Event-Contract Plan

| Route | Method | Auth Guard | Request Body / Params | Expected Response | Description |
|---|:---:|:---:|---|---|---|
| `/api/v1/notifications` | `GET` | Authenticated | Query: `?unread_only=bool&category=str&limit=int` | `{ notifications: [], unread_count: int }` | Fetches student/mentor in-app notifications |
| `/api/v1/notifications/[id]/read` | `PATCH` | Authenticated | Empty | `{ success: true, notification: {} }` | Marks single notification as read |
| `/api/v1/notifications/read-all` | `POST` | Authenticated | `{ category?: string }` | `{ success: true, marked_count: int }` | Marks all active notifications as read |
| `/api/v1/bookings/[id]/messages` | `GET` | Authenticated | Path: `id` (booking UUID), Query: `?cursor=&limit=50` | `{ messages: [], has_more: bool }` | Loads chat message history for booking |
| `/api/v1/bookings/[id]/messages` | `POST` | Authenticated | `{ content: string }` | `{ message: {} }` | Sends validated chat message to participant |
| `/api/v1/bookings/[id]/reviews` | `POST` | Authenticated | `{ rating: 1-5, feedback_text: string, punctuality_rating?: 1-5, actionability_rating?: 1-5 }` | `{ review: {} }` | Submits post-session review for completed booking |
| `/api/v1/mentors/[id]/reviews` | `GET` | Public / Auth | Path: `id` (mentor profile UUID), Query: `?limit=20` | `{ reviews: [], rolling_rating: float, total_reviews: int }` | Public reviews list on mentor profile |
| `/api/v1/cron/notifications-sweep` | `POST` | System / Secret | Headers: `Authorization: Bearer <CRON_SECRET>` | `{ processed: int, sent: int, failed: int }` | Triggers background reminder & review request sweep |

---

## 8. Transactional Email System (Resend + React Email)

### Provider: Resend (`re_2nPWhJEN_DUE2jFBiYXyswioMN1WnLpS6`)
Sender: `DreamX Notifications <notifications@dreamx.com>` (or onboarding verified domain)

### Templates & Event Triggers:
1. **`BookingConfirmedEmail`:**
   - **Trigger:** Server-side payment verification (`/api/v1/payments/verify`) or verified Razorpay webhook (`payment.captured`).
   - **Recipients:** Both Student and Mentor.
   - **Dynamic Variables:** `studentName`, `mentorName`, `serviceTitle`, `scheduledDateIST`, `scheduledTimeIST`, `meetingUrl`, `grossAmountINR`.
   - **Idempotency Key:** `email_booking_confirmed_${bookingId}`.
2. **`SessionReminderEmail`:**
   - **Trigger:** 24 hours prior to `scheduled_start_utc` (via sweep worker).
   - **Recipients:** Both Student and Mentor.
   - **Dynamic Variables:** `recipientName`, `counterpartName`, `serviceTitle`, `hoursRemaining: 24`, `meetingUrl`, `prepChecklist`.
   - **Idempotency Key:** `email_session_reminder_24h_${bookingId}`.
3. **`ReviewRequestEmail`:**
   - **Trigger:** 2 hours after `scheduled_end_utc` when booking status is `completed`.
   - **Recipients:** Student only.
   - **Dynamic Variables:** `studentName`, `mentorName`, `serviceTitle`, `reviewUrl: "https://dreamx.com/dashboard/student/bookings?review=${bookingId}"`.
   - **Idempotency Key:** `email_review_request_${bookingId}`.

---

## 9. WhatsApp Reminder Plan (Meta Graph API v19)

### Strategy & Regulatory Compliance (India DPDP Act):
- **User Opt-In Requirement:** WhatsApp messages are strictly gated by `profile.whatsapp_opt_in === true`. If the student/mentor has not opted in, the system gracefully logs `opted_out` and skips dispatch.
- **Pre-Approved Meta HSM Templates:** In Meta Business API, outbound messages outside 24h conversation windows MUST use pre-approved HSM templates:
  - Template Name: `dreamx_session_reminder_24h`
  - Language: `en`
  - Parameters: `{{1}}` (Student Name), `{{2}}` (Mentor Name), `{{3}}` (Service Title), `{{4}}` (Time IST), `{{5}}` (Meeting URL).
- **Graceful Fallback Mode:** Because `FLAG_WHATSAPP_NOTIFICATIONS=false` is declared in `.env.local` pending business verification, the WhatsApp adapter operates with a **Simulation Provider** in test/development:
  - Generates the payload, validates the recipient phone number, logs the simulated delivery event to `public.notification_delivery_logs`, and marks the schedule row `sent` without incurring API failures.

---

## 10. Secure Real-Time Chat Plan

### Architecture:
1. **Zero-Trust Access Control:** Chat messages are linked directly to `booking_id`. An authorized participant can only access the conversation if their authenticated `auth.uid()` matches `student_id` or `mentor_id` on the booking.
2. **Supabase Realtime Channel Subscription:**
   ```typescript
   const channel = supabase
     .channel(`booking-chat:${bookingId}`)
     .on(
       'postgres_changes',
       {
         event: 'INSERT',
         schema: 'public',
         table: 'messages',
         filter: `booking_id=eq.${bookingId}`,
       },
       (payload) => handleIncomingMessage(payload.new)
     )
     .subscribe();
   ```
3. **Abuse Prevention & Rate Limiting:**
   - Max length: 2,000 characters per message.
   - Server-side sliding-window rate limit: Max 10 messages per minute per participant.
   - XSS sanitization applied prior to database storage.

---

## 11. Student Notification Center UI Plan

### Location:
- Route: `src/app/dashboard/student/notifications/page.tsx`
- Layout: Embedded inside `StudentDashboardShell`.

### Key Elements (Directly Translating `code.html` Prototype):
1. **Live Header & Connection Badge:** Displays "WS CONNECTED" status badge bound to Supabase Realtime socket state.
2. **Category Tabs:** Filter buttons for "All Alerts", "Bookings & Sessions", "Offers & Bids", "Deliverables", "AI Milestones", "Billing".
3. **Real-Time Badge Counts:** Unread counter pills dynamically computed from live notification state.
4. **Mark All as Read Action:** Single-click server action updating database state.
5. **Interactive Notification Item Card:**
   - Visual category icon with token color coding.
   - Unread pulse indicator.
   - Clickable navigation linking directly to the referenced booking, offer, or review modal.
   - Mark individual as read button.

---

## 12. External-Provider Configuration Checklist

| Provider | Setting / Variable | Verification Status | Action Required Before Live Production |
|---|---|:---:|---|
| **Resend** | `RESEND_API_KEY` | Configured in `.env.local` | Add production domain `dreamx.com` to Resend Dashboard and configure DKIM/SPF DNS records. |
| **Resend** | `RESEND_FROM_EMAIL` | Set to `notifications@dreamx.com` | Verify sender domain in Resend dashboard. In dev, uses sandbox `onboarding@resend.dev`. |
| **Meta WhatsApp** | `FLAG_WHATSAPP_NOTIFICATIONS` | `false` in `.env.local` | Complete Meta Business Verification, generate permanent System User Token, and register HSM template `dreamx_session_reminder_24h`. |
| **Supabase Realtime** | Project `ogpgoxikulkfpyoorisc` | Active | Publication `supabase_realtime` enabled for `messages` and `notifications` in Migration 0009. |
| **Cron Scheduler** | `CRON_SECRET` | Required | Set in `.env.local` and configure scheduled ping to `/api/v1/cron/notifications-sweep` every 10 minutes. |

---

## 13. File-by-File Change Matrix

| File Path | Action | Description / Approved Requirement |
|---|:---:|---|
| `supabase/migrations/0009_reviews_and_notifications.sql` | **NEW** | DDL for reviews, messages, notifications, schedules, delivery logs & RLS policies |
| `src/types/notifications.ts` | **NEW** | TypeScript interfaces for notifications, chat messages, reviews, and templates |
| `src/lib/notifications/email-service.ts` | **NEW** | Resend email dispatch client with React Email templates |
| `src/lib/notifications/whatsapp-service.ts` | **NEW** | Meta Graph API v19 client with opt-in checking and mock simulation fallback |
| `src/lib/notifications/notification-service.ts` | **NEW** | Core dispatcher, schedule creator, and background sweep processor |
| `src/components/chat/BookingChatBox.tsx` | **NEW** | Real-time chat box component with Supabase Realtime subscription |
| `src/app/dashboard/student/notifications/page.tsx` | **NEW** | Student notification feed page implementing `code.html` design prototype |
| `src/app/api/v1/notifications/route.ts` | **NEW** | REST API for fetching and filtering user notifications |
| `src/app/api/v1/notifications/[id]/read/route.ts` | **NEW** | REST API for marking single notification read |
| `src/app/api/v1/notifications/read-all/route.ts` | **NEW** | REST API for marking all notifications read |
| `src/app/api/v1/bookings/[id]/messages/route.ts` | **NEW** | REST API for chat message history and participant message posting |
| `src/app/api/v1/bookings/[id]/reviews/route.ts` | **NEW** | REST API for post-session review submission |
| `src/app/api/v1/mentors/[id]/reviews/route.ts` | **NEW** | Public REST API for mentor ratings and reviews list |
| `src/app/api/v1/cron/notifications-sweep/route.ts` | **NEW** | Secure background cron sweep handler for delayed notifications |
| `src/app/api/v1/payments/verify/route.ts` | **MODIFIED** | Hook notification trigger on verified booking confirmation |
| `src/app/api/v1/bookings/[id]/complete/route.ts` | **MODIFIED** | Hook review request scheduling on session completion |
| `src/components/layout/StudentDashboardShell.tsx` | **MODIFIED** | Connect header notification bell to real unread count and realtime updates |
| `scripts/test_phase7_notifications_e2e.ts` | **NEW** | Comprehensive automated test suite verifying all Phase 7 criteria |

---

## 14. Security & Privacy Review

1. **Eavesdropping Prevention (Chat RLS):**  
   Chat messages can NEVER be read by changing the booking ID in the URL or API request. RLS enforces that `auth.uid()` MUST match `student_id` or `mentor_id` on the booking record.
2. **Review Impersonation & Manipulation Defense:**  
   Students can only submit a review if `booking.status == 'completed'`. A UNIQUE constraint on `booking_id` prevents duplicate review stuffing. Mentors cannot review themselves.
3. **PII Protection in Notifications:**  
   Notification bodies and emails never include full banking details, passwords, or credit card numbers. Phone numbers in WhatsApp messages are masked in all logs.
4. **Idempotency & Duplicate Prevention:**  
   Every scheduled job has a unique deterministic `idempotency_key` (e.g. `reminder_24h_${bookingId}`). Concurrent sweeps use `FOR UPDATE SKIP LOCKED` or unique constraint guards to eliminate duplicate sends.

---

## 15. Testing Strategy & Measurable Acceptance Criteria

An automated verification test harness `scripts/test_phase7_notifications_e2e.ts` will validate:
- [ ] **Migration 0009 Schema & RLS:** All 5 new tables exist, columns typed correctly, RLS active.
- [ ] **Chat Participant Authorization:** Confirmed student and mentor can exchange messages; third-party user receives HTTP 403 / zero rows under RLS.
- [ ] **Message Validation & Length Enforcement:** Messages over 2,000 characters or empty strings rejected (HTTP 400).
- [ ] **Immediate Booking Confirmation Notification:** Triggers on payment verification; in-app notification and email record created.
- [ ] **Delayed 24h Reminder Scheduling:** Calculated accurately in IST/UTC; cancellation of booking marks schedule `cancelled`.
- [ ] **Review Submission & Rating Integrity:** Student can submit review for completed session; duplicate submission rejected (HTTP 409).
- [ ] **Notification Center Feed API:** `GET /api/v1/notifications` returns paginated list; `PATCH .../read` persists `is_read = true`.
- [ ] **Regression Suite:** Phases 0–6 tests (TypeScript typecheck, `test_phase0_3_auth_matrix.mjs`, `test_full_system_verification.mjs`, `test_phase6_payments_e2e.ts`) continue passing at 100%.

---

## 16. Deployment, Migration & Rollback Sequence

1. **Step 1 (Pre-flight):** Verify database connection and backup snapshot.
2. **Step 2 (Database Migration):** Apply `0009_reviews_and_notifications.sql` via Supabase CLI / `apply_migration`.
3. **Step 3 (Services & Endpoints):** Implement notification service, templates, chat APIs, and review routes.
4. **Step 4 (Frontend UI):** Implement `/dashboard/student/notifications/page.tsx` and `BookingChatBox.tsx`.
5. **Step 5 (Hooks Wiring):** Wire notification hooks into `payments/verify` and `bookings/[id]/complete`.
6. **Step 6 (Verification):** Run `npx tsx scripts/test_phase7_notifications_e2e.ts`.
7. **Rollback Strategy:**  
   Migration 0009 is purely additive. If rollback is ever required:
   `DROP TABLE IF EXISTS public.notification_delivery_logs, public.notification_schedules, public.notifications, public.messages, public.reviews CASCADE;`  
   Zero existing Phase 0–6 tables or data are touched.

---

## 17. Architecture Decisions Requiring Explicit User Approval

Before moving from planning to implementation, please confirm your approval on:

1. **Job Scheduling Architecture:**  
   Approve using the **PostgreSQL-Native Transactional Queue + Sweep Worker** (`notification_schedules` + `NotificationService.sweepScheduledNotifications()`), consistent with Phase 6, rather than deploying an external Redis + Python ARQ worker daemon.
2. **WhatsApp Business API Execution Mode:**  
   Approve running WhatsApp via the **Local Simulation Provider** in development/staging (validating payloads, checking opt-in, recording delivery logs) until live Meta Business verification is completed.
3. **Transactional Email Domain:**  
   Approve using Resend sandbox/onboarding sender (`onboarding@resend.dev` or configured DreamX domain) during automated testing.
4. **Sequential Migration Index:**  
   Approve naming the migration **`0009_reviews_and_notifications.sql`** (since `0008` is already in production for Phase 6).

---

## 18. Final Verdict

### **READY FOR APPROVAL** 🚀

This implementation plan is comprehensive, zero-trust hardened, fully aligned with the DreamX PRD, and preserves all working features from Phases 0 through 6. Upon your approval of the architecture decisions above, execution can begin immediately with Milestone 1.
