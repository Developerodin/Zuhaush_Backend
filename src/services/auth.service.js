import httpStatus from 'http-status';
import { verifyToken, generateAuthTokens } from './token.service.js';
import { getUserByEmail, getUserById, updateUserById, createUser } from './user.service.js';
import Token from '../models/token.model.js';
import ApiError from '../utils/ApiError.js';
import { tokenTypes } from '../config/tokens.js';
import {
  sendEmailVerificationOTP as sendEmailOTP,
  sendPasswordResetOTP as sendPasswordResetOTPEmail,
  verifyOTP as verifyOTPService,
  verifyOTPWithoutBlacklist,
} from './otp.service.js';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Send OTP for email verification
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendEmailVerificationOTP = async (email) => {
  return sendEmailOTP(email);
};

/**
 * Send OTP for password reset
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendPasswordResetOTP = async (email) => {
  return sendPasswordResetOTPEmail(email);
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} type
 * @returns {Promise<Object>}
 */
const verifyOTP = async (email, otp, type) => {
  return verifyOTPService(email, otp, type);
};

/**
 * Login with OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const loginWithOTP = async (email, otp) => {
  const result = await verifyOTP(email, otp, 'email_verification');
  const user = await getUserById(result.userId);

  // Update last login
  await updateUserById(user.id, { lastLoginAt: new Date() });

  // Generate auth tokens
  const tokens = await generateAuthTokens(user);

  return { user, tokens };
};

/**
 * Register with OTP
 * @param {string} email
 * @param {string} otp
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const registerWithOTP = async (email, otp, userData) => {
  const result = await verifyOTP(email, otp, 'email_verification');
  const user = await getUserById(result.userId);

  // Update user data and mark email as verified
  await updateUserById(user.id, {
    ...userData,
    isEmailVerified: true,
    lastLoginAt: new Date(),
  });

  // Generate auth tokens
  const tokens = await generateAuthTokens(user);

  return { user, tokens };
};

/**
 * Reset password with OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const result = await verifyOTP(email, otp, 'password_reset');
  const user = await getUserById(result.userId);

  // Update password
  await updateUserById(user.id, { password: newPassword });

  // Delete all password reset tokens
  await Token.deleteMany({ user: user.id, type: tokenTypes.PASSWORD_RESET_OTP });

  return { message: 'Password reset successfully' };
};

/**
 * Login with email/password and send OTP
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginWithPasswordAndSendOTP = async (email, password) => {
  const user = await loginUserWithEmailAndPassword(email, password);
  
  // Send OTP for email verification
  await sendEmailOTP(email, 'email_verification');
  
  return { 
    message: 'OTP sent to your email. Please verify to complete login.',
    userId: user.id,
    email: user.email 
  };
};

/**
 * Complete login with OTP verification
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const completeLoginWithOTP = async (email, otp) => {
  const result = await verifyOTPService(email, otp, 'email_verification');
  const user = await getUserById(result.userId);
  
  // Update last login
  await updateUserById(user.id, { lastLoginAt: new Date() });
  
  // Generate auth tokens
  const tokens = await generateAuthTokens(user);
  
  return { user, tokens };
};

/**
 * Register with email/password and send OTP
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const registerWithPasswordAndSendOTP = async (userData) => {
  const { email, password, role = 'user' } = userData;
  
  // Create user with email, password, and role
  const user = await createUser({ email, password, role });
  
  // Send OTP for email verification
  await sendEmailOTP(email, 'email_verification');
  
  return { 
    message: 'OTP sent to your email. Please verify to complete registration.',
    userId: user.id,
    email: user.email,
    role: user.role
  };
};

/**
 * Verify OTP for registration (Step 2)
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const verifyRegistrationOTP = async (email, otp) => {
  const result = await verifyOTPService(email, otp, 'email_verification');
  const user = await getUserById(result.userId);
  
  return { 
    message: 'OTP verified successfully. Please complete your profile.',
    userId: user.id,
    email: user.email 
  };
};

/**
 * Complete registration with profile details (Step 3)
 * @param {string} userId
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
const completeRegistrationWithProfile = async (userId, profileData) => {
  const user = await getUserById(userId);
  
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Update user with complete profile data and mark email as verified
  await updateUserById(user.id, {
    ...profileData,
    isEmailVerified: true,
    lastLoginAt: new Date(),
  });
  
  // Generate auth tokens
  const tokens = await generateAuthTokens(user);
  
  return { user, tokens };
};

/**
 * Step 1: Send OTP for password reset
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendForgotPasswordOTP = async (email) => {
  // Check if user exists
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Send OTP for password reset
  await sendPasswordResetOTP(email);
  
  return { 
    message: 'OTP sent to your email for password reset.',
    email: email 
  };
};

/**
 * Step 2: Verify OTP for password reset
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const verifyForgotPasswordOTP = async (email, otp) => {
  const result = await verifyOTPWithoutBlacklist(email, otp, 'password_reset'); // Don't blacklist the OTP yet
  
  return { 
    message: 'OTP verified successfully. You can now reset your password.',
    email: email,
    resetToken: result.resetToken || 'verified' // You can generate a token here if needed
  };
};

/**
 * Step 3: Reset password with verified OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const resetPasswordWithVerifiedOTP = async (email, otp, newPassword) => {
  // Verify OTP again to ensure it's still valid and blacklist it
  const result = await verifyOTPService(email, otp, 'password_reset'); // This will blacklist the OTP
  const user = await getUserById(result.userId);

  // Update password
  await updateUserById(user.id, { password: newPassword });

  // Delete all password reset OTP tokens
  await Token.deleteMany({ user: user.id, type: tokenTypes.PASSWORD_RESET_OTP });

  return { message: 'Password reset successfully' };
};

/**
 * Guest login
 * @returns {Promise<Object>}
 */
