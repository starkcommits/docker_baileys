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

/* ❌ Poll message temporarily disabled */
/*
export const sendPoll = async (req: Request, res: Response): Promise<void> => {
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
*/

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

export const sendReply = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, text, quotedMessageId } = req.body;

        if (!jid || !text || !quotedMessageId) {
            res.status(400).json({ error: 'jid, text, and quotedMessageId are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        // Get the quoted message (simplified - in production, retrieve from database)
        const quotedMessage = { key: { id: quotedMessageId, remoteJid: jid } };

        const message = await messageOps.sendReply(instance.socket, jid, text, quotedMessage);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send reply message');
        res.status(500).json({ error: error.message });
    }
};

export const sendMention = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, text, mentions } = req.body;

        if (!jid || !text || !mentions || !Array.isArray(mentions)) {
            res.status(400).json({ error: 'jid, text, and mentions (array) are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await messageOps.sendMention(instance.socket, jid, text, mentions);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send mention message');
        res.status(500).json({ error: error.message });
    }
};

export const forwardMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { toJid, messageId, fromJid } = req.body;

        if (!toJid || !messageId || !fromJid) {
            res.status(400).json({ error: 'toJid, messageId, and fromJid are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        // Get the message to forward (simplified - in production, retrieve from database)
        const messageToForward = { key: { id: messageId, remoteJid: fromJid } };

        const message = await messageOps.forwardMessage(instance.socket, toJid, messageToForward);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to forward message');
        res.status(500).json({ error: error.message });
    }
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, messageId, newText } = req.body;

        if (!jid || !messageId || !newText) {
            res.status(400).json({ error: 'jid, messageId, and newText are required' });
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

        const message = await messageOps.editMessage(instance.socket, jid, messageKey, newText);

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to edit message');
        res.status(500).json({ error: error.message });
    }
};

export const pinMessage = async (req: Request, res: Response): Promise<void> => {
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

        await messageOps.pinMessage(instance.socket, jid, messageKey, true);

        res.json({
            success: true,
            message: 'Message pinned successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to pin message');
        res.status(500).json({ error: error.message });
    }
};

export const unpinMessage = async (req: Request, res: Response): Promise<void> => {
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

        await messageOps.unpinMessage(instance.socket, jid, messageKey);

        res.json({
            success: true,
            message: 'Message unpinned successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to unpin message');
        res.status(500).json({ error: error.message });
    }
};

export const sendViewOnce = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, mediaType, caption } = req.body;
        const file = req.file;

        if (!jid || !mediaType || !file) {
            res.status(400).json({ error: 'jid, mediaType, and file are required' });
            return;
        }

        if (mediaType !== 'image' && mediaType !== 'video') {
            res.status(400).json({ error: 'mediaType must be "image" or "video"' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await messageOps.sendViewOnce(
            instance.socket,
            jid,
            mediaType,
            file.buffer,
            caption
        );

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send ViewOnce message');
        res.status(500).json({ error: error.message });
    }
};


// ❌ DEPRECATED: Button controllers below DO NOT WORK
// WhatsApp deprecated buttons - these will return errors
/*
export const sendButtons = async (req: Request, res: Response): Promise<void> => {
  res.status(410).json({
    error: 'Button messages are deprecated by WhatsApp. Use poll messages instead.',
    alternative: 'POST /api/instance/:id/send/poll'
  });
};

export const sendTemplateButtons = async (req: Request, res: Response): Promise<void> => {
  res.status(410).json({
    error: 'Template buttons are deprecated by WhatsApp. Use poll messages or text with links instead.',
    alternative: 'POST /api/instance/:id/send/poll'
  });
};

export const sendListMessage = async (req: Request, res: Response): Promise<void> => {
  res.status(410).json({
    error: 'List messages are deprecated by WhatsApp. Use poll messages instead.',
    alternative: 'POST /api/instance/:id/send/poll'
  });
};
*/

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

export const sendPoll = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, pollName, options, selectableCount } = req.body;

        if (!jid || !pollName || !options || !Array.isArray(options)) {
            res.status(400).json({ error: 'jid, pollName, and options (array) are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const message = await messageOps.sendPoll(
            instance.socket,
            jid,
            pollName,
            options,
            selectableCount || 1
        );

        res.json({
            success: true,
            data: {
                messageId: message?.key?.id,
                timestamp: message?.messageTimestamp,
            },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to send poll');
        res.status(500).json({ error: error.message });
    }
};


// ❌ DEPRECATED: These button functions DO NOT WORK
// WhatsApp deprecated buttons for WhatsApp Web libraries
// Keeping for backward compatibility but they will send plain text
