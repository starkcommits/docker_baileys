import axios from 'axios';
import logger from './logger';

export interface WebhookEvent {
    instanceId: string;
    event: string;
    data: any;
    timestamp: Date;
}

export class WebhookManager {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    async sendEvent(event: WebhookEvent): Promise<void> {
        if (!this.webhookUrl) {
            logger.debug('No webhook URL configured, skipping event dispatch');
            return;
        }

        try {
            await axios.post(this.webhookUrl, event, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            logger.debug({ event: event.event, instanceId: event.instanceId }, 'Webhook event sent successfully');
        } catch (error) {
            logger.error({ error, event: event.event }, 'Failed to send webhook event');
        }
    }

    async sendMessageReceived(instanceId: string, message: any): Promise<void> {
        await this.sendEvent({
            instanceId,
            event: 'message.received',
            data: message,
            timestamp: new Date(),
        });
    }

    async sendMessageStatus(instanceId: string, status: any): Promise<void> {
        await this.sendEvent({
            instanceId,
            event: 'message.status',
            data: status,
            timestamp: new Date(),
        });
    }

    async sendConnectionUpdate(instanceId: string, update: any): Promise<void> {
        await this.sendEvent({
            instanceId,
            event: 'connection.update',
            data: update,
            timestamp: new Date(),
        });
    }
}

export default new WebhookManager(process.env.WEBHOOK_URL || '');
