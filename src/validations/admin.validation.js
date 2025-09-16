import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

// Basic CRUD validations
const createAdmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    roleName: Joi.string().valid('admin', 'super_admin').default('admin'),
    navigationPermissions: Joi.object().keys({
      dashboard: Joi.boolean().default(true),
      builders: Joi.boolean().default(true),
      users: Joi.boolean().default(true),
      properties: Joi.boolean().default(true),
      analytics: Joi.boolean().default(true),
      messages: Joi.boolean().default(true),
      appointments: Joi.boolean().default(true),
      comments: Joi.boolean().default(true),
      settings: Joi.boolean().default(true),
      others: Joi.boolean().default(false),
    }).optional(),
    isActive: Joi.boolean().default(true),
  }),
};

const getAdmins = {
  query: Joi.object().keys({
    name: Joi.string(),
    roleName: Joi.string().valid('admin', 'super_admin'),
    isActive: Joi.boolean(),
    email: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().custom(objectId),
  }),
};

const updateAdmin = {
  params: Joi.object().keys({
    adminId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      roleName: Joi.string().valid('admin', 'super_admin'),
      isActive: Joi.boolean(),
      navigationPermissions: Joi.object().keys({
        dashboard: Joi.boolean(),
        builders: Joi.boolean(),
        users: Joi.boolean(),
        properties: Joi.boolean(),
        analytics: Joi.boolean(),
        messages: Joi.boolean(),
        appointments: Joi.boolean(),
        comments: Joi.boolean(),
        settings: Joi.boolean(),
        others: Joi.boolean(),
      }),
    })
    .min(1),
};

const deleteAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().custom(objectId),
  }),
};

// Authentication validations
const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

// Navigation permissions validations
const updateNavigationPermissions = {
  params: Joi.object().keys({
    adminId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    dashboard: Joi.boolean(),
    builders: Joi.boolean(),
    users: Joi.boolean(),
    properties: Joi.boolean(),
    analytics: Joi.boolean(),
    messages: Joi.boolean(),
    appointments: Joi.boolean(),
    comments: Joi.boolean(),
    settings: Joi.boolean(),
    others: Joi.boolean(),
  }).min(1),
};

const getNavigationPermissions = {
  params: Joi.object().keys({
    adminId: Joi.required().custom(objectId),
  }),
};

// Account management validations
const activateAdmin = {
  params: Joi.object().keys({
    adminId: Joi.required().custom(objectId),
  }),
};

const deactivateAdmin = {
  params: Joi.object().keys({
    adminId: Joi.required().custom(objectId),
  }),
};

// Profile management validations
const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
  }).min(1),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

// Permission checking validations
const checkPermission = {
  params: Joi.object().keys({
    permission: Joi.string().valid(
      'dashboard', 'builders', 'users', 'properties', 'analytics',
      'messages', 'appointments', 'comments', 'settings', 'others'
    ).required(),
  }),
};

export { 
  createAdmin, 
  getAdmins, 
  getAdmin, 
  updateAdmin, 
  deleteAdmin,
  login,
  updateNavigationPermissions,
  getNavigationPermissions,
  activateAdmin,
  deactivateAdmin,
  updateProfile,
  changePassword,
  checkPermission,
};
