import {describe, it, expect} from '@jest/globals';
import 'reflect-metadata';
import {Before, After, Timeout, Validate} from '../../../../src/decorators';
import {MetadataKeys, getMetadata, ValidationMetadata, TimeoutMetadata} from '../../../../src/decorators/metadata';
import {Request, Response} from '../../../../src/apigateway';
import {BeforeMiddleware, AfterMiddleware} from '../../../../src/types';
import {BaseEndpoint} from '../../../../src/apigateway/base-endpoint';

describe('Method Decorators Test', () => {
    describe('@Before decorator on class methods', () => {
        it('should attach Before middleware metadata to method', () => {
            const middleware: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(middleware)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');

            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(1);
            expect(metadata![0]).toBe(middleware);
        });

        it('should support multiple @Before decorators on same method', () => {
            const middleware1: BeforeMiddleware = async (_req, _res) => {};
            const middleware2: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(middleware1)
                @Before(middleware2)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');

            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(2);
            // Decorators are applied bottom-to-top, so middleware2 is first
            expect(metadata![0]).toBe(middleware2);
            expect(metadata![1]).toBe(middleware1);
        });

        it('should work on different HTTP methods', () => {
            const getMw: BeforeMiddleware = async (_req, _res) => {};
            const postMw: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(getMw)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }

                @Before(postMw)
                async post(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);

            const getMethodMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');
            const postMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'post');

            expect(getMethodMetadata).toBeDefined();
            expect(getMethodMetadata![0]).toBe(getMw);
            expect(postMetadata).toBeDefined();
            expect(postMetadata![0]).toBe(postMw);
        });
    });

    describe('@After decorator on class methods', () => {
        it('should attach After middleware metadata to method', () => {
            const middleware: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @After(middleware)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, prototype, 'get');

            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(1);
            expect(metadata![0]).toBe(middleware);
        });

        it('should support multiple @After decorators on same method', () => {
            const middleware1: AfterMiddleware = async (_req, _res) => {};
            const middleware2: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @After(middleware1)
                @After(middleware2)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, prototype, 'get');

            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(2);
        });
    });

    describe('@Timeout decorator on class methods', () => {
        it('should attach Timeout metadata to method', () => {
            class TestEndpoint extends BaseEndpoint {
                @Timeout(5000)
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata(MetadataKeys.TIMEOUT, prototype, 'get');

            expect(metadata).toBeDefined();
            expect(metadata).toEqual({ timeout: 5000 });
        });

        it('should throw error for invalid timeout value', () => {
            expect(() => {
                class _TestEndpoint extends BaseEndpoint {
                    @Timeout(-100)
                    async get(_req: Request, res: Response): Promise<Response> {
                        return res;
                    }
                }
                // Force class to be used
                new _TestEndpoint();
            }).toThrow('@Timeout decorator requires a positive integer');
        });

        it('should throw error for non-integer timeout', () => {
            expect(() => {
                class _TestEndpoint extends BaseEndpoint {
                    @Timeout(5.5)
                    async get(_req: Request, res: Response): Promise<Response> {
                        return res;
                    }
                }
                // Force class to be used
                new _TestEndpoint();
            }).toThrow('@Timeout decorator requires a positive integer');
        });
    });

    describe('@Validate decorator on class methods', () => {
        it('should attach validation metadata with requiredHeaders', () => {
            class TestEndpoint extends BaseEndpoint {
                @Validate({
                    requiredHeaders: ['x-api-key', 'authorization']
                })
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, prototype, 'get');

            expect(metadata).toBeDefined();
            expect((metadata!.requirements as any).requiredHeaders).toEqual(['x-api-key', 'authorization']);
        });

        it('should attach validation metadata with requiredQuery', () => {
            class TestEndpoint extends BaseEndpoint {
                @Validate({
                    requiredQuery: ['page', 'limit']
                })
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, prototype, 'get');

            expect(metadata).toBeDefined();
            expect((metadata!.requirements as any).requiredQuery).toEqual(['page', 'limit']);
        });

        it('should attach validation metadata with requiredBody', () => {
            class TestEndpoint extends BaseEndpoint {
                @Validate({
                    requiredBody: 'User'
                })
                async post(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, prototype, 'post');

            expect(metadata).toBeDefined();
            expect((metadata!.requirements as any).requiredBody).toBe('User');
        });

        it('should attach validation metadata with JSON schema', () => {
            class TestEndpoint extends BaseEndpoint {
                @Validate({
                    body: {
                        type: 'object',
                        required: ['name', 'email'],
                        properties: {
                            name: { type: 'string' },
                            email: { type: 'string', format: 'email' }
                        }
                    }
                })
                async post(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);
            const metadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, prototype, 'post');

            expect(metadata).toBeDefined();
            expect((metadata!.requirements as any).body).toBeDefined();
            expect((metadata!.requirements as any).body.type).toBe('object');
            expect((metadata!.requirements as any).body.required).toEqual(['name', 'email']);
        });
    });

    describe('Combined decorators on class methods', () => {
        it('should support multiple decorators on same method', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};
            const afterMw: AfterMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                @After(afterMw)
                @Timeout(3000)
                @Validate({
                    requiredHeaders: ['x-api-key']
                })
                async get(_req: Request, res: Response): Promise<Response> {
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);

            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, prototype, 'get');
            const timeoutMetadata = getMetadata<TimeoutMetadata>(MetadataKeys.TIMEOUT, prototype, 'get');
            const validateMetadata = getMetadata<ValidationMetadata>(MetadataKeys.VALIDATE, prototype, 'get');

            expect(beforeMetadata).toHaveLength(1);
            expect(afterMetadata).toHaveLength(1);
            expect(timeoutMetadata).toEqual({ timeout: 3000 });
            expect((validateMetadata!.requirements as any).requiredHeaders).toEqual(['x-api-key']);
        });

        it('should work with all HTTP methods in one class', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};

            class TestEndpoint extends BaseEndpoint {
                @Before(beforeMw)
                async get(_req: Request, res: Response): Promise<Response> {
                    res.body = { method: 'GET' };
                    return res;
                }

                @Before(beforeMw)
                async post(_req: Request, res: Response): Promise<Response> {
                    res.body = { method: 'POST' };
                    return res;
                }

                @Before(beforeMw)
                async put(_req: Request, res: Response): Promise<Response> {
                    res.body = { method: 'PUT' };
                    return res;
                }
            }

            const instance = new TestEndpoint();
            const prototype = Object.getPrototypeOf(instance);

            const getMethodMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'get');
            const postMethodMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'post');
            const putMethodMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, prototype, 'put');

            expect(getMethodMetadata).toBeDefined();
            expect(postMethodMetadata).toBeDefined();
            expect(putMethodMetadata).toBeDefined();
        });
    });
});
