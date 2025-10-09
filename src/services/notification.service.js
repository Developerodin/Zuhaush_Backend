import httpStatus from 'http-status';
import Notification from '../models/notification.model.js';
import ApiError from '../utils/ApiError.js';
import { getUserById } from './user.service.js';
import { getBuilderById } from './builder.service.js';

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
  const notification = await Notification.createNotification(notificationBody);
  return notification;
};

/**
 * Create multiple notifications at once
 * @param {Array} notificationsData
 * @returns {Promise<Array>}
 */
const createBulkNotifications = async (notificationsData) => {
  const notifications = await Notification.createBulkNotifications(notificationsData);
  return notifications;
};

/**
 * Get notifications for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getNotificationsForRecipient = async (recipientType, recipientId, options = {}) => {
  // Verify recipient exists
  if (recipientType === 'user') {
    await getUserById(recipientId);
  } else if (recipientType === 'builder') {
    await getBuilderById(recipientId);
  }

  const result = await Notification.getNotificationsForRecipient(recipientType, recipientId, options);
  return result;
};

/**
 * Get unread notifications count for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<number>}
 */
const getUnreadCount = async (recipientType, recipientId) => {
  const count = await Notification.getUnreadCount(recipientType, recipientId);
  return count;
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<Notification>}
 */
const markNotificationAsRead = async (notificationId, recipientType, recipientId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipientType,
    recipientId,
  });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await notification.markAsRead();
  return notification;
};

/**
 * Mark all notifications as read for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<Object>}
 */
const markAllNotificationsAsRead = async (recipientType, recipientId) => {
  const result = await Notification.markAllAsRead(recipientType, recipientId);
  return result;
};

/**
 * Delete a notification
 * @param {ObjectId} notificationId
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<void>}
 */
const deleteNotification = async (notificationId, recipientType, recipientId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipientType,
    recipientId,
  });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await notification.deleteOne();
};

/**
 * Delete all notifications for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<Object>}
 */
const deleteAllNotifications = async (recipientType, recipientId) => {
  const result = await Notification.deleteMany({
    recipientType,
    recipientId,
  });
  return result;
};

/**
 * Get notification by ID
 * @param {ObjectId} notificationId
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (notificationId, recipientType, recipientId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipientType,
    recipientId,
  }).populate('senderId', 'name email');

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

// ==================== NOTIFICATION HELPER FUNCTIONS ====================

/**
 * Create property-related notifications
 * @param {Object} data - Property notification data
 * @returns {Promise<Array>}
 */
const createPropertyNotifications = async (data) => {
  const { property, action, userId, builderId, additionalData = {} } = data;
  
  const notifications = [];

  switch (action) {
    case 'property_shortlisted':
      if (builderId) {
        notifications.push({
          title: 'Property Shortlisted',
          description: `A user has shortlisted your property "${property.title}"`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'user_shortlist',
          priority: 'medium',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id, userId }
          },
          senderType: 'user',
          senderId: userId,
          metadata: { propertyId: property._id, propertyTitle: property.title }
        });
      }
      break;

    case 'property_viewed':
      if (builderId) {
        notifications.push({
          title: 'Property Viewed',
          description: `A user viewed your property "${property.title}"`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'user_view',
          priority: 'low',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id, userId }
          },
          senderType: 'user',
          senderId: userId,
          metadata: { propertyId: property._id, propertyTitle: property.title }
        });
      }
      break;

    case 'property_approved':
      if (builderId) {
        notifications.push({
          title: 'Property Approved',
          description: `Your property "${property.title}" has been approved and is now live`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'property_approved',
          priority: 'high',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.title }
        });
      }
      break;

    case 'property_rejected':
      if (builderId) {
        notifications.push({
          title: 'Property Rejected',
          description: `Your property "${property.title}" was rejected. ${additionalData.reason || 'Please review and resubmit.'}`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'property_rejected',
          priority: 'high',
          actionData: {
            type: 'view_document',
            url: `/properties/${property._id}/edit`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.title, reason: additionalData.reason }
        });
      }
      break;

    case 'new_property_match':
      if (userId) {
        notifications.push({
          title: 'New Property Match',
          description: `A new property "${property.title}" matches your preferences`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'new_property_match',
          priority: 'medium',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.title }
        });
      }
      break;

    case 'price_drop':
      if (userId) {
        notifications.push({
          title: 'Price Drop Alert',
          description: `The price of "${property.title}" has dropped to ₹${additionalData.newPrice}`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'price_drop',
          priority: 'high',
          actionData: {
            type: 'visit_property',
            url: `/properties/${property._id}`,
            metadata: { propertyId: property._id }
          },
          metadata: { propertyId: property._id, propertyTitle: property.title, newPrice: additionalData.newPrice }
        });
      }
      break;
  }

  if (notifications.length > 0) {
    return await createBulkNotifications(notifications);
  }
  
  return [];
};

