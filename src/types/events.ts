/**
 * Event processing types for DynamoDB, S3, and SQS
 */

import {
    DynamoDBStreamEvent,
    DynamoDBRecord as AWSDynamoDBRecord,
    S3Event,
    S3EventRecord as AWSS3Record,
    SQSEvent,
    SQSRecord as AWSSQSRecord
} from 'aws-lambda';
import {OperationType} from './common';
import {BeforeMiddleware, AfterMiddleware} from './middleware';

/**
 * Data class constructor type
 */
export type DataClassConstructor<T> = new (data: unknown) => T;

/**
 * Event configuration
 */
export interface IEventConfig<T = unknown> {
    /**
     * AWS event (DynamoDB, S3, or SQS)
     */
    event?: DynamoDBStreamEvent | S3Event | SQSEvent;

    /**
     * Data class constructor for transforming records
     */
    dataClass?: DataClassConstructor<T>;

    /**
     * Filter by operation type
     */
    operations?: OperationType[];

    /**
     * Before middleware
     */
    before?: BeforeMiddleware;

    /**
     * After middleware
     */
    after?: AfterMiddleware;

    /**
     * Require all records to be valid
     */
    requireAll?: boolean;

    /**
     * Required body schema or schema reference
     */
    requiredBody?: string | Record<string, unknown>;

    /**
     * Path to OpenAPI schema file
     */
    schemaPath?: string;

    /**
     * Fetch S3 object content
     */
    getObject?: boolean;

    /**
     * Parse S3 object as JSON
     */
    isJSON?: boolean;

    /**
     * Parse S3 object as CSV
     */
    isCSV?: boolean;

    /**
     * Throw error on validation failure
     */
    validationError?: boolean;

    /**
     * Throw error on operation type mismatch
     */
    operationError?: boolean;

    /**
     * Enable global logger
     */
    globalLogger?: boolean;

    /**
     * Logger callback function
     */
    loggerCallback?: (log: unknown) => void;

    /**
     * Strict validation mode
     */
    strictValidation?: boolean;

    /**
     * Auto-validate with OpenAPI
     */
    autoValidate?: boolean;
}

/**
 * Generic event interface
 */
export interface IEvent<TRecord = unknown> {
    /**
     * Process all records in the event
     */
    process(): Promise<void>;

    /**
     * Get all processed records
     */
    readonly records: TRecord[];

    /**
     * Check if all records are valid
     */
    readonly allValid: boolean;
}

/**
 * DynamoDB record interface
 */
export interface IDynamoDBRecord<T = unknown> {
    /**
     * Original AWS DynamoDB record
     */
    readonly record: AWSDynamoDBRecord;

    /**
     * Record body (new image data)
     */
    readonly body: T;

    /**
     * Old image data (for updates/deletes)
     */
    readonly oldBody: T | undefined;

    /**
     * Check if record is valid
     */
    readonly isValid: boolean;

    /**
     * Record source (event name)
     */
    readonly source: string;

    /**
     * Operation type
     */
    readonly operation: OperationType;

    /**
     * DynamoDB keys
     */
    readonly keys: Record<string, unknown>;

    /**
     * Event ID
     */
    readonly eventId: string;

    /**
     * Event name
     */
    readonly eventName: string;
}

/**
 * S3 record interface
 */
export interface IS3Record<T = unknown> {
    /**
     * Original AWS S3 record
     */
    readonly record: AWSS3Record;

    /**
     * Record body (object data)
     */
    readonly body: T;

    /**
     * Check if record is valid
     */
    readonly isValid: boolean;

    /**
     * Record source
     */
    readonly source: string;

    /**
     * Operation type
     */
    readonly operation: OperationType;

    /**
     * S3 bucket name
     */
    readonly bucket: string;

    /**
     * S3 object key
     */
    readonly key: string;

    /**
     * Event name
     */
    readonly eventName: string;
}

/**
 * SQS record interface
 */
export interface ISQSRecord<T = unknown> {
    /**
     * Original AWS SQS record
     */
    readonly record: AWSSQSRecord;

    /**
     * Record body (message data)
     */
    readonly body: T;

    /**
     * Check if record is valid
     */
    readonly isValid: boolean;

    /**
     * Record source
     */
    readonly source: string;

    /**
     * Message ID
     */
    readonly messageId: string;

    /**
     * Receipt handle
     */
    readonly receiptHandle: string;

    /**
     * Message attributes
     */
    readonly attributes: Record<string, unknown>;
}
