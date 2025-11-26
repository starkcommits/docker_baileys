import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class UtilityOperations {
    // Check if number exists on WhatsApp
    async checkNumberExists(socket: WASocket, number: string): Promise<{ exists: boolean; jid?: string }> {
        try {
            const results = await socket.onWhatsApp(number);

            if (results && results.length > 0 && results[0].exists) {
                logger.info({ number, jid: results[0].jid }, 'Number exists on WhatsApp');
                return { exists: true, jid: results[0].jid };
            }

            logger.info({ number }, 'Number does not exist on WhatsApp');
            return { exists: false };
        } catch (error) {
            logger.error({ error, number }, 'Failed to check number');
            throw error;
        }
    }

    // Validate JID format
    validateJID(jid: string): boolean {
        // Basic JID validation
        const individualPattern = /^\d+@s\.whatsapp\.net$/;
        const groupPattern = /^\d+-\d+@g\.us$/;
        const broadcastPattern = /^status@broadcast$/;

        return individualPattern.test(jid) || groupPattern.test(jid) || broadcastPattern.test(jid);
    }

    // Format phone number to JID
    formatToJID(phoneNumber: string): string {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Add country code if not present (assuming it starts with country code)
        return `${cleaned}@s.whatsapp.net`;
    }

    // Extract phone number from JID
    extractPhoneNumber(jid: string): string {
        return jid.split('@')[0];
    }

    // Reject incoming call
    async rejectCall(socket: WASocket, callId: string, callFrom: string): Promise<void> {
        try {
            await socket.rejectCall(callId, callFrom);
            logger.info({ callId, callFrom }, 'Call rejected');
        } catch (error) {
            logger.error({ error, callId }, 'Failed to reject call');
            throw error;
        }
    }

    // Get device info
    getDeviceInfo(socket: WASocket): any {
        return {
            user: socket.user,
            connected: socket.user !== undefined,
            platform: socket.type,
        };
    }

    // Get status updates
    async getStatusUpdates(_socket: WASocket): Promise<any[]> {
        try {
            // Note: Baileys may not have direct status fetch method
            // This is a placeholder - implement based on Baileys version
            logger.info('Status updates requested (implement based on Baileys API)');
            return [];
        } catch (error) {
            logger.error({ error }, 'Failed to get status updates');
            throw error;
        }
    }

    // Logout and clear session
    async logout(socket: WASocket): Promise<void> {
        try {
            await socket.logout();
            logger.info('Logged out successfully');
        } catch (error) {
            logger.error({ error }, 'Failed to logout');
            throw error;
        }
    }

    // Get connection state
    getConnectionState(socket: WASocket): string {
        return socket.user ? 'connected' : 'disconnected';
    }
}

export default new UtilityOperations();
