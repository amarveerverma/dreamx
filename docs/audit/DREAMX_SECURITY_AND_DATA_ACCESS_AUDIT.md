# DREAMX — SECURITY AND DATA ACCESS AUDIT

**Document Version:** 1.0.0  
**Audit Scope:** Row Level Security (RLS), RBAC, Cryptographic Signatures, PII Sanitization, WORM Auditing, and Zero-Custody Invariants  
**Auditor:** Principal Application Security Reviewer  

---

## 1. Executive Security Evaluation

DreamX exhibits an exceptionally robust security posture. Unlike applications that rely exclusively on application-layer middleware, DreamX implements **defense-in-depth across the Next.js edge, API boundary, and PostgreSQL database kernel**:

```
[ Edge Middleware ] ──► [ API Route Handler ] ──► [ PostgreSQL Kernel (RLS & Triggers) ]
  • Cookie validation     • Zod schema validation   • Row Level Security (tenant isolation)
  • Role-based routing    • Service role gating     • Anti-tamper WORM append-only trigger
  • Session refreshing    • Idempotency checks      • Anti-privilege escalation trigger
```

---

## 2. Row Level Security (RLS) & Tenant Isolation Audit

All 24 application tables across schemas `public`, `ai`, `audit`, and `privacy` have Row Level Security enabled.

### 2.1 Critical Table RLS Policies & Tenant Isolation

| Table Name | Schema | RLS Enabled | Tenant Isolation Policy | Security Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | `public` | **YES** | `id = auth.uid()` for updates; public read of basic mentor fields. | **PASS** (Protected against self-role tampering via trigger). |
| `public.service_bookings` | `public` | **YES** | `student_id = auth.uid() OR mentor_id = auth.uid()`. | **PASS** (Third parties cannot view or modify session bookings). |
| `public.messages` | `public` | **YES** | User must be `student_id` or `mentor_id` on the parent booking. | **PASS** (Chat access strictly confined to session participants). |
| `public.reviews` | `public` | **YES** | `reviewer_id = auth.uid()` for insert/update; public read. | **PASS** (CHECK constraint enforces `rating >= 1 AND rating <= 5`). |
| `public.career_scores` | `public` | **YES** | `student_id = auth.uid()`. | **PASS** (Cross-student score snooping strictly blocked). |
| `public.career_score_history` | `public` | **YES** | `student_id = auth.uid()`. | **PASS** (Historical snapshots private to owner). |
| `public.career_journey_progress` | `public` | **YES** | `student_id = auth.uid()`. | **PASS** (Stage completion private to owner). |
| `public.ai_recommendations` | `public` | **YES** | `student_id = auth.uid()`. | **PASS** (Dismissal actions verified against owner). |
| `public.payout_schedules` | `public` | **YES** | `mentor_id = auth.uid()` for read; admin only for modifications. | **PASS** (Mentors cannot alter payout status or release funds). |
| `public.payout_logs` | `public` | **YES** | Admin and owner mentor read-only. | **PASS** (Gateway release audit log is read-only). |
| `ai.document_embeddings` | `ai` | **YES** | Schema isolated; queried via privileged vector function. | **PASS** (Direct SQL injection into embeddings blocked). |
| `ai.ai_prompt_logs` | `ai` | **YES** | Restricted to service-role admin. | **PASS** (Prompts and completion tokens kept private). |
| `audit.system_audit_logs` | `audit` | **YES** | Restricted to admin; protected by WORM trigger. | **PASS** (Immutable append-only ledger). |
| `privacy.data_export_requests` | `privacy` | **YES** | `user_id = auth.uid()`. | **PASS** (Data export downloads scoped strictly to requesting user). |

---

## 3. Defense Against Privilege Escalation

A critical vulnerability in Supabase applications occurs when non-admin users attempt to update their own role column (e.g. `UPDATE profiles SET role = 'admin' WHERE id = auth.uid()`).

