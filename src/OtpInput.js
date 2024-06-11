import React, { useState } from 'react';
import './App.css';

const OtpInput = ({ length, onChangeOtp,handleKeyPressValidate }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value; 
    setOtp(newOtp);

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }

    onChangeOtp(newOtp.join(''));
  };



  const handleKeyDown = (element, index, event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      const newOtp = [...otp];
      if (element.value) {
        newOtp[index] = '';
        setOtp(newOtp);
        onChangeOtp(newOtp.join(''));
      } else if (element.previousSibling) {
        element.previousSibling.focus();
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChangeOtp(newOtp.join(''));
      }
    }
  };

  return (
    <div className="otp-container">
      {otp.map((data, index) => {
        return (
          <input
            className="otpinput"
            key={index}
            type="text"
            maxLength="1"
            value={data}
            onKeyPress={handleKeyPressValidate}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => handleKeyDown(e.target, index, e)}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
