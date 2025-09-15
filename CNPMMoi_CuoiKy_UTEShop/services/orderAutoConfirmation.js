const Order = require('../models/Order');

// Auto-confirmation job that runs every 5 minutes
class OrderAutoConfirmationJob {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.interval = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    // Start the auto-confirmation job
    start() {
        if (this.isRunning) {
            console.log('⚠️  Auto-confirmation job is already running');
            return;
        }

        console.log('🚀 Starting order auto-confirmation job...');
        this.isRunning = true;

        // Run immediately on start
        this.runAutoConfirmation();

        // Then run at intervals
        this.intervalId = setInterval(() => {
            this.runAutoConfirmation();
        }, this.interval);

        console.log(`✅ Auto-confirmation job started (runs every ${this.interval / 1000 / 60} minutes)`);
    }

    // Stop the auto-confirmation job
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Auto-confirmation job is not running');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('🛑 Auto-confirmation job stopped');
    }

    // Run the auto-confirmation process
    async runAutoConfirmation() {
        try {
            console.log('🔄 Running order auto-confirmation process...');
            
            const startTime = Date.now();
            const results = await Order.autoConfirmOrders();
            const endTime = Date.now();
            const duration = endTime - startTime;

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (results.length > 0) {
                console.log(`✅ Auto-confirmation completed in ${duration}ms:`);
                console.log(`   - Total processed: ${results.length}`);
                console.log(`   - Successful: ${successful}`);
                console.log(`   - Failed: ${failed}`);

                if (failed > 0) {
                    console.log('❌ Failed confirmations:');
                    results.filter(r => !r.success).forEach(result => {
                        console.log(`   - Order #${result.orderId}: ${result.error}`);
                    });
                }
            } else {
                console.log('ℹ️  No orders need auto-confirmation at this time');
            }

        } catch (error) {
            console.error('❌ Error in auto-confirmation job:', error);
        }
    }

    // Get job status
    getStatus() {
        return {
            isRunning: this.isRunning,
            interval: this.interval,
            intervalMinutes: this.interval / 1000 / 60,
            nextRunIn: this.isRunning ? this.interval : null
        };
    }

    // Change interval (must restart job for changes to take effect)
    setInterval(minutes) {
        const newInterval = minutes * 60 * 1000;
        
        if (newInterval < 60000) { // Minimum 1 minute
            throw new Error('Interval must be at least 1 minute');
        }

        this.interval = newInterval;
        console.log(`📅 Auto-confirmation interval changed to ${minutes} minutes`);

        if (this.isRunning) {
            console.log('🔄 Restarting job with new interval...');
            this.stop();
            this.start();
        }
    }
}

// Create singleton instance
const autoConfirmationJob = new OrderAutoConfirmationJob();

// Export the job instance and helper functions
module.exports = {
    autoConfirmationJob,
    
    // Helper function to start the job
    startAutoConfirmation: () => autoConfirmationJob.start(),
    
    // Helper function to stop the job
    stopAutoConfirmation: () => autoConfirmationJob.stop(),
    
    // Helper function to get job status
    getAutoConfirmationStatus: () => autoConfirmationJob.getStatus(),
    
    // Helper function to manually run confirmation
    runManualConfirmation: () => autoConfirmationJob.runAutoConfirmation(),
    
    // Helper function to change interval
    setConfirmationInterval: (minutes) => autoConfirmationJob.setInterval(minutes)
};