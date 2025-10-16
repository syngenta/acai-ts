// auth-protected.controller.js - Simulated compiled TypeScript function decorator output
// Represents functions that originally had @Auth decorators
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Auth-decorated functions - represents compiled TypeScript with @Auth decorators
 * Original TypeScript would look like:
 * 
 * @Auth({ required: true })
 * @Route('GET', '/protected')
 * export const get = async (request, response) => { ... }
 * 
 * @Auth({ required: true, roles: ['admin'] })
 * @Route('DELETE', '/admin-only')
 * export const delete = async (request, response) => { ... }
 */

// Basic auth-protected endpoint
const get = async (request, response) => {
    // Access auth context set by auth middleware
    const authContext = request.context?.auth || {};
    
    response.body = {
        functionDecorator: true,
        authDecorator: true,
        method: 'GET',
        handler: 'auth-protected-get',
        authenticated: authContext.authenticated || false,
        user: authContext.user || null,
        message: 'Successfully accessed protected endpoint'
    };
    return response;
};

// Admin-only protected endpoint  
const deleteHandler = async (request, response) => {
    const authContext = request.context?.auth || {};
    
    response.body = {
        functionDecorator: true,
        authDecorator: true,
        method: 'DELETE',
        handler: 'auth-protected-delete',
        authenticated: authContext.authenticated || false,
        user: authContext.user || null,
        roles: authContext.roles || [],
        adminAccess: true,
        message: 'Admin-only action completed'
    };
    return response;
};

// Public endpoint (no auth required)
const post = async (request, response) => {
    response.body = {
        functionDecorator: true,
        method: 'POST',
        handler: 'auth-protected-post',
        publicEndpoint: true,
        data: request.body,
        message: 'Public endpoint accessible without auth'
    };
    return response;
};

// User-level protected endpoint
const put = async (request, response) => {
    const authContext = request.context?.auth || {};
    
    response.body = {
        functionDecorator: true,
        authDecorator: true,
        method: 'PUT',
        handler: 'auth-protected-put',
        authenticated: authContext.authenticated || false,
        user: authContext.user || null,
        roles: authContext.roles || [],
        userAccess: true,
        data: request.body
    };
    return response;
};

// Simulate compiled @Auth decorator metadata - this is what TypeScript compiler generates

// @Auth({ required: true }) for GET
Reflect.defineMetadata(
    MetadataKeys.AUTH,
    {
        required: true
    },
    get
);

// @Auth({ required: true, roles: ['admin'] }) for DELETE  
Reflect.defineMetadata(
    MetadataKeys.AUTH,
    {
        required: true,
        roles: ['admin']
    },
    deleteHandler
);

// @Auth({ required: true, roles: ['user', 'admin'] }) for PUT
Reflect.defineMetadata(
    MetadataKeys.AUTH,
    {
        required: true,
        roles: ['user', 'admin']
    },
    put
);

// No auth metadata for POST (public endpoint)

// Also add route metadata for completeness
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'GET', path: '/auth-protected' },
    get
);

Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'DELETE', path: '/auth-protected/admin' },
    deleteHandler
);

Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'POST', path: '/auth-protected/public' },
    post
);

Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'PUT', path: '/auth-protected/user' },
    put
);

// Export functions
module.exports = {
    get,
    delete: deleteHandler, // 'delete' is a reserved keyword
    post,
    put
};