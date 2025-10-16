import {describe, it, expect} from '@jest/globals';
import 'reflect-metadata';
import {Before, After, Route} from '../../../src/decorators';
import {MetadataKeys, getMetadata} from '../../../src/decorators/metadata';
import {Request, Response} from '../../../src/apigateway';
import {BeforeMiddleware, AfterMiddleware} from '../../../src/types';

describe('Function Decorators Test', () => {
    describe('Before decorator on functions', () => {
        it('should attach Before middleware metadata to function', () => {
            const middleware: BeforeMiddleware = async (_req, _res) => {};
            
            const decoratedFunction = Before(middleware)(async (_req: Request, res: Response) => {
                return res;
            });
            
            const metadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, decoratedFunction as object);
            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(1);
            expect(metadata![0]).toBe(middleware);
        });

        it('should support multiple Before decorators', () => {
            const middleware1: BeforeMiddleware = async (_req, _res) => {};
            const middleware2: BeforeMiddleware = async (_req, _res) => {};
            
            const decoratedFunction = Before(middleware1)(
                Before(middleware2)(async (_req: Request, res: Response) => {
                    return res;
                })
            );
            
            const metadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, decoratedFunction as object);
            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(2);
            expect(metadata![0]).toBe(middleware2);
            expect(metadata![1]).toBe(middleware1);
        });
    });

    describe('After decorator on functions', () => {
        it('should attach After middleware metadata to function', () => {
            const middleware: AfterMiddleware = async (_req, _res) => {};
            
            const decoratedFunction = After(middleware)(async (_req: Request, res: Response) => {
                return res;
            });
            
            const metadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, decoratedFunction as object);
            expect(metadata).toBeDefined();
            expect(metadata).toHaveLength(1);
            expect(metadata![0]).toBe(middleware);
        });
    });

    describe('Route decorator on functions', () => {
        it('should attach Route metadata to function', () => {
            const decoratedFunction = Route('GET', '/test')(async (_req: Request, res: Response) => {
                return res;
            });
            
            const metadata = getMetadata(MetadataKeys.ROUTE, decoratedFunction as object);
            expect(metadata).toBeDefined();
            expect(metadata).toEqual({ method: 'GET', path: '/test' });
        });
    });

    describe('Combined decorators on functions', () => {
        it('should support all decorators together', () => {
            const beforeMw: BeforeMiddleware = async (_req, _res) => {};
            const afterMw: AfterMiddleware = async (_req, _res) => {};
            
            const decoratedFunction = Before(beforeMw)(
                After(afterMw)(
                    Route('POST', '/combined')(async (_req: Request, res: Response) => {
                        return res;
                    })
                )
            );
            
            const beforeMetadata = getMetadata<BeforeMiddleware[]>(MetadataKeys.BEFORE, decoratedFunction as object);
            const afterMetadata = getMetadata<AfterMiddleware[]>(MetadataKeys.AFTER, decoratedFunction as object);
            const routeMetadata = getMetadata(MetadataKeys.ROUTE, decoratedFunction as object);
            
            expect(beforeMetadata).toHaveLength(1);
            expect(afterMetadata).toHaveLength(1);
            expect(routeMetadata).toEqual({ method: 'POST', path: '/combined' });
        });
    });
});