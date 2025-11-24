import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket,
    WAMessage,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import logger from '../utils/logger';
import db from '../database/client';
import webhookManager from '../utils/webhooks';
import path from 'path';
import fs from 'fs';

export interface WhatsAppInstance {
    id: string;
    socket: WASocket | null;
    qrCode: string | null;
    status: 'connecting' | 'connected' | 'disconnected' | 'qr';
    phoneNumber?: string;
}

class ConnectionManager {
    private instances: Map<string, WhatsAppInstance> = new Map();
    private authDir: string;

    constructor() {
        this.authDir = process.env.AUTH_DIR || path.join(__dirname, '../../auth_info');
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }
    }

    async createInstance(instanceId: string, name: string): Promise<WhatsAppInstance> {
        if (this.instances.has(instanceId)) {
            throw new Error(`Instance ${instanceId} already exists`);
        }

        // Create instance in database
        await db.createInstance(instanceId, name);

        const instance: WhatsAppInstance = {
            id: instanceId,
            socket: null,
            qrCode: null,
            status: 'disconnected',
        };

        this.instances.set(instanceId, instance);
        logger.info({ instanceId }, 'Instance created');

        // Start connection
        await this.connectInstance(instanceId);

        return instance;
    }

    async connectInstance(instanceId: string): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Instance ${instanceId} not found`);
        }

        if (instance.socket) {
            logger.warn({ instanceId }, 'Instance already has an active socket');
            return;
        }

        const instanceAuthDir = path.join(this.authDir, instanceId);
        if (!fs.existsSync(instanceAuthDir)) {
            fs.mkdirSync(instanceAuthDir, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(instanceAuthDir);
        const { version } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            logger: logger.child({ instanceId }),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            generateHighQualityLinkPreview: true,
            getMessage: async (_key) => {
                return {
                    conversation: 'Message not found',
                };
            },
            // Connection options for better stability
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            retryRequestDelayMs: 500,
            maxMsgRetryCount: 5,
            // Browser info
            browser: ['WhatsApp Baileys', 'Chrome', '120.0.0'],
        });

        instance.socket = socket;
        instance.status = 'connecting';
        await db.updateInstanceStatus(instanceId, 'connecting');

        // Handle connection updates
        socket.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(instanceId, update);
        });

        // Handle credentials update
        socket.ev.on('creds.update', saveCreds);

        // Handle messages
        socket.ev.on('messages.upsert', async ({ messages }) => {
            await this.handleMessages(instanceId, messages);
        });

        // Handle message updates (status changes)
        socket.ev.on('messages.update', async (updates) => {
            await this.handleMessageUpdates(instanceId, updates);
        });

        // Handle presence updates
        socket.ev.on('presence.update', async (update) => {
            logger.debug({ instanceId, update }, 'Presence update');
        });

        // Handle groups update
        socket.ev.on('groups.update', async (updates) => {
            logger.debug({ instanceId, updates }, 'Groups update');
        });

        logger.info({ instanceId }, 'Socket created and event handlers registered');
    }

    private async handleConnectionUpdate(instanceId: string, update: any): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate QR code
            try {
                const qrCodeDataUrl = await QRCode.toDataURL(qr);
                instance.qrCode = qrCodeDataUrl;
                instance.status = 'qr';
                await db.updateInstanceQR(instanceId, qrCodeDataUrl);
                await db.updateInstanceStatus(instanceId, 'qr');
                logger.info({ instanceId }, 'QR code generated');
            } catch (error) {
                logger.error({ error, instanceId }, 'Failed to generate QR code');
            }
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            logger.info({ instanceId, shouldReconnect, statusCode, error: lastDisconnect?.error?.message }, 'Connection closed');

            instance.status = 'disconnected';
            instance.socket = null;
            await db.updateInstanceStatus(instanceId, 'disconnected');

            if (shouldReconnect) {
                // Exponential backoff for reconnection
                const delay = statusCode === DisconnectReason.restartRequired ? 1000 : 5000;
                logger.info({ instanceId, delay }, 'Reconnecting...');
                setTimeout(() => this.connectInstance(instanceId), delay);
            } else {
                logger.info({ instanceId }, 'Logged out, not reconnecting');
                await this.deleteInstance(instanceId);
            }
        } else if (connection === 'open') {
            instance.status = 'connected';
            instance.qrCode = null;

            // Get phone number
            const phoneNumber = instance.socket?.user?.id?.split(':')[0];
            instance.phoneNumber = phoneNumber;

            await db.updateInstanceStatus(instanceId, 'connected', phoneNumber);
            logger.info({ instanceId, phoneNumber }, 'Connected to WhatsApp');

            // Send webhook
            await webhookManager.sendConnectionUpdate(instanceId, {
                status: 'connected',
                phoneNumber,
            });
        }
    }

    private async handleMessages(instanceId: string, messages: WAMessage[]): Promise<void> {
        for (const message of messages) {
            if (!message.message) continue;

            const messageData = this.extractMessageData(instanceId, message);

            // Save to database
            await db.saveMessage(messageData);

            // Send webhook for received messages (not sent by us)
            if (!messageData.fromMe) {
                await webhookManager.sendMessageReceived(instanceId, messageData);
            }

            logger.info({ instanceId, messageId: messageData.messageId }, 'Message processed');
        }
    }

    private extractMessageData(instanceId: string, message: WAMessage): any {
        const messageContent = message.message;
        let messageType = 'unknown';
        let content = '';
        let mediaUrl = null;

        if (messageContent?.conversation) {
            messageType = 'text';
            content = messageContent.conversation;
        } else if (messageContent?.extendedTextMessage) {
            messageType = 'text';
            content = messageContent.extendedTextMessage.text || '';
        } else if (messageContent?.imageMessage) {
            messageType = 'image';
            content = messageContent.imageMessage.caption || '';
        } else if (messageContent?.videoMessage) {
            messageType = 'video';
            content = messageContent.videoMessage.caption || '';
        } else if (messageContent?.audioMessage) {
            messageType = 'audio';
        } else if (messageContent?.documentMessage) {
            messageType = 'document';
            content = messageContent.documentMessage.fileName || '';
        }

        return {
            instanceId,
            messageId: message.key.id,
            remoteJid: message.key.remoteJid,
            fromMe: message.key.fromMe || false,
            messageType,
            content,
            mediaUrl,
            timestamp: message.messageTimestamp,
            status: 'received',
        };
    }

    private async handleMessageUpdates(instanceId: string, updates: any[]): Promise<void> {
        for (const update of updates) {
            logger.debug({ instanceId, update }, 'Message update');

            // Send webhook for status updates
            await webhookManager.sendMessageStatus(instanceId, update);
        }
    }

    async deleteInstance(instanceId: string): Promise<void> {
        const instance = this.instances.get(instanceId);
        if (instance?.socket) {
            await instance.socket.logout();
            instance.socket = null;
        }

        this.instances.delete(instanceId);
        await db.deleteInstance(instanceId);
        await db.deleteAuthState(instanceId);

        // Delete auth files
        const instanceAuthDir = path.join(this.authDir, instanceId);
        if (fs.existsSync(instanceAuthDir)) {
            fs.rmSync(instanceAuthDir, { recursive: true, force: true });
        }

        logger.info({ instanceId }, 'Instance deleted');
    }

    getInstance(instanceId: string): WhatsAppInstance | undefined {
        return this.instances.get(instanceId);
    }

    getAllInstances(): WhatsAppInstance[] {
        return Array.from(this.instances.values());
    }

    async loadExistingInstances(): Promise<void> {
        const dbInstances = await db.getAllInstances();

        for (const dbInstance of dbInstances) {
            if (dbInstance.status !== 'disconnected') {
                const instance: WhatsAppInstance = {
                    id: dbInstance.id,
                    socket: null,
                    qrCode: dbInstance.qr_code,
                    status: 'disconnected',
                    phoneNumber: dbInstance.phone_number,
                };

                this.instances.set(dbInstance.id, instance);

                // Try to reconnect
                try {
                    await this.connectInstance(dbInstance.id);
                } catch (error) {
                    logger.error({ error, instanceId: dbInstance.id }, 'Failed to reconnect instance');
                }
            }
        }

        logger.info({ count: dbInstances.length }, 'Loaded existing instances');
    }
}

export default new ConnectionManager();
