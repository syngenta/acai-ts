/**
 * SQS Record wrapper with convenient property access
 */

import {SQSRecord as AWSSQSRecord} from 'aws-lambda';

/**
 * SQS Record wrapper class providing convenient access to SQS message data
 */
export class Record<T = unknown> {
    private rawRecordValue: AWSSQSRecord;
    private validFlag = true;

    /**
     * Create a new SQS Record wrapper
     * @param record - AWS SQS record
     */
    constructor(record: AWSSQSRecord) {
        this.rawRecordValue = record;
    }

    /**
     * Get the original AWS SQS record
     */
    get rawRecord(): AWSSQSRecord {
        return this.rawRecordValue;
    }

    /**
     * Get original AWS SQS record (alias for backward compatibility)
     */
    get record(): AWSSQSRecord {
        return this.rawRecordValue;
    }

    /**
     * Get message ID
     */
    get messageId(): string {
        return this.rawRecordValue.messageId;
    }

    /**
     * Get message ID (alias)
     */
    get id(): string {
        return this.rawRecordValue.messageId;
    }

    /**
     * Get receipt handle (for message deletion)
     */
    get receiptHandle(): string {
        return this.rawRecordValue.receiptHandle;
    }

    /**
     * Get parsed message body
     */
    get body(): T {
        try {
            return JSON.parse(this.rawRecordValue.body) as T;
        } catch {
            return this.rawRecordValue.body as T;
        }
    }

    /**
     * Get raw message body (unparsed or parsed)
     */
    get raw(): T {
        return this.body;
    }

    /**
     * Get raw message body (unparsed string)
     */
    get rawBody(): string {
        return this.rawRecordValue.body;
    }

    /**
     * Get message attributes
     */
    get attributes(): AWSSQSRecord['attributes'] {
        return this.rawRecordValue.attributes || {};
    }

    /**
     * Get message attributes (typed values) - parsed version
     */
    get messageAttributes(): {[key: string]: unknown} {
        const attrs = this.rawRecordValue.messageAttributes || {};
        const parsed: {[key: string]: unknown} = {};

        for (const [key, value] of Object.entries(attrs)) {
            if (value.stringValue) {
                parsed[key] = value.stringValue;
            } else if (value.binaryValue) {
                parsed[key] = value.binaryValue;
            } else if (value.dataType) {
                parsed[key] = value;
            }
        }

        return parsed;
    }

    /**
     * Get MD5 hash of message body
     */
    get md5OfBody(): string {
        return this.rawRecordValue.md5OfBody || '';
    }

    /**
     * Get MD5 hash (alias)
     */
    get md5(): string {
        return this.rawRecordValue.md5OfBody || '';
    }

    /**
     * Get event source (aws:sqs)
     */
    get source(): string {
        return this.rawRecordValue.eventSource;
    }

    /**
     * Get event source ARN
     */
    get sourceARN(): string {
        return this.rawRecordValue.eventSourceARN || '';
    }

    /**
     * Get AWS region
     */
    get region(): string {
        return this.rawRecordValue.awsRegion;
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
     * Get approximate receive count
     */
    get receiveCount(): number {
        return parseInt(this.attributes.ApproximateReceiveCount || '0', 10);
    }

    /**
     * Get approximate first receive timestamp
     */
    get firstReceiveTimestamp(): number {
        return parseInt(this.attributes.ApproximateFirstReceiveTimestamp || '0', 10);
    }

    /**
     * Get sender ID
     */
    get senderId(): string {
        return this.attributes.SenderId || '';
    }

    /**
     * Get sent timestamp
     */
    get sentTimestamp(): number {
        return parseInt(this.attributes.SentTimestamp || '0', 10);
    }

    /**
     * Get operation type (always 'create' for SQS messages)
     */
    get operation(): 'create' {
        return 'create';
    }
}
