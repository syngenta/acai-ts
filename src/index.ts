/**
 * Main entry point for acai-ts library
 *
 * DRY, configurable, declarative TypeScript library for working with Amazon Web Service Lambdas
 * with decorators support and Happy Path Programming philosophy.
 */

// Import reflect-metadata for decorator support
import 'reflect-metadata';

// API Gateway exports
export {Router, Request, Response, Endpoint} from './apigateway';
export {ApiError, ApiTimeout} from './apigateway/error';
export {
    RouteResolver,
    ResolverCache,
    ImportManager,
    PatternResolver
} from './apigateway/resolver';

// Common utilities exports
export {Logger} from './common/logger';
export {Schema} from './common/schema';
export {Validator} from './common/validator';
export {Timer} from './common/timer';
export {Event} from './common/event';

// Event module exports
export {Record as DynamoDBRecord} from './dynamodb/record';
export {Record as S3Record} from './s3/record';
export {Record as SQSRecord} from './sqs/record';

// Decorator exports
export {Route, Before, After, Validate, Timeout, Auth} from './decorators';
export {MetadataKeys, getMetadata, setMetadata, hasMetadata} from './decorators/metadata';

// Type exports
export * from './types';

// Re-export for backward compatibility and namespaced access
import {Router, Request, Response} from './apigateway';
import {Logger} from './common/logger';
import {Event} from './common/event';
import {Record as DynamoDBRecordClass} from './dynamodb/record';
import {Record as S3RecordClass} from './s3/record';
import {Record as SQSRecordClass} from './sqs/record';

/**
 * Namespace exports for backward compatibility with acai-js
 */
export const apigateway = {
    Router,
    Request,
    Response
};

export const logger = {
    Logger,
    setup: Logger.setUpGlobal
};

export const dynamodb = {
    Event,
    Record: DynamoDBRecordClass
};

export const s3 = {
    Event,
    Record: S3RecordClass
};

export const sqs = {
    Event,
    Record: SQSRecordClass
};
