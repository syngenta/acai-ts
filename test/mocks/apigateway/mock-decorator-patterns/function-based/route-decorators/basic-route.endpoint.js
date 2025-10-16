// basic-route.js - Function-based endpoint with route decorators
// Demonstrates function-based decorator patterns as alternative to classes
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Function-based route handlers with decorators
 * Original TypeScript would look like:
 * 
 * @Route('GET', '/basic-route')
 * @Before(authMiddleware)
 * export const get = async (request, response) => { ... }
 */

// GET handler function
exports.get = async (request, response) => {
    const context = request.context || {};
    
    response.body = {
        functionEndpoint: true,
        method: 'GET',
        handler: 'basic-route-get',
        pattern: 'function-based-decorators',
        authenticated: context.auth?.authenticated || false,
        apiKey: request.headers?.['x-api-key'],
        beforeMiddleware: context.functionBefore || false,
        timestamp: new Date().toISOString(),
        note: 'Function-based endpoint with route decorators'
    };
    
    return response;
};

// POST handler function
exports.post = async (request, response) => {
    const context = request.context || {};
    
    response.body = {
        functionEndpoint: true,
        method: 'POST',
        handler: 'basic-route-post',
        pattern: 'function-based-decorators',
        data: request.body,
        validated: context.validation?.passed || false,
        timestamp: new Date().toISOString()
    };
    
    return response;
};

// ===== MIDDLEWARE FUNCTIONS =====

// Function-based before middleware
const functionBeforeMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.functionBefore = true;
    request.context.functionMiddleware = 'active';
    request.context.timestamp = new Date().toISOString();
};

// Function-based auth middleware
const functionAuthMiddleware = async (request, response) => {
    request.context = request.context || {};
    
    const apiKey = request.headers?.['x-api-key'];
    request.context.auth = {
        authenticated: !!apiKey,
        apiKey: apiKey,
        type: 'function-based-auth'
    };
};

// Function-based validation middleware
const functionValidationMiddleware = async (request, response) => {
    request.context = request.context || {};
    
    const validation = {
        passed: true,
        errors: [],
        type: 'function-based-validation'
    };
    
    // Check required headers
    if (!request.headers?.['x-api-key']) {
        validation.passed = false;
        validation.errors.push('Missing required header: x-api-key');
    }
    
    // For POST, check body
    if (request.httpMethod === 'POST' && !request.body) {
        validation.passed = false;
        validation.errors.push('Request body is required');
    }
    
    request.context.validation = validation;
};

// ===== DECORATOR METADATA FOR FUNCTIONS =====

// GET function metadata
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    {
        method: 'GET',
        path: '/route-decorators/basic-route'
    },
    exports.get
);

Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [functionBeforeMiddleware, functionAuthMiddleware],
    exports.get
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key']
        }
    },
    exports.get
);

// POST function metadata
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    {
        method: 'POST',
        path: '/route-decorators/basic-route'
    },
    exports.post
);

Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [functionValidationMiddleware],
    exports.post
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredBody: true
        }
    },
    exports.post
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 3000 },
    exports.post
);