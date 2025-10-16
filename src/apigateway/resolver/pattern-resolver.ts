/**
 * Pattern-based route resolver
 */

import {ImportManager} from './import-manager';
import {BuildPathNotFoundError} from '../error/build-path-not-found';
import * as glob from 'glob';

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
    handlerPattern?: string;
    routesPath?: string; // New unified parameter name
    buildOutputDir?: string; // Build output directory for TypeScript compilation
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

        // Get pattern from routesPath or handlerPattern (legacy)
        let pattern = params.routesPath || params.handlerPattern || '';

        // Auto-append **/*.ts if no glob pattern detected
        // This allows users to specify just a directory path (e.g., 'src/handlers')
        // and it will automatically become 'src/handlers/**/*.ts'
        if (pattern && !pattern.includes('*')) {
            const separator = pattern.endsWith('/') ? '' : '/';
            pattern = pattern + separator + '**/*.ts';
        }

        // Transform TypeScript source path to build output path if needed
        pattern = this.transformPathForBuild(pattern, params.buildOutputDir);

        this.pattern = pattern;
    }

    /**
     * Transform TypeScript source path to build output path
     * @param sourcePath - Original source path
     * @param buildOutputDir - Optional build output directory
     * @returns Transformed path
     */
    private transformPathForBuild(sourcePath: string, buildOutputDir?: string): string {
        // Only transform if path contains .ts or .tsx extensions
        if (!sourcePath.match(/\.tsx?(\*)?$/)) {
            return sourcePath;
        }

        // Transform extension from .ts/.tsx to .js
        const jsPath = sourcePath.replace(/\.tsx?(\*)?$/, '.js$1');

        // If buildOutputDir is explicitly provided, use it
        if (buildOutputDir) {
            const transformedPath = this.prependBuildDir(jsPath, buildOutputDir);
            if (!this.pathHasMatches(transformedPath)) {
                throw new BuildPathNotFoundError(sourcePath, [transformedPath]);
            }
            return transformedPath;
        }

        // Auto-detect build directory from common paths
        const commonBuildDirs = ['.build', 'build', 'dist', '.dist'];
        const attemptedPaths: string[] = [];

        for (const buildDir of commonBuildDirs) {
            const transformedPath = this.prependBuildDir(jsPath, buildDir);
            attemptedPaths.push(transformedPath);

            if (this.pathHasMatches(transformedPath)) {
                return transformedPath;
            }
        }

        // Fall back to source .ts files if no build output found (dev mode with ts-node)
        if (this.pathHasMatches(sourcePath)) {
            return sourcePath;
        }

        // No valid build path or source files found
        throw new BuildPathNotFoundError(sourcePath, attemptedPaths);
    }

    /**
     * Prepend build directory to path
     * @param path - File path
     * @param buildDir - Build directory
     * @returns Path with build directory prepended
     */
    private prependBuildDir(path: string, buildDir: string): string {
        // Handle relative paths starting with './'
        if (path.startsWith('./')) {
            return `./${buildDir}/${path.slice(2)}`;
        }

        // Handle absolute paths - insert build directory before /src/
        if (path.startsWith('/')) {
            // Find the position where we should insert the build directory
            // Look for common source directory patterns
            const srcMatch = path.match(/^(.*?)(\/src\/.*)/);
            if (srcMatch) {
                return `${srcMatch[1]}/${buildDir}${srcMatch[2]}`;
            }
        }

        // Handle other relative paths
        return `${buildDir}/${path}`;
    }

    /**
     * Check if a glob pattern has any matching files
     * @param pattern - Glob pattern
     * @returns True if pattern has matches
     */
    private pathHasMatches(pattern: string): boolean {
        try {
            const matches = glob.sync(pattern, {nodir: true});
            return matches.length > 0;
        } catch (error) {
            return false;
        }
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
        const splitRequest = requestPath.split(this.sep);

        // Navigate to the correct starting point in the fileTree
        const startingTree = this.navigateToPatternRoot(fileTree, patternRoot);

        this.findRequestedFileWithinFileTree(startingTree, filePattern, splitRequest, 0);
        const importFilePath = this.importer.getImportPath(this.importParts);
        const endpointPath = `${patternRoot}/${importFilePath}`;

        return endpointPath;
    }

    /**
     * Navigate the fileTree to the patternRoot location
     * @param fileTree - File tree structure
     * @param patternRoot - Pattern root path
     * @returns Subtree at patternRoot location
     */
    private navigateToPatternRoot(fileTree: FileTree, patternRoot: string): FileTree {
        // Remove leading './' if present
        const cleanedRoot = patternRoot.startsWith('./') ? patternRoot.slice(2) : patternRoot;

        // Split the path and navigate through the tree
        const parts = cleanedRoot.split(this.sep).filter((p) => p.length > 0);

        let currentTree: FileTree = fileTree;
        for (const part of parts) {
            if (part in currentTree) {
                const next = currentTree[part];
                if (typeof next === 'object' && next !== null && !(next instanceof Set)) {
                    currentTree = next;
                } else {
                    // Can't navigate further
                    break;
                }
            } else {
                // Part not found in tree, return current level
                break;
            }
        }

        return currentTree;
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

            // Handle brace expansion patterns like *.{controller,endpoint}.js
            let foundMatch = false;

            if (possibleDir in fileTree) {
                this.handleDirectoryPath(fileTree, filePattern, possibleDir, splitRequest, index);
                foundMatch = true;
            } else if (possibleFile in fileTree) {
                this.importParts.push(possibleFile);
                foundMatch = true;
            } else if (filePattern.includes('{') && filePattern.includes('}')) {
                // Handle brace expansion patterns
                const expandedPatterns = this.expandBracePattern(filePattern, requestPart);

                for (const expandedPattern of expandedPatterns) {
                    if (expandedPattern in fileTree) {
                        this.importParts.push(expandedPattern);
                        foundMatch = true;
                        break;
                    }
                }
            }

            if (!foundMatch) {
                if ('__dynamicPath' in fileTree && (fileTree['__dynamicPath'] as Set<string>).size > 0) {
                    this.handleDynamicPath(fileTree, filePattern, splitRequest, index);
                    foundMatch = true;
                } else if (this.hasPathParams && possibleIndex in fileTree && index === splitRequest.length - 1) {
                    this.importParts.push(possibleIndex);
                    foundMatch = true;
                }
            }

            if (!foundMatch) {
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
                this.findRequestedFileWithinFileTree(nextTree, filePattern, splitRequest, index + 1);
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
                this.findRequestedFileWithinFileTree(nextTree, filePattern, splitRequest, index + 1);
            }
        }
    }

    /**
     * Expand brace pattern like *.{controller,endpoint}.js to individual patterns
     * @param filePattern - File pattern with braces
     * @param requestPart - Request part to substitute for *
     * @returns Array of expanded patterns
     */
    private expandBracePattern(filePattern: string, requestPart: string): string[] {
        const braceMatch = filePattern.match(/\{([^}]+)\}/);
        if (!braceMatch) {
            return [filePattern.replace('*', requestPart)];
        }

        const options = braceMatch[1].split(',');
        const expandedPatterns: string[] = [];

        for (const option of options) {
            const expandedPattern = filePattern.replace('*', requestPart).replace(braceMatch[0], option);
            expandedPatterns.push(expandedPattern);
        }

        return expandedPatterns;
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
            let foundFile = false;

            if (mvvmFile in dirTree) {
                this.importParts.push(mvvmFile);
                foundFile = true;
            } else if (indexFile in dirTree) {
                this.importParts.push(indexFile);
                foundFile = true;
            } else if (filePattern.includes('{') && filePattern.includes('}')) {
                // Handle brace expansion for files in directory
                const expandedMvvmPatterns = this.expandBracePattern(filePattern, possibleDir);
                const expandedIndexPatterns = this.expandBracePattern(filePattern, 'index');

                // Try mvvm patterns first
                for (const pattern of expandedMvvmPatterns) {
                    if (pattern in dirTree) {
                        this.importParts.push(pattern);
                        foundFile = true;
                        break;
                    }
                }

                // Then try index patterns
                if (!foundFile) {
                    for (const pattern of expandedIndexPatterns) {
                        if (pattern in dirTree) {
                            this.importParts.push(pattern);
                            foundFile = true;
                            break;
                        }
                    }
                }
            }
        }
    }
}
