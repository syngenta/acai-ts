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
 * class UserHandler {
 *   @Validate({
 *     body: {
 *       type: 'object',
 *       required: ['name', 'email'],
 *       properties: {
 *         name: { type: 'string' },
 *         email: { type: 'string', format: 'email' }
 *       }
 *     }
 *   })
 *   @Route('POST', '/users')
 *   async createUser(request: IRequest, response: IResponse) {
 *     // Handler logic
 *   }
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
