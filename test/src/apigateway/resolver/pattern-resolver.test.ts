import {describe, it, expect} from '@jest/globals';
import {PatternResolver} from '../../../../src/apigateway/resolver/pattern-resolver';
import {ImportManager} from '../../../../src/apigateway/resolver/import-manager';
import {Request} from '../../../../src/apigateway/request';
import * as mockData from '../../../mocks/apigateway/mock-data';
import {APIGatewayProxyEvent} from 'aws-lambda';

describe('Test Pattern Resovler: src/apigateway/resolver/pattern-resolver', () => {
    describe('test suffix pattern routing', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/suffix/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvc structure', () => {
            const mock = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file with mvvm structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('mvvm') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.patch).toBe('function');
        });

        it('should find the file with nested mvc structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('nested-1/nested-2/basic') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the file with nested mvvm structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('nested-1/nested-2/nested-3') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.delete).toBe('function');
        });

        it('should not find the file', () => {
            const mock = mockData.getApiGateWayRoute('-fail') as APIGatewayProxyEvent;
            const request = new Request(mock);
            try {
                resolver.resolve(request);
                expect(false).toBe(true);
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });
    });

    describe('test prefix pattern routing', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/prefix/**/controller.*.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvc structure', () => {
            const mock = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file with mvvm structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('mvvm') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.patch).toBe('function');
        });

        it('should find the file with nested mvc structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('nested-1/nested-2/basic') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the file with nested mvvm structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('nested-1/nested-2/nested-3') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.delete).toBe('function');
        });

        it('should not find the file', () => {
            const mock = mockData.getApiGateWayRoute('-fail') as APIGatewayProxyEvent;
            const request = new Request(mock);
            try {
                resolver.resolve(request);
                expect(false).toBe(true);
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });
    });

    describe('test exact pattern routing', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvvm structure', () => {
            const mock = mockData.getApiGateWayRoute() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the file with nested mvvm structure', () => {
            const mock = mockData.getApiGateWayCustomRoute('nested-1/nested-2/nested-3') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should not find the file', () => {
            const mock = mockData.getApiGateWayRoute('-fail') as APIGatewayProxyEvent;
            const request = new Request(mock);
            try {
                resolver.resolve(request);
                expect(false).toBe(true);
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });
    });

    describe('test suffix pattern routing with path parameters', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/suffix/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvc structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('path-parameters/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('path-parameters-mvvm/1', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });

        it('should find the nested file with mvc structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/path-parameters/1', 'post') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/path-parameters-mvvm/1', 'patch') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.patch).toBe('function');
        });

        it('should find the nested file with mvc structure with trailing and middle parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/syngenta/path-parameters/1', 'delete') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.delete).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing and middle parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/syngenta/path-parameters-mvvm/1', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });
    });

    describe('test prefix pattern routing with path parameters', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/prefix/**/controller.*.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvc structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('path-parameters/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('path-parameters-mvvm/1', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });

        it('should find the nested file with mvc structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/path-parameters/1', 'post') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/path-parameters-mvvm/1', 'patch') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.patch).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing and middle parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/syngenta/path-parameters-mvvm/1', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });
    });

    describe('test exact pattern routing with path parameters', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/exact/**/controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('path-parameters/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/path-parameters/1', 'patch') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.patch).toBe('function');
        });

        it('should find the nested file with mvvm structure with trailing and middle parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('nested-1/syngenta/path-parameters/1', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });
    });

    describe('test routing with mvc structure', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/mvc/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with path parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('base/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file without path param', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/test', 'post') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the nested file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/some-param/1', 'delete') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.delete).toBe('function');
        });

        it('should find the double nested file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/some-param/nested/2', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });

        it('should not find the file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('not/found/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            try {
                resolver.resolve(request);
                expect(false).toBe(true);
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });
    });

    describe('test routing with mvvm structure', () => {
        const handlerPattern = 'test/mocks/apigateway/mock-pattern-handlers/mvvm/**/*.controller.js';
        const basePath = 'unit-test/v1';
        const importer = new ImportManager();
        const resolver = new PatternResolver({handlerPattern, basePath}, importer);

        it('should find the file with path parameter', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('base/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.get).toBe('function');
        });

        it('should find the file without path param', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/test', 'post') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.post).toBe('function');
        });

        it('should find the nested file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/some-param/1', 'delete') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.delete).toBe('function');
        });

        it('should find the double nested file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('params/some-param/nested/2', 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            const result = resolver.resolve(request) as any;
            expect(typeof result.put).toBe('function');
        });

        it('should not find the file', () => {
            const mock = mockData.getApiGateWayCustomRouteWithParams('not/found/1', 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            try {
                resolver.resolve(request);
                expect(false).toBe(true);
            } catch (error: any) {
                expect(error.code).toBe(404);
                expect(error.key).toBe('url');
                expect(error.message).toBe('endpoint not found');
            }
        });
    });
});
