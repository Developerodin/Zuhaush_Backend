import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

// Basic CRUD validations
const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().valid('user', 'admin', 'builder').default('user'),
    contactNumber: Joi.string().optional(),
    cityofInterest: Joi.string().optional(),
    accountType: Joi.string().valid('registered', 'guest').default('registered'),
    preferences: Joi.object().keys({
      propertyTypes: Joi.array().items(Joi.string()),
      budgetRange: Joi.object().keys({
        min: Joi.number(),
        max: Joi.number(),
      }),
      locations: Joi.array().items(Joi.string()),
    }).optional(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    accountType: Joi.string().valid('registered', 'guest'),
    isActive: Joi.boolean(),
    isEmailVerified: Joi.boolean(),
    registrationStatus: Joi.string().valid('partial', 'otp_verified', 'completed'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      contactNumber: Joi.string().optional(),
      cityofInterest: Joi.string().optional(),
      role: Joi.string().valid('user', 'admin', 'builder'),
      isActive: Joi.boolean(),
      image: Joi.string().optional(),
      preferences: Joi.object().keys({
        propertyTypes: Joi.array().items(Joi.string()),
        budgetRange: Joi.object().keys({
          min: Joi.number(),
          max: Joi.number(),
        }),
        locations: Joi.array().items(Joi.string()),
      }),
      permissions: Joi.object().keys({
        newProperties: Joi.boolean(),
        visitConfirmation: Joi.boolean(),
        visitReminder: Joi.boolean(),
        releaseMessages: Joi.boolean(),
      }),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
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
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().optional(),
    contactNumber: Joi.string().optional(),
    cityofInterest: Joi.string().optional(),
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
    userId: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    contactNumber: Joi.string().optional(),
    cityofInterest: Joi.string().optional(),
    preferences: Joi.object().keys({
      propertyTypes: Joi.array().items(Joi.string()),
      budgetRange: Joi.object().keys({
        min: Joi.number(),
        max: Joi.number(),
      }),
      locations: Joi.array().items(Joi.string()),
    }).optional(),
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
    contactNumber: Joi.string().optional(),
    cityofInterest: Joi.string().optional(),
    image: Joi.string().optional(),
    preferences: Joi.object().keys({
      propertyTypes: Joi.array().items(Joi.string()),
      budgetRange: Joi.object().keys({
        min: Joi.number(),
        max: Joi.number(),
      }),
      locations: Joi.array().items(Joi.string()),
    }).optional(),
    permissions: Joi.object().keys({
      newProperties: Joi.boolean(),
      visitConfirmation: Joi.boolean(),
      visitReminder: Joi.boolean(),
      releaseMessages: Joi.boolean(),
    }).optional(),
  }).min(1),
};

const updatePreferences = {
  body: Joi.object().keys({
    propertyTypes: Joi.array().items(Joi.string()),
    budgetRange: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
    }),
    locations: Joi.array().items(Joi.string()),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

export { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
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
  updatePreferences,
  changePassword,
};

