import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createPropertyView,
  getPropertyViewsByUser,
  getPropertyViewStats,
  getMostViewedProperties,
} from '../services/propertyView.service.js';
import PropertyView from '../models/propertyView.model.js';

/**
 * Track property view
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<PropertyView>}
 */
const trackPropertyView = catchAsync(async (req, res) => {
  // Set user from authenticated user (works for both user and builder)
  req.body.user = req.user._id || req.user.id;
  
  const propertyView = await createPropertyView(req.body);
  
  // Create notifications for both builder/agent and user (only for new views, not repeat views)
  try {
    const { createPropertyNotifications, createSystemNotifications } = await import('../services/notification.service.js');
    const Property = (await import('../models/property.model.js')).default;
    const property = await Property.findById(req.body.property)
      .populate('builder', 'name email phone')
      .populate('agent', 'name email contactNumber');
    
    if (property && (property.builder || property.agent)) {
      // Check if this is a new view (not a repeat view from the same user)
      const userId = req.user._id || req.user.id;
      const existingView = await PropertyView.findOne({
        user: userId,
        property: req.body.property,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (!existingView) {
        // Notification for builder or agent
        const recipientId = property.builder?._id || property.agent?._id;
        const recipientType = property.builder ? 'builder' : 'agent';
        await createPropertyNotifications({
          property,
          action: 'property_viewed',
          userId: userId,
          builderId: property.builder?._id,
          agentId: property.agent?._id,
          recipientType,
          recipientId
        });
        
        // Notification for user/builder/agent
        await createSystemNotifications({
          title: 'Property Viewed',
          description: `You have viewed "${property.name}"`,
          recipientType: req.user.role === 'builder' ? 'builder' : req.user.role === 'agent' ? 'agent' : 'user',
          recipientId: userId,
          notificationType: 'property_viewed',
          priority: 'low',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.name }
        });
      }
    }
  } catch (error) {
    console.error('Failed to create property view notifications:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }
  
  res.status(httpStatus.CREATED).send(propertyView);
});

/**
 * Get property views by user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getUserPropertyViews = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await getPropertyViewsByUser(req.params.userId, options);
  res.send(result);
});

/**
 * Get my property views (authenticated user's views)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getMyPropertyViews = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const userId = req.user._id || req.user.id;
  const result = await getPropertyViewsByUser(userId, options);
  res.send(result);
});

/**
 * Get property view statistics for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getMyPropertyViewStats = catchAsync(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const stats = await getPropertyViewStats(userId);
  res.send(stats);
});

/**
 * Get most viewed properties for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getMyMostViewedProperties = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit']);
  const userId = req.user._id || req.user.id;
  const result = await getMostViewedProperties(userId, options);
  res.send(result);
});

export {
  trackPropertyView,
  getUserPropertyViews,
  getMyPropertyViews,
  getMyPropertyViewStats,
  getMyMostViewedProperties,
};
