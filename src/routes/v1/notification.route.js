import express from 'express';
import auth from '../../middlewares/auth.js';
import adminAuth from '../../middlewares/adminAuth.js';
import validate from '../../middlewares/validate.js';
import {
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
} from '../../controllers/notification.controller.js';
import {
  createNotificationValidation,
  getNotificationsValidation,
} from '../../validations/notification.validation.js';

const router = express.Router();

// ==================== USER/BUILDER ROUTES ====================

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications for authenticated user/builder
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: notificationType
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, priority, notificationType]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', auth(), validate(getNotificationsValidation), getNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/unread-count', auth(), getUnreadNotificationsCount);

/**
 * @swagger
 * /api/v1/notifications/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:notificationId', auth(), getNotification);

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:notificationId/read', auth(), markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:notificationId', auth(), deleteNotificationById);

/**
 * @swagger
 * /api/v1/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as read"
 *                 modifiedCount:
 *                   type: integer
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/mark-all-read', auth(), markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/delete-all:
 *   delete:
 *     summary: Delete all notifications for authenticated user/builder
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications deleted"
 *                 deletedCount:
 *                   type: integer
 *                   example: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/delete-all', auth(), deleteAllUserNotifications);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/v1/notifications/admin/create:
 *   post:
 *     summary: Create custom notification (admin only)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - recipientType
 *               - recipientId
 *               - notificationType
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: "System Maintenance"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "The system will be under maintenance from 2 AM to 4 AM"
 *               recipientType:
 *                 type: string
 *                 enum: [user, builder]
 *                 example: "user"
 *               recipientId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *               notificationType:
 *                 type: string
 *                 example: "system_announcement"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: "medium"
 *               actionData:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [visit_property, view_profile, reply_message, view_document, none]
 *                     default: "none"
 *                   url:
 *                     type: string
 *                     example: "/properties/60d0fe4f5311236168a109ca"
 *                   metadata:
 *                     type: object
 *               deliveryChannels:
 *                 type: object
 *                 properties:
 *                   inApp:
 *                     type: boolean
 *                     default: true
 *                   email:
 *                     type: boolean
 *                     default: false
 *                   sms:
 *                     type: boolean
 *                     default: false
 *                   push:
 *                     type: boolean
 *                     default: false
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/admin/create', adminAuth(), validate(createNotificationValidation), createCustomNotification);

/**
 * @swagger
 * /api/v1/notifications/admin/user/{recipientType}/{recipientId}:
 *   get:
 *     summary: Get notifications for specific user/builder (admin only)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipientType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, builder]
 *         description: Recipient type
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipient ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: notificationType
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/user/:recipientType/:recipientId', adminAuth(), validate(getNotificationsValidation), getNotificationsForUser);

/**
 * @swagger
 * /api/v1/notifications/admin/stats:
 *   get:
 *     summary: Get notification statistics (admin only)
 *     tags: [Notifications, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "user"
 *                       notifications:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                             isRead:
 *                               type: boolean
 *                             count:
 *                               type: integer
 *                       total:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/stats', adminAuth(), getNotificationStats);

export default router;
