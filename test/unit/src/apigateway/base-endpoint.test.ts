import {describe, it, expect} from '@jest/globals';
import 'reflect-metadata';
import {BaseEndpoint, Request, Response, Endpoint} from '../../../../src/apigateway';
import {Before, After, Timeout, Validate} from '../../../../src/decorators';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';

describe('BaseEndpoint Integration Tests', () => {
    describe('BaseEndpoint class', () => {
        it('should allow extending and implementing HTTP methods', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { users: [] };
                    return response;
                }

                async post(_request: Request, response: Response): Promise<Response> {
                    response.body = { created: true };
                    return response;
                }
            }

            const instance = new UsersEndpoint();
            expect(instance).toBeInstanceOf(BaseEndpoint);
            expect(typeof instance.get).toBe('function');
            expect(typeof instance.post).toBe('function');
        });

        it('should work with decorated methods', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class UsersEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { users: [] };
                    return response;
                }
            }

            const instance = new UsersEndpoint();
            expect(instance).toBeInstanceOf(BaseEndpoint);
        });
    });

    describe('BaseEndpoint with Endpoint wrapper', () => {
        it('should execute method through Endpoint wrapper', async () => {
            class TestEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { message: 'Hello' };
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const boundGet = instance.get.bind(instance);

            const endpointModule = { get: boundGet } as any;
            const endpoint = new Endpoint(endpointModule, 'get');

            const request = new Request({} as any);
            const response = new Response();

            await endpoint.run(request, response);

            expect(response.rawBody).toEqual({ message: 'Hello' });
        });

        it('should execute @Before middleware through Endpoint wrapper', async () => {
            const executionOrder: string[] = [];

            const beforeMw: BeforeMiddleware = async (_req, _res) => {
                executionOrder.push('before');
            };

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    executionOrder.push('handler');
                    response.body = { message: 'Hello' };
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata from prototype to bound function (simulating resolver behavior)
            const {MetadataKeys, getMetadata, setMetadata} = await import('../../../../src/decorators/metadata');
            const beforeMeta = getMetadata(MetadataKeys.BEFORE, prototype, 'get');
            if (beforeMeta) {
                setMetadata(MetadataKeys.BEFORE, beforeMeta, boundGet);
            }

            const endpointModule = { get: boundGet } as any;
            const endpoint = new Endpoint(endpointModule, 'get');

            const request = new Request({} as any);
            const response = new Response();

            await endpoint.before(request, response);
            await endpoint.run(request, response);

            expect(executionOrder).toEqual(['before', 'handler']);
        });

        it('should execute @After middleware through Endpoint wrapper', async () => {
            const executionOrder: string[] = [];

            const afterMw: AfterMiddleware = async (_req, res) => {
                executionOrder.push('after');
                (res.rawBody as any).enriched = true;
            };

            class TestEndpoint extends BaseEndpoint {
                @After(afterMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    executionOrder.push('handler');
                    response.body = { message: 'Hello' };
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata from prototype to bound function
            const {MetadataKeys, getMetadata, setMetadata} = await import('../../../../src/decorators/metadata');
            const afterMeta = getMetadata(MetadataKeys.AFTER, prototype, 'get');
            if (afterMeta) {
                setMetadata(MetadataKeys.AFTER, afterMeta, boundGet);
            }

            const endpointModule = { get: boundGet } as any;
            const endpoint = new Endpoint(endpointModule, 'get');

            const request = new Request({} as any);
            const response = new Response();

            await endpoint.run(request, response);
            await endpoint.after(request, response);

            expect(executionOrder).toEqual(['handler', 'after']);
            expect((response.rawBody as any).enriched).toBe(true);
        });

        it('should respect @Timeout configuration', async () => {
            class TestEndpoint extends BaseEndpoint {
                @Timeout(5000)
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { message: 'Hello' };
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata from prototype to bound function
            const {MetadataKeys, getMetadata, setMetadata} = await import('../../../../src/decorators/metadata');
            const timeoutMeta = getMetadata(MetadataKeys.TIMEOUT, prototype, 'get');
            if (timeoutMeta) {
                setMetadata(MetadataKeys.TIMEOUT, timeoutMeta, boundGet);
            }

            const endpointModule = { get: boundGet } as any;
            const endpoint = new Endpoint(endpointModule, 'get');

            expect(endpoint.hasTimeout).toBe(true);
            expect(endpoint.timeout).toBe(5000);
        });
    });

    describe('BaseEndpoint with Router resolver', () => {
        it('should be detected by RouteResolver.findEndpointClass', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { users: [] };
                    return response;
                }
            }

            // Simulate a module export
            const module = {
                UsersEndpoint,
                default: UsersEndpoint
            };

            // Check if class extends BaseEndpoint
            const exported = module.UsersEndpoint;
            const isEndpointClass =
                typeof exported === 'function' &&
                exported.prototype &&
                exported.prototype instanceof BaseEndpoint;

            expect(isEndpointClass).toBe(true);
        });

        it('should convert to module format correctly', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { users: [] };
                    return response;
                }

                async post(_request: Request, response: Response): Promise<Response> {
                    response.body = { created: true };
                    return response;
                }
            }

            const instance = new UsersEndpoint();

            // Convert to module format (simulating resolver behavior)
            const module: any = {};
            const methods = ['get', 'post', 'put', 'patch', 'delete'];

            for (const method of methods) {
                if (typeof (instance as any)[method] === 'function') {
                    module[method] = (instance as any)[method].bind(instance);
                }
            }

            expect(typeof module.get).toBe('function');
            expect(typeof module.post).toBe('function');
            expect(module.put).toBeUndefined();
        });

        it('should preserve method functionality after conversion', async () => {
            class UsersEndpoint extends BaseEndpoint {
                private users = ['Alice', 'Bob'];

                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = { users: this.users };
                    return response;
                }
            }

            const instance = new UsersEndpoint();
            const boundGet = instance.get.bind(instance);

            const request = new Request({} as any);
            const response = new Response();

            await boundGet(request, response);

            expect(response.rawBody).toEqual({ users: ['Alice', 'Bob'] });
        });
    });

    describe('Metadata copying', () => {
        it('should copy @Before metadata from method to bound function', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');
            const beforeMeta = getMetadata(MetadataKeys.BEFORE, prototype, 'get');
            setMetadata(MetadataKeys.BEFORE, beforeMeta, boundGet);

            // Verify metadata was copied
            const copiedMeta = getMetadata(MetadataKeys.BEFORE, boundGet);
            expect(copiedMeta).toBeDefined();
            expect(copiedMeta).toHaveLength(1);
            expect(copiedMeta[0]).toBe(beforeMw);
        });

        it('should copy all decorator metadata types', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};
            const afterMw: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                @After(afterMw)
                @Timeout(3000)
                @Validate({ requiredHeaders: ['x-api-key'] })
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy all metadata
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');

            const beforeMeta = getMetadata(MetadataKeys.BEFORE, prototype, 'get');
            const afterMeta = getMetadata(MetadataKeys.AFTER, prototype, 'get');
            const timeoutMeta = getMetadata(MetadataKeys.TIMEOUT, prototype, 'get');
            const validateMeta = getMetadata(MetadataKeys.VALIDATE, prototype, 'get');

            if (beforeMeta) setMetadata(MetadataKeys.BEFORE, beforeMeta, boundGet);
            if (afterMeta) setMetadata(MetadataKeys.AFTER, afterMeta, boundGet);
            if (timeoutMeta) setMetadata(MetadataKeys.TIMEOUT, timeoutMeta, boundGet);
            if (validateMeta) setMetadata(MetadataKeys.VALIDATE, validateMeta, boundGet);

            // Verify all metadata was copied
            expect(getMetadata(MetadataKeys.BEFORE, boundGet)).toBeDefined();
            expect(getMetadata(MetadataKeys.AFTER, boundGet)).toBeDefined();
            expect(getMetadata(MetadataKeys.TIMEOUT, boundGet)).toBeDefined();
            expect(getMetadata(MetadataKeys.VALIDATE, boundGet)).toBeDefined();
        });
    });
});
