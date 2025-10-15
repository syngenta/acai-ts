/**
 * LRU Cache for route resolution
 */

import {CacheMode} from '../../types';

/**
 * Cache entry structure
 */
interface CacheEntry {
    endpointModule: unknown;
    isDynamic: boolean;
}

/**
 * ResolverCache class implementing LRU cache for route resolution
 */
export class ResolverCache {
    private max: number;
    private mode: CacheMode;
    private cache: Map<string, CacheEntry>;

    /**
     * Create a new ResolverCache
     * @param max - Maximum cache size
     * @param mode - Cache mode (all, static, dynamic, none)
     */
    constructor(max = 128, mode: CacheMode = 'all') {
        this.max = max;
        this.mode = mode;
        this.cache = new Map<string, CacheEntry>();
    }

    /**
     * Put an entry in the cache
     * @param routePath - Route path key
     * @param endpointModule - Endpoint module to cache
     * @param isDynamic - Whether the route is dynamic
     */
    put(routePath: string, endpointModule: unknown, isDynamic = false): void {
        if (!this.max || this.mode === 'none') {
            return;
        }
        if (this.mode === 'static' && isDynamic) {
            return;
        }
        if (this.mode === 'dynamic' && !isDynamic) {
            return;
        }
        if (!this.cache.has(routePath) && this.cache.size === this.max) {
            const delKey = this.cache.keys().next().value as string;
            this.cache.delete(delKey);
        }
        const entry: CacheEntry = {endpointModule, isDynamic};
        this.cache.set(routePath, entry);
    }

    /**
     * Get an entry from the cache (LRU: moves to end)
     * @param routePath - Route path key
     * @returns Cache entry or null
     */
    get(routePath: string): CacheEntry | null {
        const entry = this.cache.get(routePath);
        if (entry) {
            // Move to end (LRU)
            this.cache.delete(routePath);
            this.cache.set(routePath, entry);
            return entry;
        }
        return null;
    }

    /**
     * Delete an entry from the cache
     * @param routePath - Route path key
     */
    delete(routePath: string): void {
        this.cache.delete(routePath);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }
}
