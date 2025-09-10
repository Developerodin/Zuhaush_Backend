import Joi from 'joi';

const createCity = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().default('India'),
    isActive: Joi.boolean().default(true),
  }),
};

const updateCity = {
  params: Joi.object().keys({
    cityId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

const getCity = {
  params: Joi.object().keys({
    cityId: Joi.string().required(),
  }),
};

const deleteCity = {
  params: Joi.object().keys({
    cityId: Joi.string().required(),
  }),
};

const searchCities = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

export {
  createCity,
  updateCity,
  getCity,
  deleteCity,
  searchCities,
};
