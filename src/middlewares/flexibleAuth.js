import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { roleRights } from '../config/roles.js';

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const flexibleAuth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    // Try admin authentication first
    passport.authenticate('admin-jwt', { session: false }, (err, admin, info) => {
      if (admin) {
        // Admin token found, use admin user
        req.user = admin;
        if (requiredRights.length) {
          // Check admin permissions
          const adminRights = roleRights.get(admin.roleName || 'admin');
          const hasRequiredRights = requiredRights.every((requiredRight) => adminRights.includes(requiredRight));
          if (!hasRequiredRights) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
          }
        }
        return resolve();
      }
      
      // If admin auth failed, try regular user auth (for builders)
      passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || info || !user) {
          return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
        }
        req.user = user;

        if (requiredRights.length) {
          // For builders, we'll use a more permissive approach
          // If it's a builder token, allow access to builder-related operations
          const userRights = roleRights.get('builder'); // Always use builder rights for builder tokens
          const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
          if (!hasRequiredRights && req.params.userId !== user.id) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
          }
        }
        resolve();
      })(req, res, next);
    })(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default flexibleAuth;
