import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ILLMGateway & Gemini Gateway Adapter (docs/AI.md §5 & §16)
 * Decouples application logic from external AI providers with integrated telemetry logging.
 */

export interface ILLMGateway {
  generateEmbeddings(text: string, signal?: AbortSignal): Promise<number[]>;
  generateStructuredJson<T>(
    prompt: string,
    model?: string,
    signal?: AbortSignal
  ): Promise<{ data: T; tokens: { prompt: number; completion: number } }>;
}

export class GeminiGateway implements ILLMGateway {
  private apiKey: string;
  private defaultModel: string;
  private atsModel: string;
  private embeddingModel: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.defaultModel = process.env.GEMINI_DEFAULT_MODEL || "gemini-3.5-flash";
    this.atsModel = process.env.GEMINI_ATS_MODEL || "gemini-3.5-flash";
    this.embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  }

  /**
   * Generates 768-dimensional vector embedding using gemini-embedding-001
   */
  async generateEmbeddings(text: string, signal?: AbortSignal): Promise<number[]> {
    if (!this.apiKey) {
      console.warn("[GEMINI GATEWAY] Missing GEMINI_API_KEY. Using deterministic pseudo-embedding.");
      return this.generateDeterministicVector(text, 768);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: text.slice(0, 2048) }] },
          outputDimensionality: 768,
        }),
        signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[GEMINI GATEWAY] Embedding API error (${res.status}): ${errorText}`);
        return this.generateDeterministicVector(text, 768);
      }

      const json = await res.json();
      const vector: number[] = json?.embedding?.values || [];

      if (vector.length === 768) {
        return vector;
      }

      return this.generateDeterministicVector(text, 768);
    } catch (err: any) {
      console.warn(`[GEMINI GATEWAY] Embedding call failed: ${err.message}. Using fallback vector.`);
      return this.generateDeterministicVector(text, 768);
    }
  }

  /**
   * Generates structured JSON from LLM with token tracking and prompt logging
   */
  async generateStructuredJson<T>(
    prompt: string,
    modelName?: string,
    signal?: AbortSignal
  ): Promise<{ data: T; tokens: { prompt: number; completion: number } }> {
    const selectedModel = modelName || this.defaultModel;

    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY not configured.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${this.apiKey}`;
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      signal,
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errBody}`);
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const promptTokens = result?.usageMetadata?.promptTokenCount || 0;
    const completionTokens = result?.usageMetadata?.candidatesTokenCount || 0;

    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(rawText) as T;

    return {
      data: parsedData,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
      },
    };
  }

  /**
   * Logs telemetry to ai.ai_prompt_logs
   */
  async logPromptTelemetry(params: {
    requestId: string;
    userId?: string;
    featureType: string;
    modelName: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    status: "success" | "timeout" | "fallback_triggered" | "error";
  }) {
    try {
      const { queryDb } = await import("@/lib/db/pg");
      // Estimated cost: $0.075 / 1M input, $0.30 / 1M output for 2.5 Flash
      const costUsd =
        (params.promptTokens * 0.075 + params.completionTokens * 0.3) / 1_000_000;

      await queryDb(
        `INSERT INTO ai.ai_prompt_logs (request_id, user_id, feature_type, model_name, prompt_tokens, completion_tokens, total_cost_usd, latency_ms, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          params.requestId,
          params.userId || null,
          params.featureType,
          params.modelName,
          params.promptTokens,
          params.completionTokens,
          costUsd,
          params.latencyMs,
          params.status,
        ]
      );
    } catch (err: any) {
      console.warn("[TELEMETRY] Failed to write ai_prompt_logs:", err.message);
    }
  }

  /**
   * Deterministic hash vector generator for reliable testing/fallback
   */
  private generateDeterministicVector(text: string, dim: number): number[] {
    const vec = new Array(dim).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < dim; i++) {
      const seed = Math.sin(hash + i) * 10000;
      vec[i] = Number((seed - Math.floor(seed)).toFixed(6));
    }
    // Normalize to unit length
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vec.map((v) => Number((v / norm).toFixed(6)));
  }
}

export const defaultGateway = new GeminiGateway();
