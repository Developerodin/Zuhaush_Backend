import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const citySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
citySchema.plugin(toJSON);
citySchema.plugin(paginate);

/**
 * Check if city name is taken
 * @param {string} name - The city's name
 * @param {ObjectId} [excludeCityId] - The id of the city to be excluded
 * @returns {Promise<boolean>}
 */
citySchema.statics.isNameTaken = async function (name, excludeCityId) {
  const city = await this.findOne({ name, _id: { $ne: excludeCityId } });
  return !!city;
};

/**
 * @typedef City
 */
const City = mongoose.model('City', citySchema);

export default City;
