/**
 * Schema management and validation using OpenAPI and JSON Schema
 */

import * as fs from 'fs';
import Ajv2020 from 'ajv/dist/2020.js';
import mergeAll from 'json-schema-merge-allof';
import {Reva, RevaRequest} from '@apideck/reva';
import {ISchema, JsonSchema} from '../types';
import RefParser from 'json-schema-ref-parser';
import jsyaml from 'js-yaml';

/**
 * OpenAPI schema structure
 */
interface OpenAPISchema {
    paths?: Record<string, Record<string, OperationSchema>>;
    components?: {
        schemas?: Record<string, JsonSchema>;
    };
}

/**
 * OpenAPI operation schema
 */
interface OperationSchema {
    responses?: Record<string, ResponseSchema>;
    [key: string]: unknown;
}

/**
 * Response schema structure
 */
interface ResponseSchema {
    content?: Record<string, ContentSchema>;
}

/**
 * Content schema structure
 */
interface ContentSchema {
    schema?: JsonSchema;
}

/**
 * Schema class for managing OpenAPI and JSON Schema validation
 */
export class Schema implements ISchema {
    private refParser = RefParser;
    private openApiValidator: Reva;
    private schemaPath?: string;
    private strictValidation: boolean;
    private ajv: Ajv2020;

    public inlineSchema: JsonSchema;
    public openAPISchema: OpenAPISchema;

    /**
     * Create a new Schema instance
     * @param openAPISchema - OpenAPI schema object
     * @param inlineSchema - Inline JSON schema
     * @param params - Configuration parameters
     */
    constructor(
        openAPISchema: OpenAPISchema = {},
        inlineSchema: JsonSchema = {},
        params: {schemaPath?: string; strictValidation?: boolean; autoValidate?: boolean} = {}
    ) {
        this.openApiValidator = new Reva();
        this.schemaPath = params.schemaPath;
        this.strictValidation = params.strictValidation || false;
        this.ajv = new Ajv2020({allErrors: true, validateFormats: this.strictValidation});
        this.inlineSchema = inlineSchema;
        this.openAPISchema = openAPISchema;
    }

    /**
     * Create a Schema instance from a file path
     * @param schemaPath - Path to OpenAPI schema file
     * @param params - Configuration parameters
     * @returns Schema instance
     */
    static fromFilePath(schemaPath: string, params: {strictValidation?: boolean; autoValidate?: boolean} = {}): Schema {
        const openAPISchema = jsyaml.load(fs.readFileSync(schemaPath, 'utf8')) as OpenAPISchema;
        return new Schema(openAPISchema, {}, params);
    }

    /**
     * Create a Schema instance from an inline schema
     * @param inlineSchema - Inline JSON schema
     * @param params - Configuration parameters
     * @returns Schema instance
     */
    static fromInlineSchema(inlineSchema: JsonSchema, params: {strictValidation?: boolean; autoValidate?: boolean} = {}): Schema {
        return new Schema({}, inlineSchema, params);
    }

    /**
     * Auto-load schema from file
     */
    autoLoad(): void {
        this.loadSchema();
    }

    /**
     * Load schema from file if schema path is configured
     */
    loadSchema(): void {
        if (this.schemaPath) {
            this.openAPISchema = jsyaml.load(fs.readFileSync(this.schemaPath, 'utf8')) as OpenAPISchema;
        }
    }

    /**
     * Validate request against OpenAPI schema
     * @param path - Request path
     * @param method - HTTP method
     * @param request - Request object
     * @returns Array of validation errors
     */
    async validateOpenApi(path: string, method: string, request: unknown): Promise<unknown[]> {
        this.loadSchema();
        const refSchema = (await this.refParser.dereference(this.openAPISchema)) as OpenAPISchema;
        const operation = this.getOperationSchema(refSchema, path, method);
        const result = this.openApiValidator.validate({operation, request: request as RevaRequest});
        return result.errors || [];
    }

