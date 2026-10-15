-- ============================================================================
-- MIGRATION 0010: CAREER READINESS SCORE, GUIDED JOURNEY & ANALYTICS
-- Phase 8 — Career Score & Analytics
-- ============================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE public.journey_stage_status_enum AS ENUM ('locked', 'available', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.recommendation_type_enum AS ENUM (
    'service', 'program', 'membership', 'action', 'mentor', 'journey_stage'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. CAREER SCORES TABLE
CREATE TABLE IF NOT EXISTS public.career_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- 8 Dimension Scores (PRD 11.1, Range 0.0 - 5.0)
  resume_score REAL NOT NULL DEFAULT 0.0 CHECK (resume_score >= 0.0 AND resume_score <= 5.0),
  technical_score REAL NOT NULL DEFAULT 1.0 CHECK (technical_score >= 0.0 AND technical_score <= 5.0),
  interview_score REAL NOT NULL DEFAULT 1.0 CHECK (interview_score >= 0.0 AND interview_score <= 5.0),
  communication_score REAL NOT NULL DEFAULT 1.0 CHECK (communication_score >= 0.0 AND communication_score <= 5.0),
  career_planning_score REAL NOT NULL DEFAULT 1.0 CHECK (career_planning_score >= 0.0 AND career_planning_score <= 5.0),
  linkedin_score REAL NOT NULL DEFAULT 0.0 CHECK (linkedin_score >= 0.0 AND linkedin_score <= 5.0),
  portfolio_score REAL NOT NULL DEFAULT 0.0 CHECK (portfolio_score >= 0.0 AND portfolio_score <= 5.0),
  confidence_score REAL NOT NULL DEFAULT 2.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 5.0),
  
  -- Evidence Tracking Metadata (Distinguishes 0.0 default from 0.0 assessed)
  evidence_metadata JSONB NOT NULL DEFAULT '{
    "resume": false,
    "technical": false,
    "interview": false,
    "communication": false,
    "career_planning": false,
    "linkedin": false,
    "portfolio": false,
    "confidence": false
  }'::jsonb,

  -- Overall Score Generated Stored Column (PRD 11.1 Exact Formula)
  overall_score REAL GENERATED ALWAYS AS (
    (resume_score * 0.20) +
    (technical_score * 0.20) +
    (interview_score * 0.15) +
    (communication_score * 0.15) +
    (career_planning_score * 0.10) +
    (linkedin_score * 0.10) +
    (portfolio_score * 0.05) +
    (confidence_score * 0.05)
  ) STORED,

  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_source TEXT NOT NULL DEFAULT 'initialization',
  trigger_ref_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_scores_student_id ON public.career_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_career_scores_overall ON public.career_scores(overall_score DESC);

-- 3. CAREER SCORE HISTORY TABLE (Longitudinal 90-Day Trendline)
CREATE TABLE IF NOT EXISTS public.career_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_score REAL NOT NULL,
  resume_score REAL NOT NULL,
  technical_score REAL NOT NULL,
  interview_score REAL NOT NULL,
  communication_score REAL NOT NULL,
  career_planning_score REAL NOT NULL,
  linkedin_score REAL NOT NULL,
  portfolio_score REAL NOT NULL,
  confidence_score REAL NOT NULL,
  trigger_source TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_history_student ON public.career_score_history(student_id, calculated_at DESC);

-- 4. CAREER JOURNEY PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.career_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL CHECK (stage >= 1 AND stage <= 10),
  status public.journey_stage_status_enum NOT NULL DEFAULT 'locked',
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  completion_source TEXT NULL,
  completion_ref_id UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_journey_stage UNIQUE(student_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_journey_progress_student ON public.career_journey_progress(student_id, stage);

-- 5. AI RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommendation_type public.recommendation_type_enum NOT NULL,
  target_id UUID NULL,
  target_slug TEXT NOT NULL,
  target_name TEXT NOT NULL,
  action_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 1.0,
  priority INTEGER NOT NULL DEFAULT 1,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ NULL,
  converted_at TIMESTAMPTZ NULL,
  dismissed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_rec_target UNIQUE(student_id, recommendation_type, target_slug)
);

CREATE INDEX IF NOT EXISTS idx_ai_recs_student ON public.ai_recommendations(student_id, created_at DESC);

-- 6. AUTOMATIC DATABASE SYNCHRONIZATION TRIGGERS

-- Function 6.1: Sync career_scores.overall_score -> profiles.career_score (0-1000 scale)
CREATE OR REPLACE FUNCTION public.sync_career_score_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET career_score = ROUND(NEW.overall_score * 200),
      updated_at = NOW()
  WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_career_score ON public.career_scores;
