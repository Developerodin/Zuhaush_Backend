import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import {
  scheduleVisit,
  getVisits,
  getVisit,
  updateVisit,
  deleteVisit,
  confirmVisitHandler,
  cancelVisitHandler,
  rescheduleVisitHandler,
  completeVisitHandler,
  getBookedTimeSlotsHandler,
  checkTimeSlotAvailabilityHandler,
  getUserVisits,
  getPropertyVisits,
  getUpcomingVisitsHandler,
  getVisitStatsHandler,
  getMyVisits,
  getVisitDetails,
  updateMyVisit,
  cancelMyVisit,
  rescheduleMyVisit,
} from '../../controllers/visit.controller.js';
import {
  scheduleVisit as scheduleVisitValidation,
  getVisits as getVisitsValidation,
  getVisit as getVisitValidation,
  updateVisit as updateVisitValidation,
  confirmVisit,
  cancelVisit,
  rescheduleVisit,
  completeVisit,
  getBookedTimeSlots,
  checkTimeSlotAvailability,
  getUserVisits as getUserVisitsValidation,
  getPropertyVisits as getPropertyVisitsValidation,
} from '../../validations/visit.validation.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/properties/:propertyId/booked-slots', validate(getBookedTimeSlots), getBookedTimeSlotsHandler);
router.get('/properties/:propertyId/check-availability', validate(checkTimeSlotAvailability), checkTimeSlotAvailabilityHandler);

// Protected routes (authentication required)
router.use(auth());

// User-specific routes (users can only access their own data)
router.post('/schedule', validate(scheduleVisitValidation), scheduleVisit);
router.get('/my-visits', validate(getVisitsValidation), getMyVisits);
router.get('/upcoming', validate(getVisitsValidation), getUpcomingVisitsHandler);
router.get('/stats', getVisitStatsHandler);
router.get('/:visitId', validate(getVisitValidation), getVisitDetails);
router.patch('/:visitId', validate(updateVisitValidation), updateMyVisit);
router.patch('/:visitId/cancel', validate(cancelVisit), cancelMyVisit);
router.patch('/:visitId/reschedule', validate(rescheduleVisit), rescheduleMyVisit);

// Admin/Builder routes (for managing all visits)
router.get('/', validate(getVisitsValidation), getVisits);
router.get('/users/:userId', validate(getUserVisitsValidation), getUserVisits);
router.get('/properties/:propertyId', validate(getPropertyVisitsValidation), getPropertyVisits);
router.patch('/:visitId/confirm', validate(confirmVisit), confirmVisitHandler);
router.patch('/:visitId/complete', validate(completeVisit), completeVisitHandler);
router.put('/:visitId', validate(updateVisitValidation), updateVisit);
router.delete('/:visitId', validate(getVisitValidation), deleteVisit);

export default router;
