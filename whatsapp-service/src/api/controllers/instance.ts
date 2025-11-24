import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import logger from '../../utils/logger';
import db from '../../database/client';

export const createInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ error: 'Instance name is required' });
            return;
        }

        // Generate instance ID
        const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const instance = await connectionManager.createInstance(instanceId, name);

        res.status(201).json({
            success: true,
            data: {
                id: instance.id,
                name,
                status: instance.status,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to create instance');
        res.status(500).json({ error: error.message });
    }
};

export const getInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        const dbInstance = await db.getInstance(instanceId);

        res.json({
            success: true,
            data: {
                id: instance.id,
                name: dbInstance?.name,
                status: instance.status,
                phoneNumber: instance.phoneNumber,
                hasQrCode: !!instance.qrCode,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get instance');
        res.status(500).json({ error: error.message });
    }
};

export const getQRCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        if (!instance.qrCode) {
            res.status(404).json({ error: 'QR code not available. Instance may already be connected.' });
            return;
        }

        res.json({
            success: true,
            data: {
                qrCode: instance.qrCode,
                status: instance.status,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get QR code');
        res.status(500).json({ error: error.message });
    }
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: instance.id,
                status: instance.status,
                phoneNumber: instance.phoneNumber,
                connected: instance.status === 'connected',
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get status');
        res.status(500).json({ error: error.message });
    }
};

export const deleteInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        await connectionManager.deleteInstance(instanceId);

        res.json({
            success: true,
            message: 'Instance deleted successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to delete instance');
        res.status(500).json({ error: error.message });
    }
};

export const logoutInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        if (instance.socket) {
            await instance.socket.logout();
        }

        res.json({
            success: true,
            message: 'Instance logged out successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to logout instance');
        res.status(500).json({ error: error.message });
    }
};

export const listInstances = async (_req: Request, res: Response): Promise<void> => {
    try {
        const instances = connectionManager.getAllInstances();
        const dbInstances = await db.getAllInstances();

        const instancesData = instances.map((instance) => {
            const dbInstance = dbInstances.find((db) => db.id === instance.id);
            return {
                id: instance.id,
                name: dbInstance?.name,
                status: instance.status,
                phoneNumber: instance.phoneNumber,
            };
        });

        res.json({
            success: true,
            data: instancesData,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to list instances');
        res.status(500).json({ error: error.message });
    }
};
