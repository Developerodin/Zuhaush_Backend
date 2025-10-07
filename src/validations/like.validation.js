import Joi from 'joi';
import { objectId } from './custom.validation.js';

const toggleLike = {
  params: Joi.object().keys({
    propertyId: Joi.string().custom(objectId).required(),
  }),
};

const getLikes = {
  params: Joi.object().keys({
    propertyId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const checkLikeStatus = {
  params: Joi.object().keys({
    propertyId: Joi.string().custom(objectId).required(),
  }),
};

export default {
  toggleLike,
  getLikes,
  checkLikeStatus,
};

