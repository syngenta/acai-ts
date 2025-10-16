import {APIGatewayProxyEvent} from 'aws-lambda';

export const getData = (suffix = ''): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        path: `unit-test/v1/basic${suffix}`,
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({body_key: 'body_value'})
    } as Partial<APIGatewayProxyEvent>;
};

export const getDataOffline = (): any => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({body_key: 'body_value'}),
        isOffline: true
    };
};

export const getBadData = (): any => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: '{body_key: "body_value"},#',
        isOffline: true
    };
};

export const getDataNoHeaders = (): Partial<APIGatewayProxyEvent> => {
    return {
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({body_key: 'body_value'})
    } as Partial<APIGatewayProxyEvent>;
};

export const getDataNoParams = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        path: 'unit-test/v1/basic',
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: null,
        body: JSON.stringify({body_key: 'body_value'})
    } as Partial<APIGatewayProxyEvent>;
};

export const getDataXml = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/xml'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        resource: '/{proxy+}',
        pathParameters: {
            proxy: 'hello'
        },
        httpMethod: 'POST',
        queryStringParameters: {
            name: 'me'
        },
        path: 'unit-test/v1/mock-handler',
        body: '<root><test>test2</test><someobject>1</someobject><someobject>2</someobject></root>'
    } as Partial<APIGatewayProxyEvent>;
};

export const getBadDataXml = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/xml'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        resource: '/{proxy+}',
        pathParameters: {
            proxy: 'hello'
        },
        httpMethod: 'POST',
        queryStringParameters: {
            name: 'me'
        },
        path: 'unit-test/v1/mock-handler',
        body: '<root><test>test2</test></root'
    } as Partial<APIGatewayProxyEvent>;
};

export const getDataRaw = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'multipart/form-data'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        resource: '/{proxy+}',
        pathParameters: {
            proxy: 'hello'
        },
        httpMethod: 'POST',
        queryStringParameters: {
            name: 'me'
        },
        path: 'unit-test/v1/mock-handler',
        body: '----------------------------430661979790652055785011 Content-Disposition: form-data; name="test"'
    } as Partial<APIGatewayProxyEvent>;
};

