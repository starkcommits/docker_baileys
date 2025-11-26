import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 */
export interface AppConfig {
    // Server
    port: number;
    nodeEnv: string;

    // Database
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };

    // WhatsApp
    whatsapp: {
        authDir: string;
        mediaDir: string;
        maxInstances: number;
    };

    // Rate Limiting
    rateLimit: {
        enabled: boolean;
        windowMs: number;
        maxRequests: number;
        maxMessagesPerMinute: number;
        maxMediaPerMinute: number;
    };

    // File Upload
    fileUpload: {
        maxSize: number; // in bytes
        allowedImageTypes: string[];
        allowedVideoTypes: string[];
        allowedAudioTypes: string[];
        allowedDocumentTypes: string[];
    };

    // Webhook
    webhook: {
        enabled: boolean;
        url?: string;
        secret?: string;
        retryAttempts: number;
        retryDelay: number;
    };

    // Logging
    logging: {
        level: string;
        pretty: boolean;
    };
}

/**
 * Validate and parse environment variables
 */
function loadConfig(): AppConfig {
    return {
        // Server
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',

        // Database
        database: {
            host: process.env.DB_HOST || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USER || 'whatsapp',
            password: process.env.DB_PASSWORD || 'whatsapp',
            database: process.env.DB_NAME || 'whatsapp',
        },

        // WhatsApp
        whatsapp: {
            authDir: process.env.AUTH_DIR || path.join(__dirname, '../../auth_info'),
            mediaDir: process.env.MEDIA_DIR || path.join(__dirname, '../../media'),
            maxInstances: parseInt(process.env.MAX_INSTANCES || '10', 10),
        },

        // Rate Limiting
        rateLimit: {
            enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10),
            maxMessagesPerMinute: parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '30', 10),
            maxMediaPerMinute: parseInt(process.env.RATE_LIMIT_MAX_MEDIA || '10', 10),
        },

        // File Upload
        fileUpload: {
            maxSize: parseInt(process.env.MAX_FILE_SIZE || '16777216', 10), // 16MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'],
            allowedAudioTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'],
            allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        },

        // Webhook
        webhook: {
            enabled: process.env.WEBHOOK_ENABLED === 'true',
            url: process.env.WEBHOOK_URL,
            secret: process.env.WEBHOOK_SECRET,
            retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10),
            retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000', 10),
        },

        // Logging
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            pretty: process.env.LOG_PRETTY === 'true',
        },
    };
}

// Export singleton config instance
const config = loadConfig();

export default config;
