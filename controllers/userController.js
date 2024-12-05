import User from '../models/User.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude the password field
      .populate({
        path: 'groups',
        select: 'name members admins',
        populate: [
          { path: 'members', select: 'username profileImage' },
          { path: 'admins', select: 'username profileImage' }
        ]
      });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};



export const updateProfileImage = async (req, res) => {
  try {
    console.log("uploadFile")
    const { userId } = req.body; // Assuming userId is sent in request body
    const file = req.file;
console.log(req,"req")
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Define the path to save the cropped image
    const imageName = `${userId}-${Date.now()}.jpg`;
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagePath = path.join(__dirname, '..', 'uploads', 'profileImages', imageName);
    // Create uploads/profileImages folder if it doesn't exist
    if (!fs.existsSync(path.dirname(imagePath))) {
      fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    }
    // Process and save the image using sharp
    await sharp(file.buffer)
      .resize(200, 200) // Crop the image to 200x200 pixels
      .toFile(imagePath);

    // Update the user profile image path
    const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: imageName }, { new: true });

    res.json({ message: 'Profile image updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};