# Property API Frontend Guide

This guide provides comprehensive documentation for frontend developers on how to interact with the Property API endpoints.

## Base URL
```
http://localhost:3000/api/v1/properties
```

## Authentication & Access Levels
The API supports different user types with varying access levels:

- **👤 User**: Regular users (limited access)
- **🏗️ Builder**: Property builders (can manage their own properties)
- **👑 Admin**: System administrators (full access)
- **🌐 Public**: No authentication required

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Access Level Legend
- 🌐 **Public** - No authentication required
- 👤 **User** - Requires user authentication
- 🏗️ **Builder** - Requires builder authentication
- 👑 **Admin** - Requires admin authentication
- 🔒 **Mixed** - Different access levels for different operations

## Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

For paginated responses:
```json
{
  "success": true,
  "data": {
    "results": [...],
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 50
  }
}
```

---

## Public Endpoints (No Authentication Required)

### 1. Search Properties
**GET** `/api/v1/properties/search`  
🌐 **Access Level**: Public

Search and filter properties with various criteria.

**Query Parameters:**
- `q` (string): Search term for name, description, city, or locality
- `city` (string): Filter by city
- `locality` (string): Filter by locality
- `type` (string): Property type (`apartment`, `villa`, `plot`, `commercial`, `office`, `shop`, `warehouse`, `other`)
- `bhk` (string): BHK configuration (e.g., `2BHK`, `3.5BHK`, `Studio`)
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `minArea` (number): Minimum area
- `maxArea` (number): Maximum area
- `amenities` (string): Comma-separated amenities
- `flags` (string): Comma-separated flags
- `sortBy` (string): Sort option (`price_asc`, `price_desc`, `area_asc`, `area_desc`, `created_desc`, `views_desc`)
- `limit` (number): Results per page (1-100, default: 20)
- `page` (number): Page number (default: 1)

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/search?city=Mumbai&type=apartment&minPrice=50&maxPrice=200&sortBy=price_asc&limit=10&page=1');
const data = await response.json();
```

### 2. Get Featured Properties
**GET** `/api/v1/properties/featured`  
🌐 **Access Level**: Public

Get properties marked as featured.

**Query Parameters:**
- `sortBy` (string): Sort option
- `limit` (number): Results per page
- `page` (number): Page number

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/featured?limit=5');
const data = await response.json();
```

### 3. Get Trending Properties
**GET** `/api/v1/properties/trending`  
🌐 **Access Level**: Public

Get trending properties based on views and interactions.

**Query Parameters:**
- `sortBy` (string): Sort option
- `limit` (number): Results per page
- `page` (number): Page number

### 4. Get New Launch Properties
**GET** `/api/v1/properties/new-launch`  
🌐 **Access Level**: Public

Get properties marked as new launch.

**Query Parameters:**
- `sortBy` (string): Sort option
- `limit` (number): Results per page
- `page` (number): Page number

### 5. Get Properties by Type
**GET** `/api/v1/properties/type/:type`  
🌐 **Access Level**: Public

Get properties filtered by type.

**Path Parameters:**
- `type` (string): Property type

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/type/apartment');
const data = await response.json();
```

### 6. Get Properties by City
**GET** `/api/v1/properties/city/:city`  
🌐 **Access Level**: Public

Get properties filtered by city.

**Path Parameters:**
- `city` (string): City name

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/city/Mumbai');
const data = await response.json();
```

### 7. Get Nearby Properties
**GET** `/api/v1/properties/:propertyId/nearby`  
🌐 **Access Level**: Public

Get properties near a specific property.

**Path Parameters:**
- `propertyId` (string): Property ID

**Query Parameters:**
- `radius` (number): Search radius in kilometers (0.1-50, default: 5)
- `limit` (number): Maximum results (1-50, default: 10)

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345/nearby?radius=10&limit=5');
const data = await response.json();
```

### 8. Get Property by Slug
**GET** `/api/v1/properties/slug/:slug`  
🌐 **Access Level**: Public

Get a property by its SEO slug.

**Path Parameters:**
- `slug` (string): Property slug

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/slug/luxury-apartment-mumbai');
const data = await response.json();
```

