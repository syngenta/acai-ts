/**
 * @Timeout decorator for configuring endpoint timeouts
 */

import {MetadataKeys, TimeoutMetadata, setMetadata} from './metadata';

/**
 * Timeout decorator for setting a timeout on an endpoint method
 *
 * @example
 * ```typescript
 * import { Endpoint, Request, Response, Timeout } from 'acai-ts';
 *
 * export class UsersEndpoint extends Endpoint {
 *     @Timeout(5000) // 5 second timeout
 *     async get(request: Request, response: Response): Promise<Response> {
 *         // Handler logic
 *         return response;
 *     }
 * }
 * ```
 *
 * @param timeout - Timeout in milliseconds
 */
export function Timeout(timeout: number): MethodDecorator {
    return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor): void {
        if (!Number.isInteger(timeout) || timeout <= 0) {
            throw new Error(`@Timeout decorator requires a positive integer, got: ${timeout}`);
        }

        const metadata: TimeoutMetadata = {
            timeout
        };

        setMetadata(MetadataKeys.TIMEOUT, metadata, target, propertyKey);
    };
}
