/**
 * DreamX 15-Minute Catalog Cache Layer
 * Implements in-memory and edge-compatible caching with selective invalidation on mutations.
 * Supports 15-minute default TTL matching Roadmap & Architecture.md requirements.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

const memoryStore = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 Minutes

export async function getCached<T>(key: string): Promise<T | null> {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return entry.data as T;
}

export async function setCached<T>(
  key: string,
  data: T,
  tags: string[] = [],
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  memoryStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    tags,
  });
}

export async function invalidateCacheByTag(tag: string): Promise<void> {
  const keysToDelete: string[] = [];
  memoryStore.forEach((entry, key) => {
    if (entry.tags.includes(tag) || key.startsWith(tag)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => memoryStore.delete(key));
}

export async function invalidateAllCatalogCache(): Promise<void> {
  await invalidateCacheByTag('catalog');
}
