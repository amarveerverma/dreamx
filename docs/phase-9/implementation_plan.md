# Phase 9 Implementation Plan: Admin Operations, Dispute Triage & Audit Trail

**Document Reference:** `docs/phase-9/implementation_plan.md`  
**Phase:** Phase 9 (Days 49–52) — Operational Control Center  
**Status:** READY FOR REVIEW & APPROVAL  
**Governing PRD:** `PRD_CANONICAL_V1.md` (Sections 6, 9, 12, 13, 17, 18)  
**Preceding Phases:** Phase 0–8 Fully Operational & Verified  

---

## 1. Executive Summary & Purpose

Phase 9 implements the **Operational Control Center (Admin Portal)** for DreamX. As a high-stakes career marketplace processing financial transactions, mentor schedules, and verified career evaluations, the platform requires an enterprise-grade administrative operations suite.

Phase 9 delivers:
1. **The 10 Consolidated Admin Routes** per `Frontend.md` Part 9.5 and the canonical sitemap.
2. **Immutable Audit Logging (`audit.system_audit_logs`)**: An append-only WORM (Write Once, Read Many) audit ledger tracking every administrative action, dispute freeze, and payout override.
3. **Dispute Verification & Telemetry Pipeline**: A 1-hour cross-check system comparing student claims, mentor defenses, and system telemetry (session attendance, deliverable timestamps, and chat logs) side-by-side.
4. **Student Dispute Rate & Anti-Abuse Tracking**: Automated detection of serial dispute abusers (>10% dispute frequency) with a 3-strike penalty mechanism.
5. **Strict Admin Route Protection & RBAC**: Defense-in-depth middleware and database RLS ensuring only verified users with `app_metadata.user_role = 'admin'` can access administrative surfaces.

---

## 2. Admin Route Architecture (Frontend.md Part 9.5 Alignment)

Per `Frontend.md` and `dreamx-build-roadmap-interactive 2026.html`, the admin portal enforces consolidated, tabbed routes to eliminate navigation fragmentation:

| Route Path | View Type | Core Capabilities | Data Source / APIs |
|---|---|---|---|
| **`/admin`** | Dashboard | Platform KPI Overview: GMV, Liquidity, Active Sessions, Disputed Rate | Aggregated stats via `/api/v1/admin/analytics/kpis` |
| **`/admin/users`** | Management List | Student & Mentor directory, account status toggling, activity log | `public.profiles`, `auth.users` |
| **`/admin/mentors`** | Queue & Review | KYC verification queue, proof of employment review, approve/reject buttons | `public.profiles` (`verification_status = 'pending_review'`) |
| **`/admin/programs`** | Curriculum Ops | Program templates (2, 4, 6 weeks), cohort enrollment status, milestone completion | `public.programs`, `public.program_enrollments` |
| **`/admin/marketplace`** | **Tabbed (4 Tabs)** | Tab 1: Service Catalog<br/>Tab 2: Smart Match Queue<br/>Tab 3: Memberships<br/>Tab 4: Matching Analytics | `service_types`, `service_requests`, `service_offers`, `service_bookings` |
| **`/admin/payments`** | Financial Ledger | Payout schedule, force-release, dispute hold freeze, refund triggers | `payment_transactions`, `payout_logs`, `/api/v1/admin/payouts` |
| **`/admin/analytics`** | **Tabbed (2 Tabs)** | Tab 1: Revenue & Growth Analytics<br/>Tab 2: Marketplace Liquidity Health | Time-series booking data, mentor response latency |
| **`/admin/reports`** | Report Engine | Export CSV/PDF for tax compliance, monthly mentor payouts, GMV summaries | Server-side report generator |
| **`/admin/moderation`** | Triage & Quality | Flagged mentor reviews, Dispute Triage side-by-side view, strike management | `public.reviews`, `public.booking_disputes` |
| **`/admin/settings`** | Configuration | Platform fee % toggle, dispute SLA timers, maintenance mode, market toggles | `configuration.career_markets`, platform settings |

---

## 3. Database Architecture & Migrations

### 3.1 Migration `0011_admin_audit_and_disputes.sql`

```sql
-- Create Audit Schema
CREATE SCHEMA IF NOT EXISTS audit;

-- 1. Immutable WORM System Audit Logs
CREATE TABLE audit.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL, -- 'PAYOUT_FORCE_RELEASE', 'DISPUTE_REFUND_APPROVED', 'MENTOR_APPROVED', etc.
    target_resource VARCHAR(100) NOT NULL, -- 'service_bookings', 'profiles', 'payout_logs'
    target_id UUID NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce WORM: Strictly prohibit UPDATE and DELETE on audit logs
CREATE OR REPLACE FUNCTION audit.prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Violation: audit.system_audit_logs is append-only WORM storage.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_audit_updates
BEFORE UPDATE OR DELETE ON audit.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_audit_tampering();

-- 2. Booking Disputes Table
CREATE TYPE public.dispute_status_enum AS ENUM (
    'opened', 
    'mentor_notified', 
    'under_review', 
    'resolved_refunded', 
    'resolved_dismissed', 
    'escalated'
);

CREATE TABLE public.booking_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id),
    reason_code VARCHAR(50) NOT NULL, -- 'NO_SHOW', 'POOR_DELIVERABLE', 'INCOMPLETE_CALL'
    student_notes TEXT NOT NULL,
    student_evidence_urls TEXT[] DEFAULT '{}',
    mentor_rebuttal TEXT NULL,
    mentor_evidence_urls TEXT[] DEFAULT '{}',
    rebuttal_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    status public.dispute_status_enum NOT NULL DEFAULT 'opened',
    resolution_notes TEXT NULL,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Abuse Tracking Columns on Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dispute_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dispute_abuse_strikes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_dispute_blocked BOOLEAN NOT NULL DEFAULT FALSE;
```