### 9. Get Property by ID
**GET** `/api/v1/properties/:propertyId`  
🌐 **Access Level**: Public

Get a specific property by ID.

**Path Parameters:**
- `propertyId` (string): Property ID

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345');
const data = await response.json();
```

### 10. Get All Properties
**GET** `/api/v1/properties`  
🌐 **Access Level**: Public

Get all properties with optional filtering.

**Query Parameters:**
- `builder` (string): Filter by builder ID
- `type` (string): Property type
- `city` (string): Filter by city
- `locality` (string): Filter by locality
- `bhk` (string): BHK configuration
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `minArea` (number): Minimum area
- `maxArea` (number): Maximum area
- `status` (string): Property status
- `adminApproved` (boolean): Admin approval status
- `flags` (string): Comma-separated flags
- `sortBy` (string): Sort option
- `limit` (number): Results per page
- `page` (number): Page number

---

## Protected Endpoints (Authentication Required)

### 1. Create Property
**POST** `/api/v1/properties`  
🏗️ **Access Level**: Builder

Create a new property (Builder role required).

**Request Body:**
```json
{
  "name": "Luxury Apartment Complex",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1200,
    "unit": "sqft"
  },
  "price": {
    "value": 150,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Bandra West",
  "geo": {
    "latitude": 19.0544,
    "longitude": 72.8406,
    "address": "123, Linking Road, Bandra West, Mumbai"
  },
  "amenities": [
    {
      "category": "basic",
      "name": "Power Backup",
      "description": "24x7 power backup"
    },
    {
      "category": "lifestyle",
      "name": "Swimming Pool",
      "description": "Olympic size swimming pool"
    }
  ],
  "description": "Beautiful luxury apartment with modern amenities",
  "specifications": {
    "flooring": "Marble",
    "parking": "2 covered parking spaces",
    "balcony": "2 balconies"
  },
  "availability": {
    "isAvailable": true,
    "availableFrom": "2024-06-01T00:00:00.000Z",
    "possessionDate": "2024-12-31T00:00:00.000Z"
  },
  "contact": {
    "phone": "+91-9876543210",
    "email": "sales@example.com",
    "whatsapp": "+91-9876543210"
  },
  "seo": {
    "title": "Luxury Apartment in Bandra West",
    "description": "Premium 3BHK apartment with modern amenities",
    "keywords": ["apartment", "luxury", "bandra", "mumbai"]
  },
  "flags": ["featured", "new_launch"]
}
```

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-jwt-token>'
  },
  body: JSON.stringify(propertyData)
});
const data = await response.json();
```

### 2. Get Properties by Builder
**GET** `/api/v1/properties/builder/:builderId`  
🏗️ **Access Level**: Builder

Get properties created by a specific builder.

**Path Parameters:**
- `builderId` (string): Builder ID

**Query Parameters:**
- `sortBy` (string): Sort option
- `limit` (number): Results per page
- `page` (number): Page number

### 3. Get Property Statistics
**GET** `/api/v1/properties/builder/:builderId/stats`  
🏗️ **Access Level**: Builder

Get statistics for a builder's properties.

**Path Parameters:**
- `builderId` (string): Builder ID

**Response:**
```json
{
  "totalProperties": 25,
  "activeProperties": 20,
  "soldProperties": 3,
  "totalViews": 1500,
  "totalInquiries": 45,
  "avgPrice": 125.5,
  "avgArea": 1100
}
```

### 4. Update Property
**PATCH** `/api/v1/properties/:propertyId`  
🏗️ **Access Level**: Builder

Update a property (Builder role required).

**Path Parameters:**
- `propertyId` (string): Property ID

**Request Body:** (Same structure as create, but all fields are optional)

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-jwt-token>'
  },
  body: JSON.stringify({
    name: "Updated Property Name",
    price: {
      value: 200,
      unit: "lakh"
    }
  })
});
const data = await response.json();
```

### 5. Delete Property
**DELETE** `/api/v1/properties/:propertyId`  
🏗️ **Access Level**: Builder

Delete a property (Builder role required).

**Path Parameters:**
- `propertyId` (string): Property ID

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  }
});
```

