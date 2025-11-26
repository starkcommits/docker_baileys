import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import mediaOps from '../../whatsapp/media';
import logger from '../../utils/logger';

export const downloadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, messageId } = req.params;
        const { jid } = req.query;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        // In production, retrieve message from database
        const message = { key: { id: messageId, remoteJid: jid } };

        const result = await mediaOps.downloadMedia(message);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to download media');
        res.status(500).json({ error: error.message });
    }
};

export const generateThumbnail = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { width, height } = req.body;

        if (!file) {
            res.status(400).json({ error: 'File is required' });
            return;
        }

        const thumbnail = await mediaOps.generateThumbnail(
            file.buffer,
            width ? parseInt(width) : 200,
            height ? parseInt(height) : 200
        );

        res.set('Content-Type', 'image/jpeg');
        res.send(thumbnail);
    } catch (error: any) {
        logger.error({ error }, 'Failed to generate thumbnail');
        res.status(500).json({ error: error.message });
    }
};

export const optimizeImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { quality } = req.body;

        if (!file) {
            res.status(400).json({ error: 'File is required' });
            return;
        }

        const optimized = await mediaOps.optimizeImage(
            file.buffer,
            quality ? parseInt(quality) : 85
        );

        res.set('Content-Type', 'image/jpeg');
        res.send(optimized);
    } catch (error: any) {
        logger.error({ error }, 'Failed to optimize image');
        res.status(500).json({ error: error.message });
    }
};
