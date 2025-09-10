import Joi from 'joi';
import mongoose from 'mongoose';
import { password } from './custom.validation.js';

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const sendVerificationEmail = {};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const sendOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    type: Joi.string().valid('email_verification', 'password_reset').required(),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    type: Joi.string().valid('email_verification', 'password_reset').required(),
  }),
};

const loginWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const registerWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    name: Joi.string().required(),
    password: Joi.string().required().custom(password),
    contactNumber: Joi.string().optional(),
    city: Joi.string().optional(),
  }),
};

const resetPasswordWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

const loginWithPasswordAndSendOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const completeLoginWithOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const registerWithPasswordAndSendOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().custom(password),
  }),
};

const verifyRegistrationOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

const completeRegistrationWithProfile = {
  body: Joi.object().keys({
    userId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }),
    name: Joi.string().required(),
    contactNumber: Joi.string().optional(),
    city: Joi.string().optional(),
  }),
};

const guestLogin = {};

export {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  sendOTP,
  verifyOTP,
  loginWithOTP,
  registerWithOTP,
  resetPasswordWithOTP,
  loginWithPasswordAndSendOTP,
  completeLoginWithOTP,
  registerWithPasswordAndSendOTP,
  verifyRegistrationOTP,
  completeRegistrationWithProfile,
  guestLogin,
};
