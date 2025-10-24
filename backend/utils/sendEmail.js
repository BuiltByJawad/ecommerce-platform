// config/nodemailer.js
import nodemailer from "nodemailer";
import { redis } from "../lib/redis.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: `${process.env.SMTP_HOST}`,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: `${process.env.SMTP_USER}`,
    pass: `${process.env.SMTP_PASSWORD}`,
  },
});

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email) => {
  const verificationCode = generateVerificationCode();

  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_EMAIL}`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    // console.log("Verification email sent:", email);
    await redis.del(email);
    await redis.set(email, verificationCode, "EX", 600);

    // Return the verification code for temporary storage
    return verificationCode;
  } catch (error) {
    console.log("this", error);
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_EMAIL}`,
      to: email,
      subject: "Reset your password",
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
