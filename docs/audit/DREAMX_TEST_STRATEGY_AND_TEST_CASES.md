# DREAMX — TEST STRATEGY & COMPREHENSIVE TEST CASES

**Document Version:** 1.0.0  
**Scope:** Complete Quality Assurance Blueprint Across Static, Unit, Integration, End-to-End, Security, and UI Tiers  
**Auditor:** QA Architect & Test Engineering Lead  

---

## 1. Testing Philosophy & Quality Gates

The DreamX quality strategy enforces strict, multi-tiered verification gates to prevent defects from reaching production:

```
[ Gate 1: Static Checks ] ──► [ Gate 2: Unit Tests ] ──► [ Gate 3: Integration Tests ] ──► [ Gate 4: E2E Tests ] ──► [ Gate 5: Security & UI ]
  • TypeScript Strict          • Math & Jaccard Bounds     • Supabase RLS & Triggers    • 8-Stage Booking Lifecycle   • Anti-Privilege Escalation
  • ESLint Clean Rules         • PII Scrubber Regex        • Webhook HMAC Verification  • Payout Hold & Sweep         • WORM Immutability Check
  • 0 Unresolved Imports       • 14-Dim Weights Sum=1.00   • Realtime Channels          • DAG Precedence Engine       • DPDP 24h Rate Limiting
```

---

## 2. Test Category Specifications & Test Cases

### Category A: Static Checks (Automated in CI/CD)
| Test ID | Scope | Verification Command | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **ST-01** | Type Safety | `npm run typecheck` (`tsc --noEmit`) | 0 TypeScript errors across entire project. |
| **ST-02** | Linting | `npm run lint` (`next lint`) | 0 ESLint errors; all warnings logged in Defect Register. |
| **ST-03** | Production Build | `npm run build` (`next build`) | Next.js 14 compiles 75 static/dynamic routes with exit code 0. |
| **ST-04** | Route Inventory | Route manifest inspection | 100% of defined API and page routes compile without missing exports. |

---

### Category B: Unit Tests
| Test ID | Component | Implementation File | Scenario & Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-01** | PII Masking | `src/lib/ai/scrubber.ts` | Masks Email, Indian Mobile Numbers, PAN, and Aadhaar from student text inputs. |
| **UT-02** | Prompt Sandboxing | `src/lib/ai/prompts.ts` | Encloses student input in `<user_input>` XML tags; neutralizes rogue closing tags (`&lt;/user_input&gt;`). |
| **UT-03** | 14-Dim AI Weights | `src/lib/ai/smart-match-service.ts` | Mathematical verification that all 14 composite weights sum exactly to 1.00. |
| **UT-04** | Cosine Bounds | `src/lib/ai/smart-match-service.ts` | Cosine similarity values strictly bound within [-1, 1], mapped to normalized score [0, 1]. |
| **UT-05** | Jaccard Similarity | `src/lib/ai/smart-match-service.ts` | Set similarity produces 0.0 on disjoint sets, 1.0 on identical sets, 0.5 on partial overlap. |
| **UT-06** | Commission Split | `src/lib/payments/commission-calculator.ts` | Calculates 20% platform fee + 18% GST on fee. Mentor receives 76.4% net. |
| **UT-07** | Hold Window Calculation | `src/lib/payments/commission-calculator.ts` | Returns 72 hours for one-time services; returns 336 hours (14 days) for structured programs. |

---

### Category C: Integration Tests
| Test ID | Boundary | Scenario & Expected Outcome |
| :--- | :--- | :--- |
| **IT-01** | GoTrue Auth & RLS | Student JWT authenticates; queries to `public.profiles` return only caller's profile. |
| **IT-02** | Role Escalation Guard | Student user executes `UPDATE profiles SET role = 'admin'`. DB trigger aborts transaction. |
| **IT-03** | Slot Lock Constraint | Two concurrent booking inserts for the same `(mentor_id, scheduled_at)` slot. Partial unique index rejects second insert with PostgreSQL error 23505. |
| **IT-04** | Webhook HMAC Verification | Ingestion of Razorpay `payment.captured` event. Valid HMAC-SHA256 accepted; tampered signature rejected with HTTP 400. |
| **IT-05** | Webhook Idempotency | Duplicate delivery of identical `event_id`. System acknowledges with HTTP 200 without executing duplicate database mutations. |
| **IT-06** | Realtime Messaging | Inserting row into `public.messages` emits realtime event on `supabase_realtime` channel. |
| **IT-07** | Review CHECK Constraint | Attempt to insert review with `rating = 6`. PostgreSQL CHECK constraint strictly rejects transaction. |

