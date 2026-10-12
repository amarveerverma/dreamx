-- Migration 0007: AI Embeddings, Vector Search, and Prompt Logs (Phase 5)

-- 1. Enable pgvector extension in extensions schema
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Create ai schema
CREATE SCHEMA IF NOT EXISTS ai;

-- 3. Document Embeddings Table
CREATE TABLE IF NOT EXISTS ai.document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL, -- References profiles(id), mentor_services(id), etc.
    entity_type VARCHAR(50) NOT NULL, -- 'mentor_profile', 'service_catalog', 'student_request'
    content_chunk TEXT NOT NULL, -- Sanitized 512-token text chunk
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {'market': 'CM-IN', 'skills': ['python'], 'price': 999}
    embedding extensions.vector(768) NOT NULL, -- Google text-embedding-004 (768 dimensions)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compound Unique Constraint: Prevents duplicate embeddings for the same entity chunk
CREATE UNIQUE INDEX IF NOT EXISTS uq_entity_embedding ON ai.document_embeddings (entity_id, entity_type);

-- 4. HNSW Vector Index for Sub-15ms Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_vector_hnsw ON ai.document_embeddings 
USING hnsw (embedding extensions.vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. GIN Index on Metadata for Fast Stage 1 Filter Bounding
CREATE INDEX IF NOT EXISTS idx_vector_metadata ON ai.document_embeddings USING gin (metadata);

-- 6. AI Prompt & Telemetry Logs Table
CREATE TABLE IF NOT EXISTS ai.ai_prompt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feature_type VARCHAR(50) NOT NULL, -- 'smart_match', 'resume_eval', 'interview_prep'
    model_name VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'timeout', 'fallback_triggered', 'error'
    schema_validation_success BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_logs_feature ON ai.ai_prompt_logs (feature_type, created_at DESC);

-- 7. Row-Level Security (Zero-Trust Kernel)
ALTER TABLE ai.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai.ai_prompt_logs ENABLE ROW LEVEL SECURITY;

-- Document Embeddings: Public mentor profiles are searchable by authenticated users; private student records isolated
DO $$ BEGIN
    CREATE POLICY "policy_embeddings_select" ON ai.document_embeddings
        FOR SELECT TO authenticated
        USING (
            entity_type = 'mentor_profile' OR
            entity_id = auth.uid() OR
            (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Document Embeddings: Service Role / Admin can manage all
DO $$ BEGIN
    CREATE POLICY "policy_embeddings_service_role_all" ON ai.document_embeddings
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AI Prompt Logs: Strictly Service Role / Admin (immutable audit sink)
DO $$ BEGIN
    CREATE POLICY "policy_prompt_logs_service_role" ON ai.ai_prompt_logs
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
