import { WASocket, downloadMediaMessage } from '@whiskeysockets/baileys';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

class MediaOperations {
    private mediaDir: string;

    constructor() {
        this.mediaDir = process.env.MEDIA_DIR || path.join(__dirname, '../../media');
        if (!fs.existsSync(this.mediaDir)) {
            fs.mkdirSync(this.mediaDir, { recursive: true });
        }
    }

    // Download media from a message
    async downloadMedia(message: any, filename?: string): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {}) as Buffer;

            // Generate filename if not provided
            const messageType = Object.keys(message.message || {})[0];
            const extension = this.getExtensionFromMimetype(message.message?.[messageType]?.mimetype || 'application/octet-stream');
            const finalFilename = filename || `media_${Date.now()}${extension}`;

            // Save to disk
            const filepath = path.join(this.mediaDir, finalFilename);
            fs.writeFileSync(filepath, buffer);

            logger.info({ filename: finalFilename, size: buffer.length }, 'Media downloaded');

            return {
                buffer,
                filename: finalFilename,
                mimetype: message.message?.[messageType]?.mimetype || 'application/octet-stream'
            };
        } catch (error) {
            logger.error({ error }, 'Failed to download media');
            throw error;
        }
    }

    // Generate thumbnail for image/video
    async generateThumbnail(mediaBuffer: Buffer, width: number = 200, height: number = 200): Promise<Buffer> {
        try {
            const thumbnail = await sharp(mediaBuffer)
                .resize(width, height, { fit: 'cover' })
                .jpeg({ quality: 70 })
                .toBuffer();

            logger.info({ width, height, size: thumbnail.length }, 'Thumbnail generated');
            return thumbnail;
        } catch (error) {
            logger.error({ error }, 'Failed to generate thumbnail');
            throw error;
        }
    }

    // Optimize image
    async optimizeImage(imageBuffer: Buffer, quality: number = 85): Promise<Buffer> {
        try {
            const optimized = await sharp(imageBuffer)
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality })
                .toBuffer();

            logger.info({ originalSize: imageBuffer.length, optimizedSize: optimized.length }, 'Image optimized');
            return optimized;
        } catch (error) {
            logger.error({ error }, 'Failed to optimize image');
            throw error;
        }
    }

    // Re-upload media to WhatsApp (useful for forwarding)
    async reuploadMedia(socket: WASocket, jid: string, mediaBuffer: Buffer, mediaType: 'image' | 'video' | 'audio' | 'document', options?: {
        caption?: string;
        filename?: string;
        mimetype?: string;
    }): Promise<any> {
        try {
            const messageContent: any = {};

            switch (mediaType) {
                case 'image':
                    messageContent.image = mediaBuffer;
                    if (options?.caption) messageContent.caption = options.caption;
                    break;
                case 'video':
                    messageContent.video = mediaBuffer;
                    if (options?.caption) messageContent.caption = options.caption;
                    break;
                case 'audio':
                    messageContent.audio = mediaBuffer;
                    messageContent.mimetype = options?.mimetype || 'audio/mp4';
                    break;
                case 'document':
                    messageContent.document = mediaBuffer;
                    messageContent.fileName = options?.filename || 'document';
                    messageContent.mimetype = options?.mimetype || 'application/octet-stream';
                    break;
            }

            const message = await socket.sendMessage(jid, messageContent);
            logger.info({ jid, mediaType }, 'Media re-uploaded');
            return message;
        } catch (error) {
            logger.error({ error, jid, mediaType }, 'Failed to re-upload media');
            throw error;
        }
    }

    // Get file from disk
    getMediaPath(filename: string): string {
        return path.join(this.mediaDir, filename);
    }

    // Delete media file
    deleteMedia(filename: string): void {
        try {
            const filepath = path.join(this.mediaDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                logger.info({ filename }, 'Media file deleted');
            }
        } catch (error) {
            logger.error({ error, filename }, 'Failed to delete media');
            throw error;
        }
    }

    // Helper: Get file extension from mimetype
    private getExtensionFromMimetype(mimetype: string): string {
        const mimeMap: { [key: string]: string } = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'video/mp4': '.mp4',
            'video/3gpp': '.3gp',
            'audio/mp4': '.m4a',
            'audio/ogg': '.ogg',
            'audio/mpeg': '.mp3',
            'application/pdf': '.pdf',
            'application/zip': '.zip',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        };

        return mimeMap[mimetype] || '.bin';
    }
}

export default new MediaOperations();
