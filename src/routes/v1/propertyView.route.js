import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import {
  trackPropertyView,
  getUserPropertyViews,
  getMyPropertyViews,
  getMyPropertyViewStats,
  getMyMostViewedProperties,
} from '../../controllers/propertyView.controller.js';
import {
  trackPropertyView as trackPropertyViewValidation,
  getUserPropertyViews as getUserPropertyViewsValidation,
  getMyPropertyViews as getMyPropertyViewsValidation,
  getMyMostViewedProperties as getMyMostViewedPropertiesValidation,
} from '../../validations/propertyView.validation.js';

const router = express.Router();

// Track property view (POST /property-views)
router.post(
  '/',
  auth(),
  validate(trackPropertyViewValidation),
  trackPropertyView
);

// Get my property views (GET /property-views/my-views)
router.get(
  '/my-views',
  auth(),
  validate(getMyPropertyViewsValidation),
  getMyPropertyViews
);

// Get my property view statistics (GET /property-views/my-stats)
router.get(
  '/my-stats',
  auth(),
  getMyPropertyViewStats
);

// Get my most viewed properties (GET /property-views/my-most-viewed)
router.get(
  '/my-most-viewed',
  auth(),
  validate(getMyMostViewedPropertiesValidation),
  getMyMostViewedProperties
);

// Get property views by user ID (GET /property-views/user/:userId) - Admin/Builder access
router.get(
  '/user/:userId',
  auth(),
  validate(getUserPropertyViewsValidation),
  getUserPropertyViews
);

export default router;
