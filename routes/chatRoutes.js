import express from 'express';
import { fetchGroupMessages, fetchUserChats } from '../controllers/chatController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/chats', authenticateJWT, fetchUserChats);
router.get('/groupMessages/:groupId', authenticateJWT, fetchGroupMessages);

export default router;
