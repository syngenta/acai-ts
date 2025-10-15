/**
 * Main API Gateway router
 */

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ApiError, ApiTimeout} from './error';
import {Logger} from '../common/logger';
import {Request} from './request';
import {RouteResolver} from './resolver';
import {Response} from './response';
import {Schema} from '../common/schema';
import {Validator} from '../common/validator';
import {Timer} from '../common/timer';
import {Endpoint, EndpointModule} from './endpoint';
import {IRouter, IRouterConfig, BeforeMiddleware, AfterMiddleware, AuthMiddleware, ErrorMiddleware, TimeoutMiddleware} from '../types';

/**
 * Router class for handling API Gateway requests
 */
export class Router implements IRouter {
    private beforeAll?: BeforeMiddleware;
    private afterAll?: AfterMiddleware;
    private withAuth?: AuthMiddleware;
    private onError?: ErrorMiddleware;
    private onTimeout?: TimeoutMiddleware;
    private timeout?: number;
    private autoValidate?: boolean;
    private outputError?: boolean;
    private validateResponse?: boolean;
    private timer: Timer;
    private schema: Schema;
    private validator: Validator;
    private resolver: RouteResolver;
    private logger: Logger;

    /**
     * Create a new Router
     * @param params - Router configuration
     */
    constructor(params: IRouterConfig) {
        this.beforeAll = params.beforeAll;
        this.afterAll = params.afterAll;
        this.withAuth = params.withAuth;
        this.onError = params.onError;
        this.onTimeout = params.onTimeout;
        this.timeout = params.timeout;
        this.autoValidate = params.autoValidate;
        this.outputError = params.outputError;
        this.validateResponse = params.validateResponse;
        this.timer = new Timer();
        this.schema = new Schema({}, {}, params as Record<string, unknown>);
        this.validator = new Validator(this.schema);
        this.resolver = new RouteResolver(params);
        this.logger = new Logger({callback: params.loggerCallback});
        this.validator.validateRouterConfigs(params);

        if (params.globalLogger) {
            this.logger.setUp();
        }
    }

    /**
     * Auto-load routes and schema
     */
    autoLoad(): void {
        this.resolver.autoLoad();
        this.schema.autoLoad();
    }

    /**
     * Route an API Gateway event
     * @param event - API Gateway proxy event
     * @returns API Gateway proxy result
     */
    async route(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const request = new Request(event);
        const response = new Response();
        try {
            await this.runRoute(request, response);
        } catch (error) {
            await this.handleAllErrors(event, request, response, error as Error);
        }
        return response.response;
    }

    /**
     * Run the route through middleware pipeline
     * @param request - Request object
     * @param response - Response object
     */
    private async runRoute(request: Request, response: Response): Promise<void> {
        const endpointWrapper = this.resolver.getEndpoint(request as unknown as {path: string; method: string}) as {
            endpointModule: EndpointModule;
            method: string;
        };
        const endpoint = new Endpoint(endpointWrapper.endpointModule, endpointWrapper.method);

        if (!response.hasErrors && typeof this.beforeAll === 'function') {
            await this.beforeAll(request, response, endpoint.requirements);
        }
        if (!response.hasErrors && endpoint.hasAuth && typeof this.withAuth === 'function') {
            await this.withAuth(request, response, endpoint.requirements);
        }
        if (!response.hasErrors && this.autoValidate) {
            await this.validator.validateWithOpenAPI(request, response);
        }
        if (!response.hasErrors && !this.autoValidate && endpoint.hasRequirements) {
            await this.validator.validateWithRequirements(request, response, endpoint.requirements!);
        }
        if (!response.hasErrors && endpoint.hasBefore) {
            await endpoint.before(request, response);
        }
        if (!response.hasErrors) {
            await this.runEndpoint(endpoint, request, response);
        }
        if (!response.hasErrors && endpoint.hasAfter) {
            await endpoint.after(request, response);
        }
        if (!response.hasErrors && typeof this.afterAll === 'function') {
            await this.afterAll(request, response, endpoint.requirements);
        }
        if (!response.hasErrors && this.autoValidate && this.validateResponse) {
            await this.validator.validateResponsewithOpenAPI(request, response);
        }
        if (!response.hasErrors && !this.autoValidate && endpoint.hasRequirements && this.validateResponse) {
            await this.validator.validateResponse(response, endpoint.requirements!);
        }
    }

    /**
     * Run the endpoint with optional timeout
     * @param endpoint - Endpoint instance
     * @param request - Request object
     * @param response - Response object
     */
    private async runEndpoint(endpoint: Endpoint, request: Request, response: Response): Promise<void> {
        if (Number.isInteger(this.timeout)) {
            try {
                const timeout = endpoint.hasTimeout ? endpoint.timeout! : this.timeout!;
                const result = await Promise.race([endpoint.run(request, response), this.timer.start(timeout)]);
                this.timer.stop();
                if (result === 'timeout') {
                    throw new ApiTimeout();
                }
            } catch (error) {
                this.logger.log({
                    level: 'ERROR',
                    log: {
                        request: request.request,
                        error: error instanceof Error ? error.message : String(error)
                    }
                });
                throw error;
            }
        } else {
            await endpoint.run(request, response);
        }
    }

    /**
     * Handle all types of errors
     * @param event - Original event
     * @param request - Request object
     * @param response - Response object
     * @param error - Error that occurred
     */
    private async handleAllErrors(event: APIGatewayProxyEvent, request: Request, response: Response, error: Error): Promise<void> {
        if (error instanceof ApiError) {
            response.code = error.code;
            response.setError(error.key, error.message);
        } else if (error instanceof ApiTimeout) {
            await this.handleTimeoutError(request, response, error);
        } else {
            await this.handleInternalServerError(event, request, response, error);
        }
    }

    /**
     * Handle timeout errors
     * @param request - Request object
     * @param response - Response object
     * @param error - Timeout error
     */
    private async handleTimeoutError(request: Request, response: Response, error: ApiTimeout): Promise<void> {
        response.code = error.code;
        response.setError(error.key, error.message);
        if (typeof this.onTimeout === 'function') {
            await this.onTimeout(request, response, error);
        }
    }

    /**
     * Handle internal server errors
     * @param event - Original event
     * @param request - Request object
     * @param response - Response object
     * @param error - Error that occurred
     */
    private async handleInternalServerError(
        event: APIGatewayProxyEvent,
        request: Request,
        response: Response,
        error: Error
    ): Promise<void> {
        response.code = 500;
        response.setError('server', this.outputError ? error.message : 'internal server error');
        this.logError(event, request, error);
        if (typeof this.onError === 'function') {
            await this.onError(request, response, error);
        }
    }

    /**
     * Log error details
     * @param event - Original event
     * @param request - Request object
     * @param error - Error that occurred
     */
    private logError(event: APIGatewayProxyEvent, request: Request, error: Error): void {
        this.logger.log({
            level: 'ERROR',
            log: {
                event,
                request: request.request,
                error: error.message,
                stack: error.stack?.split('\n').map((trace) => trace.replace('    ', '')) || []
            }
        });
    }
}
