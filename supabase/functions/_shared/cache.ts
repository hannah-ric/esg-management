/**
 * Simple in-memory cache implementation for Edge Functions
 */

interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp when the item expires, null for no expiry
}

export class Cache {
  private store: Map<string, CacheItem<unknown>> = new Map();

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttlSeconds Time to live in seconds (optional)
   */
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): void {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T = unknown>(key: string): T | undefined {
    const item = this.store.get(key);

    // Return undefined if item doesn't exist
    if (!item) return undefined;

    // Check if the item has expired
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Clean up expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiry && item.expiry < now) {
        this.store.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const cache = new Cache();
