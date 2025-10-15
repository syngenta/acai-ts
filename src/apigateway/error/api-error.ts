/**
 * Custom API error with HTTP status code
 */

import {HttpStatusCode} from '../../types';

/**
 * ApiError class for HTTP errors with status codes
 */
export class ApiError extends Error {
    public readonly code: HttpStatusCode;
    public readonly key: string;

    /**
     * Create a new ApiError
     * @param code - HTTP status code
     * @param key - Error key/identifier
     * @param message - Error message
     */
    constructor(code: HttpStatusCode = 500, key = 'unknown', message = 'something went wrong') {
        super(message);
        this.code = code;
        this.key = key;
        this.name = 'ApiError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}
