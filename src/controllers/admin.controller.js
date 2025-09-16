import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import * as adminService from '../services/admin.service.js';

// Basic CRUD operations
const createAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);
  res.status(httpStatus.CREATED).send(admin);
});

const getAdmins = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'roleName', 'isActive', 'email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await adminService.queryAdmins(filter, options);
  res.send(result);
});

const getAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminById(req.params.adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  res.send(admin);
});

const updateAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.updateAdminById(req.params.adminId, req.body);
  res.send(admin);
});

const deleteAdmin = catchAsync(async (req, res) => {
  await adminService.deleteAdminById(req.params.adminId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Authentication endpoints
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminService.loginAdminWithEmailAndPassword(email, password);
  res.send(result);
});

// Navigation permissions management
const updateNavigationPermissions = catchAsync(async (req, res) => {
  const admin = await adminService.updateNavigationPermissions(req.params.adminId, req.body);
  res.send(admin);
});

const getNavigationPermissions = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminById(req.params.adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  res.send({ navigationPermissions: admin.navigationPermissions });
});

// Account management
const activateAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.activateAdmin(req.params.adminId);
  res.send(admin);
});

const deactivateAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.deactivateAdmin(req.params.adminId);
  res.send(admin);
});

// Profile management
const getProfile = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminById(req.user.id);
  res.send(admin);
});

const updateProfile = catchAsync(async (req, res) => {
  const admin = await adminService.updateAdminProfile(req.user.id, req.body);
  res.send(admin);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await adminService.changePassword(req.user.id, currentPassword, newPassword);
  res.send(result);
});

// Admin statistics
const getAdminStats = catchAsync(async (req, res) => {
  const stats = await adminService.getAdminStats();
  res.send(stats);
});

// Permission checking
const checkPermission = catchAsync(async (req, res) => {
  const { permission } = req.params;
  const admin = await adminService.getAdminById(req.user.id);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  
  const hasPermission = admin.hasPermission(permission);
  res.send({ 
    permission, 
    hasPermission,
    adminId: admin.id 
  });
});

export {
  // Basic CRUD
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  
  // Authentication
  login,
  
  // Navigation permissions
  updateNavigationPermissions,
  getNavigationPermissions,
  
  // Account management
  activateAdmin,
  deactivateAdmin,
  
  // Profile management
  getProfile,
  updateProfile,
  changePassword,
  
  // Statistics
  getAdminStats,
  
  // Permission checking
  checkPermission,
};
