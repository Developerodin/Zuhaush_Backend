import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const visitSchema = mongoose.Schema(
  {
    // User who scheduled the visit (retrieved from token)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Property being visited
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    
    // Visit date
    date: {
      type: Date,
      required: true,
    },
    
    // Visit time
    time: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Visit status
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    
    // Cancellation details
    cancelledAt: {
      type: Date,
      required: false,
    },
    
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    
    // Rescheduling details
    rescheduledAt: {
      type: Date,
      required: false,
    },
    
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
visitSchema.plugin(toJSON);
visitSchema.plugin(paginate);

// Indexes for better query performance
visitSchema.index({ user: 1, status: 1 });
visitSchema.index({ property: 1, date: 1, time: 1 });
visitSchema.index({ date: 1, time: 1 });
visitSchema.index({ status: 1, date: 1 });

/**
 * Check if visit is scheduled
 * @returns {boolean}
 */
visitSchema.methods.isScheduled = function () {
  return this.status === 'scheduled';
};

/**
 * Check if visit is confirmed
 * @returns {boolean}
 */
visitSchema.methods.isConfirmed = function () {
  return this.status === 'confirmed';
};

/**
 * Check if visit is completed
 * @returns {boolean}
 */
visitSchema.methods.isCompleted = function () {
  return this.status === 'completed';
};

/**
 * Check if visit is cancelled
 * @returns {boolean}
 */
visitSchema.methods.isCancelled = function () {
  return this.status === 'cancelled';
};

/**
 * Check if visit is rescheduled
 * @returns {boolean}
 */
visitSchema.methods.isRescheduled = function () {
  return this.status === 'rescheduled';
};

/**
 * Cancel visit
 * @param {string} cancelledBy - User ID who cancelled
 * @returns {Promise<Visit>}
 */
visitSchema.methods.cancel = function (cancelledBy) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  return this.save();
};

/**
 * Reschedule visit
 * @param {Date} newDate - New scheduled date
 * @param {string} newTime - New scheduled time
 * @param {string} rescheduledBy - User ID who rescheduled
 * @returns {Promise<Visit>}
 */
visitSchema.methods.reschedule = function (newDate, newTime, rescheduledBy) {
  this.date = newDate;
  this.time = newTime;
  this.status = 'rescheduled';
  this.rescheduledAt = new Date();
  this.rescheduledBy = rescheduledBy;
  return this.save();
};

/**
 * Complete visit
 * @returns {Promise<Visit>}
 */
visitSchema.methods.complete = function () {
  this.status = 'completed';
  return this.save();
};

/**
 * Check if time slot is available for a property
 * @param {ObjectId} propertyId - Property ID
 * @param {Date} date - Scheduled date
 * @param {string} time - Scheduled time
 * @param {ObjectId} excludeVisitId - Visit ID to exclude from check
 * @returns {Promise<boolean>}
 */
visitSchema.statics.isTimeSlotAvailable = async function (propertyId, date, time, excludeVisitId = null) {
  // Create start and end of day for the given date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const query = {
    property: propertyId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    time,
    status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
  };
  
  if (excludeVisitId) {
    query._id = { $ne: excludeVisitId };
  }
  
  const existingVisit = await this.findOne(query);
  return !existingVisit;
};

/**
 * Get booked time slots for a property on a specific date
 * @param {ObjectId} propertyId - Property ID
 * @param {Date} date - Date to check
 * @returns {Promise<string[]>}
 */
visitSchema.statics.getBookedTimeSlots = async function (propertyId, date) {
  // Create start and end of day for the given date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const bookedSlots = await this.find({
    property: propertyId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
  }).select('time');
  
  return bookedSlots.map((visit) => visit.time);
};

/**
 * @typedef Visit
 */
const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
