import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/messages', authenticateJWT, sendMessage);
router.get('/', authenticateJWT, getMessages);

export default router;
