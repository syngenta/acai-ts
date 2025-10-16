/**
 * Validator for request/response validation using OpenAPI and JSON Schema
 */

import {IValidator, IRequest, IResponse, ValidationRequirements, IRouterConfig, CacheMode} from '../types';
import {Schema} from './schema';
import {ApiError} from '../apigateway/error';

/**
 * Validation pairing configuration
 */
interface ValidationPairing {
    source: string;
    method: string;
    code: number;
}

/**
 * Validation error from schema
 */
interface SchemaError {
    instancePath?: string;
    message?: string;
    path?: string;
}

/**
 * Record with body property for validation
 */
interface ValidatableRecord {
    body: unknown;
}

/**
 * Request with route property
 */
interface RequestWithRoute extends IRequest {
    route: string;
    queryParams: Record<string, string>;
    pathParams: Record<string, string>;
}

/**
 * Response with content type
 */
interface ResponseWithContent extends IResponse {
    contentType: string;
    rawBody: unknown;
}

/**
 * Validator class for handling request and response validation
 */
export class Validator implements IValidator {
    private schema: Schema;
    private validationError: boolean;
    private pairings: Record<string, ValidationPairing>;

    /**
     * Create a new Validator instance
     * @param schema - Schema instance for validation
     * @param validationError - Whether to throw validation errors
     */
    constructor(schema: Schema, validationError = true) {
        this.schema = schema;
        this.validationError = validationError;
        this.pairings = {
            requiredHeaders: {source: 'headers', method: 'validateRequiredFields', code: 400},
            availableHeaders: {source: 'headers', method: 'validateAvailableFields', code: 400},
            requiredQuery: {source: 'queryParams', method: 'validateRequiredFields', code: 400},
            availableQuery: {source: 'queryParams', method: 'validateAvailableFields', code: 400},
            requiredBody: {source: 'body', method: 'validateApigatewayBody', code: 400}
        };
    }

    /**
     * Validate router configuration
     * @param config - Router configuration to validate
     */
    validateRouterConfigs(config: IRouterConfig): void {
        const {routesPath, cache} = config;

        // Validate cache configuration
        if (cache !== undefined) {
            const validCacheModes: CacheMode[] = ['all', 'dynamic', 'static', 'none'];
            if (!validCacheModes.includes(cache)) {
                throw new ApiError(500, 'router-config', 'cache must be either: all, dynamic, static, none');
            }
        }

        // Validate routesPath is provided
        if (!routesPath) {
            throw new ApiError(500, 'router-config', 'routesPath config is required');
        }
    }

    /**
     * Validate request with OpenAPI schema
     * @param request - Request to validate
     * @param response - Response to populate with errors
     */
    async validateWithOpenAPI(request: IRequest, response: IResponse): Promise<void> {
        const requestWithRoute = request as RequestWithRoute;
        const translatedRequest = {
            headers: request.headers,
            queryParameters: requestWithRoute.queryParams,
            pathParameters: requestWithRoute.pathParams,
            body: request.body
        };
        const route = this.getRequestRoute(requestWithRoute);
        const errors = (await this.schema.validateOpenApi(route, request.method, translatedRequest)) as SchemaError[];
        this.translateOpenAPIErrors(errors, response);
    }

    /**
     * Validate request with requirements object
     * @param request - Request to validate
     * @param response - Response to populate with errors
     * @param requirements - Validation requirements
     */
    async validateWithRequirements(request: IRequest, response: IResponse, requirements: ValidationRequirements): Promise<void> {
        const requestWithRoute = request as RequestWithRoute;

        for (const pairing of Object.keys(this.pairings)) {
            const requirement = requirements[pairing as keyof ValidationRequirements];
            const pairingConfig = this.pairings[pairing];
            const source = pairingConfig.source;
            const code = pairingConfig.code;
            const part = (requestWithRoute as unknown as Record<string, unknown>)[source];

            if (requirement) {
                const methodName = pairingConfig.method as keyof this;
                const method = this[methodName] as (
                    response: IResponse,
                    requirement: unknown,
                    part: unknown,
                    source: string,
                    code: number
                ) => Promise<void> | void;
                await method.call(this, response, requirement, part as Record<string, unknown>, source, code);
            }
        }
    }

