import { PropertyView, Property, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Create a property view record
 * @param {Object} viewBody
 * @returns {Promise<PropertyView>}
 */
const createPropertyView = async (viewBody) => {
  // Check if property exists
  const property = await Property.findById(viewBody.property);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Check if user exists
  const user = await User.findById(viewBody.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return PropertyView.create(viewBody);
};

/**
 * Get all property views by user
 * @param {ObjectId} userId
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getPropertyViewsByUser = async (userId, options = {}) => {
  const filter = { user: userId };
  
  const defaultOptions = {
    sortBy: 'viewedAt:desc',
    limit: 10,
    page: 1,
    ...options
  };

  const views = await PropertyView.paginate(filter, defaultOptions);
  
  // Populate the results with property details
  const populatedViews = await PropertyView.populate(views.results, [
    { path: 'user', select: 'name email' },
    { path: 'property', select: 'name type city locality price area media builder status' },
  ]);
  
  return {
    ...views,
    results: populatedViews
  };
};

/**
 * Get property view statistics for a user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getPropertyViewStats = async (userId) => {
  const stats = await PropertyView.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueProperties: { $addToSet: '$property' },
        lastViewedAt: { $max: '$viewedAt' },
        firstViewedAt: { $min: '$viewedAt' },
      }
    },
    {
      $project: {
        totalViews: 1,
        uniquePropertyCount: { $size: '$uniqueProperties' },
        lastViewedAt: 1,
        firstViewedAt: 1,
      }
    }
  ]);

  return stats[0] || {
    totalViews: 0,
    uniquePropertyCount: 0,
    lastViewedAt: null,
    firstViewedAt: null,
  };
};

/**
 * Get most viewed properties by a user
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getMostViewedProperties = async (userId, options = {}) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  
  const mostViewed = await PropertyView.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$property',
        viewCount: { $sum: 1 },
        lastViewedAt: { $max: '$viewedAt' },
        firstViewedAt: { $min: '$viewedAt' },
      }
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: '_id',
        as: 'property'
      }
    },
    {
      $unwind: '$property'
    },
    {
      $project: {
        property: 1,
        viewCount: 1,
        lastViewedAt: 1,
        firstViewedAt: 1,
      }
    },
    {
      $sort: { viewCount: -1, lastViewedAt: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return {
    results: mostViewed,
    totalResults: mostViewed.length,
    page: 1,
    limit,
    totalPages: 1,
  };
};

export {
  createPropertyView,
  getPropertyViewsByUser,
  getPropertyViewStats,
  getMostViewedProperties,
};
