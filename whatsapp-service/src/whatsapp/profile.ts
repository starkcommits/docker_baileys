import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class ProfileOperations {
    // Update profile name
    async updateProfileName(socket: WASocket, name: string): Promise<void> {
        try {
            await socket.updateProfileName(name);
            logger.info({ name }, 'Profile name updated');
        } catch (error) {
            logger.error({ error }, 'Failed to update profile name');
            throw error;
        }
    }

    // Update profile status/about
    async updateProfileStatus(socket: WASocket, status: string): Promise<void> {
        try {
            await socket.updateProfileStatus(status);
            logger.info({ status }, 'Profile status updated');
        } catch (error) {
            logger.error({ error }, 'Failed to update profile status');
            throw error;
        }
    }

    // Update profile picture
    async updateProfilePicture(socket: WASocket, imageBuffer: Buffer): Promise<void> {
        try {
            const jid = socket.user?.id;
            if (!jid) {
                throw new Error('User JID not available');
            }

            await socket.updateProfilePicture(jid, imageBuffer);
            logger.info('Profile picture updated');
        } catch (error) {
            logger.error({ error }, 'Failed to update profile picture');
            throw error;
        }
    }

    // Remove profile picture
    async removeProfilePicture(socket: WASocket): Promise<void> {
        try {
            const jid = socket.user?.id;
            if (!jid) {
                throw new Error('User JID not available');
            }

            await socket.removeProfilePicture(jid);
            logger.info('Profile picture removed');
        } catch (error) {
            logger.error({ error }, 'Failed to remove profile picture');
            throw error;
        }
    }

    // Get profile picture URL
    async getProfilePicture(socket: WASocket, jid: string): Promise<string | undefined> {
        try {
            const url = await socket.profilePictureUrl(jid, 'image');
            logger.info({ jid, url }, 'Profile picture URL fetched');
            return url;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to get profile picture');
            throw error;
        }
    }

    // Get business profile
    async getBusinessProfile(socket: WASocket, jid: string): Promise<any> {
        try {
            const profile = await socket.getBusinessProfile(jid);
            logger.info({ jid }, 'Business profile fetched');
            return profile;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to get business profile');
            throw error;
        }
    }

    // Fetch status/about of a user
    async fetchStatus(socket: WASocket, jid: string): Promise<any> {
        try {
            const status = await socket.fetchStatus(jid);
            logger.info({ jid }, 'Status fetched');
            return status;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to fetch status');
            throw error;
        }
    }
}

export default new ProfileOperations();
