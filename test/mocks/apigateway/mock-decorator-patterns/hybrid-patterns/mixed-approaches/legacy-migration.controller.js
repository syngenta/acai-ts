// legacy-migration.controller.js - Hybrid pattern showing migration from requirements to decorators
// Represents a controller in transition from traditional requirements to decorator patterns
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Legacy Migration Controller - represents a real-world migration scenario
 * Shows mixed patterns where some methods use traditional requirements
 * while others have been migrated to decorators
 * 
 * Migration stages:
 * 1. Legacy methods with requirements object
 * 2. Transitional methods with both requirements and some decorators
 * 3. Fully migrated methods with only decorators
 */

// ===== LEGACY REQUIREMENTS (Phase 1 - Original Pattern) =====
exports.requirements = {
    // Traditional requirements-based validation (not yet migrated)
    get: {
        requiredHeaders: ['x-api-key'],
        requiredQuery: ['version']
    },
    
    // Hybrid approach - requirements with some decorator preparation
    post: {
        requiredHeaders: ['x-api-key', 'authorization'],
        requiredBody: 'legacy-request',
        // NOTE: This method also has decorator metadata (transitional state)
        decoratorMigration: 'in-progress'
    }
    
    // PUT and DELETE methods have no requirements - fully migrated to decorators
};

// ===== LEGACY METHOD (Not yet migrated) =====
exports.get = async (request, response) => {
    // Traditional implementation relying on requirements validation
    response.body = {
        hybridController: true,
        method: 'GET',
        handler: 'legacy-migration-get',
        pattern: 'legacy-requirements',
        migration: {
            status: 'not-migrated',
            usesRequirements: true,
            usesDecorators: false
        },
        request: {
            version: request.query?.version,
            headers: {
                apiKey: request.headers?.['x-api-key']
            }
        },
        note: 'This method still uses traditional requirements validation'
    };
    
    return response;
};

// ===== TRANSITIONAL METHOD (Hybrid approach) =====
exports.post = async (request, response) => {
    const context = request.context || {};
    
    // Method has both requirements AND decorator metadata (migration in progress)
    response.body = {
        hybridController: true,
        method: 'POST',
        handler: 'legacy-migration-post',
        pattern: 'hybrid-transitional',
        migration: {
            status: 'in-progress',
            usesRequirements: true, // Still has requirements for backward compatibility
            usesDecorators: true    // Also has new decorator metadata
        },
        processing: {
            // Data from requirements validation
            requirementsValidated: true,
            
            // Data from decorator middleware (if executed)
            decoratorBefore: context.decoratorBefore || false,
            authContext: context.auth || null
        },
        data: request.body,
        note: 'This method uses both requirements and decorators during migration'
    };
    
    // Data is set in response.body for potential after middleware
    return response;
};

// ===== FULLY MIGRATED METHODS (Decorators only) =====
exports.put = async (request, response) => {
    const context = request.context || {};
    
    response.body = {
        hybridController: true,
        method: 'PUT',
        handler: 'legacy-migration-put',
        pattern: 'fully-migrated-decorators',
        migration: {
            status: 'complete',
            usesRequirements: false,
            usesDecorators: true
        },
        processing: {
            // All processing done via decorators
            authenticated: context.auth?.authenticated || false,
            beforeMiddleware: context.beforeExecuted || false,
            validationDecorator: true
        },
        data: request.body,
        note: 'This method uses only decorators - fully migrated'
    };
    
    return response;
};

exports.delete = async (request, response) => {
    const context = request.context || {};
    
    // Simulate checking for admin permissions set by auth decorator
    if (!context.auth?.roles?.includes('admin')) {
        response.body = {
            error: 'Insufficient permissions',
            required: 'admin role',
            migration: 'fully-migrated-with-auth'
        };
        response.statusCode = 403;
        return response;
    }
    
    response.body = {
        hybridController: true,
        method: 'DELETE',
        handler: 'legacy-migration-delete',
        pattern: 'fully-migrated-with-auth',
        migration: {
            status: 'complete-with-auth',
            usesRequirements: false,
            usesDecorators: true
        },
        processing: {
            authenticated: context.auth?.authenticated || false,
            authorized: context.auth?.roles?.includes('admin') || false,
            beforeMiddleware: context.beforeExecuted || false
        },
        action: 'resource-deleted',
        note: 'This method uses advanced decorator auth patterns'
    };
    
    return response;
};

// ===== MIDDLEWARE FUNCTIONS FOR MIGRATED METHODS =====

const migrationBeforeMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeExecuted = true;
    request.context.decoratorBefore = true; // This is what the test expects
    request.context.migrationMiddleware = 'active';
    request.context.timestamp = new Date().toISOString();
};

const migrationAuthMiddleware = async (request, response) => {
    request.context = request.context || {};
    
    const authHeader = request.headers?.authorization;
    const adminHeader = request.headers?.['x-admin'];
    
    request.context.auth = {
        authenticated: !!authHeader,
        user: authHeader ? { id: 'migration-user', token: authHeader } : null,
        roles: adminHeader === 'true' ? ['admin'] : ['user']
    };
};

const migrationAfterMiddleware = async (request, response) => {
    const bodyData = response.rawBody;
    if (bodyData && typeof bodyData === 'object') {
        bodyData.migrationAfter = {
            processed: true,
            timestamp: new Date().toISOString(),
            migrationComplete: true
        };
    }
};

// ===== DECORATOR METADATA (Only for migrated/transitional methods) =====

// POST method - Transitional (has both requirements and decorators)
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [migrationBeforeMiddleware],
    exports.post
);

// For demonstration of the hybrid approach - this would be used alongside requirements
Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            // This duplicates some requirements but adds decorator-specific validation
            requiredHeaders: ['x-api-key', 'authorization', 'x-migration-flag'],
            requiredBody: ['action'] // Different from requirements.post
        }
    },
    exports.post
);

// PUT method - Fully migrated to decorators
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [migrationBeforeMiddleware, migrationAuthMiddleware],
    exports.put
);

Reflect.defineMetadata(
    MetadataKeys.AFTER,
    [migrationAfterMiddleware],
    exports.put
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredBody: ['data']
        }
    },
    exports.put
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 7000 },
    exports.put
);

// DELETE method - Fully migrated with auth
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [migrationAuthMiddleware, migrationBeforeMiddleware],
    exports.delete
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'authorization', 'x-admin'],
            requiredQuery: []
        }
    },
    exports.delete
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 5000 },
    exports.delete
);