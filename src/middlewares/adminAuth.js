import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

const verifyCallback = (req, resolve, reject) => async (err, admin, info) => {
  if (err || info || !admin) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = admin;
  resolve();
};

const adminAuth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('admin-jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default adminAuth;
