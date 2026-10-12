-- Phase 2: Mentor Catalog, Services & Recurring Schedules
-- Matches Database.md Part 5.3 & Part 8 and API.md Part 4 & 7

-- 1. Standardized Service Types Catalog
CREATE TABLE IF NOT EXISTS public.service_types (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  default_duration_minutes INTEGER NOT NULL DEFAULT 60,
  deliverable_schema JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 10 Standardized Career Outcome Deliverables (PRD §4.2 & Architecture.md §13)
INSERT INTO public.service_types (id, slug, title, description, default_duration_minutes, deliverable_schema, is_active)
VALUES
  (1, 'mock-interview', '1-on-1 Mock Interview', 'Simulated Google/Meta 60-min loop with live whiteboard, distributed tradeoffs, and rubric debrief.', 60, '{"template": "interview_rubric_v1", "min_pages": 3}', TRUE),
  (2, 'resume-review', 'Resume & ATS Optimization', 'Line-by-line rewrite focused on XYZ metric formulas, Big Tech keywords, and Bar Raiser filters.', 45, '{"template": "resume_markup_v1", "annotated_pdf": true}', TRUE),
  (3, 'coding-dsa-prep', 'Coding & DSA Interview Prep', 'Optimal problem breakdown: Dynamic Programming, Sliding Window, and Tree-Graph algorithms.', 60, '{"template": "dsa_complexity_proof", "sandbox_link": true}', TRUE),
  (4, 'career-roadmap', 'Senior-to-Staff Career Strategy', 'Navigate L5-to-L6 leap, cross-organizational influence artifacts, and promotion packets.', 45, '{"template": "90_day_impact_plan", "rfc_template": true}', TRUE),
  (5, 'salary-negotiation', 'Salary & Offer Negotiation', 'Data-driven counter-offer scripting, competing offer leverage, and RSU equity optimization.', 30, '{"template": "negotiation_script_v1", "comp_calculator": true}', TRUE),
  (6, 'system-design', 'System Design Deep Dive (HLD & LLD)', 'High and low-level architectural design for distributed systems handling 1M+ QPS.', 60, '{"template": "architecture_blueprint", "diagram_required": true}', TRUE),
  (7, 'linkedin-optimization', 'LinkedIn & Brand Optimization', 'Profile makeover calibrated for Big Tech recruiters and hiring managers.', 30, '{"template": "profile_audit_v1"}', TRUE),
  (8, 'portfolio-review', 'Full-Stack & ML Portfolio Teardown', 'Codebase and live deployment teardown ensuring production-grade rigor.', 45, '{"template": "code_review_rubric"}', TRUE),
  (9, 'offer-evaluation', 'Competing Offer Evaluation', 'Detailed breakdown of base vs bonus vs equity vesting schedules across offers.', 30, '{"template": "total_comp_analysis"}', TRUE),
  (10, 'bar-raiser', 'Bar Raiser Leadership Simulation', 'Intensive behavioral interview loop testing Amazon LPs and Google''s Googliness criteria.', 60, '{"template": "leadership_scorecard_v1"}', TRUE)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    default_duration_minutes = EXCLUDED.default_duration_minutes,
    deliverable_schema = EXCLUDED.deliverable_schema,
    is_active = TRUE;

-- 2. Mentor Individual Service Offerings (Max 5 Active Cap)
CREATE TABLE IF NOT EXISTS public.mentor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type_id INTEGER NOT NULL REFERENCES public.service_types(id),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  custom_description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  CONSTRAINT uq_mentor_service_type UNIQUE (mentor_id, service_type_id),
  CONSTRAINT chk_service_price_positive CHECK (price > 0)
);

-- Trigger Function Enforcing Max 5 Active Services Cap (Database.md Part 5.3)
CREATE OR REPLACE FUNCTION public.fn_enforce_max_5_mentor_services()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Only validate if service is active and not soft-deleted
  IF NEW.is_active = TRUE AND NEW.deleted_at IS NULL THEN
    SELECT COUNT(*) INTO active_count
    FROM public.mentor_services
    WHERE mentor_id = NEW.mentor_id
      AND is_active = TRUE
      AND deleted_at IS NULL
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF active_count >= 5 THEN
      RAISE EXCEPTION 'MENTOR_SERVICE_LIMIT_EXCEEDED: A mentor can list a maximum of 5 active services simultaneously.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_5_services ON public.mentor_services;
