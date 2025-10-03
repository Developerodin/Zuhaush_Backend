import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createProperty = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().max(200),
    type: Joi.string().required().valid('apartment', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'other'),
    bhk: Joi.string().required().pattern(/^\d+\.?\d*\s*(BHK|RK|Studio)$/i),
    area: Joi.object({
      value: Joi.number().required().min(0),
      unit: Joi.string().valid('sqft', 'sqm', 'acre', 'hectare').default('sqft'),
    }).required(),
    price: Joi.object({
      value: Joi.number().required().min(0),
      unit: Joi.string().valid('lakh', 'crore', 'rupees').default('lakh'),
    }).required(),
    city: Joi.string().required().trim().max(100),
    locality: Joi.string().required().trim().max(200),
    geo: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      address: Joi.string().trim().max(500),
    }),
    amenities: Joi.array().items(
      Joi.object({
        category: Joi.string().valid('basic', 'lifestyle', 'security', 'parking', 'maintenance', 'other'),
        name: Joi.string().required().trim().max(100),
        description: Joi.string().trim().max(200),
      })
    ),
    description: Joi.string().trim().max(2000),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()),
    availability: Joi.object({
      isAvailable: Joi.boolean().default(true),
      availableFrom: Joi.date(),
      possessionDate: Joi.date(),
    }),
    contact: Joi.object({
      phone: Joi.string().trim().pattern(/^[0-9+\-\s()]+$/),
      email: Joi.string().email().lowercase(),
      whatsapp: Joi.string().trim().pattern(/^[0-9+\-\s()]+$/),
    }),
    seo: Joi.object({
      title: Joi.string().trim().max(60),
      description: Joi.string().trim().max(160),
      keywords: Joi.array().items(Joi.string().trim()),
    }),
    flags: Joi.array().items(
      Joi.string().valid('featured', 'new_launch', 'premium', 'best_seller', 'limited_offer', 'verified', 'trending')
    ),
  }),
};

const getProperties = {
  query: Joi.object().keys({
    builder: Joi.string().custom(objectId),
    type: Joi.string().valid('apartment', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'other'),
    city: Joi.string().trim(),
    locality: Joi.string().trim(),
    bhk: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    minArea: Joi.number().min(0),
    maxArea: Joi.number().min(0),
    status: Joi.string().valid('draft', 'active', 'sold', 'rented', 'inactive', 'archived'),
    adminApproved: Joi.boolean(),
    flags: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const getPropertyBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
};

const updateProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim().max(200),
      type: Joi.string().valid('apartment', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'other'),
      bhk: Joi.string().pattern(/^\d+\.?\d*\s*(BHK|RK|Studio)$/i),
      area: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('sqft', 'sqm', 'acre', 'hectare'),
      }),
      price: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().valid('lakh', 'crore', 'rupees'),
      }),
      city: Joi.string().trim().max(100),
      locality: Joi.string().trim().max(200),
      geo: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
        address: Joi.string().trim().max(500),
      }),
      amenities: Joi.array().items(
        Joi.object({
          category: Joi.string().valid('basic', 'lifestyle', 'security', 'parking', 'maintenance', 'other'),
          name: Joi.string().trim().max(100),
          description: Joi.string().trim().max(200),
        })
      ),
      description: Joi.string().trim().max(2000),
      specifications: Joi.object().pattern(Joi.string(), Joi.string()),
      availability: Joi.object({
        isAvailable: Joi.boolean(),
        availableFrom: Joi.date(),
        possessionDate: Joi.date(),
      }),
      contact: Joi.object({
        phone: Joi.string().trim().pattern(/^[0-9+\-\s()]+$/),
        email: Joi.string().email().lowercase(),
        whatsapp: Joi.string().trim().pattern(/^[0-9+\-\s()]+$/),
      }),
      seo: Joi.object({
        title: Joi.string().trim().max(60),
        description: Joi.string().trim().max(160),
        keywords: Joi.array().items(Joi.string().trim()),
      }),
      flags: Joi.array().items(
        Joi.string().valid('featured', 'new_launch', 'premium', 'best_seller', 'limited_offer', 'verified', 'trending')
      ),
      status: Joi.string().valid('draft', 'active', 'sold', 'rented', 'inactive', 'archived'),
    })
    .min(1),
};

const deleteProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const uploadMedia = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().required().valid('image', 'video', 'document', 'floor_plan', 'brochure'),
    caption: Joi.string().trim().max(200),
    isPrimary: Joi.boolean().default(false),
  }),
};

const deleteMedia = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
    mediaId: Joi.string().required(),
  }),
};

const updateMedia = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
    mediaId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    caption: Joi.string().trim().max(200),
    isPrimary: Joi.boolean(),
  }),
};

const approveProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const rejectProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required().trim().max(500),
  }),
};

const addFlag = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    flag: Joi.string().required().valid('featured', 'new_launch', 'premium', 'best_seller', 'limited_offer', 'verified', 'trending'),
  }),
};

const removeFlag = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    flag: Joi.string().required().valid('featured', 'new_launch', 'premium', 'best_seller', 'limited_offer', 'verified', 'trending'),
  }),
};

const incrementViews = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const incrementInquiries = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const searchProperties = {
  query: Joi.object().keys({
    q: Joi.string().trim().min(1),
    city: Joi.string().trim(),
    locality: Joi.string().trim(),
    type: Joi.string().valid('apartment', 'villa', 'plot', 'commercial', 'office', 'shop', 'warehouse', 'other'),
    bhk: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    minArea: Joi.number().min(0),
    maxArea: Joi.number().min(0),
    amenities: Joi.string(),
    flags: Joi.string(),
    sortBy: Joi.string().valid('price_asc', 'price_desc', 'area_asc', 'area_desc', 'created_desc', 'views_desc'),
    limit: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getNearbyProperties = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
  query: Joi.object().keys({
    radius: Joi.number().min(0.1).max(50).default(5), // in kilometers
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

const addToShortlist = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const removeFromShortlist = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

const getShortlistedProperties = {
  query: Joi.object().keys({
    sortBy: Joi.string().default('createdAt:desc'),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const checkShortlistStatus = {
  params: Joi.object().keys({
    propertyId: Joi.string().required().custom(objectId),
  }),
};

export {
  createProperty,
  getProperties,
  getProperty,
  getPropertyBySlug,
  updateProperty,
  deleteProperty,
  uploadMedia,
  deleteMedia,
  updateMedia,
  approveProperty,
  rejectProperty,
  addFlag,
  removeFlag,
  incrementViews,
  incrementInquiries,
  searchProperties,
  getNearbyProperties,
  addToShortlist,
  removeFromShortlist,
  getShortlistedProperties,
  checkShortlistStatus,
};
