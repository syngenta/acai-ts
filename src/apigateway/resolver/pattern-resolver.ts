/**
 * Pattern-based route resolver
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
 * Pattern resolver configuration
 */
interface PatternResolverParams {
    basePath?: string;
    handlerPattern: string;
}

/**
 * File paths structure
 */
interface FilePaths {
    patternRoot: string;
    basePath: string;
    requestPath: string;
}

/**
 * PatternResolver class for pattern-based route resolution
 */
export class PatternResolver {
    private importer: ImportManager;
    private sep: string;
    private basePath: string;
    private pattern: string;
    public hasPathParams = false;
    public importParts: string[] = [];

    /**
     * Create a new PatternResolver
     * @param params - Resolver configuration
     * @param importer - Import manager instance
     */
    constructor(params: PatternResolverParams, importer: ImportManager) {
        this.importer = importer;
        this.sep = importer.fileSeparator;
        this.basePath = params.basePath || '';
        this.pattern = params.handlerPattern;
    }

    /**
     * Auto-load file tree
     */
    autoLoad(): void {
        this.importer.setHandlers(this.pattern);
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
        this.importer.setHandlers(this.pattern);
        this.importParts = [];
        this.hasPathParams = false;
    }

    /**
     * Get cleaned file paths
     * @param request - Request with path
     * @returns Cleaned file paths
     */
    private getFilePaths(request: RequestWithPath): FilePaths {
        const patternRoot = this.importer.cleanPath(this.pattern.split('*')[0]);
        const basePath = this.importer.cleanPath(this.basePath);
        const requestPath = this.importer.cleanPath(request.path.replace(basePath, ''));
        return {patternRoot, basePath, requestPath};
    }

    /**
     * Get endpoint path from file tree
     * @param fileTree - File tree structure
     * @param paths - Cleaned file paths
     * @returns Endpoint path
     */
    private getEndpointPath(fileTree: FileTree, {patternRoot, requestPath}: FilePaths): string {
        const splitPattern = this.pattern.split(this.sep);
        const filePattern = splitPattern[splitPattern.length - 1];
        this.findRequestedFileWithinFileTree(fileTree, filePattern, requestPath.split(this.sep), 0);
        const importFilePath = this.importer.getImportPath(this.importParts);
        const endpointPath = `${patternRoot}/${importFilePath}`;
        return endpointPath;
    }

    /**
     * Find requested file within file tree
     * @param fileTree - File tree structure
     * @param filePattern - File pattern
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private findRequestedFileWithinFileTree(fileTree: FileTree, filePattern: string, splitRequest: string[], index: number): void {
        if (index < splitRequest.length) {
            const requestPart = splitRequest[index];
            const possibleFile = filePattern.replace('*', requestPart);
            const possibleIndex = filePattern.replace('*', 'index');
            const possibleDir = requestPart;

            if (possibleDir in fileTree) {
                this.handleDirectoryPath(fileTree, filePattern, possibleDir, splitRequest, index);
            } else if (possibleFile in fileTree) {
                this.importParts.push(possibleFile);
            } else if ('__dynamicPath' in fileTree && (fileTree['__dynamicPath'] as Set<string>).size > 0) {
                this.handleDynamicPath(fileTree, filePattern, splitRequest, index);
            } else if (this.hasPathParams && possibleIndex in fileTree && index === splitRequest.length - 1) {
                this.importParts.push(possibleIndex);
            } else {
                this.importer.raise404();
            }
        }
    }

    /**
     * Handle directory path resolution
     * @param fileTree - File tree structure
     * @param filePattern - File pattern
     * @param possibleDir - Possible directory name
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private handleDirectoryPath(fileTree: FileTree, filePattern: string, possibleDir: string, splitRequest: string[], index: number): void {
        this.importParts.push(possibleDir);
        if (index + 1 === splitRequest.length) {
            this.determineAdditionalImportPath(fileTree, filePattern, possibleDir);
        } else {
            const nextTree = fileTree[possibleDir];
            if (typeof nextTree === 'object' && nextTree !== null && !(nextTree instanceof Set)) {
                this.findRequestedFileWithinFileTree(nextTree as FileTree, filePattern, splitRequest, index + 1);
            }
        }
    }

    /**
     * Handle dynamic path resolution
     * @param fileTree - File tree structure
     * @param filePattern - File pattern
     * @param splitRequest - Split request path
     * @param index - Current index
     */
    private handleDynamicPath(fileTree: FileTree, filePattern: string, splitRequest: string[], index: number): void {
        const dynamicPaths = fileTree['__dynamicPath'] as Set<string>;
        const [part] = dynamicPaths;
        this.hasPathParams = true;
        this.importParts.push(part);

        if (!part.includes('.js') && index + 1 >= splitRequest.length) {
            this.determineAdditionalImportPath(fileTree, filePattern, part);
        } else if (!part.includes('.js')) {
            const nextTree = fileTree[part];
            if (typeof nextTree === 'object' && nextTree !== null && !(nextTree instanceof Set)) {
                this.findRequestedFileWithinFileTree(nextTree as FileTree, filePattern, splitRequest, index + 1);
            }
        }
    }

    /**
     * Determine additional import path
     * @param fileTree - File tree structure
     * @param filePattern - File pattern
     * @param possibleDir - Possible directory name
     */
    private determineAdditionalImportPath(fileTree: FileTree, filePattern: string, possibleDir: string): void {
        const indexFile = filePattern.replace('*', 'index');
        const mvvmFile = filePattern.replace('*', possibleDir);
        const dirTree = fileTree[possibleDir];

        if (typeof dirTree === 'object' && dirTree !== null && !(dirTree instanceof Set)) {
            if (mvvmFile in dirTree) {
                this.importParts.push(mvvmFile);
            } else if (indexFile in dirTree) {
                this.importParts.push(indexFile);
            }
        }
    }
}
