import { describe, it, expect } from '@jest/globals';
import 'reflect-metadata';
import {
    MetadataKeys,
    getMetadata,
    setMetadata,
    hasMetadata,
    getMetadataKeys,
    RouteMetadata,
    AuthMetadata,
    ValidationMetadata,
    TimeoutMetadata
} from '../../../src/decorators/metadata';

describe('Metadata Utilities', () => {

    describe('setMetadata', () => {
        it('should set metadata on target object', () => {
            const target = {};
            const value = { test: 'data' };

            setMetadata(MetadataKeys.ROUTE, value, target);

            expect(Reflect.getMetadata(MetadataKeys.ROUTE, target)).toEqual(value);
        });

        it('should set metadata on target object with property key', () => {
            const target = {};
            const value = { test: 'data' };
            const propertyKey = 'testProp';

            setMetadata(MetadataKeys.ROUTE, value, target, propertyKey);

            expect(Reflect.getMetadata(MetadataKeys.ROUTE, target, propertyKey)).toEqual(value);
        });

        it('should set route metadata', () => {
            const target = {};
            const routeMetadata: RouteMetadata = {
                method: 'GET',
                path: '/test'
            };

            setMetadata(MetadataKeys.ROUTE, routeMetadata, target);

            const retrieved = getMetadata<RouteMetadata>(MetadataKeys.ROUTE, target);
            expect(retrieved).toEqual(routeMetadata);
        });

        it('should set auth metadata', () => {
            const target = {};
            const authMetadata: AuthMetadata = {
                required: true
            };

            setMetadata(MetadataKeys.AUTH, authMetadata, target);

            const retrieved = getMetadata<AuthMetadata>(MetadataKeys.AUTH, target);
            expect(retrieved).toEqual(authMetadata);
        });
    });

    describe('getMetadata', () => {
        it('should return undefined for non-existent metadata', () => {
            const target = {};

            const result = getMetadata(MetadataKeys.ROUTE, target);

            expect(result).toBeUndefined();
        });

        it('should retrieve metadata from target object', () => {
            const target = {};
            const value = { test: 'data' };
            Reflect.defineMetadata(MetadataKeys.ROUTE, value, target);

            const result = getMetadata(MetadataKeys.ROUTE, target);

            expect(result).toEqual(value);
        });

        it('should retrieve metadata from target object with property key', () => {
            const target = {};
            const value = { test: 'data' };
            const propertyKey = 'testProp';
            Reflect.defineMetadata(MetadataKeys.ROUTE, value, target, propertyKey);

            const result = getMetadata(MetadataKeys.ROUTE, target, propertyKey);

            expect(result).toEqual(value);
        });

        it('should return undefined for non-existent property key metadata', () => {
            const target = {};

            const result = getMetadata(MetadataKeys.ROUTE, target, 'nonExistentProp');

            expect(result).toBeUndefined();
        });
    });

    describe('hasMetadata', () => {
        it('should return false for non-existent metadata', () => {
            const target = {};

            const result = hasMetadata(MetadataKeys.ROUTE, target);

            expect(result).toBe(false);
        });

        it('should return true for existing metadata', () => {
            const target = {};
            const value = { test: 'data' };
            setMetadata(MetadataKeys.ROUTE, value, target);

            const result = hasMetadata(MetadataKeys.ROUTE, target);

            expect(result).toBe(true);
        });

        it('should return false for non-existent property key metadata', () => {
            const target = {};

            const result = hasMetadata(MetadataKeys.ROUTE, target, 'nonExistentProp');

            expect(result).toBe(false);
        });

        it('should return true for existing property key metadata', () => {
            const target = {};
            const value = { test: 'data' };
            const propertyKey = 'testProp';
            setMetadata(MetadataKeys.ROUTE, value, target, propertyKey);

            const result = hasMetadata(MetadataKeys.ROUTE, target, propertyKey);

            expect(result).toBe(true);
        });
    });

    describe('getMetadataKeys', () => {
        it('should return empty array for object with no metadata', () => {
            const target = {};

            const result = getMetadataKeys(target);

            expect(result).toEqual([]);
        });

        it('should return metadata keys for object', () => {
            const target = {};
            setMetadata(MetadataKeys.ROUTE, { method: 'GET', path: '/test' }, target);
            setMetadata(MetadataKeys.AUTH, { required: true }, target);

            const result = getMetadataKeys(target);

            expect(result).toHaveLength(2);
            expect(result).toContain(MetadataKeys.ROUTE);
            expect(result).toContain(MetadataKeys.AUTH);
        });

        it('should return metadata keys for object property', () => {
            const target = {};
            const propertyKey = 'testProp';
            setMetadata(MetadataKeys.VALIDATE, { requirements: {} }, target, propertyKey);
            setMetadata(MetadataKeys.TIMEOUT, { timeout: 5000 }, target, propertyKey);

            const result = getMetadataKeys(target, propertyKey);

            expect(result).toHaveLength(2);
            expect(result).toContain(MetadataKeys.VALIDATE);
            expect(result).toContain(MetadataKeys.TIMEOUT);
        });

        it('should return empty array for property with no metadata', () => {
            const target = {};

            const result = getMetadataKeys(target, 'nonExistentProp');

            expect(result).toEqual([]);
        });
    });

    describe('MetadataKeys constants', () => {
        it('should have all expected metadata key symbols', () => {
            expect(MetadataKeys.ROUTE).toBeDefined();
            expect(MetadataKeys.BEFORE).toBeDefined();
            expect(MetadataKeys.AFTER).toBeDefined();
            expect(MetadataKeys.VALIDATE).toBeDefined();
            expect(MetadataKeys.TIMEOUT).toBeDefined();
            expect(MetadataKeys.AUTH).toBeDefined();
        });

        it('should have unique symbol values', () => {
            const keys = Object.values(MetadataKeys);
            const uniqueKeys = new Set(keys);
            
            expect(uniqueKeys.size).toBe(keys.length);
        });
    });

    describe('Complex metadata scenarios', () => {
        it('should handle multiple metadata types on same target', () => {
            const target = {};
            const routeData: RouteMetadata = { method: 'POST', path: '/users' };
            const authData: AuthMetadata = { required: false };
            const validationData: ValidationMetadata = { requirements: { body: 'User' } };
            const timeoutData: TimeoutMetadata = { timeout: 3000 };

            setMetadata(MetadataKeys.ROUTE, routeData, target);
            setMetadata(MetadataKeys.AUTH, authData, target);
            setMetadata(MetadataKeys.VALIDATE, validationData, target);
            setMetadata(MetadataKeys.TIMEOUT, timeoutData, target);

            expect(getMetadata<RouteMetadata>(MetadataKeys.ROUTE, target)).toEqual(routeData);
            expect(getMetadata<AuthMetadata>(MetadataKeys.AUTH, target)).toEqual(authData);
            expect(getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, target)).toEqual(validationData);
            expect(getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, target)).toEqual(timeoutData);

            expect(hasMetadata(MetadataKeys.ROUTE, target)).toBe(true);
            expect(hasMetadata(MetadataKeys.AUTH, target)).toBe(true);
            expect(hasMetadata(MetadataKeys.VALIDATE, target)).toBe(true);
            expect(hasMetadata(MetadataKeys.TIMEOUT, target)).toBe(true);

            const keys = getMetadataKeys(target);
            expect(keys).toHaveLength(4);
        });

        it('should handle metadata on both target and properties', () => {
            const target = {};
            const targetData = { global: 'metadata' };
            const prop1Data = { prop1: 'metadata' };
            const prop2Data = { prop2: 'metadata' };

            setMetadata(MetadataKeys.ROUTE, targetData, target);
            setMetadata(MetadataKeys.AUTH, prop1Data, target, 'prop1');
            setMetadata(MetadataKeys.VALIDATE, prop2Data, target, 'prop2');

            expect(getMetadata(MetadataKeys.ROUTE, target)).toEqual(targetData);
            expect(getMetadata(MetadataKeys.AUTH, target, 'prop1')).toEqual(prop1Data);
            expect(getMetadata(MetadataKeys.VALIDATE, target, 'prop2')).toEqual(prop2Data);

            expect(getMetadataKeys(target)).toHaveLength(1);
            expect(getMetadataKeys(target, 'prop1')).toHaveLength(1);
            expect(getMetadataKeys(target, 'prop2')).toHaveLength(1);
        });
    });
});