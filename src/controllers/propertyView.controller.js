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
  // Set user from authenticated user
  req.body.user = req.user.id;
  
  const propertyView = await createPropertyView(req.body);
  
  // Create notification for builder (only for new views, not repeat views)
  try {
    const { createPropertyNotifications } = await import('../services/notification.service.js');
    const Property = (await import('../models/property.model.js')).default;
    const property = await Property.findById(req.body.property).populate('builder');
    
    if (property && property.builder) {
      // Check if this is a new view (not a repeat view from the same user)
      const existingView = await PropertyView.findOne({
        user: req.user.id,
        property: req.body.property,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (!existingView) {
        await createPropertyNotifications({
          property,
          action: 'property_viewed',
          userId: req.user.id,
          builderId: property.builder._id
        });
      }
    }
  } catch (error) {
    console.error('Failed to create property view notification:', error);
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
  const result = await getPropertyViewsByUser(req.user.id, options);
  res.send(result);
});

/**
 * Get property view statistics for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getMyPropertyViewStats = catchAsync(async (req, res) => {
  const stats = await getPropertyViewStats(req.user.id);
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
  const result = await getMostViewedProperties(req.user.id, options);
  res.send(result);
});

export {
  trackPropertyView,
  getUserPropertyViews,
  getMyPropertyViews,
  getMyPropertyViewStats,
  getMyMostViewedProperties,
};
