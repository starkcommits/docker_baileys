import { WASocket, WAPresence } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class PresenceOperations {
    // Update presence (online, offline, typing, recording, etc.)
    async updatePresence(socket: WASocket, jid: string, presence: WAPresence): Promise<void> {
        try {
            await socket.sendPresenceUpdate(presence, jid);
            logger.info({ jid, presence }, 'Presence updated');
        } catch (error) {
            logger.error({ error, jid, presence }, 'Failed to update presence');
            throw error;
        }
    }

    // Subscribe to presence updates for a JID
    async subscribeToPresence(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.presenceSubscribe(jid);
            logger.info({ jid }, 'Subscribed to presence updates');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to subscribe to presence');
            throw error;
        }
    }

    // Set typing indicator
    async setTyping(socket: WASocket, jid: string, isTyping: boolean = true): Promise<void> {
        try {
            await socket.sendPresenceUpdate(isTyping ? 'composing' : 'paused', jid);
            logger.info({ jid, isTyping }, 'Typing status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to set typing');
            throw error;
        }
    }

    // Set recording indicator
    async setRecording(socket: WASocket, jid: string, isRecording: boolean = true): Promise<void> {
        try {
            await socket.sendPresenceUpdate(isRecording ? 'recording' : 'paused', jid);
            logger.info({ jid, isRecording }, 'Recording status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to set recording');
            throw error;
        }
    }

    // Set online status
    async setOnline(socket: WASocket): Promise<void> {
        try {
            await socket.sendPresenceUpdate('available');
            logger.info('Status set to online');
        } catch (error) {
            logger.error({ error }, 'Failed to set online');
            throw error;
        }
    }

    // Set offline/unavailable status
    async setOffline(socket: WASocket): Promise<void> {
        try {
            await socket.sendPresenceUpdate('unavailable');
            logger.info('Status set to offline');
        } catch (error) {
            logger.error({ error }, 'Failed to set offline');
            throw error;
        }
    }

    // Update read receipts setting (placeholder - Baileys API may vary)
    async updateReadReceipts(_socket: WASocket, enabled: boolean): Promise<void> {
        try {
            // Note: Baileys read receipts API may require different approach
            logger.info({ enabled }, 'Read receipts update requested (implement based on Baileys version)');
        } catch (error) {
            logger.error({ error }, 'Failed to update read receipts');
            throw error;
        }
    }
}

export default new PresenceOperations();
