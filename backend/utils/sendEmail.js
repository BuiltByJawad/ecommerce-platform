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

export const sendEmailSimple = async (to, subject, message) => {
  try {
    if (!to || !subject || !message) return;
    const mailOptions = {
      from: `${process.env.SMTP_FROM_EMAIL}`,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (_err) {
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

export const sendVendorStatusEmail = async (email, status) => {
  if (!email || !status) return;

  let subject = "Your vendor account status has changed";
  let message = "";
  const adminContactEmail = process.env.ADMIN_CONTACT_EMAIL || process.env.SMTP_FROM_EMAIL;

  switch (status) {
    case "approved":
      subject = "Your vendor account has been approved";
      message =
        "Congratulations! Your vendor account has been approved. You can now create and manage products and receive orders on the platform.";
      break;
    case "pending":
      subject = "Your vendor application is under review";
      message =
        "Your vendor application is currently under review. You will be able to list products once an administrator approves your account.";
      break;
    case "rejected":
      subject = "Your vendor application was rejected";
      message =
        "We are sorry to inform you that your vendor application was rejected. If you believe this is an error or need clarification, please contact support.";
      break;
    case "suspended":
      subject = "Your vendor account has been suspended";
      message =
        "Your vendor account has been suspended. You cannot list or manage products until this is resolved. Please contact support for more information.";
      break;
    default:
      message = `Your vendor account status is now: ${status}.`;
  }

  // Append admin contact information for follow-up queries
  if (adminContactEmail) {
    message += ` If you have any questions, please contact the platform administrator at ${adminContactEmail}.`;
  }

  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_EMAIL}`,
      to: email,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending vendor status email:", error);
    // Do not throw: status update should still succeed even if email fails
  }
};