/**
 * Timeout error for request timeouts
 */

import {ApiError} from './api-error';

/**
 * ApiTimeout class for request timeout errors
 */
export class ApiTimeout extends ApiError {
    /**
     * Create a new ApiTimeout error
     * @param key - Error key/identifier
     * @param message - Error message
     */
    constructor(key = 'unknown', message = 'request timeout') {
        super(408, key, message);
        this.name = 'ApiTimeout';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiTimeout);
        }
    }
}
