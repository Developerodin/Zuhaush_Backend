import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createNotification,
  getNotificationsForRecipient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
} from '../services/notification.service.js';

/**
 * Get notifications for authenticated user/builder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotifications = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  
  const filter = pick(req.query, ['isRead', 'notificationType', 'priority']);
  const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
  
  const result = await getNotificationsForRecipient(recipientType, recipientId, { ...filter, ...options });
  
  res.send(result);
});

/**
 * Get unread notifications count for authenticated user/builder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadNotificationsCount = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  
  const count = await getUnreadCount(recipientType, recipientId);
  
  res.send({ unreadCount: count });
});

/**
 * Get notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotification = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  const { notificationId } = req.params;
  
  const notification = await getNotificationById(notificationId, recipientType, recipientId);
  
  res.send(notification);
});

/**
 * Mark notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsRead = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  const { notificationId } = req.params;
  
  const notification = await markNotificationAsRead(notificationId, recipientType, recipientId);
  
  res.send(notification);
});

/**
 * Mark all notifications as read for authenticated user/builder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  
  const result = await markAllNotificationsAsRead(recipientType, recipientId);
  
  res.send({
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount
  });
});

/**
 * Delete notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotificationById = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  const { notificationId } = req.params;
  
  await deleteNotification(notificationId, recipientType, recipientId);
  
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Delete all notifications for authenticated user/builder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAllUserNotifications = catchAsync(async (req, res) => {
  const { user } = req;
  const recipientType = user.role === 'builder' ? 'builder' : 'user';
  const recipientId = user._id;
  
  const result = await deleteAllNotifications(recipientType, recipientId);
  
  res.send({
    message: 'All notifications deleted',
    deletedCount: result.deletedCount
  });
});

/**
 * Create a custom notification (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCustomNotification = catchAsync(async (req, res) => {
  const notification = await createNotification(req.body);
  res.status(httpStatus.CREATED).send(notification);
});

/**
 * Get notifications for a specific user/builder (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotificationsForUser = catchAsync(async (req, res) => {
  const { recipientType, recipientId } = req.params;
  const filter = pick(req.query, ['isRead', 'notificationType', 'priority']);
  const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
  
  const result = await getNotificationsForRecipient(recipientType, recipientId, { ...filter, ...options });
  
  res.send(result);
});

/**
 * Get notification statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotificationStats = catchAsync(async (req, res) => {
  const { Notification } = await import('../models/notification.model.js');
  
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: {
          recipientType: '$recipientType',
          notificationType: '$notificationType',
          isRead: '$isRead'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.recipientType',
        notifications: {
          $push: {
            type: '$_id.notificationType',
            isRead: '$_id.isRead',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
  
  res.send({ stats });
});

export {
  getNotifications,
  getUnreadNotificationsCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
  deleteAllUserNotifications,
  createCustomNotification,
  getNotificationsForUser,
  getNotificationStats,
};
