import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from '../config/logger.js';


const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} [html]
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html = null) => {
  const msg = { from: config.email.from, to, subject, text };
  if (html) {
    msg.html = html;
  }
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send OTP email
 * @param {string} to
 * @param {string} otp
 * @param {string} name
 * @returns {Promise}
 */
const sendEmailOtp = async (to, otp, name = 'User') => {
  const subject = 'Your Verification OTP - Zuhaush';
  const text = `Dear ${name},

Your One-Time Password (OTP) is: ${otp}

This OTP is valid for 10 minutes. Please do not share this OTP with anyone.

If you didn't request this OTP, please ignore this email.

Best regards,
Zuhaush Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Zuhaush</h1>
        <p style="color: #7f8c8d; margin: 5px 0 0 0;">Real Estate Platform</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #2c3e50; margin: 0 0 20px 0;">Your Verification OTP</h2>
        <p style="color: #34495e; margin: 0 0 20px 0;">Dear ${name},</p>
        <p style="color: #34495e; margin: 0 0 20px 0;">Your One-Time Password (OTP) is:</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="color: #e74c3c; font-weight: bold; margin: 20px 0 0 0;">This OTP is valid for 10 minutes.</p>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px;">Please do not share this OTP with anyone.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #ecf0f1; border-radius: 8px;">
        <p style="color: #7f8c8d; margin: 0; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px;">Best regards,<br>Zuhaush Team</p>
      </div>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};

/**
 * Send password reset OTP email
 * @param {string} to
 * @param {string} otp
 * @param {string} name
 * @returns {Promise}
 */
const sendPasswordResetOtp = async (to, otp, name = 'User') => {
  const subject = 'Password Reset OTP - Zuhaush';
  const text = `Dear ${name},

Your password reset OTP is: ${otp}

This OTP is valid for 10 minutes. Please do not share this OTP with anyone.

If you didn't request a password reset, please ignore this email.

Best regards,
Zuhaush Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Zuhaush</h1>
        <p style="color: #7f8c8d; margin: 5px 0 0 0;">Real Estate Platform</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #e74c3c; margin: 0 0 20px 0;">Password Reset Request</h2>
        <p style="color: #34495e; margin: 0 0 20px 0;">Dear ${name},</p>
        <p style="color: #34495e; margin: 0 0 20px 0;">Your password reset OTP is:</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="color: #e74c3c; font-weight: bold; margin: 20px 0 0 0;">This OTP is valid for 10 minutes.</p>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px;">Please do not share this OTP with anyone.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #ecf0f1; border-radius: 8px;">
        <p style="color: #7f8c8d; margin: 0; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px;">Best regards,<br>Zuhaush Team</p>
      </div>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};

export {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailOtp,
  sendPasswordResetOtp,
};

