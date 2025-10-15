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
 * class UserHandler {
 *   @Before(validateToken)
 *   @Before(checkPermissions)
 *   @Route('GET', '/users')
 *   async getUsers(request: IRequest, response: IResponse) {
 *     // Handler logic
 *   }
 * }
 * ```
 *
 * @param middleware - Middleware function to execute before the handler
 */
export function Before(...middlewares: BeforeMiddleware[]): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        const existingMiddlewares = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, target, propertyKey) || [];

        // Prepend new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.BEFORE, allMiddlewares, target, propertyKey);
    };
}
