import mongoose from 'mongoose';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { Message } from '../models/chat.model.js';
import User from '../models/user.model.js';

/**
 * Helper function to check if a user is an agent
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
const isAgent = async (userId) => {
  if (!userId) return false;
  const user = await User.findById(userId);
  return user && user.role === 'agent';
};

/**
 * Send a message
 * @param {string} userId - User ID (can be User or Agent)
 * @param {string} builderId - Builder ID (can be Builder or Agent when agentId is used)
 * @param {string} message - Message content
 * @param {string} senderType - Sender type ('User', 'Builder', or 'Agent')
 * @returns {Promise<Message>}
 */
const sendMessage = async (userId, builderId, message, senderType) => {
  // Validate senderType matches actual role
  const isUserIdAgent = await isAgent(userId);
  const isBuilderIdAgent = await isAgent(builderId);
  const Builder = (await import('../models/builder.model.js')).default;
  const isBuilderIdBuilder = builderId ? await Builder.findById(builderId) : null;

  // Validate senderType consistency
  if (senderType === 'User' && isUserIdAgent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "User" when userId is an agent. Use senderType "Agent" instead.');
  }
  if (senderType === 'Agent' && !isUserIdAgent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "Agent" when userId is not an agent.');
  }
  if (senderType === 'Builder' && !isBuilderIdBuilder) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "Builder" when builderId is not a builder.');
  }

  // Prevent same person in multiple fields
  if (userId === builderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'userId and builderId cannot be the same person.');
  }

  // Determine which fields to use based on senderType
  let messageData = {
    message,
    senderType,
  };

  if (senderType === 'User') {
    // User chatting with Builder or Agent
    messageData.userId = userId;
    if (isBuilderIdAgent) {
      messageData.agentId = builderId;
    } else if (isBuilderIdBuilder) {
      messageData.builderId = builderId;
    } else {
      // builderId is a regular user - this shouldn't happen but handle it
      const user = await User.findById(builderId);
      if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid builderId/agentId provided.');
      }
      // For User↔User conversation, we need to handle this differently
      // But based on the model, this should be User↔Agent or User↔Builder
      throw new ApiError(httpStatus.BAD_REQUEST, 'User can only chat with Builder or Agent, not another User.');
    }
  } else if (senderType === 'Builder') {
    // Builder chatting with User or Agent
    messageData.builderId = builderId;
    if (isUserIdAgent) {
      messageData.agentId = userId;
    } else {
      messageData.userId = userId;
    }
  } else if (senderType === 'Agent') {
    // Agent chatting with User or Builder
    if (!isUserIdAgent) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'userId must be an agent when senderType is "Agent".');
    }
    messageData.agentId = userId; // Agent is passed as userId
    
    if (isBuilderIdBuilder) {
      // builderId is a Builder
      messageData.builderId = builderId;
    } else if (isBuilderIdAgent) {
      // builderId is also an Agent - Agent↔Agent conversation
      throw new ApiError(httpStatus.BAD_REQUEST, 'Agent↔Agent conversations are not currently supported.');
    } else {
      // builderId should be a User (for User↔Agent conversation)
      const user = await User.findById(builderId);
      if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid recipient ID provided.');
      }
      if (user.role === 'agent') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Agent↔Agent conversations are not currently supported.');
      }
      messageData.userId = builderId;
    }
  }

  const newMessage = await Message.create(messageData);

  // Populate all possible fields
  const populatedMessage = await newMessage
    .populate('userId', 'name email role')
    .populate('builderId', 'name email')
    .populate('agentId', 'name email role');

  // Create notification for the recipient
  try {
    const { createChatNotifications } = await import('./notification.service.js');
    
    // Determine recipient type and ID
    let recipientType, recipientId, senderId;
    
    if (senderType === 'User') {
      senderId = userId;
      const isBuilderIdAgent = await isAgent(builderId);
      recipientId = builderId;
      recipientType = isBuilderIdAgent ? 'agent' : 'builder';
    } else if (senderType === 'Builder') {
      senderId = builderId;
      const isUserIdAgent = await isAgent(userId);
      recipientId = userId;
      recipientType = isUserIdAgent ? 'agent' : 'user';
    } else if (senderType === 'Agent') {
      senderId = userId; // Agent ID
      recipientId = builderId;
      // Check if builderId is a Builder or User
      const Builder = (await import('../models/builder.model.js')).default;
      const builder = await Builder.findById(builderId);
      recipientType = builder ? 'builder' : 'user';
    }
    
    await createChatNotifications({
      message: populatedMessage,
      action: 'new_message',
      senderId,
      recipientId,
      recipientType,
      senderType
    });
  } catch (error) {
    console.error('Failed to create chat notification:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }

  return populatedMessage;
};

/**
 * Get message history between participants
 * @param {string} userId - User ID (can be User or Agent)
 * @param {string} builderId - Builder ID (can be Builder or Agent/User)
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getMessageHistory = async (userId, builderId, options = {}) => {
  // Check if participants are agents to build correct filter
  const isUserIdAgent = await isAgent(userId);
  const isBuilderIdAgent = await isAgent(builderId);
  
  // Build filter to match all possible conversation combinations
  const filter = {
    $or: [
      // User ↔ Builder (existing)
      { userId, builderId },
      { userId: builderId, builderId: userId },
      // User ↔ Agent
      { userId, agentId: builderId },
      { userId: builderId, agentId: userId },
      // Agent ↔ Builder
      { agentId: userId, builderId },
      { agentId: builderId, builderId: userId },
      // Agent ↔ Agent (if both are agents)
      { agentId: userId, userId: builderId },
      { agentId: builderId, userId: userId },
    ],
  };

  // Pagination
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find(filter)
    .populate('userId', 'name email role')
    .populate('builderId', 'name email')
    .populate('agentId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      page,
      limit,
      total: await Message.countDocuments(filter),
      pages: Math.ceil((await Message.countDocuments(filter)) / limit),
    },
  };
};

/**
 * Get all messages for a user/agent/builder - Returns only latest message per conversation
 * @param {string} userId - User/Agent/Builder ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getUserMessages = async (userId, options = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Pagination
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;

  // Use aggregation to get only the latest message per unique conversation
  // Match messages where the user appears in any participant field
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { userId: userObjectId },
          { builderId: userObjectId },
          { agentId: userObjectId },
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $addFields: {
        // Create a unique conversation key from all participant IDs
        conversationKey: {
          $concat: [
            { $toString: { $ifNull: ['$userId', ''] } },
            '-',
            { $toString: { $ifNull: ['$builderId', ''] } },
            '-',
            { $toString: { $ifNull: ['$agentId', ''] } },
          ],
        },
      },
    },
    {
      $group: {
        _id: '$conversationKey',
        latestMessage: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$latestMessage' },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        messages: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  // Populate all participant fields
  const result = messages[0];
  const populatedMessages = await Message.populate(result.messages, [
    { path: 'userId', select: 'name email role' },
    { path: 'builderId', select: 'name email' },
    { path: 'agentId', select: 'name email role' },
  ]);

  const total = result.totalCount[0]?.count || 0;

  return {
    messages: populatedMessages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export { sendMessage, getMessageHistory, getUserMessages };