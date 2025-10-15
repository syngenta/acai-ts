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
