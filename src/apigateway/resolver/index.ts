/**
 * Main route resolver coordinator
 */

import {ImportManager} from './import-manager';
import {DirectoryResolver} from './directory-resolver';
import {ListResolver} from './list-resolver';
import {PatternResolver} from './pattern-resolver';
import {ResolverCache} from './cache';
import {RoutingMode, IRouterConfig} from '../../types';

// Forward declaration for Endpoint - will be imported from endpoint module
type Endpoint = unknown;

/**
 * Request with path, method, and route properties
 */
interface RequestWithPath {
    path: string;
    method: string;
    route?: string;
    pathParams?: Record<string, string>;
}

/**
 * Method requirements structure
 */
interface MethodRequirements {
    requiredPath?: string;
    [key: string]: unknown;
}

/**
 * Endpoint module structure
 */
interface EndpointModule {
    [method: string]: ((...args: unknown[]) => unknown) | {[method: string]: MethodRequirements} | undefined;
}

/**
 * Resolver interface
 */
interface Resolver {
    hasPathParams: boolean;
    autoLoad(): void;
    resolve(request: RequestWithPath): unknown;
}

/**
 * Route splits structure
 */
interface RouteSplits {
    requestSplit: string[];
    pathSplit: string[];
}

/**
 * RouteResolver class coordinating different resolution strategies
 */
// Re-export resolver classes for public API
export {ResolverCache} from './cache';
export {ImportManager} from './import-manager';
export {PatternResolver} from './pattern-resolver';
export {DirectoryResolver} from './directory-resolver';
export {ListResolver} from './list-resolver';

export class RouteResolver {
    private params: IRouterConfig;
    private importer: ImportManager;
    private cacher: ResolverCache;
    private cacheMissesCount = 0;
    private resolver: Resolver | null = null;
    private resolvers: Record<RoutingMode, new (params: IRouterConfig, importer: ImportManager) => Resolver>;

    /**
     * Create a new RouteResolver
     * @param params - Router configuration
     */
    constructor(params: IRouterConfig) {
        this.params = params;
        this.importer = new ImportManager();
        this.cacher = new ResolverCache((params as {cacheSize?: number}).cacheSize, params.cache);
        this.resolvers = {
            pattern: PatternResolver as unknown as new (params: IRouterConfig, importer: ImportManager) => Resolver,
            directory: DirectoryResolver as unknown as new (params: IRouterConfig, importer: ImportManager) => Resolver,
            list: ListResolver as unknown as new (params: IRouterConfig, importer: ImportManager) => Resolver
        };
    }

    /**
     * Get cache misses count
     */
    get cacheMisses(): number {
        return this.cacheMissesCount;
    }

    /**
     * Auto-load routes
     */
    autoLoad(): void {
        this.setResolverMode();
        this.resolver?.autoLoad();
    }

    /**
     * Get the active resolver
     * @returns Resolver instance
     */
    getResolver(): Resolver | null {
        this.setResolverMode();
        return this.resolver;
    }

    /**
     * Get endpoint from request
     * @param request - Request with path and method
     * @returns Endpoint instance
     */
    getEndpoint(request: RequestWithPath): Endpoint {
        this.setResolverMode();
        const endpointModule = this.getEndpointModule(request) as EndpointModule;

        if (this.resolver?.hasPathParams) {
            this.configurePathParams(endpointModule, request);
        }

        if (typeof endpointModule[request.method] !== 'function') {
            this.importer.raise403();
        }

        // Return endpoint module for now - will be wrapped in Endpoint class in Phase 3.4
        return {endpointModule, method: request.method} as unknown as Endpoint;
    }

    /**
     * Get endpoint module from cache or resolver
     * @param request - Request with path
     * @returns Endpoint module
     */
    private getEndpointModule(request: RequestWithPath): unknown {
        const cached = this.cacher.get(request.path);
        if (cached) {
            if (this.resolver) {
                this.resolver.hasPathParams = cached.isDynamic;
            }
            return cached.endpointModule;
        }

        this.cacheMissesCount++;
        const endpointModule = this.resolver?.resolve(request);
        this.cacher.put(request.path, endpointModule, this.resolver?.hasPathParams || false);
        return endpointModule;
    }

    /**
     * Set resolver mode based on configuration
     */
    private setResolverMode(): void {
        if (!this.resolver) {
            const mode = this.params.mode || 'directory';
            const ResolverClass = this.resolvers[mode];
            this.resolver = new ResolverClass(this.params, this.importer);
        }
    }

    /**
     * Configure path parameters
     * @param endpoint - Endpoint module
     * @param request - Request object
     */
    private configurePathParams(endpoint: EndpointModule, request: RequestWithPath): void {
        this.checkRequiredPathRequirement(endpoint, request);
        const splits = this.splitRoutes(endpoint, request);
        this.checkPathsMatch(splits);
        this.setRequiredPathConfig(request, splits);
    }

    /**
     * Check if required path requirement exists
     * @param endpoint - Endpoint module
     * @param request - Request object
     */
    private checkRequiredPathRequirement(endpoint: EndpointModule, request: RequestWithPath): void {
        const reqs = (endpoint as unknown as {requirements?: {[key: string]: MethodRequirements}}).requirements;
        if (
            !reqs ||
            !reqs[request.method] ||
            !reqs[request.method].requiredPath
        ) {
            this.importer.raise404();
        }
    }

    /**
     * Split routes for path parameter extraction
     * @param endpoint - Endpoint module
     * @param request - Request object
     * @returns Split routes
     */
    private splitRoutes(endpoint: EndpointModule, request: RequestWithPath): RouteSplits {
        const reqs = (endpoint as unknown as {requirements?: {[key: string]: MethodRequirements}}).requirements;
        const requiredPath = reqs?.[request.method]?.requiredPath || '';
        const basePath = (this.params as {basePath?: string}).basePath || '';
        const requestedRoute = request.path.replace(basePath, '');
        const requestSplit = this.importer.cleanPath(requestedRoute).split(this.importer.fileSeparator);
        const pathSplit = this.importer.cleanPath(requiredPath).split(this.importer.fileSeparator);
        return {requestSplit, pathSplit};
    }

    /**
     * Check if paths match in length
     * @param splits - Route splits
     */
    private checkPathsMatch({requestSplit, pathSplit}: RouteSplits): void {
        if (pathSplit.length !== requestSplit.length) {
            this.importer.raise404();
        }
    }

    /**
     * Set required path configuration
     * @param request - Request object
     * @param splits - Route splits
     */
    private setRequiredPathConfig(request: RequestWithPath, splits: RouteSplits): void {
        const pathParams: Record<string, string> = {};

        for (const index in splits.requestSplit) {
            const pathPart = splits.pathSplit[index];
            if (pathPart?.includes('{') && pathPart?.includes('}')) {
                const keyBracket = pathPart.split('{')[1];
                const key = keyBracket.split('}')[0];
                const value = splits.requestSplit[index];
                pathParams[key] = value;
            }
        }

        request.pathParams = pathParams;
        const basePath = (this.params as {basePath?: string}).basePath || '';
        request.route = `/${basePath}/${this.importer.cleanPath(splits.pathSplit.join(this.importer.fileSeparator))}`;
    }
}
