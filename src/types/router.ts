/**
 * Router types and interfaces
 */

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {CacheMode, RoutingMode} from './common';
import {BeforeMiddleware, AfterMiddleware, AuthMiddleware, ErrorMiddleware, TimeoutMiddleware} from './middleware';

/**
 * Logger callback function
 */
export type LoggerCallback = (log: {level: string; time: string; log: unknown}) => void;

/**
 * Router configuration
 */
export interface IRouterConfig {
    /**
     * Routing mode: pattern, directory, or list
     */
    mode?: RoutingMode;

    /**
     * Base path to strip from incoming requests (e.g., '/api' or '/acai-example')
     * Useful when deploying with API Gateway custom domains or service prefixes
     */
    basePath?: string;

    /**
     * Path to OpenAPI schema file
     */
    schemaPath?: string;

    /**
     * Path to route handlers directory or glob pattern
     * - For 'directory' mode: Path to handlers directory (e.g., 'src/handlers')
     * - For 'pattern' mode: Glob pattern to match handler files (e.g., 'src/handlers' + '**' + '/*.ts')
     * - Not used for 'list' mode (use 'routes' instead)
     */
    routesPath?: string;

    /**
     * List of route configurations (for list mode)
     */
    routes?: RouteConfig[];

    /**
     * Cache mode for route resolution
     */
    cache?: CacheMode;

    /**
     * Enable automatic validation with OpenAPI schema
     */
    autoValidate?: boolean;

    /**
     * Validate response against schema
     */
    validateResponse?: boolean;

    /**
     * Global timeout in milliseconds
     */
    timeout?: number;

    /**
     * Output detailed error messages
     */
    outputError?: boolean;

    /**
     * Enable global logger
     */
    globalLogger?: boolean;

    /**
     * Logger callback function
     */
    loggerCallback?: LoggerCallback;

    /**
     * Before all middleware
     */
    beforeAll?: BeforeMiddleware;

    /**
     * After all middleware
     */
    afterAll?: AfterMiddleware;

    /**
     * Authentication middleware
     */
    withAuth?: AuthMiddleware;

    /**
     * Error handler
     */
    onError?: ErrorMiddleware;

    /**
     * Timeout handler
     */
    onTimeout?: TimeoutMiddleware;
}

/**
 * Route configuration for list mode
 */
export interface RouteConfig {
    /**
     * Route path pattern
     */
    path: string;

    /**
     * HTTP method
     */
    method: string;

    /**
     * Handler file path or handler function
     */
    handler: string | RouteHandler;

    /**
     * Validation requirements
     */
    requirements?: ValidationRequirements;

    /**
     * Route-specific timeout
     */
    timeout?: number;

    /**
     * Requires authentication
     */
    auth?: boolean;
}

/**
 * Route handler function
 */
export type RouteHandler = (request: unknown, response: unknown) => Promise<void> | void;

/**
 * Validation requirements
 */
export interface ValidationRequirements {
    /**
     * Required headers
     */
    headers?: Record<string, unknown>;

    /**
     * Required query parameters
     */
    query?: Record<string, unknown>;

    /**
     * Required path parameters
     */
    path?: Record<string, unknown>;

    /**
     * Required body schema
     */
    body?: Record<string, unknown>;

    /**
     * Response schema
     */
    response?: Record<string, unknown>;

    /**
     * Requires authentication
     */
    auth?: boolean;

    /**
     * Legacy: Required headers (array format)
     */
    requiredHeaders?: string[];

    /**
     * Legacy: Available headers (array format)
     */
    availableHeaders?: string[];

    /**
     * Legacy: Required query parameters (array format)
     */
    requiredQuery?: string[];

    /**
     * Legacy: Available query parameters (array format)
     */
    availableQuery?: string[];

    /**
     * Legacy: Required body schema name
     */
    requiredBody?: string;
}

/**
 * Router interface
 */
export interface IRouter {
    /**
     * Auto-load routes and schema
     */
    autoLoad(): void;

    /**
     * Route an API Gateway event
     */
    route(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
}
