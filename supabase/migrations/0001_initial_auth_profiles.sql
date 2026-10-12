-- Phase 1: Authentication, Identity, and Profiles Foundation
-- Matches exactly to Database.md Part 5 and 8

-- Create Configuration Schema for dependencies
CREATE SCHEMA IF NOT EXISTS configuration;

CREATE TABLE IF NOT EXISTS configuration.platform_countries (
    country_code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS configuration.career_markets (
    market_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed defaults to satisfy Phase 1 defaults
INSERT INTO configuration.platform_countries (country_code, name) VALUES ('IN', 'India') ON CONFLICT DO NOTHING;
INSERT INTO configuration.career_markets (market_id, name, is_active) VALUES ('CM-IN', 'India Market', TRUE) ON CONFLICT DO NOTHING;
INSERT INTO configuration.career_markets (market_id, name, is_active) VALUES ('CM-US', 'US Market', TRUE) ON CONFLICT DO NOTHING;

-- Create Enums
CREATE TYPE public.user_role_enum AS ENUM ('guest', 'student', 'mentor', 'admin', 'recruiter');
CREATE TYPE public.membership_tier_enum AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.verification_status_enum AS ENUM ('unverified', 'pending_review', 'active', 'rejected', 'suspended');

-- Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role_enum NOT NULL DEFAULT 'student',
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT NULL,
  headline VARCHAR(255) NULL,
  bio TEXT NULL,
  public_slug VARCHAR(100) NOT NULL UNIQUE,
  
  -- Global Readiness & Ambition Decoupling (India MVP Defaults)
  current_country VARCHAR(2) NOT NULL DEFAULT 'IN' REFERENCES configuration.platform_countries(country_code),
  target_career_market_id VARCHAR(20) NOT NULL DEFAULT 'CM-IN' REFERENCES configuration.career_markets(market_id),
  time_zone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  languages_spoken VARCHAR(10)[] NOT NULL DEFAULT '{"en"}',
  
  -- Membership & Gamification State
  membership_tier public.membership_tier_enum NOT NULL DEFAULT 'free',
  career_score INTEGER NOT NULL DEFAULT 0,
  journey_stage INTEGER NOT NULL DEFAULT 1,
  
  -- Mentor Specific Fields
  years_experience INTEGER NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status public.verification_status_enum NOT NULL DEFAULT 'unverified',
  remote_mentoring_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  CONSTRAINT chk_career_score_range CHECK (career_score >= 0 AND career_score <= 1000),
  CONSTRAINT chk_journey_stage_range CHECK (journey_stage >= 1 AND journey_stage <= 10)
);

CREATE INDEX idx_profiles_role_market ON public.profiles (role, target_career_market_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_slug ON public.profiles (public_slug) WHERE deleted_at IS NULL;

-- Create Session Audit Log Table
CREATE TABLE public.session_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync Trigger for Auth Users -> Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, public_slug, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '-' || substr(md5(random()::text), 1, 6),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role_enum, 'student'::public.user_role_enum)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration.career_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can read their own, public can read active profiles, Admin reads all, Users can update their own
CREATE POLICY "policy_profiles_select" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() 
    OR deleted_at IS NULL
    OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  );

CREATE POLICY "policy_profiles_update" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 2. Audit Logs: Admins only
CREATE POLICY "policy_session_logs_select" ON public.session_audit_logs
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

-- 3. Career Markets: Public can read active, admin reads all
CREATE POLICY "policy_markets_select" ON configuration.career_markets
  FOR SELECT 
  USING (is_active = TRUE OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
