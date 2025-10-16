import {describe, it, expect} from '@jest/globals';
import {Record} from '../../../src/sqs/record';
import * as mockData from '../../mocks/sqs/mock-data';

describe('Test SQS Record Client', () => {
    describe('basic positive property tests', () => {
        const record = new Record(mockData.getData().Records[0]);

        it('should have property for record', () => {
            expect(record.record).toEqual(mockData.getData().Records[0]);
        });

        it('should have property of id', () => {
            expect(record.id).toBe('19dd0b57-b21e-4ac1-bd88-01bbb068cb78');
        });

        it('should have property of receipt', () => {
            expect(record.receiptHandle).toBe('MessageReceiptHandle');
        });

        it('should have property of body', () => {
            expect(record.body).toEqual({status: 'ok'});
        });

        it('should have property of attributes', () => {
            expect(record.attributes).toEqual(mockData.getData().Records[0].attributes);
        });

        it('should have property of messageAttributes', () => {
            expect(record.messageAttributes).toEqual({});
        });

        it('should have property of messageAttributes with actual attributes', () => {
            const testRecord = new Record(mockData.getDataWithAttributes().Records[0]);
            expect(testRecord.messageAttributes).toEqual({attribute: 'this is an attribute'});
        });

        it('should have property of md5', () => {
            expect(record.md5).toBe(mockData.getData().Records[0].md5OfBody);
        });

        it('should have property of source', () => {
            expect(record.source).toBe(mockData.getData().Records[0].eventSource);
        });

        it('should have property of sourceARN', () => {
            expect(record.sourceARN).toBe(mockData.getData().Records[0].eventSourceARN);
        });

        it('should have property of region', () => {
            expect(record.region).toBe(mockData.getData().Records[0].awsRegion);
        });

        it('should have default property of true for is valid', () => {
            expect(record.isValid).toBe(true);
        });

        it('should be able to mutate property', () => {
            record.isValid = false;
            expect(record.isValid).toBe(false);
        });

        it('should have operation as create', () => {
            expect(record.operation).toBe('create');
        });
    });

    describe('basic negative tests', () => {
        const record = new Record(mockData.getNonJsonData().Records[0]);

        it('should have property of body', () => {
            expect(record.body).toEqual({status: 'ok'});
        });

        it('should have property of raw body', () => {
            expect(record.raw).toEqual({status: 'ok'});
        });
    });

    describe('additional property tests', () => {
        const record = new Record(mockData.getData().Records[0]);

        it('should have rawRecord property', () => {
            expect(record.rawRecord).toEqual(mockData.getData().Records[0]);
        });

        it('should have messageId property', () => {
            expect(record.messageId).toBe('19dd0b57-b21e-4ac1-bd88-01bbb068cb78');
        });

        it('should have rawBody property', () => {
            expect(record.rawBody).toBe('{"status":"ok"}');
        });

        it('should have md5OfBody property', () => {
            expect(record.md5OfBody).toBe(mockData.getData().Records[0].md5OfBody);
        });

        it('should have receiveCount property', () => {
            expect(record.receiveCount).toBeGreaterThanOrEqual(0);
        });

        it('should have firstReceiveTimestamp property', () => {
            expect(record.firstReceiveTimestamp).toBeGreaterThanOrEqual(0);
        });

        it('should have senderId property', () => {
            expect(record.senderId).toBeDefined();
        });

        it('should have sentTimestamp property', () => {
            expect(record.sentTimestamp).toBeGreaterThanOrEqual(0);
        });

        it('should handle missing optional attributes with defaults', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            delete rawRecord.attributes;
            delete rawRecord.md5OfBody;
            delete rawRecord.eventSourceARN;

            const testRecord = new Record(rawRecord);
            expect(testRecord.attributes).toEqual({});
            expect(testRecord.md5OfBody).toBe('');
            expect(testRecord.md5).toBe('');
            expect(testRecord.sourceARN).toBe('');
            expect(testRecord.receiveCount).toBe(0);
            expect(testRecord.firstReceiveTimestamp).toBe(0);
            expect(testRecord.senderId).toBe('');
            expect(testRecord.sentTimestamp).toBe(0);
        });
    });

    describe('message attributes parsing', () => {
        it('should parse stringValue attributes', () => {
            const testRecord = new Record(mockData.getDataWithAttributes().Records[0]);
            expect(testRecord.messageAttributes).toHaveProperty('attribute');
        });

        it('should parse binaryValue attributes', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.messageAttributes = {
                testBinary: {
                    binaryValue: Buffer.from('test'),
                    dataType: 'Binary'
                }
            };
            const testRecord = new Record(rawRecord);
            expect(testRecord.messageAttributes).toHaveProperty('testBinary');
            expect(testRecord.messageAttributes.testBinary).toEqual(Buffer.from('test'));
        });

        it('should parse dataType only attributes', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.messageAttributes = {
                testCustom: {
                    dataType: 'Number',
                    stringValue: undefined,
                    binaryValue: undefined
                }
            };
            const testRecord = new Record(rawRecord);
            expect(testRecord.messageAttributes).toHaveProperty('testCustom');
        });

        it('should handle empty messageAttributes', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            delete rawRecord.messageAttributes;
            const testRecord = new Record(rawRecord);
            expect(testRecord.messageAttributes).toEqual({});
        });
    });

    describe('body parsing', () => {
        it('should parse JSON body', () => {
            const record = new Record(mockData.getData().Records[0]);
            expect(record.body).toEqual({status: 'ok'});
        });

        it('should return raw body if JSON parse fails', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.body = 'not valid json {';
            const testRecord = new Record(rawRecord);
            expect(testRecord.body).toBe('not valid json {');
        });
    });
});
