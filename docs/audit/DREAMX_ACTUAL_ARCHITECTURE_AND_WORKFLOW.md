# DREAMX — ACTUAL ARCHITECTURE AND WORKFLOW SPECIFICATION

**Document Version:** 1.0.0 (Post-Phase 10 Verified)  
**Author:** Principal Software Architect  
**Scope:** Runtime Architecture, Boundaries, Lifecycles, and System Diagrams  

---

## 1. System Reality & Technology Stack

Contrary to early planning documents that proposed dual Node.js and FastAPI runtimes, DreamX runs as a **Next.js 14 App Router Modular Monolith** coupled directly to **Supabase PostgreSQL 16**.

### Actual Runtime Stack:
- **Application Framework:** Next.js 14.2.3 (React 18, TypeScript 5 Strict Mode)
- **Styling & UI Tokens:** Tailwind CSS 3.3.0, Radix UI Primitives, Lucide Icons
- **Database & Storage Engine:** Supabase Managed PostgreSQL 16
- **Vector Search Engine:** `pgvector` v0.8.2 (768-dimensional embeddings, HNSW Cosine Index)
- **Identity & Session Management:** Supabase GoTrue with SSR Cookie Sessions (`@supabase/ssr` 0.3.0)
- **AI Inference Engine:** Google Gemini (`gemini-3.5-flash` for reasoning, `gemini-embedding-001` for embeddings)
- **Payment Gateway:** Razorpay (Direct Gateway Hold-and-Release Payout Architecture)
- **Communications:** Resend (Email Adapter), WhatsApp Sandbox Adapter, Supabase Realtime (WebSocket channels)

---

## 2. Server/Client Boundaries & Client Usage Pattern

DreamX strictly enforces three distinct Supabase client instances to prevent security boundary crossing:

1. **Browser Client (`src/lib/supabase/client.ts`):**
   - Uses `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Used only in React Client Components (`'use client'`) for reactive state and Supabase Realtime channel subscriptions.
2. **Server SSR Client (`src/lib/supabase/server.ts`):**
   - Uses `createServerClient` with cookies storage handler from `next/headers`.
   - Reads user session JWT from request cookies. Enforces Row Level Security (RLS) under the authenticated user's identity.
3. **Admin Service Client (`src/lib/supabase/admin.ts`):**
   - Uses `createClient` with `SUPABASE_SERVICE_ROLE_KEY`.
   - Bypasses RLS strictly for kernel-level operations: WORM audit logging, webhook signature verification, cron sweeps, and administrative dispute overrides.

---

## 3. Core Architectural Sequences & Lifecycles

### 3.1 Authentication & RBAC Resolution
1. User submits email/password at `src/app/(auth)/login/page.tsx`.
2. Browser client sends credentials to Supabase GoTrue.
3. On authentication success, GoTrue returns JWT containing `app_metadata.user_role`.
4. Next.js edge middleware (`src/middleware.ts`) intercepts subsequent requests, refreshes session tokens via `@supabase/ssr`, and verifies role access:
   - `/admin/*` requires `app_metadata.user_role === 'admin'`.
   - `/dashboard/mentor/*` requires `app_metadata.user_role === 'mentor'`.
   - `/dashboard/student/*` requires `app_metadata.user_role === 'student'`.
5. Database trigger `trg_prevent_role_self_update` prevents role tampering at the PostgreSQL kernel level.

### 3.2 8-Stage Marketplace Negotiation & Booking State Machine
1. **Stage 1 (Request):** Student submits service request (`POST /api/v1/smart-match/requests`).
2. **Stage 2 (Offer):** Mentors submit proposals (`POST /api/v1/marketplace/offers`).
3. **Stage 3 (Negotiation):** Student/Mentor submit counter-offers (`POST /api/v1/marketplace/offers/[id]/counter`).
4. **Stage 4 (Acceptance):** Offer accepted (`POST /api/v1/marketplace/offers/[id]/accept`).
5. **Stage 5 (Slot Lock):** Booking created in `pending_payment` with 15-minute checkout TTL. Unique partial index `uq_active_mentor_slot_lock` prevents double-booking.
6. **Stage 6 (Checkout):** Razorpay order created via `POST /api/v1/payments/checkout`.
7. **Stage 7 (Confirmation):** Razorpay webhook `payment.captured` verified via HMAC-SHA256 (`src/app/api/v1/webhooks/razorpay/route.ts`). Booking transitions to `confirmed`. Google Meet link generated. Payout schedule created with status `on_hold`.
8. **Stage 8 (Completion & Hold):** Session completed (`POST /api/v1/bookings/[id]/complete`). Escrow hold countdown begins (3 days for services, 14 days for programs).

### 3.3 Direct Gateway Hold-and-Release Payout Lifecycle (PRD §13.6)
- **Zero Custody Invariant:** Platform database never holds raw settlement funds.
- **Commission Split:** Platform takes 20% commission (15% for programs) + 18% GST on commission. Mentor receives 76.4% net.
- **Dispute Freezing:** Opening a dispute (`POST /api/v1/admin/disputes`) sets `payout_schedules.frozen = true`, automatically excluding the row from the sweep worker.
- **Sweep Worker:** Automated cron sweep (`src/lib/payments/payout-sweeper.ts`) checks `hold_until <= NOW() AND status = 'on_hold' AND frozen = false` and calls Razorpay release API.

### 3.4 AI Smart Match & Fallback Pipeline
1. Input PII sanitized via regex scrubber (`src/lib/ai/scrubber.ts`).
2. Text bounded with `<user_input>` XML tags with delimiter neutralization.
3. 768-dim query embedding generated via `gemini-embedding-001`.
4. Cosine similarity query executed against `ai.document_embeddings` via pgvector `<=>` operator.
5. 14-dimension composite score calculated:
   - Career Goal Alignment (0.12), Career Market (0.10), Service Expertise (0.10), Skills (0.08), Industry (0.08), Languages (0.06), Timezone (0.06), Availability (0.08), Rating (0.08), Success Rate (0.06), Budget (0.06), Experience (0.04), Response Time (0.04), Cancellation Rate (0.04). All weights sum to exactly 1.00.
6. **Circuit Breaker:** If Gemini API call exceeds 3000ms SLA or returns 5xx error, fallback heuristic calculates matches deterministically.
7. Top 5 candidates persisted idempotently in `service_request_matches`.

---

## 4. Architectural Diagrams

### Diagram 1: System Context Diagram
```mermaid
graph TD
    User([End User / Browser])
    
    subgraph DreamX Platform [DreamX Next.js 14 Modular Monolith]
        EdgeMW[Edge Middleware: src/middleware.ts]
        AppPages[React Client/Server Components]
        APIHandlers[App Router API Routes: src/app/api/v1/*]
        DomainServices[Domain Services: AI, Payments, Career, Notifications]
    end

    subgraph External Infrastructure
        SupabaseDB[(Supabase PostgreSQL 16 + pgvector)]
        SupabaseAuth[Supabase GoTrue Auth]
        GeminiAPI[Google Gemini 3.5 & Embeddings]
        Razorpay[Razorpay Payment Gateway]
        Resend[Resend Email Provider]
    end

    User -->|HTTPS Requests| EdgeMW
    EdgeMW --> AppPages
    EdgeMW --> APIHandlers
    AppPages -->|Server Actions / Fetch| APIHandlers
    APIHandlers --> DomainServices
    DomainServices -->|SQL / RLS / Vector| SupabaseDB
    DomainServices -->|Session Verification| SupabaseAuth
    DomainServices -->|Inference & Embeddings| GeminiAPI
    DomainServices -->|Orders & Gateway Holds| Razorpay
    DomainServices -->|Transactional Emails| Resend
    Razorpay -->|HMAC Webhooks| APIHandlers
```

### Diagram 2: Component & Dependency Diagram
```mermaid
graph LR
    subgraph Presentation Layer
        AdminShell[AdminShell.tsx]
        StudentDash[Student Dashboard Pages]
        MentorDash[Mentor Dashboard Pages]
        PublicPages[Marketing & Auth Pages]
    end

    subgraph Service Layer
        AuthLib[src/lib/supabase/*]
        SmartMatch[src/lib/ai/smart-match-service.ts]
        PaymentEngine[src/lib/payments/commission-calculator.ts]
        PayoutSweeper[src/lib/payments/payout-sweeper.ts]
        CareerScore[src/lib/career/career-score-service.ts]
        NotifService[src/lib/notifications/notification-service.ts]
    end

    subgraph Data & Storage Layer
        PublicSchema[(public Schema: 24 Tables)]
        AISchema[(ai Schema: Vector & Prompt Logs)]
        AuditSchema[(audit Schema: WORM Logs)]
        PrivacySchema[(privacy Schema: DPDP Exports)]
    end

    AdminShell --> AuthLib
    StudentDash --> CareerScore
    StudentDash --> NotifService
    MentorDash --> PaymentEngine
    PublicPages --> SmartMatch

    SmartMatch --> AISchema
    PaymentEngine --> PublicSchema
    PayoutSweeper --> PublicSchema
    CareerScore --> PublicSchema
    AdminShell --> AuditSchema
```

### Diagram 3: Frontend-to-Backend-to-Database Request Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant NextRoute as Next.js API (/api/v1/bookings)
    participant AuthGuard as Supabase SSR Server Client
    participant Postgres as Supabase PostgreSQL
    
    Student->>NextRoute: POST /api/v1/bookings {mentor_id, service_id, scheduled_at}
    NextRoute->>AuthGuard: createServerClient(cookies) -> getUser()
    AuthGuard-->>NextRoute: Valid User JWT (Role: student)
    NextRoute->>Postgres: INSERT INTO service_bookings (status='pending_payment')
    Note over Postgres: Evaluates uq_active_mentor_slot_lock constraint
    alt Slot Available
        Postgres-->>NextRoute: Booking Created (15-min TTL lock active)
        NextRoute-->>Student: 201 Created {booking_id, expires_at}
    else Slot Double-Booked
        Postgres-->>NextRoute: Unique Violation (Code 23505)
        NextRoute-->>Student: 409 Conflict {error: "Slot already reserved"}
    end
```

### Diagram 4: Authentication and Authorization Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Browser Client
    participant GoTrue as Supabase Auth (GoTrue)
    participant EdgeMW as src/middleware.ts
    participant ProtectedPage as /admin/* or /dashboard/*
    
    User->>Browser: Enters email and password
    Browser->>GoTrue: signInWithPassword({email, password})
    GoTrue-->>Browser: Session Token {access_token, user: {app_metadata: {user_role}}}
    Browser->>EdgeMW: GET /admin
    EdgeMW->>EdgeMW: Parse cookies & verify JWT
    alt Role is 'admin'
        EdgeMW->>ProtectedPage: Forward Request
        ProtectedPage-->>User: Render Admin Shell & KPIs
    else Role is 'student' or 'mentor'
        EdgeMW-->>User: Redirect to 403 / Forbidden or Appropriate Dashboard
    end
```

### Diagram 5: Booking & Payment Lifecycle (Zero-Custody Hold & Release)
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant NextAPI as DreamX API
    participant Razorpay as Razorpay Gateway
    participant DB as PostgreSQL
    participant SweepWorker as Cron Sweep Worker
    actor Mentor
    
    Student->>NextAPI: POST /api/v1/payments/checkout {booking_id}
    NextAPI->>Razorpay: create_order(₹1,000)
    Razorpay-->>NextAPI: order_id
    NextAPI-->>Student: Razorpay Checkout Payload
    Student->>Razorpay: Completes Payment (UPI/Card)
    Razorpay->>NextAPI: Webhook payment.captured (HMAC-SHA256)
    NextAPI->>NextAPI: Verify HMAC signature & Idempotency
    NextAPI->>DB: UPDATE service_bookings SET status='confirmed'
    NextAPI->>DB: INSERT INTO payout_schedules (status='on_hold', hold_until=NOW()+3d, net=₹764)
    NextAPI-->>Razorpay: 200 OK
    Note over DB,SweepWorker: 3 Days Pass (Session Completed, No Dispute)
    SweepWorker->>DB: SELECT * FROM payout_schedules WHERE hold_until <= NOW() AND status='on_hold' AND frozen=false
    SweepWorker->>Razorpay: release_transfer(gateway_transfer_id, ₹764)
    Razorpay-->>SweepWorker: Transfer Successful
    SweepWorker->>DB: UPDATE payout_schedules SET status='released'
    SweepWorker->>DB: INSERT INTO payout_logs (event='payout_released')
```

### Diagram 6: AI Smart Match Execution Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SmartMatch as SmartMatchService
    participant Scrubber as PII Scrubber
    participant Gemini as Google Gemini API
    participant VectorDB as Supabase pgvector
    
    Student->>SmartMatch: Request Match {goal, skills, budget, industry}
    SmartMatch->>Scrubber: sanitize(request_text)
    Scrubber-->>SmartMatch: Masked PII (Aadhaar, Phone, Email redacted)
    SmartMatch->>Gemini: generate_embedding(sanitized_text) [Timeout: 3000ms]
    alt Embedding Success
        Gemini-->>SmartMatch: 768-dim Vector Float[]
        SmartMatch->>VectorDB: SELECT * FROM ai.document_embeddings ORDER BY embedding <=> query_vector LIMIT 50
        VectorDB-->>SmartMatch: Top 50 Vector Candidates
        SmartMatch->>SmartMatch: Compute 14-Dimension Composite Scoring (Weights Sum = 1.00)
    else Gemini 503 / Timeout Breached
        SmartMatch->>SmartMatch: Circuit Breaker Triggers Heuristic Fallback
    end
    SmartMatch->>VectorDB: Persist Top 5 in service_request_matches (Idempotent)
    SmartMatch-->>Student: Top 5 Ranked Mentor Matches + Explanations
```

### Diagram 7: Local Startup & Deployment Workflow
```mermaid
graph TD
    Start([Developer / CI Agent]) --> Install[npm install / lockfile sync]
    Install --> EnvCheck[Validate .env.local variables]
    EnvCheck --> StaticLint[npm run lint]
    StaticLint --> TypeCheck[npm run typecheck]
    TypeCheck --> Build[npm run build: Next.js 14 Production Bundling]
    Build --> RouteGen[75 Routes Prerendered / Compiled]
    RouteGen --> StartServer[npm run start: Node.js HTTP Server on port 3000]
    StartServer --> HealthCheck[Verify /api/v1/services & /auth/callback]
    HealthCheck --> Ready([Platform Live & Ready])
```