export const getGraphQLData = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        path: 'unit-test/v1/graphql',
        resource: '/{proxy+}',
        httpMethod: 'POST',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            query: 'query { user { id name } }'
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getValidBodyData = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            test_id: 'test_id',
            object_key: {
                string_key: 'test'
            },
            array_number: [1],
            array_objects: [
                {
                    array_string_key: 'string',
                    array_number_key: 3
                }
            ]
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getInvalidBodyData = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            test_id: 'test_id',
            object_key: {
                string_key: 'test'
            },
            array_number: [1],
            array_objects: [
                {
                    array_string_key: 'string',
                    array_number_key: 3
                }
            ],
            extra_key: true
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getBodyDataWithNullableField = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            nullable_field: null,
            non_nullable_field: null
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getBodyDataWithComplexObject = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            page_number: 0,
            data: {
                id: 'string'
            }
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getBodyDataWithInvalidComplexObject = (): Partial<APIGatewayProxyEvent> => {
    return {
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        httpMethod: 'GET',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            page_number: 0
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getApiGateWayRoute = (suffix = '', method = 'POST'): Partial<APIGatewayProxyEvent> => {
    return {
        path: `unit-test/v1/basic${suffix}`,
        httpMethod: method,
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: 'hello'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            test_id: 'test_id',
            object_key: {
                string_key: 'test'
            },
            array_number: [1],
            array_objects: [
                {
                    array_string_key: 'string',
                    array_number_key: 3
                }
            ]
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getApiGateWayCustomRoute = (route: string): Partial<APIGatewayProxyEvent> => {
    return {
        path: `unit-test/v1/${route}`,
        httpMethod: 'GET',
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: route
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            test_id: 'test_id',
            object_key: {
                string_key: 'test'
            },
            array_number: [1],
            array_objects: [
                {
                    array_string_key: 'string',
                    array_number_key: 3
                }
            ]
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getApiGateWayCustomRouteWithParams = (route: string, method: string): Partial<APIGatewayProxyEvent> => {
    return {
        path: `unit-test/v1/${route}`,
        httpMethod: method,
        headers: {
            'x-api-key': 'SOME-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 't89kib',
            authorizer: {
                apiKey: 'SOME KEY',
                userId: 'x-1-3-4',
                correlationId: 'abc12312',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 572
            }
        } as any,
        pathParameters: {
            proxy: route
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            name: 'me'
        },
        body: JSON.stringify({
            test_id: 'test_id',
            object_key: {
                string_key: 'test'
            },
            array_number: [1],
            array_objects: [
                {
                    array_string_key: 'string',
                    array_number_key: 3
                }
            ]
        })
    } as Partial<APIGatewayProxyEvent>;
};

// ===== DECORATOR-SPECIFIC MOCK EVENTS =====
// These events are designed specifically for testing decorator pattern handlers

export const getDecoratorBasicEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/basic-endpoints/basic',
        httpMethod: 'GET',
        headers: {
            'x-api-key': 'DECORATOR-KEY',
            'content-type': 'application/json',
            'authorization': 'Bearer decorator-token'
        },
        requestContext: {
            resourceId: 'decorator-resource',
            authorizer: {
                apiKey: 'DECORATOR-KEY',
                userId: 'decorator-user-123',
                correlationId: 'decorator-corr-456',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 150
            }
        } as any,
        pathParameters: {
            proxy: 'basic-endpoints/basic'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            decoratorTest: 'true',
            phase: 'basic'
        },
        body: JSON.stringify({
            decorator_request: true,
            test_type: 'basic_endpoint',
            metadata_test: true
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getDecoratorBasicPostEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/basic-endpoints/basic',
        httpMethod: 'POST',
        headers: {
            'x-api-key': 'DECORATOR-KEY',
            'content-type': 'application/json',
            'x-timeout': '5000'
        },
        requestContext: {
            resourceId: 'decorator-resource',
            authorizer: {
                apiKey: 'DECORATOR-KEY',
                userId: 'decorator-user-123',
                correlationId: 'decorator-corr-789',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 200
            }
        } as any,
        pathParameters: {
            proxy: 'basic-endpoints/basic'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            decoratorTest: 'true',
            middleware: 'after'
        },
        body: JSON.stringify({
            decorator_request: true,
            test_type: 'basic_endpoint_post',
            timeout_test: true,
            after_middleware_test: true,
            data: {
                user_id: 'test-user-123',
                action: 'create_resource'
            }
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getDecoratorValidationFailEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/basic-endpoints/basic',
        httpMethod: 'GET',
        headers: {
            // Missing required 'x-api-key' header to trigger validation failure
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 'decorator-resource',
            authorizer: {
                apiKey: 'MISSING-KEY',
                userId: 'validation-test-user',
                correlationId: 'validation-fail-test',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 50
            }
        } as any,
        pathParameters: {
            proxy: 'basic-endpoints/basic'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            validation: 'should-fail'
        },
        body: JSON.stringify({
            decorator_request: true,
            test_type: 'validation_failure',
            expected_result: 'validation_error'
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getDecoratorMiddlewareChainEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/decorator/middleware-chain',
        httpMethod: 'POST',
        headers: {
            'x-api-key': 'MIDDLEWARE-CHAIN-KEY',
            'content-type': 'application/json',
            'x-chain-test': 'true',
            'authorization': 'Bearer chain-token'
        },
        requestContext: {
            resourceId: 'middleware-chain-resource',
            authorizer: {
                apiKey: 'MIDDLEWARE-CHAIN-KEY',
                userId: 'chain-test-user',
                correlationId: 'chain-test-456',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 300
            }
        } as any,
        pathParameters: {
            proxy: 'decorator/middleware-chain'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            chain: 'before-after',
            test: 'middleware-execution-order'
        },
        body: JSON.stringify({
            decorator_request: true,
            test_type: 'middleware_chain',
            chain_test: {
                before_middleware: 'should_execute_first',
                after_middleware: 'should_execute_last',
                main_handler: 'should_execute_middle'
            }
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getDecoratorCustomRoute = (route: string, method = 'GET'): Partial<APIGatewayProxyEvent> => {
    return {
        path: `unit-test/v1/basic-endpoints/${route}`,
        httpMethod: method,
        headers: {
            'x-api-key': 'DECORATOR-CUSTOM-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 'decorator-custom-resource',
            authorizer: {
                apiKey: 'DECORATOR-CUSTOM-KEY',
                userId: 'decorator-custom-user',
                correlationId: `decorator-custom-${Date.now()}`,
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 180
            }
        } as any,
        pathParameters: {
            proxy: `basic-endpoints/${route}`
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            decoratorRoute: route,
            method: method.toLowerCase()
        },
        body: JSON.stringify({
            decorator_request: true,
            test_type: 'custom_route',
            route: route,
            method: method
        })
    } as Partial<APIGatewayProxyEvent>;
};

// ===== FUNCTION DECORATOR-SPECIFIC MOCK EVENTS =====
// These events are designed specifically for testing function-based decorator patterns

export const getFunctionDecoratorRouteEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/route-decorators/basic-route',
        httpMethod: 'GET',
        headers: {
            'x-api-key': 'FUNCTION-DECORATOR-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 'function-decorator-resource',
            authorizer: {
                apiKey: 'FUNCTION-DECORATOR-KEY',
                userId: 'function-decorator-user',
                correlationId: 'function-route-test-123',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 120
            }
        } as any,
        pathParameters: {
            proxy: 'route-decorators/basic-route'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            functionTest: 'route-decorator',
            pattern: 'function-based'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'route_decorator_function',
            pattern_type: 'function_based'
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorAuthEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/auth-decorators/auth-protected',
        httpMethod: 'GET',
        headers: {
            'x-api-key': 'AUTH-FUNCTION-KEY',
            'content-type': 'application/json',
            'authorization': 'Bearer auth-function-token'
        },
        requestContext: {
            resourceId: 'auth-function-resource',
            authorizer: {
                apiKey: 'AUTH-FUNCTION-KEY',
                userId: 'auth-function-user',
                correlationId: 'auth-function-test-456',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 200
            }
        } as any,
        pathParameters: {
            proxy: 'auth-decorators/auth-protected'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            auth: 'required',
            role: 'user'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'auth_decorator_function',
            auth_required: true
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorAuthAdminEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/auth-decorators/auth-protected/admin',
        httpMethod: 'DELETE',
        headers: {
            'x-api-key': 'AUTH-ADMIN-FUNCTION-KEY',
            'content-type': 'application/json',
            'authorization': 'Bearer admin-function-token',
            'x-admin': 'true'
        },
        requestContext: {
            resourceId: 'auth-admin-function-resource',
            authorizer: {
                apiKey: 'AUTH-ADMIN-FUNCTION-KEY',
                userId: 'admin-function-user',
                correlationId: 'admin-function-test-789',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 250
            }
        } as any,
        pathParameters: {
            proxy: 'auth-decorators/auth-protected/admin'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            auth: 'admin-required',
            role: 'admin',
            action: 'delete'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'admin_auth_decorator_function',
            admin_action: true,
            resource_id: 'admin-resource-123'
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorCombinedEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/combined-decorators/complex-endpoint',
        httpMethod: 'POST',
        headers: {
            'x-api-key': 'COMBINED-FUNCTION-KEY',
            'content-type': 'application/json',
            'authorization': 'Bearer combined-admin-token',
            'x-timeout': '3000'
        },
        requestContext: {
            resourceId: 'combined-function-resource',
            authorizer: {
                apiKey: 'COMBINED-FUNCTION-KEY',
                userId: 'combined-admin-user',
                correlationId: 'combined-function-test-999',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 300
            }
        } as any,
        pathParameters: {
            proxy: 'combined-decorators/complex-endpoint'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            complex: 'true',
            allDecorators: 'enabled',
            test: 'combined-function'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'combined_decorators_function',
            data: {
                action: 'complex_operation',
                params: {
                    user_id: 'combined-test-user',
                    resource_type: 'complex_resource'
                }
            },
            combined_decorators: {
                route: true,
                auth: true,
                validate: true,
                timeout: true,
                before: true,
                after: true
            }
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorValidationFailEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/combined-decorators/complex-endpoint',
        httpMethod: 'GET',
        headers: {
            // Missing required 'x-api-key' header to trigger validation failure
            'content-type': 'application/json',
            'authorization': 'Bearer validation-test-token'
        },
        requestContext: {
            resourceId: 'validation-fail-function-resource',
            authorizer: {
                apiKey: 'MISSING-KEY',
                userId: 'validation-test-user',
                correlationId: 'validation-fail-function-test',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 50
            }
        } as any,
        pathParameters: {
            proxy: 'combined-decorators/complex-endpoint'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            // Missing required 'page' query parameter
            validation: 'should-fail-function'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'validation_failure_function',
            expected_result: 'validation_error'
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorTimeoutEvent = (): Partial<APIGatewayProxyEvent> => {
    return {
        path: 'unit-test/v1/combined-decorators/complex-endpoint',
        httpMethod: 'PUT',
        headers: {
            'x-api-key': 'TIMEOUT-FUNCTION-KEY',
            'content-type': 'application/json',
            'x-timeout-test': 'true'
        },
        requestContext: {
            resourceId: 'timeout-function-resource',
            authorizer: {
                apiKey: 'TIMEOUT-FUNCTION-KEY',
                userId: 'timeout-test-user',
                correlationId: 'timeout-function-test-555',
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 100
            }
        } as any,
        pathParameters: {
            proxy: 'combined-decorators/complex-endpoint'
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            timeout: '5000',
            test: 'timeout-decorator-function'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'timeout_decorator_function',
            timeout_value: 5000,
            data: {
                operation: 'long_running_task',
                expected_timeout: '5000ms'
            }
        })
    } as Partial<APIGatewayProxyEvent>;
};

export const getFunctionDecoratorCustomPattern = (pattern: string, route: string, method = 'GET'): Partial<APIGatewayProxyEvent> => {
    return {
        path: `unit-test/v1/${pattern}/${route}`,
        httpMethod: method,
        headers: {
            'x-api-key': 'FUNCTION-PATTERN-KEY',
            'content-type': 'application/json'
        },
        requestContext: {
            resourceId: 'function-pattern-resource',
            authorizer: {
                apiKey: 'FUNCTION-PATTERN-KEY',
                userId: 'function-pattern-user',
                correlationId: `function-${pattern}-${Date.now()}`,
                principalId: '9de3f415a97e410386dbef146e88744e',
                integrationLatency: 150
            }
        } as any,
        pathParameters: {
            proxy: `${pattern}/${route}`
        },
        resource: '/{proxy+}',
        queryStringParameters: {
            pattern: pattern,
            route: route,
            method: method.toLowerCase(),
            functionDecorator: 'true'
        },
        body: JSON.stringify({
            function_decorator_request: true,
            test_type: 'custom_function_pattern',
            pattern: pattern,
            route: route,
            method: method
        })
    } as Partial<APIGatewayProxyEvent>;
};
