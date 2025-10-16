/**
 * Common types used throughout the acai-ts library
 */

/**
 * HTTP methods supported by the router
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP status codes
 */
export type HttpStatusCode = number;

/**
 * Log levels for the logger
 */
export enum LogLevel {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    WARN = 'WARN',
    ERROR = 'ERROR',
    OFF = 'OFF'
}

/**
 * Cache modes for route resolution
 */
export type CacheMode = 'all' | 'dynamic' | 'static' | 'none';

/**
 * Operation types for event processing
 */
export type OperationType = 'create' | 'update' | 'delete' | 'all';

/**
 * Generic record type for key-value pairs
 */
export type RecordType<T = string> = Record<string, T>;

/**
 * Require at least one property from T
 */
export type RequireAtLeastOne<T> = {
    [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];
