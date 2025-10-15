/**
 * Request wrapper for API Gateway events
 */

import {APIGatewayProxyEvent} from 'aws-lambda';
import {Parser} from 'xml2js';
import {IRequest, RecordType} from '../types';

/**
 * Body parser mapping
 */
type BodyParser = 'json' | 'xml' | 'raw';

/**
 * Request class wrapping API Gateway proxy events
 */
export class Request<TBody = unknown> implements IRequest<TBody> {
    private parsedEvent: APIGatewayProxyEvent;
    private contextValue: unknown = null;
    private pathParameters: RecordType<string> = {};
    private routeValue: string;
    private xmlParser: Parser;

    /**
     * Create a new Request wrapper
     * @param event - API Gateway proxy event
     */
    constructor(event: APIGatewayProxyEvent) {
        this.parsedEvent = event;
        this.routeValue = event.path;
        this.xmlParser = new Parser({explicitArray: false});
    }

    /**
     * Get HTTP method (lowercase)
     */
    get method(): string {
        return this.parsedEvent.httpMethod.toLowerCase();
    }

    /**
     * Get resource path
     */
    get resource(): string {
        return this.parsedEvent.resource;
    }

    /**
     * Get authorizer data
     */
    get authorizer(): unknown {
        if ((this.parsedEvent as {isOffline?: boolean}).isOffline || process.env.IS_OFFLINE) {
            return this.parsedEvent.headers;
        }
        return this.parsedEvent.requestContext.authorizer;
    }

    /**
     * Get request headers (normalized to lowercase)
     */
    get headers(): RecordType<string> {
        const headers: RecordType<string> = {};
        for (const [header, value] of Object.entries(this.parsedEvent.headers || {})) {
            headers[header.toLowerCase()] = value || '';
        }
        headers['content-type'] = headers['content-type'] ? headers['content-type'] : 'application/json';
        return headers;
    }

    /**
     * Get all parameters (query and path)
     */
    get params(): {query: RecordType<string>; path: RecordType<string>} {
        return {
            query: this.queryParams,
            path: this.pathParams
        };
    }

    /**
     * Get query string parameters
     */
    get queryParams(): RecordType<string> {
        const params = this.parsedEvent.queryStringParameters || {};
        const result: RecordType<string> = {};
        for (const [key, value] of Object.entries(params)) {
            result[key] = value || '';
        }
        return result;
    }

    /**
     * Get path parameters
     */
    get pathParams(): RecordType<string> {
        return this.pathParameters;
    }

    /**
     * Set a path parameter
     */
    set pathParams(params: {key: string; value: string} | RecordType<string>) {
        if ('key' in params && 'value' in params) {
            this.pathParameters[params.key] = params.value;
        } else {
            this.pathParameters = params;
        }
    }

    /**
     * Get route path
     */
    get route(): string {
        return this.routeValue;
    }

    /**
     * Set route path
     */
    set route(route: string) {
        this.routeValue = route;
    }

    /**
     * Get request path
     */
    get path(): string {
        return this.parsedEvent.path;
    }

    /**
     * Get stage variables
     */
    get stage(): RecordType<string> {
        return (this.parsedEvent.stageVariables as RecordType<string>) || {};
    }

    /**
     * Get or set custom context (for user-defined data)
     */
    get context(): unknown {
        return this.contextValue;
    }

    set context(context: unknown) {
        this.contextValue = context;
    }

    /**
     * Get parsed JSON body
     */
    get json(): unknown {
        return JSON.parse(this.parsedEvent.body || '{}');
    }

    /**
     * Get GraphQL body (parsed JSON)
     */
    get graphql(): unknown {
        return this.json;
    }

    /**
     * Get parsed XML body
     */
    get xml(): unknown {
        try {
            let result: unknown;
            this.xmlParser.parseString(this.parsedEvent.body || '', (error, parsed) => {
                if (error) {
                    throw error;
                }
                result = parsed;
            });
            return result;
        } catch (error) {
            console.error(error);
            return this.parsedEvent.body;
        }
    }

    /**
     * Get parsed body based on content-type
     */
    get body(): TBody {
        try {
            const type = this.headers['content-type'].split(';')[0];
            const parser = this.bodyParsers[type] || 'raw';
            return this[parser] as TBody;
        } catch (error) {
            console.error(error);
            return this.parsedEvent.body as TBody;
        }
    }

    /**
     * Get raw body string
     */
    get raw(): string {
        return this.parsedEvent.body || '';
    }

    /**
     * Get original event
     */
    get event(): APIGatewayProxyEvent {
        return this.parsedEvent;
    }

    /**
     * Get request object for backward compatibility
     */
    get request(): {
        method: string;
        resource: string;
        authorizer: unknown;
        headers: RecordType<string>;
        params: {query: RecordType<string>; path: RecordType<string>};
        queryParams: RecordType<string>;
        pathParams: RecordType<string>;
        route: string;
        stage: RecordType<string>;
        context: unknown;
        body: TBody;
    } {
        return {
            method: this.method,
            resource: this.resource,
            authorizer: this.authorizer,
            headers: this.headers,
            params: this.params,
            queryParams: this.queryParams,
            pathParams: this.pathParams,
            route: this.route,
            stage: this.stage,
            context: this.context,
            body: this.body
        };
    }

    /**
     * Body parser mapping
     */
    private get bodyParsers(): Record<string, BodyParser> {
        return {
            'application/json': 'json',
            'application/xml': 'xml',
            'text/xml': 'xml',
            raw: 'raw'
        };
    }
}
