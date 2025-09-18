import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const propertySchema = mongoose.Schema(
  {
    // Builder reference
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      required: true,
    },
    
    // Basic property information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['apartment', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'other'],
    },
    bhk: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!/^\d+\.?\d*\s*(BHK|RK|Studio)$/i.test(value)) {
          throw new Error('Invalid BHK format. Use format like "2BHK", "3.5BHK", "1RK", "Studio"');
        }
      },
    },
    area: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
        enum: ['sqft', 'sqm', 'acre', 'hectare'],
        default: 'sqft',
      },
    },
    price: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
        enum: ['lakh', 'crore', 'rupees'],
        default: 'lakh',
      },
    },
    
    // Location information
    city: {
      type: String,
      required: true,
      trim: true,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
    },
    geo: {
      latitude: {
        type: Number,
        required: false,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: false,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        required: false,
        trim: true,
      },
    },
    
    // Media files
    media: [{
      type: {
        type: String,
        required: true,
        enum: ['image', 'video', 'document', 'floor_plan', 'brochure'],
      },
      url: {
        type: String,
        required: true,
        trim: true,
      },
      urlKey: {
        type: String,
        required: false,
        trim: true,
      },
      caption: {
        type: String,
        required: false,
        trim: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Amenities
    amenities: [{
      category: {
        type: String,
        required: true,
        enum: ['basic', 'lifestyle', 'security', 'parking', 'maintenance', 'other'],
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: false,
        trim: true,
      },
    }],
    
    // Property status
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'rented', 'inactive', 'archived'],
      default: 'draft',
    },
    
    // Admin approval
    adminApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
    
    // SEO information
    seo: {
      title: {
        type: String,
        required: false,
        trim: true,
        maxlength: 60,
      },
      description: {
        type: String,
        required: false,
        trim: true,
        maxlength: 160,
      },
      keywords: [{
        type: String,
        trim: true,
      }],
      slug: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        lowercase: true,
      },
    },
    
    // Property flags
    flags: [{
      type: String,
      enum: ['featured', 'new_launch', 'premium', 'best_seller', 'limited_offer', 'verified', 'trending'],
    }],
    
    // Quality score (0-100)
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    
    // Additional details
    description: {
      type: String,
      required: false,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
      required: false,
    },
    
    // Availability
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      availableFrom: {
        type: Date,
        required: false,
      },
      possessionDate: {
        type: Date,
        required: false,
      },
    },
    
    // Contact information
    contact: {
      phone: {
        type: String,
        required: false,
        trim: true,
      },
      email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
      },
      whatsapp: {
        type: String,
        required: false,
        trim: true,
      },
    },
    
    // View and interaction tracking
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
propertySchema.plugin(toJSON);
propertySchema.plugin(paginate);

// Indexes for better query performance
propertySchema.index({ builder: 1, status: 1 });
propertySchema.index({ city: 1, locality: 1 });
propertySchema.index({ 'geo.latitude': 1, 'geo.longitude': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1, bhk: 1 });
propertySchema.index({ 'seo.slug': 1 });

/**
 * Check if property is active
 * @returns {boolean}
 */
propertySchema.methods.isActive = function () {
  const property = this;
  return property.status === 'active';
};

/**
 * Check if property is available
 * @returns {boolean}
 */
propertySchema.methods.isAvailable = function () {
  const property = this;
  return property.availability.isAvailable && property.status === 'active';
};

/**
 * Check if property is admin approved
 * @returns {boolean}
 */
propertySchema.methods.isAdminApproved = function () {
  const property = this;
  return property.adminApproved === true;
};

/**
 * Approve property by admin
 * @param {string} adminId - Admin ID who approved
 * @returns {Promise<Property>}
 */
propertySchema.methods.approveByAdmin = function (adminId) {
  const property = this;
  property.adminApproved = true;
  property.approvedBy = adminId;
  return property.save();
};

/**
 * Revoke admin approval
 * @returns {Promise<Property>}
 */
propertySchema.methods.revokeAdminApproval = function () {
  const property = this;
  property.adminApproved = false;
  property.approvedBy = undefined;
  return property.save();
};

/**
 * Check if property has specific flag
 * @param {string} flag - Flag to check
 * @returns {boolean}
 */
propertySchema.methods.hasFlag = function (flag) {
  const property = this;
  return property.flags.includes(flag);
};

/**
 * Add flag to property
 * @param {string} flag - Flag to add
 * @returns {Promise<Property>}
 */
propertySchema.methods.addFlag = function (flag) {
  const property = this;
  if (!property.flags.includes(flag)) {
    property.flags.push(flag);
  }
  return property.save();
};

/**
 * Remove flag from property
 * @param {string} flag - Flag to remove
 * @returns {Promise<Property>}
 */
propertySchema.methods.removeFlag = function (flag) {
  const property = this;
  property.flags = property.flags.filter(f => f !== flag);
  return property.save();
};

/**
 * Increment view count
 * @returns {Promise<Property>}
 */
propertySchema.methods.incrementViews = function () {
  const property = this;
  property.views += 1;
  return property.save();
};

/**
 * Increment like count
 * @returns {Promise<Property>}
 */
propertySchema.methods.incrementLikes = function () {
  const property = this;
  property.likes += 1;
  return property.save();
};

/**
 * Increment inquiry count
 * @returns {Promise<Property>}
 */
propertySchema.methods.incrementInquiries = function () {
  const property = this;
  property.inquiries += 1;
  return property.save();
};

/**
 * Generate SEO slug from property name
 * @returns {string}
 */
propertySchema.methods.generateSlug = function () {
  const property = this;
  return property.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Generate slug before saving
propertySchema.pre('save', function (next) {
  const property = this;
  
  // Generate slug if not provided
  if (!property.seo.slug && property.name) {
    property.seo.slug = property.generateSlug();
  }
  
  next();
});

/**
 * @typedef Property
 */
const Property = mongoose.model('Property', propertySchema);

export default Property;
