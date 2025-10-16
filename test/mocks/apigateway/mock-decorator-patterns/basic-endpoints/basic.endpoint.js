// basic.endpoint.js - Simulated compiled TypeScript decorator output
// Represents a class that originally had decorators: @Before, @After, @Validate, @Timeout
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../src/decorators/metadata');

/**
 * Basic decorated endpoint - represents compiled TypeScript with decorators
 * Original TypeScript would look like:
 * 
 * class BasicEndpoint extends BaseEndpoint {
 *     @Before(authMiddleware)
 *     @Validate({ requiredHeaders: ['x-api-key'] })
 *     async get(request, response) { ... }
 * 
 *     @After(logMiddleware)
 *     @Timeout(5000)
 *     async post(request, response) { ... }
 * }
 */
class BasicEndpoint {
    async get(request, response) {
        // Access middleware-set context from @Before decorator
        const beforeContext = request.context || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'GET',
            beforeMiddleware: beforeContext.decoratorBefore || false,
            timestamp: beforeContext.timestamp,
            message: 'Basic GET endpoint with decorator metadata'
        };
        return response;
    }

    async post(request, response) {
        response.body = {
            decoratorEndpoint: true,
            method: 'POST',
            data: request.body,
            message: 'Basic POST endpoint with timeout and after middleware'
        };
        
        // Data is set in response.body for @After middleware to process
        return response;
    }

    async put(request, response) {
        response.body = {
            decoratorEndpoint: true,
            method: 'PUT',
            updated: true
        };
        return response;
    }
}

// Simulate compiled decorator metadata - this is what TypeScript compiler generates
// @Before decorator metadata for GET method
const beforeMiddleware = async (request, response) => {
    request.context = {
        decoratorBefore: true,
        timestamp: new Date().toISOString(),
        middleware: 'before-auth'
    };
};

Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [beforeMiddleware],
    BasicEndpoint.prototype,
    'get'
);

// @Validate decorator metadata for GET method
Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredQuery: []
        }
    },
    BasicEndpoint.prototype,
    'get'
);

// @After decorator metadata for POST method
const afterMiddleware = async (request, response) => {
    const bodyData = response.rawBody;
    if (bodyData && typeof bodyData === 'object') {
        bodyData.decoratorAfter = true;
        bodyData.processedAt = new Date().toISOString();
    }
};

Reflect.defineMetadata(
    MetadataKeys.AFTER,
    [afterMiddleware],
    BasicEndpoint.prototype,
    'post'
);

// @Timeout decorator metadata for POST method
Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 5000 },
    BasicEndpoint.prototype,
    'post'
);

// Export the class (not an instance)
module.exports = BasicEndpoint;