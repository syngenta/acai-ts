/**
 * Error thrown when build output path cannot be found or auto-detected
 */

/**
 * BuildPathNotFoundError class for when TypeScript build output cannot be located
 */
export class BuildPathNotFoundError extends Error {
    public readonly sourcePath: string;
    public readonly attemptedPaths: string[];

    /**
     * Create a new BuildPathNotFoundError
     * @param sourcePath - The original source path that was provided
     * @param attemptedPaths - Array of build paths that were attempted
     * @param message - Error message
     */
    constructor(sourcePath: string, attemptedPaths: string[], message?: string) {
        const defaultMessage = message ||
            `Build output path not found for "${sourcePath}". ` +
            `Attempted paths: ${attemptedPaths.join(', ')}. ` +
            `Please specify 'buildOutputDir' in your router config or ensure your build output exists in one of the common directories: ['.build', 'build', 'dist', '.dist']`;

        super(defaultMessage);
        this.sourcePath = sourcePath;
        this.attemptedPaths = attemptedPaths;
        this.name = 'BuildPathNotFoundError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BuildPathNotFoundError);
        }
    }
}
