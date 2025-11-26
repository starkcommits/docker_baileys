import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class ChatOperations {
    // Archive chat
    async archiveChat(socket: WASocket, jid: string, archive: boolean = true): Promise<void> {
        try {
            await socket.chatModify({ archive, lastMessages: [] as any }, jid);
            logger.info({ jid, archive }, 'Chat archive status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to archive chat');
            throw error;
        }
    }

    // Mute chat
    async muteChat(socket: WASocket, jid: string, duration?: number): Promise<void> {
        try {
            // Duration in seconds, undefined = mute forever
            await socket.chatModify({ mute: duration ? Date.now() + (duration * 1000) : null }, jid);
            logger.info({ jid, duration }, 'Chat muted');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to mute chat');
            throw error;
        }
    }

    // Unmute chat
    async unmuteChat(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.chatModify({ mute: null }, jid);
            logger.info({ jid }, 'Chat unmuted');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to unmute chat');
            throw error;
        }
    }

    // Mark chat as read
    async markChatRead(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.chatModify({ markRead: true, lastMessages: [] as any }, jid);
            logger.info({ jid }, 'Chat marked as read');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to mark chat as read');
            throw error;
        }
    }

    // Mark chat as unread
    async markChatUnread(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.chatModify({ markRead: false, lastMessages: [] as any }, jid);
            logger.info({ jid }, 'Chat marked as unread');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to mark chat as unread');
            throw error;
        }
    }

    // Pin chat
    async pinChat(socket: WASocket, jid: string, pin: boolean = true): Promise<void> {
        try {
            await socket.chatModify({ pin }, jid);
            logger.info({ jid, pin }, 'Chat pin status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to pin chat');
            throw error;
        }
    }

    // Delete chat
    async deleteChat(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.chatModify({ delete: true, lastMessages: [] as any }, jid);
            logger.info({ jid }, 'Chat deleted');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to delete chat');
            throw error;
        }
    }

    // Star message
    async starMessage(socket: WASocket, jid: string, messageKey: any, star: boolean = true): Promise<void> {
        try {
            await socket.chatModify({ star: { messages: [{ id: messageKey.id, fromMe: messageKey.fromMe }], star } }, jid);
            logger.info({ jid, messageId: messageKey.id, star }, 'Message star status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to star message');
            throw error;
        }
    }

    // Set disappearing messages
    async setDisappearingMessages(socket: WASocket, jid: string, duration: number): Promise<void> {
        try {
            // Duration: 0 = off, 86400 = 24h, 604800 = 7d, 7776000 = 90d
            await socket.sendMessage(jid, {
                disappearingMessagesInChat: duration
            } as any);
            logger.info({ jid, duration }, 'Disappearing messages configured');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to set disappearing messages');
            throw error;
        }
    }

    // Get chat history
    async getChatHistory(_socket: WASocket, jid: string, limit: number = 50): Promise<any[]> {
        try {
            // Note: fetchMessagesFromWA may not be available in all Baileys versions
            // Alternative: retrieve from local database
            logger.info({ jid, limit }, 'Chat history requested (implement database retrieval)');
            return [];
        } catch (error) {
            logger.error({ error, jid }, 'Failed to fetch chat history');
            throw error;
        }
    }
}

export default new ChatOperations();
