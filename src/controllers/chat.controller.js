import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { sendMessage, getMessageHistory, getUserMessages } from '../services/chat.service.js';

/**
 * Send a message
 */
const sendMessageHandler = catchAsync(async (req, res) => {
  const { userId, builderId, message, senderType } = req.body;

  const newMessage = await sendMessage(userId, builderId, message, senderType);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Message sent successfully',
    data: newMessage,
  });
});

/**
 * Get message history between user and builder
 */
const getMessageHistoryHandler = catchAsync(async (req, res) => {
  const { userId, builderId } = req.query;
  const { page = 1, limit = 50 } = req.query;

  const result = await getMessageHistory(userId, builderId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Message history retrieved successfully',
    data: result,
  });
});

/**
 * Get all messages for a user (receive messages)
 */
const getUserMessagesHandler = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const { page = 1, limit = 50 } = req.query;

  const result = await getUserMessages(userId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

export { sendMessageHandler, getMessageHistoryHandler, getUserMessagesHandler };