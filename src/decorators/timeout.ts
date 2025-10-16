/**
 * @Timeout decorator for configuring endpoint timeouts
 */

import {MetadataKeys, TimeoutMetadata, setMetadata} from './metadata';

/**
 * Timeout decorator for setting a timeout on an endpoint
 *
 * @example
 * ```typescript
 * @Timeout(5000) // 5 second timeout
 * @Route('GET', '/users')
 * export const getUsers = async (request: IRequest, response: IResponse) => {
 *   // Handler logic
 * };
 * ```
 *
 * @param timeout - Timeout in milliseconds
 */
export function Timeout(timeout: number): <T extends Function>(target: T) => T {
    return function <T extends Function>(target: T): T {
        if (!Number.isInteger(timeout) || timeout <= 0) {
            throw new Error(`@Timeout decorator requires a positive integer, got: ${timeout}`);
        }

        const metadata: TimeoutMetadata = {
            timeout
        };

        setMetadata(MetadataKeys.TIMEOUT, metadata, target as object);
        return target;
    };
}
