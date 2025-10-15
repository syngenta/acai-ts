/**
 * Endpoint wrapper for handler execution
 */

import {IEndpoint, IRequest, IResponse, ValidationRequirements, BeforeMiddleware, AfterMiddleware, DataClassConstructor} from '../types';

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
     * Check if endpoint requires authentication
     */
    get hasAuth(): boolean {
        const reqs = this.requirements as {requiredAuth?: boolean} | undefined;
        return Boolean(reqs?.requiredAuth);
    }

    /**
     * Check if endpoint has before middleware
     */
    get hasBefore(): boolean {
        const reqs = this.requirements as {before?: BeforeMiddleware} | undefined;
        return Boolean(reqs && typeof reqs.before === 'function');
    }

    /**
     * Execute before middleware
     * @param request - Request object
     * @param response - Response object
     */
    async before(request: unknown, response: unknown): Promise<void> {
        const reqs = this.requirements as {before?: BeforeMiddleware} | undefined;
        if (reqs?.before) {
            await reqs.before(request as IRequest, response as IResponse, this.requirements);
        }
    }

    /**
     * Check if endpoint has after middleware
     */
    get hasAfter(): boolean {
        const reqs = this.requirements as {after?: AfterMiddleware} | undefined;
        return Boolean(reqs && typeof reqs.after === 'function');
    }

    /**
     * Check if endpoint has timeout configuration
     */
    get hasTimeout(): boolean {
        const reqs = this.requirements as {timeout?: number} | undefined;
        return Boolean(reqs && Number.isInteger(reqs.timeout));
    }

    /**
     * Get timeout value
     */
    get timeout(): number | undefined {
        const reqs = this.requirements as {timeout?: number} | undefined;
        return reqs?.timeout;
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
     * Execute after middleware
     * @param request - Request object
     * @param response - Response object
     */
    async after(request: unknown, response: unknown): Promise<void> {
        const reqs = this.requirements as {after?: AfterMiddleware} | undefined;
        if (reqs?.after) {
            await reqs.after(request as IRequest, response as IResponse, this.requirements);
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
