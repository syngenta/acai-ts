/**
 * @Timeout decorator for configuring endpoint timeouts
 */

import {MetadataKeys, TimeoutMetadata, setMetadata} from './metadata';

/**
 * Timeout decorator for setting a timeout on an endpoint
 *
 * @example
 * ```typescript
 * class UserHandler {
 *   @Timeout(5000) // 5 second timeout
 *   @Route('GET', '/users')
 *   async getUsers(request: IRequest, response: IResponse) {
 *     // Handler logic
 *   }
 * }
 * ```
 *
 * @param timeout - Timeout in milliseconds
 */
export function Timeout(timeout: number): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        if (!Number.isInteger(timeout) || timeout <= 0) {
            throw new Error(`@Timeout decorator requires a positive integer, got: ${timeout}`);
        }

        const metadata: TimeoutMetadata = {
            timeout
        };

        setMetadata(MetadataKeys.TIMEOUT, metadata, target, propertyKey);
    };
}
