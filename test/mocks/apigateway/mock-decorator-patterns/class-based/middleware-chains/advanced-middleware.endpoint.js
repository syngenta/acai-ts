// advanced-middleware.endpoint.js - Complex middleware chain patterns
// Represents classes with sophisticated middleware compositions
require('reflect-metadata');

const { BaseEndpoint } = require('../../../../../../src/apigateway/base-endpoint');
const { MetadataKeys } = require('../../../../../../src/decorators/metadata');

/**
 * Advanced middleware endpoint - represents compiled TypeScript with complex middleware chains
 * Original TypeScript would look like:
 * 
 * class AdvancedMiddlewareEndpoint extends BaseEndpoint {
 *     @Before(authMiddleware)
 *     @Before(rateLimitMiddleware)  
 *     @Before(logMiddleware)
 *     @Validate({ requiredHeaders: ['x-api-key', 'x-trace-id'] })
 *     @After(auditMiddleware)
 *     @After(metricsMiddleware)
 *     @After(cleanupMiddleware)
 *     @Timeout(10000)
 *     async post(request, response) { ... }
 * }
 */
class AdvancedMiddlewareEndpoint extends BaseEndpoint {
    async get(request, response) {
        const context = request.context || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'GET',
            handler: 'advanced-middleware-get',
            middleware: {
                beforeChain: context.beforeChain || [],
                afterChain: [], // Will be populated by after middleware
                executionOrder: context.executionOrder || []
            },
            request: {
                traceId: request.headers['x-trace-id'],
                authenticated: context.auth?.authenticated || false,
                rateLimited: context.rateLimit?.limited || false
            },
            timestamp: new Date().toISOString()
        };
        
        // Data is already set in response.body for after middleware chain
        return response;
    }

    async post(request, response) {
        const context = request.context || {};
        
        response.body = {
            decoratorEndpoint: true,
            method: 'POST',
            handler: 'advanced-middleware-post',
            data: request.body,
            middleware: {
                beforeChain: context.beforeChain || [],
                afterChain: [],
                executionOrder: context.executionOrder || [],
                errors: context.errors || []
            },
            processing: {
                authenticated: context.auth?.authenticated || false,
                rateLimited: context.rateLimit?.limited || false,
                logged: context.logging?.enabled || false,
                traced: !!request.headers['x-trace-id']
            },
            timestamp: new Date().toISOString()
        };
        
        return response;
    }

    async put(request, response) {
        const context = request.context || {};
        
        // Simulate potential error in main handler
        if (request.body?.simulateError) {
            throw new Error('Simulated handler error for middleware testing');
        }
        
        response.body = {
            decoratorEndpoint: true,
            method: 'PUT',
            handler: 'advanced-middleware-put',
            data: request.body,
            middleware: {
                beforeChain: context.beforeChain || [],
                errorHandling: context.errorHandling || false
            },
            timestamp: new Date().toISOString()
        };
        
        return response;
    }
}

// ===== MIDDLEWARE FUNCTIONS =====

// Authentication middleware
const authMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeChain = request.context.beforeChain || [];
    request.context.executionOrder = request.context.executionOrder || [];
    
    request.context.beforeChain.push('auth');
    request.context.executionOrder.push('auth-before');
    
    // Simulate auth check
    const authHeader = request.headers?.authorization;
    request.context.auth = {
        authenticated: !!authHeader,
        user: authHeader ? { id: 'middleware-user', token: authHeader } : null
    };
};

// Rate limiting middleware
const rateLimitMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeChain = request.context.beforeChain || [];
    request.context.executionOrder = request.context.executionOrder || [];
    
    request.context.beforeChain.push('rateLimit');
    request.context.executionOrder.push('rateLimit-before');
    
    // Simulate rate limit check
    const rateLimitHeader = request.headers['x-rate-limit'];
    request.context.rateLimit = {
        limited: rateLimitHeader === 'exceeded',
        remaining: rateLimitHeader === 'exceeded' ? 0 : 100,
        reset: Date.now() + 60000
    };
    
    if (request.context.rateLimit.limited) {
        request.context.errors = request.context.errors || [];
        request.context.errors.push('Rate limit exceeded');
    }
};

// Logging middleware
const logMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeChain = request.context.beforeChain || [];
    request.context.executionOrder = request.context.executionOrder || [];
    
    request.context.beforeChain.push('logging');
    request.context.executionOrder.push('logging-before');
    
    request.context.logging = {
        enabled: true,
        traceId: request.headers['x-trace-id'] || `trace-${Date.now()}`,
        startTime: Date.now()
    };
};

