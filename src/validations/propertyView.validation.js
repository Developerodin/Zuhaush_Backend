import Joi from 'joi';

const trackPropertyView = {
  body: Joi.object().keys({
    property: Joi.string().required(),
  }),
};

const getUserPropertyViews = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getMyPropertyViews = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getMyMostViewedProperties = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50),
  }),
};

export {
  trackPropertyView,
  getUserPropertyViews,
  getMyPropertyViews,
  getMyMostViewedProperties,
};
