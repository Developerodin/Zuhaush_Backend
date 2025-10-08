import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const propertyViewSchema = mongoose.Schema(
  {
    // User who viewed the property
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Property that was viewed
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    
    // Timestamp when the property was viewed
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
propertyViewSchema.plugin(toJSON);
propertyViewSchema.plugin(paginate);

// Indexes for better query performance
propertyViewSchema.index({ user: 1, viewedAt: -1 });
propertyViewSchema.index({ property: 1, viewedAt: -1 });
propertyViewSchema.index({ user: 1, property: 1 });

/**
 * @typedef PropertyView
 */
const PropertyView = mongoose.model('PropertyView', propertyViewSchema);

export default PropertyView;
