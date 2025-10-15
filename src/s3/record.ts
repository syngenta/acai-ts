/**
 * S3 Event Record wrapper with convenient property access
 */

import {S3EventRecord as AWSS3Record} from 'aws-lambda';
import {OperationType} from '../types';

/**
 * S3 Record wrapper class providing convenient access to S3 event record data
 */
export class Record<T = unknown> {
    private rawRecordValue: AWSS3Record;
    private validFlag = true;
    private bodyValue: T | null = null;

    /**
     * Create a new S3 Record wrapper
     * @param record - AWS S3 event record
     */
    constructor(record: AWSS3Record) {
        this.rawRecordValue = record;
    }

    /**
     * Get the original AWS S3 record
     */
    get rawRecord(): AWSS3Record {
        return this.rawRecordValue;
    }

    /**
     * Get original AWS S3 record (alias for rawRecord for backward compatibility)
     */
    get record(): AWSS3Record {
        return this.rawRecordValue;
    }

    /**
     * Get event name (e.g., s3:ObjectCreated:Put, s3:ObjectRemoved:Delete)
     */
    get eventName(): string {
        return this.rawRecordValue.eventName;
    }

    /**
     * Get event name (alias for eventName)
     */
    get name(): string {
        return this.rawRecordValue.eventName;
    }

    /**
     * Get event source (aws:s3)
     */
    get source(): string {
        return this.rawRecordValue.eventSource;
    }

    /**
     * Get event version
     */
    get version(): string {
        return this.rawRecordValue.eventVersion;
    }

    /**
     * Get event time
     */
    get eventTime(): string {
        return this.rawRecordValue.eventTime;
    }

    /**
     * Get event time (alias for eventTime)
     */
    get time(): string {
        return this.rawRecordValue.eventTime;
    }

    /**
     * Get AWS region
     */
    get region(): string {
        return this.rawRecordValue.awsRegion;
    }

    /**
     * Get request parameters
     */
    get request(): {sourceIPAddress: string} {
        return {
            sourceIPAddress: this.rawRecordValue.requestParameters?.sourceIPAddress || ''
        };
    }

    /**
     * Get response elements
     */
    get response(): {'x-amz-request-id': string; 'x-amz-id-2': string} {
        return {
            'x-amz-request-id': this.rawRecordValue.responseElements?.['x-amz-request-id'] || '',
            'x-amz-id-2': this.rawRecordValue.responseElements?.['x-amz-id-2'] || ''
        };
    }

    /**
     * Get configuration ID (alias for configurationId)
     */
    get id(): string {
        return this.rawRecordValue.s3.configurationId || '';
    }

    /**
     * Get S3 bucket name
     */
    get bucketName(): string {
        return this.rawRecordValue.s3.bucket.name;
    }

    /**
     * Get S3 bucket object
     */
    get bucket(): {name: string; ownerIdentity: {principalId: string}; arn: string} {
        return {
            name: this.rawRecordValue.s3.bucket.name,
            ownerIdentity: {
                principalId: this.rawRecordValue.s3.bucket.ownerIdentity?.principalId || ''
            },
            arn: this.rawRecordValue.s3.bucket.arn || ''
        };
    }

    /**
     * Get S3 bucket ARN
     */
    get bucketARN(): string {
        return this.rawRecordValue.s3.bucket.arn || '';
    }

    /**
     * Get S3 object details
     */
    get object(): {key: string; size: number; eTag: string; sequencer: string} {
        return {
            key: this.key,
            size: this.size,
            eTag: this.eTag,
            sequencer: this.sequencer
        };
    }

    /**
     * Get S3 object key
     */
    get key(): string {
        return decodeURIComponent(this.rawRecordValue.s3.object.key.replace(/\+/g, ' '));
    }

    /**
     * Get S3 object size in bytes
     */
    get size(): number {
        return this.rawRecordValue.s3.object.size || 0;
    }

    /**
     * Get S3 object eTag
     */
    get eTag(): string {
        return this.rawRecordValue.s3.object.eTag || '';
    }

    /**
     * Get S3 object version ID (if versioning enabled)
     */
    get versionId(): string {
        return this.rawRecordValue.s3.object.versionId || '';
    }

    /**
     * Get S3 object sequencer
     */
    get sequencer(): string {
        return this.rawRecordValue.s3.object.sequencer || '';
    }

    /**
     * Get S3 configuration ID
     */
    get configurationId(): string {
        return this.rawRecordValue.s3.configurationId || '';
    }

    /**
     * Get request ID
     */
    get requestId(): string {
        return this.rawRecordValue.responseElements?.['x-amz-request-id'] || '';
    }

    /**
     * Get requester (AWS account ID or principal)
     */
    get requester(): string {
        return this.rawRecordValue.userIdentity?.principalId || '';
    }

    /**
     * Get object body (must be set externally after fetching from S3)
     */
    get body(): T | null {
        return this.bodyValue;
    }

    /**
     * Set object body (used by Event processor after fetching from S3)
     */
    set body(value: T | null) {
        this.bodyValue = value;
    }

    /**
     * Get validation status
     */
    get isValid(): boolean {
        return this.validFlag;
    }

    /**
     * Set validation status
     */
    set isValid(valid: boolean) {
        this.validFlag = valid;
    }

    /**
     * Get operation type based on event name
     */
    get operation(): OperationType {
        const eventName = this.eventName.toLowerCase();

        if (eventName.includes('objectcreated') || eventName.includes('put') || eventName.includes('post')) {
            return 'create';
        }
        if (eventName.includes('objectremoved') || eventName.includes('delete')) {
            return 'delete';
        }
        if (eventName.includes('objectrestore')) {
            return 'update';
        }
        return 'unknown' as OperationType;
    }

    /**
     * Check if this is an object created event
     */
    get isCreated(): boolean {
        return this.operation === 'create';
    }

    /**
     * Check if this is an object removed event
     */
    get isRemoved(): boolean {
        return this.operation === 'delete';
    }

    /**
     * Get S3 URI (s3://bucket/key)
     */
    get uri(): string {
        return `s3://${this.bucketName}/${this.key}`;
    }
}
