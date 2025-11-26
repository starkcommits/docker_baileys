import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

/**
 * Rate limit store interface
 */
interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    max: number; // Max requests per window
    message?: string;
    statusCode?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

/**
 * In-memory rate limit store
 */
class RateLimitMemoryStore {
    private store: RateLimitStore = {};

    /**
     * Increment request count for a key
     */
    increment(key: string, windowMs: number): { count: number; resetTime: number } {
        const now = Date.now();
        const record = this.store[key];

        if (!record || now > record.resetTime) {
            // Create new record
            this.store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return this.store[key];
        }

        // Increment existing record
        record.count++;
        return record;
    }

    /**
     * Reset a key
     */
    reset(key: string): void {
        delete this.store[key];
    }

    /**
     * Clean up expired records
     */
    cleanup(): void {
        const now = Date.now();
        Object.keys(this.store).forEach(key => {
            if (now > this.store[key].resetTime) {
                delete this.store[key];
            }
        });
    }
}

// Global store instance
const globalStore = new RateLimitMemoryStore();

// Cleanup expired records every minute
setInterval(() => {
    globalStore.cleanup();
}, 60 * 1000);

/**
 * Rate limiting middleware
 */
export const rateLimit = (config: RateLimitConfig) => {
    const {
        windowMs,
        max,
        message = 'Too many requests, please try again later',
        statusCode = 429,
    } = config;

    return (req: Request, res: Response, next: NextFunction): void => {
        // Generate key based on IP and instance ID (if available)
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const instanceId = req.params.instanceId || 'global';
        const key = `${ip}:${instanceId}:${req.path}`;

        // Increment counter
        const record = globalStore.increment(key, windowMs);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

        // Check if limit exceeded
        if (record.count > max) {
            logger.warn({
                ip,
                instanceId,
                path: req.path,
                count: record.count,
                limit: max,
            }, 'Rate limit exceeded');

            res.status(statusCode).json({
                error: message,
                retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000),
                limit: max,
                current: record.count,
            });
            return;
        }

        next();
    };
};

/**
 * Per-instance rate limiter
 */
export const instanceRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute per instance
    message: 'Too many requests for this instance',
});

/**
 * Per-endpoint rate limiters
 */
export const sendMessageRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 messages per minute
    message: 'Too many messages sent, please slow down',
});

export const mediaUploadRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 media uploads per minute
    message: 'Too many media uploads, please slow down',
});

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts',
});

export default {
    rateLimit,
    instanceRateLimit,
    sendMessageRateLimit,
    mediaUploadRateLimit,
    authRateLimit,
};
