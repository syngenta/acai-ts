import {describe, it, expect} from '@jest/globals';
import {Schema} from '../../../src/common/schema';

describe('Test Schema: src/common/schema', () => {
    describe('test initializing Schemea', () => {
        it('should initialize from file path and pass', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const errors = await schema.validate('v1-response-result', {id: 'true'});
            expect(errors).toBe(null);
        });

        it('should initialize from file path and fail', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const errors = await schema.validate('v1-response-result', {id: 1});
            expect(errors).toEqual([
                {
                    instancePath: '/id',
                    schemaPath: '#/properties/id/type',
                    keyword: 'type',
                    params: {type: 'string'},
                    message: 'must be string'
                }
            ]);
        });

        it('should throw an error for reference that doesnt exist', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            try {
                await schema.validate('v1-not-exist', {id: 1});
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message.includes('is not found')).toBe(true);
                }
            }
        });

        it('should initialize from inline schema and pass', async () => {
            const componant = {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string'
                    }
                }
            };
            const schema = Schema.fromInlineSchema(componant);
            const errors = await schema.validate('', {id: 'true'});
            expect(errors).toBe(null);
        });

        it('should initialize from inline schema and fail', async () => {
            const componant = {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string'
                    }
                }
            };
            const schema = Schema.fromInlineSchema(componant);
            const errors = await schema.validate('', {id: 1});
            expect(errors).toEqual([
                {
                    instancePath: '/id',
                    schemaPath: '#/properties/id/type',
                    keyword: 'type',
                    params: {type: 'string'},
                    message: 'must be string'
                }
            ]);
        });

        it('should validate from openapi with no errors (query string)', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                queryParameters: {test_id: 'test_id', unit_id: 'unit_id'}
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'get', request);
            expect(errors.length).toBe(0);
        });

        it('should validate from openapi with errors (missing query string)', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                queryParameters: {test_id: 'test_id'}
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'get', request);
            expect(errors.length).toBe(1);
        });

        it('should validate from openapi with no errors (body)', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                body: {
                    name: 'Paul Cruse',
                    email: 'email@email.com',
                    phone: 123456789,
                    active: true
                }
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'post', request);
            expect(errors.length).toBe(0);
        });

        it('should validate from openapi with errors (body) ', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                body: {
                    name: 'Paul Cruse',
                    email: 'email@email.com',
                    phone: 123456789,
                    active: 'true'
                }
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'post', request);
            expect(errors.length).toBe(1);
        });

        it('should validate from openapi with no errors (all parts)', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                headers: {key: 'key'},
                queryParameters: {unit_id: 'unit_id'},
                body: {
                    test_id: 'test_id',
                    name: 'Paul Cruse',
                    email: 'email@email.com',
                    phone: 123456789,
                    active: true
                }
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'patch', request);
            expect(errors.length).toBe(0);
        });

        it('should validate from openapi with errors (all parts)', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {
                headers: {key: 'key'},
                queryParameters: {test_id: 'wrong_id'},
                body: {
                    name: 'Paul Cruse',
                    email: 'email@email.com',
                    phone: 123456789,
                    active: true
                }
            };
            const errors = await schema.validateOpenApi('/unit-test/v1/schema', 'patch', request);
            expect(errors.length).toBe(3);
        });

        it('should error out on finding response that is not there', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const request = {method: 'post'};
            const response = {
                code: 200,
                contentType: 'fail',
                rawBody: {}
            };
            try {
                await schema.validateOpenApiResponse('/unit-test/v1/basic', request, response);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message.includes('problem with finding response schema for post::/unit-test/v1/basic 200::fail')).toBe(true);
                }
            }
        });

        it('should auto-load schema when autoLoad is called', () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            expect(() => schema.autoLoad()).not.toThrow();
        });

        it('should validate with object entity schema', async () => {
            const schema = Schema.fromFilePath('test/mocks/openapi.yml');
            const objectEntity = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                required: ['name']
            };
            const errors = await schema.validate(objectEntity, { name: 'test' });
            expect(errors).toBe(null);
        });
    });
});
