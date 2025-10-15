import {describe, it, expect} from '@jest/globals';
import {Record} from '../../../src/dynamodb/record';
import * as mockData from '../../mocks/dynamodb/mock-data';

describe('Test DynamoDB Record Client: src/dynamodb/record.ts', () => {
    describe('test dynamoDB non-ttl stream', () => {
        const record = new Record(mockData.getData().Records[0]);

        it('should have property for rawRecord', () => {
            expect(record.rawRecord).toEqual(mockData.getData().Records[0]);
        });

        it('should have property for id', () => {
            expect(record.id).toBe('9a37c0d03eb60f7cf70cabc823de9907');
        });

        it('should have property for name', () => {
            expect(record.name).toBe('INSERT');
        });

        it('should have property for source', () => {
            expect(record.source).toEqual('aws:dynamodb');
        });

        it('should have property for keys', () => {
            expect(record.keys).toEqual({example_id: '123456789'});
        });

        it('should have property for old image', () => {
            expect(record.oldImage).toEqual({});
        });

        it('should have default property of true for is valid', () => {
            expect(record.isValid).toBe(true);
        });

        it('should have property for new image', () => {
            expect(record.newImage).toEqual({
                example_id: '123456789',
                note: 'Hosrawguw verrig zogupap ce so fajdis vub mos sif mawpowpug kif kihane.',
                active: true,
                personal: {gender: 'male', last_name: 'Mcneil', first_name: 'Mannix'},
                transportation: ['public-transit', 'car-access']
            });
        });

        it('should have property for body (which is new image)', () => {
            expect(record.body).toEqual({
                example_id: '123456789',
                note: 'Hosrawguw verrig zogupap ce so fajdis vub mos sif mawpowpug kif kihane.',
                active: true,
                personal: {gender: 'male', last_name: 'Mcneil', first_name: 'Mannix'},
                transportation: ['public-transit', 'car-access']
            });
        });

        it('should have property for sourceARN', () => {
            expect(record.sourceARN).toBe(
                'arn:aws:dynamodb:us-east-1:771875143460:table/test-example/stream/2019-10-04T23:18:26.340'
            );
        });

        it('should have property for version', () => {
            expect(record.version).toBe(mockData.getData().Records[0].eventVersion);
        });

        it('should have property for streamType', () => {
            expect(record.streamType).toBe(mockData.getData().Records[0].dynamodb!.StreamViewType);
        });

        it('should have property for size', () => {
            expect(record.size).toBe(mockData.getData().Records[0].dynamodb!.SizeBytes);
        });

        it('should have property for created', () => {
            expect(record.created).toBe(mockData.getData().Records[0].dynamodb!.ApproximateCreationDateTime);
        });

        it('should have property for identity as null', () => {
            expect(record.identity).toBeNull();
        });

        it('should have property for ttl as false', () => {
            expect(record.expired).toBe(false);
        });

        it('should have operation as create', () => {
            expect(record.operation).toBe('create');
        });

        it('should have operation as unknown', () => {
            const rawRecord = JSON.parse(JSON.stringify(mockData.getData().Records[0]));
            delete rawRecord.dynamodb.OldImage;
            delete rawRecord.dynamodb.NewImage;
            const testRecord = new Record(rawRecord);
            expect(testRecord.operation).toBe('unknown');
        });
    });

    describe('test dynamoDB ttl stream', () => {
        const record = new Record(mockData.getTTLData().Records[0]);

        it('should have property for identity as object', () => {
            expect(record.identity).toEqual(mockData.getTTLData().Records[0].userIdentity);
        });

        it('should have property for ttl as true', () => {
            expect(record.expired).toBe(true);
        });
    });

    describe('test dynamoDB update operation', () => {
        const record = new Record(mockData.getUpdateData().Records[0]);

        it('should have operation as update', () => {
            expect(record.operation).toBe('update');
        });
    });

    describe('test dynamoDB delete operation', () => {
        const record = new Record(mockData.getDeletedData().Records[0]);

        it('should have operation as delete', () => {
            expect(record.operation).toBe('delete');
        });
    });
});