---

## Media Management

### 1. Add Media to Property
**POST** `/api/v1/properties/:propertyId/media`  
🏗️ **Access Level**: Builder

Add media files to a property.

**Path Parameters:**
- `propertyId` (string): Property ID

**Request Body (Form Data):**
- `file` (file): Media file to upload
- `type` (string): Media type (`image`, `video`, `document`, `floor_plan`, `brochure`)
- `caption` (string): Media caption (optional)
- `isPrimary` (boolean): Set as primary media (default: false)

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'image');
formData.append('caption', 'Living room view');
formData.append('isPrimary', 'true');

const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345/media', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  },
  body: formData
});
const data = await response.json();
```

### 2. Update Media
**PATCH** `/api/v1/properties/:propertyId/media/:mediaId`  
🏗️ **Access Level**: Builder

Update media information.

**Path Parameters:**
- `propertyId` (string): Property ID
- `mediaId` (string): Media ID

**Request Body:**
```json
{
  "caption": "Updated caption",
  "isPrimary": true
}
```

### 3. Delete Media
**DELETE** `/api/v1/properties/:propertyId/media/:mediaId`  
🏗️ **Access Level**: Builder

Remove media from property.

**Path Parameters:**
- `propertyId` (string): Property ID
- `mediaId` (string): Media ID

---

## Flag Management

### 1. Add Flag to Property
**POST** `/api/v1/properties/:propertyId/flags`  
🏗️ **Access Level**: Builder

Add a flag to a property.

**Path Parameters:**
- `propertyId` (string): Property ID

**Request Body:**
```json
{
  "flag": "featured"
}
```

**Available Flags:**
- `featured`
- `new_launch`
- `premium`
- `best_seller`
- `limited_offer`
- `verified`
- `trending`

### 2. Remove Flag from Property
**DELETE** `/api/v1/properties/:propertyId/flags`  
🏗️ **Access Level**: Builder

Remove a flag from a property.

**Path Parameters:**
- `propertyId` (string): Property ID

**Request Body:**
```json
{
  "flag": "featured"
}
```

---

## Analytics

### 1. Increment Property Views
**POST** `/api/v1/properties/:propertyId/views`  
👤 **Access Level**: User

Track property views.

**Path Parameters:**
- `propertyId` (string): Property ID

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345/views', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  }
});
```

### 2. Increment Property Inquiries
**POST** `/api/v1/properties/:propertyId/inquiries`  
👤 **Access Level**: User

Track property inquiries.

**Path Parameters:**
- `propertyId` (string): Property ID

**Example Request:**
```javascript
const response = await fetch('/api/v1/properties/64a1b2c3d4e5f6789012345/inquiries', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  }
});
```

---

## Admin Endpoints (Admin Role Required)

### 1. Approve Property
**POST** `/api/v1/properties/:propertyId/approve`  
👑 **Access Level**: Admin

Approve a property for public listing.

**Path Parameters:**
- `propertyId` (string): Property ID

### 2. Reject Property
**POST** `/api/v1/properties/:propertyId/reject`

Reject a property with reason.

**Path Parameters:**
- `propertyId` (string): Property ID

**Request Body:**
```json
{
  "reason": "Incomplete documentation"
}
```

---

## Property Data Structure

