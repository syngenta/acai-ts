/**
 * @Auth decorator for marking endpoints as requiring authentication
 */

import {MetadataKeys, AuthMetadata, setMetadata} from './metadata';

/**
 * Auth decorator for marking an endpoint as requiring authentication
 *
 * @example
 * ```typescript
 * class UserHandler {
 *   @Auth()
 *   @Route('GET', '/profile')
 *   async getProfile(request: IRequest, response: IResponse) {
 *     // Handler logic - withAuth middleware will run first
 *   }
 * }
 * ```
 *
 * @param required - Whether authentication is required (default: true)
 */
export function Auth(required = true): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        const metadata: AuthMetadata = {
            required
        };

        setMetadata(MetadataKeys.AUTH, metadata, target, propertyKey);
    };
}
