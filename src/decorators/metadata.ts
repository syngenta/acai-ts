/**
 * Metadata utilities for decorator system
 */

import 'reflect-metadata';
import {HttpMethod} from '../types';

/**
 * Metadata keys for storing decorator information
 */
export const MetadataKeys = {
    ROUTE: Symbol('route'),
    BEFORE: Symbol('before'),
    AFTER: Symbol('after'),
    VALIDATE: Symbol('validate'),
    TIMEOUT: Symbol('timeout'),
    AUTH: Symbol('auth')
} as const;

/**
 * Route metadata structure
 */
export interface RouteMetadata {
    method: HttpMethod;
    path: string;
}

/**
 * Validation metadata structure
 */
export interface ValidationMetadata {
    requirements: Record<string, unknown>;
}

/**
 * Timeout metadata structure
 */
export interface TimeoutMetadata {
    timeout: number;
}

/**
 * Auth metadata structure
 */
export interface AuthMetadata {
    required: boolean;
}

/**
 * Get metadata from a target
 */
export function getMetadata<T>(key: symbol, target: object, propertyKey?: string | symbol): T | undefined {
    if (propertyKey) {
        return Reflect.getMetadata(key, target, propertyKey) as T | undefined;
    }
    return Reflect.getMetadata(key, target) as T | undefined;
}

/**
 * Set metadata on a target
 */
export function setMetadata<T>(key: symbol, value: T, target: object, propertyKey?: string | symbol): void {
    if (propertyKey) {
        Reflect.defineMetadata(key, value, target, propertyKey);
    } else {
        Reflect.defineMetadata(key, value, target);
    }
}

/**
 * Check if metadata exists
 */
export function hasMetadata(key: symbol, target: object, propertyKey?: string | symbol): boolean {
    if (propertyKey) {
        return Reflect.hasMetadata(key, target, propertyKey);
    }
    return Reflect.hasMetadata(key, target);
}

/**
 * Get all metadata keys
 */
export function getMetadataKeys(target: object, propertyKey?: string | symbol): symbol[] {
    if (propertyKey) {
        return Reflect.getMetadataKeys(target, propertyKey) as symbol[];
    }
    return Reflect.getMetadataKeys(target) as symbol[];
}
