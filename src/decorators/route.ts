/**
 * @Route decorator for marking endpoint methods
 */

import {HttpMethod} from '../types';
import {MetadataKeys, RouteMetadata, setMetadata} from './metadata';

/**
 * Route decorator for defining HTTP routes
 *
 * @example
 * ```typescript
 * class UserHandler {
 *   @Route('GET', '/users/:id')
 *   async getUser(request: IRequest, response: IResponse) {
 *     // Handler logic
 *   }
 * }
 * ```
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
 * @param path - Route path pattern (supports path parameters like :id)
 */
export function Route(method: HttpMethod, path: string): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        const metadata: RouteMetadata = {
            method,
            path
        };

        setMetadata(MetadataKeys.ROUTE, metadata, target, propertyKey);
    };
}
