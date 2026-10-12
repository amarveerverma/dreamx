-- Phase 2: Configuration & Career Markets Foundation
-- Matches Database.md Part 5.1 and PRD V8.0 §13

CREATE SCHEMA IF NOT EXISTS configuration;

-- 1. Platform Countries Registry
CREATE TABLE IF NOT EXISTS configuration.platform_countries (
  country_code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_name VARCHAR(100) NULL,
  default_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  default_time_zone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_flags JSONB NOT NULL DEFAULT '{"gdpr": false, "data_residency": "IN"}',
  tax_rules JSONB NOT NULL DEFAULT '{"gst_rate": 18.0, "tax_name": "IGST"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist for existing table instances
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='country_name') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN country_name VARCHAR(100) NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='default_currency') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN default_currency VARCHAR(3) NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='default_time_zone') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN default_time_zone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='is_active') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='compliance_flags') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN compliance_flags JSONB NOT NULL DEFAULT '{"gdpr": false, "data_residency": "IN"}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='tax_rules') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN tax_rules JSONB NOT NULL DEFAULT '{"gst_rate": 18.0, "tax_name": "IGST"}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='created_at') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='platform_countries' AND column_name='updated_at') THEN
    ALTER TABLE configuration.platform_countries ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 2. Career Markets Registry (Core Global AI Engine)
CREATE TABLE IF NOT EXISTS configuration.career_markets (
  market_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  market_name VARCHAR(100) NULL,
  country_code VARCHAR(2) NOT NULL REFERENCES configuration.platform_countries(country_code),
  primary_language VARCHAR(10) NOT NULL DEFAULT 'en',
  default_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  resume_config JSONB NOT NULL DEFAULT '{"format": "standard", "photo": "optional", "max_pages": 2, "sections": ["experience", "education"]}',
  interview_config JSONB NOT NULL DEFAULT '{"rounds": 3, "technical_weight": 0.6, "behavioral_style": "STAR"}',
  salary_data JSONB NOT NULL DEFAULT '{"currency": "INR", "median_entry": 800000, "median_senior": 2500000}',
  hiring_norms JSONB NOT NULL DEFAULT '{"cultural_expectations": "Direct technical communication"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist for existing career_markets table instances
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='market_name') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN market_name VARCHAR(100) NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='country_code') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN country_code VARCHAR(2) NOT NULL DEFAULT 'IN' REFERENCES configuration.platform_countries(country_code);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='primary_language') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN primary_language VARCHAR(10) NOT NULL DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='default_currency') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN default_currency VARCHAR(3) NOT NULL DEFAULT 'INR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='resume_config') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN resume_config JSONB NOT NULL DEFAULT '{"format": "standard", "photo": "optional", "max_pages": 2, "sections": ["experience", "education"]}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='interview_config') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN interview_config JSONB NOT NULL DEFAULT '{"rounds": 3, "technical_weight": 0.6, "behavioral_style": "STAR"}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='salary_data') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN salary_data JSONB NOT NULL DEFAULT '{"currency": "INR", "median_entry": 800000, "median_senior": 2500000}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='hiring_norms') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN hiring_norms JSONB NOT NULL DEFAULT '{"cultural_expectations": "Direct technical communication"}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='created_at') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='configuration' AND table_name='career_markets' AND column_name='updated_at') THEN
    ALTER TABLE configuration.career_markets ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 3. Platform Languages Registry
CREATE TABLE IF NOT EXISTS configuration.platform_languages (
  language_code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Platform Currencies Registry
CREATE TABLE IF NOT EXISTS configuration.platform_currencies (
  currency_code VARCHAR(3) PRIMARY KEY,
  currency_name VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate_to_inr DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Seed India-Only Active Configuration Data
INSERT INTO configuration.platform_countries (country_code, name, country_name, default_currency, default_time_zone, is_active)
VALUES ('IN', 'India', 'India', 'INR', 'Asia/Kolkata', TRUE)
ON CONFLICT (country_code) DO UPDATE
SET country_name = EXCLUDED.country_name,
    default_currency = EXCLUDED.default_currency,
    default_time_zone = EXCLUDED.default_time_zone,
    is_active = TRUE;

INSERT INTO configuration.career_markets (market_id, name, market_name, country_code, primary_language, default_currency, is_active)
VALUES 
  ('CM-IN', 'India Market', 'India Tech Ecosystem', 'IN', 'en', 'INR', TRUE),
  ('CM-US', 'US Market', 'US Silicon Valley & Big Tech', 'IN', 'en', 'INR', TRUE)
ON CONFLICT (market_id) DO UPDATE
SET market_name = EXCLUDED.market_name,
    is_active = TRUE;

INSERT INTO configuration.platform_languages (language_code, name, is_active)
VALUES
  ('en', 'English', TRUE),
  ('hi', 'Hindi', TRUE),
  ('ta', 'Tamil', TRUE)
ON CONFLICT (language_code) DO NOTHING;

INSERT INTO configuration.platform_currencies (currency_code, currency_name, symbol, exchange_rate_to_inr, is_active)
VALUES
  ('INR', 'Indian Rupee', '₹', 1.0000, TRUE),
  ('USD', 'US Dollar', '$', 83.5000, TRUE),
  ('EUR', 'Euro', '€', 90.0000, TRUE)
ON CONFLICT (currency_code) DO NOTHING;

-- 6. Row Level Security Policies
ALTER TABLE configuration.platform_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration.career_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration.platform_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration.platform_currencies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_countries_select_public') THEN
    CREATE POLICY "policy_countries_select_public" ON configuration.platform_countries
      FOR SELECT TO public USING (is_active = TRUE OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_languages_select_public') THEN
    CREATE POLICY "policy_languages_select_public" ON configuration.platform_languages
      FOR SELECT TO public USING (is_active = TRUE OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_currencies_select_public') THEN
    CREATE POLICY "policy_currencies_select_public" ON configuration.platform_currencies
      FOR SELECT TO public USING (is_active = TRUE OR (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');
  END IF;
END $$;
