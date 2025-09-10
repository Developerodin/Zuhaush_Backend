import httpStatus from 'http-status';
import City from '../models/city.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a city
 * @param {Object} cityBody
 * @returns {Promise<City>}
 */
const createCity = async (cityBody) => {
  if (await City.isNameTaken(cityBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'City name already taken');
  }
  return City.create(cityBody);
};

/**
 * Query for cities
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCities = async (filter, options) => {
  const cities = await City.paginate(filter, options);
  return cities;
};

/**
 * Get city by id
 * @param {ObjectId} id
 * @returns {Promise<City>}
 */
const getCityById = async (id) => {
  return City.findById(id);
};

/**
 * Get city by name
 * @param {string} name
 * @returns {Promise<City>}
 */
const getCityByName = async (name) => {
  return City.findOne({ name, isActive: true });
};

/**
 * Update city by id
 * @param {ObjectId} cityId
 * @param {Object} updateBody
 * @returns {Promise<City>}
 */
const updateCityById = async (cityId, updateBody) => {
  const city = await getCityById(cityId);
  if (!city) {
    throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
  }
  if (updateBody.name && (await City.isNameTaken(updateBody.name, cityId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'City name already taken');
  }
  Object.assign(city, updateBody);
  await city.save();
  return city;
};

/**
 * Delete city by id
 * @param {ObjectId} cityId
 * @returns {Promise<City>}
 */
const deleteCityById = async (cityId) => {
  const city = await getCityById(cityId);
  if (!city) {
    throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
  }
  await city.remove();
  return city;
};

/**
 * Search cities by name
 * @param {string} searchTerm
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const searchCities = async (searchTerm, options = {}) => {
  const filter = {
    name: { $regex: searchTerm, $options: 'i' },
    isActive: true,
  };
  return queryCities(filter, options);
};

/**
 * Get all active cities
 * @returns {Promise<City[]>}
 */
const getAllActiveCities = async () => {
  return City.find({ isActive: true }).sort({ name: 1 });
};

export {
  createCity,
  queryCities,
  getCityById,
  getCityByName,
  updateCityById,
  deleteCityById,
  searchCities,
  getAllActiveCities,
};
