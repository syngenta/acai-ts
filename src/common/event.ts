/**
 * Event processing for DynamoDB, S3, and SQS events
 */

import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import {parse} from 'csv-parse/sync';
import {Logger} from './logger';
import {Schema} from './schema';
import {Validator} from './validator';
import {IEvent, IEventConfig, DataClassConstructor, OperationType} from '../types';
import {Record as DDBRecord} from '../dynamodb/record';
import {Record as S3Record} from '../s3/record';
import {Record as SQSRecord} from '../sqs/record';

/**
 * Generic AWS event record
 */
interface AWSEventRecord {
    eventSource?: string;
    [key: string]: unknown;
}

/**
 * AWS Event with Records array
 */
interface AWSEvent {
    Records: AWSEventRecord[];
}

/**
 * Record with validation properties
 */
interface ValidatableRecord {
    isValid: boolean;
    operation: OperationType;
    body: unknown;
    [key: string]: unknown;
}

/**
 * Event class for processing DynamoDB, S3, and SQS events
 */
export class Event<T = unknown> implements IEvent<T> {
    private params: IEventConfig<T>;
    private before?: (records: unknown[]) => Promise<void> | void;
    private requiredBody?: string | Record<string, unknown>;
    private schemaPath?: string;
    private dataClass?: DataClassConstructor<T>;
    private getObject?: boolean;
    private isJSON?: boolean;
    private isCSV?: boolean;
    private csvParser = parse;
    private operations: OperationType[];
    private validationError: boolean;
    private operationError: boolean;
    private event: AWSEvent;
    private recordsList: T[] = [];

    /**
     * Create a new Event processor
     * @param event - AWS event (DynamoDB, S3, or SQS)
     * @param params - Event processing configuration
     */
    constructor(event: AWSEvent | any, params: IEventConfig<T> = {} as IEventConfig<T>) {
        this.params = params;
        this.before = params.before as unknown as (records: unknown[]) => Promise<void> | void;
        this.requiredBody = params.requiredBody;
        this.schemaPath = params.schemaPath;
        this.dataClass = params.dataClass;
        this.getObject = params.getObject;
        this.isJSON = params.isJSON;
        this.isCSV = params.isCSV;
        this.operations = params.operations || (['create', 'update', 'delete'] as OperationType[]);
        this.validationError = params.validationError === undefined ? true : Boolean(params.validationError);
        this.operationError = params.operationError === undefined ? false : Boolean(params.operationError);
        this.event = event as AWSEvent;

        Logger.setUpGlobal(params.globalLogger, {
            callback: params.loggerCallback
        });
    }

    /**
     * Get records synchronously (basic processing)
     */
    get records(): T[] {
        // If records have already been processed (via process()), return them
        if (this.recordsList.length > 0 || (this.before || this.requiredBody || this.getObject)) {
            return this.recordsList;
        }

        this.validateBasicParams();
        let records = this.getRecordsInternal();
        records = this.filterOperationRecords(records);
        const transformed = this.assignDataClass(records);
        this.recordsList = transformed as T[];
        return this.recordsList;
    }

    /**
     * Get raw AWS event records
     */
    get rawRecords(): AWSEventRecord[] {
        return this.event.Records;
    }

    /**
     * Check if all records are valid
     */
    get allValid(): boolean {
        return this.recordsList.every((record) => (record as ValidatableRecord).isValid);
    }

    /**
     * Process records asynchronously (advanced processing)
     * @returns Processed and validated records
     */
    async process(): Promise<void> {
        this.validateAdvanceParams();
        let records = this.getRecordsInternal();
        records = await this.getObjectFromS3(records);
        await this.validateRecords(records);
        await this.runBefore(records);
        records = this.filterValidRecords(records);
        records = this.filterOperationRecords(records);
        const transformed = this.assignDataClass(records);
        this.recordsList = transformed as T[];
    }

    /**
     * Get records from event
     * @returns Array of record instances
     */
    private getRecordsInternal(): ValidatableRecord[] {
        const records: ValidatableRecord[] = [];
        for (const record of this.event.Records) {
            const source = record.eventSource;
            let recordInstance: ValidatableRecord;

            if (source === 'aws:dynamodb') {
                recordInstance = new DDBRecord(record as any) as unknown as ValidatableRecord;
            } else if (source === 'aws:s3') {
                recordInstance = new S3Record(record as any) as unknown as ValidatableRecord;
            } else if (source === 'aws:sqs') {
                recordInstance = new SQSRecord(record as any) as unknown as ValidatableRecord;
            } else {
                // Fallback for unknown sources
                recordInstance = {
                    isValid: true,
                    operation: 'create' as OperationType,
                    body: record,
                    source
                };
            }
            records.push(recordInstance);
        }
        return records;
    }

