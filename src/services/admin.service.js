import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import Admin from '../models/admin.model.js';
import { generateAuthTokens } from './token.service.js';

/**
 * Create an admin
 * @param {Object} adminBody
 * @returns {Promise<Admin>}
 */
const createAdmin = async (adminBody) => {
  if (await Admin.isEmailTaken(adminBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Admin.create(adminBody);
};

/**
 * Query for admins
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAdmins = async (filter, options) => {
  const admins = await Admin.paginate(filter, options);
  return admins;
};

/**
 * Get admin by id
 * @param {ObjectId} id
 * @returns {Promise<Admin>}
 */
const getAdminById = async (id) => {
  return Admin.findById(id);
};

/**
 * Get admin by email
 * @param {string} email
 * @returns {Promise<Admin>}
 */
const getAdminByEmail = async (email) => {
  return Admin.findOne({ email });
};

/**
 * Update admin by id
 * @param {ObjectId} adminId
 * @param {Object} updateBody
 * @returns {Promise<Admin>}
 */
const updateAdminById = async (adminId, updateBody) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  if (updateBody.email && (await Admin.isEmailTaken(updateBody.email, adminId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(admin, updateBody);
  await admin.save();
  return admin;
};

/**
 * Delete admin by id
 * @param {ObjectId} adminId
 * @returns {Promise<Admin>}
 */
const deleteAdminById = async (adminId) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  await admin.remove();
  return admin;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginAdminWithEmailAndPassword = async (email, password) => {
  const admin = await getAdminByEmail(email);
  if (!admin || !(await admin.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!admin.isAccountActive()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Update last login
  await updateAdminById(admin.id, { lastLoginAt: new Date() });
  
  const tokens = await generateAuthTokens(admin);
  return { admin, tokens };
};

/**
 * Update navigation permissions for an admin
 * @param {ObjectId} adminId
 * @param {Object} permissions
 * @returns {Promise<Admin>}
 */
const updateNavigationPermissions = async (adminId, permissions) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  
  // Validate permissions object
  const validPermissions = [
    'dashboard', 'builders', 'users', 'properties', 'analytics', 
    'messages', 'appointments', 'comments', 'settings', 'others'
  ];
  
  const updatedPermissions = { ...admin.navigationPermissions };
  
  Object.keys(permissions).forEach(key => {
    if (validPermissions.includes(key) && typeof permissions[key] === 'boolean') {
      updatedPermissions[key] = permissions[key];
    }
  });
  
  return updateAdminById(adminId, { navigationPermissions: updatedPermissions });
};

/**
 * Activate admin account
 * @param {ObjectId} adminId
 * @returns {Promise<Admin>}
 */
const activateAdmin = async (adminId) => {
  return updateAdminById(adminId, { isActive: true });
};

/**
 * Deactivate admin account
 * @param {ObjectId} adminId
 * @returns {Promise<Admin>}
 */
const deactivateAdmin = async (adminId) => {
  return updateAdminById(adminId, { isActive: false });
};

/**
 * Update admin profile
 * @param {string} adminId
 * @param {Object} profileData
 * @returns {Promise<Admin>}
 */
const updateAdminProfile = async (adminId, profileData) => {
  // Remove sensitive fields that shouldn't be updated through profile
  const { password, navigationPermissions, isActive, ...allowedFields } = profileData;
  return updateAdminById(adminId, allowedFields);
};

/**
 * Change admin password
 * @param {string} adminId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
const changePassword = async (adminId, currentPassword, newPassword) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  
  // Verify current password
  if (!(await admin.isPasswordMatch(currentPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }
  
  // Update password
  await updateAdminById(adminId, { password: newPassword });
  
  return { message: 'Password changed successfully' };
};

/**
 * Get admin statistics
 * @returns {Promise<Object>}
 */
const getAdminStats = async () => {
  const totalAdmins = await Admin.countDocuments();
  const activeAdmins = await Admin.countDocuments({ isActive: true });
  const superAdmins = await Admin.countDocuments({ roleName: 'super_admin' });
  const regularAdmins = await Admin.countDocuments({ roleName: 'admin' });
  
  // Get recent logins (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLogins = await Admin.countDocuments({ 
    lastLoginAt: { $gte: sevenDaysAgo } 
  });
  
  return {
    totalAdmins,
    activeAdmins,
    inactiveAdmins: totalAdmins - activeAdmins,
    superAdmins,
    regularAdmins,
    recentLogins
  };
};

/**
 * Create default super admin
 * @returns {Promise<Admin>}
 */
const createDefaultSuperAdmin = async () => {
  const defaultAdminData = {
    email: 'admin@zuhaush.in',
    password: 'admin@1234',
    name: 'Super Admin',
    roleName: 'super_admin',
    navigationPermissions: {
      dashboard: true,
      builders: true,
      users: true,
      properties: true,
      analytics: true,
      messages: true,
      appointments: true,
      comments: true,
      settings: true,
      others: true,
    },
    isActive: true,
  };
  
  // Check if super admin already exists
  const existingAdmin = await getAdminByEmail(defaultAdminData.email);
  if (existingAdmin) {
    console.log('Default super admin already exists');
    return existingAdmin;
  }
  
  const admin = await createAdmin(defaultAdminData);
  console.log('Default super admin created successfully');
  return admin;
};

export {
  createAdmin,
  queryAdmins,
  getAdminById,
  getAdminByEmail,
  updateAdminById,
  deleteAdminById,
  loginAdminWithEmailAndPassword,
  updateNavigationPermissions,
  activateAdmin,
  deactivateAdmin,
  updateAdminProfile,
  changePassword,
  getAdminStats,
  createDefaultSuperAdmin,
};
