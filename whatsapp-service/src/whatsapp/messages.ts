import { WASocket, downloadMediaMessage } from '@whiskeysockets/baileys';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface SendMessageOptions {
    text?: string;
    media?: {
        type: 'image' | 'video' | 'audio' | 'document';
        buffer: Buffer;
        filename?: string;
        caption?: string;
        mimetype?: string;
    };
    location?: {
        latitude: number;
        longitude: number;
    };
    quoted?: any;
}

class MessageOperations {
    private mediaDir: string;

    constructor() {
        this.mediaDir = process.env.MEDIA_DIR || path.join(__dirname, '../../media');
        if (!fs.existsSync(this.mediaDir)) {
            fs.mkdirSync(this.mediaDir, { recursive: true });
        }
    }

    async sendTextMessage(socket: WASocket, jid: string, text: string, quoted?: any): Promise<any> {
        try {
            const message = await socket.sendMessage(jid, { text }, { quoted });
            logger.info({ jid, messageId: message?.key?.id }, 'Text message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send text message');
            throw error;
        }
    }

    async sendImageMessage(
        socket: WASocket,
        jid: string,
        imageBuffer: Buffer,
        caption?: string,
        quoted?: any
    ): Promise<any> {
        try {
            // Optimize image
            const optimizedImage = await sharp(imageBuffer)
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();

            const message = await socket.sendMessage(
                jid,
                {
                    image: optimizedImage,
                    caption,
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id }, 'Image message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send image message');
            throw error;
        }
    }

    async sendVideoMessage(
        socket: WASocket,
        jid: string,
        videoBuffer: Buffer,
        caption?: string,
        quoted?: any
    ): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                {
                    video: videoBuffer,
                    caption,
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id }, 'Video message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send video message');
            throw error;
        }
    }

    async sendAudioMessage(socket: WASocket, jid: string, audioBuffer: Buffer, quoted?: any): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                {
                    audio: audioBuffer,
                    mimetype: 'audio/mp4',
                    ptt: false, // Set to true for voice notes
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id }, 'Audio message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send audio message');
            throw error;
        }
    }

    async sendDocumentMessage(
        socket: WASocket,
        jid: string,
        documentBuffer: Buffer,
        filename: string,
        mimetype: string,
        quoted?: any
    ): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                {
                    document: documentBuffer,
                    fileName: filename,
                    mimetype,
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id, filename }, 'Document message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send document message');
            throw error;
        }
    }

    async sendLocationMessage(
        socket: WASocket,
        jid: string,
        latitude: number,
        longitude: number,
        quoted?: any
    ): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                {
                    location: {
                        degreesLatitude: latitude,
                        degreesLongitude: longitude,
                    },
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id }, 'Location message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send location message');
            throw error;
        }
    }

    async sendContactMessage(socket: WASocket, jid: string, contacts: any[], quoted?: any): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                {
                    contacts: {
                        displayName: contacts[0].displayName,
                        contacts,
                    },
                },
                { quoted }
            );

            logger.info({ jid, messageId: message?.key?.id }, 'Contact message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send contact message');
            throw error;
        }
    }

    async reactToMessage(socket: WASocket, jid: string, messageKey: any, emoji: string): Promise<any> {
        try {
            const message = await socket.sendMessage(jid, {
                react: {
                    text: emoji,
                    key: messageKey,
                },
            });

            logger.info({ jid, emoji }, 'Reaction sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send reaction');
            throw error;
        }
    }

    async sendReply(socket: WASocket, jid: string, text: string, quotedMessage: any): Promise<any> {
        try {
            const message = await socket.sendMessage(
                jid,
                { text },
                { quoted: quotedMessage }
            );
            logger.info({ jid, messageId: message?.key?.id }, 'Reply message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send reply');
            throw error;
        }
    }

    async sendMention(socket: WASocket, jid: string, text: string, mentions: string[]): Promise<any> {
        try {
            const message = await socket.sendMessage(jid, {
                text,
                mentions,
            });
            logger.info({ jid, mentions }, 'Mention message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send mention');
            throw error;
        }
    }

    async forwardMessage(socket: WASocket, jid: string, message: any): Promise<any> {
        try {
            const forwarded = await socket.sendMessage(jid, {
                forward: message,
            });

            logger.info({ jid }, 'Message forwarded');
            return forwarded;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to forward message');
            throw error;
        }
    }

    async editMessage(
        socket: WASocket,
        jid: string,
        messageKey: any,
        newText: string
    ): Promise<any> {
        try {
            const edited = await socket.sendMessage(jid, {
                text: newText,
                edit: messageKey,
            });
            logger.info({ jid, messageId: messageKey.id }, 'Message edited');
            return edited;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to edit message');
            throw error;
        }
    }

    async sendViewOnce(
        socket: WASocket,
        jid: string,
        mediaType: 'image' | 'video',
        mediaBuffer: Buffer,
        caption?: string
    ): Promise<any> {
        try {
            const messageContent: any = {
                caption,
                viewOnce: true,
            };

            if (mediaType === 'image') {
                messageContent.image = mediaBuffer;
            } else {
                messageContent.video = mediaBuffer;
            }

            const message = await socket.sendMessage(jid, messageContent);
            logger.info({ jid, mediaType }, 'ViewOnce message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send ViewOnce message');
            throw error;
        }
    }

    async sendPoll(
        socket: WASocket,
        jid: string,
        name: string,
        options: string[],
        selectableCount: number = 1
    ): Promise<any> {
        try {
            const message = await socket.sendMessage(jid, {
                poll: {
                    name,
                    values: options,
                    selectableCount,
                },
            });
            logger.info({ jid, pollName: name }, 'Poll message sent');
            return message;
        } catch (error) {
            logger.error({ error, jid }, 'Failed to send poll');
            throw error;
        }
    }

    async pinMessage(socket: WASocket, jid: string, messageKey: any, pin: boolean = true): Promise<void> {
        try {
            // Note: Message pinning may not be fully supported in all Baileys versions
            // This uses chat-level pinning as a workaround
            await socket.chatModify({ pin }, jid);
            logger.info({ jid, messageId: messageKey.id, pin }, 'Message pin status updated');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to update pin status');
            throw error;
        }
    }

    async unpinMessage(socket: WASocket, jid: string, messageKey: any): Promise<void> {
        try {
            await this.pinMessage(socket, jid, messageKey, false);
            logger.info({ jid, messageId: messageKey.id }, 'Message unpinned');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to unpin message');
            throw error;
        }
    }

    async downloadMedia(message: any, filename: string): Promise<string> {
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const filepath = path.join(this.mediaDir, filename);
            fs.writeFileSync(filepath, buffer as Buffer);

            logger.info({ filename }, 'Media downloaded');
            return filepath;
        } catch (error) {
            logger.error({ error, filename }, 'Failed to download media');
            throw error;
        }
    }

    async markAsRead(socket: WASocket, jid: string, messageKey: any): Promise<void> {
        try {
            await socket.readMessages([messageKey]);
            logger.debug({ jid }, 'Message marked as read');
        } catch (error) {
            logger.error({ error, jid }, 'Failed to mark message as read');
            throw error;
        }
    }

    async deleteMessage(socket: WASocket, messageKey: any): Promise<void> {
        try {
            await socket.sendMessage(messageKey.remoteJid!, {
                delete: messageKey,
            });
            logger.info({ messageId: messageKey.id }, 'Message deleted');
        } catch (error) {
            logger.error({ error }, 'Failed to delete message');
            throw error;
        }
    }
}

export default new MessageOperations();
