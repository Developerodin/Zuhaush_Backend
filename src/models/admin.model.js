import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const adminSchema = mongoose.Schema(
  {
    // Basic admin info
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    
    // Admin details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roleName: {
      type: String,
      required: true,
      trim: true,
      default: 'admin',
    },
    
    // Login tracking
    lastLoginAt: {
      type: Date,
    },
    
    // Navigation permissions
    navigationPermissions: {
      dashboard: {
        type: Boolean,
        default: true,
      },
      builders: {
        type: Boolean,
        default: true,
      },
      users: {
        type: Boolean,
        default: true,
      },
      properties: {
        type: Boolean,
        default: true,
      },
      analytics: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },
      appointments: {
        type: Boolean,
        default: true,
      },
      comments: {
        type: Boolean,
        default: true,
      },
      settings: {
        type: Boolean,
        default: true,
      },
      others: {
        type: Boolean,
        default: false,
      },
    },
    
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
adminSchema.plugin(toJSON);
adminSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The admin's email
 * @param {ObjectId} [excludeAdminId] - The id of the admin to be excluded
 * @returns {Promise<boolean>}
 */
adminSchema.statics.isEmailTaken = async function (email, excludeAdminId) {
  const admin = await this.findOne({ email, _id: { $ne: excludeAdminId } });
  return !!admin;
};

/**
 * Check if password matches the admin's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
adminSchema.methods.isPasswordMatch = async function (password) {
  const admin = this;
  return bcrypt.compare(password, admin.password);
};

/**
 * Check if admin has permission for a specific navigation item
 * @param {string} permission - The navigation permission to check
 * @returns {boolean}
 */
adminSchema.methods.hasPermission = function (permission) {
  const admin = this;
  return admin.navigationPermissions && admin.navigationPermissions[permission] === true;
};

/**
 * Check if admin is active
 * @returns {boolean}
 */
adminSchema.methods.isAccountActive = function () {
  const admin = this;
  return admin.isActive === true;
};

/**
 * Get all enabled permissions
 * @returns {Array<string>}
 */
adminSchema.methods.getEnabledPermissions = function () {
  const admin = this;
  const permissions = [];
  
  if (admin.navigationPermissions) {
    Object.keys(admin.navigationPermissions).forEach(key => {
      if (admin.navigationPermissions[key] === true) {
        permissions.push(key);
      }
    });
  }
  
  return permissions;
};

// Hash password before saving
adminSchema.pre('save', async function (next) {
  const admin = this;
  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});

/**
 * @typedef Admin
 */
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
