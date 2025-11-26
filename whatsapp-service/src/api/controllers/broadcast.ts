import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import broadcastOps from '../../whatsapp/broadcast';
import logger from '../../utils/logger';

export const sendBroadcast = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { recipients, message } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            res.status(400).json({ error: 'recipients array is required' });
            return;
        }

        if (!message || (!message.text && !req.file)) {
            res.status(400).json({ error: 'message text or media file is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const broadcastMessage: any = {};
        if (message.text) {
            broadcastMessage.text = message.text;
        } else if (req.file) {
            if (message.type === 'image') {
                broadcastMessage.image = req.file.buffer;
            } else if (message.type === 'video') {
                broadcastMessage.video = req.file.buffer;
            }
            broadcastMessage.caption = message.caption;
        }

        const results = await broadcastOps.sendBroadcast(instance.socket, recipients, broadcastMessage);

        res.json({
            success: true,
            data: results,
            summary: {
                total: recipients.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send broadcast');
        res.status(500).json({ error: error.message });
    }
};

export const sendStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { text, caption, backgroundColor } = req.body;
        const file = req.file;

        if (!text && !file) {
            res.status(400).json({ error: 'text or media file is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const content: any = {};
        if (text) {
            content.text = text;
            content.backgroundColor = backgroundColor;
        } else if (file) {
            const { type } = req.body;
            if (type === 'image') {
                content.image = file.buffer;
            } else if (type === 'video') {
                content.video = file.buffer;
            }
            content.caption = caption;
        }

        const result = await broadcastOps.sendStatus(instance.socket, content);

        res.json({
            success: true,
            data: {
                messageId: result?.key?.id,
                timestamp: result?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send status');
        res.status(500).json({ error: error.message });
    }
};
