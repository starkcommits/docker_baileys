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

export default router;
