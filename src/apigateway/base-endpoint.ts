/**
 * Base class for API Gateway endpoint handlers
 *
 * Users should extend this class and implement HTTP method handlers (get, post, put, patch, delete)
 * Decorators (@Before, @After, @Timeout, @Validate) can be applied to these method handlers
 */

import {Request} from './request';
import {Response} from './response';

/**
 * Base Endpoint class for creating API Gateway handlers
 *
 * @example
 * ```typescript
 * import { BaseEndpoint, Request, Response, Before, After } from 'acai-ts';
 *
 * export class UsersEndpoint extends BaseEndpoint {
 *     @Before(validateToken)
 *     async get(request: Request, response: Response): Promise<Response> {
 *         response.body = { users: [] };
 *         return response;
 *     }
 *
 *     @After(logResponse)
 *     async post(request: Request, response: Response): Promise<Response> {
 *         response.body = { created: true };
 *         return response;
 *     }
 * }
 * ```
 */
export abstract class BaseEndpoint {
    /**
     * Handle GET requests
     * @param request - The request object
     * @param response - The response object
     * @returns The response object
     */
    async get?(request: Request, response: Response): Promise<Response>;

    /**
     * Handle POST requests
     * @param request - The request object
     * @param response - The response object
     * @returns The response object
     */
    async post?(request: Request, response: Response): Promise<Response>;

    /**
     * Handle PUT requests
     * @param request - The request object
     * @param response - The response object
     * @returns The response object
     */
    async put?(request: Request, response: Response): Promise<Response>;

    /**
     * Handle PATCH requests
     * @param request - The request object
     * @param response - The response object
     * @returns The response object
     */
    async patch?(request: Request, response: Response): Promise<Response>;

    /**
     * Handle DELETE requests
     * @param request - The request object
     * @param response - The response object
     * @returns The response object
     */
    async delete?(request: Request, response: Response): Promise<Response>;

    /**
     * Optional lifecycle hook called when the endpoint instance is created
     */
    async onInit?(): Promise<void>;

    /**
     * Optional lifecycle hook called when the endpoint instance is destroyed
     */
    async onDestroy?(): Promise<void>;
}
