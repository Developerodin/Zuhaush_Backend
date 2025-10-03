import { Visit, Property, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

/**
 * Create a visit
 * @param {Object} visitBody
 * @returns {Promise<Visit>}
 */
const createVisit = async (visitBody) => {
  // Check if property exists
  const property = await Property.findById(visitBody.property);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Check if user exists
  const user = await User.findById(visitBody.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if time slot is available
  const isAvailable = await Visit.isTimeSlotAvailable(
    visitBody.property,
    visitBody.date,
    visitBody.time
  );

  if (!isAvailable) {
    throw new ApiError(httpStatus.CONFLICT, 'Time slot is not available');
  }

  return Visit.create(visitBody);
};

/**
 * Query for visits
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVisits = async (filter, options) => {
  const visits = await Visit.paginate(filter, {
    ...options,
    populate: [
      { path: 'user', select: 'name email contactNumber' },
      { path: 'property', select: 'name type city locality price area media' },
      { path: 'cancelledBy', select: 'name email' },
      { path: 'rescheduledBy', select: 'name email' },
    ],
  });
  return visits;
};

/**
 * Get visit by id
 * @param {ObjectId} id
 * @returns {Promise<Visit>}
 */
const getVisitById = async (id) => {
  return Visit.findById(id)
    .populate('user', 'name email contactNumber')
    .populate('property', 'name type city locality price area media builder')
    .populate('cancelledBy', 'name email')
    .populate('rescheduledBy', 'name email');
};

/**
 * Update visit by id
 * @param {ObjectId} visitId
 * @param {Object} updateBody
 * @returns {Promise<Visit>}
 */
const updateVisitById = async (visitId, updateBody) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  // If updating date/time, check availability
  if (updateBody.date || updateBody.time) {
    const newDate = updateBody.date || visit.date;
    const newTime = updateBody.time || visit.time;
    
    const isAvailable = await Visit.isTimeSlotAvailable(
      visit.property._id,
      newDate,
      newTime,
      visitId
    );

    if (!isAvailable) {
      throw new ApiError(httpStatus.CONFLICT, 'Time slot is not available');
    }
  }

  Object.assign(visit, updateBody);
  await visit.save();
  return visit;
};

/**
 * Delete visit by id
 * @param {ObjectId} visitId
 * @returns {Promise<Visit>}
 */
const deleteVisitById = async (visitId) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }
  await visit.remove();
  return visit;
};

/**
 * Confirm visit
 * @param {ObjectId} visitId
 * @param {ObjectId} confirmedBy
 * @param {Object} confirmData
 * @returns {Promise<Visit>}
 */
const confirmVisit = async (visitId, confirmedBy) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  if (visit.status !== 'scheduled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only scheduled visits can be confirmed');
  }

  visit.status = 'confirmed';
  await visit.save();
  return visit;
};

/**
 * Cancel visit
 * @param {ObjectId} visitId
 * @param {ObjectId} cancelledBy
 * @param {string} reason
 * @returns {Promise<Visit>}
 */
const cancelVisit = async (visitId, cancelledBy) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  if (['cancelled', 'completed'].includes(visit.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Visit cannot be cancelled');
  }

  return visit.cancel(cancelledBy);
};

/**
 * Reschedule visit
 * @param {ObjectId} visitId
 * @param {ObjectId} rescheduledBy
 * @param {Object} rescheduleData
 * @returns {Promise<Visit>}
 */
const rescheduleVisit = async (visitId, rescheduledBy, rescheduleData) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  if (['cancelled', 'completed'].includes(visit.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Visit cannot be rescheduled');
  }

  // Check if new time slot is available
  const isAvailable = await Visit.isTimeSlotAvailable(
    visit.property._id,
    rescheduleData.date,
    rescheduleData.time,
    visitId
  );

  if (!isAvailable) {
    throw new ApiError(httpStatus.CONFLICT, 'Time slot is not available');
  }

  return visit.reschedule(
    rescheduleData.date,
    rescheduleData.time,
    rescheduledBy
  );
};

/**
 * Complete visit
 * @param {ObjectId} visitId
 * @param {Object} completeData
 * @returns {Promise<Visit>}
 */
const completeVisit = async (visitId) => {
  const visit = await getVisitById(visitId);
  if (!visit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visit not found');
  }

  if (visit.status !== 'confirmed') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only confirmed visits can be completed');
  }

  return visit.complete();
};

/**
 * Get booked time slots for a property on a specific date
 * @param {ObjectId} propertyId
 * @param {Date} date
 * @returns {Promise<string[]>}
 */
const getBookedTimeSlots = async (propertyId, date) => {
  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return Visit.getBookedTimeSlots(propertyId, date);
};

/**
 * Check if time slot is available
 * @param {ObjectId} propertyId
 * @param {Date} date
 * @param {string} time
 * @returns {Promise<boolean>}
 */
const checkTimeSlotAvailability = async (propertyId, date, time) => {
  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return Visit.isTimeSlotAvailable(propertyId, date, time);
};

/**
 * Get visits by user
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getVisitsByUser = async (userId, options = {}) => {
  const filter = { user: userId };
  
  if (options.status) {
    filter.status = options.status;
  }

  return queryVisits(filter, options);
};

/**
 * Get visits by property
 * @param {ObjectId} propertyId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getVisitsByProperty = async (propertyId, options = {}) => {
  const filter = { property: propertyId };
  
  if (options.status) {
    filter.status = options.status;
  }

  if (options.date) {
    filter.date = options.date;
  }

  return queryVisits(filter, options);
};

/**
 * Get upcoming visits for a user
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getUpcomingVisits = async (userId, options = {}) => {
  const filter = {
    user: userId,
    status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
    date: { $gte: new Date() }
  };

  const defaultOptions = {
    sortBy: 'date:asc',
    limit: 10,
    page: 1,
    ...options
  };

  return queryVisits(filter, defaultOptions);
};

/**
 * Get visit statistics
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getVisitStats = async (userId) => {
  const stats = await Visit.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        scheduledVisits: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        confirmedVisits: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedVisits: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledVisits: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        rescheduledVisits: {
          $sum: { $cond: [{ $eq: ['$status', 'rescheduled'] }, 1, 0] }
        },
      }
    }
  ]);

  return stats[0] || {
    totalVisits: 0,
    scheduledVisits: 0,
    confirmedVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
    rescheduledVisits: 0,
  };
};

export {
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
};
