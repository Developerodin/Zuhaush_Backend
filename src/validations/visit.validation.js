import Joi from 'joi';
import { objectId } from './custom.validation.js';

const scheduleVisit = {
  body: Joi.object().keys({
    property: Joi.string().required().custom(objectId),
    date: Joi.date().required().min('now'),
    time: Joi.string()
      .required()
      .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
      .messages({
        'string.pattern.base': 'Time must be in format HH:MM AM/PM (e.g., 10:30 AM)'
      }),
  }),
};

const getVisits = {
  query: Joi.object().keys({
    user: Joi.string().custom(objectId),
    property: Joi.string().custom(objectId),
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
};

const updateVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      date: Joi.date().min('now'),
      time: Joi.string()
        .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
        .messages({
          'string.pattern.base': 'Time must be in format HH:MM AM/PM (e.g., 10:30 AM)'
        }),
    })
    .min(1),
};

const confirmVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
};

const cancelVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
};

const rescheduleVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    date: Joi.date().required().min('now'),
    time: Joi.string()
      .required()
      .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
      .messages({
        'string.pattern.base': 'Time must be in format HH:MM AM/PM (e.g., 10:30 AM)'
      }),
  }),
};

const completeVisit = {
  params: Joi.object().keys({
    visitId: Joi.string().required().custom(objectId),
  }),
};

const getBookedTimeSlots = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    date: Joi.date().required().min('now'),
  }),
};

const checkTimeSlotAvailability = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    date: Joi.date().required().min('now'),
    time: Joi.string()
      .required()
      .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
      .messages({
        'string.pattern.base': 'Time must be in format HH:MM AM/PM (e.g., 10:30 AM)'
      }),
  }),
};

const getUserVisits = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getPropertyVisits = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

export {
  scheduleVisit,
  getVisits,
  getVisit,
  updateVisit,
  confirmVisit,
  cancelVisit,
  rescheduleVisit,
  completeVisit,
  getBookedTimeSlots,
  checkTimeSlotAvailability,
  getUserVisits,
  getPropertyVisits,
};