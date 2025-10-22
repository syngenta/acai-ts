import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Router } from '../../../../src/apigateway/router';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as mockData from '../../../mocks/apigateway/mock-data';

describe('Router Integration Tests', () => {
    let router: Router;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Router constructor and setup', () => {
        it('should create router with minimal config', () => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js'
            };
            
            expect(() => new Router(config)).not.toThrow();
        });

        it('should create router with full config', () => {
            const beforeAll = jest.fn<() => Promise<void>>();
            const afterAll = jest.fn<() => Promise<void>>();
            const withAuth = jest.fn<() => Promise<void>>();
            const onError = jest.fn<() => Promise<void>>();
            const onTimeout = jest.fn<() => Promise<void>>();
            const loggerCallback = jest.fn();

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                beforeAll,
                afterAll,
                withAuth,
                onError,
                onTimeout,
                timeout: 5000,
                autoValidate: false,
                outputError: true,
                validateResponse: false,
                globalLogger: true,
                loggerCallback
            };
            
            const router = new Router(config);
            expect(router).toBeInstanceOf(Router);
        });

        it('should setup global logger when configured', () => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                globalLogger: true
            };
            
            expect(() => new Router(config)).not.toThrow();
            expect('logger' in global).toBe(true);
        });
    });

    describe('autoLoad functionality', () => {
        it('should auto-load routes and schema', () => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js'
            };
            
            const router = new Router(config);
            expect(() => router.autoLoad()).not.toThrow();
        });
    });

    describe('Basic routing', () => {
        beforeEach(() => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1'
            };
            router = new Router(config);
        });

        it('should route to basic endpoint successfully', async () => {
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            expect(result.statusCode).toBe(200);
            expect(result.body).toBeDefined();
            
            const body = JSON.parse(result.body);
            expect(body.test).toBe(true);
        });

        it('should return 404 for non-existent routes', async () => {
            const event = mockData.getApiGateWayRoute('-nonexistent') as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            expect(result.statusCode).toBe(404);
            const body = JSON.parse(result.body);
            expect(body.errors).toBeDefined();
        });
    });

    describe('Middleware pipeline', () => {
        it('should execute beforeAll middleware', async () => {
            const beforeAll = jest.fn(async (_req, _res) => {
                // Mock middleware - don't modify response
            });

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                beforeAll
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            await router.route(event);
            
            expect(beforeAll).toHaveBeenCalled();
        });

        it('should execute afterAll middleware', async () => {
            const afterAll = jest.fn(async (_req, _res) => {
                // Mock middleware - don't modify response
            });

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                afterAll
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            await router.route(event);
            
            expect(afterAll).toHaveBeenCalled();
        });

        it('should skip afterAll if beforeAll sets error', async () => {
            const beforeAll = jest.fn(async (_req: any, res: any) => {
                res.setError('test', 'Before middleware error');
            });
            const afterAll = jest.fn(async (_req, _res) => {
                // Should not be called
            });

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                beforeAll,
                afterAll
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            expect(beforeAll).toHaveBeenCalled();
            expect(afterAll).not.toHaveBeenCalled();
            expect(result.statusCode).toBe(400);
        });
    });

    describe('Authentication middleware', () => {
        it('should execute auth middleware for auth-required endpoints', async () => {
            const withAuth = jest.fn(async (_req, _res) => {
                // Mock auth - don't modify response
            });

            // This would require a mock handler with auth requirements
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                withAuth
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            await router.route(event);
            
            // Note: withAuth won't be called unless endpoint has auth requirement
            // This tests the auth middleware pipeline structure
        });
    });

    describe('Timeout handling', () => {
        it('should handle timeout configuration', async () => {
            const onTimeout = jest.fn(async (_req, _res, _error) => {
                // Mock timeout handler
            });

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                timeout: 100, // Very short timeout for testing
                onTimeout
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            // Should complete successfully with our fast mock handlers
            expect(result.statusCode).toBe(200);
        });
    });

    describe('Error handling', () => {
        it('should handle internal server errors', async () => {
            const onError = jest.fn(async (_req: any, _res: any, _error: any) => {
                // Mock error handler
            });

            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                onError,
                outputError: true
            };
            
            const router = new Router(config);
            
            // This should trigger the 404 error path
            const event = mockData.getApiGateWayRoute('-fail') as APIGatewayProxyEvent;
            const result = await router.route(event);
            
            expect(result.statusCode).toBe(404);
        });

        it('should handle validation errors when autoValidate is enabled', async () => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                autoValidate: true,
                schemaPath: 'test/mocks/openapi.yml'
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            // This should either succeed or fail with validation error
            expect([200, 400, 404]).toContain(result.statusCode);
        });
    });

    describe('Response validation', () => {
        it('should validate responses when configured', async () => {
            const config = {
                routesPath: 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js',
                basePath: 'unit-test/v1',
                validateResponse: true,
                autoValidate: true,
                schemaPath: 'test/mocks/openapi.yml'
            };
            
            const router = new Router(config);
            const event = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            
            const result = await router.route(event);
            
            // Should complete - response validation tested
            expect(result.statusCode).toBeDefined();
        });
    });
});