import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    senderType: {
      type: String,
      enum: ['User', 'Builder'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
messageSchema.plugin(toJSON);

// Indexes for better performance
messageSchema.index({ userId: 1, builderId: 1, createdAt: -1 });

// Create model
const Message = mongoose.model('Message', messageSchema);

export { Message };
export default { Message };