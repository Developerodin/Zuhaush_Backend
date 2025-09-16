import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { getFileUrl } from '../middlewares/upload.js';
import {
  createProperty,
  queryProperties,
  getPropertyById,
  getPropertyBySlug,
  updatePropertyById,
  deletePropertyById,
  addMediaToProperty,
  updateMediaInProperty,
  removeMediaFromProperty,
  approveProperty,
  rejectProperty,
  addFlagToProperty,
  removeFlagFromProperty,
  incrementPropertyViews,
  incrementPropertyInquiries,
  searchProperties,
  getNearbyProperties,
  getPropertiesByBuilder,
  getPropertyStats,
} from '../services/property.service.js';

/**
 * Create a property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const createPropertyHandler = catchAsync(async (req, res) => {
  const property = await createProperty(req.body);
  res.status(httpStatus.CREATED).send(property);
});

/**
 * Get properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getProperties = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['builder', 'type', 'city', 'locality', 'bhk', 'status', 'adminApproved', 'flags']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Add price and area filters
  if (req.query.minPrice || req.query.maxPrice) {
    filter['price.value'] = {};
    if (req.query.minPrice) filter['price.value'].$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter['price.value'].$lte = parseFloat(req.query.maxPrice);
  }
  
  if (req.query.minArea || req.query.maxArea) {
    filter['area.value'] = {};
    if (req.query.minArea) filter['area.value'].$gte = parseFloat(req.query.minArea);
    if (req.query.maxArea) filter['area.value'].$lte = parseFloat(req.query.maxArea);
  }

  const result = await queryProperties(filter, options);
  res.send(result);
});

/**
 * Get property by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const getProperty = catchAsync(async (req, res) => {
  const property = await getPropertyById(req.params.propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  res.send(property);
});

/**
 * Get property by slug
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const getPropertyBySlugHandler = catchAsync(async (req, res) => {
  const property = await getPropertyBySlug(req.params.slug);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  res.send(property);
});

/**
 * Update property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const updateProperty = catchAsync(async (req, res) => {
  const property = await updatePropertyById(req.params.propertyId, req.body);
  res.send(property);
});

/**
 * Delete property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>}
 */
const deleteProperty = catchAsync(async (req, res) => {
  await deletePropertyById(req.params.propertyId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Add media to property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const addMedia = catchAsync(async (req, res) => {
  if (!req.file && !req.body.url) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File or URL is required');
  }

  const mediaData = {
    type: req.body.type,
    url: req.file ? getFileUrl(req, req.file.path) : req.body.url,
    caption: req.body.caption,
    isPrimary: req.body.isPrimary || false,
  };

  const property = await addMediaToProperty(req.params.propertyId, mediaData);
  res.status(httpStatus.CREATED).send(property);
});

/**
 * Update media in property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const updateMedia = catchAsync(async (req, res) => {
  const updateData = pick(req.body, ['caption', 'isPrimary']);
  const property = await updateMediaInProperty(req.params.propertyId, req.params.mediaId, updateData);
  res.send(property);
});

/**
 * Remove media from property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const removeMedia = catchAsync(async (req, res) => {
  const property = await removeMediaFromProperty(req.params.propertyId, req.params.mediaId);
  res.send(property);
});

/**
 * Approve property (Admin only)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const approvePropertyHandler = catchAsync(async (req, res) => {
  const property = await approveProperty(req.params.propertyId, req.user.id);
  res.send(property);
});

/**
 * Reject property (Admin only)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const rejectPropertyHandler = catchAsync(async (req, res) => {
  const property = await rejectProperty(req.params.propertyId, req.user.id, req.body.reason);
  res.send(property);
});

/**
 * Add flag to property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const addFlag = catchAsync(async (req, res) => {
  const property = await addFlagToProperty(req.params.propertyId, req.body.flag);
  res.send(property);
});

/**
 * Remove flag from property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const removeFlag = catchAsync(async (req, res) => {
  const property = await removeFlagFromProperty(req.params.propertyId, req.body.flag);
  res.send(property);
});

/**
 * Increment property views
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const incrementViews = catchAsync(async (req, res) => {
  const property = await incrementPropertyViews(req.params.propertyId);
  res.send(property);
});

/**
 * Increment property inquiries
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property>}
 */
const incrementInquiries = catchAsync(async (req, res) => {
  const property = await incrementPropertyInquiries(req.params.propertyId);
  res.send(property);
});

/**
 * Search properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const searchPropertiesHandler = catchAsync(async (req, res) => {
  const result = await searchProperties(req.query);
  res.send(result);
});

/**
 * Get nearby properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Property[]>}
 */
const getNearbyPropertiesHandler = catchAsync(async (req, res) => {
  const { radius = 5, limit = 10 } = req.query;
  const properties = await getNearbyProperties(req.params.propertyId, parseFloat(radius), parseInt(limit));
  res.send(properties);
});

/**
 * Get properties by builder
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getPropertiesByBuilderHandler = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await getPropertiesByBuilder(req.params.builderId, options);
  res.send(result);
});

/**
 * Get property statistics
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getPropertyStatsHandler = catchAsync(async (req, res) => {
  const stats = await getPropertyStats(req.params.builderId);
  res.send(stats);
});

/**
 * Get featured properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getFeaturedProperties = catchAsync(async (req, res) => {
  const filter = { 
    status: 'active', 
    adminApproved: true, 
    flags: 'featured' 
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await queryProperties(filter, options);
  res.send(result);
});

/**
 * Get trending properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getTrendingProperties = catchAsync(async (req, res) => {
  const filter = { 
    status: 'active', 
    adminApproved: true, 
    flags: 'trending' 
  };
  const options = { 
    sortBy: 'views', 
    sortOrder: 'desc',
    ...pick(req.query, ['limit', 'page']) 
  };
  const result = await queryProperties(filter, options);
  res.send(result);
});

/**
 * Get new launch properties
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getNewLaunchProperties = catchAsync(async (req, res) => {
  const filter = { 
    status: 'active', 
    adminApproved: true, 
    flags: 'new_launch' 
  };
  const options = { 
    sortBy: 'createdAt', 
    sortOrder: 'desc',
    ...pick(req.query, ['limit', 'page']) 
  };
  const result = await queryProperties(filter, options);
  res.send(result);
});

/**
 * Get properties by type
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getPropertiesByType = catchAsync(async (req, res) => {
  const filter = { 
    type: req.params.type,
    status: 'active', 
    adminApproved: true 
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await queryProperties(filter, options);
  res.send(result);
});

/**
 * Get properties by city
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getPropertiesByCity = catchAsync(async (req, res) => {
  const filter = { 
    city: { $regex: req.params.city, $options: 'i' },
    status: 'active', 
    adminApproved: true 
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await queryProperties(filter, options);
  res.send(result);
});

export {
  createPropertyHandler,
  getProperties,
  getProperty,
  getPropertyBySlugHandler,
  updateProperty,
  deleteProperty,
  addMedia,
  updateMedia,
  removeMedia,
  approvePropertyHandler,
  rejectPropertyHandler,
  addFlag,
  removeFlag,
  incrementViews,
  incrementInquiries,
  searchPropertiesHandler,
  getNearbyPropertiesHandler,
  getPropertiesByBuilderHandler,
  getPropertyStatsHandler,
  getFeaturedProperties,
  getTrendingProperties,
  getNewLaunchProperties,
  getPropertiesByType,
  getPropertiesByCity,
};