/**
 * Create visit-related notifications
 * @param {Object} data - Visit notification data
 * @returns {Promise<Array>}
 */
const createVisitNotifications = async (data) => {
  const { visit, action, userId, builderId, additionalData = {} } = data;
  
  const notifications = [];

  switch (action) {
    case 'visit_scheduled':
      if (builderId) {
        notifications.push({
          title: 'New Visit Request',
          description: `A user has requested a visit for "${visit.property.title}" on ${new Date(visit.scheduledDate).toLocaleDateString()}`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'visit_request',
          priority: 'high',
          actionData: {
            type: 'view_document',
            url: `/visits/${visit._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          senderType: 'user',
          senderId: userId,
          metadata: { visitId: visit._id, propertyId: visit.property._id, scheduledDate: visit.scheduledDate }
        });
      }
      
      if (userId) {
        notifications.push({
          title: 'Visit Scheduled',
          description: `Your visit for "${visit.property.title}" is scheduled for ${new Date(visit.scheduledDate).toLocaleDateString()}`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'visit_scheduled',
          priority: 'medium',
          actionData: {
            type: 'view_document',
            url: `/visits/${visit._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          metadata: { visitId: visit._id, propertyId: visit.property._id, scheduledDate: visit.scheduledDate }
        });
      }
      break;

    case 'visit_confirmed':
      if (userId) {
        notifications.push({
          title: 'Visit Confirmed',
          description: `Your visit for "${visit.property.title}" has been confirmed by the builder`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'visit_confirmed',
          priority: 'medium',
          actionData: {
            type: 'view_document',
            url: `/visits/${visit._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          metadata: { visitId: visit._id, propertyId: visit.property._id, confirmedDate: visit.confirmedDate }
        });
      }
      break;

    case 'visit_cancelled':
      if (userId && builderId) {
        notifications.push({
          title: 'Visit Cancelled',
          description: `Your visit for "${visit.property.title}" has been cancelled`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'visit_cancelled',
          priority: 'medium',
          actionData: {
            type: 'visit_property',
            url: `/properties/${visit.property._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          metadata: { visitId: visit._id, propertyId: visit.property._id, cancelledDate: visit.cancelledDate }
        });

        notifications.push({
          title: 'Visit Cancelled',
          description: `A user has cancelled their visit for "${visit.property.title}"`,
          recipientType: 'builder',
          recipientId: builderId,
          notificationType: 'visit_cancelled_by_user',
          priority: 'medium',
          actionData: {
            type: 'view_document',
            url: `/visits/${visit._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          senderType: 'user',
          senderId: userId,
          metadata: { visitId: visit._id, propertyId: visit.property._id, cancelledDate: visit.cancelledDate }
        });
      }
      break;

    case 'visit_reminder':
      if (userId) {
        notifications.push({
          title: 'Visit Reminder',
          description: `Don't forget! You have a visit scheduled for "${visit.property.title}" tomorrow`,
          recipientType: 'user',
          recipientId: userId,
          notificationType: 'visit_reminder',
          priority: 'high',
          actionData: {
            type: 'view_document',
            url: `/visits/${visit._id}`,
            metadata: { visitId: visit._id, propertyId: visit.property._id }
          },
          metadata: { visitId: visit._id, propertyId: visit.property._id, scheduledDate: visit.scheduledDate }
        });
      }
      break;
  }

  if (notifications.length > 0) {
    return await createBulkNotifications(notifications);
  }
  
  return [];
};

/**
 * Create chat-related notifications
 * @param {Object} data - Chat notification data
 * @returns {Promise<Array>}
 */
const createChatNotifications = async (data) => {
  const { message, action, senderId, recipientId, recipientType, additionalData = {} } = data;
  
  const notifications = [];

  switch (action) {
    case 'new_message':
      notifications.push({
        title: 'New Message',
        description: `You have a new message: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`,
        recipientType,
        recipientId,
        notificationType: recipientType === 'user' ? 'builder_message' : 'user_inquiry',
        priority: 'medium',
        actionData: {
          type: 'reply_message',
          url: `/chat/${message.chatId}`,
          metadata: { chatId: message.chatId, messageId: message._id }
        },
        senderType: recipientType === 'user' ? 'builder' : 'user',
        senderId,
        metadata: { chatId: message.chatId, messageId: message._id }
      });
      break;

    case 'chat_initiated':
      if (recipientType === 'builder') {
        notifications.push({
          title: 'New Chat Started',
          description: `A user has started a conversation with you`,
          recipientType,
          recipientId,
          notificationType: 'user_inquiry',
          priority: 'medium',
          actionData: {
            type: 'reply_message',
            url: `/chat/${message.chatId}`,
            metadata: { chatId: message.chatId }
          },
          senderType: 'user',
          senderId,
          metadata: { chatId: message.chatId }
        });
      }
      break;
  }

  if (notifications.length > 0) {
    return await createBulkNotifications(notifications);
  }
  
  return [];
};

/**
 * Create system notifications
 * @param {Object} data - System notification data
 * @returns {Promise<Array>}
 */
const createSystemNotifications = async (data) => {
  const { title, description, recipientType, recipientId, notificationType, priority = 'medium', actionData = { type: 'none' }, metadata = null } = data;
  
  const notification = await createNotification({
    title,
    description,
    recipientType,
    recipientId,
    notificationType,
    priority,
    actionData,
    metadata
  });

  return [notification];
};

/**
 * Create welcome notification for new users/builders
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @param {string} name - Recipient name
 * @returns {Promise<Notification>}
 */
const createWelcomeNotification = async (recipientType, recipientId, name) => {
  const notification = await createNotification({
    title: 'Welcome to Zuhaush!',
    description: `Welcome ${name}! We're excited to have you on board. Start exploring properties and connect with builders.`,
    recipientType,
    recipientId,
    notificationType: 'welcome',
    priority: 'medium',
    actionData: {
      type: 'none'
    },
    metadata: { welcomeMessage: true }
  });

  return notification;
};

/**
 * Create profile status notifications
 * @param {Object} data - Profile notification data
 * @returns {Promise<Array>}
 */
const createProfileNotifications = async (data) => {
  const { builderId, action, additionalData = {} } = data;
  
  const notifications = [];

  switch (action) {
    case 'profile_approved':
      notifications.push({
        title: 'Profile Approved',
        description: 'Congratulations! Your builder profile has been approved and is now live.',
        recipientType: 'builder',
        recipientId: builderId,
        notificationType: 'profile_approved',
        priority: 'high',
        actionData: {
          type: 'view_profile',
          url: '/builder/profile',
          metadata: { profileApproved: true }
        },
        metadata: { approvedAt: new Date() }
      });
      break;

    case 'profile_rejected':
      notifications.push({
        title: 'Profile Rejected',
        description: `Your builder profile was rejected. ${additionalData.reason || 'Please review and resubmit.'}`,
        recipientType: 'builder',
        recipientId: builderId,
        notificationType: 'profile_rejected',
        priority: 'high',
        actionData: {
          type: 'view_profile',
          url: '/builder/profile/edit',
          metadata: { profileRejected: true }
        },
        metadata: { rejectedAt: new Date(), reason: additionalData.reason }
      });
      break;
  }

  if (notifications.length > 0) {
    return await createBulkNotifications(notifications);
  }
  
  return [];
};

export {
  createNotification,
  createBulkNotifications,
  getNotificationsForRecipient,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
  // Helper functions
  createPropertyNotifications,
  createVisitNotifications,
  createChatNotifications,
  createSystemNotifications,
  createWelcomeNotification,
  createProfileNotifications,
};
