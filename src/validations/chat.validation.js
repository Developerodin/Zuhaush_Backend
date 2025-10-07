import Joi from 'joi';

const sendMessage = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    builderId: Joi.string().required(),
    message: Joi.string().required().max(1000),
    senderType: Joi.string().valid('User', 'Builder').required(),
  }),
};

const getMessageHistory = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    builderId: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

const getUserMessages = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export {
  sendMessage,
  getMessageHistory,
  getUserMessages,
};