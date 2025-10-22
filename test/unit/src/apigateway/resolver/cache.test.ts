import { describe, it, expect, beforeEach } from '@jest/globals';
import { ResolverCache } from '../../../../../src/apigateway/resolver/cache';

describe('ResolverCache', () => {
    let cache: ResolverCache;
    const mockEndpoint1 = { handler: 'endpoint1' };
    const mockEndpoint2 = { handler: 'endpoint2' };
    const mockEndpoint3 = { handler: 'endpoint3' };

    beforeEach(() => {
        cache = new ResolverCache();
    });

    describe('constructor', () => {
        it('should create cache with default values', () => {
            const defaultCache = new ResolverCache();
            expect(defaultCache).toBeInstanceOf(ResolverCache);
        });

        it('should create cache with custom max size and mode', () => {
            const customCache = new ResolverCache(64, 'static');
            expect(customCache).toBeInstanceOf(ResolverCache);
        });

        it('should create cache with all possible cache modes', () => {
            expect(new ResolverCache(128, 'all')).toBeInstanceOf(ResolverCache);
            expect(new ResolverCache(128, 'static')).toBeInstanceOf(ResolverCache);
            expect(new ResolverCache(128, 'dynamic')).toBeInstanceOf(ResolverCache);
            expect(new ResolverCache(128, 'none')).toBeInstanceOf(ResolverCache);
        });
    });

    describe('put', () => {
        it('should store static route in cache', () => {
            cache.put('/users', mockEndpoint1, false);
            const result = cache.get('/users');
            
            expect(result).not.toBeNull();
            expect(result?.endpointModule).toBe(mockEndpoint1);
            expect(result?.isDynamic).toBe(false);
        });

        it('should store dynamic route in cache', () => {
            cache.put('/users/:id', mockEndpoint1, true);
            const result = cache.get('/users/:id');
            
            expect(result).not.toBeNull();
            expect(result?.endpointModule).toBe(mockEndpoint1);
            expect(result?.isDynamic).toBe(true);
        });

        it('should not store anything when max is 0', () => {
            const zeroMaxCache = new ResolverCache(0);
            zeroMaxCache.put('/users', mockEndpoint1, false);
            
            expect(zeroMaxCache.get('/users')).toBeNull();
        });

        it('should not store anything when mode is none', () => {
            const noneCache = new ResolverCache(128, 'none');
            noneCache.put('/users', mockEndpoint1, false);
            
            expect(noneCache.get('/users')).toBeNull();
        });

        it('should not store dynamic routes when mode is static', () => {
            const staticCache = new ResolverCache(128, 'static');
            staticCache.put('/users/:id', mockEndpoint1, true);
            
            expect(staticCache.get('/users/:id')).toBeNull();
        });

        it('should store static routes when mode is static', () => {
            const staticCache = new ResolverCache(128, 'static');
            staticCache.put('/users', mockEndpoint1, false);
            
            const result = staticCache.get('/users');
            expect(result).not.toBeNull();
            expect(result?.isDynamic).toBe(false);
        });

        it('should not store static routes when mode is dynamic', () => {
            const dynamicCache = new ResolverCache(128, 'dynamic');
            dynamicCache.put('/users', mockEndpoint1, false);
            
            expect(dynamicCache.get('/users')).toBeNull();
        });

        it('should store dynamic routes when mode is dynamic', () => {
            const dynamicCache = new ResolverCache(128, 'dynamic');
            dynamicCache.put('/users/:id', mockEndpoint1, true);
            
            const result = dynamicCache.get('/users/:id');
            expect(result).not.toBeNull();
            expect(result?.isDynamic).toBe(true);
        });

        it('should implement LRU eviction when cache is full', () => {
            const smallCache = new ResolverCache(2);
            
            // Fill cache to capacity
            smallCache.put('/route1', mockEndpoint1, false);
            smallCache.put('/route2', mockEndpoint2, false);
            
            // Both should be present
            expect(smallCache.get('/route1')).not.toBeNull();
            expect(smallCache.get('/route2')).not.toBeNull();
            
            // Add third item - should evict first
            smallCache.put('/route3', mockEndpoint3, false);
            
            // First should be evicted, others should remain
            expect(smallCache.get('/route1')).toBeNull();
            expect(smallCache.get('/route2')).not.toBeNull();
            expect(smallCache.get('/route3')).not.toBeNull();
        });

        it('should not evict when updating existing entry', () => {
            const smallCache = new ResolverCache(2);
            
            smallCache.put('/route1', mockEndpoint1, false);
            smallCache.put('/route2', mockEndpoint2, false);
            
            // Update existing entry
            smallCache.put('/route1', mockEndpoint3, false);
            
            // Both should still be present
            expect(smallCache.get('/route1')?.endpointModule).toBe(mockEndpoint3);
            expect(smallCache.get('/route2')).not.toBeNull();
        });
    });

    describe('get', () => {
        it('should return null for non-existent entry', () => {
            expect(cache.get('/nonexistent')).toBeNull();
        });

        it('should return cached entry', () => {
            cache.put('/users', mockEndpoint1, false);
            const result = cache.get('/users');
            
            expect(result).not.toBeNull();
            expect(result?.endpointModule).toBe(mockEndpoint1);
            expect(result?.isDynamic).toBe(false);
        });

        it('should implement LRU behavior (move accessed item to end)', () => {
            const smallCache = new ResolverCache(2);
            
            smallCache.put('/route1', mockEndpoint1, false);
            smallCache.put('/route2', mockEndpoint2, false);
            
            // Access first item (should move to end)
            smallCache.get('/route1');
            
            // Add third item - should evict route2 (not route1)
            smallCache.put('/route3', mockEndpoint3, false);
            
            // route1 should still be present, route2 should be evicted
            expect(smallCache.get('/route1')).not.toBeNull();
            expect(smallCache.get('/route2')).toBeNull();
            expect(smallCache.get('/route3')).not.toBeNull();
        });
    });

    describe('delete', () => {
        it('should remove entry from cache', () => {
            cache.put('/users', mockEndpoint1, false);
            
            expect(cache.get('/users')).not.toBeNull();
            
            cache.delete('/users');
            
            expect(cache.get('/users')).toBeNull();
        });

        it('should handle deletion of non-existent entry', () => {
            expect(() => cache.delete('/nonexistent')).not.toThrow();
        });

        it('should allow re-adding after deletion', () => {
            cache.put('/users', mockEndpoint1, false);
            cache.delete('/users');
            cache.put('/users', mockEndpoint2, false);
            
            const result = cache.get('/users');
            expect(result?.endpointModule).toBe(mockEndpoint2);
        });
    });

    describe('clear', () => {
        it('should remove all entries from cache', () => {
            cache.put('/route1', mockEndpoint1, false);
            cache.put('/route2', mockEndpoint2, true);
            cache.put('/route3', mockEndpoint3, false);
            
            // Verify entries exist
            expect(cache.get('/route1')).not.toBeNull();
            expect(cache.get('/route2')).not.toBeNull();
            expect(cache.get('/route3')).not.toBeNull();
            
            cache.clear();
            
            // All entries should be gone
            expect(cache.get('/route1')).toBeNull();
            expect(cache.get('/route2')).toBeNull();
            expect(cache.get('/route3')).toBeNull();
        });

        it('should allow adding entries after clear', () => {
            cache.put('/route1', mockEndpoint1, false);
            cache.clear();
            cache.put('/route2', mockEndpoint2, false);
            
            expect(cache.get('/route1')).toBeNull();
            expect(cache.get('/route2')).not.toBeNull();
        });
    });

    describe('integration scenarios', () => {
        it('should handle complex LRU scenarios', () => {
            const complexCache = new ResolverCache(3);
            
            // Fill cache
            complexCache.put('/a', 'endpointA', false);
            complexCache.put('/b', 'endpointB', true);
            complexCache.put('/c', 'endpointC', false);
            
            // Access /a to make it most recent
            complexCache.get('/a');
            
            // Access /b to make it most recent
            complexCache.get('/b');
            
            // Add new item - should evict /c (least recently used)
            complexCache.put('/d', 'endpointD', true);
            
            expect(complexCache.get('/a')).not.toBeNull();
            expect(complexCache.get('/b')).not.toBeNull();
            expect(complexCache.get('/c')).toBeNull(); // evicted
            expect(complexCache.get('/d')).not.toBeNull();
        });

        it('should work with mixed cache modes and operations', () => {
            const mixedCache = new ResolverCache(5, 'all');
            
            // Add various types
            mixedCache.put('/static1', 'static1', false);
            mixedCache.put('/dynamic1/:id', 'dynamic1', true);
            mixedCache.put('/static2', 'static2', false);
            
            // Verify all are cached
            expect(mixedCache.get('/static1')).not.toBeNull();
            expect(mixedCache.get('/dynamic1/:id')).not.toBeNull();
            expect(mixedCache.get('/static2')).not.toBeNull();
            
            // Delete one
            mixedCache.delete('/static1');
            expect(mixedCache.get('/static1')).toBeNull();
            
            // Others should remain
            expect(mixedCache.get('/dynamic1/:id')).not.toBeNull();
            expect(mixedCache.get('/static2')).not.toBeNull();
        });
    });
});