import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config/config.js';
import { getUserByEmail } from './user.service.js';
import Token from '../models/token.model.js';
import ApiError from '../utils/ApiError.js';
import { tokenTypes } from '../config/tokens.js';
import { sendEmailOtp, sendPasswordResetOtp } from './email.service.js';

// Store OTP attempts in memory (in production, use Redis)
const otpAttempts = new Map();
const otpRateLimit = new Map();

/**
 * Generate 6-digit OTP
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check rate limit for OTP requests
 * @param {string} email
 * @returns {boolean}
 */
const checkRateLimit = (email) => {
  const now = Date.now();
  const key = `otp_${email}`;
  
  if (!otpRateLimit.has(key)) {
    otpRateLimit.set(key, []);
  }
  
  const requests = otpRateLimit.get(key);
  // Remove requests older than 1 hour
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
  
  if (recentRequests.length >= 5) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  otpRateLimit.set(key, recentRequests);
  return true;
};

/**
 * Check OTP attempts
 * @param {string} email
 * @param {string} type
 * @returns {boolean}
 */
const checkAttempts = (email, type) => {
  const key = `${email}_${type}`;
  const attempts = otpAttempts.get(key) || 0;
  return attempts < 3;
};

/**
 * Increment OTP attempts
 * @param {string} email
 * @param {string} type
 */
const incrementAttempts = (email, type) => {
  const key = `${email}_${type}`;
  const attempts = otpAttempts.get(key) || 0;
  otpAttempts.set(key, attempts + 1);
};

/**
 * Clear OTP attempts
 * @param {string} email
 * @param {string} type
 */
const clearAttempts = (email, type) => {
  const key = `${email}_${type}`;
  otpAttempts.delete(key);
};

/**
 * Send OTP for email verification
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendEmailVerificationOTP = async (email) => {
  // Check rate limit
  if (!checkRateLimit(email)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later.');
  }

  // Check attempts
  if (!checkAttempts(email, 'email_verification')) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP verification attempts. Please try again later.');
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  // Generate OTP
  const otp = generateOTP();
  
  // Create JWT token with OTP
  const expires = moment().add(10, 'minutes');
  const otpToken = jwt.sign(
    { 
      sub: user.id, 
      otp, 
      type: tokenTypes.EMAIL_OTP,
      email 
    }, 
    config.jwt.secret, 
    { expiresIn: '10m' }
  );
  
  // Save OTP token
  await Token.create({
    token: otpToken,
    user: user.id,
    expires: expires.toDate(),
    type: tokenTypes.EMAIL_OTP,
    blacklisted: false,
  });

  // Send OTP via email
  await sendEmailOtp(email, otp, user.name);

  return { message: 'OTP sent successfully' };
};

/**
 * Send OTP for password reset
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendPasswordResetOTP = async (email) => {
  // Check rate limit
  if (!checkRateLimit(email)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later.');
  }

  // Check attempts
  if (!checkAttempts(email, 'password_reset')) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP verification attempts. Please try again later.');
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  // Generate OTP
  const otp = generateOTP();
  
  // Create JWT token with OTP
  const expires = moment().add(10, 'minutes');
  const otpToken = jwt.sign(
    { 
      sub: user.id, 
      otp, 
      type: tokenTypes.PASSWORD_RESET_OTP,
      email 
    }, 
    config.jwt.secret, 
    { expiresIn: '10m' }
  );
  
  // Save OTP token
  await Token.create({
    token: otpToken,
    user: user.id,
    expires: expires.toDate(),
    type: tokenTypes.PASSWORD_RESET_OTP,
    blacklisted: false,
  });

  // Send OTP via email
  await sendPasswordResetOtp(email, otp, user.name);

  return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} type
 * @returns {Promise<Object>}
 */
const verifyOTP = async (email, otp, type) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  // Check attempts
  if (!checkAttempts(email, type)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP verification attempts. Please try again later.');
  }

  // Find the OTP token
  const tokenType = type === 'email_verification' ? tokenTypes.EMAIL_OTP : tokenTypes.PASSWORD_RESET_OTP;
  const otpTokenDoc = await Token.findOne({
    user: user.id,
    type: tokenType,
    blacklisted: false,
    expires: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!otpTokenDoc) {
    incrementAttempts(email, type);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP expired or not found');
  }

  // Verify OTP
  try {
    const payload = jwt.verify(otpTokenDoc.token, config.jwt.secret);
    if (payload.otp !== otp || payload.email !== email) {
      incrementAttempts(email, type);
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    }
  } catch (error) {
    incrementAttempts(email, type);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  // Clear attempts and blacklist the OTP token
  clearAttempts(email, type);
  await Token.findByIdAndUpdate(otpTokenDoc._id, { blacklisted: true });

  return { message: 'OTP verified successfully', userId: user.id };
};

/**
 * Resend OTP
 * @param {string} email
 * @param {string} type
 * @returns {Promise<Object>}
 */
const resendOTP = async (email, type) => {
  if (type === 'email_verification') {
    return sendEmailVerificationOTP(email);
  } else if (type === 'password_reset') {
    return sendPasswordResetOTP(email);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP type');
  }
};

export {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  verifyOTP,
  resendOTP,
};
