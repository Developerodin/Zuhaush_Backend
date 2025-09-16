import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as adminValidation from '../../validations/admin.validation.js';
import * as adminController from '../../controllers/admin.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', validate(adminValidation.login), adminController.login);

// Protected routes (authentication required)
router.use(auth());

// Basic CRUD operations
router
  .route('/')
  .post(validate(adminValidation.createAdmin), adminController.createAdmin)
  .get(validate(adminValidation.getAdmins), adminController.getAdmins);

router
  .route('/:adminId')
  .get(validate(adminValidation.getAdmin), adminController.getAdmin)
  .patch(validate(adminValidation.updateAdmin), adminController.updateAdmin)
  .delete(validate(adminValidation.deleteAdmin), adminController.deleteAdmin);

// Navigation permissions management
router
  .route('/:adminId/navigation-permissions')
  .get(validate(adminValidation.getNavigationPermissions), adminController.getNavigationPermissions)
  .patch(validate(adminValidation.updateNavigationPermissions), adminController.updateNavigationPermissions);

// Account management
router
  .route('/:adminId/activate')
  .patch(validate(adminValidation.activateAdmin), adminController.activateAdmin);

router
  .route('/:adminId/deactivate')
  .patch(validate(adminValidation.deactivateAdmin), adminController.deactivateAdmin);

// Profile management (for current admin)
router
  .route('/profile')
  .get(adminController.getProfile)
  .patch(validate(adminValidation.updateProfile), adminController.updateProfile);

router
  .route('/profile/change-password')
  .patch(validate(adminValidation.changePassword), adminController.changePassword);

// Statistics
router
  .route('/stats')
  .get(adminController.getAdminStats);

// Permission checking
router
  .route('/check-permission/:permission')
  .get(validate(adminValidation.checkPermission), adminController.checkPermission);

export default router;
