import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createPropertyView,
  getPropertyViewsByUser,
  getPropertyViewStats,
  getMostViewedProperties,
} from '../services/propertyView.service.js';

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
