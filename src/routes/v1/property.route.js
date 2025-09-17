import express from 'express';
import flexibleAuth from '../../middlewares/flexibleAuth.js';
import validate from '../../middlewares/validate.js';
import { uploadSingle } from '../../middlewares/upload.js';
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadMedia,
  deleteMedia,
  updateMedia,
  approveProperty,
  rejectProperty,
  addFlag,
  removeFlag,
  incrementViews,
  incrementInquiries,
  searchProperties,
  getNearbyProperties,
} from '../../validations/property.validation.js';
import {
  createPropertyHandler,
  getProperties as getPropertiesHandler,
  getProperty as getPropertyHandler,
  getPropertyBySlugHandler,
  updateProperty as updatePropertyHandler,
  deleteProperty as deletePropertyHandler,
  addMedia,
  updateMedia as updateMediaHandler,
  removeMedia,
  approvePropertyHandler,
  rejectPropertyHandler,
  addFlag as addFlagHandler,
  removeFlag as removeFlagHandler,
  incrementViews as incrementViewsHandler,
  incrementInquiries as incrementInquiriesHandler,
  searchPropertiesHandler,
  getNearbyPropertiesHandler,
  getPropertiesByBuilderHandler,
  getPropertyStatsHandler,
  getFeaturedProperties,
  getTrendingProperties,
  getNewLaunchProperties,
  getPropertiesByType,
  getPropertiesByCity,
} from '../../controllers/property.controller.js';

const router = express.Router();

// Public routes
router.get('/search', validate(searchProperties), searchPropertiesHandler);
router.get('/featured', getFeaturedProperties);
router.get('/trending', getTrendingProperties);
router.get('/new-launch', getNewLaunchProperties);
router.get('/type/:type', getPropertiesByType);
router.get('/city/:city', getPropertiesByCity);
router.get('/:propertyId/nearby', validate(getNearbyProperties), getNearbyPropertiesHandler);
router.get('/slug/:slug', getPropertyBySlugHandler);
router.get('/:propertyId', validate(getProperty), getPropertyHandler);
router.get('/', validate(getProperties), getPropertiesHandler);

// Protected routes (require authentication)
router.use(flexibleAuth());

// Builder routes
router.post('/', validate(createProperty), createPropertyHandler);
router.get('/builder/:builderId', getPropertiesByBuilderHandler);
router.get('/builder/:builderId/stats', getPropertyStatsHandler);
router.patch('/:propertyId', validate(updateProperty), updatePropertyHandler);
router.delete('/:propertyId', validate(deleteProperty), deletePropertyHandler);

// Media management
router.post('/:propertyId/media', uploadSingle('file'), validate(uploadMedia), addMedia);
router.patch('/:propertyId/media/:mediaId', validate(updateMedia), updateMediaHandler);
router.delete('/:propertyId/media/:mediaId', validate(deleteMedia), removeMedia);

// Flag management
router.post('/:propertyId/flags', validate(addFlag), addFlagHandler);
router.delete('/:propertyId/flags', validate(removeFlag), removeFlagHandler);

// Analytics
router.post('/:propertyId/views', validate(incrementViews), incrementViewsHandler);
router.post('/:propertyId/inquiries', validate(incrementInquiries), incrementInquiriesHandler);

// Admin routes
router.use(flexibleAuth());

router.post('/:propertyId/approve', validate(approveProperty), approvePropertyHandler);
router.post('/:propertyId/reject', validate(rejectProperty), rejectPropertyHandler);

export default router;
