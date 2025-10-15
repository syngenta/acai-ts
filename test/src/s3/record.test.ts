import {describe, it, expect} from '@jest/globals';
import {Record} from '../../../src/s3/record';
import * as mockData from '../../mocks/s3/mock-data';

describe('Test S3 Record Client', () => {
    const record = new Record(mockData.getData().Records[0]);

    describe('test properties', () => {
        it('should have property for record', () => {
            expect(record.record).toEqual(mockData.getData().Records[0]);
        });

        it('should have property of name', () => {
            expect(record.name).toBe('ObjectCreated:Put');
        });

        it('should have property of source', () => {
            expect(record.source).toEqual('aws:s3');
        });

        it('should have property of time', () => {
            expect(record.time).toEqual('2018-09-20T21:10:13.821Z');
        });

        it('should have property of region', () => {
            expect(record.region).toEqual('us-east-1');
        });

        it('should have property of request', () => {
            expect(record.request).toEqual({sourceIPAddress: '172.20.133.36'});
        });

        it('should have property of response', () => {
            expect(record.response).toEqual({
                'x-amz-request-id': '6B859DD0CE613FAE',
                'x-amz-id-2': 'EXLMfc9aiXZFzNwLKXpw35iaVvl/DkEA6GtbuxjfmuLN3kLPL/aGoa7NMSwpl3m7ICAtNbjJX4w='
            });
        });

        it('should have property of id', () => {
            expect(record.id).toBe('exS3-v2--7cde234c7ff76c53c44990396aeddc6d');
        });

        it('should have property of object', () => {
            expect(record.object).toEqual({
                key: '123456789/3c8e97105d5f462f8896a7189910ee16-original.jpg',
                size: 17545,
                eTag: 'b79ac2ef68c08fa9ac6013d53038a26c',
                sequencer: '005BA40CB5BD42013A'
            });
        });

        it('should have property of key', () => {
            expect(record.key).toBe('123456789/3c8e97105d5f462f8896a7189910ee16-original.jpg');
        });

        it('should have property of bucket', () => {
            expect(record.bucket).toEqual({
                name: 'deploy-workers-poc-photos',
                ownerIdentity: {
                    principalId: 'A32KFL0DQ3MH8X'
                },
                arn: 'arn:aws:s3:::deploy-workers-poc-photos'
            });
        });

        it('should have property of version', () => {
            expect(record.version).toBe('2.0');
        });

        it('should have default property of true for is valid', () => {
            expect(record.isValid).toBe(true);
        });

        it('should have operation as create', () => {
            expect(record.operation).toBe('create');
        });

        it('should have operation as delete', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.eventName = 's3:ObjectRemoved:Delete';
            const testRecord = new Record(rawRecord);
            expect(testRecord.operation).toBe('delete');
        });

        it('should have operation as unknown', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.eventName = 'ERROR';
            const testRecord = new Record(rawRecord);
            expect(testRecord.operation).toBe('unknown');
        });

        it('should have isCreated as true for create operations', () => {
            expect(record.isCreated).toBe(true);
        });

        it('should have isRemoved as false for create operations', () => {
            expect(record.isRemoved).toBe(false);
        });

        it('should have isRemoved as true for delete operations', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            rawRecord.eventName = 's3:ObjectRemoved:Delete';
            const testRecord = new Record(rawRecord);
            expect(testRecord.isRemoved).toBe(true);
        });

        it('should have uri property', () => {
            expect(record.uri).toBe('s3://deploy-workers-poc-photos/123456789/3c8e97105d5f462f8896a7189910ee16-original.jpg');
        });

        it('should have rawRecord property', () => {
            expect(record.rawRecord).toEqual(mockData.getData().Records[0]);
        });

        it('should have eventName property', () => {
            expect(record.eventName).toBe('ObjectCreated:Put');
        });

        it('should have eventTime property', () => {
            expect(record.eventTime).toBe('2018-09-20T21:10:13.821Z');
        });

        it('should have bucketName property', () => {
            expect(record.bucketName).toBe('deploy-workers-poc-photos');
        });

        it('should have bucketARN property', () => {
            expect(record.bucketARN).toBe('arn:aws:s3:::deploy-workers-poc-photos');
        });

        it('should have size property', () => {
            expect(record.size).toBe(17545);
        });

        it('should have eTag property', () => {
            expect(record.eTag).toBe('b79ac2ef68c08fa9ac6013d53038a26c');
        });

        it('should have versionId property with empty default', () => {
            expect(record.versionId).toBe('');
        });

        it('should have sequencer property', () => {
            expect(record.sequencer).toBe('005BA40CB5BD42013A');
        });

        it('should have configurationId property', () => {
            expect(record.configurationId).toBe('exS3-v2--7cde234c7ff76c53c44990396aeddc6d');
        });

        it('should have requestId property', () => {
            expect(record.requestId).toBe('6B859DD0CE613FAE');
        });

        it('should have requester property', () => {
            expect(record.requester).toBeDefined();
        });

        it('should be able to set and get body', () => {
            const testBody = {test: 'data'};
            record.body = testBody;
            expect(record.body).toEqual(testBody);
        });

        it('should be able to set and get isValid', () => {
            record.isValid = false;
            expect(record.isValid).toBe(false);
            record.isValid = true;
            expect(record.isValid).toBe(true);
        });

        it('should handle missing optional fields with defaults', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            delete rawRecord.requestParameters;
            delete rawRecord.responseElements;
            delete rawRecord.userIdentity;
            delete rawRecord.s3.configurationId;
            delete rawRecord.s3.bucket.arn;
            delete rawRecord.s3.bucket.ownerIdentity;
            delete rawRecord.s3.object.size;
            delete rawRecord.s3.object.eTag;
            delete rawRecord.s3.object.sequencer;

            const testRecord = new Record(rawRecord);
            expect(testRecord.request.sourceIPAddress).toBe('');
            expect(testRecord.response['x-amz-request-id']).toBe('');
            expect(testRecord.response['x-amz-id-2']).toBe('');
            expect(testRecord.requester).toBe('');
            expect(testRecord.configurationId).toBe('');
            expect(testRecord.bucketARN).toBe('');
            expect(testRecord.bucket.arn).toBe('');
            expect(testRecord.bucket.ownerIdentity.principalId).toBe('');
            expect(testRecord.size).toBe(0);
            expect(testRecord.eTag).toBe('');
            expect(testRecord.sequencer).toBe('');
        });
    });
});