---

### Category D: End-to-End User Journeys
| Test ID | User Journey | Verification Steps & Proof |
| :--- | :--- | :--- |
| **E2E-01** | Visitor to Authenticated Session | Visitor registers at `/signup` -> receives session JWT -> onboarded into `public.profiles` -> redirected to dashboard. |
| **E2E-02** | 8-Stage Marketplace Negotiation | Student requests mock interview -> mentor submits offer -> student counters -> mentor accepts -> booking created with 15-min TTL. |
| **E2E-03** | Direct Gateway Hold-and-Release | Booking payment captured -> `payout_schedules` row created (`on_hold`, 3-day TTL) -> session completed -> sweep worker releases payout. |
| **E2E-04** | AI Smart Match with Fallback | Student submits match parameters -> pgvector returns top mentors -> if Gemini latency > 3000ms, circuit breaker triggers fallback heuristic. |
| **E2E-05** | 10-Stage Career Journey DAG | Student progresses through journey -> Stage 6 locked until Stages 2, 3, 5 complete -> Stage 7 tracks 10 job applications. |
| **E2E-06** | Mentor KYC Verification | Unverified mentor registers -> admin inspects profile at `/admin/mentors` -> admin clicks Approve -> mentor status becomes `'active'`. |
| **E2E-07** | Dispute Arbitration & Freeze | Student disputes session -> `payout_schedules.frozen` set to `true` -> sweep worker skips row -> admin resolves with refund. |
| **E2E-08** | DPDP Data Portability & Erasure | Student requests export -> ZIP generated -> 24h rate limit engaged -> student requests account deletion -> 30-day grace period set. |

---

### Category E: Security & Penetration Tests
| Test ID | Attack Vector | Security Control Under Test |
| :--- | :--- | :--- |
| **SEC-01** | Cross-Tenant Data Access | RLS policies on `service_bookings`, `messages`, `career_scores`, `payout_schedules`. |
| **SEC-02** | Student-to-Admin Privilege Escalation | Database trigger `trg_prevent_role_self_update` on `public.profiles`. |
| **SEC-03** | WORM Audit Log Tampering | Database trigger `trg_no_audit_updates` on `audit.system_audit_logs` rejecting UPDATE and DELETE. |
| **SEC-04** | Webhook Forgery & Replay | HMAC-SHA256 signature verification and `processed_webhook_events` tracking table. |
| **SEC-05** | Double-Booking Race Condition | PostgreSQL partial unique index `uq_active_mentor_slot_lock`. |
| **SEC-06** | Prompt Injection Jailbreak | Strict XML `<user_input>` boundary encapsulation and character neutralization in `src/lib/ai/prompts.ts`. |
| **SEC-07** | PII Exfiltration to External LLM | Regex scrubber redacting Phone, Email, PAN, and Aadhaar before LLM dispatch. |
| **SEC-08** | Payout Fund Interception | PRD §13.6 Direct Gateway Hold-and-Release: platform has zero custody of funds. |

---

### Category F: Frontend & UI Tests (Proposed E2E Browser Matrix)
| Test ID | Route | Component Interaction | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **UI-01** | `/login` | Submit valid / invalid credentials | Error toast on invalid; cookie set and dashboard redirect on valid. |
| **UI-02** | `/services/[slug]/book` | Select date, time slot, submit booking | Double-booked slots disabled; checkout button triggers Razorpay modal. |
| **UI-03** | `/dashboard/student/journey` | Click locked Stage 6 | Displays tooltip explaining prerequisite stages (Stages 2, 3, 5 required). |
| **UI-04** | `/dashboard/student/score` | Click "Dismiss (14 Days)" on recommendation | Removes card immediately; recommendation suppressed for 14 days. |
| **UI-05** | `/admin/moderation` | Arbitrate dispute | Modal confirms arbitration; updates dispute badge to `resolved_refunded`. |
| **UI-06** | `/privacy` | Click "Export Data (ZIP)" | Shows processing spinner; downloads ZIP; disables button for 24 hours. |
