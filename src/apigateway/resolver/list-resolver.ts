/**
 * List-based route resolver
 */

import {ImportManager} from './import-manager';

/**
 * Request with path and method properties
 */
interface RequestWithPath {
    path: string;
    method: string;
}

/**
 * List resolver configuration
 */
interface ListResolverParams {
    basePath?: string;
    handlerList: Record<string, string>;
}

/**
 * Routes structure
 */
interface Routes {
    paths: string[];
    files: string[];
}

/**
 * ListResolver class for list-based route resolution
 */
export class ListResolver {
    private importer: ImportManager;
    private basePath: string;
    private list: Record<string, string>;
    public hasPathParams = false;

    /**
     * Create a new ListResolver
     * @param params - Resolver configuration
     * @param importer - Import manager instance
     */
    constructor(params: ListResolverParams, importer: ImportManager) {
        this.importer = importer;
        this.basePath = params.basePath || '';
        this.list = params.handlerList;
    }

    /**
     * Auto-load (no-op for list resolver)
     */
    autoLoad(): void {
        return;
    }

    /**
     * Resolve a request to an endpoint module
     * @param request - Request with path and method
     * @returns Resolved endpoint module
     */
    resolve(request: RequestWithPath): unknown {
        this.reset();
        const endpointPath = this.getEndpointPath(request);
        return this.importer.importModuleFromPath(endpointPath);
    }

    /**
     * Reset resolver state
     */
    reset(): void {
        this.hasPathParams = false;
    }

    /**
     * Get endpoint path from request
     * @param request - Request with path and method
     * @returns Endpoint path
     */
    private getEndpointPath(request: RequestWithPath): string {
        const handlersFiltered = this.filterHandlerByMethod(request.method);
        const requestFiltered = this.filterRequestedPath(request.path);
        const requestPath = this.getPathFromRequest(requestFiltered, handlersFiltered);

        if (requestPath.files.length === 0) {
            this.importer.raise404();
        }
        if (requestPath.files.length > 1) {
            this.importer.raise409(`found two conflicting routes: ${requestPath.paths.join(',')}`);
        }
        return requestPath.files[0];
    }

    /**
     * Filter handlers by HTTP method
     * @param method - HTTP method
     * @returns Filtered handlers
     */
    private filterHandlerByMethod(method: string): Record<string, string> {
        const filteredHandlers: Record<string, string> = {};

        for (const handlerRoute in this.list) {
            if (!handlerRoute.includes('::')) {
                this.importer.raise409(`route does not follow pattern <METHOD>::route ${handlerRoute}`);
            }
            const methodKey = `${method.toLowerCase()}::`;
            if (handlerRoute.toLowerCase().includes(methodKey)) {
                const routeOnly = handlerRoute.toLowerCase().split(methodKey)[1];
                filteredHandlers[routeOnly] = this.list[handlerRoute];
            }
        }
        return filteredHandlers;
    }

    /**
     * Filter requested path
     * @param route - Request route
     * @returns Filtered path
     */
    private filterRequestedPath(route: string): string {
        const basePath = this.importer.cleanPath(this.basePath);
        const cleanRoute = this.importer.cleanPath(route);
        const requestedRoute = cleanRoute.replace(basePath, '');
        return this.importer.cleanPath(requestedRoute);
    }

    /**
     * Get matching paths from request
     * @param path - Request path
     * @param handlers - Filtered handlers
     * @returns Matching routes
     */
    private getPathFromRequest(path: string, handlers: Record<string, string>): Routes {
        const routes: Routes = {paths: [], files: []};

        for (const [route, file] of Object.entries(handlers)) {
            if (this.requestMatchesRoute(path, route)) {
                routes.files.push(file);
                routes.paths.push(route);
            }
        }
        return routes;
    }

    /**
     * Check if request matches route pattern
     * @param path - Request path
     * @param route - Route pattern
     * @returns True if matches
     */
    private requestMatchesRoute(path: string, route: string): boolean {
        const splitRoute = route.split(this.importer.fileSeparator);
        const splitRequest = path.split(this.importer.fileSeparator);

        if (splitRoute.length !== splitRequest.length) {
            return false;
        }

        for (const index in splitRequest) {
            if (splitRoute[index]?.includes('{') && splitRoute[index]?.includes('}')) {
                this.hasPathParams = true;
                continue;
            }
            if (!splitRoute[index] || splitRoute[index] !== splitRequest[index]) {
                return false;
            }
        }
        return true;
    }
}