    /**
     * Validate record with schema
     * @param entityName - Schema entity name
     * @param record - Record to validate
     * @returns True if valid, false otherwise
     */
    async validateWithRequirementsRecord(entityName = '', record: ValidatableRecord): Promise<boolean> {
        const errors = (await this.schema.validate(entityName, record.body)) as SchemaError[] | null | undefined;
        if (errors && errors.length > 0) {
            const throwables: {path: string; message?: string}[] = [];
            errors.forEach((error) => {
                const path = error.instancePath ? error.instancePath : 'root';
                throwables.push({path, message: error.message});
            });
            if (this.validationError) {
                throw new Error(JSON.stringify(throwables));
            }
            return false;
        }
        return true;
    }

    /**
     * Validate response with OpenAPI schema
     * @param request - Request object
     * @param response - Response to validate
     */
    async validateResponsewithOpenAPI(request: IRequest, response: IResponse): Promise<void> {
        const requestWithRoute = request as RequestWithRoute;
        const responseWithContent = response as ResponseWithContent;
        const route = this.getRequestRoute(requestWithRoute);
        const errors = (await this.schema.validateOpenApiResponse(route, request, responseWithContent)) as SchemaError[] | null | undefined;
        this.translateResponseErrors(errors, response);
    }

    /**
     * Validate response with requirements
     * @param response - Response to validate
     * @param requirements - Validation requirements
     */
    async validateResponse(response: IResponse, requirements: ValidationRequirements): Promise<void> {
        const responseWithContent = response as ResponseWithContent;
        if (requirements?.response) {
            const errors = (await this.schema.validate(requirements.response, responseWithContent.rawBody)) as
                | SchemaError[]
                | null
                | undefined;
            this.translateResponseErrors(errors, response);
        }
    }

    /**
     * Get request route with leading slash
     * @param request - Request with route
     * @returns Route with leading slash
     */
    private getRequestRoute(request: RequestWithRoute): string {
        return !request.route.startsWith('/') ? `/${request.route}` : request.route;
    }

    /**
     * Validate that all available fields are in the allowed list
     * @param response - Response to populate with errors
     * @param available - Array of available field names
     * @param sent - Object with sent fields
     * @param source - Source name (headers, query, etc.)
     * @param code - HTTP status code for errors
     */
    // @ts-ignore - Method called dynamically via string key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    private validateAvailableFields(response: IResponse, available: any, sent: any, source: string, code: number): void {
        Object.keys(sent).forEach((field: string) => {
            if (!available.includes(field)) {
                response.code = code;
                response.setError(source, `${field} is not an available ${source}`);
            }
        });
    }

    /**
     * Validate that all required fields are present
     * @param response - Response to populate with errors
     * @param required - Array of required field names
     * @param sent - Object with sent fields
     * @param source - Source name (headers, query, etc.)
     * @param code - HTTP status code for errors
     */
    // @ts-ignore - Method called dynamically via string key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    private validateRequiredFields(response: IResponse, required: any, sent: any, source: string, code: number): void {
        required.forEach((field: string) => {
            if (sent[field] === undefined) {
                response.code = code;
                response.setError(source, `Please provide ${field} for ${source}`);
            }
        });
    }

    /**
     * Validate API Gateway request body with schema
     * @param response - Response to populate with errors
     * @param requirement - Schema requirement
     * @param sent - Sent body data
     * @param _ - Unused source parameter
     * @param code - HTTP status code for errors
     */
    // @ts-ignore - Method called dynamically via string key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    private async validateApigatewayBody(response: IResponse, requirement: any, sent: unknown, _: string, code: number): Promise<void> {
        const errors = (await this.schema.validate(requirement, sent)) as SchemaError[] | null | undefined;
        if (errors && errors.length > 0) {
            response.code = code;
            errors.forEach((error) => {
                const key = error.instancePath ? error.instancePath : 'root';
                response.setError(key, error.message || 'Validation error');
            });
        }
    }

    /**
     * Translate OpenAPI validation errors to response errors
     * @param errors - Array of OpenAPI errors
     * @param response - Response to populate with errors
     */
    private translateOpenAPIErrors(errors: SchemaError[], response: IResponse): void {
        if (errors && errors.length > 0) {
            response.code = 400;
            errors.forEach((error) => {
                if (error.path) {
                    const key = error.path.split('.')[1] || error.path;
                    const value = error.message || 'Validation error';
                    response.setError(key, value);
                }
            });
        }
    }

    /**
     * Translate response validation errors
     * @param errors - Array of validation errors
     * @param response - Response to populate with errors
     */
    private translateResponseErrors(errors: SchemaError[] | null | undefined, response: IResponse): void {
        if (errors && errors.length > 0) {
            response.code = 422;
            errors.forEach((error) => {
                const path = error.instancePath ? error.instancePath : 'root';
                response.setError(path.replace(/\//g, '.'), error.message || 'Validation error');
            });
        }
    }
}
