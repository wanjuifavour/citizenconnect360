import { executeStoredProcedure } from '../config/sqlServer';

// Clear old cache entries periodically
export const setupScheduledTasks = () => {
    // Run cache cleanup every day
    setInterval(async () => {
        try {
            console.log('Running scheduled cache cleanup...');
            await executeStoredProcedure('CleanOldCache', { daysToKeep: 7 });
            console.log('Cache cleanup completed');
        } catch (error) {
            console.error('Error in scheduled cache cleanup:', error);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
};