    /**
     * Assign data class to records
     * @param records - Records to transform
     * @returns Records with data class applied
     */
    private assignDataClass(records: ValidatableRecord[]): (T | ValidatableRecord)[] {
        if (this.dataClass) {
            const dataClassRecords: T[] = [];
            for (const record of records) {
                const dataClass = new this.dataClass(record);
                dataClassRecords.push(dataClass);
            }
            return dataClassRecords;
        }
        return records;
    }

    /**
     * Filter only valid records
     * @param records - Records to filter
     * @returns Valid records only
     */
    private filterValidRecords(records: ValidatableRecord[]): ValidatableRecord[] {
        const validRecords: ValidatableRecord[] = [];
        for (const record of records) {
            if (record.isValid) {
                validRecords.push(record);
            }
        }
        return validRecords;
    }

    /**
     * Filter records by operation type
     * @param records - Records to filter
     * @returns Records matching allowed operations
     */
    private filterOperationRecords(records: ValidatableRecord[]): ValidatableRecord[] {
        const operationRecords: ValidatableRecord[] = [];
        for (const record of records) {
            if (this.operations.includes(record.operation)) {
                operationRecords.push(record);
            } else if (this.operationError) {
                throw new Error(`record is operation: ${record.operation}; only allowed ${this.operations.join(',')}`);
            }
        }
        return operationRecords;
    }

    /**
     * Validate basic parameters
     */
    private validateBasicParams(): void {
        if (this.before || this.requiredBody || this.getObject) {
            throw new Error('Must use Event.process() with these params & await the records');
        }
        if (!Array.isArray(this.operations)) {
            throw new Error('operations must be an array, exclusively containing create, update, delete');
        }
    }

    /**
     * Validate advanced parameters
     */
    private validateAdvanceParams(): void {
        if (typeof this.requiredBody === 'string' && !this.schemaPath) {
            throw new Error('Must provide schemaPath if using requireBody as a reference');
        }
        if (this.isJSON && !this.getObject) {
            throw new Error('Must enable getObject if using expecting JSON from S3 object');
        }
    }

    /**
     * Get object content from S3
     * @param records - Records to process
     * @returns Records with S3 object content
     */
    private async getObjectFromS3(records: ValidatableRecord[]): Promise<ValidatableRecord[]> {
        if (this.getObject) {
            const s3 = new S3Client({});
            for (const record of records) {
                // Check if this is an S3 record by checking for S3-specific properties
                if ('source' in record && (record as any).source === 'aws:s3') {
                    const s3Record = record as any;
                    const command = new GetObjectCommand({
                        Bucket: s3Record.bucket.name,
                        Key: s3Record.key
                    });
                    const s3Object = await s3.send(command);

                    if (this.isJSON) {
                        const bodyString = await s3Object.Body?.transformToString('utf-8');
                        s3Record.body = bodyString ? JSON.parse(bodyString) : null;
                    } else if (this.isCSV) {
                        const bodyString = await s3Object.Body?.transformToString('utf-8');
                        s3Record.body = bodyString ? this.csvParser(bodyString, {columns: true, relax_quotes: true}) : null;
                    } else {
                        // Convert Body stream to Buffer for raw access
                        const bodyBuffer = s3Object.Body ? await s3Object.Body.transformToByteArray() : Buffer.from([]);
                        s3Record.body = {
                            ...s3Object,
                            Body: Buffer.from(bodyBuffer)
                        };
                    }
                }
            }
        }
        return records;
    }

    /**
     * Validate records against schema
     * @param records - Records to validate
     */
    private async validateRecords(records: ValidatableRecord[]): Promise<void> {
        const schemaConfig = {
            strictValidation: this.params.strictValidation,
            autoValidate: this.params.autoValidate
        };
        const schema = this.schemaPath
            ? Schema.fromFilePath(this.schemaPath, schemaConfig)
            : Schema.fromInlineSchema(this.requiredBody as Record<string, unknown>, schemaConfig);
        const entityName = typeof this.requiredBody === 'string' ? this.requiredBody : '';
        const validator = new Validator(schema, this.validationError);
        for (const record of records) {
            record.isValid = await validator.validateWithRequirementsRecord(entityName, record);
        }
    }

    /**
     * Run before middleware
     * @param records - Records to process
     */
    private async runBefore(records: ValidatableRecord[]): Promise<void> {
        if (this.before && typeof this.before === 'function') {
            await this.before(records);
        }
    }
}
