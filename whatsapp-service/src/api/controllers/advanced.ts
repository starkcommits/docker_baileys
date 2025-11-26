import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import advancedOps from '../../whatsapp/advanced';
import logger from '../../utils/logger';

export const sendLinkPreview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, text, url, title, description } = req.body;

        if (!jid || !text || !url) {
            res.status(400).json({ error: 'jid, text, and url are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await advancedOps.sendLinkPreview(
            instance.socket,
            jid,
            text,
            url,
            title,
            description
        );

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send link preview');
        res.status(500).json({ error: error.message });
    }
};

export const sendSticker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid } = req.body;
        const file = req.file;

        if (!jid || !file) {
            res.status(400).json({ error: 'jid and file are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await advancedOps.sendSticker(instance.socket, jid, file.buffer);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send sticker');
        res.status(500).json({ error: error.message });
    }
};

export const searchMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { query, jid, limit } = req.query;

        if (!query) {
            res.status(400).json({ error: 'query is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const messages = await advancedOps.searchMessages(
            instance.socket,
            query as string,
            jid as string,
            limit ? parseInt(limit as string) : 50
        );

        res.json({
            success: true,
            data: messages,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to search messages');
        res.status(500).json({ error: error.message });
    }
};

export const exportChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, format } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const exportData = await advancedOps.exportChatHistory(
            instance.socket,
            jid,
            format || 'json'
        );

        res.json({
            success: true,
            data: exportData,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to export chat');
        res.status(500).json({ error: error.message });
    }
};

export default {
    sendLinkPreview,
    sendSticker,
    searchMessages,
    exportChat,
};
