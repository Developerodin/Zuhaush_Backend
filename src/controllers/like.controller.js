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

