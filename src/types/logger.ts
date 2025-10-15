/**
 * Logger types and interfaces
 */

import {LogLevel} from './common';

/**
 * Log entry structure
 */
export interface LogEntry {
    level: LogLevel | string;
    time: string;
    log: unknown;
}

/**
 * Logger callback function
 */
export type LogCallback = (log: LogEntry) => void;

/**
 * Logger configuration
 */
export interface ILoggerConfig {
    /**
     * Callback function for custom log handling
     */
    callback?: LogCallback;

    /**
     * Minimum log level to output
     */
    minLevel?: LogLevel | string;
}

/**
 * Logger interface
 */
export interface ILogger {
    /**
     * Set up global logger
     */
    setUp(): void;

    /**
     * Log a message with specified level
     */
    log(log: {level: string; log: unknown}): void;

    /**
     * Log info message
     */
    info(log: unknown): void;

    /**
     * Log debug message
     */
    debug(log: unknown): void;

    /**
     * Log warning message
     */
    warn(log: unknown): void;

    /**
     * Log error message
     */
    error(log: unknown): void;
}
