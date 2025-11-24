import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger';
import db from './database/client';
import connectionManager from './whatsapp/connection';
import routes from './api/routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info({ method: req.method, path: req.path }, 'Incoming request');
    next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        service: 'WhatsApp Baileys Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            instances: '/api/instance',
            documentation: 'See README.md for full API documentation',
        },
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error({ error: err, path: req.path }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');

    try {
        // Close database connection
        await db.close();

        // Close all WhatsApp connections
        const instances = connectionManager.getAllInstances();
        for (const instance of instances) {
            if (instance.socket) {
                await instance.socket.logout();
            }
        }

        logger.info('Shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
    try {
        // Initialize database
        logger.info('Initializing database...');
        await db.initialize();

        // Load existing instances
        logger.info('Loading existing instances...');
        await connectionManager.loadExistingInstances();

        // Start HTTP server
        app.listen(PORT, () => {
            logger.info({ port: PORT }, 'WhatsApp Baileys Service started');
            logger.info(`API available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
