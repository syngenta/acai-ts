import {describe, it, expect} from '@jest/globals';
import {Request} from '../../../src/apigateway/request';
import {Response} from '../../../src/apigateway/response';
import {Validator} from '../../../src/common/validator';
import {Schema} from '../../../src/common/schema';
import * as mockData from '../../mocks/apigateway/mock-data';
import {APIGatewayProxyEvent} from 'aws-lambda';

describe('Test Validator', () => {
    const mock = mockData.getValidBodyData() as APIGatewayProxyEvent;
    const request = new Request(mock);
    const schema = Schema.fromFilePath('test/mocks/openapi.yml', {strictValidation: true});
    const validator = new Validator(schema);

    describe('test request', () => {
        it('should validate valid request', async () => {
            const response = new Response();
            const requirements = {
                requiredHeaders: ['x-api-key'],
                requiredQuery: ['name'],
                requiredBody: 'v1-test-request'
            };
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(false);
        });

        it('should see request as invalid becuase of missing required headers', async () => {
            const response = new Response();
            const requirements = {requiredHeaders: ['x-api-key-fail']};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'headers',
                        message: 'Please provide x-api-key-fail for headers'
                    }
                ]
            });
        });

        it('should see request as invalid becuase of not available headers', async () => {
            const response = new Response();
            const requirements = {availableHeaders: ['x-api-key-fail']};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'headers',
                        message: 'x-api-key is not an available headers'
                    },
                    {
                        key: 'headers',
                        message: 'content-type is not an available headers'
                    }
                ]
            });
        });

        it('should see request as valid with correct required headers', async () => {
            const response = new Response();
            const requirements = {availableHeaders: ['x-api-key', 'content-type']};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(false);
        });

        it('should see request as valid with correct available headers', async () => {
            const response = new Response();
            const requirements = {requiredQuery: ['name', 'failing-param']};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'queryParams',
                        message: 'Please provide failing-param for queryParams'
                    }
                ]
            });
        });

        it('should see request as invalid because request body is empty', async () => {
            const response = new Response();
            const requirements = {requiredBody: 'v1-test-fail-request'};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'root',
                        message: "must have required property 'fail_id'"
                    }
                ]
            });
        });

        it('should see request as invalid because request body has extra keys', async () => {
            const mock = mockData.getInvalidBodyData() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const response = new Response();
            const requirements = {requiredBody: 'v1-test-fail-request'};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'root',
                        message: "must have required property 'fail_id'"
                    },
                    {
                        key: 'root',
                        message: 'must NOT have additional properties'
                    }
                ]
            });
        });
    });

    describe('test improper json', () => {
        it('should return invalid as json is not proper with nullable field', async () => {
            const mock = mockData.getBodyDataWithNullableField() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const response = new Response();
            const requirements = {requiredBody: 'v1-test-nullable-field'};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: '/non_nullable_field',
                        message: 'must be string'
                    }
                ]
            });
        });

        it('should be able to handle complex schema import', async () => {
            const mock = mockData.getBodyDataWithComplexObject() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const response = new Response();
            const requirements = {requiredBody: 'v1-response-test-all-of'};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(false);
        });

        it('should be able to handle complex schema import and provide an error', async () => {
            const mock = mockData.getBodyDataWithInvalidComplexObject() as APIGatewayProxyEvent;
            const request = new Request(mock);
            const response = new Response();
            const requirements = {requiredBody: 'v1-response-test-all-of'};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'root',
                        message: "must have required property 'data'"
                    }
                ]
            });
        });
    });

    describe('test router config validation', () => {
        it('should validate valid router config', () => {
            const config = {
                routesPath: './routes',
                cache: 'all' as const
            };
            expect(() => validator.validateRouterConfigs(config)).not.toThrow();
        });

        it('should throw error for invalid cache mode', () => {
            const config = {
                routesPath: './routes',
                cache: 'invalid' as any
            };
            expect(() => validator.validateRouterConfigs(config)).toThrow('cache must be either: all, dynamic, static, none');
        });

        it('should throw error when missing routesPath', () => {
            const config = {} as any;
            expect(() => validator.validateRouterConfigs(config)).toThrow('routesPath config is required');
        });

        it('should validate config with valid routesPath', () => {
            const config = {
                routesPath: './routes'
            };
            expect(() => validator.validateRouterConfigs(config)).not.toThrow();
        });
    });

    describe('test record validation', () => {
        it('should return false for invalid record when validationError is false', async () => {
            const validatorNoError = new Validator(schema, false);
            const record = {
                body: {
                    test_id: '123'
                    // missing required 'name' field
                }
            };
            const result = await validatorNoError.validateWithRequirementsRecord('v1-test-request', record);
            expect(result).toBe(false);
        });

        it('should throw error for invalid record when validationError is true', async () => {
            const record = {
                body: {
                    test_id: '123'
                    // missing required 'name' field
                }
            };
            try {
                await validator.validateWithRequirementsRecord('v1-test-request', record);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    const errorData = JSON.parse(error.message);
                    expect(Array.isArray(errorData)).toBe(true);
                    expect(errorData.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('test response validation with requirements', () => {
        it('should handle response validation with no response requirement', async () => {
            const response = new Response();
            response.body = {data: 'test'};
            await validator.validateResponse(response, {});
            expect(response.hasErrors).toBe(false);
        });

        it('should validate response with requirements and add errors on validation failure', async () => {
            const response = new Response();
            response.body = {invalid: 'data'};
            const requirements = {
                response: 'v1-test-request' as any // This should fail validation
            };
            await validator.validateResponse(response, requirements as any);
            expect(response.hasErrors).toBe(true);
            expect(response.code).toBe(422);
        });
    });

    describe('test available query validation', () => {
        it('should see request as invalid because of not available query params', async () => {
            const response = new Response();
            const requirements = {availableQuery: ['name']};
            await validator.validateWithRequirements(request, response, requirements);
            expect(response.hasErrors).toBe(false);
        });

        it('should see request as invalid because query param not in available list', async () => {
            const mock = mockData.getValidBodyData() as APIGatewayProxyEvent;
            if (mock.queryStringParameters) {
                mock.queryStringParameters['extra-param'] = 'value';
            }
            const requestWithExtra = new Request(mock);
            const response = new Response();
            const requirements = {availableQuery: ['name']};
            await validator.validateWithRequirements(requestWithExtra, response, requirements);
            expect(response.hasErrors).toBe(true);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'queryParams',
                        message: 'extra-param is not an available queryParams'
                    }
                ]
            });
        });
    });

    describe('test request against openapi validation', () => {
        it('should have errors', async () => {
            const route = '/unit-test/v1/schema';
            const mock = mockData.getApiGateWayCustomRouteWithParams(route, 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.route = route;
            const response = new Response();
            await validator.validateWithOpenAPI(request, response);
            expect(response.rawBody).toEqual({
                errors: [
                    {
                        key: 'query',
                        message: "request.query must have required property 'unit_id'"
                    },
                    {
                        key: 'query',
                        message: "'name' property is not expected to be here"
                    }
                ]
            });
        });

        it('should not have errors', async () => {
            const route = '/unit-test/v1/schema/{test_id}';
            const mock = mockData.getApiGateWayCustomRouteWithParams(route, 'put') as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.route = route;
            const response = new Response();
            await validator.validateWithOpenAPI(request, response);
            expect(response.hasErrors).toBe(false);
        });

        it('should throw error when cant find operation schema bad method', async () => {
            const route = '/unit-test/v1/schema/{test_id}';
            const mock = mockData.getApiGateWayCustomRouteWithParams(route, 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.route = route;
            const response = new Response();
            try {
                await validator.validateWithOpenAPI(request, response);
                expect(true).toBe(false);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message.includes('problem with importing your schema for get::/unit-test/v1/schema/{test_id}')).toBe(true);
                }
            }
        });

        it('should throw error when cant find operation schema bad route', async () => {
            const route = '/fail/v1/schema/{fail}';
            const mock = mockData.getApiGateWayCustomRouteWithParams(route, 'get') as APIGatewayProxyEvent;
            const request = new Request(mock);
            request.route = route;
            const response = new Response();
            try {
                await validator.validateWithOpenAPI(request, response);
                expect(true).toBe(false);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message.includes('problem with importing your schema for get::/fail/v1/schema/{fail}')).toBe(true);
                }
            }
        });
    });
});
