import {describe, it, expect} from '@jest/globals';
import {Request} from '../../../../src/apigateway/request';
import * as mockData from '../../../mocks/apigateway/mock-data';
import {APIGatewayProxyEvent} from 'aws-lambda';

describe('Test Request Client', () => {
    describe('test basic client', () => {
        const mock = mockData.getData() as APIGatewayProxyEvent;
        const request = new Request(mock);

        it('should have a method of GET', () => {
            expect(request.method).toBe('get');
        });

        it('should be a resource of proxy', () => {
            expect(request.resource).toBe('/{proxy+}');
        });

        it('should have authorizer as an object', () => {
            expect(request.authorizer).toEqual({
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            });
        });

        it('should have headers as an object', () => {
            expect(request.headers).toEqual({
                'x-api-key': 'SOME-KEY',
                'content-type': 'application/json'
            });
        });

        it('should have params as an object', () => {
            expect(request.params).toEqual({query: {name: 'me'}, path: {}});
        });

        it('should have query as an object', () => {
            expect(request.queryParams).toEqual({
                name: 'me'
            });
        });

        it('should have path as an object', () => {
            expect(request.pathParams).toEqual({});
        });

        it('should have body as an object', () => {
            expect(request.body).toEqual({body_key: 'body_value'});
        });

        it('should body as an object from JSON', () => {
            expect(request.request).toEqual({
                method: 'get',
                resource: '/{proxy+}',
                authorizer: {
                    apiKey: 'SOME KEY',
                    userId: 'x-1-3-4',
                    correlationId: 'abc12312',
                    principalId: '9de3f415a97e410386dbef146e88744e',
                    integrationLatency: 572
                },
                headers: {'x-api-key': 'SOME-KEY', 'content-type': 'application/json'},
                queryParams: {name: 'me'},
                pathParams: {},
                params: {query: {name: 'me'}, path: {}},
                body: {body_key: 'body_value'},
                context: request.context,
                route: 'unit-test/v1/basic',
                stage: {}
            });
        });

        it('should have query as an empty object with no params', () => {
            const mock = mockData.getDataNoParams() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.queryParams).toEqual({});
        });

        it('should body as a string when its JSON string', () => {
            const mock = mockData.getBadData() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.body).toBe('{body_key: "body_value"},#');
        });

        it('should be an object from XML', () => {
            const mock = mockData.getDataXml() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.body).toEqual({
                root: {
                    someobject: ['1', '2'],
                    test: 'test2'
                }
            });
        });

        it('should be a string from bad XML', () => {
            const mock = mockData.getBadDataXml() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.body).toBe('<root><test>test2</test></root');
        });

        it('should be exactly what was sent when body is raw data', () => {
            const mock = mockData.getDataRaw() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.body).toBe(
                '----------------------------430661979790652055785011 Content-Disposition: form-data; name="test"'
            );
        });

        it('should handle graphql request', () => {
            const mock = mockData.getGraphQLData() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.graphql).toEqual(JSON.parse(mock.body || '{}'));
        });

        it('should handle full event', () => {
            const mock = mockData.getGraphQLData() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.event).toEqual(mock);
        });

        it('should have headers as an object form offline data', () => {
            const mock = mockData.getDataOffline() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.authorizer).toEqual({
                'x-api-key': 'SOME-KEY',
                'content-type': 'application/json'
            });
        });

        it('should default content-type to application json', () => {
            const mock = mockData.getDataNoHeaders() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.headers).toEqual({'content-type': 'application/json'});
        });

        it('should have path as an empty object with no params', () => {
            const mock = mockData.getDataNoParams() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            expect(testRequest.pathParams).toEqual({});
        });

        it('should be able to set request path from key/value object', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const testRequest = new Request(mock);
            const key = 'key';
            const value = 'value';
            testRequest.pathParams = {key, value};
            expect(testRequest.pathParams).toEqual({key: 'value'});
        });
    });

    describe('test assignable context', () => {
        it('should have context default as null', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            expect(request.context).toBeNull();
        });

        it('should have context as assignable', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.context = {context: true};
            expect(request.context).toEqual({context: true});
        });

        it('should have context as nullable', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.context = {nullable: true};
            expect(request.context).toEqual({nullable: true});
            request.context = null;
            expect(request.context).toBeNull();
        });

        it('should have context as mutatable', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.context = {key1: 'value1'};
            expect(request.context).toEqual({key1: 'value1'});
            (request.context as any).key2 = 'value2';
            expect(request.context).toEqual({key1: 'value1', key2: 'value2'});
        });
    });

    describe('test assignable paramPath', () => {
        it('should have paramPath default as path', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            expect(request.route).toBe(mockData.getData().path);
        });

        it('should have paramPath as assignable', () => {
            const mock = mockData.getData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.route = '/grower/{id}';
            expect(request.route).toBe('/grower/{id}');
        });
    });
});
