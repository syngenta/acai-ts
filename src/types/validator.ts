/**
 * Validator types and interfaces
 */

import {ValidationRequirements} from './router';
import {IRequest} from './request';
import {IResponse} from './response';

/**
 * JSON Schema type
 */
export type JsonSchema = Record<string, unknown>;

/**
 * Validation error
 */
export interface ValidationError {
    key: string;
    message: string;
}

/**
 * Validator interface
 */
export interface IValidator {
    /**
     * Validate router configuration
     */
    validateRouterConfigs(config: unknown): void;

    /**
     * Validate request with OpenAPI schema
     */
    validateWithOpenAPI(request: IRequest, response: IResponse): Promise<void>;

    /**
     * Validate request with requirements object
     */
    validateWithRequirements(request: IRequest, response: IResponse, requirements: ValidationRequirements): Promise<void>;

    /**
     * Validate response with OpenAPI schema
     */
    validateResponsewithOpenAPI(request: IRequest, response: IResponse): Promise<void>;

    /**
     * Validate response with requirements object
     */
    validateResponse(response: IResponse, requirements: ValidationRequirements): Promise<void>;
}

/**
 * Schema manager interface
 */
export interface ISchema {
    /**
     * Auto-load schema from file
     */
    autoLoad(): void;

    /**
     * Get schema for a specific path and method
     */
    getSchema(path: string, method: string): JsonSchema | undefined;
}
