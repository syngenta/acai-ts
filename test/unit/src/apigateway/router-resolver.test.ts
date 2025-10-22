import {describe, it, expect} from '@jest/globals';
import 'reflect-metadata';
import {BaseEndpoint} from '../../../../src/apigateway/base-endpoint';
import {Request, Response} from '../../../../src/apigateway';
import {Before, After, Timeout, Validate} from '../../../../src/decorators';
import {MetadataKeys, getMetadata} from '../../../../src/decorators/metadata';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';

describe('RouteResolver Integration Tests', () => {
    describe('BaseEndpoint class detection', () => {
        it('should detect BaseEndpoint class in module exports', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {users: []};
                    return response;
                }
            }

            const module = {
                UsersEndpoint,
                default: UsersEndpoint
            };

            // Simulate findEndpointClass logic
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            expect(foundClass).not.toBeNull();
            expect(foundClass).toBe(UsersEndpoint);
        });

        it('should return null when no BaseEndpoint class found', () => {
            const module = {
                handler: async (_req: Request, res: Response) => res,
                requirements: {
                    get: {
                        before: [async () => {}]
                    }
                }
            };

            // Simulate findEndpointClass logic
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            expect(foundClass).toBeNull();
        });

        it('should detect class with decorated methods', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class DecoratedEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {message: 'Hello'};
                    return response;
                }
            }

            const module = {
                DecoratedEndpoint
            };

            // Simulate detection
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            expect(foundClass).not.toBeNull();

            // Verify metadata exists on the class
            const instance = new DecoratedEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');
            expect(metadata).toBeDefined();
            expect(metadata![0]).toBe(beforeMw);
        });
    });

    describe('Class to module conversion', () => {
        it('should convert BaseEndpoint instance to module format', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {users: []};
                    return response;
                }

                async post(_request: Request, response: Response): Promise<Response> {
                    response.body = {created: true};
                    return response;
                }
            }

            const instance = new UsersEndpoint();

            // Simulate convertClassToModule logic
            const module: Record<string, Function> = {};
            const methods = ['get', 'post', 'put', 'patch', 'delete'];

            for (const method of methods) {
                if (typeof (instance as unknown as Record<string, unknown>)[method] === 'function') {
                    const boundMethod = ((instance as unknown as Record<string, Function>)[method]).bind(instance);
                    module[method] = boundMethod;
                }
            }

            expect(typeof module.get).toBe('function');
            expect(typeof module.post).toBe('function');
            expect(module.put).toBeUndefined();
            expect(module.patch).toBeUndefined();
            expect(module.delete).toBeUndefined();
        });

        it('should preserve instance context after binding', async () => {
            class UsersEndpoint extends BaseEndpoint {
                private users = ['Alice', 'Bob'];

                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {users: this.users};
                    return response;
                }
            }

            const instance = new UsersEndpoint();
            const boundGet = instance.get.bind(instance);

            const request = new Request({} as any);
            const response = new Response();

            await boundGet(request, response);

            expect(response.rawBody).toEqual({users: ['Alice', 'Bob']});
        });
    });

    describe('Metadata copying from class methods to bound functions', () => {
        it('should copy @Before metadata', () => {
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

            // Simulate copyMethodMetadata logic
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');
            const beforeMeta = getMetadata(MetadataKeys.BEFORE, prototype, 'get');
            if (beforeMeta) {
                setMetadata(MetadataKeys.BEFORE, beforeMeta, boundGet);
            }

            // Verify metadata was copied
            const copiedMeta = getMetadata(MetadataKeys.BEFORE, boundGet);
            expect(copiedMeta).toBeDefined();
            expect(copiedMeta).toHaveLength(1);
            expect(copiedMeta[0]).toBe(beforeMw);
        });

        it('should copy @After metadata', () => {
            const afterMw: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @After(afterMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');
            const afterMeta = getMetadata(MetadataKeys.AFTER, prototype, 'get');
            if (afterMeta) {
                setMetadata(MetadataKeys.AFTER, afterMeta, boundGet);
            }

            // Verify
            const copiedMeta = getMetadata(MetadataKeys.AFTER, boundGet);
            expect(copiedMeta).toBeDefined();
            expect(copiedMeta).toHaveLength(1);
            expect(copiedMeta[0]).toBe(afterMw);
        });

        it('should copy @Timeout metadata', () => {
            class TestEndpoint extends BaseEndpoint {
                @Timeout(5000)
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');
            const timeoutMeta = getMetadata(MetadataKeys.TIMEOUT, prototype, 'get');
            if (timeoutMeta) {
                setMetadata(MetadataKeys.TIMEOUT, timeoutMeta, boundGet);
            }

            // Verify
            const copiedMeta = getMetadata(MetadataKeys.TIMEOUT, boundGet);
            expect(copiedMeta).toBeDefined();
            expect(copiedMeta.timeout).toBe(5000);
        });

        it('should copy @Validate metadata', () => {
            class TestEndpoint extends BaseEndpoint {
                @Validate({requiredHeaders: ['x-api-key']})
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const boundGet = instance.get.bind(instance);

            // Copy metadata
            const {MetadataKeys, getMetadata, setMetadata} = require('../../../../src/decorators/metadata');
            const validateMeta = getMetadata(MetadataKeys.VALIDATE, prototype, 'get');
            if (validateMeta) {
                setMetadata(MetadataKeys.VALIDATE, validateMeta, boundGet);
            }

            // Verify
            const copiedMeta = getMetadata(MetadataKeys.VALIDATE, boundGet);
            expect(copiedMeta).toBeDefined();
            expect((copiedMeta.requirements as any).requiredHeaders).toEqual(['x-api-key']);
        });

        it('should copy all metadata types together', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};
            const afterMw: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                @After(afterMw)
                @Timeout(3000)
                @Validate({requiredHeaders: ['authorization']})
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

        it('should copy multiple @Before middleware in correct order', () => {
            const mw1: BeforeMiddleware = async (_req, _res) => {};
            const mw2: BeforeMiddleware = async (_req, _res) => {};
            const mw3: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(mw1)
                @Before(mw2)
                @Before(mw3)
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
            if (beforeMeta) {
                setMetadata(MetadataKeys.BEFORE, beforeMeta, boundGet);
            }

            // Verify all middleware copied in order
            const copiedMeta = getMetadata(MetadataKeys.BEFORE, boundGet);
            expect(copiedMeta).toHaveLength(3);
            // Decorators are applied bottom-to-top
            expect(copiedMeta[0]).toBe(mw3);
            expect(copiedMeta[1]).toBe(mw2);
            expect(copiedMeta[2]).toBe(mw1);
        });
    });


    describe('Dual pattern support simulation', () => {
        it('should handle requirements pattern (Pattern 1)', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            const module = {
                get: async (_req: Request, res: Response) => {
                    res.body = {pattern: 'requirements'};
                    return res;
                },
                requirements: {
                    get: {
                        before: [beforeMw]
                    }
                }
            };

            // Simulate findEndpointClass - should return null
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            expect(foundClass).toBeNull();
            expect(typeof module.get).toBe('function');
            expect(module.requirements).toBeDefined();
        });

        it('should handle class-based pattern (Pattern 2)', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class ApiEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {pattern: 'class-based'};
                    return response;
                }
            }

            const module = {
                ApiEndpoint,
                default: ApiEndpoint
            };

            // Simulate findEndpointClass - should find class
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            expect(foundClass).not.toBeNull();
            expect(foundClass).toBe(ApiEndpoint);

            // Verify instance can be created
            const instance = new ApiEndpoint();
            expect(instance).toBeInstanceOf(BaseEndpoint);
            expect(typeof instance.get).toBe('function');
        });

        it('should prefer class-based over requirements when both exist', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class ApiEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {pattern: 'class-based'};
                    return response;
                }
            }

            // Module with BOTH patterns
            const module = {
                ApiEndpoint,
                default: ApiEndpoint,
                get: async (_req: Request, res: Response) => {
                    res.body = {pattern: 'requirements'};
                    return res;
                },
                requirements: {
                    get: {
                        before: [beforeMw]
                    }
                }
            };

            // Simulate findEndpointClass - should find class first
            let foundClass: (new () => BaseEndpoint) | null = null;
            for (const key in module) {
                const exported = module[key as keyof typeof module];
                if (
                    typeof exported === 'function' &&
                    exported.prototype &&
                    exported.prototype instanceof BaseEndpoint
                ) {
                    foundClass = exported as unknown as new () => BaseEndpoint;
                    break;
                }
            }

            // Class-based should be preferred
            expect(foundClass).not.toBeNull();
            expect(foundClass).toBe(ApiEndpoint);
        });
    });

    describe('HTTP method verification', () => {
        it('should detect missing HTTP method on class', () => {
            class UsersEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    response.body = {users: []};
                    return response;
                }
                // No POST method
            }

            const instance = new UsersEndpoint();

            // Convert to module
            const module: Record<string, Function> = {};
            const methods = ['get', 'post', 'put', 'patch', 'delete'];

            for (const method of methods) {
                if (typeof (instance as unknown as Record<string, unknown>)[method] === 'function') {
                    const boundMethod = ((instance as unknown as Record<string, Function>)[method]).bind(instance);
                    module[method] = boundMethod;
                }
            }

            expect(typeof module.get).toBe('function');
            expect(module.post).toBeUndefined();
        });

        it('should support all HTTP methods', () => {
            class FullEndpoint extends BaseEndpoint {
                async get(_request: Request, response: Response): Promise<Response> {
                    return response;
                }

                async post(_request: Request, response: Response): Promise<Response> {
                    return response;
                }

                async put(_request: Request, response: Response): Promise<Response> {
                    return response;
                }

                async patch(_request: Request, response: Response): Promise<Response> {
                    return response;
                }

                async delete(_request: Request, response: Response): Promise<Response> {
                    return response;
                }
            }

            const instance = new FullEndpoint();

            // Convert to module
            const module: Record<string, Function> = {};
            const methods = ['get', 'post', 'put', 'patch', 'delete'];

            for (const method of methods) {
                if (typeof (instance as unknown as Record<string, unknown>)[method] === 'function') {
                    const boundMethod = ((instance as unknown as Record<string, Function>)[method]).bind(instance);
                    module[method] = boundMethod;
                }
            }

            expect(typeof module.get).toBe('function');
            expect(typeof module.post).toBe('function');
            expect(typeof module.put).toBe('function');
            expect(typeof module.patch).toBe('function');
            expect(typeof module.delete).toBe('function');
        });
    });
});
