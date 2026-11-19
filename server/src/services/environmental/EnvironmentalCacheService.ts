interface CacheEntry<T> {
  value: T;
  expiresAtMs: number;
  createdAtMs: number;
}

/**
 * Centralized TTL cache with in-flight request deduplication so concurrent
 * requests for the same city or grid cell do not trigger duplicate upstream calls.
 */
export class EnvironmentalCacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private readonly maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAtMs) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.store.set(key, {
      value,
      createdAtMs: now,
      expiresAtMs: now + ttlMs,
    });
  }

  async getOrFetch<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
  ): Promise<{ data: T; cacheHit: boolean }> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return { data: cached, cacheHit: true };
    }

    const existingPromise = this.inflight.get(key) as Promise<T> | undefined;
    if (existingPromise) {
      const data = await existingPromise;
      return { data, cacheHit: true };
    }

    const fetchPromise = fetcher()
      .then((result) => {
        this.set(key, result, ttlMs);
        return result;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, fetchPromise);
    const data = await fetchPromise;
    return { data, cacheHit: false };
  }

  invalidate(keyPrefix?: string): number {
    if (!keyPrefix) {
      const count = this.store.size;
      this.store.clear();
      return count;
    }
    let removed = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  getStats(): { size: number; inflightCount: number } {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAtMs) {
        this.store.delete(key);
      }
    }
    return {
      size: this.store.size,
      inflightCount: this.inflight.size,
    };
  }
}

export const environmentalCache = new EnvironmentalCacheService();
