import { Property, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

/**
 * Create a property
 * @param {Object} propertyBody
 * @returns {Promise<Property>}
 */
const createProperty = async (propertyBody) => {
  return Property.create(propertyBody);
};

/**
 * Query for properties
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProperties = async (filter, options) => {
  const properties = await Property.paginate(filter, options);
  return properties;
};

/**
 * Get property by id
 * @param {ObjectId} id
 * @returns {Promise<Property>}
 */
const getPropertyById = async (id) => {
  return Property.findById(id).populate('builder', 'name email phone').populate('approvedBy', 'name email');
};

/**
 * Get property by slug
 * @param {string} slug
 * @returns {Promise<Property>}
 */
const getPropertyBySlug = async (slug) => {
  return Property.findOne({ 'seo.slug': slug }).populate('builder', 'name email phone').populate('approvedBy', 'name email');
};

/**
 * Update property by id
 * @param {ObjectId} propertyId
 * @param {Object} updateBody
 * @returns {Promise<Property>}
 */
const updatePropertyById = async (propertyId, updateBody) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  Object.assign(property, updateBody);
  await property.save();
  return property;
};

/**
 * Delete property by id
 * @param {ObjectId} propertyId
 * @returns {Promise<Property>}
 */
const deletePropertyById = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  await property.remove();
  return property;
};

/**
 * Add media to property
 * @param {ObjectId} propertyId
 * @param {Object} mediaData
 * @returns {Promise<Property>}
 */
const addMediaToProperty = async (propertyId, mediaData) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // If this is set as primary, remove primary from other media
  if (mediaData.isPrimary) {
    property.media.forEach(media => {
      media.isPrimary = false;
    });
  }

  property.media.push(mediaData);
  await property.save();
  return property;
};

/**
 * Update media in property
 * @param {ObjectId} propertyId
 * @param {string} mediaId
 * @param {Object} updateData
 * @returns {Promise<Property>}
 */
const updateMediaInProperty = async (propertyId, mediaId, updateData) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const media = property.media.id(mediaId);
  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
  }

  // If setting as primary, remove primary from other media
  if (updateData.isPrimary) {
    property.media.forEach(m => {
      if (m._id.toString() !== mediaId) {
        m.isPrimary = false;
      }
    });
  }

  Object.assign(media, updateData);
  await property.save();
  return property;
};

/**
 * Remove media from property
 * @param {ObjectId} propertyId
 * @param {string} mediaId
 * @returns {Promise<Property>}
 */
const removeMediaFromProperty = async (propertyId, mediaId) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const media = property.media.id(mediaId);
  if (!media) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
  }

  property.media.pull(mediaId);
  await property.save();
  return property;
};

/**
 * Approve property by admin
 * @param {ObjectId} propertyId
 * @param {ObjectId} adminId
 * @returns {Promise<Property>}
 */
const approveProperty = async (propertyId, adminId) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return property.approveByAdmin(adminId);
};

/**
 * Reject property by admin
 * @param {ObjectId} propertyId
 * @param {ObjectId} adminId
 * @param {string} reason
 * @returns {Promise<Property>}
 */
const rejectProperty = async (propertyId, adminId, reason) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  property.adminApproved = false;
  property.approvedBy = undefined;
  property.status = 'inactive';
  property.rejectionReason = reason;
  property.rejectedBy = adminId;
  property.rejectedAt = new Date();

  await property.save();
  return property;
};

/**
 * Add flag to property
 * @param {ObjectId} propertyId
 * @param {string} flag
 * @returns {Promise<Property>}
 */
const addFlagToProperty = async (propertyId, flag) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return property.addFlag(flag);
};

/**
 * Remove flag from property
 * @param {ObjectId} propertyId
 * @param {string} flag
 * @returns {Promise<Property>}
 */
const removeFlagFromProperty = async (propertyId, flag) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return property.removeFlag(flag);
};

/**
 * Increment property views
 * @param {ObjectId} propertyId
 * @returns {Promise<Property>}
 */
const incrementPropertyViews = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return property.incrementViews();
};

/**
 * Increment property inquiries
 * @param {ObjectId} propertyId
 * @returns {Promise<Property>}
 */
const incrementPropertyInquiries = async (propertyId) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return property.incrementInquiries();
};

/**
 * Search properties with filters
 * @param {Object} searchParams
 * @returns {Promise<QueryResult>}
 */
const searchProperties = async (searchParams) => {
  const {
    q,
    city,
    locality,
    type,
    bhk,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    amenities,
    flags,
    sortBy = 'createdAt',
    limit = 20,
    page = 1,
  } = searchParams;

  const filter = { status: 'active', adminApproved: true };

  // Text search
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
      { locality: { $regex: q, $options: 'i' } },
    ];
  }

  // Location filters
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (locality) filter.locality = { $regex: locality, $options: 'i' };

  // Property type and BHK
  if (type) filter.type = type;
  if (bhk) filter.bhk = { $regex: bhk, $options: 'i' };

  // Price range
  if (minPrice || maxPrice) {
    filter['price.value'] = {};
    if (minPrice) filter['price.value'].$gte = minPrice;
    if (maxPrice) filter['price.value'].$lte = maxPrice;
  }

  // Area range
  if (minArea || maxArea) {
    filter['area.value'] = {};
    if (minArea) filter['area.value'].$gte = minArea;
    if (maxArea) filter['area.value'].$lte = maxArea;
  }

  // Amenities filter
  if (amenities) {
    const amenityList = amenities.split(',').map(a => a.trim());
    filter['amenities.name'] = { $in: amenityList };
  }

  // Flags filter
  if (flags) {
    const flagList = flags.split(',').map(f => f.trim());
    filter.flags = { $in: flagList };
  }

  // Sort options
  let sort = {};
  switch (sortBy) {
    case 'price_asc':
      sort = { 'price.value': 1 };
      break;
    case 'price_desc':
      sort = { 'price.value': -1 };
      break;
    case 'area_asc':
      sort = { 'area.value': 1 };
      break;
    case 'area_desc':
      sort = { 'area.value': -1 };
      break;
    case 'views_desc':
      sort = { views: -1 };
      break;
    case 'created_desc':
    default:
      sort = { createdAt: -1 };
      break;
  }

  const options = {
    sort,
    limit: parseInt(limit),
    page: parseInt(page),
    populate: 'builder',
  };

  return Property.paginate(filter, options);
};

