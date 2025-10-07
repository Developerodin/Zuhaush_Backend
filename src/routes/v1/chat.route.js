import express from 'express';
import validate from '../../middlewares/validate.js';
import { sendMessage, getMessageHistory, getUserMessages } from '../../validations/chat.validation.js';
import { sendMessageHandler, getMessageHistoryHandler, getUserMessagesHandler } from '../../controllers/chat.controller.js';

const router = express.Router();

// Simple chat routes
router.post('/send', validate(sendMessage), sendMessageHandler);
router.get('/history', validate(getMessageHistory), getMessageHistoryHandler);
router.get('/messages', validate(getUserMessages), getUserMessagesHandler);

export default router;