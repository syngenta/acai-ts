import {describe, it, expect, beforeEach, afterEach, afterAll} from '@jest/globals';
import {PatternResolver} from '../../../../src/apigateway/resolver/pattern-resolver';
import {ImportManager} from '../../../../src/apigateway/resolver/import-manager';
import {BuildPathNotFoundError} from '../../../../src/apigateway/error/build-path-not-found';
import * as fs from 'fs';
import * as path from 'path';

describe('Build Path Detection: src/apigateway/resolver/pattern-resolver', () => {
    let testDir: string;
    let importer: ImportManager;
    const createdDirs: string[] = [];

    beforeEach(() => {
        testDir = path.join(process.cwd(), 'test-temp-' + Date.now() + '-' + Math.random().toString(36).substring(7));
        createdDirs.push(testDir);
        importer = new ImportManager();
    });

    afterEach(() => {
        // Clean up test directories synchronously
        try {
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, {recursive: true, force: true, maxRetries: 3, retryDelay: 100});
            }
        } catch (error) {
            // Ignore cleanup errors during test run
        }
    });

    afterAll(() => {
        // Final cleanup of all created directories
        createdDirs.forEach(dir => {
            try {
                if (fs.existsSync(dir)) {
                    fs.rmSync(dir, {recursive: true, force: true, maxRetries: 5, retryDelay: 200});
                }
            } catch (error) {
                // Ignore final cleanup errors
            }
        });
    });

    const createTestFiles = (structure: Record<string, string[]>) => {
        Object.entries(structure).forEach(([dir, files]) => {
            const fullDir = path.join(testDir, dir);
            fs.mkdirSync(fullDir, {recursive: true});
            files.forEach(file => {
                fs.writeFileSync(path.join(fullDir, file), '// test file');
            });
        });
    };

    describe('Auto-detection of build directories', () => {
        it('should auto-detect .build directory', () => {
            createTestFiles({
                '.build/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('.build');
            expect(resolver['pattern']).toContain('.js');
        });

        it('should auto-detect build directory', () => {
            createTestFiles({
                'build/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('build');
            expect(resolver['pattern']).toContain('.js');
        });

        it('should auto-detect dist directory', () => {
            createTestFiles({
                'dist/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('dist');
            expect(resolver['pattern']).toContain('.js');
        });

        it('should auto-detect .dist directory', () => {
            createTestFiles({
                '.dist/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('.dist');
            expect(resolver['pattern']).toContain('.js');
        });

        it('should prioritize .build over other directories', () => {
            createTestFiles({
                '.build/src/handlers': ['test.controller.js'],
                'dist/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('.build');
        });
    });

    describe('Explicit buildOutputDir configuration', () => {
        it('should use explicit buildOutputDir when provided', () => {
            createTestFiles({
                '.build/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`,
                buildOutputDir: '.build'
            }, importer);

            expect(resolver['pattern']).toContain('.build');
            expect(resolver['pattern']).toContain('.js');
        });

        it('should throw error when explicit buildOutputDir has no matching files', () => {
            expect(() => {
                new PatternResolver({
                    routesPath: `${testDir}/src/handlers/**/*.ts`,
                    buildOutputDir: 'nonexistent'
                }, importer);
            }).toThrow(BuildPathNotFoundError);
        });
    });

    describe('Source TypeScript files exist (dev mode)', () => {
        it('should use source .ts files when they exist', () => {
            createTestFiles({
                'src/handlers': ['test.controller.ts']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).not.toContain('.build');
            expect(resolver['pattern']).not.toContain('dist');
            expect(resolver['pattern']).toContain('.ts');
        });
    });

    describe('BuildPathNotFoundError scenarios', () => {
        it('should throw BuildPathNotFoundError when no build path found', () => {
            expect(() => {
                new PatternResolver({
                    routesPath: `${testDir}/src/handlers/**/*.ts`
                }, importer);
            }).toThrow(BuildPathNotFoundError);

            try {
                new PatternResolver({
                    routesPath: `${testDir}/src/handlers/**/*.ts`
                }, importer);
            } catch (error) {
                expect(error).toBeInstanceOf(BuildPathNotFoundError);
                const buildError = error as BuildPathNotFoundError;
                expect(buildError.sourcePath).toContain('/src/handlers/**/*.ts');
                expect(buildError.attemptedPaths.length).toBe(4); // .build, build, dist, .dist
            }
        });

        it('should include attempted paths in error message', () => {
            expect(() => {
                new PatternResolver({
                    routesPath: `${testDir}/src/handlers/**/*.ts`
                }, importer);
            }).toThrow(BuildPathNotFoundError);

            try {
                new PatternResolver({
                    routesPath: `${testDir}/src/handlers/**/*.ts`
                }, importer);
            } catch (error) {
                expect(error).toBeInstanceOf(BuildPathNotFoundError);
                const message = (error as Error).message;
                expect(message).toContain('.build');
                expect(message).toContain('build');
                expect(message).toContain('dist');
                expect(message).toContain('.dist');
            }
        });
    });

    describe('Path with .js extension (no transformation)', () => {
        it('should not transform paths that already have .js extension', () => {
            createTestFiles({
                '.build/src/handlers': ['test.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/.build/src/handlers/**/*.js`
            }, importer);

            expect(resolver['pattern']).toContain('.js');
            expect(resolver['pattern']).toContain('.build');
        });
    });

    describe('Nested directory structure', () => {
        it('should handle nested source directories correctly', () => {
            createTestFiles({
                '.build/src/api/v1/handlers': ['users.controller.js']
            });

            const resolver = new PatternResolver({
                routesPath: `${testDir}/src/api/v1/handlers/**/*.ts`
            }, importer);

            expect(resolver['pattern']).toContain('.build');
            expect(resolver['pattern']).toContain('/src/api/v1/handlers/');
        });
    });
});
