import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { 
  createCity, 
  queryCities, 
  getCityById, 
  updateCityById, 
  deleteCityById,
  searchCities,
  getAllActiveCities
} from '../services/city.service.js';

const createCityController = catchAsync(async (req, res) => {
  const city = await createCity(req.body);
  res.status(httpStatus.CREATED).send(city);
});

const getCities = catchAsync(async (req, res) => {
  const filter = {};
  const options = {};
  const result = await queryCities(filter, options);
  res.send(result);
});

const getCity = catchAsync(async (req, res) => {
  const city = await getCityById(req.params.cityId);
  res.send(city);
});

const updateCity = catchAsync(async (req, res) => {
  const city = await updateCityById(req.params.cityId, req.body);
  res.send(city);
});

const deleteCity = catchAsync(async (req, res) => {
  await deleteCityById(req.params.cityId);
  res.status(httpStatus.NO_CONTENT).send();
});

const searchCitiesController = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Search query is required' });
  }
  
  const options = {
    sortBy: 'name:asc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
  };
  
  const result = await searchCities(q, options);
  res.send(result);
});

const getActiveCities = catchAsync(async (req, res) => {
  const cities = await getAllActiveCities();
  res.send(cities);
});

export {
  createCityController,
  getCities,
  getCity,
  updateCity,
  deleteCity,
  searchCitiesController,
  getActiveCities,
};
