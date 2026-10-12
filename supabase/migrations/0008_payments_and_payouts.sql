-- ==============================================================================
-- DREAMX DATABASE MIGRATION: 0008_payments_and_payouts.sql
-- Phase 6 — Direct Gateway Hold-and-Release Payouts & Webhook Idempotency
-- Architectural Invariant: Zero internal fund pooling. Platform never holds custody.
-- ==============================================================================

-- 1. Payout Status Enum
DO $$ BEGIN
  CREATE TYPE public.payout_schedule_status_enum AS ENUM ('on_hold', 'eligible', 'released', 'frozen', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Payout Schedules Table (Per-Booking Direct Gateway Hold Record)
CREATE TABLE IF NOT EXISTS public.payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Financial Dimensions & Tax Breakdown (India MVP)
  gross_amount DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- 18% GST applied on platform commission
  net_payout_amount DECIMAL(10, 2) NOT NULL, -- What mentor earns after commission & tax
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  
  -- Hold & Release Timing Engine
  hold_until TIMESTAMPTZ NOT NULL, -- 3-day hold (services) or 14-day hold (programs)
  status public.payout_schedule_status_enum NOT NULL DEFAULT 'on_hold',
  frozen BOOLEAN NOT NULL DEFAULT FALSE,
  freeze_reason TEXT NULL,
  
  -- Gateway Native Tracking (Razorpay Route)
  gateway_order_id VARCHAR(255) NULL,
  gateway_payment_id VARCHAR(255) NULL,
  gateway_transfer_id VARCHAR(255) NULL,
  released_at TIMESTAMPTZ NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_payout_split CHECK (net_payout_amount <= gross_amount)
);

-- 3. Payout Logs Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.payout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_schedule_id UUID NOT NULL REFERENCES public.payout_schedules(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  gateway_event_id VARCHAR(255) NULL UNIQUE,
  actor_id UUID NULL REFERENCES public.profiles(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Processed Webhook Events Table (Idempotency Engine)
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  event_id VARCHAR(255) PRIMARY KEY,
  gateway VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payout_schedules_mentor ON public.payout_schedules (mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_booking ON public.payout_schedules (booking_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_sweep ON public.payout_schedules (hold_until, status)
  WHERE status = 'on_hold' AND frozen = FALSE;
CREATE INDEX IF NOT EXISTS idx_payout_logs_schedule ON public.payout_logs (payout_schedule_id);

-- 6. Row-Level Security
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Mentors see only their own payout schedules
DROP POLICY IF EXISTS "policy_mentor_select_payout_schedules" ON public.payout_schedules;
CREATE POLICY "policy_mentor_select_payout_schedules" ON public.payout_schedules
  FOR SELECT TO authenticated
  USING (mentor_id = auth.uid());

-- Mentors see logs for their own schedules
DROP POLICY IF EXISTS "policy_mentor_select_payout_logs" ON public.payout_logs;
CREATE POLICY "policy_mentor_select_payout_logs" ON public.payout_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payout_schedules ps
      WHERE ps.id = payout_logs.payout_schedule_id AND ps.mentor_id = auth.uid()
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "policy_admin_all_payout_schedules" ON public.payout_schedules;
CREATE POLICY "policy_admin_all_payout_schedules" ON public.payout_schedules
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

DROP POLICY IF EXISTS "policy_admin_all_payout_logs" ON public.payout_logs;
CREATE POLICY "policy_admin_all_payout_logs" ON public.payout_logs
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
