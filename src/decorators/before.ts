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
 * @Before(validateToken)
 * @Before(checkPermissions)
 * @Route('GET', '/users')
 * export const getUsers = async (request: IRequest, response: IResponse) => {
 *   // Handler logic
 * };
 * ```
 *
 * @param middleware - Middleware function to execute before the handler
 */
export function Before(...middlewares: BeforeMiddleware[]): <T extends Function>(target: T) => T {
    return function <T extends Function>(target: T): T {
        const existingMiddlewares = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, target as object) || [];

        // Prepend new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.BEFORE, allMiddlewares, target as object);
        return target;
    };
}
