import { Router } from 'express';
import multer from 'multer';
import * as instanceController from './controllers/instance';
import * as messagesController from './controllers/messages';
import * as groupsController from './controllers/groups';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Instance routes
router.post('/instance/create', instanceController.createInstance);
router.get('/instance/list', instanceController.listInstances);
router.get('/instance/:instanceId', instanceController.getInstance);
router.get('/instance/:instanceId/qr', instanceController.getQRCode);
router.get('/instance/:instanceId/status', instanceController.getStatus);
router.delete('/instance/:instanceId', instanceController.deleteInstance);
router.post('/instance/:instanceId/logout', instanceController.logoutInstance);

// Message routes
router.post('/instance/:instanceId/send/text', messagesController.sendText);
router.post('/instance/:instanceId/send/media', upload.single('file'), messagesController.sendMedia);
router.post('/instance/:instanceId/send/location', messagesController.sendLocation);
router.post('/instance/:instanceId/send/reaction', messagesController.sendReaction);
router.post('/instance/:instanceId/send/reply', messagesController.sendReply);
router.post('/instance/:instanceId/send/mention', messagesController.sendMention);
router.post('/instance/:instanceId/message/forward', messagesController.forwardMessage);
router.put('/instance/:instanceId/message/edit', messagesController.editMessage);
router.post('/instance/:instanceId/message/pin', messagesController.pinMessage);
router.post('/instance/:instanceId/message/unpin', messagesController.unpinMessage);
router.post('/instance/:instanceId/send/viewonce', upload.single('file'), messagesController.sendViewOnce);
router.post('/instance/:instanceId/send/poll', messagesController.sendPoll);
router.get('/instance/:instanceId/messages', messagesController.getMessages);
router.delete('/instance/:instanceId/message', messagesController.deleteMessage);

// Group routes
router.post('/instance/:instanceId/group/create', groupsController.createGroup);
router.get('/instance/:instanceId/groups', groupsController.listGroups);
router.get('/instance/:instanceId/group/:groupJid', groupsController.getGroupInfo);
router.put('/instance/:instanceId/group/:groupJid/subject', groupsController.updateGroupSubject);
router.put('/instance/:instanceId/group/:groupJid/description', groupsController.updateGroupDescription);
router.put('/instance/:instanceId/group/:groupJid/participants', groupsController.updateParticipants);
router.post('/instance/:instanceId/group/:groupJid/leave', groupsController.leaveGroup);
router.get('/instance/:instanceId/group/:groupJid/invite', groupsController.getInviteCode);

// Media routes
import * as mediaController from './controllers/media';
router.get('/instance/:instanceId/media/:messageId/download', mediaController.downloadMedia);
router.post('/instance/:instanceId/media/thumbnail', upload.single('file'), mediaController.generateThumbnail);
router.post('/instance/:instanceId/media/optimize', upload.single('file'), mediaController.optimizeImage);

// Chat routes
import * as chatsController from './controllers/chats';
router.post('/instance/:instanceId/chat/archive', chatsController.archiveChat);
router.post('/instance/:instanceId/chat/mute', chatsController.muteChat);
router.post('/instance/:instanceId/chat/read', chatsController.markChatRead);
router.post('/instance/:instanceId/chat/pin', chatsController.pinChat);
router.delete('/instance/:instanceId/chat', chatsController.deleteChat);
router.post('/instance/:instanceId/chat/star', chatsController.starMessage);
router.post('/instance/:instanceId/chat/disappearing', chatsController.setDisappearing);
router.get('/instance/:instanceId/chat/history', chatsController.getChatHistory);

// Presence routes
import * as presenceController from './controllers/presence';
router.post('/instance/:instanceId/presence/update', presenceController.updatePresence);
router.post('/instance/:instanceId/presence/typing', presenceController.setTyping);
router.post('/instance/:instanceId/presence/online', presenceController.setOnline);

// Profile routes
import * as profileController from './controllers/profile';
router.put('/instance/:instanceId/profile/name', profileController.updateProfileName);
router.put('/instance/:instanceId/profile/status', profileController.updateProfileStatus);
router.put('/instance/:instanceId/profile/picture', upload.single('file'), profileController.updateProfilePicture);
router.get('/instance/:instanceId/profile/picture', profileController.getProfilePicture);

// Privacy routes
import * as privacyController from './controllers/privacy';
router.post('/instance/:instanceId/privacy/block', privacyController.blockUser);
router.post('/instance/:instanceId/privacy/unblock', privacyController.unblockUser);
router.get('/instance/:instanceId/privacy/blocklist', privacyController.getBlockList);
router.put('/instance/:instanceId/privacy/settings', privacyController.updatePrivacySettings);
router.get('/instance/:instanceId/privacy/settings', privacyController.getPrivacySettings);

// Broadcast routes
import * as broadcastController from './controllers/broadcast';
router.post('/instance/:instanceId/broadcast/send', upload.single('file'), broadcastController.sendBroadcast);
router.post('/instance/:instanceId/status/send', upload.single('file'), broadcastController.sendStatus);

// Utility routes
import * as utilsController from './controllers/utils';
router.get('/instance/:instanceId/utils/check-number', utilsController.checkNumber);
router.get('/instance/:instanceId/utils/validate-jid', utilsController.validateJID);
router.get('/instance/:instanceId/utils/format-number', utilsController.formatNumber);
router.get('/instance/:instanceId/utils/device-info', utilsController.getDeviceInfo);

export default router;
