import { Request, Response } from 'express';
import connectionManager from '../../whatsapp/connection';
import groupOps from '../../whatsapp/groups';
import logger from '../../utils/logger';

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;
        const { subject, participants } = req.body;

        if (!subject || !participants || !Array.isArray(participants)) {
            res.status(400).json({ error: 'subject and participants array are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const group = await groupOps.createGroup(instance.socket, subject, participants);

        res.status(201).json({
            success: true,
            data: group,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to create group');
        res.status(500).json({ error: error.message });
    }
};

export const getGroupInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const metadata = await groupOps.getGroupMetadata(instance.socket, groupJid);

        res.json({
            success: true,
            data: metadata,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get group info');
        res.status(500).json({ error: error.message });
    }
};

export const updateGroupSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;
        const { subject } = req.body;

        if (!subject) {
            res.status(400).json({ error: 'subject is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await groupOps.updateGroupSubject(instance.socket, groupJid, subject);

        res.json({
            success: true,
            message: 'Group subject updated successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update group subject');
        res.status(500).json({ error: error.message });
    }
};

export const updateGroupDescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;
        const { description } = req.body;

        if (!description) {
            res.status(400).json({ error: 'description is required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await groupOps.updateGroupDescription(instance.socket, groupJid, description);

        res.json({
            success: true,
            message: 'Group description updated successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update group description');
        res.status(500).json({ error: error.message });
    }
};

export const updateParticipants = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;
        const { action, participants } = req.body;

        if (!action || !participants || !Array.isArray(participants)) {
            res.status(400).json({ error: 'action and participants array are required' });
            return;
        }

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        let result;
        switch (action) {
            case 'add':
                result = await groupOps.addParticipants(instance.socket, groupJid, participants);
                break;
            case 'remove':
                result = await groupOps.removeParticipants(instance.socket, groupJid, participants);
                break;
            case 'promote':
                result = await groupOps.promoteParticipants(instance.socket, groupJid, participants);
                break;
            case 'demote':
                result = await groupOps.demoteParticipants(instance.socket, groupJid, participants);
                break;
            default:
                res.status(400).json({ error: 'Invalid action. Use: add, remove, promote, or demote' });
                return;
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to update participants');
        res.status(500).json({ error: error.message });
    }
};

export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        await groupOps.leaveGroup(instance.socket, groupJid);

        res.json({
            success: true,
            message: 'Left group successfully',
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to leave group');
        res.status(500).json({ error: error.message });
    }
};

export const getInviteCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId, groupJid } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const code = await groupOps.getGroupInviteCode(instance.socket, groupJid);

        res.json({
            success: true,
            data: { inviteCode: code },
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get invite code');
        res.status(500).json({ error: error.message });
    }
};

export const listGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instanceId } = req.params;

        const instance = connectionManager.getInstance(instanceId);
        if (!instance || !instance.socket) {
            res.status(404).json({ error: 'Instance not found or not connected' });
            return;
        }

        const groups = await groupOps.getGroupsList(instance.socket);

        res.json({
            success: true,
            data: groups,
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to list groups');
        res.status(500).json({ error: error.message });
    }
};
