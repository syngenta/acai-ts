// complex-endpoint.controller.js - Simulated compiled TypeScript function decorator output
// Represents functions with multiple combined decorators
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Combined decorator functions - represents compiled TypeScript with multiple decorators
 * Original TypeScript would look like:
 * 
 * @Route('POST', '/complex')
 * @Auth({ required: true, roles: ['admin'] })
 * @Validate({ requiredHeaders: ['x-api-key'], requiredBody: 'complex-request' })
 * @Timeout(3000)
 * @Before(logMiddleware)
 * @After(auditMiddleware)
 * export const post = async (request, response) => { ... }
 */

// Complex POST endpoint with all decorators
const post = async (request, response) => {
    const context = request.context || {};
    const authContext = context.auth || {};
    
    response.body = {
        functionDecorator: true,
        combinedDecorators: true,
        method: 'POST',
        handler: 'complex-endpoint-post',
        
        // Auth info
        authenticated: authContext.authenticated || false,
        user: authContext.user || null,
        roles: authContext.roles || [],
        
        // Before middleware context
        beforeMiddleware: context.beforeExecuted || false,
        loggedAt: context.loggedAt || null,
        
        // Request data
        data: request.body,
        
        // Processing info
        processedAt: new Date().toISOString(),
        message: 'Complex endpoint with all decorators executed successfully'
    };
    
    // Set data for After middleware
    response.rawBody = response.body;
    return response;
};

// Moderately complex GET endpoint
const get = async (request, response) => {
    const context = request.context || {};
    const authContext = context.auth || {};
    
    response.body = {
        functionDecorator: true,
        combinedDecorators: true,
        method: 'GET',
        handler: 'complex-endpoint-get',
        
        // Auth info
        authenticated: authContext.authenticated || false,
        user: authContext.user || null,
        
        // Query parameters
        query: request.query || {},
        
        // Validation passed
        validationPassed: true,
        
        message: 'Complex GET endpoint with validation and auth'
    };
    
    return response;
};

// Simple PUT with timeout
const put = async (request, response) => {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    response.body = {
        functionDecorator: true,
        combinedDecorators: true,
        method: 'PUT',
        handler: 'complex-endpoint-put',
        
        // Data
        updated: true,
        data: request.body,
        
        // Timeout info
        timeoutSet: true,
        timeoutValue: 5000,
        
        message: 'PUT endpoint with timeout decorator'
    };
    
    return response;
};

// Middleware functions for decorators
const logMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeExecuted = true;
    request.context.loggedAt = new Date().toISOString();
    request.context.middleware = 'log-middleware';
};

const auditMiddleware = async (request, response) => {
    if (response.rawBody && typeof response.rawBody === 'object') {
        response.rawBody.auditMiddleware = true;
        response.rawBody.auditedAt = new Date().toISOString();
        response.rawBody.auditTrail = {
            action: response.rawBody.method,
            handler: response.rawBody.handler,
            user: request.context?.auth?.user || 'anonymous'
        };
    }
};

const simpleBeforeMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.simpleBeforeExecuted = true;
};

// Simulate compiled decorator metadata - this represents what TypeScript generates

// POST endpoint with all decorators
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'POST', path: '/complex' },
    post
);

Reflect.defineMetadata(
    MetadataKeys.AUTH,
    { required: true, roles: ['admin'] },
    post
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'authorization'],
            requiredBody: ['data', 'action']
        }
    },
    post
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 3000 },
    post
);

Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [logMiddleware],
    post
);

Reflect.defineMetadata(
    MetadataKeys.AFTER,
    [auditMiddleware],
    post
);

// GET endpoint with route, auth, and validation
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'GET', path: '/complex' },
    get
);

Reflect.defineMetadata(
    MetadataKeys.AUTH,
    { required: true },
    get
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredQuery: ['page']
        }
    },
    get
);

Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [simpleBeforeMiddleware],
    get
);

// PUT endpoint with route and timeout
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    { method: 'PUT', path: '/complex' },
    put
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 5000 },
    put
);

// Export functions
module.exports = {
    post,
    get,
    put
};