import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteUploadedDocument } from '../middlewares/builderUpload.js';
import * as builderService from '../services/builder.service.js';

// Basic CRUD operations
const createBuilder = catchAsync(async (req, res) => {
  const builder = await builderService.createBuilder(req.body);
  res.status(httpStatus.CREATED).send(builder);
});

const getBuilders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'email', 'company', 'state', 'city', 'role', 'status', 'registrationStatus', 'isActive', 'q']);
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
  
  // Create notification for builder
  try {
    const { createProfileNotifications } = await import('../services/notification.service.js');
    await createProfileNotifications({
      builderId,
      action: 'profile_approved',
      additionalData: { notes }
    });
  } catch (error) {
    console.error('Failed to create builder approval notification:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }
  
  res.send(builder);
});

const rejectBuilder = catchAsync(async (req, res) => {
  const { builderId } = req.params;
  const { notes } = req.body;
  const builder = await builderService.rejectBuilder(builderId, req.user.id, notes);
  
  // Create notification for builder
  try {
    const { createProfileNotifications } = await import('../services/notification.service.js');
    await createProfileNotifications({
      builderId,
      action: 'profile_rejected',
      additionalData: { reason: notes }
    });
  } catch (error) {
    console.error('Failed to create builder rejection notification:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }
  
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
  } else if (type === 'registration') {
    // Handle registration OTP with temp builder creation
    result = await builderService.sendBuilderRegistrationOTP(email);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP type');
  }
  
  res.send(result);
});

const verifyOTP = catchAsync(async (req, res) => {
  const { email, otp, type } = req.body;
  let result;
  
  if (type === 'registration') {
    // For registration, verify email_verification type since that's what temp builder created
    const { verifyOTP: verifyOTPService } = await import('../services/otp.service.js');
    result = await verifyOTPService(email, otp, 'email_verification', true, 'builder');
    
    // Mark builder as OTP verified for registration flow
    const builder = await builderService.getBuilderByEmail(email);
    if (builder) {
      await builderService.updateBuilderById(builder.id, { 
        isOtpVerified: true,
        registrationStatus: 'otp_verified'
      });
    }
  } else {
    const { verifyOTP: verifyOTPService } = await import('../services/otp.service.js');
    result = await verifyOTPService(email, otp, type, true, 'builder');
  }
  
  res.send(result);
});

// Document upload operations
const uploadSingleDocument = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document file is required');
  }

  const documentData = {
    url: req.file.url || null,
    urlKey: req.file.document?.key || null,
    originalName: req.file.document?.originalName || req.file.originalname || null,
    documentType: req.file.document?.documentType || 'other',
  };

  // Use direct MongoDB update for $push operations
  const builder = await builderService.getBuilderById(req.params.builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  builder.supportingDocuments.push(documentData);
  await builder.save();

  res.status(httpStatus.CREATED).send({
    message: 'Document uploaded successfully',
    document: documentData,
    builder
  });
});

const uploadMultipleDocuments = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one document file is required');
  }

  const documentsData = req.files.map(file => ({
    url: file.url || null,
    urlKey: file.document?.key || null,
    originalName: file.document?.originalName || file.originalname || null,
    documentType: file.document?.documentType || 'other',
  }));

  // Use direct MongoDB update for $push operations
  const builder = await builderService.getBuilderById(req.params.builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  builder.supportingDocuments.push(...documentsData);
  await builder.save();

  res.status(httpStatus.CREATED).send({
    message: 'Documents uploaded successfully',
    documents: documentsData,
    builder
  });
});

const uploadDocumentFields = catchAsync(async (req, res) => {
  if (!req.files) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'At least one document file is required');
  }

  const documentsData = [];
  
  // Process each field type
  Object.keys(req.files).forEach(fieldName => {
    const files = req.files[fieldName];
    const documentType = req.body[`${fieldName}Type`] || fieldName;
    
    files.forEach(file => {
      documentsData.push({
        url: file.url || null,
        urlKey: file.document?.key || null,
        originalName: file.document?.originalName || file.originalname || null,
        documentType: documentType,
      });
    });
  });

  // Use direct MongoDB update for $push operations
  const builder = await builderService.getBuilderById(req.params.builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }
  
  builder.supportingDocuments.push(...documentsData);
  await builder.save();

  res.status(httpStatus.CREATED).send({
    message: 'Documents uploaded successfully',
    documents: documentsData,
    builder
  });
});

const removeDocument = catchAsync(async (req, res) => {
  const { builderId, documentId } = req.params;
  
  const builder = await builderService.getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }

  // Find the document to get its S3 key
  const document = builder.supportingDocuments.find(doc => doc._id.toString() === documentId);
  if (!document) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
  }

  // Delete file from S3
  if (document.urlKey) {
    try {
      await deleteUploadedDocument(document.urlKey);
    } catch (error) {
      console.error('Error deleting document from S3:', error);
      // Continue with document removal even if S3 deletion fails
    }
  }

  // Remove document from builder
  await builderService.updateBuilderById(builderId, {
    $pull: { supportingDocuments: { _id: documentId } }
  });

  res.send({
    message: 'Document removed successfully',
    removedDocument: document
  });
});

// Get builder documents
const getBuilderDocuments = catchAsync(async (req, res) => {
  const { builderId } = req.params;
  
  const builder = await builderService.getBuilderById(builderId);
  if (!builder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Builder not found');
  }

  res.send({
    builderId: builder._id,
    documents: builder.supportingDocuments || []
  });
});

// New 4-layer registration flow controllers
const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await builderService.checkBuilderEmail(email);
  res.status(httpStatus.OK).json(result);
});

const createPassword = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await builderService.createBuilderPassword({ email, password, role });
  res.status(httpStatus.CREATED).json(result);
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
  
  // Document upload operations
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadDocumentFields,
  removeDocument,
  getBuilderDocuments,
  
  // New 4-layer registration flow
  checkEmail,
  createPassword,
};
