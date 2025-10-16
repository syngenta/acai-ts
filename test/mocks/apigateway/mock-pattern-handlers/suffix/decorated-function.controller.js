const { Before, After, Route } = require('../../../../../src/decorators');
require('reflect-metadata');

// Mock middleware functions
const beforeMiddleware = async (request, response) => {
    request.context = { decoratorBefore: true, timestamp: new Date().toISOString() };
};

const afterMiddleware = async (request, response) => {
    if (response.rawBody && typeof response.rawBody === 'object') {
        response.rawBody.decoratorAfter = true;
    }
};

// Decorated function export
const get = Before(beforeMiddleware)(
    After(afterMiddleware)(
        Route('GET', '/decorated-function')(
            async (request, response) => {
                response.body = { 
                    test: true, 
                    decoratedFunction: true,
                    context: request.context 
                };
                return response;
            }
        )
    )
);

module.exports = { get };