/**
 * Circuit Breaker & Timeout SLA Guard (docs/AI.md §16.2 & §16.4)
 * Enforces a strict 3,000ms SLA deadline on external AI calls, seamlessly falling back on timeout.
 */

export interface CircuitBreakerResult<T> {
  data: T;
  fallbackActive: boolean;
  latencyMs: number;
  error?: string;
}

export async function executeWithCircuitBreaker<T>(
  action: (signal: AbortSignal) => Promise<T>,
  fallbackAction: () => Promise<T> | T,
  timeoutMs: number = 3000
): Promise<CircuitBreakerResult<T>> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await action(controller.signal);
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    return {
      data: result,
      fallbackActive: false,
      latencyMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = controller.signal.aborted || err.name === "AbortError";
    const errorMessage = isTimeout
      ? `AI call exceeded ${timeoutMs}ms SLA deadline`
      : err.message || "AI invocation failed";

    console.warn(`[CIRCUIT BREAKER] Fallback triggered: ${errorMessage}`);
    const fallbackData = await fallbackAction();

    return {
      data: fallbackData,
      fallbackActive: true,
      latencyMs,
      error: errorMessage,
    };
  }
}