CREATE TRIGGER trg_sync_career_score
  AFTER INSERT OR UPDATE OF overall_score ON public.career_scores
  FOR EACH ROW EXECUTE FUNCTION public.sync_career_score_to_profile();

-- Function 6.2: Sync journey progress -> profiles.journey_stage
CREATE OR REPLACE FUNCTION public.sync_journey_stage_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_active_stage INTEGER;
BEGIN
  SELECT COALESCE(MIN(stage), 10) INTO v_active_stage
  FROM public.career_journey_progress
  WHERE student_id = NEW.student_id AND status IN ('available', 'in_progress');

  IF v_active_stage IS NOT NULL THEN
    UPDATE public.profiles
    SET journey_stage = v_active_stage,
        updated_at = NOW()
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_journey_stage ON public.career_journey_progress;
CREATE TRIGGER trg_sync_journey_stage
  AFTER INSERT OR UPDATE OF status ON public.career_journey_progress
  FOR EACH ROW EXECUTE FUNCTION public.sync_journey_stage_to_profile();

-- Function 6.3: Auto-initialize career records on student profile creation
CREATE OR REPLACE FUNCTION public.init_student_career_records()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' THEN
    -- Seed career_scores row
    INSERT INTO public.career_scores (
      student_id, resume_score, technical_score, interview_score,
      communication_score, career_planning_score, linkedin_score,
      portfolio_score, confidence_score, trigger_source
    ) VALUES (
      NEW.id, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 2.5, 'initialization'
    ) ON CONFLICT (student_id) DO NOTHING;

    -- Seed initial 90-day snapshot
    INSERT INTO public.career_score_history (
      student_id, overall_score, resume_score, technical_score,
      interview_score, communication_score, career_planning_score,
      linkedin_score, portfolio_score, confidence_score, trigger_source
    ) VALUES (
      NEW.id, 0.725, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 2.5, 'initialization'
    );

    -- Seed 10 journey stages (Stages 1-3 available; 4-10 locked)
    INSERT INTO public.career_journey_progress (student_id, stage, status)
    SELECT NEW.id, s.stage,
      CASE WHEN s.stage IN (1, 2, 3) THEN 'available'::public.journey_stage_status_enum
           ELSE 'locked'::public.journey_stage_status_enum END
    FROM generate_series(1, 10) AS s(stage)
    ON CONFLICT (student_id, stage) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_student_career ON public.profiles;
CREATE TRIGGER trg_init_student_career
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_student_career_records();

-- 7. IDEMPOTENT BACKFILL FOR EXISTING STUDENTS
INSERT INTO public.career_scores (
  student_id, resume_score, technical_score, interview_score,
  communication_score, career_planning_score, linkedin_score,
  portfolio_score, confidence_score, trigger_source
)
SELECT id, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 2.5, 'migration_backfill'
FROM public.profiles
WHERE role = 'student'
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.career_score_history (
  student_id, overall_score, resume_score, technical_score,
  interview_score, communication_score, career_planning_score,
  linkedin_score, portfolio_score, confidence_score, trigger_source
)
SELECT id, 0.725, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 2.5, 'migration_backfill'
FROM public.profiles
WHERE role = 'student'
AND NOT EXISTS (
  SELECT 1 FROM public.career_score_history csh WHERE csh.student_id = profiles.id
);

INSERT INTO public.career_journey_progress (student_id, stage, status)
SELECT p.id, s.stage,
  CASE WHEN s.stage IN (1, 2, 3) THEN 'available'::public.journey_stage_status_enum
       ELSE 'locked'::public.journey_stage_status_enum END
FROM public.profiles p
CROSS JOIN generate_series(1, 10) AS s(stage)
WHERE p.role = 'student'
ON CONFLICT (student_id, stage) DO NOTHING;

-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.career_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Students can read only their own records
DROP POLICY IF EXISTS "Students select own career_scores" ON public.career_scores;
CREATE POLICY "Students select own career_scores"
  ON public.career_scores FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students select own career_score_history" ON public.career_score_history;
CREATE POLICY "Students select own career_score_history"
  ON public.career_score_history FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students select own career_journey_progress" ON public.career_journey_progress;
CREATE POLICY "Students select own career_journey_progress"
  ON public.career_journey_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students select own ai_recommendations" ON public.ai_recommendations;
CREATE POLICY "Students select own ai_recommendations"
  ON public.ai_recommendations FOR SELECT TO authenticated
  USING (student_id = auth.uid());
