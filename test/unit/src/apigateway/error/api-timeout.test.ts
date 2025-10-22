import {describe, it, expect} from '@jest/globals';
import {ApiTimeout} from '../../../../../src/apigateway/error/api-timeout';

describe('Test Api Timeout Error: src/apigateway/error/api-timeout.ts', () => {
    it('should have these defaults', () => {
        const error = new ApiTimeout();
        expect(error.code).toBe(408);
        expect(error.key).toBe('unknown');
        expect(error.message).toBe('request timeout');
    });

    it('should be able to accept custom values', () => {
        const error = new ApiTimeout('db', 'connection timeout');
        expect(error.code).toBe(408);
        expect(error.key).toBe('db');
        expect(error.message).toBe('connection timeout');
    });
});
