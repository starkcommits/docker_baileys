import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import profileOps from '../../whatsapp/profile';
import logger from '../../utils/logger';

export const updateProfileName = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await profileOps.updateProfileName(instance.socket, name);
        res.json({ success: true, message: 'Profile name updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update profile name');
        res.status(500).json({ error: error.message });
    }
};

export const updateProfileStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: 'status is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await profileOps.updateProfileStatus(instance.socket, status);
        res.json({ success: true, message: 'Profile status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update profile status');
        res.status(500).json({ error: error.message });
    }
};

export const updateProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'file is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await profileOps.updateProfilePicture(instance.socket, file.buffer);
        res.json({ success: true, message: 'Profile picture updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update profile picture');
        res.status(500).json({ error: error.message });
    }
};

export const getProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid } = req.query;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const url = await profileOps.getProfilePicture(instance.socket, jid as string);
        res.json({ success: true, data: { url } });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get profile picture');
        res.status(500).json({ error: error.message });
    }
};
