import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import commentService from '../services/comment.service.js';
import pick from '../utils/pick.js';

/**
 * Create a comment on property
 * @route POST /api/v1/properties/:propertyId/comments
 */
const createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(
    req.user._id,
    req.params.propertyId,
    req.body.text
  );
  
  // Create notifications for both builder and user
  try {
    const { createSystemNotifications } = await import('../services/notification.service.js');
    const Property = (await import('../models/property.model.js')).default;
    const property = await Property.findById(req.params.propertyId).populate('builder');
    
    if (property && property.builder) {
      // Notification for builder
      await createSystemNotifications({
        title: 'New Comment on Property',
        description: `A user commented on your property "${property.title}": "${req.body.text.substring(0, 100)}${req.body.text.length > 100 ? '...' : ''}"`,
        recipientType: 'builder',
        recipientId: property.builder._id,
        notificationType: 'user_inquiry',
        priority: 'medium',
        actionData: {
          type: 'view_document',
          url: `/properties/${property._id}`,
          metadata: { propertyId: property._id, commentId: comment._id }
        },
        senderType: 'user',
        senderId: req.user._id,
        metadata: { propertyId: property._id, commentId: comment._id, propertyTitle: property.title }
      });
      
      // Notification for user
      await createSystemNotifications({
        title: 'Comment Posted Successfully',
        description: `Your comment on "${property.title}" has been posted successfully`,
        recipientType: 'user',
        recipientId: req.user._id,
        notificationType: 'system_announcement',
        priority: 'low',
        actionData: {
          type: 'view_document',
          url: `/properties/${property._id}`,
          metadata: { propertyId: property._id, commentId: comment._id }
        },
        metadata: { propertyId: property._id, commentId: comment._id, propertyTitle: property.title }
      });
    }
  } catch (error) {
    console.error('Failed to create comment notifications:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }
  
  res.status(httpStatus.CREATED).send(comment);
});

/**
 * Get all comments for a property
 * @route GET /api/v1/properties/:propertyId/comments
 */
const getPropertyComments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await commentService.getPropertyComments(req.params.propertyId, options);
  res.status(httpStatus.OK).send(result);
});

/**
 * Update a comment
 * @route PATCH /api/v1/comments/:commentId
 */
const updateComment = catchAsync(async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.commentId,
    req.user._id,
    req.body.text
  );
  res.status(httpStatus.OK).send(comment);
});

/**
 * Delete a comment
 * @route DELETE /api/v1/comments/:commentId
 */
const deleteComment = catchAsync(async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get all comments on builder's properties (for builder to see)
 * @route GET /api/v1/builder/comments
 */
const getBuilderComments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await commentService.getBuilderPropertyComments(req.user._id, options);
  res.status(httpStatus.OK).send(result);
});

export default {
  createComment,
  getPropertyComments,
  updateComment,
  deleteComment,
  getBuilderComments,
};

