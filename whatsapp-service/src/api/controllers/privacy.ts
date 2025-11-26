import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import privacyOps from '../../whatsapp/privacy';
import logger from '../../utils/logger';

export const blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await privacyOps.blockUser(instance.socket, jid);
        res.json({ success: true, message: 'User blocked' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to block user');
        res.status(500).json({ error: error.message });
    }
};

export const unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await privacyOps.unblockUser(instance.socket, jid);
        res.json({ success: true, message: 'User unblocked' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to unblock user');
        res.status(500).json({ error: error.message });
    }
};

export const getBlockList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const blocklist = await privacyOps.getBlockList(instance.socket);
        res.json({ success: true, data: blocklist });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get block list');
        res.status(500).json({ error: error.message });
    }
};

export const updatePrivacySettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { setting, value } = req.body;

        if (!setting || !value) {
            res.status(400).json({ error: 'setting and value are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await privacyOps.updatePrivacySettings(instance.socket, setting, value);
        res.json({ success: true, message: 'Privacy settings updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update privacy settings');
        res.status(500).json({ error: error.message });
    }
};

export const getPrivacySettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const settings = await privacyOps.getPrivacySettings(instance.socket);
        res.json({ success: true, data: settings });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get privacy settings');
        res.status(500).json({ error: error.message });
    }
};