// Audit middleware (after)
const auditMiddleware = async (request, response) => {
    const bodyData = response.rawBody;
    if (bodyData && typeof bodyData === 'object') {
        bodyData.middleware = bodyData.middleware || {};
        bodyData.middleware.afterChain = bodyData.middleware.afterChain || [];
        bodyData.middleware.executionOrder = bodyData.middleware.executionOrder || [];
        
        bodyData.middleware.afterChain.push('audit');
        bodyData.middleware.executionOrder.push('audit-after');
        
        bodyData.audit = {
            timestamp: new Date().toISOString(),
            user: request.context?.auth?.user?.id || 'anonymous',
            action: bodyData.method,
            handler: bodyData.handler,
            traceId: request.context?.logging?.traceId
        };
    }
};

// Metrics middleware (after)
const metricsMiddleware = async (request, response) => {
    const bodyData = response.rawBody;
    if (bodyData && typeof bodyData === 'object') {
        bodyData.middleware = bodyData.middleware || {};
        bodyData.middleware.afterChain = bodyData.middleware.afterChain || [];
        bodyData.middleware.executionOrder = bodyData.middleware.executionOrder || [];
        
        bodyData.middleware.afterChain.push('metrics');
        bodyData.middleware.executionOrder.push('metrics-after');
        
        const endTime = Date.now();
        const startTime = request.context?.logging?.startTime || endTime;
        
        bodyData.metrics = {
            duration: endTime - startTime,
            timestamp: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            method: bodyData.method
        };
    }
};

// Cleanup middleware (after)
const cleanupMiddleware = async (request, response) => {
    if (response.rawBody && typeof response.rawBody === 'object') {
        response.rawBody.middleware = response.rawBody.middleware || {};
        response.rawBody.middleware.afterChain = response.rawBody.middleware.afterChain || [];
        response.rawBody.middleware.executionOrder = response.rawBody.middleware.executionOrder || [];
        
        response.rawBody.middleware.afterChain.push('cleanup');
        response.rawBody.middleware.executionOrder.push('cleanup-after');
        
        response.rawBody.cleanup = {
            performed: true,
            timestamp: new Date().toISOString(),
            actions: ['temp_files_cleaned', 'connections_closed', 'cache_invalidated']
        };
    }
};

// Error handling middleware (before)
const errorHandlingMiddleware = async (request, response) => {
    request.context = request.context || {};
    request.context.beforeChain = request.context.beforeChain || [];
    request.context.executionOrder = request.context.executionOrder || [];
    
    request.context.beforeChain.push('errorHandling');
    request.context.executionOrder.push('errorHandling-before');
    request.context.errorHandling = true;
    
    // Set up error boundary
    request.context.errorBoundary = {
        enabled: true,
        catchAsync: true,
        logErrors: true
    };
};

// ===== METADATA DEFINITIONS =====

// GET endpoint - multiple before middlewares, multiple after middlewares
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [authMiddleware, rateLimitMiddleware, logMiddleware],
    AdvancedMiddlewareEndpoint.prototype,
    'get'
);

Reflect.defineMetadata(
    MetadataKeys.AFTER,
    [auditMiddleware, metricsMiddleware, cleanupMiddleware],
    AdvancedMiddlewareEndpoint.prototype,
    'get'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'x-trace-id'],
            requiredQuery: []
        }
    },
    AdvancedMiddlewareEndpoint.prototype,
    'get'
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 8000 },
    AdvancedMiddlewareEndpoint.prototype,
    'get'
);

// POST endpoint - all middlewares with validation
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [authMiddleware, rateLimitMiddleware, logMiddleware],
    AdvancedMiddlewareEndpoint.prototype,
    'post'
);

Reflect.defineMetadata(
    MetadataKeys.AFTER,
    [auditMiddleware, metricsMiddleware, cleanupMiddleware],
    AdvancedMiddlewareEndpoint.prototype,
    'post'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key', 'x-trace-id', 'authorization'],
            requiredBody: ['action', 'data']
        }
    },
    AdvancedMiddlewareEndpoint.prototype,
    'post'
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 10000 },
    AdvancedMiddlewareEndpoint.prototype,
    'post'
);

// PUT endpoint - error handling focus
Reflect.defineMetadata(
    MetadataKeys.BEFORE,
    [errorHandlingMiddleware, authMiddleware],
    AdvancedMiddlewareEndpoint.prototype,
    'put'
);

Reflect.defineMetadata(
    MetadataKeys.VALIDATE,
    {
        requirements: {
            requiredHeaders: ['x-api-key'],
            requiredBody: []
        }
    },
    AdvancedMiddlewareEndpoint.prototype,
    'put'
);

Reflect.defineMetadata(
    MetadataKeys.TIMEOUT,
    { timeout: 5000 },
    AdvancedMiddlewareEndpoint.prototype,
    'put'
);

module.exports = AdvancedMiddlewareEndpoint;