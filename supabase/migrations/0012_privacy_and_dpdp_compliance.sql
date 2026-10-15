-- Migration 0012: Privacy & DPDP Act Compliance Baseline
-- Implements Phase 10: Digital Personal Data Protection Act (2023) Requirements

-- 1. Create Privacy Schema
CREATE SCHEMA IF NOT EXISTS privacy;

-- 2. Data Export Requests Tracking
CREATE TABLE IF NOT EXISTS privacy.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    file_path TEXT NULL,
    record_counts JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_privacy_export_user_created 
ON privacy.data_export_requests (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE privacy.data_export_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'data_export_requests' 
        AND policyname = 'privacy_export_select_own'
    ) THEN
        CREATE POLICY "privacy_export_select_own" 
        ON privacy.data_export_requests 
        FOR SELECT 
        USING (auth.uid() = user_id OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
    END IF;
END $$;

-- 3. Enhance public.profiles for DPDP Deletion Lifecycle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS scheduled_purge_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS is_deletion_requested BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Create Index on Purge Queue
CREATE INDEX IF NOT EXISTS idx_profiles_scheduled_purge 
ON public.profiles (scheduled_purge_at) 
WHERE scheduled_purge_at IS NOT NULL;
