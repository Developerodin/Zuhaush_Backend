import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const notificationSchema = mongoose.Schema(
  {
    // Basic notification info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    
    // Recipient information (either user or builder)
    recipientType: {
      type: String,
      required: true,
      enum: ['user', 'builder'],
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientType',
    },
    
    // Notification type for categorization
    notificationType: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    
    // Priority level
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
    },
    
    // Action data (optional - for interactive notifications)
    actionData: {
      type: {
        type: String,
        enum: ['visit_property', 'view_profile', 'reply_message', 'view_document', 'none'],
        default: 'none',
      },
      url: {
        type: String,
        required: false,
        trim: true,
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    },
    
    // Sender information (optional)
    senderType: {
      type: String,
      enum: ['system', 'user', 'builder', 'admin'],
      default: 'system',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'senderType',
    },
    
    // Delivery channels
    deliveryChannels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: false,
      },
    },
    
    // Delivery status
    deliveryStatus: {
      inApp: {
        delivered: {
          type: Boolean,
          default: true,
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
      email: {
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
          required: false,
        },
        failed: {
          type: Boolean,
          default: false,
        },
        failureReason: {
          type: String,
          required: false,
        },
      },
      sms: {
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
          required: false,
        },
        failed: {
          type: Boolean,
          default: false,
        },
        failureReason: {
          type: String,
          required: false,
        },
      },
      push: {
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: {
          type: Date,
          required: false,
        },
        failed: {
          type: Boolean,
          default: false,
        },
        failureReason: {
          type: String,
          required: false,
        },
      },
    },
    
    // Expiration
    expiresAt: {
      type: Date,
      required: false,
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
notificationSchema.index({ recipientType: 1, recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, recipientId: 1, isRead: 1 });
notificationSchema.index({ notificationType: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * Mark notification as read
 * @returns {Promise<Notification>}
 */
notificationSchema.methods.markAsRead = function () {
  const notification = this;
  notification.isRead = true;
  notification.readAt = new Date();
  return notification.save();
};

/**
 * Mark notification as unread
 * @returns {Promise<Notification>}
 */
notificationSchema.methods.markAsUnread = function () {
  const notification = this;
  notification.isRead = false;
  notification.readAt = undefined;
  return notification.save();
};

/**
 * Check if notification is expired
 * @returns {boolean}
 */
notificationSchema.methods.isExpired = function () {
  const notification = this;
  return notification.expiresAt && notification.expiresAt < new Date();
};

/**
 * Update delivery status for a specific channel
 * @param {string} channel - Delivery channel (email, sms, push)
 * @param {boolean} delivered - Whether delivery was successful
 * @param {string} [failureReason] - Reason for failure if not delivered
 * @returns {Promise<Notification>}
 */
notificationSchema.methods.updateDeliveryStatus = function (channel, delivered, failureReason = null) {
  const notification = this;
  
  if (!notification.deliveryChannels[channel]) {
    throw new Error(`Channel ${channel} is not enabled for this notification`);
  }
  
  notification.deliveryStatus[channel] = {
    delivered,
    deliveredAt: delivered ? new Date() : notification.deliveryStatus[channel].deliveredAt,
    failed: !delivered,
    failureReason: !delivered ? failureReason : null,
  };
  
  return notification.save();
};

/**
 * Get unread notifications count for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<number>}
 */
notificationSchema.statics.getUnreadCount = async function (recipientType, recipientId) {
  const count = await this.countDocuments({
    recipientType,
    recipientId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  return count;
};

/**
 * Get notifications for a recipient with pagination
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
notificationSchema.statics.getNotificationsForRecipient = async function (recipientType, recipientId, options = {}) {
  const {
    page = 1,
    limit = 20,
    isRead = null,
    notificationType = null,
    priority = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const query = {
    recipientType,
    recipientId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (isRead !== null) {
    query.isRead = isRead;
  }
  
  if (notificationType) {
    query.notificationType = notificationType;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const notifications = await this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('recipientId', 'name email')
    .populate('senderId', 'name email');
  
  const total = await this.countDocuments(query);
  
  return {
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Mark all notifications as read for a recipient
 * @param {string} recipientType - 'user' or 'builder'
 * @param {ObjectId} recipientId - Recipient ID
 * @returns {Promise<Object>}
 */
notificationSchema.statics.markAllAsRead = async function (recipientType, recipientId) {
  const result = await this.updateMany(
    {
      recipientType,
      recipientId,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  return result;
};

/**
 * Delete expired notifications
 * @returns {Promise<Object>}
 */
notificationSchema.statics.deleteExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result;
};

/**
 * Create notification for a recipient
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Notification>}
 */
notificationSchema.statics.createNotification = async function (notificationData) {
  const {
    title,
    description,
    recipientType,
    recipientId,
    notificationType,
    priority = 'medium',
    actionData = { type: 'none' },
    senderType = 'system',
    senderId = null,
    deliveryChannels = { inApp: true },
    expiresAt = null,
    metadata = null
  } = notificationData;
  
  const notification = await this.create({
    title,
    description,
    recipientType,
    recipientId,
    notificationType,
    priority,
    actionData,
    senderType,
    senderId,
    deliveryChannels,
    expiresAt,
    metadata
  });
  
  return notification;
};

/**
 * Create bulk notifications for multiple recipients
 * @param {Array} notificationsData - Array of notification data
 * @returns {Promise<Array>}
 */
notificationSchema.statics.createBulkNotifications = async function (notificationsData) {
  const notifications = await this.insertMany(notificationsData);
  return notifications;
};

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
