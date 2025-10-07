import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import likeValidation from '../../validations/like.validation.js';
import likeController from '../../controllers/like.controller.js';

const router = express.Router();

// Toggle like on property (like/unlike)
router
  .route('/properties/:propertyId/like')
  .post(auth(), validate(likeValidation.toggleLike), likeController.toggleLike);

// Check if user has liked a property
router
  .route('/properties/:propertyId/like/status')
  .get(auth(), validate(likeValidation.checkLikeStatus), likeController.checkLikeStatus);

// Get all likes for a property
router
  .route('/properties/:propertyId/likes')
  .get(validate(likeValidation.getLikes), likeController.getPropertyLikes);

export default router;

