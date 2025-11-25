import httpStatus from 'http-status';
import Joi from 'joi';
import express from 'express';
import flexibleAuth from '../../middlewares/flexibleAuth.js';
import validate from '../../middlewares/validate.js';
import * as userValidation from '../../validations/user.validation.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiError from '../../utils/ApiError.js';
import * as userService from '../../services/user.service.js';
import pick from '../../utils/pick.js';
import { objectId } from '../../validations/custom.validation.js';

const router = express.Router();

// Get all agents - All authenticated users can access
const getAgentsValidation = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    contactNumber: Joi.string(),
    cityofInterest: Joi.string(),
    state: Joi.string(),
    agencyName: Joi.string(),
    reraNumber: Joi.string(),
    isActive: Joi.boolean(),
    isEmailVerified: Joi.boolean(),
    registrationStatus: Joi.string().valid('partial', 'otp_verified', 'completed'),
    q: Joi.string(), // General search parameter
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

router
  .route('/')
  .get(
    flexibleAuth(),
    validate(getAgentsValidation),
    catchAsync(async (req, res) => {
      // Filter to only get agents (role='agent')
      const filter = {
        ...pick(req.query, [
          'name',
          'email',
          'contactNumber',
          'cityofInterest',
          'state',
          'agencyName',
          'reraNumber',
          'isActive',
          'isEmailVerified',
          'registrationStatus',
          'q',
        ]),
        role: 'agent',
      };
      const options = pick(req.query, ['sortBy', 'limit', 'page']);
      const result = await userService.queryUsers(filter, options);
      res.send(result);
    })
  );

// Profile routes - Agent can get/update their own profile, all authenticated users can view agent profiles
router
  .route('/profile')
  .get(
    flexibleAuth(),
    catchAsync(async (req, res) => {
      // Check if user is an agent
      if (req.user.role !== 'agent') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Only agents can access this endpoint');
      }
      const agent = await userService.getUserById(req.user.id);
      res.send(agent);
    })
  )
  .patch(
    flexibleAuth(),
    validate(userValidation.updateProfile),
    catchAsync(async (req, res) => {
      // Check if user is an agent
      if (req.user.role !== 'agent') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Only agents can update their profile');
      }
      const agent = await userService.updateUserProfile(req.user.id, req.body);
      res.send(agent);
    })
  );

// Get agent by ID - All authenticated users (user, builder, agent) can view agent profiles
const getAgentValidation = {
  params: Joi.object().keys({
    agentId: Joi.string().custom(objectId),
  }),
};

router
  .route('/:agentId')
  .get(
    flexibleAuth(),
    validate(getAgentValidation),
    catchAsync(async (req, res) => {
      const agent = await userService.getUserById(req.params.agentId);
      if (!agent) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Agent not found');
      }
      // Verify that the user is actually an agent
      if (agent.role !== 'agent') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User is not an agent');
      }
      res.send(agent);
    })
  );

export default router;
