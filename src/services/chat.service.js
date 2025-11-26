import mongoose from 'mongoose';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { Message } from '../models/chat.model.js';
import User from '../models/user.model.js';
import Builder from '../models/builder.model.js';

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
  const isBuilderIdBuilder = builderId ? await Builder.findById(builderId) : null;

  // Validate senderType consistency
  if (senderType === 'User' && isUserIdAgent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "User" when userId is an agent. Use senderType "Agent" instead.');
  }
  if (senderType === 'Agent' && !isUserIdAgent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "Agent" when userId is not an agent.');
  }
  if (senderType === 'Builder') {
    // For Builder, builderId is the sender, so it must be a builder
    if (!isBuilderIdBuilder) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'senderType cannot be "Builder" when builderId is not a builder.');
    }
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
    // Builder chatting with User, Agent, or another Builder
    messageData.builderId = builderId; // Sender builder
    
    // Check if userId is also a builder (Builder↔Builder conversation)
    const isUserIdBuilder = userId ? await Builder.findById(userId) : null;
    if (isUserIdBuilder) {
      // Builder↔Builder conversation - store recipient builder in userId field
      // Note: This is a workaround since we can't have two builderId fields
      // The recipient builder ID will be in userId, but it references Builder model
      messageData.userId = userId;
    } else if (isUserIdAgent) {
      messageData.agentId = userId;
    } else {
      messageData.userId = userId;
    }
  } else if (senderType === 'Agent') {
    // Agent chatting with User, Builder, or another Agent
    if (!isUserIdAgent) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'userId must be an agent when senderType is "Agent".');
    }
    messageData.agentId = userId; // Sender agent
    
    if (isBuilderIdBuilder) {
      // builderId is a Builder
      messageData.builderId = builderId;
    } else if (isBuilderIdAgent) {
      // builderId is also an Agent - Agent↔Agent conversation
      messageData.agentId = userId; // Sender agent (already set)
      // For Agent↔Agent, we store the recipient agent in userId field
      // Note: This is a workaround since we can't have two agentId fields
      messageData.userId = builderId;
    } else {
      // builderId should be a User (for User↔Agent conversation)
      const user = await User.findById(builderId);
      if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid recipient ID provided.');
      }
      messageData.userId = builderId;
    }
  }

  const newMessage = await Message.create(messageData);

  // Populate all possible fields
  let populatedMessage = await newMessage
    .populate('userId', 'name email role')
    .populate('builderId', 'name email')
    .populate('agentId', 'name email role');

  // Handle special cases where userId or agentId might contain Builder IDs
  // For Builder↔Builder: userId contains builder ID but refs User model
  // For Agent↔Agent: userId contains agent ID but refs User model (this works)
  // We need to manually populate builder data if userId contains a builder
  if (senderType === 'Builder' && messageData.userId) {
    const isUserIdBuilder = await Builder.findById(messageData.userId);
    if (isUserIdBuilder) {
      // userId contains a builder ID, manually populate it
      populatedMessage = populatedMessage.toObject();
      populatedMessage.userId = {
        id: isUserIdBuilder._id.toString(),
        name: isUserIdBuilder.name,
        email: isUserIdBuilder.email,
        // Add other builder fields you need
      };
    }
  }

  // Create notification for the recipient
  try {
    // Dynamic import for notification service to avoid circular dependencies
    const notificationModule = await import('./notification.service.js');
    const createChatNotifications = notificationModule.createChatNotifications;
    
    // Determine recipient type and ID
    let recipientType, recipientId, senderId;
    
    if (senderType === 'User') {
      senderId = userId;
      const isBuilderIdAgent = await isAgent(builderId);
      recipientId = builderId;
      recipientType = isBuilderIdAgent ? 'agent' : 'builder';
    } else if (senderType === 'Builder') {
      senderId = builderId;
      // Check if userId is a Builder (Builder↔Builder), Agent, or User
      const isUserIdBuilder = userId ? await Builder.findById(userId) : null;
      const isUserIdAgent = await isAgent(userId);
      recipientId = userId;
      if (isUserIdBuilder) {
        recipientType = 'builder';
      } else if (isUserIdAgent) {
        recipientType = 'agent';
      } else {
        recipientType = 'user';
      }
    } else if (senderType === 'Agent') {
      senderId = userId; // Agent ID
      recipientId = builderId;
      // Check if builderId is a Builder, Agent (Agent↔Agent), or User
      const builder = await Builder.findById(builderId);
      const isBuilderIdAgent = await isAgent(builderId);
      if (builder) {
        recipientType = 'builder';
      } else if (isBuilderIdAgent) {
        recipientType = 'agent';
      } else {
        recipientType = 'user';
      }
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
  // Check if participants are agents or builders to build correct filter
  const isUserIdAgent = await isAgent(userId);
  const isBuilderIdAgent = await isAgent(builderId);
  const isUserIdBuilder = userId ? await Builder.findById(userId) : null;
  const isBuilderIdBuilder = builderId ? await Builder.findById(builderId) : null;
  
  // Build filter to match all possible conversation combinations
  const filter = {
    $or: [
      // User ↔ Builder
      { userId, builderId },
      { userId: builderId, builderId: userId },
      // User ↔ Agent
      { userId, agentId: builderId },
      { userId: builderId, agentId: userId },
      // Agent ↔ Builder
      { agentId: userId, builderId },
      { agentId: builderId, builderId: userId },
      // Agent ↔ Agent (both agents - stored with one in agentId, other in userId)
      { agentId: userId, userId: builderId },
      { agentId: builderId, userId: userId },
      // Builder ↔ Builder (both builders - stored with one in builderId, other in userId)
      ...(isUserIdBuilder && isBuilderIdBuilder ? [
        { builderId: userId, userId: builderId },
        { builderId: builderId, userId: userId },
      ] : []),
    ],
  };

  // Pagination
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;

  // Get messages
  let messages = await Message.find(filter)
    .populate('userId', 'name email role')
    .populate('builderId', 'name email')
    .populate('agentId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Handle Builder↔Builder conversations where userId contains builder ID
  // Also handle Agent↔Agent where userId contains agent ID (though this should work via populate)
  messages = await Promise.all(
    messages.map(async (msg) => {
      const msgObj = msg.toObject ? msg.toObject() : msg;
      
      // Check if this is Builder↔Builder (has both userId and builderId, no agentId)
      if (msgObj.userId && msgObj.builderId && !msgObj.agentId) {
        // Check if userId is actually a builder (not a user)
        const builderInUserId = await Builder.findById(msgObj.userId.id || msgObj.userId._id || msgObj.userId);
        if (builderInUserId) {
          // userId contains a builder, replace with builder data
          msgObj.userId = {
            id: builderInUserId._id.toString(),
            name: builderInUserId.name,
            email: builderInUserId.email,
            company: builderInUserId.company,
          };
        }
      } else if (!msgObj.userId && msgObj.builderId && !msgObj.agentId) {
        // userId is null but builderId exists - might be Builder↔Builder where userId wasn't populated
        const messageDoc = await Message.findById(msgObj._id);
        if (messageDoc && messageDoc.userId) {
          const builderInUserId = await Builder.findById(messageDoc.userId);
          if (builderInUserId) {
            msgObj.userId = {
              id: builderInUserId._id.toString(),
              name: builderInUserId.name,
              email: builderInUserId.email,
              company: builderInUserId.company,
            };
          }
        }
      }
      
      // For Agent↔Agent: userId and agentId both reference User model, so populate should work
      // But handle case where userId might be null (shouldn't happen, but be safe)
      if (msgObj.agentId && !msgObj.userId && !msgObj.builderId) {
        // This might be Agent↔Agent where userId wasn't populated
        const messageDoc = await Message.findById(msgObj._id);
        if (messageDoc && messageDoc.userId) {
          // Try to populate as user (agent)
          const agentInUserId = await User.findById(messageDoc.userId);
          if (agentInUserId && agentInUserId.role === 'agent') {
            msgObj.userId = {
              id: agentInUserId._id.toString(),
              name: agentInUserId.name,
              email: agentInUserId.email,
              role: agentInUserId.role,
            };
          }
        }
      }
      
      return msgObj;
    })
  );

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
  let populatedMessages = await Message.populate(result.messages, [
    { path: 'userId', select: 'name email role' },
    { path: 'builderId', select: 'name email' },
    { path: 'agentId', select: 'name email role' },
  ]);

  // Handle Builder↔Builder conversations where userId contains builder ID
  // Manually populate builder data for messages where userId might be a builder
  populatedMessages = await Promise.all(
    populatedMessages.map(async (msg) => {
      const msgObj = msg.toObject ? msg.toObject() : msg;
      // Check if this is Builder↔Builder (has both userId and builderId, no agentId)
      if (msgObj.userId && msgObj.builderId && !msgObj.agentId) {
        // Check if userId is actually a builder (not a user)
        // Try to find it as a builder first
        const builderInUserId = await Builder.findById(msgObj.userId.id || msgObj.userId._id || msgObj.userId);
        if (builderInUserId) {
          // userId contains a builder, replace with builder data
          msgObj.userId = {
            id: builderInUserId._id.toString(),
            name: builderInUserId.name,
            email: builderInUserId.email,
            company: builderInUserId.company,
          };
        }
      } else if (!msgObj.userId && msgObj.builderId && !msgObj.agentId) {
        // userId is null but builderId exists - might be Builder↔Builder where userId wasn't populated
        const messageDoc = await Message.findById(msgObj._id);
        if (messageDoc && messageDoc.userId) {
          const builderInUserId = await Builder.findById(messageDoc.userId);
          if (builderInUserId) {
            msgObj.userId = {
              id: builderInUserId._id.toString(),
              name: builderInUserId.name,
              email: builderInUserId.email,
              company: builderInUserId.company,
            };
          }
        }
      }
      
      // Handle Agent↔Agent: Check if userId is null but should contain an agent
      // For Agent↔Agent: agentId (sender) and userId (recipient) both reference User model
      // Populate should work, but handle edge case where it might fail
      if (msgObj.agentId && !msgObj.userId && !msgObj.builderId) {
        // This is Agent↔Agent, userId should contain the recipient agent
        const messageDoc = await Message.findById(msgObj._id);
        if (messageDoc && messageDoc.userId) {
          // Try to populate as user (agent)
          const agentInUserId = await User.findById(messageDoc.userId);
          if (agentInUserId && agentInUserId.role === 'agent') {
            msgObj.userId = {
              id: agentInUserId._id.toString(),
              name: agentInUserId.name,
              email: agentInUserId.email,
              role: agentInUserId.role,
            };
          }
        }
      }
      
      return msgObj;
    })
  );

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