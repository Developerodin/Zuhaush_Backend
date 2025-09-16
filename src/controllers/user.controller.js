import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import * as userService from '../services/user.service.js';

// Basic CRUD operations
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'accountType', 'isActive', 'isEmailVerified', 'registrationStatus']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Authentication endpoints
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginUserWithEmailAndPassword(email, password);
  res.send(result);
});

const register = catchAsync(async (req, res) => {
  const result = await userService.registerUser(req.body);
  res.status(httpStatus.CREATED).send(result);
});

// OTP-based authentication
const registerWithOTP = catchAsync(async (req, res) => {
  const result = await userService.registerUserAndSendOTP(req.body);
  res.status(httpStatus.OK).send(result);
});

const verifyRegistrationOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await userService.verifyRegistrationOTP(email, otp);
  res.send(result);
});

const completeRegistrationWithProfile = catchAsync(async (req, res) => {
  const { userId, ...profileData } = req.body;
  const result = await userService.completeRegistrationWithProfile(userId, profileData);
  res.send(result);
});

const loginWithOTP = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginWithPasswordAndSendOTP(email, password);
  res.send(result);
});

const completeLoginWithOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await userService.completeLoginWithOTP(email, otp);
  res.send(result);
});

// Password reset flow
const sendForgotPasswordOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await userService.sendForgotPasswordOTP(email);
  res.send(result);
});

const verifyForgotPasswordOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await userService.verifyForgotPasswordOTP(email, otp);
  res.send(result);
});

const resetPasswordWithOTP = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await userService.resetPasswordWithVerifiedOTP(email, otp, newPassword);
  res.send(result);
});

// Profile management
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.send(user);
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  res.send(user);
});

const updatePreferences = catchAsync(async (req, res) => {
  const user = await userService.updateUserPreferences(req.user.id, req.body);
  res.send(user);
});

const getPreferences = catchAsync(async (req, res) => {
  const result = await userService.getUserPreferences(req.user.id);
  res.send(result);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
  res.send(result);
});

// Admin operations
const deactivateUser = catchAsync(async (req, res) => {
  const user = await userService.deactivateUser(req.params.userId);
  res.send(user);
});

const activateUser = catchAsync(async (req, res) => {
  const user = await userService.activateUser(req.params.userId);
  res.send(user);
});

const getUserStats = catchAsync(async (req, res) => {
  const stats = await userService.getUserStats();
  res.send(stats);
});

// OTP operations
const sendOTP = catchAsync(async (req, res) => {
  const { email, type } = req.body;
  let result;
  
  if (type === 'email_verification') {
    const { sendEmailVerificationOTP } = await import('../services/otp.service.js');
    result = await sendEmailVerificationOTP(email);
  } else if (type === 'password_reset') {
    const { sendPasswordResetOTP } = await import('../services/otp.service.js');
    result = await sendPasswordResetOTP(email);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP type');
  }
  
  res.send(result);
});

const verifyOTP = catchAsync(async (req, res) => {
  const { email, otp, type } = req.body;
  const { verifyOTP: verifyOTPService } = await import('../services/otp.service.js');
  const result = await verifyOTPService(email, otp, type);
  res.send(result);
});

export {
  // Basic CRUD
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  
  // Authentication
  login,
  register,
  registerWithOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  loginWithOTP,
  completeLoginWithOTP,
  
  // Password reset
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithOTP,
  
  // Profile management
  getProfile,
  updateProfile,
  updatePreferences,
  getPreferences,
  changePassword,
  
  // Admin operations
  deactivateUser,
  activateUser,
  getUserStats,
  
  // OTP operations
  sendOTP,
  verifyOTP,
};