### Kernel Defense Mechanism:
In `0001_initial_auth_profiles.sql`, the PostgreSQL database enforces a dedicated PL/pgSQL trigger function:
```sql
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF (auth.jwt() -> 'app_metadata' ->> 'user_role') IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot modify their own platform role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- **Empirical Test Proof:** In `test_phase0_3_auth_matrix.mjs` (Suite 10), an authenticated student user attempted to set `role = 'admin'`. The database firmly rejected the query with PostgreSQL exception: `"Unauthorized: Users cannot modify their own platform role."`.

---

## 4. WORM (Write Once, Read Many) Audit Trail Security

In compliance with corporate governance and financial auditing standards, all administrative, dispute, and privacy actions are recorded in `audit.system_audit_logs`.

### Anti-Tampering Trigger:
In `0011_admin_audit_and_disputes.sql`, trigger `trg_no_audit_updates` enforces absolute immutability:
```sql
CREATE OR REPLACE FUNCTION audit.prevent_audit_tampering()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'WORM Violation: Rows in audit.system_audit_logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_audit_updates
BEFORE UPDATE OR DELETE ON audit.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_audit_tampering();
```
- **Empirical Test Proof:** In `test_phase9_admin_e2e.mjs` (Suite 3), attempts by administrators or automated processes to `UPDATE` or `DELETE` audit log rows were firmly rejected with `WORM Violation` exceptions.

---

## 5. Financial & Payment Security (Zero-Custody Architecture)

In compliance with Reserve Bank of India (RBI) payment aggregator guidelines and PRD §13.6:
1. **Zero Fund Custody:** The DreamX platform never receives, holds, or pools customer funds into an internal holding wallet.
2. **Direct Gateway Escrow:** Student payments are captured and held directly on the Razorpay gateway.
3. **Gateway-Native Release:** Payouts to mentors are orchestrated exclusively via Razorpay Route Transfers triggered by the automated sweep worker or authorized admin overrides.
4. **Dispute Freezing:** In the event of a dispute, setting `payout_schedules.frozen = true` immediately and atomically halts release routines.

### Webhook Signature & Replay Defense:
- Webhooks received at `/api/v1/webhooks/razorpay` are verified using cryptographic `crypto.createHmac('sha256', secret)`.
- Replay attacks are neutralized by checking `processed_webhook_events(event_id)`. Re-delivered webhooks return HTTP 200 without executing duplicate business logic.

---

## 6. AI Safety, PII Scrubbing & Prompt Injection Defense

1. **PII Masking (`src/lib/ai/scrubber.ts`):**
   - Sanitizes text using strict regexes before sending data to Google Gemini.
   - Masks: Indian phone numbers (`+91` / `0`), personal emails, Indian PAN cards (`[A-Z]{5}[0-9]{4}[A-Z]`), and 12-digit Aadhaar numbers.
2. **Prompt Sandboxing (`src/lib/ai/prompts.ts`):**
   - All student instructions are encapsulated inside `<user_input>` XML tags.
   - Any rogue closing tags in student inputs are sanitized to `&lt;/user_input&gt;` to prevent breaking out of system prompt boundaries.
3. **Circuit Breaker:**
   - AI calls enforce a strict 3,000ms SLA deadline. In the event of an external model outage or slow response, the system falls back to a deterministic heuristic match with zero sensitive data leaks.

---

## 7. India DPDP Act 2023 Compliance & Data Protection

Phase 10 verified the platform's compliance with India's Digital Personal Data Protection (DPDP) Act 2023:
- **Right to Data Portability (§11):** `/api/v1/privacy/export` compiles all user data (profiles, bookings, scores, messages, reviews, payments) into a secure downloadable ZIP within 60 seconds.
- **Rate-Limiting Protection:** Export requests are strictly limited to 1 request per 24 hours per user.
- **Right to Erasure (§12):** Account deletion implements a statutory 30-day soft-delete grace period before permanent purging.
- **WhatsApp Opt-In:** Notifications via WhatsApp require explicit consent (`whatsapp_opt_in = true`). If opted out, the dispatch engine silently drops WhatsApp messages while preserving in-app notifications.

---

## 8. Cryptographic Secret Management & Environment Audit

- No secret values, private tokens, or service-role keys are hardcoded in source files.
- `.env.local` is listed in `.gitignore`.
- Browser bundle inspects only `NEXT_PUBLIC_*` variables.
- Privileged operations requiring `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` execute strictly in server-side Next.js route handlers.
