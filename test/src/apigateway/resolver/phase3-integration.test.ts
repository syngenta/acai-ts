import {describe, it, expect} from '@jest/globals';
import {PatternResolver} from '../../../../src/apigateway/resolver/pattern-resolver';
import {ImportManager} from '../../../../src/apigateway/resolver/import-manager';
import {Request} from '../../../../src/apigateway/request';
import {Response} from '../../../../src/apigateway/response';
import {MetadataKeys, getMetadata} from '../../../../src/decorators/metadata';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';

describe('Phase 3 Integration Tests: Complex Scenarios with Full Request-Response Cycles', () => {
    describe('Advanced Middleware Chain Integration', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should execute full middleware chain with advanced patterns', async () => {
            // Create a custom event for advanced middleware endpoint
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/middleware-chains/advanced-middleware',
                httpMethod: 'GET',
                headers: {
                    'x-api-key': 'ADVANCED-MIDDLEWARE-KEY',
                    'x-trace-id': 'trace-12345',
                    'authorization': 'Bearer advanced-token'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                requestContext: {
                    resourceId: 'advanced-middleware-resource',
                    authorizer: {
                        apiKey: 'ADVANCED-MIDDLEWARE-KEY',
                        userId: 'advanced-user',
                        correlationId: 'advanced-test-123',
                        principalId: '9de3f415a97e410386dbef146e88744e',
                        integrationLatency: 300
                    }
                } as any,
                pathParameters: {
                    proxy: 'middleware-chains/advanced-middleware'
                },
                multiValueQueryStringParameters: null,
                resource: '/{proxy+}',
                queryStringParameters: {
                    test: 'middleware-chain'
                },
                body: JSON.stringify({
                    test_data: 'middleware_chain_test'
                })
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Execute full middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'get');
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, EndpointClass.prototype, 'get');
            
            expect(beforeMetadata).toHaveLength(3); // auth, rateLimit, log
            expect(afterMetadata).toHaveLength(3); // audit, metrics, cleanup

            // Execute before middleware chain
            const response = new Response();
            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            // Execute main handler
            const result = await instance.get(request, response);

            // Execute after middleware chain
            for (const middleware of afterMetadata!) {
                await middleware(request, result);
            }

            // Verify the complete middleware execution
            const responseData = result.rawBody as any;
            expect(responseData.middleware.beforeChain).toEqual(['auth', 'rateLimit', 'logging']);
            expect(responseData.middleware.afterChain).toEqual(['audit', 'metrics', 'cleanup']);
            expect(responseData.middleware.executionOrder).toContain('auth-before');
            expect(responseData.middleware.executionOrder).toContain('audit-after');
            
            expect(responseData.audit).toBeDefined();
            expect(responseData.metrics).toBeDefined();
            expect(responseData.cleanup).toBeDefined();
        });

        it('should handle middleware chain errors and edge cases', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/middleware-chains/advanced-middleware',
                httpMethod: 'POST',
                headers: {
                    'x-api-key': 'ADVANCED-MIDDLEWARE-KEY',
                    'x-trace-id': 'trace-error-test',
                    'authorization': 'Bearer advanced-token',
                    'x-rate-limit': 'exceeded' // Trigger rate limit error
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'middleware-chains/advanced-middleware' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({ test: 'error-handling' })
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Execute middleware chain with rate limit exceeded
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'post');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.post(request, response);
            const responseData = result.rawBody as any;

            // Verify error was captured by middleware
            expect(responseData.middleware.errors).toContain('Rate limit exceeded');
            expect(responseData.processing.rateLimited).toBe(true);
        });
    });

    describe('Hybrid Pattern Integration Tests', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/hybrid-patterns/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should handle legacy method with traditional requirements', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/mixed-approaches/legacy-migration',
                httpMethod: 'GET',
                headers: { 'x-api-key': 'LEGACY-KEY' },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'mixed-approaches/legacy-migration' },
                multiValueQueryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                queryStringParameters: { version: '1.0' },
                body: JSON.stringify({})
            };

            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // Verify requirements exist for legacy method
            expect(handlers.requirements).toBeDefined();
            expect(handlers.requirements.get).toBeDefined();
            expect(handlers.requirements.get.requiredHeaders).toContain('x-api-key');
            
            const response = new Response();
            const result = await handlers.get(request, response);
            
            const responseData = result.rawBody as any;
            expect(responseData.migration.status).toBe('not-migrated');
            expect(responseData.migration.usesRequirements).toBe(true);
            expect(responseData.migration.usesDecorators).toBe(false);
        });

        it('should handle transitional method with hybrid approach', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/mixed-approaches/legacy-migration',
                httpMethod: 'POST',
                headers: {
                    'x-api-key': 'HYBRID-KEY',
                    'authorization': 'Bearer hybrid-token',
                    'x-migration-flag': 'true'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'mixed-approaches/legacy-migration' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({
                    action: 'migrate',
                    data: { test: 'hybrid' }
                })
            };

            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // Verify both requirements and decorator metadata exist
            expect(handlers.requirements.post).toBeDefined();
            
            const decoratorMetadata = getMetadata(MetadataKeys.VALIDATE, handlers.post);
            expect(decoratorMetadata).toBeDefined();
            
            // Execute with decorator middleware
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, handlers.post);
            const response = new Response();
            
            if (beforeMetadata) {
                for (const middleware of beforeMetadata) {
                    await middleware(request, response);
                }
            }
            
            const result = await handlers.post(request, response);
            const responseData = result.rawBody as any;
            
            expect(responseData.migration.status).toBe('in-progress');
            expect(responseData.migration.usesRequirements).toBe(true);
            expect(responseData.migration.usesDecorators).toBe(true);
            expect(responseData.processing.decoratorBefore).toBe(true);
        });

        it('should handle fully migrated method with decorators only', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/mixed-approaches/legacy-migration',
                httpMethod: 'PUT',
                headers: {
                    'x-api-key': 'MIGRATED-KEY',
                    'authorization': 'Bearer admin-token'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'mixed-approaches/legacy-migration' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({
                    data: { name: 'updated-resource' }
                })
            };

            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // Verify no requirements for fully migrated method
            expect(handlers.requirements.put).toBeUndefined();
            
            // But decorator metadata should exist
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, handlers.put);
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, handlers.put);
            
            expect(beforeMetadata).toHaveLength(2); // migration + auth
            expect(afterMetadata).toHaveLength(1); // migration after
            
            // Execute full decorator chain
            const response = new Response();
            
            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }
            
            const result = await handlers.put(request, response);
            
            for (const middleware of afterMetadata!) {
                await middleware(request, result);
            }
            
            const responseData = result.rawBody as any;
            expect(responseData.migration.status).toBe('complete');
            expect(responseData.migration.usesDecorators).toBe(true);
            expect(responseData.processing.authenticated).toBe(true);
            expect(responseData.migrationAfter.migrationComplete).toBe(true);
        });
    });

    describe('Complex Validation Integration Tests', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should handle complex nested validation with business rules', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/nested-routing/complex-validation',
                httpMethod: 'POST',
                headers: {
                    'x-api-key': 'VALIDATION-KEY',
                    'content-type': 'application/json'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'nested-routing/complex-validation' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({
                    user: {
                        name: 'Test User',
                        email: 'test@example.com',
                        address: {
                            street: '123 Test St',
                            city: 'Test City'
                        }
                    },
                    items: [
                        { id: 'item-1', name: 'Test Item', quantity: 2, price: 100 },
                        { id: 'item-2', name: 'Test Item 2', quantity: 1, price: 50 }
                    ],
                    action: 'create-order'
                })
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Execute validation middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'post');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.post(request, response);
            const responseData = result.rawBody as any;

            expect(responseData.validation.type).toBe('complex-nested-validation');
            expect(responseData.validation.passed).toBe(true);
            expect(responseData.validation.customValidators).toContain('array-items-validator');
        });

        it('should handle validation failures with detailed error messages', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/nested-routing/complex-validation',
                httpMethod: 'POST',
                headers: {
                    'x-api-key': 'VALIDATION-KEY',
                    'content-type': 'application/json'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'nested-routing/complex-validation' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({
                    user: {
                        name: 'X', // Too short
                        email: 'invalid-email', // Invalid format
                        address: {
                            street: '123 Test St'
                            // Missing city
                        }
                    },
                    items: [
                        { id: 'item-1', name: 'Test Item' }, // Missing quantity
                        { name: 'Test Item 2', quantity: 1, price: 50 } // Missing id
                    ],
                    action: 'admin-action' // Requires admin role
                })
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;

            // Execute validation middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'post');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            // Initialize context if not exists
            if (!request.context) request.context = {};
            
            // Check validation context
            const validationResults = (request.context as any).validation;
            expect(validationResults?.passed).toBe(false);
            expect(validationResults?.errors).toContain('User name must be a string with at least 2 characters');
            expect(validationResults?.errors).toContain('User email must be a valid email address');
            expect(validationResults?.errors).toContain('Address must include street and city');
        });

        it('should handle conditional validation scenarios', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/nested-routing/complex-validation',
                httpMethod: 'PUT',
                headers: { 'x-api-key': 'VALIDATION-KEY' },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'nested-routing/complex-validation' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: JSON.stringify({
                    payment_method: 'credit_card',
                    credit_card_info: {
                        number: '1234-5678-9012-3456',
                        expiry: '12/25'
                    },
                    shipping_method: 'express',
                    shipping_address: {
                        street: '456 Express Ave',
                        city: 'Fast City'
                    }
                })
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Execute conditional validation
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'put');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.put(request, response);
            const responseData = result.rawBody as any;

            expect(responseData.validation.type).toBe('conditional-validation');
            expect(responseData.validation.passed).toBe(true);
            expect(responseData.validation.conditionalFields).toEqual(['credit_card_info', 'shipping_address']);
        });
    });

    describe('Nested Routing and Path Parameters Integration', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should handle deeply nested resource paths with hierarchical validation', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/path-parameters/nested-resources',
                httpMethod: 'GET',
                headers: { 'x-api-key': 'NESTED-KEY' },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: {
                    proxy: 'path-parameters/nested-resources',
                    orgId: 'org-12345678',
                    projectId: 'proj-87654321',
                    resourceId: 'res-11223344'
                },
                multiValueQueryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                queryStringParameters: {},
                body: null
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Execute path parameter middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'get');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.get(request, response);
            const responseData = result.rawBody as any;

            expect(responseData.routing.type).toBe('deeply-nested-resource');
            expect(responseData.routing.hierarchy).toEqual(['organization', 'project', 'resource']);
            expect(responseData.routing.extractedIds).toEqual({
                organizationId: 'org-12345678',
                projectId: 'proj-87654321',
                resourceId: 'res-11223344'
            });
            
            expect(responseData.resource.organization).toBeDefined();
            expect(responseData.resource.project).toBeDefined();
            expect(responseData.resource.resource).toBeDefined();
        });

        it('should handle cascade delete validation with dependencies', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/path-parameters/nested-resources',
                httpMethod: 'DELETE',
                headers: {
                    'x-api-key': 'NESTED-KEY',
                    'authorization': 'Bearer admin-token'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: {
                    proxy: 'path-parameters/nested-resources',
                    orgId: 'org-12345678',
                    projectId: 'proj-87654321',
                    resourceId: 'res-has-dependents' // This triggers dependency check
                },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: null
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Set up auth context for admin permissions
            request.context = {
                auth: {
                    authenticated: true,
                    roles: ['admin']
                }
            };

            // Execute full middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'delete');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.delete(request, response);
            
            // Should return conflict due to dependencies
            expect(result.statusCode).toBe(409);
            expect(result.rawBody.error).toContain('Cannot delete resource with dependent resources');
            expect(result.rawBody.cascade.dependentTypes).toEqual(['database', 'storage']);
        });

        it('should handle successful cascade delete without dependencies', async () => {
            const mock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/path-parameters/nested-resources',
                httpMethod: 'DELETE',
                headers: {
                    'x-api-key': 'NESTED-KEY',
                    'authorization': 'Bearer admin-token'
                },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: {
                    proxy: 'path-parameters/nested-resources',
                    orgId: 'org-12345678',
                    projectId: 'proj-87654321',
                    resourceId: 'res-no-dependents' // This has no dependencies
                },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: null
            };

            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            const instance = new EndpointClass();

            // Set up auth context
            request.context = {
                auth: {
                    authenticated: true,
                    roles: ['admin']
                }
            };

            // Execute full middleware chain
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, EndpointClass.prototype, 'delete');
            const response = new Response();

            for (const middleware of beforeMetadata!) {
                await middleware(request, response);
            }

            const result = await instance.delete(request, response);
            const responseData = result.rawBody as any;

            expect(result.statusCode).not.toBe(409);
            expect(responseData.routing.type).toBe('cascade-delete-nested-resource');
            expect(responseData.deleted.cascadeActions).toContain('cleanup_resource_references');
            expect(responseData.action).toBe('resource-deleted');
        });
    });

    describe('End-to-End Integration Scenarios', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/**/*.{controller,endpoint}.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should demonstrate compatibility between class and function decorator patterns', async () => {
            // Test class-based endpoint
            const classMock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/basic-endpoints/basic',
                httpMethod: 'GET',
                headers: { 'x-api-key': 'CLASS-TEST' },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'basic-endpoints/basic' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: null
            };

            // Test function-based endpoint
            const functionMock: APIGatewayProxyEvent = {
                path: 'unit-test/v1/route-decorators/basic-route',
                httpMethod: 'GET',
                headers: { 'x-api-key': 'FUNCTION-TEST' },
                multiValueHeaders: {},
                isBase64Encoded: false,
                stageVariables: null,
                pathParameters: { proxy: 'route-decorators/basic-route' },
                multiValueQueryStringParameters: null,
                queryStringParameters: null,
                resource: '/{proxy+}',
                requestContext: {} as any,
                body: null
            };

            const classRequest = new Request(classMock);
            const functionRequest = new Request(functionMock);

            const classResult = resolver.resolve(classRequest);
            const functionResult = resolver.resolve(functionRequest);

