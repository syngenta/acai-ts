/**
 * Endpoint types and interfaces
 */

import {ValidationRequirements} from './router';
import {BeforeMiddleware, AfterMiddleware} from './middleware';

/**
 * Endpoint configuration
 */
export interface IEndpointConfig {
    /**
     * Endpoint handler function
     */
    handler: EndpointHandler;

    /**
     * Validation requirements
     */
    requirements?: ValidationRequirements;

    /**
     * Before middleware
     */
    before?: BeforeMiddleware;

    /**
     * After middleware
     */
    after?: AfterMiddleware;

    /**
     * Timeout in milliseconds
     */
    timeout?: number;

    /**
     * Requires authentication
     */
    auth?: boolean;
}

/**
 * Endpoint handler function
 */
export type EndpointHandler = (request: unknown, response: unknown) => Promise<void> | void;

/**
 * Endpoint interface
 */
export interface IEndpoint {
    /**
     * Validation requirements
     */
    readonly requirements: ValidationRequirements | undefined;

    /**
     * Has validation requirements
     */
    readonly hasRequirements: boolean;

    /**
     * Has before middleware
     */
    readonly hasBefore: boolean;

    /**
     * Has after middleware
     */
    readonly hasAfter: boolean;

    /**
     * Has authentication requirement
     */
    readonly hasAuth: boolean;

    /**
     * Has timeout configuration
     */
    readonly hasTimeout: boolean;

    /**
     * Timeout value
     */
    readonly timeout: number | undefined;

    /**
     * Before middleware
     */
    readonly before: BeforeMiddleware | undefined;

    /**
     * After middleware
     */
    readonly after: AfterMiddleware | undefined;

    /**
     * Run the endpoint handler
     */
    run(request: unknown, response: unknown): Promise<void>;
}
