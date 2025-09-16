import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const likesSchema = mongoose.Schema(
  {
    // Property reference
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Like type (like or dislike)
    type: {
      type: String,
      enum: ['like', 'dislike'],
      required: true,
    },
    
    // Status of the like
    status: {
      type: String,
      enum: ['active', 'inactive', 'flagged'],
      default: 'active',
    },
    

  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
likesSchema.plugin(toJSON);
likesSchema.plugin(paginate);

// Compound index to ensure one like per user per property
likesSchema.index({ property: 1, user: 1 }, { unique: true });

// Indexes for better query performance
likesSchema.index({ property: 1, type: 1 });
likesSchema.index({ user: 1, status: 1 });
likesSchema.index({ flagged: 1, status: 1 });

/**
 * Check if like is active
 * @returns {boolean}
 */
likesSchema.methods.isActive = function () {
  const like = this;
  return like.status === 'active';
};

/**
 * Check if like is flagged
 * @returns {boolean}
 */
likesSchema.methods.isFlagged = function () {
  const like = this;
  return like.flagged === true;
};

/**
 * Flag the like
 * @param {string} reason - Reason for flagging
 * @returns {Promise<Like>}
 */
likesSchema.methods.flag = function (reason) {
  const like = this;
  like.flagged = true;
  like.flagReason = reason;
  like.status = 'flagged';
  return like.save();
};

/**
 * Unflag the like
 * @returns {Promise<Like>}
 */
likesSchema.methods.unflag = function () {
  const like = this;
  like.flagged = false;
  like.flagReason = undefined;
  like.status = 'active';
  return like.save();
};

/**
 * Deactivate the like
 * @returns {Promise<Like>}
 */
likesSchema.methods.deactivate = function () {
  const like = this;
  like.status = 'inactive';
  return like.save();
};

/**
 * Update social media likes
 * @param {Object} socialData - Social media like counts
 * @returns {Promise<Like>}
 */
likesSchema.methods.updateSocialLikes = function (socialData) {
  const like = this;
  if (socialData.facebook !== undefined) like.socialLikes.facebook = socialData.facebook;
  if (socialData.twitter !== undefined) like.socialLikes.twitter = socialData.twitter;
  if (socialData.linkedin !== undefined) like.socialLikes.linkedin = socialData.linkedin;
  if (socialData.instagram !== undefined) like.socialLikes.instagram = socialData.instagram;
  return like.save();
};

/**
 * Get total social likes count
 * @returns {number}
 */
likesSchema.methods.getTotalSocialLikes = function () {
  const like = this;
  return like.socialLikes.facebook + 
         like.socialLikes.twitter + 
         like.socialLikes.linkedin + 
         like.socialLikes.instagram;
};

/**
 * @typedef Like
 */
const Like = mongoose.model('Like', likesSchema);

export default Like;
