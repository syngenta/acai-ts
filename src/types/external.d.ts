/**
 * Type declarations for external modules without type definitions
 */

declare module 'json-schema-merge-allof' {
    function mergeAllOf(schema: unknown, options?: {ignoreAdditionalProperties?: boolean}): unknown;
    export = mergeAllOf;
}

declare module 'json-schema-ref-parser' {
    class $RefParser {
        static dereference(schema: unknown): Promise<unknown>;
    }
    export = $RefParser;
}

declare module '@apideck/reva' {
    export interface ValidationError {
        message: string;
        path?: string;
    }

    export interface ValidationResult {
        ok: boolean;
        errors?: ValidationError[];
    }

    export interface RevaRequest {
        headers?: Record<string, unknown>;
        queryParameters?: Record<string, unknown>;
        pathParameters?: Record<string, unknown>;
        body?: unknown;
    }

    export interface RevaValidateInput {
        operation: unknown;
        request: RevaRequest;
    }

    export class Reva {
        constructor();
        validate(input: RevaValidateInput): ValidationResult;
    }
}

declare module 'js-yaml' {
    export function load(str: string): unknown;
    export function dump(obj: unknown): string;
}