### Property Object
```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "builder": {
    "_id": "64a1b2c3d4e5f6789012346",
    "name": "ABC Builders",
    "email": "contact@abcbuilders.com",
    "phone": "+91-9876543210"
  },
  "name": "Luxury Apartment Complex",
  "type": "apartment",
  "bhk": "3BHK",
  "area": {
    "value": 1200,
    "unit": "sqft"
  },
  "price": {
    "value": 150,
    "unit": "lakh"
  },
  "city": "Mumbai",
  "locality": "Bandra West",
  "geo": {
    "latitude": 19.0544,
    "longitude": 72.8406,
    "address": "123, Linking Road, Bandra West, Mumbai"
  },
  "media": [
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "type": "image",
      "url": "https://example.com/image1.jpg",
      "caption": "Living room view",
      "isPrimary": true,
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "amenities": [
    {
      "category": "basic",
      "name": "Power Backup",
      "description": "24x7 power backup"
    }
  ],
  "status": "active",
  "adminApproved": true,
  "approvedBy": {
    "_id": "64a1b2c3d4e5f6789012348",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "seo": {
    "title": "Luxury Apartment in Bandra West",
    "description": "Premium 3BHK apartment with modern amenities",
    "keywords": ["apartment", "luxury", "bandra", "mumbai"],
    "slug": "luxury-apartment-bandra-west"
  },
  "flags": ["featured", "new_launch"],
  "qualityScore": 85,
  "description": "Beautiful luxury apartment with modern amenities",
  "specifications": {
    "flooring": "Marble",
    "parking": "2 covered parking spaces"
  },
  "availability": {
    "isAvailable": true,
    "availableFrom": "2024-06-01T00:00:00.000Z",
    "possessionDate": "2024-12-31T00:00:00.000Z"
  },
  "contact": {
    "phone": "+91-9876543210",
    "email": "sales@example.com",
    "whatsapp": "+91-9876543210"
  },
  "views": 150,
  "inquiries": 25,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Please authenticate"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Property not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Frontend Implementation Examples

### React/JavaScript Example

```javascript
// API service class
class PropertyAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Search properties
  async searchProperties(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/search?${queryString}`);
  }

  // Get property by ID
  async getProperty(propertyId) {
    return this.request(`/${propertyId}`);
  }

  // Create property
  async createProperty(propertyData) {
    return this.request('/', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    });
  }

  // Update property
  async updateProperty(propertyId, updateData) {
    return this.request(`/${propertyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  // Delete property
  async deleteProperty(propertyId) {
    return this.request(`/${propertyId}`, {
      method: 'DELETE'
    });
  }

  // Add media
  async addMedia(propertyId, file, mediaData) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(mediaData).forEach(key => {
      formData.append(key, mediaData[key]);
    });

    return this.request(`/${propertyId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });
  }
}

// Usage
const propertyAPI = new PropertyAPI('http://localhost:3000/api/v1/properties', 'your-jwt-token');

// Search properties
const searchResults = await propertyAPI.searchProperties({
  city: 'Mumbai',
  type: 'apartment',
  minPrice: 50,
  maxPrice: 200
});

// Get property details
const property = await propertyAPI.getProperty('64a1b2c3d4e5f6789012345');

// Create new property
const newProperty = await propertyAPI.createProperty({
  name: 'New Property',
  type: 'apartment',
  bhk: '2BHK',
  area: { value: 1000, unit: 'sqft' },
  price: { value: 100, unit: 'lakh' },
  city: 'Mumbai',
  locality: 'Andheri West'
});
```

### Vue.js Example

```javascript
// composables/usePropertyAPI.js
import { ref, reactive } from 'vue'

export function usePropertyAPI() {
  const loading = ref(false)
  const error = ref(null)

  const apiCall = async (url, options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        ...options
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message)
      }
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchProperties = (params) => {
    const queryString = new URLSearchParams(params).toString()
    return apiCall(`/api/v1/properties/search?${queryString}`)
  }

  const getProperty = (id) => {
    return apiCall(`/api/v1/properties/${id}`)
  }

  const createProperty = (data) => {
    return apiCall('/api/v1/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  return {
    loading,
    error,
    searchProperties,
    getProperty,
    createProperty
  }
}
```

---

## Best Practices

1. **Error Handling**: Always implement proper error handling for API calls
2. **Loading States**: Show loading indicators during API calls
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: Cache frequently accessed data to improve performance
5. **Validation**: Validate data on the frontend before sending to API
6. **Authentication**: Store JWT tokens securely and handle token expiration
7. **File Uploads**: Use FormData for file uploads, not JSON
8. **Search Debouncing**: Implement debouncing for search inputs
9. **Responsive Design**: Ensure UI works well on all device sizes
10. **Accessibility**: Follow accessibility guidelines for better user experience

---

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a 429 status code. Implement exponential backoff for retries.

---

## Support

For technical support or questions about the API, please contact the development team or refer to the main API documentation.
