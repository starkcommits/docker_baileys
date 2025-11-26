import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import utilOps from '../../whatsapp/utils';
import logger from '../../utils/logger';

export const checkNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { number } = req.query;

        if (!number) {
            res.status(400).json({ error: 'number is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const result = await utilOps.checkNumberExists(instance.socket, number as string);
        res.json({ success: true, data: result });
    } catch (error: any) {
        logger.error({ error }, 'Failed to check number');
        res.status(500).json({ error: error.message });
    }
};

export const validateJID = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jid } = req.query;

        if (!jid) {
            res.status(400).json({ error: 'jid is required' });
            return;
        }

        const isValid = utilOps.validateJID(jid as string);
        res.json({ success: true, data: { jid, valid: isValid } });
    } catch (error: any) {
        logger.error({ error }, 'Failed to validate JID');
        res.status(500).json({ error: error.message });
    }
};

export const formatNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            res.status(400).json({ error: 'phoneNumber is required' });
            return;
        }

        const jid = utilOps.formatToJID(phoneNumber as string);
        res.json({ success: true, data: { phoneNumber, jid } });
    } catch (error: any) {
        logger.error({ error }, 'Failed to format number');
        res.status(500).json({ error: error.message });
    }
};

export const getDeviceInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const info = utilOps.getDeviceInfo(instance.socket);
        res.json({ success: true, data: info });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get device info');
        res.status(500).json({ error: error.message });
    }
};
