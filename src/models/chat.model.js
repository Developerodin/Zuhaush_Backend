import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Made optional to support Agent↔Builder conversations
    },
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      required: false, // Made optional to support User↔Agent conversations
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Agent is a User with role='agent'
      required: false,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    senderType: {
      type: String,
      enum: ['User', 'Builder', 'Agent'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to ensure exactly 2 participants
messageSchema.pre('validate', function (next) {
  const participants = [this.userId, this.builderId, this.agentId].filter(Boolean);
  
  if (participants.length !== 2) {
    return next(new Error('Exactly two participants are required (userId, builderId, or agentId)'));
  }
  
  // Validate participant combinations based on senderType
  if (this.senderType === 'User') {
    // User can chat with Builder or Agent
    if (!this.userId) {
      return next(new Error('userId is required when senderType is User'));
    }
    if (!this.builderId && !this.agentId) {
      return next(new Error('Either builderId or agentId is required when senderType is User'));
    }
  } else if (this.senderType === 'Builder') {
    // Builder can chat with User or Agent
    if (!this.builderId) {
      return next(new Error('builderId is required when senderType is Builder'));
    }
    if (!this.userId && !this.agentId) {
      return next(new Error('Either userId or agentId is required when senderType is Builder'));
    }
  } else if (this.senderType === 'Agent') {
    // Agent can chat with User or Builder
    if (!this.agentId) {
      return next(new Error('agentId is required when senderType is Agent'));
    }
    if (!this.userId && !this.builderId) {
      return next(new Error('Either userId or builderId is required when senderType is Agent'));
    }
  }
  
  next();
});

// Add plugins
messageSchema.plugin(toJSON);

// Indexes for better performance - support all conversation types
messageSchema.index({ userId: 1, builderId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, agentId: 1, createdAt: -1 });
messageSchema.index({ builderId: 1, agentId: 1, createdAt: -1 });
messageSchema.index({ agentId: 1, createdAt: -1 });

// Create model
const Message = mongoose.model('Message', messageSchema);

export { Message };
export default { Message };