CREATE TRIGGER trg_check_max_5_services
  BEFORE INSERT OR UPDATE ON public.mentor_services
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_max_5_mentor_services();

-- 3. Mentor Weekly Recurring Schedules (UTC Stored)
CREATE TABLE IF NOT EXISTS public.mentor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time_utc TIME NOT NULL,
  end_time_utc TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_schedule_time_order CHECK (end_time_utc > start_time_utc)
);

-- 4. Date-Specific Availability Overrides
CREATE TABLE IF NOT EXISTS public.schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_unavailable BOOLEAN NOT NULL DEFAULT TRUE,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Mentor Career Markets Junction
CREATE TABLE IF NOT EXISTS public.mentor_career_markets (
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id VARCHAR(20) NOT NULL REFERENCES configuration.career_markets(market_id),
  verified_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (mentor_id, market_id)
);

-- 6. Mentor Company Employment History
CREATE TABLE IF NOT EXISTS public.mentor_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(150) NOT NULL,
  title VARCHAR(150) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  start_date DATE NULL,
  end_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. High-Performance Compound & Full-Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_services_catalog_search 
  ON public.mentor_services (service_type_id, price, is_active)
  WHERE is_active = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mentor_schedules_mentor_day
  ON public.mentor_schedules (mentor_id, day_of_week)
  WHERE is_active = TRUE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='fts_tsvector') THEN
    ALTER TABLE public.profiles ADD COLUMN fts_tsvector tsvector
      GENERATED ALWAYS AS (to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(headline, '') || ' ' || coalesce(bio, ''))) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_fts_gin ON public.profiles USING GIN (fts_tsvector);

-- 8. Row Level Security Policies
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_career_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_companies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Service Types RLS: Public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_service_types_select_public') THEN
    CREATE POLICY "policy_service_types_select_public" ON public.service_types
      FOR SELECT TO public USING (is_active = TRUE OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  -- Mentor Services RLS: Public read active; Mentor modify own; Admin all
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_services_select_public') THEN
    CREATE POLICY "policy_mentor_services_select_public" ON public.mentor_services
      FOR SELECT TO public USING (
        (is_active = TRUE AND deleted_at IS NULL)
        OR mentor_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_services_insert_owner') THEN
    CREATE POLICY "policy_mentor_services_insert_owner" ON public.mentor_services
      FOR INSERT TO authenticated WITH CHECK (
        mentor_id = auth.uid() 
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_services_update_owner') THEN
    CREATE POLICY "policy_mentor_services_update_owner" ON public.mentor_services
      FOR UPDATE TO authenticated USING (
        mentor_id = auth.uid() 
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_services_delete_owner') THEN
    CREATE POLICY "policy_mentor_services_delete_owner" ON public.mentor_services
      FOR DELETE TO authenticated USING (
        mentor_id = auth.uid() 
        OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
      );
  END IF;

  -- Mentor Schedules RLS: Public read active; Mentor modify own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_schedules_select_public') THEN
    CREATE POLICY "policy_mentor_schedules_select_public" ON public.mentor_schedules
      FOR SELECT TO public USING (is_active = TRUE OR mentor_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_schedules_all_owner') THEN
    CREATE POLICY "policy_mentor_schedules_all_owner" ON public.mentor_schedules
      FOR ALL TO authenticated USING (mentor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  -- Schedule Overrides RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_schedule_overrides_select_public') THEN
    CREATE POLICY "policy_schedule_overrides_select_public" ON public.schedule_overrides
      FOR SELECT TO public USING (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_schedule_overrides_all_owner') THEN
    CREATE POLICY "policy_schedule_overrides_all_owner" ON public.schedule_overrides
      FOR ALL TO authenticated USING (mentor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  -- Mentor Career Markets & Companies RLS: Public read, Mentor insert/update own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_markets_select_public') THEN
    CREATE POLICY "policy_mentor_markets_select_public" ON public.mentor_career_markets
      FOR SELECT TO public USING (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_markets_all_owner') THEN
    CREATE POLICY "policy_mentor_markets_all_owner" ON public.mentor_career_markets
      FOR ALL TO authenticated USING (mentor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_companies_select_public') THEN
    CREATE POLICY "policy_mentor_companies_select_public" ON public.mentor_companies
      FOR SELECT TO public USING (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_mentor_companies_all_owner') THEN
    CREATE POLICY "policy_mentor_companies_all_owner" ON public.mentor_companies
      FOR ALL TO authenticated USING (mentor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;
END $$;
