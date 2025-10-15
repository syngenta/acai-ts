/**
 * Import manager for dynamic module loading and file tree management
 */

import * as path from 'path';
import {globSync} from 'glob';
import {ApiError} from '../error';

/**
 * File tree structure
 */
interface FileTree {
    [key: string]: FileTree | string | Set<string> | undefined;
}

/**
 * ImportManager class for handling dynamic imports and file tree operations
 */
export class ImportManager {
    private handlers: string | null = null;
    private fileTree: FileTree = {};

    /**
     * Create a new ImportManager
     */
    constructor() {
        // Constructor intentionally empty
    }

    /**
     * Get the file separator for the current platform
     */
    get fileSeparator(): string {
        return path.sep;
    }

    /**
     * Set the handlers path pattern
     * @param handlers - Handlers path or glob pattern
     */
    setHandlers(handlers: string): void {
        this.handlers = handlers;
    }

    /**
     * Get import path from sections
     * @param importSections - Array of path sections
     * @returns Joined import path
     */
    getImportPath(importSections: string[]): string {
        return importSections.join(this.fileSeparator);
    }

    /**
     * Clean a path by removing empty sections
     * @param dirtyPath - Path to clean
     * @returns Cleaned path
     */
    cleanPath(dirtyPath: string): string {
        const cleanPath = dirtyPath.split(path.sep).filter(Boolean);
        return cleanPath.join(path.sep);
    }

    /**
     * Import a module from a resolved path
     * @param resolved - Resolved module path
     * @returns Imported module
     */
    importModuleFromPath(resolved: string): unknown {
        // Use dynamic import for ES modules in TypeScript
        return require(path.join(process.cwd(), resolved));
    }

    /**
     * Raise a 403 Method Not Allowed error
     */
    raise403(): never {
        throw new ApiError(403, 'method', 'method not allowed');
    }

    /**
     * Raise a 404 Not Found error
     */
    raise404(): never {
        throw new ApiError(404, 'url', 'endpoint not found');
    }

    /**
     * Raise a 409 Conflict error
     * @param message - Error message
     */
    raise409(message: string): never {
        throw new ApiError(409, 'request-path', `request path conflict; ${message}`);
    }

    /**
     * Get the file tree structure
     * @returns File tree object
     */
    getFileTree(): FileTree {
        if (Object.keys(this.fileTree).length > 0) {
            return this.fileTree;
        }
        const fileList = this.getFilesList();
        this.buildFileTree(fileList);
        return this.fileTree;
    }

    /**
     * Get list of handler files
     * @returns Array of file paths
     */
    private getFilesList(): string[] {
        const globHandlerPattern = this.getGlobPattern();
        const handlerFilePrefix = this.getHandlerPrefix();
        const files = globSync(globHandlerPattern);
        return files.map((file) => file.replace(handlerFilePrefix, ''));
    }

    /**
     * Get glob pattern for handlers
     * @returns Glob pattern string
     */
    private getGlobPattern(): string {
        if (!this.handlers) {
            throw new Error('Handlers path not set');
        }
        if (this.handlers.includes('*')) {
            return this.handlers;
        }
        return `${this.cleanPath(this.handlers)}${this.fileSeparator}**${this.fileSeparator}*.js`;
    }

    /**
     * Get handler prefix for path manipulation
     * @returns Handler prefix string
     */
    private getHandlerPrefix(): string {
        if (!this.handlers) {
            throw new Error('Handlers path not set');
        }
        if (!this.handlers.includes('*')) {
            return this.cleanPath(this.handlers);
        }
        return this.cleanPath(this.handlers.split('*')[0]);
    }

    /**
     * Build file tree from file list
     * @param files - Array of file paths
     */
    private buildFileTree(files: string[]): void {
        for (const file of files) {
            const fileParts = file.split(this.fileSeparator).filter((f) => f);
            this.recurseSection(this.fileTree, fileParts, 0);
        }
    }

    /**
     * Recursively build file tree sections
     * @param tree - Current tree node
     * @param parts - Path parts
     * @param index - Current index
     */
    private recurseSection(tree: FileTree, parts: string[], index: number): void {
        if (typeof parts[index] === 'undefined') {
            return;
        }
        const part = parts[index];
        if (!(part in tree)) {
            tree[part] = index + 1 < parts.length ? {} : '*';
        }
        if (typeof tree === 'object' && !('__dynamicPath' in tree)) {
            tree['__dynamicPath'] = new Set<string>();
        }
        if (part.includes('{') && part.includes('}')) {
            (tree['__dynamicPath'] as Set<string>).add(part);
        }
        this.checkMultipleDynamicPaths(tree, parts);
        this.checkFileAndDirectoryNameUnique(tree, parts, part);
        const nextNode = tree[part];
        if (typeof nextNode === 'object' && nextNode !== null && !(nextNode instanceof Set)) {
            this.recurseSection(nextNode as FileTree, parts, index + 1);
        }
    }

    /**
     * Check for multiple dynamic paths in the same directory
     * @param tree - Current tree node
     * @param parts - Path parts
     */
    private checkMultipleDynamicPaths(tree: FileTree, parts: string[]): void {
        const dynamicPaths = tree['__dynamicPath'] as Set<string> | undefined;
        if (dynamicPaths && dynamicPaths.size > 1) {
            const files = [...dynamicPaths].join(',');
            parts.pop();
            const location = parts.join(this.fileSeparator);
            this.raise409(`found two dynamic files/directories in the same directory. files: ${files}, location: ${location}`);
        }
    }

    /**
     * Check that file and directory names are unique
     * @param tree - Current tree node
     * @param parts - Path parts
     * @param part - Current part
     */
    private checkFileAndDirectoryNameUnique(tree: FileTree, parts: string[], part: string): void {
        const opposite = part.includes('.js') ? part.replace('.js', '') : `${part}.js`;
        if (opposite in tree) {
            parts.pop();
            const location = parts.join(this.fileSeparator);
            this.raise409(`found file & directory with same name. files: ${part}, location: ${location}`);
        }
    }
}
