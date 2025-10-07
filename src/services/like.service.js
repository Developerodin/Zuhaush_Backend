import httpStatus from 'http-status';
import Like from '../models/likes.model.js';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Toggle like on a property
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<Object>}
 */
const toggleLike = async (userId, propertyId) => {
  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Check if user already liked this property
  const existingLike = await Like.findOne({
    user: userId,
    property: propertyId,
  });

  if (existingLike) {
    // Unlike - remove the like
    await Like.deleteOne({ _id: existingLike._id });
    
    // Decrement property likes count
    property.likes = Math.max(0, property.likes - 1);
    await property.save();
    
    return {
      liked: false,
      message: 'Property unliked successfully',
      likeCount: property.likes,
    };
  } else {
    // Like - create new like
    await Like.create({
      user: userId,
      property: propertyId,
      type: 'like',
      status: 'active',
    });
    
    // Increment property likes count
    property.likes += 1;
    await property.save();
    
    return {
      liked: true,
      message: 'Property liked successfully',
      likeCount: property.likes,
    };
  }
};

/**
 * Check if user has liked a property
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<Object>}
 */
const checkLikeStatus = async (userId, propertyId) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const like = await Like.findOne({
    user: userId,
    property: propertyId,
  });

  return {
    liked: !!like,
    likeCount: property.likes,
  };
};

/**
 * Get all likes for a property
 * @param {string} propertyId
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getPropertyLikes = async (propertyId, options) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const likes = await Like.paginate(
    { property: propertyId, status: 'active' },
    { ...options, populate: 'user', sortBy: options.sortBy || 'createdAt:desc' }
  );

  // Manually select fields from populated user
  likes.results = likes.results.map(like => {
    const likeObj = like.toObject();
    if (likeObj.user) {
      likeObj.user = {
        id: likeObj.user.id,
        name: likeObj.user.name,
        email: likeObj.user.email,
      };
    }
    return likeObj;
  });

  return likes;
};

export default {
  toggleLike,
  checkLikeStatus,
  getPropertyLikes,
};

