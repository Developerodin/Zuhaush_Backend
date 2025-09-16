import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { generateAuthTokens } from './token.service.js';
import {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  verifyOTP,
  verifyOTPWithoutBlacklist,
} from './otp.service.js';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

// Authentication methods

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Update last login
  await updateUserById(user.id, { lastLoginAt: new Date() });
  
  const tokens = await generateAuthTokens(user);
  return { user, tokens };
};

/**
 * Register user with email and password
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const registerUser = async (userData) => {
  const { email, password, ...otherData } = userData;
  
  // Check if email is already taken
  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  // Create user
  const user = await createUser({ email, password, ...otherData });
  
  const tokens = await generateAuthTokens(user);
  return { user, tokens };
};

/**
 * Register user and send OTP for verification
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const registerUserAndSendOTP = async (userData) => {
  const { email, password } = userData;
  
  // Check if email is already taken
  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  // Create user with only email and password
  const user = await createUser({ email, password });
  
  // Send OTP for email verification
  await sendEmailVerificationOTP(email);
  
  return { 
    message: 'OTP sent to your email. Please verify to complete registration.',
    userId: user.id,
    email: user.email 
  };
};

/**
 * Verify registration OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const verifyRegistrationOTP = async (email, otp) => {
  const result = await verifyOTP(email, otp, 'email_verification');
  const user = await getUserById(result.userId);
  
  return { 
    message: 'OTP verified successfully. Please complete your profile.',
    userId: user.id,
    email: user.email 
  };
};

/**
 * Complete registration with profile details
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
 * Login with password and send OTP
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginWithPasswordAndSendOTP = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Send OTP for email verification
  await sendEmailVerificationOTP(email);
  
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
  const result = await verifyOTP(email, otp, 'email_verification');
  const user = await getUserById(result.userId);
  
  // Update last login
  await updateUserById(user.id, { lastLoginAt: new Date() });
  
  // Generate auth tokens
  const tokens = await generateAuthTokens(user);
  
  return { user, tokens };
};

/**
 * Send OTP for password reset
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
 * Verify OTP for password reset
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<Object>}
 */
const verifyForgotPasswordOTP = async (email, otp) => {
  const result = await verifyOTPWithoutBlacklist(email, otp, 'password_reset');
  
  return { 
    message: 'OTP verified successfully. You can now reset your password.',
    email: email,
    resetToken: result.resetToken || 'verified'
  };
};

/**
 * Reset password with verified OTP
 * @param {string} email
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const resetPasswordWithVerifiedOTP = async (email, otp, newPassword) => {
  // Verify OTP again to ensure it's still valid and blacklist it
  const result = await verifyOTP(email, otp, 'password_reset');
  const user = await getUserById(result.userId);

  // Update password
  await updateUserById(user.id, { password: newPassword });

  return { message: 'Password reset successfully' };
};

/**
 * Change user password
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Verify current password
  if (!(await user.isPasswordMatch(currentPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }
  
  // Update password
  await updateUserById(user.id, { password: newPassword });
  
  return { message: 'Password changed successfully' };
};

/**
 * Update user profile
 * @param {string} userId
 * @param {Object} profileData
 * @returns {Promise<User>}
 */
const updateUserProfile = async (userId, profileData) => {
  return updateUserById(userId, profileData);
};

/**
 * Update user preferences
 * @param {string} userId
 * @param {Object} preferences
 * @returns {Promise<User>}
 */
const updateUserPreferences = async (userId, preferences) => {
  return updateUserById(userId, { preferences });
};

/**
 * Get user preferences
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getUserPreferences = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return { preferences: user.preferences };
};

/**
 * Deactivate user account
 * @param {string} userId
 * @returns {Promise<User>}
 */
const deactivateUser = async (userId) => {
  return updateUserById(userId, { isActive: false });
};

/**
 * Activate user account
 * @param {string} userId
 * @returns {Promise<User>}
 */
const activateUser = async (userId) => {
  return updateUserById(userId, { isActive: true });
};

/**
 * Get user statistics
 * @returns {Promise<Object>}
 */
const getUserStats = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const completedRegistrations = await User.countDocuments({ registrationStatus: 'completed' });
  
  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    completedRegistrations,
    pendingRegistrations: totalUsers - completedRegistrations
  };
};

export {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  loginUserWithEmailAndPassword,
  registerUser,
  registerUserAndSendOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  loginWithPasswordAndSendOTP,
  completeLoginWithOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithVerifiedOTP,
  changePassword,
  updateUserProfile,
  updateUserPreferences,
  getUserPreferences,
  deactivateUser,
  activateUser,
  getUserStats,
};

