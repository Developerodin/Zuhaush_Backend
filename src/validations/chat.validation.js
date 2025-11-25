import Joi from 'joi';

const sendMessage = {
  body: Joi.object()
    .keys({
      userId: Joi.string().required(),
      builderId: Joi.string().optional(),
      agentId: Joi.string().optional(),
      message: Joi.string().required().max(1000),
      senderType: Joi.string().valid('User', 'Builder', 'Agent').required(),
    })
    .or('builderId', 'agentId')
    .messages({
      'object.missing': 'Either "builderId" or "agentId" is required',
    }),
};

const getMessageHistory = {
  query: Joi.object()
    .keys({
      userId: Joi.string().required(),
      builderId: Joi.string().optional(),
      agentId: Joi.string().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
    })
    .or('builderId', 'agentId')
    .messages({
      'object.missing': 'Either "builderId" or "agentId" is required',
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