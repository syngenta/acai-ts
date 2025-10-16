// nested-resources.endpoint.js - Complex nested routing with path parameters
// Represents advanced routing patterns with dynamic path parameters
require('reflect-metadata');

const { BaseEndpoint } = require('../../../../../../src/apigateway/base-endpoint');
const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Nested Resources Endpoint - demonstrates complex routing patterns
 * Original TypeScript would look like:
 * 
 * class NestedResourcesEndpoint extends BaseEndpoint {
 *     @Route('GET', '/organizations/{orgId}/projects/{projectId}/resources/{resourceId}')
 *     @Before(extractPathParameters)
 *     @Validate({ pathParameters: ['orgId', 'projectId', 'resourceId'] })
 *     async get(request, response) { ... }
 * }
 */
class NestedResourcesEndpoint extends BaseEndpoint {
    async get(request, response) {
        const context = request.context || {};
        const pathParams = context.pathParameters || {};
        // Also check direct path parameters if middleware hasn't run - use event.pathParameters
        const directPathParams = request.event?.pathParameters || request.pathParameters || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'GET',
            handler: 'nested-resources-get',
            routing: {
                type: 'deeply-nested-resource',
                hierarchy: ['organization', 'project', 'resource'],
                parameters: pathParams,
                extractedIds: {
                    organizationId: pathParams.orgId || directPathParams.orgId,
                    projectId: pathParams.projectId || directPathParams.projectId,
                    resourceId: pathParams.resourceId || directPathParams.resourceId
                }
            },
            resource: {
                organization: pathParams.organizationData || { id: directPathParams.orgId },
                project: pathParams.projectData || { id: directPathParams.projectId },
                resource: pathParams.resourceData || { id: directPathParams.resourceId },
                permissions: pathParams.permissions || []
            },
            note: 'Deeply nested resource with hierarchical access control'
        };
        
        return response;
    }

    async post(request, response) {
        const context = request.context || {};
        const pathParams = context.pathParameters || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'POST',
            handler: 'nested-resources-post',
            routing: {
                type: 'create-nested-resource',
                parentHierarchy: ['organization', 'project'],
                parameters: pathParams
            },
            created: {
                parentOrganization: pathParams.orgId,
                parentProject: pathParams.projectId,
                newResource: request.body,
                generatedId: `resource-${Date.now()}`
            },
            data: request.body,
            note: 'Create new resource within project hierarchy'
        };
        
        return response;
    }

    async put(request, response) {
        const context = request.context || {};
        const pathParams = context.pathParameters || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'PUT',
            handler: 'nested-resources-put',
            routing: {
                type: 'update-nested-resource',
                fullHierarchy: ['organization', 'project', 'resource'],
                parameters: pathParams
            },
            updated: {
                organizationId: pathParams.orgId,
                projectId: pathParams.projectId,
                resourceId: pathParams.resourceId,
                modifications: Object.keys(request.body || {}),
                timestamp: new Date().toISOString()
            },
            data: request.body,
            note: 'Update specific resource with full hierarchy validation'
        };
        
        return response;
    }

    async delete(request, response) {
        const context = request.context || {};
        const pathParams = context.pathParameters || {};
        // Also check direct path parameters if middleware hasn't run - use event.pathParameters
        const directPathParams = request.event?.pathParameters || request.pathParameters || {};
        
        // Check cascade deletion rules
        const hasDependents = pathParams.hasDependentResources || 
            (directPathParams.resourceId === 'res-has-dependents');
        
        if (hasDependents) {
            response.body = {
                error: 'Cannot delete resource with dependent resources',
                cascade: {
                    dependentCount: pathParams.dependentCount || 2,
                    dependentTypes: pathParams.dependentTypes || ['database', 'storage']
                }
            };
            response.statusCode = 409;
            return response;
        }
        
        response.body = {
            decoratorEndpoint: true,
            method: 'DELETE',
            handler: 'nested-resources-delete',
            routing: {
                type: 'cascade-delete-nested-resource',
                parameters: pathParams
            },
            deleted: {
                organizationId: pathParams.orgId,
                projectId: pathParams.projectId,
                resourceId: pathParams.resourceId,
                cascadeActions: pathParams.cascadeActions || []
            },
            action: 'resource-deleted',
            note: 'Delete resource with cascade validation'
        };
        
        return response;
    }
}

// ===== PATH PARAMETER MIDDLEWARE FUNCTIONS =====

// Extract and validate path parameters
const extractPathParameters = async (request, response) => {
    request.context = request.context || {};
    request.context.pathParameters = request.context.pathParameters || {};
    
    // Extract IDs from path parameters - use event.pathParameters since request.pathParameters is broken
    const pathParams = request.event?.pathParameters || request.pathParameters || {};
    
    request.context.pathParameters = {
        orgId: pathParams.orgId || pathParams.organizationId,
        projectId: pathParams.projectId,
        resourceId: pathParams.resourceId,
        extractedAt: new Date().toISOString()
    };
    
    // Validate parameter formats
    const validation = {
        passed: true,
        errors: []
    };
    
    // Validate organization ID format
    if (request.context.pathParameters.orgId && 
        !/^org-[a-z0-9]{8,}$/.test(request.context.pathParameters.orgId)) {
        validation.passed = false;
        validation.errors.push('Organization ID must follow format: org-{alphanumeric}');
    }
    
    // Validate project ID format  
    if (request.context.pathParameters.projectId && 
        !/^proj-[a-z0-9]{8,}$/.test(request.context.pathParameters.projectId)) {
        validation.passed = false;
        validation.errors.push('Project ID must follow format: proj-{alphanumeric}');
    }
    
    // Validate resource ID format
    if (request.context.pathParameters.resourceId && 
        !/^res-[a-z0-9]{8,}$/.test(request.context.pathParameters.resourceId)) {
        validation.passed = false;
        validation.errors.push('Resource ID must follow format: res-{alphanumeric}');
    }
    
    request.context.pathParameters.validation = validation;
};

