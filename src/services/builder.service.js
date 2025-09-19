import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import Builder from '../models/builder.model.js';
import { generateAuthTokens } from './token.service.js';
import {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  verifyOTP,
  verifyOTPWithoutBlacklist,
} from './otp.service.js';

/**
 * Create a builder
 * @param {Object} builderBody
 * @returns {Promise<Builder>}
 */
const createBuilder = async (builderBody) => {
  if (await Builder.isEmailTaken(builderBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Builder.create(builderBody);
};

/**
 * Query for builders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBuilders = async (filter, options) => {
  // Convert search parameters to proper MongoDB queries
  const mongoFilter = {};
  
  
  // Handle general text search across multiple fields
  if (filter.q) {
    mongoFilter.$or = [
      { name: { $regex: filter.q, $options: 'i' } },
      { email: { $regex: filter.q, $options: 'i' } },
      { company: { $regex: filter.q, $options: 'i' } },
      { city: { $regex: filter.q, $options: 'i' } },
      { contactPerson: { $regex: filter.q, $options: 'i' } },
      { reraRegistrationId: { $regex: filter.q, $options: 'i' } }
    ];
  } else {
    // Handle specific field searches - use OR logic when multiple fields are provided
    const searchFields = [];
    if (filter.name) searchFields.push({ name: { $regex: filter.name, $options: 'i' } });
    if (filter.email) searchFields.push({ email: { $regex: filter.email, $options: 'i' } });
    if (filter.company) searchFields.push({ company: { $regex: filter.company, $options: 'i' } });
    if (filter.city) searchFields.push({ city: { $regex: filter.city, $options: 'i' } });
    
    if (searchFields.length > 0) {
      if (searchFields.length === 1) {
        // Single field search - use direct filter
        Object.assign(mongoFilter, searchFields[0]);
      } else {
        // Multiple field search - use OR logic (find builders matching ANY of the search terms)
        mongoFilter.$or = searchFields;
      }
    }
  }
  
  // Handle exact matches for status and isActive
  if (filter.status) {
    mongoFilter.status = filter.status;
  }
  if (filter.isActive !== undefined) {
    mongoFilter.isActive = filter.isActive === 'true' || filter.isActive === true;
  }
  
  const builders = await Builder.paginate(mongoFilter, options);
  return builders;
};

/**
 * Get builder by id
 * @param {ObjectId} id
 * @returns {Promise<Builder>}
 */
const getBuilderById = async (id) => {
  return Builder.findById(id);
};

/**
 * Get builder by email
 * @param {string} email
 * @returns {Promise<Builder>}
 */
const getBuilderByEmail = async (email) => {
  return Builder.findOne({ email });
};

/**
 * Update builder by id
 * @param {ObjectId} builderId
 * @param {Object} updateBody
 * @returns {Promise<Builder>}
 */
const updateBuilderById = async (builderId, updateBody) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  if (updateBody.email && (await Builder.isEmailTaken(updateBody.email, builderId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(builder, updateBody);
  await builder.save();
  return builder;
};

/**
 * Delete builder by id
 * @param {ObjectId} builderId
 * @returns {Promise<Builder>}
 */
const deleteBuilderById = async (builderId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  await builder.remove();
  return builder;
};

// Authentication methods

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginBuilderWithEmailAndPassword = async (email, password) => {
  const builder = await getBuilderByEmail(email);
  if (!builder || !(await builder.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!builder.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Update last login
  await updateBuilderById(builder.id, { lastLoginAt: new Date() });
  
  const tokens = await generateAuthTokens(builder);
  return { builder, tokens };
};

/**
 * Register builder with email and password
 * @param {Object} builderData
 * @returns {Promise<Object>}
 */
const registerBuilder = async (builderData) => {
  const { email, password, ...otherData } = builderData;
  
  // Check if email is already taken
  if (await Builder.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  // Create builder
  const builder = await createBuilder({ email, password, ...otherData });
  
  const tokens = await generateAuthTokens(builder);
  return { builder, tokens };
};

/**
 * Register builder and send OTP for verification
 * @param {Object} builderData
 * @returns {Promise<Object>}
 */
const registerBuilderAndSendOTP = async (builderData) => {
  const { email, password } = builderData;
  
  // Check if email is already taken
  if (await Builder.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  // Create builder with only email and password
  const builder = await createBuilder({ email, password });
  
  // Send OTP for email verification
  await sendEmailVerificationOTP(email);
  
  return { 
    message: 'OTP sent to your email. Please verify to complete registration.',
    builderId: builder.id,
    email: builder.email 
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
  const builder = await getBuilderById(result.userId);
  
  return { 
    message: 'OTP verified successfully. Please complete your profile.',
    builderId: builder.id,
    email: builder.email 
  };
};

/**
 * Complete registration with profile details
 * @param {string} builderId
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
const completeRegistrationWithProfile = async (builderId, profileData) => {
  const builder = await getBuilderById(builderId);
  
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  // Update builder with complete profile data and mark email as verified
  await updateBuilderById(builder.id, {
    ...profileData,
    isOtpVerified: true,
    lastLoginAt: new Date(),
  });
  
  // Generate auth tokens
  const tokens = await generateAuthTokens(builder);
  
  return { builder, tokens };
};

/**
 * Login with password and send OTP
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginWithPasswordAndSendOTP = async (email, password) => {
  const builder = await getBuilderByEmail(email);
  if (!builder || !(await builder.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!builder.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Send OTP for email verification
  await sendEmailVerificationOTP(email);
  
  return { 
    message: 'OTP sent to your email. Please verify to complete login.',
    builderId: builder.id,
    email: builder.email 
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
  const builder = await getBuilderById(result.userId);
  
  // Update last login
  await updateBuilderById(builder.id, { lastLoginAt: new Date() });
  
  // Generate auth tokens
  const tokens = await generateAuthTokens(builder);
  
  return { builder, tokens };
};

/**
 * Send OTP for password reset
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendForgotPasswordOTP = async (email) => {
  // Check if builder exists
  const builder = await getBuilderByEmail(email);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
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
  const builder = await getBuilderById(result.userId);

  // Update password
  await updateBuilderById(builder.id, { password: newPassword });

  return { message: 'Password reset successfully' };
};

/**
 * Change builder password
 * @param {string} builderId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const changePassword = async (builderId, currentPassword, newPassword) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  // Verify current password
  if (!(await builder.isPasswordMatch(currentPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }
  
  // Update password
  await updateBuilderById(builder.id, { password: newPassword });
  
  return { message: 'Password changed successfully' };
};

/**
 * Update builder profile
 * @param {string} builderId
 * @param {Object} profileData
 * @returns {Promise<Builder>}
 */
const updateBuilderProfile = async (builderId, profileData) => {
  return updateBuilderById(builderId, profileData);
};

/**
 * Submit builder for review
 * @param {string} builderId
 * @returns {Promise<Builder>}
 */
const submitBuilderForReview = async (builderId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  return builder.submitForReview();
};

/**
 * Reset builder to draft
 * @param {string} builderId
 * @returns {Promise<Builder>}
 */
const resetBuilderToDraft = async (builderId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  return builder.resetToDraft();
};

/**
 * Admin approves builder
 * @param {string} builderId
 * @param {string} adminId
 * @param {string} notes
 * @returns {Promise<Builder>}
 */
const approveBuilder = async (builderId, adminId, notes = '') => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  return builder.approve(adminId, notes);
};

/**
 * Admin rejects builder
 * @param {string} builderId
 * @param {string} adminId
 * @param {string} notes
 * @returns {Promise<Builder>}
 */
const rejectBuilder = async (builderId, adminId, notes) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  return builder.reject(adminId, notes);
};

// Team member management

/**
 * Add team member to builder
 * @param {string} builderId
 * @param {Object} teamMemberData
 * @returns {Promise<Builder>}
 */
const addTeamMember = async (builderId, teamMemberData) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  // Check if team member email is already taken
  if (builder.isTeamMemberEmailTaken(teamMemberData.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Team member email already taken');
  }
  
  return builder.addTeamMember(teamMemberData);
};

/**
 * Get team member by ID
 * @param {string} builderId
 * @param {string} memberId
 * @returns {Promise<Object>}
 */
const getTeamMember = async (builderId, memberId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  const member = builder.teamMembers.id(memberId);
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team member not found');
  }
  
  return member;
};

/**
 * Update team member
 * @param {string} builderId
 * @param {string} memberId
 * @param {Object} updateData
 * @returns {Promise<Builder>}
 */
const updateTeamMember = async (builderId, memberId, updateData) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  // Check if email is being updated and not taken
  if (updateData.email && builder.isTeamMemberEmailTaken(updateData.email, memberId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Team member email already taken');
  }
  
  return builder.updateTeamMember(memberId, updateData);
};

/**
 * Remove team member
 * @param {string} builderId
 * @param {string} memberId
 * @returns {Promise<Builder>}
 */
const removeTeamMember = async (builderId, memberId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  return builder.removeTeamMember(memberId);
};

/**
 * Login team member
 * @param {string} email
 * @param {string} password
 * @param {string} builderId
 * @returns {Promise<Object>}
 */
const loginTeamMember = async (email, password, builderId) => {
  const builder = await getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  const member = builder.findTeamMemberByEmail(email);
  if (!member) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  
  if (!member.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Team member account is deactivated');
  }
  
  // Verify password
  const isPasswordMatch = await bcrypt.compare(password, member.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  
  // Update last login
  member.lastLoginAt = new Date();
  await builder.save();
  
  // Generate auth tokens (using builder as the user for token generation)
  const tokens = await generateAuthTokens(builder);
  
  return { 
    teamMember: member, 
    builder: builder,
    tokens 
  };
};

/**
 * Deactivate builder account
 * @param {string} builderId
 * @returns {Promise<Builder>}
 */
const deactivateBuilder = async (builderId) => {
  return updateBuilderById(builderId, { isActive: false });
};

/**
 * Activate builder account
 * @param {string} builderId
 * @returns {Promise<Builder>}
 */
const activateBuilder = async (builderId) => {
  return updateBuilderById(builderId, { isActive: true });
};

/**
 * Get builder statistics
 * @returns {Promise<Object>}
 */
const getBuilderStats = async () => {
  const totalBuilders = await Builder.countDocuments();
  const activeBuilders = await Builder.countDocuments({ isActive: true });
  const approvedBuilders = await Builder.countDocuments({ status: 'approved' });
  const pendingBuilders = await Builder.countDocuments({ status: 'submitted' });
  const draftBuilders = await Builder.countDocuments({ status: 'draft' });
  const rejectedBuilders = await Builder.countDocuments({ status: 'rejected' });
  
  return {
    totalBuilders,
    activeBuilders,
    approvedBuilders,
    pendingBuilders,
    draftBuilders,
    rejectedBuilders,
  };
};

export {
  createBuilder,
  queryBuilders,
  getBuilderById,
  getBuilderByEmail,
  updateBuilderById,
  deleteBuilderById,
  loginBuilderWithEmailAndPassword,
  registerBuilder,
  registerBuilderAndSendOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  loginWithPasswordAndSendOTP,
  completeLoginWithOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithVerifiedOTP,
  changePassword,
  updateBuilderProfile,
  submitBuilderForReview,
  resetBuilderToDraft,
  approveBuilder,
  rejectBuilder,
  addTeamMember,
  getTeamMember,
  updateTeamMember,
  removeTeamMember,
  loginTeamMember,
  deactivateBuilder,
  activateBuilder,
  getBuilderStats,
};

