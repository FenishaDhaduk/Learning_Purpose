import React, { useState, useEffect } from 'react';
import OtpInput from './OtpInput';
import axios from 'axios';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const generateOtp = async () => {
    try {
      const response = await axios.post('http://localhost:3001/generate-otp', { email });
      setMessage(response.data);
      setTimer(60); // 1 minutes countdown
      startTimer();
    } catch (error) {
      setMessage('Error generating OTP');
    }
  };

  const startTimer = () => {
    const id = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(id);
          setMessage('OTP expired');
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const validateOtp = async () => {
    clearInterval(intervalId);
    try {
      const response = await axios.post('http://localhost:3001/validate-otp', { email, otp });
      setMessage(response.data);
    } catch (error) {
      setMessage('Invalid OTP');
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalId); 
  }, [intervalId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      generateOtp();
    }
  };

  const handleKeyPressValidate = (event) => {
    if (event.key === 'Enter') {
      validateOtp();
    }
  };


  return (
    <div className="App">
      <h1>OTP Authentication</h1>
      <div>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={generateOtp}>Generate OTP</button>
      </div>
      <OtpInput length={6} onChangeOtp={setOtp} handleKeyPressValidate={handleKeyPressValidate} />
      <button onClick={validateOtp}>Validate OTP</button>
      {message && <p>{message}</p>}
      {timer > 0 && <p>Time remaining: {formatTime(timer)}</p>}
    </div>
  );
}

export default App;
