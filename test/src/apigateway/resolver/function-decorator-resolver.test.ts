import {describe, it, expect} from '@jest/globals';
import {PatternResolver} from '../../../../src/apigateway/resolver/pattern-resolver';
import {ImportManager} from '../../../../src/apigateway/resolver/import-manager';
import {Request} from '../../../../src/apigateway/request';
import {Response} from '../../../../src/apigateway/response';
import {MetadataKeys, getMetadata, ValidationMetadata, TimeoutMetadata, RouteMetadata, AuthMetadata} from '../../../../src/decorators/metadata';
import * as mockData from '../../../mocks/apigateway/mock-data';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';

describe('Test Function Decorator Resolver: src/apigateway/resolver/pattern-resolver with function decorator patterns', () => {
    describe('test route decorator function patterns', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/function-decorators/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should resolve route-decorated function', () => {
            const mock = mockData.getFunctionDecoratorRouteEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request);

            // Should return an object with HTTP method functions
            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('get');
            expect(result).toHaveProperty('post');
            expect(result).toHaveProperty('put');
        });

        it('should have @Route metadata on individual functions', () => {
            const mock = mockData.getFunctionDecoratorRouteEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // Check GET function has route metadata
            const getRouteMetadata = getMetadata<RouteMetadata>(
                MetadataKeys.ROUTE,
                handlers.get
            );
            
            expect(getRouteMetadata).toBeDefined();
            expect(getRouteMetadata!.method).toBe('GET');
            expect(getRouteMetadata!.path).toBe('/basic-route');

            // Check POST function has route metadata
            const postRouteMetadata = getMetadata<RouteMetadata>(
                MetadataKeys.ROUTE,
                handlers.post
            );
            
            expect(postRouteMetadata).toBeDefined();
            expect(postRouteMetadata!.method).toBe('POST');
            expect(postRouteMetadata!.path).toBe('/basic-route');
        });

        it('should execute route-decorated function correctly', async () => {
            const mock = mockData.getFunctionDecoratorRouteEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            const response = new Response();
            const result = await handlers.get(request, response);
            
            // Access rawBody since the function sets response.body directly
            const responseData = result.rawBody as any;
            expect(responseData.functionDecorator).toBe(true);
            expect(responseData.routeDecorator).toBe(true);
            expect(responseData.method).toBe('GET');
            expect(responseData.handler).toBe('basic-route-get');
            expect(responseData.timestamp).toBeDefined();
        });
    });

    describe('test auth decorator function patterns', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/function-decorators/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should resolve auth-decorated functions', () => {
            const mock = mockData.getFunctionDecoratorAuthEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request);

            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('get');
            expect(result).toHaveProperty('delete');
            expect(result).toHaveProperty('post');
            expect(result).toHaveProperty('put');
        });

        it('should have @Auth metadata on protected functions', () => {
            const mock = mockData.getFunctionDecoratorAuthEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // GET function should have basic auth
            const getAuthMetadata = getMetadata<any>(
                MetadataKeys.AUTH,
                handlers.get
            );
            
            expect(getAuthMetadata).toBeDefined();
            expect(getAuthMetadata!.required).toBe(true);
            expect(getAuthMetadata!.roles).toBeUndefined(); // No specific roles

            // DELETE function should have admin auth
            const deleteAuthMetadata = getMetadata<any>(
                MetadataKeys.AUTH,
                handlers.delete
            );
            
            expect(deleteAuthMetadata).toBeDefined();
            expect(deleteAuthMetadata!.required).toBe(true);
            expect(deleteAuthMetadata!.roles).toEqual(['admin']);

            // POST function should have no auth metadata (public)
            const postAuthMetadata = getMetadata<AuthMetadata>(
                MetadataKeys.AUTH,
                handlers.post
            );
            
            expect(postAuthMetadata).toBeUndefined();
        });

        it('should execute auth-decorated function with auth context', async () => {
            const mock = mockData.getFunctionDecoratorAuthEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            
            // Set up auth context (simulating auth middleware)
            request.context = {
                auth: {
                    authenticated: true,
                    user: { id: 'test-user', name: 'Test User' },
                    roles: ['user']
                }
            };
            
            const handlers = resolver.resolve(request) as any;
            const response = new Response();
            const result = await handlers.get(request, response);
            
            const responseData = result.rawBody as any;
            expect(responseData.functionDecorator).toBe(true);
            expect(responseData.authDecorator).toBe(true);
            expect(responseData.authenticated).toBe(true);
            expect(responseData.user).toEqual({ id: 'test-user', name: 'Test User' });
        });

        it('should handle admin-only auth function', async () => {
            const mock = mockData.getFunctionDecoratorAuthAdminEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            
            // Set up admin auth context
            request.context = {
                auth: {
                    authenticated: true,
                    user: { id: 'admin-user', name: 'Admin User' },
                    roles: ['admin']
                }
            };
            
            const handlers = resolver.resolve(request) as any;
            const response = new Response();
            const result = await handlers.delete(request, response);
            
            const responseData = result.rawBody as any;
            expect(responseData.functionDecorator).toBe(true);
            expect(responseData.authDecorator).toBe(true);
            expect(responseData.authenticated).toBe(true);
            expect(responseData.roles).toEqual(['admin']);
            expect(responseData.adminAccess).toBe(true);
        });
    });

    describe('test combined decorator function patterns', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/function-decorators/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should resolve combined decorator functions', () => {
            const mock = mockData.getFunctionDecoratorCombinedEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request);

            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('post');
            expect(result).toHaveProperty('get');
            expect(result).toHaveProperty('put');
        });

        it('should have all decorator metadata on complex POST function', () => {
            const mock = mockData.getFunctionDecoratorCombinedEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // Check all decorator metadata types
            const routeMetadata = getMetadata<RouteMetadata>(MetadataKeys.ROUTE, handlers.post);
            const authMetadata = getMetadata<any>(MetadataKeys.AUTH, handlers.post);
            const validateMetadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, handlers.post);
            const timeoutMetadata = getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, handlers.post);
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, handlers.post);
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, handlers.post);
            
            expect(routeMetadata).toBeDefined();
            expect(routeMetadata!.method).toBe('POST');
            expect(routeMetadata!.path).toBe('/complex');
            
            expect(authMetadata).toBeDefined();
            expect(authMetadata!.required).toBe(true);
            expect(authMetadata!.roles).toEqual(['admin']);
            
            expect(validateMetadata).toBeDefined();
            expect(validateMetadata!.requirements.requiredHeaders).toContain('x-api-key');
            expect(validateMetadata!.requirements.requiredHeaders).toContain('authorization');
            
            expect(timeoutMetadata).toBeDefined();
            expect(timeoutMetadata!.timeout).toBe(3000);
            
            expect(beforeMetadata).toBeDefined();
            expect(beforeMetadata).toHaveLength(1);
            
            expect(afterMetadata).toBeDefined();
            expect(afterMetadata).toHaveLength(1);
        });

        it('should execute complex decorated function with all middleware', async () => {
            const mock = mockData.getFunctionDecoratorCombinedEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            
            // Set up context for auth and middleware
            request.context = {
                auth: {
                    authenticated: true,
                    user: { id: 'admin-user', name: 'Admin User' },
                    roles: ['admin']
                }
            };
            
            const handlers = resolver.resolve(request) as any;
            
            // Execute before middleware
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, handlers.post);
            const response = new Response();
            
            if (beforeMetadata && beforeMetadata.length > 0) {
                await beforeMetadata[0](request, response);
            }
            
            // Execute main function
            const result = await handlers.post(request, response);
            
            // Execute after middleware
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, handlers.post);
            if (afterMetadata && afterMetadata.length > 0) {
                await afterMetadata[0](request, result);
            }
            
            const responseData = result.rawBody as any;
            expect(responseData.functionDecorator).toBe(true);
            expect(responseData.combinedDecorators).toBe(true);
            expect(responseData.beforeMiddleware).toBe(true);
            expect(responseData.loggedAt).toBeDefined();
            
            // Check after middleware effects
            const rawBody = result.rawBody as any;
            expect(rawBody.auditMiddleware).toBe(true);
            expect(rawBody.auditedAt).toBeDefined();
            expect(rawBody.auditTrail).toBeDefined();
        });

        it('should handle timeout metadata on PUT function', () => {
            const mock = mockData.getFunctionDecoratorTimeoutEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            const timeoutMetadata = getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, handlers.put);
            
            expect(timeoutMetadata).toBeDefined();
            expect(timeoutMetadata!.timeout).toBe(5000);
        });

        it('should execute timeout function correctly', async () => {
            const mock = mockData.getFunctionDecoratorTimeoutEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            const response = new Response();
            const result = await handlers.put(request, response);
            
            const responseData = result.rawBody as any;
            expect(responseData.functionDecorator).toBe(true);
            expect(responseData.combinedDecorators).toBe(true);
            expect(responseData.timeoutSet).toBe(true);
            expect(responseData.timeoutValue).toBe(5000);
        });
    });

    describe('test function decorator metadata integrity', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/function-decorators/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should preserve metadata between different function patterns', () => {
            // Test route decorators
            const routeMock = mockData.getFunctionDecoratorRouteEvent() as APIGatewayProxyEvent;
            const routeRequest = new Request(routeMock);
            const routeHandlers = resolver.resolve(routeRequest) as any;
            
            // Test auth decorators
            const authMock = mockData.getFunctionDecoratorAuthEvent() as APIGatewayProxyEvent;
            const authRequest = new Request(authMock);
            const authHandlers = resolver.resolve(authRequest) as any;
            
            // Verify route metadata exists and auth metadata doesn't on route handlers
            const routeMetadata = getMetadata(MetadataKeys.ROUTE, routeHandlers.get);
            const authMetadata = getMetadata(MetadataKeys.AUTH, routeHandlers.get);
            
            expect(routeMetadata).toBeDefined();
            expect(authMetadata).toBeUndefined(); // Route handlers don't have auth
            
            // Verify both route and auth metadata exist on auth handlers
            const authRouteMetadata = getMetadata(MetadataKeys.ROUTE, authHandlers.get);
            const authAuthMetadata = getMetadata(MetadataKeys.AUTH, authHandlers.get);
            
            expect(authRouteMetadata).toBeDefined();
            expect(authAuthMetadata).toBeDefined();
        });

        it('should handle missing function decorators gracefully', () => {
            const mock = mockData.getFunctionDecoratorCustomPattern('nonexistent-pattern', 'nonexistent-route') as APIGatewayProxyEvent;
            const request = new Request(mock);
            
            try {
                resolver.resolve(request);
                expect(false).toBe(true); // Should not reach here
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });

        it('should differentiate metadata between functions in same module', () => {
            const mock = mockData.getFunctionDecoratorCombinedEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const handlers = resolver.resolve(request) as any;
            
            // POST should have all decorators
            const postAuthMetadata = getMetadata(MetadataKeys.AUTH, handlers.post);
            const postTimeoutMetadata = getMetadata(MetadataKeys.TIMEOUT, handlers.post);
            
            // GET should have different set of decorators
            const getAuthMetadata = getMetadata(MetadataKeys.AUTH, handlers.get);
            const getTimeoutMetadata = getMetadata(MetadataKeys.TIMEOUT, handlers.get);
            
            // PUT should have only timeout
            const putAuthMetadata = getMetadata(MetadataKeys.AUTH, handlers.put);
            const putTimeoutMetadata = getMetadata(MetadataKeys.TIMEOUT, handlers.put);
            
            expect(postAuthMetadata).toBeDefined();
            expect(postTimeoutMetadata).toBeDefined();
            
            expect(getAuthMetadata).toBeDefined();
            expect(getTimeoutMetadata).toBeUndefined(); // GET doesn't have timeout
            
            expect(putAuthMetadata).toBeUndefined(); // PUT doesn't have auth
            expect(putTimeoutMetadata).toBeDefined();
        });
    });

    describe('test function vs class decorator pattern compatibility', () => {
        const functionPattern = 'test/mocks/apigateway/mock-decorator-patterns/function-decorators/**/*.controller.js';
        const classPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        
        it('should handle both function and class patterns with different resolvers', () => {
            const functionImporter = new ImportManager();
            const functionResolver = new PatternResolver({handlerPattern: functionPattern, basePath}, functionImporter);
            
            const classImporter = new ImportManager();
            const classResolver = new PatternResolver({handlerPattern: classPattern, basePath}, classImporter);
            
            // Function pattern test
            const functionMock = mockData.getFunctionDecoratorRouteEvent() as APIGatewayProxyEvent;
            const functionRequest = new Request(functionMock);
            const functionResult = functionResolver.resolve(functionRequest);
            
            // Class pattern test
            const classMock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const classRequest = new Request(classMock);
            const classResult = classResolver.resolve(classRequest);
            
            // Both should resolve successfully but return different structures
            expect(typeof functionResult).toBe('object'); // Functions return object with methods
            expect(typeof classResult).toBe('function'); // Classes return constructor function
            
            // Function result should have methods directly
            expect(functionResult).toHaveProperty('get');
            expect(typeof (functionResult as any).get).toBe('function');
            
            // Class result should have prototype with methods
            expect((classResult as any).prototype).toBeDefined();
            expect(typeof (classResult as any).prototype.get).toBe('function');
        });
    });
});