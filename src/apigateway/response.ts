/**
 * Response builder for API Gateway responses
 */

import * as zlib from 'zlib';
import {APIGatewayProxyResult} from 'aws-lambda';
import {IResponse, ErrorObject, RecordType, HttpStatusCode} from '../types';

/**
 * Response body with errors
 */
interface ResponseBodyWithErrors {
    errors: ErrorObject[];
    [key: string]: unknown;
}

/**
 * Response class for building API Gateway proxy responses
 */
export class Response<TBody = unknown> implements IResponse<TBody> {
    private bodyValue: TBody | ResponseBodyWithErrors | null = null;
    private codeValue: HttpStatusCode = 200;
    private base64Encoded = false;
    private headersValue: RecordType<string> = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    };

    /**
     * Get content type based on body
     */
    get contentType(): string {
        if (this.headers['Content-Type']) {
            return this.headers['Content-Type'];
        }
        if (typeof this.bodyValue === 'object' || Array.isArray(this.bodyValue)) {
            return 'application/json';
        }
        throw new Error('Uncommon Content-Type in response; please explicitly set response.headers[`Content-Type`] in headers');
    }

    /**
     * Get response headers
     */
    get headers(): RecordType<string> {
        return this.headersValue;
    }

    /**
     * Set a response header
     */
    set headers(headerObj: {key: string; value: string}) {
        this.headersValue[headerObj.key] = headerObj.value;
    }

    /**
     * Compress response body with gzip (interface method)
     */
    compress(): void {
        this.base64Encoded = true;
    }

    /**
     * Get HTTP status code (auto-adjusts based on body/errors)
     */
    get code(): HttpStatusCode {
        if (this.codeValue === 200 && !this.bodyValue) {
            return 204;
        }
        if (this.codeValue === 200 && this.hasErrors) {
            return 400;
        }
        return this.codeValue;
    }

    /**
     * Set HTTP status code
     */
    set code(code: HttpStatusCode) {
        this.codeValue = code;
    }

    /**
     * Get HTTP status code (alias for code)
     */
    get statusCode(): HttpStatusCode {
        return this.code;
    }

    /**
     * Set HTTP status code (alias for code)
     */
    set statusCode(code: HttpStatusCode) {
        this.code = code;
    }

    /**
     * Get raw body (unprocessed)
     */
    get rawBody(): TBody | ResponseBodyWithErrors | null {
        return this.bodyValue;
    }

    /**
     * Get processed body (stringified/compressed)
     */
    get body(): TBody | string {
        try {
            if (this.base64Encoded) {
                return this.compressBody();
            }
            return JSON.stringify(this.bodyValue) as TBody;
        } catch (error) {
            console.error(error);
            return this.bodyValue as TBody;
        }
    }

    /**
     * Set response body
     */
    set body(body: TBody) {
        this.bodyValue = body as TBody | ResponseBodyWithErrors;
    }

    /**
     * Get final API Gateway response
     */
    get response(): APIGatewayProxyResult {
        return {
            isBase64Encoded: this.base64Encoded,
            headers: this.headers,
            statusCode: this.code,
            body: this.body as string
        };
    }

    /**
     * Check if response has errors
     */
    get hasErrors(): boolean {
        if (typeof this.bodyValue === 'object' && this.bodyValue) {
            return 'errors' in this.bodyValue;
        }
        return false;
    }

    /**
     * Get all errors
     */
    get errors(): ErrorObject[] {
        if (this.hasErrors && this.bodyValue && typeof this.bodyValue === 'object' && 'errors' in this.bodyValue) {
            return this.bodyValue.errors;
        }
        return [];
    }

    /**
     * Set an error in the response
     * @param keyPath - Error key/path
     * @param message - Error message
     */
    setError(keyPath: string, message: string): void {
        const error: ErrorObject = {key: keyPath, message};
        if (this.hasErrors && this.bodyValue && typeof this.bodyValue === 'object') {
            (this.bodyValue as ResponseBodyWithErrors).errors.push(error);
        } else {
            this.bodyValue = {errors: [error]} as ResponseBodyWithErrors;
        }
    }

    /**
     * Set multiple errors in the response
     * @param errors - Array of error objects
     */
    setErrors(errors: ErrorObject[]): void {
        if (this.hasErrors && this.bodyValue && typeof this.bodyValue === 'object') {
            (this.bodyValue as ResponseBodyWithErrors).errors.push(...errors);
        } else {
            this.bodyValue = {errors: [...errors]} as ResponseBodyWithErrors;
        }
    }

    /**
     * Set a header in the response
     * @param key - Header key
     * @param value - Header value
     */
    setHeader(key: string, value: string): void {
        this.headersValue[key] = value;
    }

    /**
     * Set multiple headers in the response
     * @param headers - Headers object
     */
    setHeaders(headers: RecordType<string>): void {
        Object.assign(this.headersValue, headers);
    }

    /**
     * Add a property to the response body
     * @param key - Property key
     * @param value - Property value
     */
    addBodyProperty(key: string, value: unknown): void {
        if (this.bodyValue && typeof this.bodyValue === 'object' && !this.hasErrors) {
            (this.bodyValue as Record<string, unknown>)[key] = value;
        }
    }

    /**
     * Add multiple properties to the response body
     * @param properties - Properties object
     */
    addBodyProperties(properties: Record<string, unknown>): void {
        if (this.bodyValue && typeof this.bodyValue === 'object' && !this.hasErrors) {
            Object.assign(this.bodyValue as Record<string, unknown>, properties);
        }
    }

    /**
     * Compress response body with gzip (internal method)
     */
    private compressBody(): string {
        const zipped = zlib.gzipSync(JSON.stringify(this.rawBody));
        this.setHeader('Content-Encoding', 'gzip');
        return zipped.toString('base64');
    }
}
