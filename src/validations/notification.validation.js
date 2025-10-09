import Joi from 'joi';

const createNotification = {
  body: Joi.object().keys({
    title: Joi.string().required().trim().max(200),
    description: Joi.string().required().trim().max(1000),
    recipientType: Joi.string().required().valid('user', 'builder'),
    recipientId: Joi.string().required(),
    notificationType: Joi.string().required().valid(
      // User notifications
      'property_shortlisted',
      'property_viewed',
      'visit_scheduled',
      'visit_reminder',
      'visit_confirmed',
      'visit_cancelled',
      'new_property_match',
      'price_drop',
      'property_sold',
      'builder_message',
      'system_announcement',
      
      // Builder notifications
      'property_approved',
      'property_rejected',
      'property_published',
      'visit_request',
      'visit_confirmed_by_user',
      'visit_cancelled_by_user',
      'user_inquiry',
      'user_shortlist',
      'user_view',
      'profile_approved',
      'profile_rejected',
      'team_member_added',
      'team_member_removed',
      
      // General notifications
      'welcome',
      'email_verification',
      'password_reset',
      'account_suspended',
      'account_reactivated',
    ),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    actionData: Joi.object().keys({
      type: Joi.string().valid('visit_property', 'view_profile', 'reply_message', 'view_document', 'none').default('none'),
      url: Joi.string().uri().allow(''),
      metadata: Joi.object().default({}),
    }).default({ type: 'none' }),
    senderType: Joi.string().valid('system', 'user', 'builder', 'admin').default('system'),
    senderId: Joi.string().allow(null),
    deliveryChannels: Joi.object().keys({
      inApp: Joi.boolean().default(true),
      email: Joi.boolean().default(false),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(false),
    }).default({ inApp: true }),
    expiresAt: Joi.date().iso().allow(null),
    metadata: Joi.object().allow(null),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean(),
    notificationType: Joi.string().valid(
      'property_shortlisted',
      'property_viewed',
      'visit_scheduled',
      'visit_reminder',
      'visit_confirmed',
      'visit_cancelled',
      'new_property_match',
      'price_drop',
      'property_sold',
      'builder_message',
      'system_announcement',
      'property_approved',
      'property_rejected',
      'property_published',
      'visit_request',
      'visit_confirmed_by_user',
      'visit_cancelled_by_user',
      'user_inquiry',
      'user_shortlist',
      'user_view',
      'profile_approved',
      'profile_rejected',
      'team_member_added',
      'team_member_removed',
      'welcome',
      'email_verification',
      'password_reset',
      'account_suspended',
      'account_reactivated',
    ),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    sortBy: Joi.string().valid('createdAt', 'priority', 'notificationType', 'isRead').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

const getNotificationById = {
  params: Joi.object().keys({
    notificationId: Joi.string().required(),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().required(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().required(),
  }),
};

const getNotificationsForUser = {
  params: Joi.object().keys({
    recipientType: Joi.string().required().valid('user', 'builder'),
    recipientId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean(),
    notificationType: Joi.string().valid(
      'property_shortlisted',
      'property_viewed',
      'visit_scheduled',
      'visit_reminder',
      'visit_confirmed',
      'visit_cancelled',
      'new_property_match',
      'price_drop',
      'property_sold',
      'builder_message',
      'system_announcement',
      'property_approved',
      'property_rejected',
      'property_published',
      'visit_request',
      'visit_confirmed_by_user',
      'visit_cancelled_by_user',
      'user_inquiry',
      'user_shortlist',
      'user_view',
      'profile_approved',
      'profile_rejected',
      'team_member_added',
      'team_member_removed',
      'welcome',
      'email_verification',
      'password_reset',
      'account_suspended',
      'account_reactivated',
    ),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    sortBy: Joi.string().valid('createdAt', 'priority', 'notificationType', 'isRead').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export {
  createNotification as createNotificationValidation,
  getNotifications as getNotificationsValidation,
  getNotificationById as getNotificationByIdValidation,
  markAsRead as markAsReadValidation,
  deleteNotification as deleteNotificationValidation,
  getNotificationsForUser as getNotificationsForUserValidation,
};
