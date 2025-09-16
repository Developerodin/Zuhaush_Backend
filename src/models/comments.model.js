import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const commentsSchema = mongoose.Schema(
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
    
    // Comment text
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    
    // Status of the comment
    status: {
      type: String,
      enum: ['active', 'inactive', 'flagged', 'deleted'],
      default: 'active',
    },
    
    // Whether the comment is flagged for review
    flagged: {
      type: Boolean,
      default: false,
    },
    
    // Flag reason if flagged
    flagReason: {
      type: String,
      required: false,
      trim: true,
    },
    
    // Parent comment for replies
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: false,
    },
    
    // Reply count
    replyCount: {
      type: Number,
      default: 0,
    },
    
    // Like count for this comment
    likeCount: {
      type: Number,
      default: 0,
    },
    
    // Dislike count for this comment
    dislikeCount: {
      type: Number,
      default: 0,
    },
    
    
    
    // Comment metadata
    metadata: {
      ipAddress: {
        type: String,
        required: false,
        trim: true,
      },
      userAgent: {
        type: String,
        required: false,
        trim: true,
      },
      isEdited: {
        type: Boolean,
        default: false,
      },
      editedAt: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
commentsSchema.plugin(toJSON);
commentsSchema.plugin(paginate);

// Indexes for better query performance
commentsSchema.index({ property: 1, status: 1 });
commentsSchema.index({ user: 1, status: 1 });
commentsSchema.index({ parentComment: 1 });
commentsSchema.index({ flagged: 1, status: 1 });
commentsSchema.index({ createdAt: -1 });

/**
 * Check if comment is active
 * @returns {boolean}
 */
commentsSchema.methods.isActive = function () {
  const comment = this;
  return comment.status === 'active';
};

/**
 * Check if comment is flagged
 * @returns {boolean}
 */
commentsSchema.methods.isFlagged = function () {
  const comment = this;
  return comment.flagged === true;
};

/**
 * Check if comment is a reply
 * @returns {boolean}
 */
commentsSchema.methods.isReply = function () {
  const comment = this;
  return !!comment.parentComment;
};

/**
 * Flag the comment
 * @param {string} reason - Reason for flagging
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.flag = function (reason) {
  const comment = this;
  comment.flagged = true;
  comment.flagReason = reason;
  comment.status = 'flagged';
  return comment.save();
};

/**
 * Unflag the comment
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.unflag = function () {
  const comment = this;
  comment.flagged = false;
  comment.flagReason = undefined;
  comment.status = 'active';
  return comment.save();
};

/**
 * Soft delete the comment
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.softDelete = function () {
  const comment = this;
  comment.status = 'deleted';
  return comment.save();
};

/**
 * Restore deleted comment
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.restore = function () {
  const comment = this;
  comment.status = 'active';
  return comment.save();
};

/**
 * Increment like count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.incrementLikes = function () {
  const comment = this;
  comment.likeCount += 1;
  return comment.save();
};

/**
 * Decrement like count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.decrementLikes = function () {
  const comment = this;
  comment.likeCount = Math.max(0, comment.likeCount - 1);
  return comment.save();
};

/**
 * Increment dislike count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.incrementDislikes = function () {
  const comment = this;
  comment.dislikeCount += 1;
  return comment.save();
};

/**
 * Decrement dislike count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.decrementDislikes = function () {
  const comment = this;
  comment.dislikeCount = Math.max(0, comment.dislikeCount - 1);
  return comment.save();
};

/**
 * Increment reply count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.incrementReplies = function () {
  const comment = this;
  comment.replyCount += 1;
  return comment.save();
};

/**
 * Decrement reply count
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.decrementReplies = function () {
  const comment = this;
  comment.replyCount = Math.max(0, comment.replyCount - 1);
  return comment.save();
};

/**
 * Update social media engagement
 * @param {Object} socialData - Social media engagement data
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.updateSocialEngagement = function (socialData) {
  const comment = this;
  
  if (socialData.facebook) {
    if (socialData.facebook.likes !== undefined) comment.socialEngagement.facebook.likes = socialData.facebook.likes;
    if (socialData.facebook.shares !== undefined) comment.socialEngagement.facebook.shares = socialData.facebook.shares;
  }
  
  if (socialData.twitter) {
    if (socialData.twitter.likes !== undefined) comment.socialEngagement.twitter.likes = socialData.twitter.likes;
    if (socialData.twitter.retweets !== undefined) comment.socialEngagement.twitter.retweets = socialData.twitter.retweets;
  }
  
  if (socialData.linkedin) {
    if (socialData.linkedin.likes !== undefined) comment.socialEngagement.linkedin.likes = socialData.linkedin.likes;
    if (socialData.linkedin.shares !== undefined) comment.socialEngagement.linkedin.shares = socialData.linkedin.shares;
  }
  
  if (socialData.instagram) {
    if (socialData.instagram.likes !== undefined) comment.socialEngagement.instagram.likes = socialData.instagram.likes;
  }
  
  return comment.save();
};

/**
 * Get total social engagement count
 * @returns {number}
 */
commentsSchema.methods.getTotalSocialEngagement = function () {
  const comment = this;
  const social = comment.socialEngagement;
  return social.facebook.likes + social.facebook.shares +
         social.twitter.likes + social.twitter.retweets +
         social.linkedin.likes + social.linkedin.shares +
         social.instagram.likes;
};

/**
 * Mark comment as edited
 * @returns {Promise<Comment>}
 */
commentsSchema.methods.markAsEdited = function () {
  const comment = this;
  comment.metadata.isEdited = true;
  comment.metadata.editedAt = new Date();
  return comment.save();
};

// Update reply count when a reply is added
commentsSchema.post('save', async function (doc) {
  if (doc.parentComment) {
    await this.constructor.findByIdAndUpdate(
      doc.parentComment,
      { $inc: { replyCount: 1 } }
    );
  }
});

// Update reply count when a reply is deleted
commentsSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.parentComment) {
    await this.model.findByIdAndUpdate(
      doc.parentComment,
      { $inc: { replyCount: -1 } }
    );
  }
});

/**
 * @typedef Comment
 */
const Comment = mongoose.model('Comment', commentsSchema);

export default Comment;
