// src/components/ProfileImageUploader.js
import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import axios from 'axios';
import { Icon } from '@iconify/react/dist/iconify.js';
import CreateGroupModal from '../utils/CreateGroupModal';

const ProfileImageUploader = ({user,  onUpdate }) => {
  const [image, setImage] = useState(null);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };


  function openModal() {
    setIsOpen(!modalIsOpen);
  }

  const handleSave = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImage();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('profileImage', blob);
      formData.append('userId', user.id);

      try {
        const response = await axios.patch(`${process.env.REACT_APP_API_ENDPOINT}/users/profile-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onUpdate(response.data.user);
      } catch (error) {
        console.error('Failed to update profile image:', error);
      }
    }
  };

  return (
    <>
    <div className='flex justify-between'>
    <div className="profile-image-uploader">
      {image && (
        <div>
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={200}
            height={200}
            border={50}
            borderRadius={100} // Make it circular
            scale={scale}
            rotate={0}
          />
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleImageChange} />
    </div>
    <div className='cursor-pointer' onClick={openModal}>
    <Icon icon="bi:three-dots-vertical" />
    </div>
    </div>
    <CreateGroupModal isOpen ={modalIsOpen} toggle={openModal}/>
    </>
  );
};

export default ProfileImageUploader;
