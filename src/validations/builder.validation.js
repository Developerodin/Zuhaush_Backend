import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

// Basic CRUD validations
const createBuilder = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    contactInfo: Joi.string().required(),
    address: Joi.string().required(),
    company: Joi.string().required(),
    city: Joi.string().required(),
    reraRegistrationId: Joi.string().required(),
    contactPerson: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    website: Joi.string().optional().uri(),
    logo: Joi.string().optional(),
    logoName: Joi.string().optional(),
    supportingDocuments: Joi.array().items(Joi.string()).optional(),
  }),
};

const getBuilders = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    company: Joi.string(),
    city: Joi.string(),
    status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected'),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getBuilder = {
  params: Joi.object().keys({
    builderId: Joi.string().custom(objectId),
  }),
};

const updateBuilder = {
  params: Joi.object().keys({
    builderId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      contactInfo: Joi.string(),
      address: Joi.string(),
      company: Joi.string(),
      city: Joi.string(),
      reraRegistrationId: Joi.string(),
      contactPerson: Joi.string(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      website: Joi.string().uri(),
      logo: Joi.string(),
      logoName: Joi.string(),
      supportingDocuments: Joi.array().items(Joi.string()),
      status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected'),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteBuilder = {
  params: Joi.object().keys({
    builderId: Joi.string().custom(objectId),
  }),
};

// Authentication validations
const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    contactInfo: Joi.string().required(),
    address: Joi.string().required(),
    company: Joi.string().required(),
    city: Joi.string().required(),
    reraRegistrationId: Joi.string().required(),
    contactPerson: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    website: Joi.string().optional().uri(),
    logo: Joi.string().optional(),
    logoName: Joi.string().optional(),
    supportingDocuments: Joi.array().items(Joi.string()).optional(),
  }),
};

// OTP validations
const sendOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    type: Joi.string().valid('email_verification', 'password_reset').required(),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    type: Joi.string().valid('email_verification', 'password_reset').required(),
  }),
};

// Registration flow validations
const registerWithPasswordAndSendOTP = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
  }),
};

const verifyRegistrationOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const completeRegistrationWithProfile = {
  body: Joi.object().keys({
    builderId: Joi.string().required().custom(objectId),
    contactInfo: Joi.string().required(),
    address: Joi.string().required(),
    company: Joi.string().required(),
    city: Joi.string().required(),
    reraRegistrationId: Joi.string().required(),
    contactPerson: Joi.string().required(),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    website: Joi.string().optional().uri(),
    logo: Joi.string().optional(),
    logoName: Joi.string().optional(),
    supportingDocuments: Joi.array().items(Joi.string()).optional(),
  }),
};

// Login flow validations
const loginWithPasswordAndSendOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const completeLoginWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

// Password reset validations
const sendForgotPasswordOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const verifyForgotPasswordOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const resetPasswordWithVerifiedOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

// Profile update validations
const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    contactInfo: Joi.string().optional(),
    address: Joi.string().optional(),
    company: Joi.string().optional(),
    city: Joi.string().optional(),
    reraRegistrationId: Joi.string().optional(),
    contactPerson: Joi.string().optional(),
    phone: Joi.string().optional().pattern(/^\+?[1-9]\d{1,14}$/),
    website: Joi.string().optional().uri(),
    logo: Joi.string().optional(),
    logoName: Joi.string().optional(),
    supportingDocuments: Joi.array().items(Joi.string()).optional(),
  }).min(1),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

// Team member validations
const addTeamMember = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().valid('team_member', 'admin', 'manager').default('team_member'),
    navigationPermissions: Joi.object().keys({
      dashboard: Joi.boolean().default(true),
      myProperties: Joi.boolean().default(true),
      analytics: Joi.boolean().default(true),
      messages: Joi.boolean().default(true),
      myProfile: Joi.boolean().default(true),
      users: Joi.boolean().default(true),
    }).optional(),
  }),
};

const updateTeamMember = {
  params: Joi.object().keys({
    memberId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string().optional().email(),
    password: Joi.string().optional().custom(password),
    role: Joi.string().valid('team_member', 'admin', 'manager').optional(),
    navigationPermissions: Joi.object().keys({
      dashboard: Joi.boolean(),
      myProperties: Joi.boolean(),
      analytics: Joi.boolean(),
      messages: Joi.boolean(),
      myProfile: Joi.boolean(),
      users: Joi.boolean(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const getTeamMember = {
  params: Joi.object().keys({
    memberId: Joi.string().required().custom(objectId),
  }),
};

const removeTeamMember = {
  params: Joi.object().keys({
    memberId: Joi.string().required().custom(objectId),
  }),
};

const teamMemberLogin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    builderId: Joi.string().required().custom(objectId),
  }),
};

// Admin operations validations
const approveBuilder = {
  params: Joi.object().keys({
    builderId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    notes: Joi.string().optional().allow(''),
  }),
};

const rejectBuilder = {
  params: Joi.object().keys({
    builderId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    notes: Joi.string().required().min(1),
  }),
};

export { 
  createBuilder, 
  getBuilders, 
  getBuilder, 
  updateBuilder, 
  deleteBuilder,
  login,
  register,
  sendOTP,
  verifyOTP,
  registerWithPasswordAndSendOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  loginWithPasswordAndSendOTP,
  completeLoginWithOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithVerifiedOTP,
  updateProfile,
  changePassword,
  addTeamMember,
  updateTeamMember,
  getTeamMember,
  removeTeamMember,
  teamMemberLogin,
  approveBuilder,
  rejectBuilder,
};