/**
 * Get nearby properties
 * @param {ObjectId} propertyId
 * @param {number} radius
 * @param {number} limit
 * @returns {Promise<Property[]>}
 */
const getNearbyProperties = async (propertyId, radius = 5, limit = 10) => {
  const property = await getPropertyById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  if (!property.geo.latitude || !property.geo.longitude) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Property location not available');
  }

  // Using MongoDB geospatial query
  const nearbyProperties = await Property.find({
    _id: { $ne: propertyId },
    status: 'active',
    adminApproved: true,
    'geo.latitude': {
      $gte: property.geo.latitude - (radius / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: property.geo.latitude + (radius / 111),
    },
    'geo.longitude': {
      $gte: property.geo.longitude - (radius / (111 * Math.cos(property.geo.latitude * Math.PI / 180))),
      $lte: property.geo.longitude + (radius / (111 * Math.cos(property.geo.latitude * Math.PI / 180))),
    },
  })
    .populate('builder', 'name email phone')
    .limit(limit)
    .sort({ createdAt: -1 });

  return nearbyProperties;
};

/**
 * Get properties by builder
 * @param {ObjectId} builderId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getPropertiesByBuilder = async (builderId, options = {}) => {
  const filter = { builder: builderId };
  return Property.paginate(filter, options);
};

/**
 * Get property statistics
 * @param {ObjectId} builderId
 * @returns {Promise<Object>}
 */
const getPropertyStats = async (builderId) => {
  const stats = await Property.aggregate([
    { $match: { builder: new mongoose.Types.ObjectId(builderId) } },
    {
      $group: {
        _id: null,
        totalProperties: { $sum: 1 },
        activeProperties: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        soldProperties: {
          $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalInquiries: { $sum: '$inquiries' },
        avgPrice: { $avg: '$price.value' },
        avgArea: { $avg: '$area.value' },
      }
    }
  ]);

  return stats[0] || {
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    avgPrice: 0,
    avgArea: 0,
  };
};

/**
 * Add property to user's shortlist
 * @param {ObjectId} userId
 * @param {ObjectId} propertyId
 * @returns {Promise<User>}
 */
const addToShortlist = async (userId, propertyId) => {
  // Check if property exists
  const property = await Property.findById(propertyId).populate('builder');
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if property is already in shortlist
  if (user.isPropertyShortlisted(propertyId)) {
    throw new ApiError(httpStatus.CONFLICT, 'Property already in shortlist');
  }

  const updatedUser = await user.addToShortlist(propertyId);

  // Create notifications for both builder and user
  try {
    const { createPropertyNotifications, createSystemNotifications } = await import('./notification.service.js');
    
    // Notification for builder
    await createPropertyNotifications({
      property,
      action: 'property_shortlisted',
      userId,
      builderId: property.builder._id
    });
    
    // Notification for user
    await createSystemNotifications({
      title: 'Property Added to Shortlist',
      description: `You have successfully added "${property.title}" to your shortlist`,
      recipientType: 'user',
      recipientId: userId,
      notificationType: 'property_shortlisted',
      priority: 'medium',
      actionData: {
        type: 'visit_property',
        url: `/properties/${property._id}`,
        metadata: { propertyId: property._id }
      },
      metadata: { propertyId: property._id, propertyTitle: property.title }
    });
  } catch (error) {
    console.error('Failed to create shortlist notifications:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }

  return updatedUser;
};

/**
 * Remove property from user's shortlist
 * @param {ObjectId} userId
 * @param {ObjectId} propertyId
 * @returns {Promise<User>}
 */
const removeFromShortlist = async (userId, propertyId) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if property is in shortlist
  if (!user.isPropertyShortlisted(propertyId)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found in shortlist');
  }

  return user.removeFromShortlist(propertyId);
};

/**
 * Get user's shortlisted properties
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getShortlistedProperties = async (userId, options = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // For shortlist, show all properties regardless of status or admin approval
  // Users should be able to see their shortlisted properties even if they're draft or not approved
  const filter = {
    _id: { $in: user.shortlistProperties },
  };

  const defaultOptions = {
    sortBy: 'createdAt:desc',
    limit: 10,
    page: 1,
    populate: 'builder',
    ...options,
  };

  return Property.paginate(filter, defaultOptions);
};

/**
 * Check if property is in user's shortlist
 * @param {ObjectId} userId
 * @param {ObjectId} propertyId
 * @returns {Promise<boolean>}
 */
const checkShortlistStatus = async (userId, propertyId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.isPropertyShortlisted(propertyId);
};

export {
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
  addToShortlist,
  removeFromShortlist,
  getShortlistedProperties,
  checkShortlistStatus,
};
