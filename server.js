import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import crypto from "crypto";
const app = express();
const port = 3001;
dotenv.config();
app.use(bodyParser.json());

const otps = {};
const generateOtpCode = () => {
    return  crypto.randomInt(100000, 999999).toString();
  };
  
  app.post('/generate-otp', (req, res) => {
    const { email } = req.body;
    const otp = generateOtpCode();
    const expiresIn = 1 * 60 * 1000; // OTP expires in 5 minutes
    const expirationTime = Date.now() + expiresIn;
  
    otps[email] = { otp, expirationTime };
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Error sending OTP');
      }
      res.send('OTP sent to your email');
    });
  });
  
  app.post('/validate-otp', (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otps[email];
  
    if (!storedOtp) {
      return res.status(400).send('OTP not found or expired');
    }
  
    if (storedOtp.expirationTime < Date.now()) {
      delete otps[email];
      return res.status(400).send('OTP expired');
    }
  
    if (storedOtp.otp !== otp) {
      return res.status(400).send('Invalid OTP');
    }
  
    delete otps[email];
    res.send('OTP validated successfully');
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });