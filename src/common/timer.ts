/**
 * Timer utility for implementing timeouts
 */

/**
 * Timer class for managing timeout operations
 */
export class Timer {
    private timerId: NodeJS.Timeout | null = null;

    /**
     * Start a timeout that resolves after the specified milliseconds
     * @param ms - Timeout duration in milliseconds
     * @returns Promise that resolves to 'timeout' after the specified time
     */
    start(ms: number): Promise<string> {
        return new Promise((resolve) => {
            this.timerId = setTimeout(resolve, ms, 'timeout');
        });
    }

    /**
     * Stop the current timeout if one is running
     */
    stop(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
}
