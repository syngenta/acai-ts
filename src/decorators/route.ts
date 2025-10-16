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
 * @Route('GET', '/users/:id')
 * export const getUser = async (request: IRequest, response: IResponse) => {
 *   // Handler logic
 * };
 * ```
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
 * @param path - Route path pattern (supports path parameters like :id)
 */
export function Route(method: HttpMethod, path: string): <T extends Function>(target: T) => T {
    return function <T extends Function>(target: T): T {
        const metadata: RouteMetadata = {
            method,
            path
        };

        setMetadata(MetadataKeys.ROUTE, metadata, target as object);
        return target;
    };
}
