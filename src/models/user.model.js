import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
// import { toJSON, paginate } from './plugins.js';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
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
    contactNumber: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
          throw new Error('Invalid phone number format');
        }
      },
    },
    cityofInterest: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ['registered', 'guest'],
      default: 'registered',
    },
    preferences: {
      propertyTypes: [String],
      budgetRange: {
        min: Number,
        max: Number,
      },
      locations: [String],
    },
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Profile image
    image: {
      type: String,
      required: false,
      trim: true,
    },
    // Profile image S3 key (for deletion)
    imageKey: {
      type: String,
      required: false,
      trim: true,
    },
    // Registration status tracking
    registrationStatus: {
      type: String,
      enum: ['partial', 'otp_verified', 'completed'],
      default: 'partial',
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
    // User permissions
    permissions: {
      newProperties: {
        type: Boolean,
        default: true,
      },
      visitConfirmation: {
        type: Boolean,
        default: true,
      },
      visitReminder: {
        type: Boolean,
        default: true,
      },
      releaseMessages: {
        type: Boolean,
        default: true,
      },
    },
    // Shortlisted properties
    shortlistProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    // Agent-specific fields
    reraNumber: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    agencyName: {
      type: String,
      required: false,
      trim: true,
    },
    reraCertificate: {
      type: String,
      required: false,
      trim: true,
    },
    reraCertificateKey: {
      type: String,
      required: false,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Check if OTP is valid and not expired
 * @param {string} otpCode
 * @returns {boolean}
 */
userSchema.methods.isOtpValid = function (otpCode) {
  const user = this;
  return user.otpCode === otpCode && user.otpExpiry && user.otpExpiry > new Date();
};

/**
 * Check if user registration is complete
 * @returns {boolean}
 */
userSchema.methods.isRegistrationComplete = function () {
  const user = this;
  return user.registrationStatus === 'completed' && user.name && user.contactNumber && user.cityofInterest;
};

/**
 * Check if user needs to complete registration details
 * @returns {boolean}
 */
userSchema.methods.needsToCompleteRegistration = function () {
  const user = this;
  return user.registrationStatus === 'otp_verified' && (!user.name || !user.contactNumber || !user.cityofInterest);
};

/**
 * Add property to shortlist
 * @param {string} propertyId - Property ID to add to shortlist
 * @returns {Promise<User>}
 */
userSchema.methods.addToShortlist = function (propertyId) {
  const user = this;
  if (!user.shortlistProperties.includes(propertyId)) {
    user.shortlistProperties.push(propertyId);
  }
  return user.save();
};

/**
 * Remove property from shortlist
 * @param {string} propertyId - Property ID to remove from shortlist
 * @returns {Promise<User>}
 */
userSchema.methods.removeFromShortlist = function (propertyId) {
  const user = this;
  user.shortlistProperties = user.shortlistProperties.filter((id) => id.toString() !== propertyId.toString());
  return user.save();
};

/**
 * Check if property is in shortlist
 * @param {string} propertyId - Property ID to check
 * @returns {boolean}
 */
userSchema.methods.isPropertyShortlisted = function (propertyId) {
  const user = this;
  return user.shortlistProperties.some((id) => id.toString() === propertyId.toString());
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  // Update registration status based on completed fields
  if (user.isModified(['name', 'contactNumber', 'cityofInterest', 'isOtpVerified'])) {
    if (user.isOtpVerified && user.name && user.contactNumber && user.cityofInterest) {
      user.registrationStatus = 'completed';
    } else if (user.isOtpVerified) {
      user.registrationStatus = 'otp_verified';
    }
  }

  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

export default User;
