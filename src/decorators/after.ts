/**
 * @After decorator for adding post-execution middleware
 */

import {AfterMiddleware} from '../types';
import {MetadataKeys, getMetadata, setMetadata} from './metadata';

/**
 * After decorator for adding middleware that runs after the endpoint handler
 *
 * @example
 * ```typescript
 * class UserHandler {
 *   @After(logResponse)
 *   @After(compressResponse)
 *   @Route('GET', '/users')
 *   async getUsers(request: IRequest, response: IResponse) {
 *     // Handler logic
 *   }
 * }
 * ```
 *
 * @param middleware - Middleware function to execute after the handler
 */
export function After(...middlewares: AfterMiddleware[]): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        const existingMiddlewares = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, target, propertyKey) || [];

        // Append new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.AFTER, allMiddlewares, target, propertyKey);
    };
}
