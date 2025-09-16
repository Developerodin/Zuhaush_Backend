import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import * as builderService from '../services/builder.service.js';

// Basic CRUD operations
const createBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.createBuilder(req.body);
  res.status(httpStatus.CREATED).send(builder);
});

const getBuilders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'email', 'company', 'city', 'status', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await builderService.queryBuilders(filter, options);
  res.send(result);
});

const getBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.getBuilderById(req.params.builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  res.send(builder);
});

const updateBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.updateBuilderById(req.params.builderId, req.body);
  res.send(builder);
});

const deleteBuilder = catchAsync(async (req, res) => {
  await builderService.deleteBuilderById(req.params.builderId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Builder Authentication endpoints
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await builderService.loginBuilderWithEmailAndPassword(email, password);
  res.send(result);
});

const register = catchAsync(async (req, res) => {
  const result = await builderService.registerBuilder(req.body);
  res.status(httpStatus.CREATED).send(result);
});

// OTP-based authentication
const registerWithOTP = catchAsync(async (req, res) => {
  const result = await builderService.registerBuilderAndSendOTP(req.body);
  res.status(httpStatus.OK).send(result);
});

const verifyRegistrationOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await builderService.verifyRegistrationOTP(email, otp);
  res.send(result);
});

const completeRegistrationWithProfile = catchAsync(async (req, res) => {
  const { builderId, ...profileData } = req.body;
  const result = await builderService.completeRegistrationWithProfile(builderId, profileData);
  res.send(result);
});

const loginWithOTP = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await builderService.loginWithPasswordAndSendOTP(email, password);
  res.send(result);
});

const completeLoginWithOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await builderService.completeLoginWithOTP(email, otp);
  res.send(result);
});

// Password reset flow
const sendForgotPasswordOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await builderService.sendForgotPasswordOTP(email);
  res.send(result);
});

const verifyForgotPasswordOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await builderService.verifyForgotPasswordOTP(email, otp);
  res.send(result);
});

const resetPasswordWithOTP = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await builderService.resetPasswordWithVerifiedOTP(email, otp, newPassword);
  res.send(result);
});

// Profile management
const getProfile = catchAsync(async (req, res) => {
  const builder = await builderService.getBuilderById(req.user.id);
  res.send(builder);
});

const updateProfile = catchAsync(async (req, res) => {
  const builder = await builderService.updateBuilderProfile(req.user.id, req.body);
  res.send(builder);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await builderService.changePassword(req.user.id, currentPassword, newPassword);
  res.send(result);
});

// Builder status management
const submitForReview = catchAsync(async (req, res) => {
  const builder = await builderService.submitBuilderForReview(req.user.id);
  res.send(builder);
});

const resetToDraft = catchAsync(async (req, res) => {
  const builder = await builderService.resetBuilderToDraft(req.user.id);
  res.send(builder);
});

// Admin operations for builder approval
const approveBuilder = catchAsync(async (req, res) => {
  const { builderId } = req.params;
  const { notes } = req.body;
  const builder = await builderService.approveBuilder(builderId, req.user.id, notes);
  res.send(builder);
});

const rejectBuilder = catchAsync(async (req, res) => {
  const { builderId } = req.params;
  const { notes } = req.body;
  const builder = await builderService.rejectBuilder(builderId, req.user.id, notes);
  res.send(builder);
});

// Team member management
const addTeamMember = catchAsync(async (req, res) => {
  const builder = await builderService.addTeamMember(req.user.id, req.body);
  res.send(builder);
});

const getTeamMembers = catchAsync(async (req, res) => {
  const builder = await builderService.getBuilderById(req.user.id);
  res.send({ teamMembers: builder.teamMembers });
});

const getTeamMember = catchAsync(async (req, res) => {
  const { memberId } = req.params;
  const member = await builderService.getTeamMember(req.user.id, memberId);
  res.send(member);
});

const updateTeamMember = catchAsync(async (req, res) => {
  const { memberId } = req.params;
  const builder = await builderService.updateTeamMember(req.user.id, memberId, req.body);
  res.send(builder);
});

const removeTeamMember = catchAsync(async (req, res) => {
  const { memberId } = req.params;
  const builder = await builderService.removeTeamMember(req.user.id, memberId);
  res.send(builder);
});

// Team member authentication
const teamMemberLogin = catchAsync(async (req, res) => {
  const { email, password, builderId } = req.body;
  const result = await builderService.loginTeamMember(email, password, builderId);
  res.send(result);
});

// Admin operations
const deactivateBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.deactivateBuilder(req.params.builderId);
  res.send(builder);
});

const activateBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.activateBuilder(req.params.builderId);
  res.send(builder);
});

const getBuilderStats = catchAsync(async (req, res) => {
  const stats = await builderService.getBuilderStats();
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
  createBuilder,
  getBuilders,
  getBuilder,
  updateBuilder,
  deleteBuilder,
  
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
  changePassword,
  
  // Status management
  submitForReview,
  resetToDraft,
  
  // Admin operations
  approveBuilder,
  rejectBuilder,
  deactivateBuilder,
  activateBuilder,
  getBuilderStats,
  
  // Team member management
  addTeamMember,
  getTeamMembers,
  getTeamMember,
  updateTeamMember,
  removeTeamMember,
  teamMemberLogin,
  
  // OTP operations
  sendOTP,
  verifyOTP,
};
