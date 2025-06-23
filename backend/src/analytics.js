/**
 * Analytics Service - Tracks game metrics
 * 
 * Features:
 * - Daily metrics reset at midnight
 * - Production-safe event tracking
 * - Supports hybrid transactions
 * 
 * Usage:
 * import { analyticsService } from './analytics'
 * analyticsService.trackPlayerActivity(address, action)
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const ANALYTICS_DB_URL = `${process.env.DB_URL}/analytics`;

// Initial metrics structure
const INITIAL_METRICS = {
    players: 0,
    workshops: 0,
    transactions: 0,
    gasSponsored: 0,
    revenue: 0,
    sponsoredTransactions: 0
};

export class AnalyticsService {
    constructor() {
        this.dailyMetrics = { ...INITIAL_METRICS };
    }

    trackSponsoredTransaction(gasAmount) {
        this.dailyMetrics.sponsoredTransactions += 1;
        this.dailyMetrics.gasSponsored += gasAmount;
    }

    async trackPlayerActivity(playerAddress, action, metadata = {}) {
        const event = {
            timestamp: new Date(),
            playerAddress,
            action,
            ...metadata
        };

        if (NODE_ENV === 'production') {
            await axios.post(`${ANALYTICS_DB_URL}/events`, event);
        }
        
        // Update daily metrics
        this.dailyMetrics.players += action === 'login' ? 1 : 0;
        this.dailyMetrics.workshops += action === 'create_workshop' ? 1 : 0;
        this.dailyMetrics.transactions += action === 'transaction' ? 1 : 0;
        
        return true;
    }

    trackGasSponsored(amount) {
        this.dailyMetrics.gasSponsored += amount;
    }

    trackRevenue(amount) {
        this.dailyMetrics.revenue += amount;
    }

    getDailyMetrics() {
        return {
            ...this.dailyMetrics,
            date: new Date().toISOString().split('T')[0]
        };
    }

    resetDailyMetrics() {
        // Reset using the initial metrics structure
        for (const key in INITIAL_METRICS) {
            this.dailyMetrics[key] = INITIAL_METRICS[key];
        }
    }
}

// Initialize and setup daily reset
export const analyticsService = new AnalyticsService();

// Reset metrics daily at midnight
setInterval(() => {
    analyticsService.resetDailyMetrics();
}, 24 * 60 * 60 * 1000);