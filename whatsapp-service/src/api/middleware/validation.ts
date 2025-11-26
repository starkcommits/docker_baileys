import { Request, Response, NextFunction } from 'express';

// JID validation patterns
const JID_PATTERNS = {
    individual: /^\d+@s\.whatsapp\.net$/,
    group: /^\d+-\d+@g\.us$/,
    broadcast: /^status@broadcast$/,
};

// Phone number validation (E.164 format)
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

/**
 * Validate JID format
 */
export const validateJID = (jid: string): boolean => {
    return Object.values(JID_PATTERNS).some(pattern => pattern.test(jid));
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
    return PHONE_PATTERN.test(phone);
};

/**
 * Middleware to validate required fields in request body
 */
export const validateRequiredFields = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missing = fields.filter(field => !req.body[field]);

        if (missing.length > 0) {
            res.status(400).json({
                error: 'Missing required fields',
                missing,
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to validate JID in request body
 */
export const validateJIDField = (fieldName: string = 'jid') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const jid = req.body[fieldName];

        if (!jid) {
            res.status(400).json({
                error: `${fieldName} is required`,
            });
            return;
        }

        if (!validateJID(jid)) {
            res.status(400).json({
                error: `Invalid ${fieldName} format`,
                hint: 'JID must be in format: number@s.whatsapp.net (individual), number-number@g.us (group), or status@broadcast',
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to validate phone number in request body
 */
export const validatePhoneField = (fieldName: string = 'phone') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const phone = req.body[fieldName];

        if (!phone) {
            res.status(400).json({
                error: `${fieldName} is required`,
            });
            return;
        }

        if (!validatePhoneNumber(phone)) {
            res.status(400).json({
                error: `Invalid ${fieldName} format`,
                hint: 'Phone number must be in E.164 format (e.g., +1234567890)',
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to validate file upload
 */
export const validateFileUpload = (options: {
    required?: boolean;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
} = {}) => {
    const {
        required = true,
        maxSize = 16 * 1024 * 1024, // 16MB default
        allowedTypes = [],
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        const file = req.file;

        if (!file && required) {
            res.status(400).json({
                error: 'File is required',
            });
            return;
        }

        if (file) {
            // Check file size
            if (file.size > maxSize) {
                res.status(400).json({
                    error: 'File too large',
                    maxSize: `${maxSize / (1024 * 1024)}MB`,
                    actualSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                });
                return;
            }

            // Check file type
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
                res.status(400).json({
                    error: 'Invalid file type',
                    allowedTypes,
                    actualType: file.mimetype,
                });
                return;
            }
        }

        next();
    };
};

/**
 * Middleware to validate array field
 */
export const validateArrayField = (fieldName: string, options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
} = {}) => {
    const {
        required = true,
        minLength = 1,
        maxLength = 100,
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];

        if (!value && required) {
            res.status(400).json({
                error: `${fieldName} is required`,
            });
            return;
        }

        if (value) {
            if (!Array.isArray(value)) {
                res.status(400).json({
                    error: `${fieldName} must be an array`,
                });
                return;
            }

            if (value.length < minLength) {
                res.status(400).json({
                    error: `${fieldName} must have at least ${minLength} item(s)`,
                });
                return;
            }

            if (value.length > maxLength) {
                res.status(400).json({
                    error: `${fieldName} must have at most ${maxLength} item(s)`,
                });
                return;
            }
        }

        next();
    };
};

/**
 * Middleware to validate instance exists
 */
export const validateInstance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { instanceId } = req.params;

    if (!instanceId) {
        res.status(400).json({
            error: 'instanceId is required',
        });
        return;
    }

    // Instance validation is done in controllers
    // This middleware just ensures the parameter exists
    next();
};

export default {
    validateJID,
    validatePhoneNumber,
    validateRequiredFields,
    validateJIDField,
    validatePhoneField,
    validateFileUpload,
    validateArrayField,
    validateInstance,
};
