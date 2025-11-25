import express from 'express';
import flexibleAuth from '../../middlewares/flexibleAuth.js';
import validate from '../../middlewares/validate.js';
import likeValidation from '../../validations/like.validation.js';
import likeController from '../../controllers/like.controller.js';

const router = express.Router();

// Toggle like on property (like/unlike)
router
  .route('/properties/:propertyId/like')
  .post(flexibleAuth(), validate(likeValidation.toggleLike), likeController.toggleLike);

// Check if user has liked a property
router
  .route('/properties/:propertyId/like/status')
  .get(flexibleAuth(), validate(likeValidation.checkLikeStatus), likeController.checkLikeStatus);

// Get all likes for a property
router
  .route('/properties/:propertyId/likes')
  .get(validate(likeValidation.getLikes), likeController.getPropertyLikes);

export default router;

