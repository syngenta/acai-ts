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
 * @After(logResponse)
 * @After(compressResponse)
 * @Route('GET', '/users')
 * export const getUsers = async (request: IRequest, response: IResponse) => {
 *   // Handler logic
 * };
 * ```
 *
 * @param middleware - Middleware function to execute after the handler
 */
export function After(...middlewares: AfterMiddleware[]): <T extends Function>(target: T) => T {
    return function <T extends Function>(target: T): T {
        const existingMiddlewares = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, target as object) || [];

        // Append new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.AFTER, allMiddlewares, target as object);
        return target;
    };
}
