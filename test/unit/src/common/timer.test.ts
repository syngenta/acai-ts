import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Timer } from '../../../../src/common/timer';

describe('Timer', () => {
    let timer: Timer;

    beforeEach(() => {
        timer = new Timer();
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        timer.stop();
        jest.useRealTimers();
    });

    describe('start', () => {
        it('should start a timeout that resolves with "timeout" after specified milliseconds', async () => {
            const promise = timer.start(1000);
            
            // Fast-forward time
            jest.advanceTimersByTime(1000);
            
            const result = await promise;
            expect(result).toBe('timeout');
        });

        it('should handle immediate timeout (0ms)', async () => {
            const promise = timer.start(0);
            
            jest.advanceTimersByTime(0);
            
            const result = await promise;
            expect(result).toBe('timeout');
        });

        it('should handle long timeout', async () => {
            const promise = timer.start(5000);
            
            // Verify it doesn't resolve early
            jest.advanceTimersByTime(4999);
            let resolved = false;
            promise.then(() => { resolved = true; });
            
            await Promise.resolve(); // Let any pending promises resolve
            expect(resolved).toBe(false);
            
            // Now advance to completion
            jest.advanceTimersByTime(1);
            const result = await promise;
            expect(result).toBe('timeout');
        });

        it('should allow multiple timers to be started', async () => {
            const timer1 = new Timer();
            const timer2 = new Timer();
            
            const promise1 = timer1.start(100);
            const promise2 = timer2.start(200);
            
            jest.advanceTimersByTime(100);
            const result1 = await promise1;
            expect(result1).toBe('timeout');
            
            jest.advanceTimersByTime(100);
            const result2 = await promise2;
            expect(result2).toBe('timeout');
            
            timer1.stop();
            timer2.stop();
        });

        it('should handle starting a new timer while one is already running', async () => {
            // Start first timer
            timer.start(1000);
            
            // Start second timer (should replace the first)
            const promise2 = timer.start(500);
            
            // Advance time to complete second timer
            jest.advanceTimersByTime(500);
            const result2 = await promise2;
            expect(result2).toBe('timeout');
            
            // First timer should still be pending at this point
            // (this tests that multiple starts work correctly)
        });
    });

    describe('stop', () => {
        it('should stop a running timeout', () => {
            const promise = timer.start(1000);
            
            // Stop the timer before it completes
            timer.stop();
            
            // Advance time past when it would have completed
            jest.advanceTimersByTime(2000);
            
            // Promise should not resolve
            let resolved = false;
            promise.then(() => { resolved = true; });
            
            return Promise.resolve().then(() => {
                expect(resolved).toBe(false);
            });
        });

        it('should do nothing if no timer is running', () => {
            // This should not throw an error
            expect(() => timer.stop()).not.toThrow();
        });

        it('should handle multiple stop calls', () => {
            timer.start(1000);
            timer.stop();
            
            // Multiple stops should not cause issues
            expect(() => timer.stop()).not.toThrow();
            expect(() => timer.stop()).not.toThrow();
        });

        it('should properly clean up timer reference', () => {
            timer.start(1000);
            timer.stop();
            
            // Starting a new timer after stop should work
            const promise = timer.start(500);
            jest.advanceTimersByTime(500);
            
            return expect(promise).resolves.toBe('timeout');
        });
    });

    describe('integration scenarios', () => {
        it('should handle rapid start/stop cycles', () => {
            for (let i = 0; i < 10; i++) {
                timer.start(100);
                timer.stop();
            }
            
            // Should be able to start a final timer
            const promise = timer.start(200);
            jest.advanceTimersByTime(200);
            
            return expect(promise).resolves.toBe('timeout');
        });

        it('should handle timer completion followed by new timer', async () => {
            // Complete first timer
            const promise1 = timer.start(100);
            jest.advanceTimersByTime(100);
            await promise1;
            
            // Start and complete second timer
            const promise2 = timer.start(200);
            jest.advanceTimersByTime(200);
            const result2 = await promise2;
            
            expect(result2).toBe('timeout');
        });
    });
});