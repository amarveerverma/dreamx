/**
 * PII Sanitization Utility (docs/Security.md §8.2)
 * Strips emails, phone numbers, Indian PAN cards, Aadhaar cards, and credit cards before external AI dispatch.
 */

export const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  pan_card: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  credit_card: /\b(?:\d[ -]*?){13,16}\b/g,
};

export function scrubPII(text: string): string {
  if (!text || typeof text !== "string") return "";

  let sanitized = text;
  sanitized = sanitized.replace(PII_PATTERNS.email, "[REDACTED_EMAIL]");
  sanitized = sanitized.replace(PII_PATTERNS.phone, "[REDACTED_PHONE]");
  sanitized = sanitized.replace(PII_PATTERNS.pan_card, "[REDACTED_PAN]");
  sanitized = sanitized.replace(PII_PATTERNS.aadhaar, "[REDACTED_AADHAAR]");
  sanitized = sanitized.replace(PII_PATTERNS.credit_card, "[REDACTED_CARD]");

  return sanitized;
}

export const scrubPii = scrubPII;
