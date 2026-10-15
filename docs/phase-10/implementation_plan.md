# Phase 10 Implementation Plan: Global Readiness (India MVP Config) & DPDP Compliance

**Document Reference:** `docs/phase-10/implementation_plan.md`  
**Phase:** Phase 10 (Day 53) — Global Readiness Configuration & Privacy Baseline  
**Status:** IMPLEMENTING  
**Governing PRD:** `PRD_CANONICAL_V1.md` (Section 18, DEC-11), `dreamx-build-roadmap-interactive 2026.html` (Phase 10)  
**Preceding Phases:** Phase 0–9 Fully Operational & Verified (19/19 E2E test suites passed)  

---

## 1. Executive Summary & Purpose

Phase 10 ensures regulatory readiness and privacy compliance for the India MVP launch under the **Digital Personal Data Protection (DPDP) Act, 2023**, while maintaining strict configuration lockdown to the India-first launch footprint.

The platform database schema was architected to be globally extensible from Day 1 (`configuration.platform_countries`, `configuration.career_markets`, `configuration.platform_currencies`, `configuration.platform_languages`). Phase 10 verifies that international expansions remain staged or dormant, and implements legally mandatory consumer rights:
1. **Right to Data Portability (DPDP Act §11 / §12)**: End-to-end data export packaging user profile, bookings, evaluation scores, reviews, payments, and disputes into a machine-readable JSON/ZIP payload within a 24-hour rate limit.
2. **Right to Erasure & Account Deletion (DPDP Act §12)**: Re-authenticated account deletion with a 30-day soft-delete grace period before irreversible database purge, immediate session revocation, and immutable audit logging.
3. **India Launch Lockdown Verification**: Verifying that active flags in configuration registries strictly isolate operations to India (`IN`, `INR`, `Asia/Kolkata`, `en`/`hi`).

---

## 2. India-Only Configuration Lockdown Specification

Per `PRD_CANONICAL_V1.md` Section 18 and Decision DEC-11:

| Configuration Registry | Active Key(s) | Staged / Dormant Keys | Invariant Check |
|---|---|---|---|
| `configuration.platform_countries` | `IN` (India) | `US`, `SG`, `AE`, `GB` (`is_active = FALSE`) | Exactly 1 country with `is_active = TRUE` |
| `configuration.career_markets` | `CM-IN` (India Tech) | `CM-US`, `CM-SG` (`is_active = FALSE`) | Default market is `CM-IN` |
| `configuration.platform_currencies` | `INR` (Indian Rupee) | `USD`, `EUR`, `SGD` (`is_active = FALSE`) | All order settlement strictly in INR |
| `configuration.platform_languages` | `en` (English), `hi` (Hindi) | All other languages (`is_active = FALSE`) | UI default is `en` |

---

## 3. Privacy & DPDP API Specifications

### 3.1 `POST /api/v1/privacy/export`
- **Authentication**: Required (Valid Supabase JWT session).
- **Rate Limit**: Maximum 1 export request per 24 hours per user.
- **Payload Generated**:
  - `profile.json`: User identity, headline, bios, verification status, contact info.
  - `service_bookings.json`: All historical 1-on-1 and cohort booking records, scheduled dates, session minutes.
  - `career_scores.json`: 14-dimension scores, progression history, milestone achievements.
  - `reviews.json`: Reviews authored and received.
  - `payment_transactions.json`: Order IDs, Razorpay settlement receipts, platform commission cuts.
  - `disputes.json`: Filed disputes, telemetry cross-checks, arbitration findings.
- **Output Format**: JSON archive with checksum and timestamp.

### 3.2 `POST /api/v1/privacy/account`
- **Authentication**: Required. Requires password confirmation for re-authentication.
- **Execution**:
  - Soft-delete: Sets `deleted_at = NOW()`, `scheduled_purge_at = NOW() + INTERVAL '30 days'`.
  - Flags account as `is_suspended = true` to immediately halt marketplace discovery and matching.
  - Revokes all active GoTrue refresh tokens.
  - Records an immutable entry in `audit.system_audit_logs`.
  - Triggers confirmation email notification via Resend.

### 3.3 `GET /api/v1/privacy/status`
- **Authentication**: Required.
- **Response**: Returns cooldown remaining for export, pending deletion date, and active DPDP request status.

---

## 4. User-Facing Privacy & Data Rights View

- Embedded under `/settings/privacy` and linked in student/mentor dashboards.
- Features:
  - 1-Click "Download My Data" button with live rate-limit timer.
  - "Request Account Deletion" button with password verification modal and 30-day grace period warning.
  - DPDP compliance notice explaining Indian data localization and processing guarantees.

---

## 5. Explicit Scope Exclusions (Deferred to Year 2)

Per `dreamx-build-roadmap-interactive 2026.html`:
- ❌ NO multi-region AWS/GCP database sharding.
- ❌ NO EU GDPR-specific cross-border data residency sharding.
- ❌ NO Stripe / PayPal multi-currency gateway adapters.
- ❌ NO AWS Route 53 GeoDNS latency routing.

---

## 6. Verification Plan

1. **Database Migration `0012_privacy_and_dpdp_compliance.sql`**:
   - `privacy.data_export_requests` tracking table.
   - `scheduled_purge_at` and `deletion_reason` on `public.profiles`.
   - Update `configuration` seed rows to guarantee only `IN`, `CM-IN`, `INR`, `en`/`hi` are active.
2. **Automated Verification Script `scripts/verify_phase10_global_config.mjs`**:
   - Validates configuration table invariants.
3. **Automated E2E Test Suite `scripts/test_phase10_privacy_e2e.mjs`**:
   - Tests export generation and rate limiting.
   - Tests account deletion confirmation, session revocation, and soft-delete scheduling.
   - Tests audit log creation.
4. **Build & Route Verification**:
   - `npm run build` validation.
