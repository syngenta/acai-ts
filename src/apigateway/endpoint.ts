/**
 * Endpoint wrapper for handler execution
 */

import {IEndpoint, ValidationRequirements, BeforeMiddleware, AfterMiddleware, DataClassConstructor} from '../types';
import {Request} from './request';
import {Response} from './response';
import {MetadataKeys, getMetadata, TimeoutMetadata, AuthMetadata} from '../decorators/metadata';

/**
 * Method requirements structure
 */
interface MethodRequirements extends ValidationRequirements {
    requiredAuth?: boolean;
    before?: BeforeMiddleware;
    after?: AfterMiddleware;
    timeout?: number;
    dataClass?: DataClassConstructor<unknown>;
}

/**
 * Endpoint module structure
 */
export interface EndpointModule {
    [method: string]: ((...args: unknown[]) => Promise<unknown> | unknown) | {[method: string]: MethodRequirements} | undefined;
}

/**
 * Endpoint class wrapping handler methods with requirements
 */
export class Endpoint implements IEndpoint {
    private endpointModule: EndpointModule;
    private methodName: string;

    /**
     * Create a new Endpoint wrapper
     * @param endpoint - Endpoint module with handler methods
     * @param method - HTTP method name
     */
    constructor(endpoint: EndpointModule, method: string) {
        this.endpointModule = endpoint;
        this.methodName = method.toLowerCase();
    }

    /**
     * Check if endpoint has requirements
     */
    get hasRequirements(): boolean {
        return Boolean(this.requirements);
    }

    /**
     * Get requirements for this method
     */
    get requirements(): ValidationRequirements | undefined {
        const reqs = (this.endpointModule as unknown as {requirements?: {[key: string]: MethodRequirements}}).requirements;
        if (reqs) {
            return reqs[this.methodName];
        }
        return undefined;
    }

    /**
     * Check if endpoint requires authentication (from requirements or decorators)
     */
    get hasAuth(): boolean {
        // Check requirements first
        const reqs = this.requirements as {requiredAuth?: boolean} | undefined;
        if (reqs?.requiredAuth) {
            return true;
        }

        // Check decorator metadata
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const authMetadata = getMetadata<AuthMetadata>(MetadataKeys.AUTH, methodFunction);
            return Boolean(authMetadata?.required);
        }

        return false;
    }

    /**
     * Check if endpoint has before middleware (from requirements or decorators)
     */
    get hasBefore(): boolean {
        // Check requirements first
        const reqs = this.requirements as {before?: BeforeMiddleware} | undefined;
        if (reqs && typeof reqs.before === 'function') {
            return true;
        }

        // Check decorator metadata
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const decoratorMiddlewares = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, methodFunction);
            return Boolean(decoratorMiddlewares && decoratorMiddlewares.length > 0);
        }

        return false;
    }

    /**
     * Execute before middleware (from requirements or decorators)
     * @param request - Request object
     * @param response - Response object
     */
    async before(request: unknown, response: unknown): Promise<void> {
        // Execute requirements-based middleware first
        const reqs = this.requirements as {before?: BeforeMiddleware} | undefined;
        if (reqs?.before) {
            await reqs.before(request as Request, response as Response, this.requirements);
        }

        // Execute decorator-based middleware
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const decoratorMiddlewares = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, methodFunction);
            if (decoratorMiddlewares && decoratorMiddlewares.length > 0) {
                for (const middleware of decoratorMiddlewares) {
                    await middleware(request as Request, response as Response, this.requirements);
                }
            }
        }
    }

    /**
     * Check if endpoint has after middleware (from requirements or decorators)
     */
    get hasAfter(): boolean {
        // Check requirements first
        const reqs = this.requirements as {after?: AfterMiddleware} | undefined;
        if (reqs && typeof reqs.after === 'function') {
            return true;
        }

        // Check decorator metadata
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const decoratorMiddlewares = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, methodFunction);
            return Boolean(decoratorMiddlewares && decoratorMiddlewares.length > 0);
        }

        return false;
    }

    /**
     * Check if endpoint has timeout configuration (from requirements or decorators)
     */
    get hasTimeout(): boolean {
        // Check requirements first
        const reqs = this.requirements as {timeout?: number} | undefined;
        if (reqs && Number.isInteger(reqs.timeout)) {
            return true;
        }

        // Check decorator metadata
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const timeoutMetadata = getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, methodFunction);
            return Boolean(timeoutMetadata && Number.isInteger(timeoutMetadata.timeout));
        }

        return false;
    }

    /**
     * Get timeout value (from requirements or decorators)
     */
    get timeout(): number | undefined {
        // Check requirements first
        const reqs = this.requirements as {timeout?: number} | undefined;
        if (reqs?.timeout) {
            return reqs.timeout;
        }

        // Check decorator metadata
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const timeoutMetadata = getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, methodFunction);
            return timeoutMetadata?.timeout;
        }

        return undefined;
    }

    /**
     * Get handler method
     */
    get method(): (...args: unknown[]) => Promise<unknown> | unknown {
        return this.endpointModule[this.methodName] as (...args: unknown[]) => Promise<unknown> | unknown;
    }

    /**
     * Get HTTP method name
     */
    get httpMethod(): string {
        return this.methodName;
    }

    /**
     * Execute after middleware (from requirements or decorators)
     * @param request - Request object
     * @param response - Response object
     */
    async after(request: unknown, response: unknown): Promise<void> {
        // Execute requirements-based middleware first
        const reqs = this.requirements as {after?: AfterMiddleware} | undefined;
        if (reqs?.after) {
            await reqs.after(request as Request, response as Response, this.requirements);
        }

        // Execute decorator-based middleware
        const methodFunction = this.endpointModule[this.methodName] as Function;
        if (methodFunction) {
            const decoratorMiddlewares = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, methodFunction);
            if (decoratorMiddlewares && decoratorMiddlewares.length > 0) {
                for (const middleware of decoratorMiddlewares) {
                    await middleware(request as Request, response as Response, this.requirements);
                }
            }
        }
    }

    /**
     * Check if endpoint has data class transformation
     */
    get hasDataClass(): boolean {
        const reqs = this.requirements as {dataClass?: DataClassConstructor<unknown>} | undefined;
        return Boolean(reqs?.dataClass);
    }

    /**
     * Transform request with data class
     * @param request - Request object
     * @returns Data class instance
     */
    dataClass(request: unknown): unknown {
        const reqs = this.requirements as {dataClass?: DataClassConstructor<unknown>} | undefined;
        if (reqs?.dataClass) {
            return new reqs.dataClass(request);
        }
        return request;
    }

    /**
     * Run the endpoint handler
     * @param request - Request object
     * @param response - Response object
     */
    async run(request: unknown, response: unknown): Promise<void> {
        if (this.hasDataClass) {
            const input = this.dataClass(request);
            await this.method(input, response);
        } else {
            await this.method(request, response);
        }
    }
}
