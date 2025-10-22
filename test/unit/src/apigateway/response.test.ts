import {describe, it, expect} from '@jest/globals';
import {Response} from '../../../../src/apigateway/response';

describe('Test Response: src/apigateway/response.ts', () => {
    describe('test headers', () => {
        const response = new Response();

        it('should have these default headers', () => {
            expect(response.headers).toEqual({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            });
        });

        it('should be able to accept custom headers', () => {
            response.setHeader('x-user-id', 'abc123');
            expect(response.headers).toEqual({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'x-user-id': 'abc123'
            });
        });
    });

    describe('test response code', () => {
        it('should default to 204 with empty body', () => {
            const response = new Response();
            expect(response.code).toBe(204);
        });

        it('should default to 200 with body', () => {
            const response = new Response();
            response.body = {bodyKey: 'body'};
            expect(response.code).toBe(200);
        });

        it('should be able to accept custom code', () => {
            const response = new Response();
            response.body = {bodyKey: 'body'};
            response.code = 418;
            expect(response.code).toBe(418);
        });
    });

    describe('test body', () => {
        it('should be a json string for the body', () => {
            const response = new Response();
            response.body = {bodyKey: 'body'};
            expect(response.body).toBe('{"bodyKey":"body"}');
        });

        it('should be some other string for the body', () => {
            const response = new Response();
            response.body = 'some other string';
            expect(response.body).toBe('"some other string"');
        });

        it('should be able to handle a bad object', () => {
            const response = new Response();
            const badObj: any = {};
            badObj.a = {b: badObj};
            response.body = badObj;
            expect(response.body).toEqual(badObj);
        });
    });

    describe('test raw body', () => {
        it('should be an object', () => {
            const response = new Response();
            response.body = {bodyKey: 'body'};
            expect(response.rawBody).toEqual({bodyKey: 'body'});
        });
    });

    describe('test response', () => {
        const response = new Response();

        it('should be this full response', () => {
            response.body = {bodyKey: 'body'};
            response.code = 200;
            expect(response.response).toEqual({
                isBase64Encoded: false,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*'
                },
                statusCode: 200,
                body: '{"bodyKey":"body"}'
            });
        });
    });

    describe('test hasErrors', () => {
        const response = new Response();

        it('should start with no errors', () => {
            expect(response.hasErrors).toBe(false);
        });

        it('should know it has errors when it has errors', () => {
            response.setError('root', 'unit-test has error');
            expect(response.hasErrors).toBe(true);
        });

        it('should have proper error signature', () => {
            response.setError('root', 'unit-test can set multiple errors');
            expect(response.response).toEqual({
                isBase64Encoded: false,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*'
                },
                statusCode: 400,
                body: '{"errors":[{"key":"root","message":"unit-test has error"},{"key":"root","message":"unit-test can set multiple errors"}]}'
            });
        });
    });

    describe('test compress', () => {
        it('should be able to compress', () => {
            const response = new Response();
            response.body = {test: true};
            response.compress();
            expect(typeof response.body === 'string').toBe(true);
        });
    });

    describe('test contentType', () => {
        it('should default to application/json by default', () => {
            const response = new Response();
            expect(response.contentType).toBe('application/json');
        });

        it('should maintain content type set by application', () => {
            const response = new Response();
            response.setHeader('Content-Type', 'text/plain');
            expect(response.contentType).toBe('text/plain');
        });

        it('should throw an error for uncommon content types', () => {
            const response = new Response();
            response.body = '{{}{}}}}}11111````````';
            expect(() => response.contentType).toThrow(
                'Uncommon Content-Type in response; please explicitly set response.headers[`Content-Type`] in headers'
            );
        });
    });

    describe('test setHeaders', () => {
        it('should be able to set multiple headers at once', () => {
            const response = new Response();
            response.setHeaders({
                'X-Custom-Header': 'value1',
                'X-Another-Header': 'value2'
            });
            expect(response.headers['X-Custom-Header']).toBe('value1');
            expect(response.headers['X-Another-Header']).toBe('value2');
        });
    });

    describe('test setErrors', () => {
        it('should be able to set multiple errors at once', () => {
            const response = new Response();
            response.setErrors([
                {key: 'field1', message: 'error1'},
                {key: 'field2', message: 'error2'}
            ]);
            expect(response.hasErrors).toBe(true);
            expect(response.errors).toEqual([
                {key: 'field1', message: 'error1'},
                {key: 'field2', message: 'error2'}
            ]);
        });

        it('should be able to add errors to existing errors', () => {
            const response = new Response();
            response.setError('field1', 'error1');
            response.setErrors([
                {key: 'field2', message: 'error2'}
            ]);
            expect(response.errors).toEqual([
                {key: 'field1', message: 'error1'},
                {key: 'field2', message: 'error2'}
            ]);
        });
    });

    describe('test contentType with array body', () => {
        it('should return application/json for array body', () => {
            const response = new Response();
            response.body = [{test: true}];
            expect(response.contentType).toBe('application/json');
        });
    });

    describe('test headers setter', () => {
        it('should set header using object notation', () => {
            const response = new Response();
            response.headers = {key: 'X-Test-Header', value: 'test-value'};
            expect(response.headers['X-Test-Header']).toBe('test-value');
        });
    });

    describe('test statusCode alias', () => {
        it('should get statusCode same as code', () => {
            const response = new Response();
            response.code = 201;
            expect(response.statusCode).toBe(201);
        });

        it('should set statusCode same as code', () => {
            const response = new Response();
            response.statusCode = 202;
            expect(response.code).toBe(202);
        });
    });

    describe('test errors getter edge cases', () => {
        it('should return empty array when no errors exist', () => {
            const response = new Response();
            response.body = {data: 'test'};
            expect(response.errors).toEqual([]);
        });
    });

    describe('test addBodyProperty', () => {
        it('should add property to existing body object', () => {
            const response = new Response();
            response.body = {existing: 'data'};
            response.addBodyProperty('newProp', 'newValue');
            expect(response.rawBody).toEqual({
                existing: 'data',
                newProp: 'newValue'
            });
        });

        it('should not add property when body has errors', () => {
            const response = new Response();
            response.setError('test', 'error message');
            response.addBodyProperty('newProp', 'newValue');
            // Should only have errors, not the new property
            expect('newProp' in (response.rawBody as any)).toBe(false);
        });
    });

    describe('test addBodyProperties', () => {
        it('should add multiple properties to existing body object', () => {
            const response = new Response();
            response.body = {existing: 'data'};
            response.addBodyProperties({
                prop1: 'value1',
                prop2: 'value2'
            });
            expect(response.rawBody).toEqual({
                existing: 'data',
                prop1: 'value1',
                prop2: 'value2'
            });
        });

        it('should not add properties when body has errors', () => {
            const response = new Response();
            response.setError('test', 'error message');
            response.addBodyProperties({
                prop1: 'value1',
                prop2: 'value2'
            });
            // Should only have errors, not the new properties
            expect('prop1' in (response.rawBody as any)).toBe(false);
            expect('prop2' in (response.rawBody as any)).toBe(false);
        });
    });
});
