import { Pool, PoolClient, QueryResult } from 'pg';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

class DatabaseClient {
    private pool: Pool;
    private initialized: boolean = false;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'whatsapp',
            user: process.env.DB_USER || 'whatsapp',
            password: process.env.DB_PASSWORD || 'whatsapp_password',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            logger.error({ error: err }, 'Unexpected database error');
        });
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // Test connection
            const client = await this.pool.connect();
            logger.info('Database connection established');
            client.release();

            // Run schema initialization
            await this.runSchema();
            this.initialized = true;
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error({ error }, 'Failed to initialize database');
            throw error;
        }
    }

    private async runSchema(): Promise<void> {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        try {
            await this.pool.query(schema);
            logger.info('Database schema created/updated');
        } catch (error) {
            logger.error({ error }, 'Failed to run database schema');
            throw error;
        }
    }

    async query(text: string, params?: any[]): Promise<QueryResult> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
            return result;
        } catch (error) {
            logger.error({ error, text }, 'Query error');
            throw error;
        }
    }

    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    async close(): Promise<void> {
        await this.pool.end();
        logger.info('Database connection pool closed');
    }

    // Instance operations
    async createInstance(id: string, name: string): Promise<void> {
        await this.query(
            'INSERT INTO instances (id, name, status) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2',
            [id, name, 'disconnected']
        );
    }

    async updateInstanceStatus(id: string, status: string, phoneNumber?: string): Promise<void> {
        if (phoneNumber) {
            await this.query(
                'UPDATE instances SET status = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                [status, phoneNumber, id]
            );
        } else {
            await this.query(
                'UPDATE instances SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [status, id]
            );
        }
    }

    async updateInstanceQR(id: string, qrCode: string): Promise<void> {
        await this.query(
            'UPDATE instances SET qr_code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [qrCode, id]
        );
    }

    async getInstance(id: string): Promise<any> {
        const result = await this.query('SELECT * FROM instances WHERE id = $1', [id]);
        return result.rows[0];
    }

    async getAllInstances(): Promise<any[]> {
        const result = await this.query('SELECT * FROM instances ORDER BY created_at DESC');
        return result.rows;
    }

    async deleteInstance(id: string): Promise<void> {
        await this.query('DELETE FROM instances WHERE id = $1', [id]);
    }

    // Auth state operations
    async saveAuthState(instanceId: string, creds: string, keys: string): Promise<void> {
        await this.query(
            `INSERT INTO auth_state (instance_id, creds, keys, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       ON CONFLICT (instance_id) 
       DO UPDATE SET creds = $2, keys = $3, updated_at = CURRENT_TIMESTAMP`,
            [instanceId, creds, keys]
        );
    }

    async getAuthState(instanceId: string): Promise<any> {
        const result = await this.query('SELECT * FROM auth_state WHERE instance_id = $1', [instanceId]);
        return result.rows[0];
    }

    async deleteAuthState(instanceId: string): Promise<void> {
        await this.query('DELETE FROM auth_state WHERE instance_id = $1', [instanceId]);
    }

    // Message operations
    async saveMessage(message: any): Promise<void> {
        await this.query(
            `INSERT INTO messages (instance_id, message_id, remote_jid, from_me, message_type, content, media_url, timestamp, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (instance_id, message_id) DO UPDATE SET status = $9`,
            [
                message.instanceId,
                message.messageId,
                message.remoteJid,
                message.fromMe,
                message.messageType,
                message.content,
                message.mediaUrl,
                message.timestamp,
                message.status,
            ]
        );
    }

    async getMessages(instanceId: string, remoteJid?: string, limit: number = 50): Promise<any[]> {
        if (remoteJid) {
            const result = await this.query(
                'SELECT * FROM messages WHERE instance_id = $1 AND remote_jid = $2 ORDER BY timestamp DESC LIMIT $3',
                [instanceId, remoteJid, limit]
            );
            return result.rows;
        } else {
            const result = await this.query(
                'SELECT * FROM messages WHERE instance_id = $1 ORDER BY timestamp DESC LIMIT $2',
                [instanceId, limit]
            );
            return result.rows;
        }
    }
}

export default new DatabaseClient();
