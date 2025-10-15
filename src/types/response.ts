/**
 * Response types and interfaces
 */

import {APIGatewayProxyResult} from 'aws-lambda';
import {RecordType, HttpStatusCode} from './common';

/**
 * Error object structure
 */
export interface ErrorObject {
    key: string;
    message: string;
}

/**
 * Response body type
 */
export type ResponseBody<T = unknown> = T;

/**
 * Response interface for API Gateway responses
 */
export interface IResponse<TBody = ResponseBody> {
    /**
     * HTTP status code
     */
    code: HttpStatusCode;

    /**
     * Response body (may be stringified)
     */
    body: TBody | string;

    /**
     * Response headers
     */
    headers: RecordType<string>;

    /**
     * Check if response has errors
     */
    readonly hasErrors: boolean;

    /**
     * Get all errors
     */
    readonly errors: ErrorObject[];

    /**
     * Get the final API Gateway response
     */
    readonly response: APIGatewayProxyResult;

    /**
     * Set an error in the response
     */
    setError(key: string, message: string): void;

    /**
     * Set multiple errors in the response
     */
    setErrors(errors: ErrorObject[]): void;

    /**
     * Add a header to the response
     */
    setHeader(key: string, value: string): void;

    /**
     * Add multiple headers to the response
     */
    setHeaders(headers: RecordType<string>): void;

    /**
     * Compress the response body with gzip
     */
    compress(): void;
}
