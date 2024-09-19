// backend/routes/userRoutes.js
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { updateProfileImage,getUsers } from '../controllers/userController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getUsers);
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.patch('/profile-image', upload.single('profileImage'), updateProfileImage);

export default router;
