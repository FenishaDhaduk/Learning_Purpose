import express from 'express';
import { createGroup, manageMembers, manageAdmins } from '../controllers/groupController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/groups', authenticateJWT, createGroup);
router.put('/groups/:groupId/members', authenticateJWT, manageMembers);
router.put('/groups/:groupId/admins', authenticateJWT, manageAdmins);

export default router;
