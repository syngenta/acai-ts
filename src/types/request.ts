/**
 * Request types and interfaces
 */

import {APIGatewayProxyEvent} from 'aws-lambda';
import {RecordType} from './common';

/**
 * Parsed request body types
 */
export type RequestBody = unknown;

/**
 * Content type for request parsing
 */
export type ContentType = 'application/json' | 'application/xml' | 'text/csv' | 'application/graphql' | string;

/**
 * Request interface for API Gateway requests
 */
export interface IRequest<TBody = RequestBody> {
    /**
     * Original AWS API Gateway event
     */
    readonly event: APIGatewayProxyEvent;

    /**
     * Parsed request body
     */
    body: TBody;

    /**
     * Request headers
     */
    headers: RecordType<string>;

    /**
     * Query string parameters
     */
    queryParams: RecordType<string>;

    /**
     * Path parameters
     */
    pathParams: RecordType<string>;

    /**
     * HTTP method
     */
    method: string;

    /**
     * Request resource path
     */
    resource: string;

    /**
     * Stage variables
     */
    stage: RecordType<string>;

    /**
     * Custom context (for user-defined data)
     */
    context: unknown;

    /**
     * Raw request object for backward compatibility
     */
    readonly request: {
        body: TBody;
        headers: RecordType<string>;
        queryParams: RecordType<string>;
        pathParams: RecordType<string>;
        method: string;
        resource: string;
        stage: RecordType<string>;
        context: unknown;
    };
}
