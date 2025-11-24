import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import messageOps from '../../whatsapp/messages';
import logger from '../../utils/logger';
import db from '../../database/client';

export const sendText = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, text } = req.body;

        if (!jid || !text) {
            res.status(400).json({ error: 'jid and text are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await messageOps.sendTextMessage(instance.socket, jid, text);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send text message');
        res.status(500).json({ error: error.message });
    }
};

export const sendMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, type, caption } = req.body;
        const file = req.file;

        if (!jid || !type || !file) {
            res.status(400).json({ error: 'jid, type, and file are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        let message;
        switch (type) {
            case 'image':
                message = await messageOps.sendImageMessage(instance.socket, jid, file.buffer, caption);
                break;
            case 'video':
                message = await messageOps.sendVideoMessage(instance.socket, jid, file.buffer, caption);
                break;
            case 'audio':
                message = await messageOps.sendAudioMessage(instance.socket, jid, file.buffer);
                break;
            case 'document':
                message = await messageOps.sendDocumentMessage(
                    instance.socket,
                    jid,
                    file.buffer,
                    file.originalname,
                    file.mimetype
                );
                break;
            default:
                res.status(400).json({ error: 'Invalid media type' });
                return;
        }

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send media message');
        res.status(500).json({ error: error.message });
    }
};

export const sendLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, latitude, longitude } = req.body;

        if (!jid || latitude === undefined || longitude === undefined) {
            res.status(400).json({ error: 'jid, latitude, and longitude are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await messageOps.sendLocationMessage(instance.socket, jid, latitude, longitude);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send location message');
        res.status(500).json({ error: error.message });
    }
};

export const sendReaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, messageId, emoji } = req.body;

        if (!jid || !messageId || !emoji) {
            res.status(400).json({ error: 'jid, messageId, and emoji are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const messageKey = {
            remoteJid: jid,
            id: messageId,
            fromMe: false,
        };

        await messageOps.reactToMessage(instance.socket, jid, messageKey, emoji);

        res.json({
            success: true,
            message: 'Reaction sent successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send reaction');
        res.status(500).json({ error: error.message });
    }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, limit } = req.query;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance) {
            res.status(404).json({ error: 'Instance not found' });
            return;
        }

        const messages = await db.getMessages(
            instanceId,
            jid as string | undefined,
            limit ? parseInt(limit as string) : 50
        );

        res.json({
            success: true,
            data: messages,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get messages');
        res.status(500).json({ error: error.message });
    }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, messageId } = req.body;

        if (!jid || !messageId) {
            res.status(400).json({ error: 'jid and messageId are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const messageKey = {
            remoteJid: jid,
            id: messageId,
            fromMe: true,
        };

        await messageOps.deleteMessage(instance.socket, messageKey);

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to delete message');
        res.status(500).json({ error: error.message });
    }
};
