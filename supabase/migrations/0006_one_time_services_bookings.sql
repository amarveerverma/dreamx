-- Migration 0006: One-Time Services & Bookings (Phase 4)

-- 1. ENUM Types
DO $$ BEGIN
    CREATE TYPE public.request_status_enum AS ENUM ('pending', 'offers_received', 'booked', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.offer_status_enum AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.booking_status_enum AS ENUM ('pending_payment', 'confirmed', 'in_progress', 'deliverable_submitted', 'completed', 'cancelled', 'disputed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payout_status_enum AS ENUM ('none', 'held', 'eligible_for_release', 'released', 'refunded', 'forfeited');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.booking_source_enum AS ENUM ('direct_catalog', 'smart_match', 'program_session');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Smart Match Request & Offer Marketplace

CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type_id INTEGER NOT NULL REFERENCES public.service_types(id),
  target_career_market_id VARCHAR(20) NOT NULL DEFAULT 'CM-IN' REFERENCES configuration.career_markets(market_id),
  budget_min DECIMAL(10, 2) NOT NULL,
  budget_max DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  preferred_date DATE NOT NULL,
  preferred_time_utc TIME NOT NULL,
  student_time_zone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  attached_resume_url TEXT NOT NULL, -- Supabase Storage secure path
  status public.request_status_enum NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'), -- 48h Request TTL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_budget_range CHECK (budget_max >= budget_min AND budget_min > 0)
);

CREATE TABLE IF NOT EXISTS public.service_request_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score DECIMAL(5, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  mentor_pitch TEXT NOT NULL,
  
  -- Counter-Offer Negotiation Tracking (PRD §7)
  is_counter_offer BOOLEAN NOT NULL DEFAULT FALSE,
  counter_to_offer_id UUID NULL REFERENCES public.service_offers(id),
  
  status public.offer_status_enum NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'), -- 24h Offer TTL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_mentor_request_offer UNIQUE (request_id, mentor_id, is_counter_offer)
);

CREATE INDEX IF NOT EXISTS idx_service_requests_status_expire ON public.service_requests (status, expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_service_offers_request ON public.service_offers (request_id, status);

-- 3. Unified Booking System & Concurrency Locking

CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_source public.booking_source_enum NOT NULL DEFAULT 'direct_catalog',
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id),
  service_type_id INTEGER NOT NULL REFERENCES public.service_types(id),
  
  -- Source References
  mentor_service_id UUID NULL REFERENCES public.mentor_services(id),
  accepted_offer_id UUID NULL REFERENCES public.service_offers(id),
  program_enrollment_id UUID NULL REFERENCES public.program_enrollments(id), 
  
  -- Scheduling & Integration State
  scheduled_start_utc TIMESTAMPTZ NOT NULL,
  scheduled_end_utc TIMESTAMPTZ NOT NULL,
  meeting_url TEXT NULL, -- Google Meet URL populated upon confirmation
  google_calendar_event_id VARCHAR(255) NULL,
  
  -- Financial Ledgers & Multi-Currency Snapshots
  gross_amount DECIMAL(10, 2) NOT NULL,
  membership_discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  net_amount DECIMAL(10, 2) NOT NULL, -- What student paid: gross - discount
  platform_fee DECIMAL(10, 2) NOT NULL, -- 20% commission (services) or 15% (programs)
  mentor_earning DECIMAL(10, 2) NOT NULL, -- gross * 0.80 (mentor immune to subscription discount)
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  exchange_rate_to_inr DECIMAL(10, 4) NOT NULL DEFAULT 1.0000, -- Frozen at checkout
  
  -- State Machines
  status public.booking_status_enum NOT NULL DEFAULT 'pending_payment',
  payout_status public.payout_status_enum NOT NULL DEFAULT 'none',
  payout_eligible_at TIMESTAMPTZ NULL, -- 3-day hold (services) or 14-day hold (programs)
  
  -- Deliverable Tracking
  deliverable_file_url TEXT NULL,
  deliverable_submitted_at TIMESTAMPTZ NULL,
  
  -- Concurrency Lock Expiration (HP-1 Mitigation)
  checkout_ttl TIMESTAMPTZ NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_schedule_time CHECK (scheduled_end_utc > scheduled_start_utc),
  CONSTRAINT chk_financial_balance CHECK (net_amount = gross_amount - membership_discount)
);

-- Concurrency Contention Lock: Prevents double-booking active slots atomically
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_mentor_slot_lock ON public.service_bookings (mentor_id, scheduled_start_utc)
  WHERE status IN ('pending_payment', 'confirmed', 'in_progress', 'deliverable_submitted');

CREATE INDEX IF NOT EXISTS idx_bookings_payout_worker ON public.service_bookings (payout_status, payout_eligible_at)
  WHERE payout_status = 'held';


-- 4. RLS POLICIES

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_matches ENABLE ROW LEVEL SECURITY;

-- service_requests: Student can select their own, Mentors can select requests where they are matched or open pending requests.
CREATE POLICY "policy_service_requests_select" ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_request_matches srm
      WHERE srm.request_id = service_requests.id AND srm.mentor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'mentor'
    )
  );

CREATE POLICY "policy_service_requests_insert" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "policy_service_requests_update" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

-- service_request_matches: Mentors can see their matches, students can see matches for their requests.
CREATE POLICY "policy_service_request_matches_select" ON public.service_request_matches
  FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = service_request_matches.request_id AND sr.student_id = auth.uid()
    )
  );

-- service_offers: Students can read offers for their requests. Mentors can read their own offers.
CREATE POLICY "policy_service_offers_select" ON public.service_offers
  FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = service_offers.request_id AND sr.student_id = auth.uid()
    )
  );

CREATE POLICY "policy_service_offers_insert" ON public.service_offers
  FOR INSERT TO authenticated
  WITH CHECK (
    (mentor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mentor'))
    OR
    (is_counter_offer = TRUE AND EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = service_offers.request_id AND sr.student_id = auth.uid()
    ))
  );

CREATE POLICY "policy_service_offers_update" ON public.service_offers
  FOR UPDATE TO authenticated
  USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = service_offers.request_id AND sr.student_id = auth.uid()
    )
  );

-- service_bookings: Participants and Admins can read
CREATE POLICY "policy_bookings_select_participants" ON public.service_bookings
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    mentor_id = auth.uid()
  );

CREATE POLICY "policy_bookings_insert" ON public.service_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "policy_bookings_update" ON public.service_bookings
  FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid() OR
    mentor_id = auth.uid()
  );