// Resolver successfully found both endpoints

            // Both should resolve but have different structures
            expect(typeof classResult).toBe('function'); // Class constructor
            expect(typeof functionResult).toBe('object'); // Function exports

            // Both should have decorator metadata
            const classMetadata = getMetadata(MetadataKeys.BEFORE, (classResult as any).prototype, 'get');
            const functionMetadata = getMetadata(MetadataKeys.ROUTE, (functionResult as any).get);

            expect(classMetadata).toBeDefined();
            expect(functionMetadata).toBeDefined();
        });

        it('should handle comprehensive error scenarios across all patterns', async () => {
            const scenarios = [
                {
                    name: 'Class-based validation failure',
                    mock: {
                        path: 'unit-test/v1/basic-endpoints/basic',
                        httpMethod: 'GET',
                        headers: {}, // Missing x-api-key
                        multiValueHeaders: {},
                        isBase64Encoded: false,
                        stageVariables: null,
                        pathParameters: { proxy: 'basic-endpoints/basic' },
                        multiValueQueryStringParameters: null,
                        queryStringParameters: null,
                        resource: '/{proxy+}',
                        requestContext: {} as any,
                        body: null
                    } as APIGatewayProxyEvent
                },
                {
                    name: 'Function-based auth failure',
                    mock: {
                        path: 'unit-test/v1/auth-decorators/auth-protected/admin',
                        httpMethod: 'DELETE',
                        headers: { 'x-api-key': 'AUTH-TEST' }, // Missing authorization
                        multiValueHeaders: {},
                        isBase64Encoded: false,
                        stageVariables: null,
                        pathParameters: { proxy: 'auth-decorators/auth-protected/admin' },
                        multiValueQueryStringParameters: null,
                        queryStringParameters: null,
                        resource: '/{proxy+}',
                        requestContext: {} as any,
                        body: null
                    } as APIGatewayProxyEvent
                },
                {
                    name: 'Hybrid pattern requirements failure',
                    mock: {
                        path: 'unit-test/v1/mixed-approaches/legacy-migration',
                        httpMethod: 'GET',
                        headers: {}, // Missing required header for legacy method
                        multiValueHeaders: {},
                        isBase64Encoded: false,
                        stageVariables: null,
                        pathParameters: { proxy: 'mixed-approaches/legacy-migration' },
                        multiValueQueryStringParameters: null,
                        resource: '/{proxy+}',
                        requestContext: {} as any,
                        body: null,
                        queryStringParameters: {} // Missing required version query
                    } as APIGatewayProxyEvent
                }
            ];

            for (const scenario of scenarios) {
                const request = new Request(scenario.mock);
                
                try {
                    const result = resolver.resolve(request);
                    
                    // If resolution succeeds, the validation should catch errors during execution
                    if (typeof result === 'function') {
                        // Class-based
                        const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, (result as any).prototype, scenario.mock.httpMethod?.toLowerCase());
                        
                        if (beforeMetadata) {
                            const response = new Response();
                            for (const middleware of beforeMetadata) {
                                await middleware(request, response);
                            }
                            
                            // Initialize context if not exists and check validation
                            if (!request.context) request.context = {};
                            const validationResults = (request.context as any).validation;
                            if (validationResults) {
                                expect(validationResults.passed).toBe(false);
                            }
                        }
                    }
                } catch (error: any) {
                    // Some patterns might throw immediately for missing routes
                    expect(error.code).toBe(404);
                }
            }
        });
    });
});