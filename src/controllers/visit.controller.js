import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createVisit,
  queryVisits,
  getVisitById,
  updateVisitById,
  deleteVisitById,
  confirmVisit,
  cancelVisit,
  rescheduleVisit,
  completeVisit,
  getBookedTimeSlots,
  checkTimeSlotAvailability,
  getVisitsByUser,
  getVisitsByProperty,
  getUpcomingVisits,
  getVisitStats,
  getScheduledProperties,
} from '../services/visit.service.js';

/**
 * Create a visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const scheduleVisit = catchAsync(async (req, res) => {
  // Set user from authenticated user
  req.body.user = req.user.id;
  
  const visit = await createVisit(req.body);
  res.status(httpStatus.CREATED).send(visit);
});

/**
 * Get visits
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getVisits = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user', 'property', 'status', 'date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  const result = await queryVisits(filter, options);
  res.send(result);
});

/**
 * Get visit by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const getVisit = catchAsync(async (req, res) => {
  const visit = await getVisitById(req.params.visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }
  res.send(visit);
});

/**
 * Update visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const updateVisit = catchAsync(async (req, res) => {
  const visit = await updateVisitById(req.params.visitId, req.body);
  res.send(visit);
});

/**
 * Delete visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>}
 */
const deleteVisit = catchAsync(async (req, res) => {
  await deleteVisitById(req.params.visitId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Confirm visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const confirmVisitHandler = catchAsync(async (req, res) => {
  const visit = await confirmVisit(req.params.visitId, req.user.id);
  res.send(visit);
});

/**
 * Cancel visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const cancelVisitHandler = catchAsync(async (req, res) => {
  const visit = await cancelVisit(req.params.visitId, req.user.id);
  res.send(visit);
});

/**
 * Reschedule visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const rescheduleVisitHandler = catchAsync(async (req, res) => {
  const visit = await rescheduleVisit(req.params.visitId, req.user.id, req.body);
  res.send(visit);
});

/**
 * Complete visit
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const completeVisitHandler = catchAsync(async (req, res) => {
  const visit = await completeVisit(req.params.visitId);
  res.send(visit);
});

/**
 * Get booked time slots for a property
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<string[]>}
 */
const getBookedTimeSlotsHandler = catchAsync(async (req, res) => {
  const { date } = req.query;
  const bookedSlots = await getBookedTimeSlots(req.params.propertyId, new Date(date));
  res.send({ bookedTimeSlots: bookedSlots });
});

/**
 * Check time slot availability
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<boolean>}
 */
const checkTimeSlotAvailabilityHandler = catchAsync(async (req, res) => {
  const { date, time } = req.query;
  const isAvailable = await checkTimeSlotAvailability(req.params.propertyId, new Date(date), time);
  res.send({ isAvailable });
});

/**
 * Get user's visits
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getUserVisits = catchAsync(async (req, res) => {
  const options = pick(req.query, ['status', 'sortBy', 'limit', 'page']);
  const result = await getVisitsByUser(req.params.userId, options);
  res.send(result);
});

/**
 * Get property visits
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getPropertyVisits = catchAsync(async (req, res) => {
  const options = pick(req.query, ['status', 'date', 'sortBy', 'limit', 'page']);
  const result = await getVisitsByProperty(req.params.propertyId, options);
  res.send(result);
});

/**
 * Get upcoming visits for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getUpcomingVisitsHandler = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await getUpcomingVisits(req.user.id, options);
  res.send(result);
});

/**
 * Get visit statistics for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getVisitStatsHandler = catchAsync(async (req, res) => {
  const stats = await getVisitStats(req.user.id);
  res.send(stats);
});

/**
 * Get my visits (authenticated user's visits)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getMyVisits = catchAsync(async (req, res) => {
  const options = pick(req.query, ['status', 'sortBy', 'limit', 'page']);
  const result = await getVisitsByUser(req.user.id, options);
  res.send(result);
});

/**
 * Get visit details with property information
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const getVisitDetails = catchAsync(async (req, res) => {
  const visit = await getVisitById(req.params.visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  // Check if user owns this visit or is admin/builder
  if (visit.user._id.toString() !== req.user.id && 
      !['admin', 'builder'].includes(req.user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  res.send(visit);
});

/**
 * Update my visit (authenticated user can only update their own visits)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const updateMyVisit = catchAsync(async (req, res) => {
  const visit = await getVisitById(req.params.visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  // Check if user owns this visit
  if (visit.user._id.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own visits');
  }

  // Only allow updates for scheduled visits
  if (visit.status !== 'scheduled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only scheduled visits can be updated');
  }

  const updatedVisit = await updateVisitById(req.params.visitId, req.body);
  res.send(updatedVisit);
});

/**
 * Cancel my visit (authenticated user can only cancel their own visits)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const cancelMyVisit = catchAsync(async (req, res) => {
  const visit = await getVisitById(req.params.visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  // Check if user owns this visit
  if (visit.user._id.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only cancel your own visits');
  }

  const cancelledVisit = await cancelVisit(req.params.visitId, req.user.id);
  res.send(cancelledVisit);
});

/**
 * Reschedule my visit (authenticated user can only reschedule their own visits)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Visit>}
 */
const rescheduleMyVisit = catchAsync(async (req, res) => {
  const visit = await getVisitById(req.params.visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  // Check if user owns this visit
  if (visit.user._id.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only reschedule your own visits');
  }

  const rescheduledVisit = await rescheduleVisit(req.params.visitId, req.user.id, req.body);
  res.send(rescheduledVisit);
});

/**
 * Get scheduled properties for authenticated user
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getMyScheduledProperties = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await getScheduledProperties(req.user.id, options);
  res.send(result);
});

/**
 * Get scheduled properties for a specific user (admin/builder access)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<QueryResult>}
 */
const getUserScheduledProperties = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await getScheduledProperties(req.params.userId, options);
  res.send(result);
});

export {
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
  getMyScheduledProperties,
  getUserScheduledProperties,
};
