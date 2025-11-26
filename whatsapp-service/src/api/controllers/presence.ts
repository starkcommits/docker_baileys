import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import presenceOps from '../../whatsapp/presence';
import logger from '../../utils/logger';

export const updatePresence = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, presence } = req.body;

        if (!jid || !presence) {
            res.status(400).json({ error: 'jid and presence are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await presenceOps.updatePresence(instance.socket, jid, presence);
        res.json({ success: true, message: 'Presence updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update presence');
        res.status(500).json({ error: error.message });
    }
};

export const setTyping = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, isTyping } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await presenceOps.setTyping(instance.socket, jid, isTyping !== false);
        res.json({ success: true, message: 'Typing status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to set typing');
        res.status(500).json({ error: error.message });
    }
};

export const setOnline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await presenceOps.setOnline(instance.socket);
        res.json({ success: true, message: 'Status set to online' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to set online');
        res.status(500).json({ error: error.message });
    }
};