---

## 4. Dispute Verification & Telemetry Pipeline

```
                               DISPUTE WORKFLOW
                                      │
     Student files dispute via /dashboard/student/bookings/[id]
                                      │
                                      ▼
               POST /api/v1/bookings/[id]/dispute
                                      │
              ├─► 1. Payout Hold Frozen in `payout_logs`
              │
              ├─► 2. Automated Telemetry Cross-Check Pulled:
              │       - Google Meet API attendance log (Did mentor join? Student join?)
              │       - Deliverable submission timestamp vs session end time
              │       - Deliverable PDF validation (is file corrupt/empty?)
              │
              ├─► 3. Mentor Alert Dispatched (In-App + Email)
              │       - 1-Hour Rebuttal Countdown initiated
              │
              └─► 4. Side-by-Side Admin Triage View Generated
                      ┌───────────────────┬───────────────────┬───────────────────┐
                      │ Student Claim     │ Mentor Defense    │ System Telemetry  │
                      ├───────────────────┼───────────────────┼───────────────────┤
                      │ "Mentor missed    │ "I was on Meet    │ Google Meet Log:  │
                      │ call"             │ for 45 mins"      │ Mentor: 42 mins   │
                      │                   │                   │ Student: 0 mins   │
                      └───────────────────┴───────────────────┴───────────────────┘
                                      │
                                      ▼
                       Admin Arbitrates Dispute
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
               Approve Refund                 Dismiss Dispute
         - Student refunded via RZP       - Payout hold unfrozen
         - Mentor penalized if fault      - Student strikes +1 if false claim
         - Audit log recorded             - Audit log recorded
```

---

## 5. Implementation Steps & Work Breakdown

### Step 1: Database Migration & Schema Setup
- Apply migration `0011_admin_audit_and_disputes.sql`.
- Enable RLS on `audit.system_audit_logs` and `public.booking_disputes` allowing read/write only to users with `app_metadata.user_role = 'admin'`.

### Step 2: Backend Admin Route Handlers
- `GET /api/v1/admin/overview`: KPI metrics (liquidity, GMV, active disputes, pending KYC).
- `GET/PATCH /api/v1/admin/mentors/[id]/approve`: Mentor KYC verification and approval.
- `GET/POST /api/v1/admin/disputes`: List active disputes and submit arbitrator decisions.
- `GET/POST /api/v1/admin/disputes/[id]/telemetry`: Pull and return automated telemetry proof.
- `POST /api/v1/admin/payouts/[id]/freeze`: Dispute freeze control for payment sweep.

### Step 3: Frontend UI Conversion (From HTML Prototypes to Interactive React)
- Leverage existing high-fidelity designs in `src/app/(dashboard)/admin/` to build complete interactive Next.js pages:
  - `src/app/(dashboard)/admin/page.tsx` (KPI Dashboard)
  - `src/app/(dashboard)/admin/mentors/page.tsx` (KYC queue with document modal)
  - `src/app/(dashboard)/admin/marketplace/page.tsx` (4-tab consolidated view)
  - `src/app/(dashboard)/admin/analytics/page.tsx` (2-tab consolidated view)
  - `src/app/(dashboard)/admin/moderation/page.tsx` (Dispute triage side-by-side view)
  - `src/app/(dashboard)/admin/users/page.tsx` (User management table)
  - `src/app/(dashboard)/admin/programs/page.tsx` (Program monitor)
  - `src/app/(dashboard)/admin/reports/page.tsx` (Report generator)
  - `src/app/(dashboard)/admin/settings/page.tsx` (Platform configs)

### Step 4: End-to-End Verification Suite
- Author `scripts/test_phase9_admin_e2e.ts` validating:
  - Non-admin access denial (403/redirect).
  - WORM audit log append-only enforcement.
  - Dispute lifecycle: file dispute -> telemetry check -> mentor rebuttal -> admin refund/dismiss.
  - Payout hold freezing and override logging.

---

## 6. Pre-Execution Checklist & Prerequisites

- [ ] Product Owner approves this Phase 9 Implementation Plan.
- [ ] Align on whether to apply the **Authentication Core Fix** immediately as part of Phase 9 setup (Recommended so admin test accounts can seamlessly log in and access `/admin`).
