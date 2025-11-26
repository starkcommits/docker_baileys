import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

/**
 * Standard error response interface
 */
export interface ErrorResponse {
    error: string;
    message?: string;
    details?: any;
    timestamp: string;
    path: string;
    statusCode: number;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;

    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const isOperational = isAppError ? err.isOperational : false;

    // Log error
    if (!isOperational || statusCode >= 500) {
        logger.error({
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            statusCode,
        }, 'Error occurred');
    } else {
        logger.warn({
            error: err.message,
            path: req.path,
            method: req.method,
            statusCode,
        }, 'Client error');
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
        error: isOperational ? err.message : 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.path,
        statusCode,
    };

    // Add details in development mode
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.message = err.message;
        if (isAppError && err.details) {
            errorResponse.details = err.details;
        }
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        path: req.path,
        statusCode: 404,
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
};
