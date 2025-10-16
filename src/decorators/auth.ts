/**
 * @Auth decorator for marking endpoints as requiring authentication
 */

import {MetadataKeys, AuthMetadata, setMetadata} from './metadata';

/**
 * Auth decorator for marking an endpoint as requiring authentication
 *
 * @example
 * ```typescript
 * @Auth()
 * @Route('GET', '/profile')
 * export const getProfile = async (request: IRequest, response: IResponse) => {
 *   // Handler logic - withAuth middleware will run first
 * };
 * ```
 *
 * @param required - Whether authentication is required (default: true)
 */
export function Auth(required = true): <T extends Function>(target: T) => T {
    return function <T extends Function>(target: T): T {
        const metadata: AuthMetadata = {
            required
        };

        setMetadata(MetadataKeys.AUTH, metadata, target as object);
        return target;
    };
}
