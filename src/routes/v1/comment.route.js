import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import commentValidation from '../../validations/comment.validation.js';
import commentController from '../../controllers/comment.controller.js';

const router = express.Router();

// Create and get comments for a property
router
  .route('/properties/:propertyId/comments')
  .post(auth(), validate(commentValidation.createComment), commentController.createComment)
  .get(validate(commentValidation.getComments), commentController.getPropertyComments);

// Update and delete individual comments
router
  .route('/comments/:commentId')
  .patch(auth(), validate(commentValidation.updateComment), commentController.updateComment)
  .delete(auth(), validate(commentValidation.deleteComment), commentController.deleteComment);

// Builder route to get all comments on their properties
router
  .route('/builder/comments')
  .get(auth(), commentController.getBuilderComments);

export default router;

