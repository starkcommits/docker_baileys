import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class PrivacyOperations {
    // Block user
    async blockUser(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.updateBlockStatus(jid, 'block');
            logger.info({ jid }, 'User blocked');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to block user');
            throw error;
        }
    }

    // Unblock user
    async unblockUser(socket: WASocket, jid: string): Promise<void> {
        try {
            await socket.updateBlockStatus(jid, 'unblock');
            logger.info({ jid }, 'User unblocked');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to unblock user');
            throw error;
        }
    }

    // Get block list
    async getBlockList(socket: WASocket): Promise<string[]> {
        try {
            const blocklist = await socket.fetchBlocklist();
            logger.info({ count: blocklist.length }, 'Block list fetched');
            return blocklist.filter((jid): jid is string => jid !== undefined);
        } catch (error) {
            logger.error({ error }, 'Failed to fetch block list');
            throw error;
        }
    }

    // Update privacy settings
    async updatePrivacySettings(
        _socket: WASocket,
        setting: 'last' | 'online' | 'profile' | 'status' | 'readreceipts' | 'groupadd',
        value: 'all' | 'contacts' | 'contact_blacklist' | 'none'
    ): Promise<void> {
        try {
            // Note: Baileys may not have direct updatePrivacySettings method
            // This is a placeholder - implement based on Baileys version
            logger.info({ setting, value }, 'Privacy settings update requested (implement based on Baileys API)');
        } catch (error) {
            logger.error({ error, setting, value }, 'Failed to update privacy settings');
            throw error;
        }
    }

    // Get privacy settings
    async getPrivacySettings(socket: WASocket): Promise<any> {
        try {
            const settings = await socket.fetchPrivacySettings();
            logger.info('Privacy settings fetched');
            return settings;
        } catch (error) {
            logger.error({ error }, 'Failed to fetch privacy settings');
            throw error;
        }
    }

    // Update last seen privacy
    async updateLastSeenPrivacy(socket: WASocket, value: 'all' | 'contacts' | 'none'): Promise<void> {
        await this.updatePrivacySettings(socket, 'last', value);
    }

    // Update online status privacy
    async updateOnlinePrivacy(socket: WASocket, value: 'all' | 'contacts' | 'none'): Promise<void> {
        await this.updatePrivacySettings(socket, 'online', value);
    }

    // Update profile photo privacy
    async updateProfilePhotoPrivacy(socket: WASocket, value: 'all' | 'contacts' | 'none'): Promise<void> {
        await this.updatePrivacySettings(socket, 'profile', value);
    }

    // Update status privacy
    async updateStatusPrivacy(socket: WASocket, value: 'all' | 'contacts' | 'contact_blacklist'): Promise<void> {
        await this.updatePrivacySettings(socket, 'status', value);
    }

    // Update group add privacy
    async updateGroupAddPrivacy(socket: WASocket, value: 'all' | 'contacts' | 'contact_blacklist'): Promise<void> {
        await this.updatePrivacySettings(socket, 'groupadd', value);
    }
}

export default new PrivacyOperations();
