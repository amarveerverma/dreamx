-- Migration 0011: Admin Audit, Disputes & Security Hardening
-- Implements Phase 9 Operational Control Center Foundation

-- 1. Create Audit Schema
CREATE SCHEMA IF NOT EXISTS audit;

-- 2. Immutable WORM System Audit Logs
CREATE TABLE IF NOT EXISTS audit.system_audit_logs (
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

-- WORM Trigger: strictly prevent UPDATE and DELETE on audit logs
CREATE OR REPLACE FUNCTION audit.prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Violation: audit.system_audit_logs is append-only WORM storage.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_audit_updates ON audit.system_audit_logs;
CREATE TRIGGER trg_no_audit_updates
BEFORE UPDATE OR DELETE ON audit.system_audit_logs
FOR EACH ROW EXECUTE FUNCTION audit.prevent_audit_tampering();

-- 3. Booking Disputes System
DO $$ BEGIN
    CREATE TYPE public.dispute_status_enum AS ENUM (
        'opened', 
        'mentor_notified', 
        'under_review', 
        'resolved_refunded', 
        'resolved_dismissed', 
        'escalated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.booking_disputes (
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

-- 4. Abuse Tracking Columns on Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dispute_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dispute_abuse_strikes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_dispute_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Role Escalation Prevention Trigger on Profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow if current JWT claim has admin role or executed in superuser/service-role context
    IF (auth.jwt() -> 'app_metadata' ->> 'user_role') IS DISTINCT FROM 'admin' 
       AND (auth.jwt() ->> 'role') IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot modify their own platform role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_self_update ON public.profiles;
CREATE TRIGGER trg_prevent_role_self_update
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_self_update();

-- 6. Row-Level Security (RLS) Configuration
ALTER TABLE audit.system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_disputes ENABLE ROW LEVEL SECURITY;

-- Audit Logs RLS: Only admins can view audit logs
DROP POLICY IF EXISTS "policy_audit_logs_admin_select" ON audit.system_audit_logs;
CREATE POLICY "policy_audit_logs_admin_select" ON audit.system_audit_logs
FOR SELECT TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

-- Any authenticated user can INSERT an audit log (e.g. system operations recorded on behalf of user)
DROP POLICY IF EXISTS "policy_audit_logs_authenticated_insert" ON audit.system_audit_logs;
CREATE POLICY "policy_audit_logs_authenticated_insert" ON audit.system_audit_logs
FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

-- Disputes RLS: Participants and Admins can view disputes
DROP POLICY IF EXISTS "policy_disputes_select" ON public.booking_disputes;
CREATE POLICY "policy_disputes_select" ON public.booking_disputes
FOR SELECT TO authenticated
USING (
    student_id = auth.uid() 
    OR mentor_id = auth.uid() 
    OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
);

-- Students can insert disputes for their own bookings
DROP POLICY IF EXISTS "policy_disputes_insert" ON public.booking_disputes;
CREATE POLICY "policy_disputes_insert" ON public.booking_disputes
FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

-- Mentors can update rebuttal; Admins can update all resolution fields
DROP POLICY IF EXISTS "policy_disputes_update" ON public.booking_disputes;
CREATE POLICY "policy_disputes_update" ON public.booking_disputes
FOR UPDATE TO authenticated
USING (
    mentor_id = auth.uid() 
    OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
)
WITH CHECK (
    mentor_id = auth.uid() 
    OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
);
