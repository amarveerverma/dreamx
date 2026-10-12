-- Migration 0004_structured_programs.sql
-- Implements Phase 3: Structured Programs (Cohorts, Milestones, Enrollments, Check-ins)

-- 1. ENUM Types
CREATE TYPE public.program_enrollment_status_enum AS ENUM ('pending', 'active', 'completed', 'dropped');
CREATE TYPE public.program_checkin_status_enum AS ENUM ('submitted', 'needs_revision', 'approved');

-- 2. Tables

-- Table: public.programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks IN (2, 4, 6)),
  price_inr DECIMAL(10, 2) NOT NULL CHECK (price_inr > 0),
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Table: public.program_milestones
CREATE TABLE public.program_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  deliverable_schema JSONB NOT NULL DEFAULT '{}',
  estimated_hours INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, week_number)
);

-- Table: public.program_enrollments
CREATE TABLE public.program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_start_date DATE NOT NULL,
  status public.program_enrollment_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: public.program_session_checkins
CREATE TABLE public.program_session_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  student_notes TEXT NULL,
  mentor_feedback TEXT NULL,
  deliverable_url TEXT NULL, -- Points to Supabase Storage 'program_deliverables' bucket
  status public.program_checkin_status_enum NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, week_number)
);

-- 3. Row-Level Security (RLS)

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_session_checkins ENABLE ROW LEVEL SECURITY;

-- Programs: Public can read active programs. Mentors can insert/update/delete their own.
CREATE POLICY "policy_programs_select_public" ON public.programs
  FOR SELECT TO public
  USING (is_active = TRUE AND deleted_at IS NULL);

CREATE POLICY "policy_programs_select_mentor" ON public.programs
  FOR SELECT TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "policy_programs_insert_mentor" ON public.programs
  FOR INSERT TO authenticated
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "policy_programs_update_mentor" ON public.programs
  FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "policy_programs_delete_mentor" ON public.programs
  FOR DELETE TO authenticated
  USING (mentor_id = auth.uid());

-- Milestones: Public can read. Mentors can insert/update/delete for their own programs.
CREATE POLICY "policy_program_milestones_select" ON public.program_milestones
  FOR SELECT TO public
  USING (TRUE);

CREATE POLICY "policy_program_milestones_insert" ON public.program_milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_milestones.program_id AND p.mentor_id = auth.uid()
    )
  );

CREATE POLICY "policy_program_milestones_update" ON public.program_milestones
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_milestones.program_id AND p.mentor_id = auth.uid()
    )
  );

CREATE POLICY "policy_program_milestones_delete" ON public.program_milestones
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_milestones.program_id AND p.mentor_id = auth.uid()
    )
  );

-- Enrollments: Mentors (owning program) and Students (enrolled) can view.
CREATE POLICY "policy_program_enrollments_select" ON public.program_enrollments
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_enrollments.program_id AND p.mentor_id = auth.uid()
    )
  );

CREATE POLICY "policy_program_enrollments_insert_student" ON public.program_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "policy_program_enrollments_update_mentor" ON public.program_enrollments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_enrollments.program_id AND p.mentor_id = auth.uid()
    )
  );

-- Check-ins: Mentors and Students of the enrollment can view/update.
CREATE POLICY "policy_program_checkins_select" ON public.program_session_checkins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.program_enrollments e
      LEFT JOIN public.programs p ON e.program_id = p.id
      WHERE e.id = program_session_checkins.enrollment_id
        AND (e.student_id = auth.uid() OR p.mentor_id = auth.uid())
    )
  );

CREATE POLICY "policy_program_checkins_insert_student" ON public.program_session_checkins
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.program_enrollments e
      WHERE e.id = program_session_checkins.enrollment_id AND e.student_id = auth.uid()
    )
  );

CREATE POLICY "policy_program_checkins_update" ON public.program_session_checkins
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.program_enrollments e
      LEFT JOIN public.programs p ON e.program_id = p.id
      WHERE e.id = program_session_checkins.enrollment_id
        AND (e.student_id = auth.uid() OR p.mentor_id = auth.uid())
    )
  );

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program_deliverables',
  'program_deliverables',
  false,
  52428800, -- 50MB
  '{"application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS (Private: only mentor and student can access their files)
-- Objects inserted by student
CREATE POLICY "policy_storage_insert_deliverable" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'program_deliverables' AND 
    (auth.uid() = owner)
  );

-- Assuming path is `{enrollment_id}/{filename}`
CREATE POLICY "policy_storage_select_deliverable" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'program_deliverables' AND
    (
      auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM public.program_enrollments e
        LEFT JOIN public.programs p ON e.program_id = p.id
        WHERE e.id::text = (string_to_array(name, '/'))[1]
          AND (e.student_id = auth.uid() OR p.mentor_id = auth.uid())
      )
    )
  );
