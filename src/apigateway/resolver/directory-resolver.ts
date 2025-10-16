/**
 * Directory-based route resolver
 */

import {ImportManager} from './import-manager';

/**
 * File tree structure
 */
interface FileTree {
    [key: string]: FileTree | string | Set<string> | undefined;
}

/**
 * Request with path property
 */
interface RequestWithPath {
    path: string;
}

/**
 * Directory resolver configuration
 */
interface DirectoryResolverParams {
    basePath?: string;
    handlerPath?: string;
    routesPath?: string; // New unified parameter name
}

/**
 * File paths structure
 */
interface FilePaths {
    basePath: string;
    handlerFilePrefix: string;
    requestedRoutePath: string;
    requestedFilePath: string;
}

/**
 * DirectoryResolver class for directory-based route resolution
 */
export class DirectoryResolver {
    private importer: ImportManager;
    private sep: string;
    private basePath: string;
    private handlerPath: string;
    public hasPathParams = false;
    public importParts: string[] = [];

    /**
     * Create a new DirectoryResolver
     * @param params - Resolver configuration
     * @param importer - Import manager instance
     */
    constructor(params: DirectoryResolverParams, importer: ImportManager) {
        this.importer = importer;
        this.sep = importer.fileSeparator;
        this.basePath = params.basePath || '';
        // Support both handlerPath (legacy) and routesPath (new unified name)
        this.handlerPath = params.handlerPath || params.routesPath || '';
    }

    /**
     * Auto-load file tree
     */
    autoLoad(): void {
        this.importer.setHandlers(this.handlerPath);
        this.importer.getFileTree();
    }

    /**
     * Resolve a request to an endpoint module
     * @param request - Request with path
     * @returns Resolved endpoint module
     */
    resolve(request: RequestWithPath): unknown {
        this.reset();
        const fileTree = this.importer.getFileTree();
        const cleanedPaths = this.getFilePaths(request);
        const endpointPath = this.getEndpointPath(fileTree, cleanedPaths);
        const resolvedModule = this.importer.importModuleFromPath(endpointPath);
        return resolvedModule;
    }

    /**
     * Reset resolver state
     */
    reset(): void {
        this.importer.setHandlers(this.handlerPath);
        this.importParts = [];
        this.hasPathParams = false;
    }

    /**
     * Get cleaned file paths
     * @param request - Request with path
     * @returns Cleaned file paths
     */
    private getFilePaths(request: RequestWithPath): FilePaths {
        const basePath = this.importer.cleanPath(this.basePath);
        const handlerFilePrefix = this.importer.cleanPath(this.handlerPath);
        const requestedRoutePath = this.importer.cleanPath(request.path);
        const requestedFilePath = this.importer.cleanPath(requestedRoutePath.replace(basePath, ''));
        return {basePath, handlerFilePrefix, requestedRoutePath, requestedFilePath};
    }

    /**
     * Get endpoint path from file tree
     * @param fileTree - File tree structure
     * @param paths - Cleaned file paths
     * @returns Endpoint path
     */
    private getEndpointPath(fileTree: FileTree, {handlerFilePrefix, requestedFilePath}: FilePaths): string {
        this.findRequestedFileWithinFileTree(fileTree, requestedFilePath.split(this.sep), 0);
        const importFilePath = this.importer.getImportPath(this.importParts);
        const endpointPath = `${handlerFilePrefix}/${importFilePath}`;
        return endpointPath;
    }

    /**
     * Find requested file within file tree
     * @param fileTree - File tree structure
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private findRequestedFileWithinFileTree(fileTree: FileTree, splitRequest: string[], index: number): void {
        if (index < splitRequest.length) {
            const part = splitRequest[index];
            const possibleDir = part;
            const possibleFile = `${part}.js`;

            if (possibleDir in fileTree) {
                this.handleDirectoryPath(fileTree, possibleDir, splitRequest, index);
            } else if (possibleFile in fileTree) {
                this.importParts.push(possibleFile);
            } else if ('__dynamicPath' in fileTree && (fileTree['__dynamicPath'] as Set<string>).size > 0) {
                this.handleDynamicPath(fileTree, splitRequest, index);
            } else if (this.hasPathParams && 'index.js' in fileTree && index === splitRequest.length - 1) {
                this.importParts.push('index.js');
            } else {
                this.importer.raise404();
            }
        }
    }

    /**
     * Handle directory path resolution
     * @param fileTree - File tree structure
     * @param possibleDir - Possible directory name
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private handleDirectoryPath(fileTree: FileTree, possibleDir: string, splitRequest: string[], index: number): void {
        this.importParts.push(possibleDir);
        if (index + 1 >= splitRequest.length) {
            this.importParts.push('index.js');
        } else {
            const nextTree = fileTree[possibleDir];
            if (typeof nextTree === 'object' && nextTree !== null && !(nextTree instanceof Set)) {
                this.findRequestedFileWithinFileTree(nextTree as FileTree, splitRequest, index + 1);
            }
        }
    }

    /**
     * Handle dynamic path resolution
     * @param fileTree - File tree structure
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private handleDynamicPath(fileTree: FileTree, splitRequest: string[], index: number): void {
        const dynamicPaths = fileTree['__dynamicPath'] as Set<string>;
        const [part] = dynamicPaths;
        this.hasPathParams = true;
        this.importParts.push(part);

        if (!part.includes('.js') && index + 1 >= splitRequest.length) {
            this.importParts.push('index.js');
        } else if (!part.includes('.js')) {
            const nextTree = fileTree[part];
            if (typeof nextTree === 'object' && nextTree !== null && !(nextTree instanceof Set)) {
                this.findRequestedFileWithinFileTree(nextTree as FileTree, splitRequest, index + 1);
            }
        }
    }
}
