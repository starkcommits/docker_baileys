import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import chatOps from '../../whatsapp/chats';
import logger from '../../utils/logger';

export const archiveChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, archive } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await chatOps.archiveChat(instance.socket, jid, archive !== false);

        res.json({ success: true, message: 'Chat archive status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to archive chat');
        res.status(500).json({ error: error.message });
    }
};

export const muteChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, duration } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        if (duration === 0) {
            await chatOps.unmuteChat(instance.socket, jid);
        } else {
            await chatOps.muteChat(instance.socket, jid, duration);
        }

        res.json({ success: true, message: 'Chat mute status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to mute chat');
        res.status(500).json({ error: error.message });
    }
};

export const markChatRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, read } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        if (read !== false) {
            await chatOps.markChatRead(instance.socket, jid);
        } else {
            await chatOps.markChatUnread(instance.socket, jid);
        }

        res.json({ success: true, message: 'Chat read status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to mark chat');
        res.status(500).json({ error: error.message });
    }
};

export const pinChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, pin } = req.body;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await chatOps.pinChat(instance.socket, jid, pin !== false);

        res.json({ success: true, message: 'Chat pin status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to pin chat');
        res.status(500).json({ error: error.message });
    }
};

export const deleteChat = async (req: Request, res: Response): Promise<void> => {
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

        await chatOps.deleteChat(instance.socket, jid);

        res.json({ success: true, message: 'Chat deleted' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to delete chat');
        res.status(500).json({ error: error.message });
    }
};

export const starMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, messageId, star } = req.body;

        if (!jid || !messageId) {
            res.status(400).json({ error: 'jid and messageId are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const messageKey = { id: messageId, fromMe: true };
        await chatOps.starMessage(instance.socket, jid, messageKey, star !== false);

        res.json({ success: true, message: 'Message star status updated' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to star message');
        res.status(500).json({ error: error.message });
    }
};

export const setDisappearing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, duration } = req.body;

        if (!jid || duration === undefined) {
            res.status(400).json({ error: 'jid and duration are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await chatOps.setDisappearingMessages(instance.socket, jid, duration);

        res.json({ success: true, message: 'Disappearing messages configured' });
    } catch (error: any) {
        logger.error({ error }, 'Failed to set disappearing messages');
        res.status(500).json({ error: error.message });
    }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { jid, limit } = req.query;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const messages = await chatOps.getChatHistory(
            instance.socket,
            jid as string,
            limit ? parseInt(limit as string) : 50
        );

        res.json({ success: true, data: messages });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get chat history');
        res.status(500).json({ error: error.message });
    }
};
