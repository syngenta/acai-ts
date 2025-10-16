import {describe, it, expect} from '@jest/globals';
import {PatternResolver} from '../../../../src/apigateway/resolver/pattern-resolver';
import {ImportManager} from '../../../../src/apigateway/resolver/import-manager';
import {Request} from '../../../../src/apigateway/request';
import {Response} from '../../../../src/apigateway/response';
import {MetadataKeys, getMetadata, ValidationMetadata, TimeoutMetadata} from '../../../../src/decorators/metadata';
import * as mockData from '../../../mocks/apigateway/mock-data';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';

describe('Test Decorator Pattern Resolver: src/apigateway/resolver/pattern-resolver with decorator patterns', () => {
    describe('test class-based decorator pattern routing', () => {
        // Test with basic endpoint decorator pattern
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should resolve decorator class-based endpoint', () => {
            const mock = mockData.getDecoratorCustomRoute('basic') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;

            // Should return a class constructor
            expect(typeof result).toBe('function');
            expect(result.prototype).toBeDefined();
        });

        it('should instantiate decorator class and access methods', () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Instantiate the class
            const instance = new EndpointClass();
            
            // Should have HTTP methods
            expect(typeof instance.get).toBe('function');
            expect(typeof instance.post).toBe('function');
            expect(typeof instance.put).toBe('function');
        });

        it('should have @Before middleware metadata on GET method', () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get metadata from the prototype
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(
                MetadataKeys.BEFORE,
                EndpointClass.prototype,
                'get'
            );
            
            expect(beforeMetadata).toBeDefined();
            expect(Array.isArray(beforeMetadata)).toBe(true);
            expect(beforeMetadata).toHaveLength(1);
            expect(typeof beforeMetadata![0]).toBe('function');
        });

        it('should have @Validate metadata on GET method', () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get validation metadata from the prototype
            const validateMetadata = getMetadata<ValidationMetadata>(
                MetadataKeys.VALIDATE,
                EndpointClass.prototype,
                'get'
            );
            
            expect(validateMetadata).toBeDefined();
            expect(validateMetadata!.requirements).toBeDefined();
            expect(validateMetadata!.requirements.requiredHeaders).toEqual(['x-api-key']);
        });

        it('should have @After middleware metadata on POST method', () => {
            const mock = mockData.getDecoratorBasicPostEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get after middleware metadata from the prototype
            const afterMetadata = getMetadata<AfterMiddleware[]>(
                MetadataKeys.AFTER,
                EndpointClass.prototype,
                'post'
            );
            
            expect(afterMetadata).toBeDefined();
            expect(Array.isArray(afterMetadata)).toBe(true);
            expect(afterMetadata).toHaveLength(1);
            expect(typeof afterMetadata![0]).toBe('function');
        });

        it('should have @Timeout metadata on POST method', () => {
            const mock = mockData.getDecoratorBasicPostEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get timeout metadata from the prototype
            const timeoutMetadata = getMetadata<TimeoutMetadata>(
                MetadataKeys.TIMEOUT,
                EndpointClass.prototype,
                'post'
            );
            
            expect(timeoutMetadata).toBeDefined();
            expect(timeoutMetadata!.timeout).toBe(5000);
        });

        it('should execute @Before middleware correctly', async () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get before middleware and execute it
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(
                MetadataKeys.BEFORE,
                EndpointClass.prototype,
                'get'
            );
            
            expect(beforeMetadata).toBeDefined();
            
            // Create mock response
            const response = new Response();
            
            // Execute the middleware
            await beforeMetadata![0](request, response);
            
            // Verify middleware set context on request
            expect(request.context).toBeDefined();
            expect((request.context as any).decoratorBefore).toBe(true);
            expect((request.context as any).timestamp).toBeDefined();
            expect((request.context as any).middleware).toBe('before-auth');
        });

        it('should execute @After middleware correctly', async () => {
            const mock = mockData.getDecoratorBasicPostEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Get after middleware and execute it
            const afterMetadata = getMetadata<AfterMiddleware[]>(
                MetadataKeys.AFTER,
                EndpointClass.prototype,
                'post'
            );
            
            expect(afterMetadata).toBeDefined();
            
            // Create mock response - set body which becomes rawBody getter
            const response = new Response();
            response.body = { test: true };
            
            // Execute the after middleware
            await afterMetadata![0](request, response);
            
            // Verify middleware modified response via rawBody getter
            const rawBody = (response.rawBody as any);
            expect(rawBody.decoratorAfter).toBe(true);
            expect(rawBody.processedAt).toBeDefined();
        });

        it('should not find decorator endpoint for invalid route', () => {
            const mock = mockData.getDecoratorCustomRoute('nonexistent-endpoint') as APIGatewayProxyEvent;
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
    });

    describe('test decorator metadata integrity', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-decorator-patterns/class-based/**/*.endpoint.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should preserve all decorator metadata types', () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // Check all expected metadata keys are present
            const getMetadataKeys = [
                MetadataKeys.BEFORE,
                MetadataKeys.VALIDATE
            ];
            
            const postMetadataKeys = [
                MetadataKeys.AFTER,
                MetadataKeys.TIMEOUT
            ];
            
            // Verify GET method metadata
            getMetadataKeys.forEach(key => {
                const metadata = getMetadata(key, EndpointClass.prototype, 'get');
                expect(metadata).toBeDefined();
            });
            
            // Verify POST method metadata
            postMetadataKeys.forEach(key => {
                const metadata = getMetadata(key, EndpointClass.prototype, 'post');
                expect(metadata).toBeDefined();
            });
            
            // Verify PUT method has no decorator metadata (as expected)
            const putBeforeMetadata = getMetadata(MetadataKeys.BEFORE, EndpointClass.prototype, 'put');
            expect(putBeforeMetadata).toBeUndefined();
        });

        it('should differentiate metadata between different methods', () => {
            const mock = mockData.getDecoratorBasicEvent() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const EndpointClass = resolver.resolve(request) as any;
            
            // GET method should have Before middleware, POST should not
            const getBeforeMetadata = getMetadata(MetadataKeys.BEFORE, EndpointClass.prototype, 'get');
            const postBeforeMetadata = getMetadata(MetadataKeys.BEFORE, EndpointClass.prototype, 'post');
            
            expect(getBeforeMetadata).toBeDefined();
            expect(postBeforeMetadata).toBeUndefined();
            
            // POST method should have After middleware, GET should not
            const getAfterMetadata = getMetadata(MetadataKeys.AFTER, EndpointClass.prototype, 'get');
            const postAfterMetadata = getMetadata(MetadataKeys.AFTER, EndpointClass.prototype, 'post');
            
            expect(getAfterMetadata).toBeUndefined();
            expect(postAfterMetadata).toBeDefined();
        });
    });
});