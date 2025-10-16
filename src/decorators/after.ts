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
 * import { Endpoint, Request, Response, After } from 'acai-ts';
 *
 * export class UsersEndpoint extends Endpoint {
 *     @After(logResponse)
 *     @After(compressResponse)
 *     async get(request: Request, response: Response): Promise<Response> {
 *         // Handler logic
 *         return response;
 *     }
 * }
 * ```
 *
 * @param middlewares - Middleware functions to execute after the handler
 */
export function After(...middlewares: AfterMiddleware[]): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor): void {
        const existingMiddlewares = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, target, propertyKey) || [];

        // Append new middlewares (so they execute in the order they're declared)
        const allMiddlewares = [...existingMiddlewares, ...middlewares];

        setMetadata(MetadataKeys.AFTER, allMiddlewares, target, propertyKey);
    };
}