// Load hierarchical data based on path parameters
const loadHierarchicalData = async (request, response) => {
    request.context = request.context || {};
    request.context.pathParameters = request.context.pathParameters || {};
    
    const { orgId, projectId, resourceId } = request.context.pathParameters;
    
    // Simulate loading organization data
    if (orgId) {
        request.context.pathParameters.organizationData = {
            id: orgId,
            name: `Organization ${orgId}`,
            type: 'enterprise',
            permissions: ['read', 'write', 'admin']
        };
    }
    
    // Simulate loading project data
    if (projectId) {
        request.context.pathParameters.projectData = {
            id: projectId,
            name: `Project ${projectId}`,
            organizationId: orgId,
            status: 'active',
            permissions: ['read', 'write']
        };
    }
    
    // Simulate loading resource data
    if (resourceId) {
        request.context.pathParameters.resourceData = {
            id: resourceId,
            name: `Resource ${resourceId}`,
            projectId: projectId,
            organizationId: orgId,
            type: 'compute',
            status: 'running'
        };
    }
    
    // Simulate checking permissions based on hierarchy
    request.context.pathParameters.permissions = [
        'org:read',
        'project:read',
        'resource:read'
    ];
    
    // Add write permissions if user has admin role
    const authContext = request.context.auth || {};
    if (authContext.roles?.includes('admin')) {
        request.context.pathParameters.permissions.push(
            'org:write', 'project:write', 'resource:write', 'resource:delete'
        );
    }
};

// Check hierarchical permissions
const checkHierarchicalPermissions = async (request, response) => {
    request.context = request.context || {};
    const authContext = request.context.auth || {};
    const pathParams = request.context.pathParameters || {};
    
    // Simulate permission checking based on method and hierarchy
    const method = request.httpMethod?.toLowerCase();
    const requiredPermissions = {
        'get': 'read',
        'post': 'write',
        'put': 'write',
        'patch': 'write',
        'delete': 'delete'
    };
    
    const requiredPermission = requiredPermissions[method] || 'read';
    const hasPermission = pathParams.permissions?.includes(`resource:${requiredPermission}`) || false;
    
    if (!hasPermission) {
        request.context.permissionDenied = {
            required: `resource:${requiredPermission}`,
            available: pathParams.permissions || [],
            hierarchy: {
                organizationId: pathParams.orgId,
                projectId: pathParams.projectId,
                resourceId: pathParams.resourceId
            }
        };
    }
};

// Check for dependent resources (for DELETE operations)
const checkDependentResources = async (request, response) => {
    request.context = request.context || {};
    request.context.pathParameters = request.context.pathParameters || {};
    
    const { resourceId } = request.context.pathParameters;
    
    // Simulate checking for dependent resources
    const dependentResources = [];
    
    // Different scenarios based on resource ID
    if (resourceId === 'res-has-dependents') {
        dependentResources.push(
            { type: 'database', count: 2 },
            { type: 'storage', count: 1 }
        );
    }
    
    request.context.pathParameters.hasDependentResources = dependentResources.length > 0;
    request.context.pathParameters.dependentCount = dependentResources.length;
    request.context.pathParameters.dependentTypes = dependentResources.map(d => d.type);
    
    // Simulate cascade actions that would be performed
    if (!request.context.pathParameters.hasDependentResources) {
        request.context.pathParameters.cascadeActions = [
            'cleanup_resource_references',
            'update_parent_project_stats',
            'notify_organization_admins'
        ];
    }
};

// ===== METADATA DEFINITIONS =====

// GET - Retrieve nested resource
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [extractPathParameters, loadHierarchicalData, checkHierarchicalPermissions],
    NestedResourcesEndpoint.prototype,
    'get'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredPathParameters: ['orgId', 'projectId', 'resourceId']
        }
    },
    NestedResourcesEndpoint.prototype,
    'get'
);

// POST - Create nested resource
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [extractPathParameters, loadHierarchicalData, checkHierarchicalPermissions],
    NestedResourcesEndpoint.prototype,
    'post'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'content-type'],
            requiredPathParameters: ['orgId', 'projectId'],
            requiredBody: ['name', 'type']
        }
    },
    NestedResourcesEndpoint.prototype,
    'post'
);

// PUT - Update nested resource
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [extractPathParameters, loadHierarchicalData, checkHierarchicalPermissions],
    NestedResourcesEndpoint.prototype,
    'put'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'content-type'],
            requiredPathParameters: ['orgId', 'projectId', 'resourceId'],
            requiredBody: ['name']
        }
    },
    NestedResourcesEndpoint.prototype,
    'put'
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 8000 },
    NestedResourcesEndpoint.prototype,
    'put'
);

// DELETE - Delete nested resource with cascade checking
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [extractPathParameters, loadHierarchicalData, checkHierarchicalPermissions, checkDependentResources],
    NestedResourcesEndpoint.prototype,
    'delete'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'authorization'],
            requiredPathParameters: ['orgId', 'projectId', 'resourceId']
        }
    },
    NestedResourcesEndpoint.prototype,
    'delete'
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 10000 },
    NestedResourcesEndpoint.prototype,
    'delete'
);

module.exports = NestedResourcesEndpoint;