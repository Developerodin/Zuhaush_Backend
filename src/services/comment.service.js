import httpStatus from 'http-status';
import Comment from '../models/comments.model.js';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a comment on a property
 * @param {string} userId
 * @param {string} propertyId
 * @param {string} text
 * @returns {Promise<Comment>}
 */
const createComment = async (userId, propertyId, text) => {
  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const comment = await Comment.create({
    user: userId,
    property: propertyId,
    text,
    status: 'active',
  });

  // Fetch the comment with populated user details
  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'name email')
    .select('-flagged -flagReason -replyCount -likeCount -dislikeCount -parentComment');

  return populatedComment;
};

/**
 * Get all comments for a property
 * @param {string} propertyId
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getPropertyComments = async (propertyId, options) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const comments = await Comment.paginate(
    { property: propertyId, status: 'active', parentComment: null },
    { 
      ...options, 
      populate: 'user',
      sortBy: options.sortBy || 'createdAt:desc',
    }
  );

  // Manually select fields from populated user
  comments.results = comments.results.map(comment => {
    const commentObj = comment.toObject();
    if (commentObj.user) {
      commentObj.user = {
        id: commentObj.user.id,
        name: commentObj.user.name,
        email: commentObj.user.email,
      };
    }
    // Remove internal fields
    delete commentObj.flagged;
    delete commentObj.flagReason;
    delete commentObj.parentComment;
    return commentObj;
  });

  return comments;
};

/**
 * Update a comment
 * @param {string} commentId
 * @param {string} userId
 * @param {string} text
 * @returns {Promise<Comment>}
 */
const updateComment = async (commentId, userId, text) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own comments');
  }

  comment.text = text;
  await comment.markAsEdited();

  // Fetch updated comment with populated user details
  const updatedComment = await Comment.findById(comment._id)
    .populate('user', 'name email')
    .select('-flagged -flagReason -replyCount -likeCount -dislikeCount -parentComment');

  return updatedComment;
};

/**
 * Delete a comment
 * @param {string} commentId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own comments');
  }

  await comment.softDelete();
};

/**
 * Get comments by builder (for builder to see all comments on their properties)
 * @param {string} builderId
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getBuilderPropertyComments = async (builderId, options) => {
  // Get all properties of this builder
  const properties = await Property.find({ builder: builderId }).select('_id');
  const propertyIds = properties.map(p => p._id);

  const comments = await Comment.paginate(
    { 
      property: { $in: propertyIds }, 
      status: 'active',
    },
    { 
      ...options, 
      populate: 'user,property',
      sortBy: options.sortBy || 'createdAt:desc',
    }
  );

  // Manually select fields from populated documents
  comments.results = comments.results.map(comment => {
    const commentObj = comment.toObject();
    if (commentObj.user) {
      commentObj.user = {
        id: commentObj.user.id,
        name: commentObj.user.name,
        email: commentObj.user.email,
      };
    }
    if (commentObj.property) {
      commentObj.property = {
        id: commentObj.property.id,
        name: commentObj.property.name,
      };
    }
    // Remove internal fields
    delete commentObj.flagged;
    delete commentObj.flagReason;
    delete commentObj.parentComment;
    return commentObj;
  });

  return comments;
};

export default {
  createComment,
  getPropertyComments,
  updateComment,
  deleteComment,
  getBuilderPropertyComments,
};

