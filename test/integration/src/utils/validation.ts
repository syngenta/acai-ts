import {AfterMiddleware, BeforeMiddleware, ValidationRequirements} from 'acai-ts';

/**
 * Build a versioned schema name following the integration naming convention.
 */
export const schemaName = (version: string, resource: string, action: string, type: 'request' | 'response'): string =>
    `${version}-${resource}-${action}-${type}`;

/**
 * Helper to construct the request/response schema names for a given action.
 */
export const schemaPair = (version: string, resource: string, action: string) => ({
    request: schemaName(version, resource, action, 'request'),
    response: schemaName(version, resource, action, 'response')
});

export const schemaRef = (schemaName: string): Record<string, unknown> => ({
    $ref: `#/components/schemas/${schemaName}`
});

/**
 * Strongly typed helper for defining validation requirements.
 */
export interface MethodRequirements extends Omit<ValidationRequirements, 'response'> {
    requiredAuth?: boolean;
    timeout?: number;
    before?: BeforeMiddleware;
    after?: AfterMiddleware;
    response?: string | Record<string, unknown>;
}

export const defineRequirements = <TRequirements extends MethodRequirements>(requirements: TRequirements): TRequirements => requirements;

/**
 * Attach auth metadata to an existing requirements object.
 */
export const withAuthRequirement = <TRequirements extends MethodRequirements>(
    requirements: TRequirements
): TRequirements & {requiredAuth: true; auth: true} => ({
    ...requirements,
    requiredAuth: true as const,
    auth: true as const
});
