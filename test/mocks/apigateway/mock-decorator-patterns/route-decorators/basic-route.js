// basic-route.js - Main export file for route decorators
// This file exports the function-based handlers with route decorators
require('reflect-metadata');

const { MetadataKeys } = require('../../../../../src/decorators/metadata');

/**
 * Basic route-decorated functions - represents compiled TypeScript with @Route decorators
 * Original TypeScript would look like:
 * 
 * @Route('GET', '/basic-route')
 * export const get = async (request, response) => { ... }
 * 
 * @Route('POST', '/basic-route')
 * export const post = async (request, response) => { ... }
 */

// GET handler with @Route decorator
const get = async (request, response) => {
    response.body = {
        functionDecorator: true,
        routeDecorator: true,
        method: 'GET',
        handler: 'basic-route-get',
        timestamp: new Date().toISOString()
    };
    return response;
};

// POST handler with @Route decorator  
const post = async (request, response) => {
    response.body = {
        functionDecorator: true,
        routeDecorator: true,
        method: 'POST',
        handler: 'basic-route-post',
        data: request.body,
        timestamp: new Date().toISOString()
    };
    return response;
};

// PUT handler with @Route decorator
const put = async (request, response) => {
    response.body = {
        functionDecorator: true,
        routeDecorator: true,
        method: 'PUT',
        handler: 'basic-route-put',
        updated: true,
        data: request.body
    };
    return response;
};

// Simulate compiled @Route decorator metadata - this is what TypeScript compiler generates
// @Route('GET', '/basic-route') metadata
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    {
        method: 'GET',
        path: '/basic-route'
    },
    get
);

// @Route('POST', '/basic-route') metadata
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    {
        method: 'POST', 
        path: '/basic-route'
    },
    post
);

// @Route('PUT', '/basic-route') metadata
Reflect.defineMetadata(
    MetadataKeys.ROUTE,
    {
        method: 'PUT',
        path: '/basic-route'
    },
    put
);

// Export individual functions (function-based pattern)
module.exports = {
    get,
    post,
    put
};