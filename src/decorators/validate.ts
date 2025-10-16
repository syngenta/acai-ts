/**
 * @Validate decorator for adding validation requirements
 */

import {ValidationRequirements} from '../types';
import {MetadataKeys, ValidationMetadata, setMetadata} from './metadata';

/**
 * Validate decorator for defining validation requirements
 *
 * @example
 * ```typescript
 * import { Endpoint, Request, Response, Validate } from 'acai-ts';
 *
 * export class UsersEndpoint extends Endpoint {
 *     // Using built-in validation features
 *     @Validate({
 *         requiredHeaders: ['x-api-key', 'authorization'],
 *         requiredQuery: ['page', 'limit'],
 *         requiredBody: 'User' // Reference to schema name
 *     })
 *     async post(request: Request, response: Response): Promise<Response> {
 *         // Handler logic
 *         return response;
 *     }
 *
 *     // Using JSON Schema validation
 *     @Validate({
 *         body: {
 *             type: 'object',
 *             required: ['name', 'email'],
 *             properties: {
 *                 name: { type: 'string' },
 *                 email: { type: 'string', format: 'email' }
 *             }
 *         }
 *     })
 *     async put(request: Request, response: Response): Promise<Response> {
 *         // Handler logic
 *         return response;
 *     }
 * }
 * ```
 *
 * @param requirements - Validation requirements object
 */
export function Validate(requirements: ValidationRequirements): MethodDecorator {
    return function (target: object, propertyKey: string | symbol): void {
        const metadata: ValidationMetadata = {
            requirements: requirements as Record<string, unknown>
        };

        setMetadata(MetadataKeys.VALIDATE, metadata, target, propertyKey);
    };
}
