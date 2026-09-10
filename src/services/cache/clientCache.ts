/**
 * Lightweight Client-Side Cache & In-Flight Request De-duplicator
 * 
 * Engineering Invariants:
 * 1. "Don't build the database into the browser. Build an experience around the database."
 * 2. Zero external dependencies (pure TypeScript, in-memory Map + safe localStorage fallback).
 * 3. Scoped caching: Cache stable data (circuits, drivers, constructors, championship profiles)
 *    with medium-to-long TTL. Do NOT cache sensitive/authoritative prediction state or security auth.
 * 4. Concurrent request de-duplication: Multiple components mounting simultaneously sharing the
 *    same query will trigger exactly ONE in-flight network/mock request.
 */

export interface CacheOptions {
  ttlMs?: number;
  persist?: boolean;
  forceRefresh?: boolean;
}

export const TTL = {
  SHORT: 30 * 1000,        // 30 seconds (e.g. live session status)
  MEDIUM: 5 * 60 * 1000,    // 5 minutes (e.g. leaderboard, weekend summaries)
  LONG: 30 * 60 * 1000,     // 30 minutes (e.g. circuits, drivers, constructors)
  STATIC: 24 * 60 * 60 * 1000, // 24 hours (e.g. championship static profiles, educational taxonomy)
} as const;

export const CACHE_TTL = TTL;

interface MemoryEntry<T> {
  data: T;
  expiresAt: number;
}

class ClientCache {
  private memory = new Map<string, MemoryEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private storagePrefix = 'thegrid_cache_';

  private isStorageAvailable(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__thegrid_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve cached value if valid and unexpired
   */
  get<T>(key: string): T | null {
    const now = Date.now();

    // 1. Check in-memory cache first (fastest)
    const mem = this.memory.get(key);
    if (mem) {
      if (mem.expiresAt > now) {
        return mem.data as T;
      }
      this.memory.delete(key);
    }

    // 2. Check localStorage if available
    if (this.isStorageAvailable()) {
      try {
        const raw = window.localStorage.getItem(this.storagePrefix + key);
        if (raw) {
          const parsed = JSON.parse(raw) as MemoryEntry<T>;
          if (parsed && parsed.expiresAt > now) {
            // Restore to memory for subsequent synchronous reads
            this.memory.set(key, parsed);
            return parsed.data;
          }
          window.localStorage.removeItem(this.storagePrefix + key);
        }
      } catch {
        // Fallback gracefully on parsing/storage error
      }
    }

    return null;
  }

  /**
   * Set value in cache with designated TTL and optional persistent storage
   */
  set<T>(key: string, value: T, ttlMs: number = TTL.MEDIUM, persist: boolean = false): void {
    const expiresAt = Date.now() + ttlMs;
    const entry: MemoryEntry<T> = { data: value, expiresAt };

    this.memory.set(key, entry);

    if (persist && this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(this.storagePrefix + key, JSON.stringify(entry));
      } catch {
        // Fallback safely if quota exceeded
      }
    }
  }

  /**
   * Remove a specific key from memory and localStorage
   */
  remove(key: string): void {
    this.memory.delete(key);
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.removeItem(this.storagePrefix + key);
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Remove all cached entries starting with a given prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of Array.from(this.memory.keys())) {
      if (key.startsWith(prefix)) {
        this.memory.delete(key);
      }
    }

    if (this.isStorageAvailable()) {
      try {
        const fullPrefix = this.storagePrefix + prefix;
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(fullPrefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memory.clear();
    this.inFlight.clear();

    if (this.isStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.storagePrefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Atomic get-or-fetch with in-flight request de-duplication.
   * If a fetcher is already in flight for this key, all callers share the identical Promise.
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttlMs = TTL.MEDIUM, persist = false, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    }

    // Check if identical request is already in-flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // Execute new request and track promise
    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set<T>(key, result, ttlMs, persist);
        return result;
      } finally {
        // Always clean up in-flight mapping on resolve or reject
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Debug & inspection helper
   */
  size(): { memoryKeys: number; inFlightKeys: number } {
    return {
      memoryKeys: this.memory.size,
      inFlightKeys: this.inFlight.size,
    };
  }
}

export const clientCache = new ClientCache();
