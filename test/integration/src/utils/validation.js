"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuthRequirement = exports.defineRequirements = exports.schemaPair = exports.schemaName = void 0;
/**
 * Build a versioned schema name following the integration naming convention.
 */
const schemaName = (version, resource, action, type) => `${version}-${resource}-${action}-${type}`;
exports.schemaName = schemaName;
/**
 * Helper to construct the request/response schema names for a given action.
 */
const schemaPair = (version, resource, action) => ({
    request: (0, exports.schemaName)(version, resource, action, 'request'),
    response: (0, exports.schemaName)(version, resource, action, 'response')
});
exports.schemaPair = schemaPair;
/**
 * Strongly typed helper for defining validation requirements.
 */
const defineRequirements = (requirements) => requirements;
exports.defineRequirements = defineRequirements;
/**
 * Attach auth metadata to an existing requirements object.
 */
const withAuthRequirement = (requirements) => ({
    ...requirements,
    requiredAuth: true
});
exports.withAuthRequirement = withAuthRequirement;
//# sourceMappingURL=validation.js.map