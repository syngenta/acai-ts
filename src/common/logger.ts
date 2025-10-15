/**
 * Logger utility for structured logging with level filtering
 */

import {ILogger, ILoggerConfig, LogEntry, LogCallback, LogLevel} from '../types';

/**
 * Extend global namespace to include logger
 */
declare global {
    // eslint-disable-next-line no-var
    var logger: Logger | undefined;
}

/**
 * Logger class for handling structured logging with level-based filtering
 */
export class Logger implements ILogger {
    private callback?: LogCallback;
    private minLevel: string;
    private logLevels: Record<string, number> = {
        INFO: 1,
        DEBUG: 1,
        WARN: 2,
        ERROR: 3,
        OFF: 4
    };

    /**
     * Create a new Logger instance
     * @param config - Logger configuration
     */
    constructor(config: ILoggerConfig = {}) {
        this.callback = config.callback;
        this.minLevel = process.env.MIN_LOG_LEVEL || config.minLevel || 'INFO';
    }

    /**
     * Set up a global logger instance
     * @param setup - Whether to set up the global logger
     * @param config - Logger configuration
     */
    static setUpGlobal(setup = true, config: ILoggerConfig = {}): void {
        if (!global.logger && setup) {
            new Logger(config).setUp();
        }
    }

    /**
     * Set this logger instance as the global logger
     */
    setUp(): void {
        global.logger = this;
    }

    /**
     * Log a message with specified level
     * @param log - Log entry with level and log data, or any value
     */
    log(log: unknown, ...args: unknown[]): void {
        if (typeof log === 'object' && log !== null && 'level' in log && 'log' in log) {
            const logObj = log as {level: string; log: unknown};
            const complete = this.getLog(logObj.level, logObj.log);
            this.invokeConsoleMethod(complete);
            this.invokeCallback(complete);
        } else {
            const complete = this.getLog('INFO', args.length > 0 ? [log, ...args] : log);
            this.invokeConsoleMethod(complete);
            this.invokeCallback(complete);
        }
    }

    /**
     * Log an info message
     * @param log - Log data
     */
    info(log: unknown): void {
        this.log({level: LogLevel.INFO, log});
    }

    /**
     * Log a debug message
     * @param log - Log data
     */
    debug(log: unknown): void {
        this.log({level: LogLevel.DEBUG, log});
    }

    /**
     * Log a warning message
     * @param log - Log data
     */
    warn(log: unknown): void {
        this.log({level: LogLevel.WARN, log});
    }

    /**
     * Log an error message
     * @param log - Log data
     */
    error(log: unknown): void {
        this.log({level: LogLevel.ERROR, log});
    }

    /**
     * Get a complete log entry with timestamp
     * @param level - Log level
     * @param log - Log data
     * @returns Complete log entry
     */
    private getLog(level = 'INFO', log: unknown = {}): LogEntry {
        return {
            level,
            time: new Date().toISOString(),
            log
        };
    }

    /**
     * Check if a log should be output based on level
     * @param level - Log level to check
     * @returns True if log should be output
     */
    private shouldLog(level: string): boolean {
        try {
            if (!(level in this.logLevels)) {
                throw new Error(`log level must be one of 4: INFO, DEBUG, WARN, ERROR | provided: ${level}`);
            }
            if (!(this.minLevel in this.logLevels)) {
                throw new Error(`MIN_LOG_LEVEL must be one of 4: INFO, DEBUG, WARN, ERROR, OFF | provided: ${this.minLevel};`);
            }
            const logLevel = isNaN(Number(level)) ? this.logLevels[level] : Number(level);
            const systemLevel = isNaN(Number(this.minLevel)) ? this.logLevels[this.minLevel] : Number(this.minLevel);
            return logLevel >= parseInt(String(systemLevel), 10);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
            return true;
        }
    }

    /**
     * Output log to console
     * @param log - Log entry to output
     */
    private invokeConsoleMethod(log: LogEntry): void {
        if (this.shouldLog(log.level)) {
            console.log(JSON.stringify(log, null, 4));
        }
    }

    /**
     * Invoke callback with log entry
     * @param log - Log entry
     */
    private invokeCallback(log: LogEntry): void {
        if (this.callback && typeof this.callback === 'function') {
            try {
                this.callback(log);
            } catch (error) {
                if (error instanceof Error) {
                    console.log(`error with call back: ${error.message}`);
                }
            }
        }
    }
}