const guestLogin = async () => {
  // Create a temporary guest user
  const guestUser = {
    id: `guest_${Date.now()}`,
    name: 'Guest User',
    email: 'guest@zuhaush.com',
    role: 'guest',
    accountType: 'guest',
    isEmailVerified: false,
    isActive: true,
  };

  // Generate temporary token
  const tokens = await generateAuthTokens(guestUser);

  return { user: guestUser, tokens };
};

/**
 * Check if email exists in the system
 * @param {string} email
 * @returns {Promise<Object>}
 */
const checkEmail = async (email) => {
  const user = await getUserByEmail(email);
  
  if (user) {
    return {
      exists: true,
      message: 'User already exists. Please login with your password.',
    };
  }
  
  return {
    exists: false,
    message: 'New user. Please proceed with registration.',
  };
};

/**
 * Send registration OTP for new users (before account creation)
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendRegistrationOTP = async (email) => {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User already exists with this email');
  }

  // For registration, we'll use the existing OTP flow but with a temp user
  // Create a temporary user record that will be completed in later steps
  const tempUser = await createUser({
    email,
    password: 'TEMP_PASSWORD_' + Date.now(), // Temporary password
    isEmailVerified: false,
    registrationStatus: 'partial',
  });

  // Send OTP for email verification
  await sendEmailOTP(email, 'email_verification');

  return {
    message: `OTP sent successfully to ${email}`,
    tempUserId: tempUser.id,
  };
};

/**
 * Create password after OTP verification (OTP already verified in previous step)
 * @param {Object} userData - email, password, role
 * @returns {Promise<Object>}
 */
const createPassword = async (userData) => {
  const { email, password, role = 'user' } = userData;
  
  // Find existing temp user
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found. Please complete OTP verification first.');
  }
  
  // Check if registration is already completed
  if (existingUser.registrationStatus === 'completed') {
    throw new ApiError(httpStatus.CONFLICT, 'Registration already completed');
  }
  
  // Check if OTP was verified
  if (!existingUser.isOtpVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please verify OTP first');
  }
  
  // Update user with new password and role
  // This is idempotent - calling it multiple times will just update the password
  await updateUserById(existingUser.id, {
    password,
    role,
    registrationStatus: 'otp_verified',
  });
  
  // Get updated user
  const updatedUser = await getUserById(existingUser.id);
  
  return {
    message: 'Password created successfully',
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  };
};

export {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  verifyOTP,
  loginWithOTP,
  registerWithOTP,
  resetPasswordWithOTP,
  loginWithPasswordAndSendOTP,
  completeLoginWithOTP,
  registerWithPasswordAndSendOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithVerifiedOTP,
  guestLogin,
  checkEmail,
  sendRegistrationOTP,
  createPassword,
};

