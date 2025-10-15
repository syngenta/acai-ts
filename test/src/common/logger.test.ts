import {describe, it, expect, beforeAll} from '@jest/globals';
import {Logger} from '../../../src/common/logger';

describe('Test Logger: src/common/logger.ts', () => {
    describe('test global logger', () => {
        it('should assign logger to global scope', () => {
            Logger.setUpGlobal();
            expect('logger' in global).toBe(true);
        });

        it('should allow me to call logger from global scope', () => {
            Logger.setUpGlobal();
            (global as any).logger.log('works');
            expect(true).toBe(true);
        });
    });

    describe('test top level methods', () => {
        const logger = new Logger();

        it('should allow me to call log without error', () => {
            logger.log('works');
            expect(true).toBe(true);
        });

        it('should allow me to call info without error', () => {
            logger.info('works');
            expect(true).toBe(true);
        });

        it('should allow me to call warn without error', () => {
            logger.warn('works');
            expect(true).toBe(true);
        });

        it('should allow me to call debug without error', () => {
            logger.debug('works');
            expect(true).toBe(true);
        });

        it('should allow me to call error without error', () => {
            logger.error('works');
            expect(true).toBe(true);
        });
    });

    describe('test logger.log ability to log anything', () => {
        beforeAll(() => {
            process.env['MIN_LOG_LEVEL'] = 'INFO';
        });

        it('should allow me to call log proper object', () => {
            const logger = new Logger();
            logger.log({level: 'INFO', log: 'works'});
            expect(true).toBe(true);
        });

        it('should allow me to call log improper object', () => {
            const logger = new Logger();
            logger.log({level: 'INFO', broken: 'works'});
            expect(true).toBe(true);
        });

        it('should allow me to call log string without error', () => {
            const logger = new Logger();
            logger.log('works');
            expect(true).toBe(true);
        });

        it('should allow me to call log multiple strings without error', () => {
            const logger = new Logger();
            logger.log('works', 'still works');
            expect(true).toBe(true);
        });
    });
});
