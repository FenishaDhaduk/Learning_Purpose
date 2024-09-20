import express from 'express';
import { sendMessage, getMessages, editMessage } from '../controllers/messageController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/messages', authenticateJWT, sendMessage);
router.get('/', authenticateJWT, getMessages);
router.put('/messages/:messageId', authenticateJWT, editMessage);

export default router;
