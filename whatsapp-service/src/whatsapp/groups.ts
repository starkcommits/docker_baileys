import { WASocket } from '@whiskeysockets/baileys';
import logger from '../utils/logger';

export interface GroupParticipant {
    id: string;
    admin?: 'admin' | 'superadmin' | null;
}

class GroupOperations {
    async createGroup(socket: WASocket, subject: string, participants: string[]): Promise<any> {
        try {
            const group = await socket.groupCreate(subject, participants);
            logger.info({ groupId: group.id, subject }, 'Group created');
            return group;
        } catch (error) {
            logger.error({ error, subject }, 'Failed to create group');
            throw error;
        }
    }

    async getGroupMetadata(socket: WASocket, groupJid: string): Promise<any> {
        try {
            const metadata = await socket.groupMetadata(groupJid);
            logger.debug({ groupJid }, 'Group metadata retrieved');
            return metadata;
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to get group metadata');
            throw error;
        }
    }

    async updateGroupSubject(socket: WASocket, groupJid: string, subject: string): Promise<void> {
        try {
            await socket.groupUpdateSubject(groupJid, subject);
            logger.info({ groupJid, subject }, 'Group subject updated');
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to update group subject');
            throw error;
        }
    }

    async updateGroupDescription(socket: WASocket, groupJid: string, description: string): Promise<void> {
        try {
            await socket.groupUpdateDescription(groupJid, description);
            logger.info({ groupJid }, 'Group description updated');
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to update group description');
            throw error;
        }
    }

    async addParticipants(socket: WASocket, groupJid: string, participants: string[]): Promise<any> {
        try {
            const result = await socket.groupParticipantsUpdate(groupJid, participants, 'add');
            logger.info({ groupJid, participants }, 'Participants added to group');
            return result;
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to add participants');
            throw error;
        }
    }

    async removeParticipants(socket: WASocket, groupJid: string, participants: string[]): Promise<any> {
        try {
            const result = await socket.groupParticipantsUpdate(groupJid, participants, 'remove');
            logger.info({ groupJid, participants }, 'Participants removed from group');
            return result;
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to remove participants');
            throw error;
        }
    }

    async promoteParticipants(socket: WASocket, groupJid: string, participants: string[]): Promise<any> {
        try {
            const result = await socket.groupParticipantsUpdate(groupJid, participants, 'promote');
            logger.info({ groupJid, participants }, 'Participants promoted to admin');
            return result;
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to promote participants');
            throw error;
        }
    }

    async demoteParticipants(socket: WASocket, groupJid: string, participants: string[]): Promise<any> {
        try {
            const result = await socket.groupParticipantsUpdate(groupJid, participants, 'demote');
            logger.info({ groupJid, participants }, 'Participants demoted from admin');
            return result;
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to demote participants');
            throw error;
        }
    }

    async leaveGroup(socket: WASocket, groupJid: string): Promise<void> {
        try {
            await socket.groupLeave(groupJid);
            logger.info({ groupJid }, 'Left group');
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to leave group');
            throw error;
        }
    }

    async getGroupInviteCode(socket: WASocket, groupJid: string): Promise<string> {
        try {
            const code = await socket.groupInviteCode(groupJid);
            logger.info({ groupJid }, 'Group invite code retrieved');
            return code || '';
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to get group invite code');
            throw error;
        }
    }

    async revokeGroupInviteCode(socket: WASocket, groupJid: string): Promise<string> {
        try {
            const code = await socket.groupRevokeInvite(groupJid);
            logger.info({ groupJid }, 'Group invite code revoked');
            return code || '';
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to revoke group invite code');
            throw error;
        }
    }

    async acceptGroupInvite(socket: WASocket, inviteCode: string): Promise<string> {
        try {
            const groupJid = await socket.groupAcceptInvite(inviteCode);
            logger.info({ groupJid, inviteCode }, 'Group invite accepted');
            return groupJid || '';
        } catch (error) {
            logger.error({ error, inviteCode }, 'Failed to accept group invite');
            throw error;
        }
    }

    async updateGroupSettings(
        socket: WASocket,
        groupJid: string,
        setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
    ): Promise<void> {
        try {
            await socket.groupSettingUpdate(groupJid, setting);
            logger.info({ groupJid, setting }, 'Group settings updated');
        } catch (error) {
            logger.error({ error, groupJid }, 'Failed to update group settings');
            throw error;
        }
    }

    async getGroupsList(socket: WASocket): Promise<any[]> {
        try {
            const groups = await socket.groupFetchAllParticipating();
            const groupsList = Object.values(groups);
            logger.debug({ count: groupsList.length }, 'Groups list retrieved');
            return groupsList;
        } catch (error) {
            logger.error({ error }, 'Failed to get groups list');
            throw error;
        }
    }
}

export default new GroupOperations();
