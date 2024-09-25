import express from 'express';
import { createGroup, manageMembers, manageAdmins, fetchGroups } from '../controllers/groupController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/groups', authenticateJWT, createGroup); // Create a new group
router.put('/groups/:groupId/members', authenticateJWT, manageMembers); // Manage group members
router.put('/groups/:groupId/admins', authenticateJWT, manageAdmins); // Manage admins
router.get('/groups', authenticateJWT, fetchGroups);

export default router;
