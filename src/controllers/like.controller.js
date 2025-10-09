import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import likeService from '../services/like.service.js';
import pick from '../utils/pick.js';

/**
 * Toggle like on property
 * @route POST /api/v1/properties/:propertyId/like
 */
const toggleLike = catchAsync(async (req, res) => {
  const result = await likeService.toggleLike(req.user._id, req.params.propertyId);
  
  // Create notifications for both builder and user when property is liked
  if (result.liked) {
    try {
      const { createPropertyNotifications, createSystemNotifications } = await import('../services/notification.service.js');
      const Property = (await import('../models/property.model.js')).default;
      const property = await Property.findById(req.params.propertyId).populate('builder');
      
      if (property && property.builder) {
        // Notification for builder
        await createPropertyNotifications({
          property,
          action: 'property_shortlisted', // Using shortlisted as it's similar to liking
          userId: req.user._id,
          builderId: property.builder._id
        });
        
        // Notification for user
        await createSystemNotifications({
          title: 'Property Liked Successfully',
          description: `You have successfully liked "${property.title}"`,
          recipientType: 'user',
          recipientId: req.user._id,
          notificationType: 'property_shortlisted',
          priority: 'low',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.title }
        });
      }
    } catch (error) {
      console.error('Failed to create property like notifications:', error);
      // Don't throw error - notification failure shouldn't break the main operation
    }
  }
  
  res.status(httpStatus.OK).send(result);
});

/**
 * Check like status
 * @route GET /api/v1/properties/:propertyId/like/status
 */
const checkLikeStatus = catchAsync(async (req, res) => {
  const result = await likeService.checkLikeStatus(req.user._id, req.params.propertyId);
  res.status(httpStatus.OK).send(result);
});

/**
 * Get all likes for a property
 * @route GET /api/v1/properties/:propertyId/likes
 */
const getPropertyLikes = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await likeService.getPropertyLikes(req.params.propertyId, options);
  res.status(httpStatus.OK).send(result);
});

export default {
  toggleLike,
  checkLikeStatus,
  getPropertyLikes,
};

