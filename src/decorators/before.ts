/**
 * @Before decorator for adding pre-execution middleware
 */

import {BeforeMiddleware} from '../types';
import {MetadataKeys, getMetadata, setMetadata} from './metadata';

/**
 * Before decorator for adding middleware that runs before the endpoint handler
 *
 * @example
 * ```typescript
 * import { Endpoint, Request, Response, Before } from 'acai-ts';
 *
 * export class UsersEndpoint extends Endpoint {
 *     @Before(validateToken)
 *     @Before(checkPermissions)
 *     async get(request: Request, response: Response): Promise<Response> {
 *         // Handler logic
 *         return response;
 *     }
 * }
 * ```
 *
 * @param middlewares - Middleware functions to execute before the handler
 */
export function Before(...middlewares: BeforeMiddleware[]): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor): void {
        const existingMiddlewares = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, target, propertyKey) || [];

        // Append new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.BEFORE, allMiddlewares, target, propertyKey);
    };
}
