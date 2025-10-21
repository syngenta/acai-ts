import {ValidationRequirements} from 'acai-ts';

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

/**
 * Strongly typed helper for defining validation requirements.
 */
export const defineRequirements = <TRequirements extends ValidationRequirements>(
  requirements: TRequirements
): TRequirements => requirements;

/**
 * Attach auth metadata to an existing requirements object.
 */
export const withAuthRequirement = <TRequirements extends ValidationRequirements>(
  requirements: TRequirements
): TRequirements & {requiredAuth: true} => ({
  ...requirements,
  requiredAuth: true as const
});
