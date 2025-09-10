import express from 'express';
import validate from '../../middlewares/validate.js';
import * as cityValidation from '../../validations/city.validation.js';
import * as cityController from '../../controllers/city.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', cityController.getActiveCities);
router.get('/search', validate(cityValidation.searchCities), cityController.searchCitiesController);
router.get('/:cityId', validate(cityValidation.getCity), cityController.getCity);

// Protected routes (admin only)
router.post('/', auth('admin'), validate(cityValidation.createCity), cityController.createCityController);
router.put('/:cityId', auth('admin'), validate(cityValidation.updateCity), cityController.updateCity);
router.delete('/:cityId', auth('admin'), validate(cityValidation.deleteCity), cityController.deleteCity);

export default router;
