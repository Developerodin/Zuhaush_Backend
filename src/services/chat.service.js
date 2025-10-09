import mongoose from 'mongoose';
import { Message } from '../models/chat.model.js';

/**
 * Send a message
 * @param {string} userId - User ID
 * @param {string} builderId - Builder ID
 * @param {string} message - Message content
 * @param {string} senderType - Sender type ('User' or 'Builder')
 * @returns {Promise<Message>}
 */
const sendMessage = async (userId, builderId, message, senderType) => {
  const newMessage = await Message.create({
    userId,
    builderId,
    message,
    senderType,
  });

  const populatedMessage = await newMessage.populate('userId', 'name email').populate('builderId', 'name email');

  // Create notification for the recipient
  try {
    const { createChatNotifications } = await import('./notification.service.js');
    
    // Determine recipient type and ID
    const recipientType = senderType === 'User' ? 'builder' : 'user';
    const recipientId = senderType === 'User' ? builderId : userId;
    const senderId = senderType === 'User' ? userId : builderId;
    
    await createChatNotifications({
      message: populatedMessage,
      action: 'new_message',
      senderId,
      recipientId,
      recipientType
    });
  } catch (error) {
    console.error('Failed to create chat notification:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }

  return populatedMessage;
};

/**
 * Get message history between user and builder
 * @param {string} userId - User ID
 * @param {string} builderId - Builder ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getMessageHistory = async (userId, builderId, options = {}) => {
  const filter = {
    $or: [
      { userId, builderId },
      { userId: builderId, builderId: userId },
    ],
  };

  // Pagination
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find(filter)
    .populate('userId', 'name email')
    .populate('builderId', 'name email')
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
 * Get all messages for a user (receive messages) - Returns only latest message per conversation
 * @param {string} userId - User ID
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
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ userId: userObjectId }, { builderId: userObjectId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $addFields: {
        conversationKey: {
          $cond: {
            if: { $lt: [{ $toString: '$userId' }, { $toString: '$builderId' }] },
            then: { $concat: [{ $toString: '$userId' }, '-', { $toString: '$builderId' }] },
            else: { $concat: [{ $toString: '$builderId' }, '-', { $toString: '$userId' }] },
          },
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

  // Populate user and builder details
  const result = messages[0];
  const populatedMessages = await Message.populate(result.messages, [
    { path: 'userId', select: 'name email' },
    { path: 'builderId', select: 'name email' },
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