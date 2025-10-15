/**
 * DynamoDB Stream Record wrapper with automatic unmarshalling
 */

import {DynamoDBRecord as AWSDynamoDBRecord} from 'aws-lambda';
import {unmarshall} from '@aws-sdk/util-dynamodb';
import {AttributeValue} from '@aws-sdk/client-dynamodb';
import {OperationType} from '../types';

/**
 * User identity structure for TTL deletions
 */
interface UserIdentity {
    type: string;
    principalId: string;
}

/**
 * DynamoDB Record wrapper class providing convenient access to stream record data
 */
export class Record<T = unknown> {
    private record: AWSDynamoDBRecord;
    private validFlag = true;

    /**
     * Create a new DynamoDB Record wrapper
     * @param record - AWS DynamoDB stream record
     */
    constructor(record: AWSDynamoDBRecord) {
        this.record = record;
    }

    /**
     * Get the original AWS DynamoDB record
     */
    get rawRecord(): AWSDynamoDBRecord {
        return this.record;
    }

    /**
     * Get event ID
     */
    get id(): string {
        return this.record.eventID || '';
    }

    /**
     * Get event name (INSERT, MODIFY, REMOVE)
     */
    get name(): string {
        return this.record.eventName || '';
    }

    /**
     * Get event source (aws:dynamodb)
     */
    get source(): string {
        return this.record.eventSource || '';
    }

    /**
     * Get AWS region
     */
    get region(): string {
        return this.record.awsRegion || '';
    }

    /**
     * Get event version
     */
    get version(): string {
        return this.record.eventVersion || '';
    }

    /**
     * Get unmarshalled new image (current state)
     */
    get newImage(): T {
        if (!this.record.dynamodb?.NewImage) {
            return {} as T;
        }
        return unmarshall(this.record.dynamodb.NewImage as {[key: string]: AttributeValue}) as T;
    }

    /**
     * Get unmarshalled old image (previous state)
     */
    get oldImage(): T {
        if (!this.record.dynamodb?.OldImage) {
            return {} as T;
        }
        return unmarshall(this.record.dynamodb.OldImage as {[key: string]: AttributeValue}) as T;
    }

    /**
     * Get body (alias for newImage)
     */
    get body(): T {
        return this.newImage;
    }

    /**
     * Get unmarshalled DynamoDB keys
     */
    get keys(): {[key: string]: unknown} {
        if (!this.record.dynamodb?.Keys) {
            return {};
        }
        return unmarshall(this.record.dynamodb.Keys as {[key: string]: AttributeValue});
    }

    /**
     * Get event source ARN
     */
    get sourceARN(): string {
        return this.record.eventSourceARN || '';
    }

    /**
     * Get stream view type (NEW_AND_OLD_IMAGES, NEW_IMAGE, etc.)
     */
    get streamType(): string {
        return this.record.dynamodb?.StreamViewType || '';
    }

    /**
     * Get record size in bytes
     */
    get size(): number {
        return this.record.dynamodb?.SizeBytes || 0;
    }

    /**
     * Get approximate creation timestamp
     */
    get created(): number {
        return this.record.dynamodb?.ApproximateCreationDateTime || 0;
    }

    /**
     * Get user identity (for TTL-triggered deletions)
     */
    get identity(): UserIdentity | null {
        return (this.record.userIdentity as UserIdentity) || null;
    }

    /**
     * Check if record was deleted by TTL
     */
    get expired(): boolean {
        return Boolean(this.identity?.principalId);
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
     * Get operation type (create, update, delete)
     */
    get operation(): OperationType {
        const hasNew = Object.keys(this.newImage as object).length > 0;
        const hasOld = Object.keys(this.oldImage as object).length > 0;

        if (hasNew && !hasOld) {
            return 'create';
        }
        if (hasNew && hasOld) {
            return 'update';
        }
        if (!hasNew && hasOld) {
            return 'delete';
        }
        return 'unknown' as OperationType;
    }
}
