import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createComment = {
  params: Joi.object().keys({
    propertyId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    text: Joi.string().required().max(1000).trim(),
  }),
};

const getComments = {
  params: Joi.object().keys({
    propertyId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    text: Joi.string().required().max(1000).trim(),
  }),
};

const deleteComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId).required(),
  }),
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};