    /**
     * Validate data against a schema
     * @param entity - Schema entity name or schema object
     * @param data - Data to validate
     * @returns Array of validation errors
     */
    async validate(entity: string | JsonSchema = '', data: unknown = {}): Promise<unknown[] | null | undefined> {
        this.loadSchema();
        const schema = await this.getSchemaObject(entity);
        const ajvValidate = this.ajv.compile(schema);
        await ajvValidate(data);
        return ajvValidate.errors;
    }

    /**
     * Validate response against OpenAPI schema
     * @param path - Request path
     * @param request - Request object with method
     * @param response - Response object with code and contentType
     * @returns Array of validation errors
     */
    async validateOpenApiResponse(
        path: string,
        request: {method: string},
        response: {code: number; contentType: string; rawBody: unknown}
    ): Promise<unknown[] | null | undefined> {
        this.loadSchema();
        const refSchema = (await this.refParser.dereference(this.openAPISchema)) as OpenAPISchema;
        const operation = this.getOperationSchema(refSchema, path, request.method);
        let schema: ContentSchema = {};
        try {
            const responseSchema = operation.responses?.[response.code];
            schema = responseSchema?.content?.[response.contentType] || {};
            if (!schema.schema) {
                throw new Error('Schema not found');
            }
        } catch (error) {
            throw new Error(
                `problem with finding response schema for ${request.method}::${path} ${response.code}::${response.contentType}: ${error}`
            );
        }
        return await this.validate(schema.schema, response.rawBody);
    }

    /**
     * Get schema for a specific path and method (compatibility method)
     * @param path - Request path
     * @param method - HTTP method
     * @returns Schema object or undefined
     */
    getSchema(path: string, method: string): JsonSchema | undefined {
        try {
            const operation = this.openAPISchema.paths?.[path]?.[method];
            return operation as JsonSchema | undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Get schema object from entity name or inline schema
     * @param entity - Schema entity name or schema object
     * @returns Schema object
     */
    private async getSchemaObject(entity: string | JsonSchema = ''): Promise<JsonSchema> {
        if (Object.keys(this.openAPISchema).length && typeof entity === 'string' && entity.length) {
            const refSchema = (await this.refParser.dereference(this.openAPISchema)) as OpenAPISchema;
            return await this.combineSchemas(entity, refSchema);
        }
        if (typeof entity === 'object' && !Array.isArray(entity) && entity !== null) {
            return entity;
        }
        return this.inlineSchema;
    }

    /**
     * Combine schemas with inline refs and allOf
     * @param schemaComponentName - Schema component name
     * @param refSchema - Dereferenced schema
     * @returns Combined schema
     */
    private combineSchemas(schemaComponentName: string, refSchema: OpenAPISchema): JsonSchema {
        const schemaWithInlinedRefs = this.getEntityRulesFromSchema(schemaComponentName, refSchema);
        const schemaWithMergedAllOf = mergeAll(schemaWithInlinedRefs, {ignoreAdditionalProperties: true}) as JsonSchema;
        schemaWithMergedAllOf.additionalProperties = !this.strictValidation;
        return schemaWithMergedAllOf;
    }

    /**
     * Get entity schema from OpenAPI components
     * @param schemaComponentName - Schema component name
     * @param refSchema - Dereferenced schema
     * @returns Entity schema
     */
    private getEntityRulesFromSchema(schemaComponentName: string, refSchema: OpenAPISchema): JsonSchema {
        if (refSchema?.components?.schemas) {
            const schemaWithInlinedRefs = refSchema.components.schemas[schemaComponentName];
            if (schemaWithInlinedRefs) {
                return schemaWithInlinedRefs;
            }
        }
        throw new Error(`Schema with name ${schemaComponentName} is not found`);
    }

    /**
     * Get operation schema from OpenAPI paths
     * @param refSchema - Dereferenced schema
     * @param path - Request path
     * @param method - HTTP method
     * @returns Operation schema
     */
    private getOperationSchema(refSchema: OpenAPISchema, path: string, method: string): OperationSchema {
        try {
            const operation = refSchema.paths?.[path]?.[method];
            if (!operation) {
                throw new Error('Operation not found');
            }
            return operation;
        } catch (error) {
            throw new Error(`problem with importing your schema for ${method}::${path}: ${error}`);
        }
    }
}
