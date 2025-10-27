import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { createUser, getUserByEmail, updateUserById } from '../services/user.service.js';
import { generateAuthTokens, generateResetPasswordToken, generateVerifyEmailToken } from '../services/token.service.js';
import {
  loginUserWithEmailAndPassword,
  logout as logout2,
  refreshAuth,
  resetPassword as resetPassword2,
  verifyEmail as verifyEmail2,
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
} from '../services/auth.service.js';
import { sendResetPasswordEmail, sendVerificationEmail as sendVerificationEmail2 } from '../services/email.service.js';


const register = catchAsync(async (req, res) => {
  const user = await createUser(req.body);
  const tokens = await generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(email, password);
  const tokens = await generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await logout2(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await generateResetPasswordToken(req.body.email);
  await sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await resetPassword2(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await generateVerifyEmailToken(req.user);
  await sendVerificationEmail2(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await verifyEmail2(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

// OTP-based authentication endpoints
const sendOTP = catchAsync(async (req, res) => {
  const { email, type } = req.body;
  let result;

  if (type === 'email_verification') {
    result = await sendEmailVerificationOTP(email);
  } else if (type === 'password_reset') {
    result = await sendPasswordResetOTP(email);
  } else if (type === 'registration') {
    // Handle registration OTP with temp user creation
    result = await sendRegistrationOTP(email);
  } else {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid OTP type' });
  }

  res.status(httpStatus.OK).json(result);
});

const verifyOTPCode = catchAsync(async (req, res) => {
  const { email, otp, type } = req.body;
  let result;
  
  if (type === 'registration') {
    // For registration, verify email_verification type since that's what temp user created
    result = await verifyOTP(email, otp, 'email_verification');
    
    // Mark user as OTP verified for registration flow
    const user = await getUserByEmail(email);
    if (user) {
      await updateUserById(user.id, { 
        isOtpVerified: true,
        registrationStatus: 'otp_verified'
      });
    }
  } else {
    result = await verifyOTP(email, otp, type);
  }
  
  res.status(httpStatus.OK).json(result);
});

const loginWithOTPCode = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await loginWithOTP(email, otp);
  res.status(httpStatus.OK).json(result);
});

const registerWithOTPCode = catchAsync(async (req, res) => {
  const { email, otp, ...userData } = req.body;
  const result = await registerWithOTP(email, otp, userData);
  res.status(httpStatus.CREATED).json(result);
});

const resetPasswordWithOTPCode = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await resetPasswordWithOTP(email, otp, newPassword);
  res.status(httpStatus.OK).json(result);
});

const guestLoginController = catchAsync(async (req, res) => {
  const result = await guestLogin();
  res.status(httpStatus.OK).json(result);
});

// New flow endpoints
const loginWithPasswordAndSendOTPController = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginWithPasswordAndSendOTP(email, password);
  res.status(httpStatus.OK).json(result);
});

const completeLoginWithOTPController = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await completeLoginWithOTP(email, otp);
  res.status(httpStatus.OK).json(result);
});

const registerWithPasswordAndSendOTPController = catchAsync(async (req, res) => {
  const result = await registerWithPasswordAndSendOTP(req.body);
  res.status(httpStatus.OK).json(result);
});

const verifyRegistrationOTPController = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyRegistrationOTP(email, otp);
  res.status(httpStatus.OK).json(result);
});

const completeRegistrationWithProfileController = catchAsync(async (req, res) => {
  const { userId, ...profileData } = req.body;
  const result = await completeRegistrationWithProfile(userId, profileData);
  res.status(httpStatus.OK).json(result);
});

// 3-Step Forgot Password Flow
const sendForgotPasswordOTPController = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await sendForgotPasswordOTP(email);
  res.status(httpStatus.OK).json(result);
});

const verifyForgotPasswordOTPController = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyForgotPasswordOTP(email, otp);
  res.status(httpStatus.OK).json(result);
});

const resetPasswordWithVerifiedOTPController = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await resetPasswordWithVerifiedOTP(email, otp, newPassword);
  res.status(httpStatus.OK).json(result);
});

// New 4-layer registration flow controllers
const checkEmailController = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await checkEmail(email);
  res.status(httpStatus.OK).json(result);
});

const createPasswordController = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await createPassword({ email, password, role });
  res.status(httpStatus.CREATED).json(result);
});

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
  verifyOTPCode,
  loginWithOTPCode,
  registerWithOTPCode,
  resetPasswordWithOTPCode,
  loginWithPasswordAndSendOTPController,
  completeLoginWithOTPController,
  registerWithPasswordAndSendOTPController,
  verifyRegistrationOTPController,
  completeRegistrationWithProfileController,
  sendForgotPasswordOTPController,
  verifyForgotPasswordOTPController,
  resetPasswordWithVerifiedOTPController,
  guestLoginController,
  checkEmailController,
  createPasswordController,
};
