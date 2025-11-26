import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

class BroadcastOperations {
    // Send broadcast message to multiple recipients
    async sendBroadcast(
        socket: WASocket,
        recipients: string[],
        message: { text?: string; image?: Buffer; video?: Buffer; caption?: string }
    ): Promise<any[]> {
        try {
            const results = [];

            for (const jid of recipients) {
                try {
                    let sentMessage;

                    if (message.text) {
                        sentMessage = await socket.sendMessage(jid, { text: message.text });
                    } else if (message.image) {
                        sentMessage = await socket.sendMessage(jid, {
                            image: message.image,
                            caption: message.caption,
                        });
                    } else if (message.video) {
                        sentMessage = await socket.sendMessage(jid, {
                            video: message.video,
                            caption: message.caption,
                        });
                    }

                    results.push({ jid, success: true, messageId: sentMessage?.key?.id });
                } catch (error) {
                    results.push({ jid, success: false, error: (error as Error).message });
                }
            }

            logger.info({ recipientCount: recipients.length, successCount: results.filter(r => r.success).length }, 'Broadcast sent');
            return results;
        } catch (error) {
            logger.error({ error }, 'Failed to send broadcast');
            throw error;
        }
    }

    // Send status/story
    async sendStatus(
        socket: WASocket,
        content: { text?: string; image?: Buffer; video?: Buffer; caption?: string; backgroundColor?: string }
    ): Promise<any> {
        try {
            let message: any = {};

            if (content.text) {
                message = {
                    text: content.text,
                    backgroundColor: content.backgroundColor || '#000000',
                };
            } else if (content.image) {
                message = {
                    image: content.image,
                    caption: content.caption,
                };
            } else if (content.video) {
                message = {
                    video: content.video,
                    caption: content.caption,
                };
            }

            // Send to status broadcast JID
            const statusJid = 'status@broadcast';
            const sentMessage = await socket.sendMessage(statusJid, message);

            logger.info({ messageId: sentMessage?.key?.id }, 'Status posted');
            return sentMessage;
        } catch (error) {
            logger.error({ error }, 'Failed to send status');
            throw error;
        }
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
}

export default new BroadcastOperations();
