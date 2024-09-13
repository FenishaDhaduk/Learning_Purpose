// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Chat from './components/Chat';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Register';
import GroupChat from './components/GroupChat';
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/group-chat" element={<GroupChat />}/>
      </Routes>
    </AuthProvider>
  );
};

export default App;
