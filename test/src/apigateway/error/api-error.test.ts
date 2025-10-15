import {describe, it, expect} from '@jest/globals';
import {ApiError} from '../../../../src/apigateway/error/api-error';

describe('Test Api Error: src/apigateway/error/api-error.ts', () => {
    it('should have these defaults', () => {
        const error = new ApiError();
        expect(error.code).toBe(500);
        expect(error.key).toBe('unknown');
        expect(error.message).toBe('something went wrong');
    });

    it('should be able to accept custom values', () => {
        const error = new ApiError(404, 'url', 'endpoint not found');
        expect(error.code).toBe(404);
        expect(error.key).toBe('url');
        expect(error.message).toBe('endpoint not found');
    });
});
