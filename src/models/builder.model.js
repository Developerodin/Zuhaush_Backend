import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const builderSchema = mongoose.Schema(
  {
    // Basic builder info
    name: {
      type: String,
      required: true,
      trim: true,
    },
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
    
    // OTP verification fields
    otpCode: {
      type: String,
      required: false,
      trim: true,
      private: true, // used by the toJSON plugin
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    
    // Business information

    contactInfo: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    logoName: {
      type: String,
      required: false,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: false,
      trim: true,
    },
    reraRegistrationId: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Contact details
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!/^\+?[1-9]\d{1,14}$/.test(value)) {
          throw new Error('Invalid phone number format');
        }
      },
    },
    website: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error('Invalid website URL');
        }
      },
    },
    
    // Supporting documents
    supportingDocuments: [{
      url: {
        type: String,
        required: false,
        trim: true,
      },
      urlKey: {
        type: String,
        required: false,
        trim: true,
      },
      originalName: {
        type: String,
        required: false,
        trim: true,
      },
      documentType: {
        type: String,
        required: false,
        enum: ['license', 'certificate', 'registration', 'contract', 'other'],
        default: 'other',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Status management
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    
    // Admin decision details
    adminDecision: {
      status: {
        type: String,
        enum: ['approved', 'rejected'],
        required: false,
      },
      notes: {
        type: String,
        required: false,
        trim: true,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
      },
      reviewedAt: {
        type: Date,
        required: false,
      },
    },
    
    // Team members/roles for builder admin panel
    teamMembers: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
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
      role: {
        type: String,
        required: true,
        trim: true,
        default: 'team_member',
      },
      // Navigation permissions for builder dashboard
      navigationPermissions: {
        dashboard: {
          type: Boolean,
          default: true,
        },
        myProperties: {
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
        myProfile: {
          type: Boolean,
          default: true,
        },
        users: {
          type: Boolean,
          default: true,
        },
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      lastLoginAt: {
        type: Date,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Additional fields
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
builderSchema.plugin(toJSON);
builderSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The builder's email
 * @param {ObjectId} [excludeBuilderId] - The id of the builder to be excluded
 * @returns {Promise<boolean>}
 */
builderSchema.statics.isEmailTaken = async function (email, excludeBuilderId) {
  const builder = await this.findOne({ email, _id: { $ne: excludeBuilderId } });
  return !!builder;
};

/**
 * Check if password matches the builder's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
builderSchema.methods.isPasswordMatch = async function (password) {
  const builder = this;
  return bcrypt.compare(password, builder.password);
};

/**
 * Check if OTP is valid and not expired
 * @param {string} otpCode
 * @returns {boolean}
 */
builderSchema.methods.isOtpValid = function (otpCode) {
  const builder = this;
  return builder.otpCode === otpCode && builder.otpExpiry && builder.otpExpiry > new Date();
};

/**
 * Check if builder is in draft status
 * @returns {boolean}
 */
builderSchema.methods.isDraft = function () {
  const builder = this;
  return builder.status === 'draft';
};

/**
 * Check if builder is submitted for review
 * @returns {boolean}
 */
builderSchema.methods.isSubmitted = function () {
  const builder = this;
  return builder.status === 'submitted';
};

/**
 * Check if builder is approved
 * @returns {boolean}
 */
builderSchema.methods.isApproved = function () {
  const builder = this;
  return builder.status === 'approved';
};

/**
 * Check if builder is rejected
 * @returns {boolean}
 */
builderSchema.methods.isRejected = function () {
  const builder = this;
  return builder.status === 'rejected';
};

/**
 * Submit builder profile for admin review
 * @returns {Promise<Builder>}
 */
builderSchema.methods.submitForReview = function () {
  const builder = this;
  if (builder.status !== 'draft') {
    throw new Error('Only draft profiles can be submitted for review');
  }
  builder.status = 'submitted';
  return builder.save();
};

/**
 * Admin approves builder profile
 * @param {string} adminId - Admin ID who approved
 * @param {string} [notes] - Admin notes
 * @returns {Promise<Builder>}
 */
builderSchema.methods.approve = function (adminId, notes = '') {
  const builder = this;
  if (builder.status !== 'submitted') {
    throw new Error('Only submitted profiles can be approved');
  }
  
  builder.status = 'approved';
  builder.adminDecision = {
    status: 'approved',
    notes,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  };
  
  return builder.save();
};

/**
 * Admin rejects builder profile
 * @param {string} adminId - Admin ID who rejected
 * @param {string} notes - Rejection reason/notes
 * @returns {Promise<Builder>}
 */
builderSchema.methods.reject = function (adminId, notes) {
  const builder = this;
  if (builder.status !== 'submitted') {
    throw new Error('Only submitted profiles can be rejected');
  }
  
  if (!notes || notes.trim().length === 0) {
    throw new Error('Rejection notes are required');
  }
  
  builder.status = 'rejected';
  builder.adminDecision = {
    status: 'rejected',
    notes: notes.trim(),
    reviewedBy: adminId,
    reviewedAt: new Date(),
  };
  
  return builder.save();
};

/**
 * Reset builder profile to draft (for resubmission after rejection)
 * @returns {Promise<Builder>}
 */
builderSchema.methods.resetToDraft = function () {
  const builder = this;
  if (builder.status !== 'rejected') {
    throw new Error('Only rejected profiles can be reset to draft');
  }
  
  builder.status = 'draft';
  builder.adminDecision = undefined;
  
  return builder.save();
};

/**
 * Add a new team member to the builder
 * @param {Object} teamMemberData - Team member data
 * @returns {Promise<Builder>}
 */
builderSchema.methods.addTeamMember = async function (teamMemberData) {
  const builder = this;
  
  // Hash password before adding
  if (teamMemberData.password) {
    teamMemberData.password = await bcrypt.hash(teamMemberData.password, 8);
  }
  
  builder.teamMembers.push(teamMemberData);
  return builder.save();
};

/**
 * Find team member by email
 * @param {string} email - Team member email
 * @returns {Object|null}
 */
builderSchema.methods.findTeamMemberByEmail = function (email) {
  const builder = this;
  return builder.teamMembers.find(member => member.email === email.toLowerCase());
};

/**
 * Check if team member email is already taken
 * @param {string} email - Team member email
 * @param {string} [excludeMemberId] - Exclude this member ID
 * @returns {boolean}
 */
builderSchema.methods.isTeamMemberEmailTaken = function (email, excludeMemberId) {
  const builder = this;
  return builder.teamMembers.some(member => 
    member.email === email.toLowerCase() && 
    member._id.toString() !== excludeMemberId
  );
};

/**
 * Update team member
 * @param {string} memberId - Team member ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Builder>}
 */
builderSchema.methods.updateTeamMember = async function (memberId, updateData) {
  const builder = this;
  const member = builder.teamMembers.id(memberId);
  
  if (!member) {
    throw new Error('Team member not found');
  }
  
  // Hash password if being updated
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 8);
  }
  
  Object.assign(member, updateData);
  return builder.save();
};

/**
 * Remove team member
 * @param {string} memberId - Team member ID
 * @returns {Promise<Builder>}
 */
builderSchema.methods.removeTeamMember = function (memberId) {
  const builder = this;
  builder.teamMembers.pull(memberId);
  return builder.save();
};

/**
 * Check if team member has permission
 * @param {string} memberId - Team member ID
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
builderSchema.methods.teamMemberHasPermission = function (memberId, permission) {
  const builder = this;
  const member = builder.teamMembers.id(memberId);
  
  if (!member || !member.navigationPermissions) {
    return false;
  }
  
  return member.navigationPermissions[permission] === true;
};

// Hash password before saving
builderSchema.pre('save', async function (next) {
  const builder = this;
  
  // Hash main builder password
  if (builder.isModified('password')) {
    builder.password = await bcrypt.hash(builder.password, 8);
  }
  
  // Hash team member passwords
  if (builder.isModified('teamMembers')) {
    for (const member of builder.teamMembers) {
      if (member.isModified && member.isModified('password')) {
        member.password = await bcrypt.hash(member.password, 8);
      }
    }
  }
  
  // Validate status transitions
  if (builder.isModified('status')) {
    const validTransitions = {
      'draft': ['submitted'],
      'submitted': ['approved', 'rejected'],
      'approved': [], // No transitions from approved
      'rejected': ['draft'] // Can reset to draft for resubmission
    };
    
    const currentStatus = builder.status;
    const previousStatus = builder.isNew ? 'draft' : this._doc.status;
    
    if (previousStatus !== currentStatus) {
      const allowedTransitions = validTransitions[previousStatus] || [];
      if (!allowedTransitions.includes(currentStatus)) {
        return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
      }
    }
  }
  
  next();
});

/**
 * @typedef Builder
 */
const Builder = mongoose.model('Builder', builderSchema);

export default Builder;
