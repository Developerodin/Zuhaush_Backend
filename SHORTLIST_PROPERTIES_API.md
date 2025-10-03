# Shortlist Properties API Documentation

This document provides comprehensive information about the Shortlist Properties APIs for the Zuhaush Backend system.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Model Updates](#user-model-updates)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Status Codes](#status-codes)

## Overview

The Shortlist Properties API allows authenticated users to:
- Add properties to their personal shortlist
- Remove properties from their shortlist
- View all their shortlisted properties
- Check if a specific property is in their shortlist
- Manage their property preferences efficiently

## Authentication

All shortlist endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### How to Pass Authentication Token

#### 1. cURL Command Example
```bash
curl -X POST "https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### 2. JavaScript/Fetch API Example
```javascript
const token = 'your-jwt-token-here';

fetch('https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

#### 3. Axios Example
```javascript
import axios from 'axios';

const token = 'your-jwt-token-here';

axios.post('https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist', {}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
```

#### 4. React Native Example
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const addToShortlist = async (propertyId) => {
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(`https://api.zuhaush.com/api/v1/properties/${propertyId}/shortlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to add to shortlist');
    }
  } catch (error) {
    console.error('Error adding to shortlist:', error);
    throw error;
  }
};
```

#### 5. Postman/API Testing Tools
- **Headers Tab**: 
  - Key: `Authorization`
  - Value: `Bearer your-jwt-token-here`
- **Body Tab**: No body required for POST/DELETE shortlist operations

#### 6. Python Example
```python
import requests

def add_to_shortlist(token, property_id):
    url = f'https://api.zuhaush.com/api/v1/properties/{property_id}/shortlist'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.status_code} - {response.text}')
        return None

def get_shortlist(token):
    url = 'https://api.zuhaush.com/api/v1/properties/shortlist'
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.status_code} - {response.text}')
        return None

# Usage
token = 'your-jwt-token-here'
result = add_to_shortlist(token, '64a1b2c3d4e5f6789012345')
shortlist = get_shortlist(token)
```

### Getting the Token
After successful login, you'll receive a JWT token:
```javascript
// After login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const loginData = await loginResponse.json();
const token = loginData.tokens.access.token;

// Store token for future use
localStorage.setItem('authToken', token); // Web
// or
AsyncStorage.setItem('authToken', token); // React Native
```

### Token Format
The token should be in this exact format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Important Notes:**
- Always include `Bearer ` (with space) before the actual token
- Store tokens securely and don't expose them in client-side code
- Tokens typically expire, so you may need to refresh them periodically

## User Model Updates

### New Field Added to User Model

```javascript
// Shortlisted properties
shortlistProperties: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Property',
}]
```

### User Model Helper Methods

#### `addToShortlist(propertyId)`
Adds a property to the user's shortlist if not already present.

#### `removeFromShortlist(propertyId)`
Removes a property from the user's shortlist.

#### `isPropertyShortlisted(propertyId)`
Checks if a property is in the user's shortlist.

## API Endpoints

### 1. Add Property to Shortlist
**POST** `/api/v1/properties/{propertyId}/shortlist`

Add a property to the authenticated user's shortlist.

**Parameters:**
- `propertyId` (path, required): The ID of the property to add to shortlist

**Response:**
```json
{
  "message": "Property added to shortlist successfully",
  "shortlistedProperties": [
    "property_id_1",
    "property_id_2",
    "property_id_3"
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Property already in shortlist
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Property not found

### 2. Remove Property from Shortlist
**DELETE** `/api/v1/properties/{propertyId}/shortlist`

Remove a property from the authenticated user's shortlist.

**Parameters:**
- `propertyId` (path, required): The ID of the property to remove from shortlist

**Response:**
```json
{
  "message": "Property removed from shortlist successfully",
  "shortlistedProperties": [
    "property_id_1",
    "property_id_2"
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Property not found in shortlist

### 3. Get Shortlisted Properties
**GET** `/api/v1/properties/shortlist`

Get all properties in the authenticated user's shortlist with pagination.

**Query Parameters:**
- `sortBy` (optional): Sort field (default: "createdAt:desc")
- `limit` (optional): Number of results per page (default: 10, max: 100)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "results": [
    {
      "id": "property_id_1",
      "name": "Luxury Apartment",
      "type": "apartment",
      "bhk": "3 BHK",
      "area": {
        "value": 1200,
        "unit": "sqft"
      },
      "price": {
        "value": 50,
        "unit": "lakh"
      },
      "city": "Mumbai",
      "locality": "Bandra",
      "status": "active",
      "adminApproved": true,
      "builder": {
        "id": "builder_id",
        "name": "ABC Builders",
        "email": "contact@abc.com",
        "phone": "+1234567890"
      },
      "media": [
        {
          "type": "image",
          "url": "https://example.com/image1.jpg",
          "caption": "Living room",
          "isPrimary": true
        }
      ],
      "createdAt": "2024-05-01T10:00:00.000Z",
      "updatedAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

### 4. Check Shortlist Status
**GET** `/api/v1/properties/{propertyId}/shortlist/status`

Check if a specific property is in the authenticated user's shortlist.

**Parameters:**
- `propertyId` (path, required): The ID of the property to check

**Response:**
```json
{
  "isShortlisted": true
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required
- `404 Not Found` - User not found

## Request/Response Examples

### Example 1: Add Property to Shortlist

**Request:**
```bash
curl -X POST "https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Property added to shortlist successfully",
  "shortlistedProperties": [
    "64a1b2c3d4e5f6789012345",
    "64a1b2c3d4e5f6789012346"
  ]
}
```

### Example 2: Get Shortlisted Properties

**Request:**
```bash
curl -X GET "https://api.zuhaush.com/api/v1/properties/shortlist?limit=5&page=1" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
{
  "results": [
    {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Luxury Apartment",
      "type": "apartment",
      "bhk": "3 BHK",
      "area": {
        "value": 1200,
        "unit": "sqft"
      },
      "price": {
        "value": 50,
        "unit": "lakh"
      },
      "city": "Mumbai",
      "locality": "Bandra",
      "status": "active",
      "adminApproved": true,
      "builder": {
        "id": "64a1b2c3d4e5f6789012347",
        "name": "ABC Builders",
        "email": "contact@abc.com"
      },
      "media": [...],
      "createdAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "totalResults": 1
}
```

### Example 3: Remove Property from Shortlist

**Request:**
```bash
curl -X DELETE "https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
{
  "message": "Property removed from shortlist successfully",
  "shortlistedProperties": [
    "64a1b2c3d4e5f6789012346"
  ]
}
```

### Example 4: Check Shortlist Status

**Request:**
```bash
curl -X GET "https://api.zuhaush.com/api/v1/properties/64a1b2c3d4e5f6789012345/shortlist/status" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
{
  "isShortlisted": false
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "code": 400,
  "message": "Property already in shortlist"
}
```

#### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

#### 404 Not Found
```json
{
  "code": 404,
  "message": "Property not found"
}
```

```json
{
  "code": 404,
  "message": "Property not found in shortlist"
}
```

#### 422 Unprocessable Entity
```json
{
  "code": 422,
  "message": "Validation error",
  "details": {
    "propertyId": "Invalid property ID format"
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict (e.g., property already in shortlist) |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

## Features

### Core Functionality
- ✅ **User Authentication Required**: All endpoints require valid JWT token
- ✅ **Duplicate Prevention**: Users cannot add the same property twice
- ✅ **Pagination Support**: Get shortlisted properties with pagination
- ✅ **Property Validation**: Only existing properties can be shortlisted
- ✅ **User Validation**: Only existing users can manage shortlists

### Data Filtering
- ✅ **Active Properties Only**: Shortlist only shows active properties
- ✅ **Admin Approved**: Only admin-approved properties appear in shortlist
- ✅ **Builder Information**: Shortlisted properties include builder details
- ✅ **Media Support**: Shortlisted properties include media information

### Error Handling
- ✅ **Comprehensive Validation**: Input validation for all endpoints
- ✅ **Detailed Error Messages**: Clear error messages for different scenarios
- ✅ **HTTP Status Codes**: Proper HTTP status codes for different responses
- ✅ **User-Friendly Responses**: Helpful success and error messages

## Implementation Details

### Database Schema
The shortlist functionality uses MongoDB with the following structure:

```javascript
// User Model
{
  // ... other user fields
  shortlistProperties: [ObjectId] // Array of Property ObjectIds
}
```

### Service Layer Methods
- `addToShortlist(userId, propertyId)` - Adds property to user's shortlist
- `removeFromShortlist(userId, propertyId)` - Removes property from user's shortlist
- `getShortlistedProperties(userId, options)` - Gets paginated shortlisted properties
- `checkShortlistStatus(userId, propertyId)` - Checks if property is shortlisted

### Validation Rules
- Property ID must be valid MongoDB ObjectId
- User must be authenticated
- Property must exist in database
- Pagination limits enforced (max 100 results per page)

## Usage Notes

1. **Authentication**: All endpoints require Bearer token authentication
2. **Property Status**: Only active and admin-approved properties are shown in shortlist
3. **Pagination**: Default page size is 10, maximum is 100
4. **Sorting**: Default sort is by creation date (newest first)
5. **Duplicate Handling**: Adding the same property twice returns a conflict error
6. **Empty Shortlist**: Users with no shortlisted properties get empty results array

## Integration Examples

### Frontend Integration

#### Add to Shortlist Button
```javascript
const addToShortlist = async (propertyId) => {
  try {
    const response = await fetch(`/api/v1/properties/${propertyId}/shortlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Property added to shortlist:', data.message);
    }
  } catch (error) {
    console.error('Error adding to shortlist:', error);
  }
};
```

#### Check Shortlist Status
```javascript
const checkShortlistStatus = async (propertyId) => {
  try {
    const response = await fetch(`/api/v1/properties/${propertyId}/shortlist/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.isShortlisted;
  } catch (error) {
    console.error('Error checking shortlist status:', error);
    return false;
  }
};
```

### Mobile App Integration

#### React Native Example
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const toggleShortlist = async (propertyId, isShortlisted) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const method = isShortlisted ? 'DELETE' : 'POST';
  const url = `/api/v1/properties/${propertyId}/shortlist`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return !isShortlisted;
    }
  } catch (error) {
    console.error('Error toggling shortlist:', error);
  }
  
  return isShortlisted;
};
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT authentication
2. **User Isolation**: Users can only manage their own shortlist
3. **Input Validation**: All inputs are validated before processing
4. **Rate Limiting**: Consider implementing rate limiting for shortlist operations
5. **Data Privacy**: Shortlist data is user-specific and not shared

## Performance Considerations

1. **Pagination**: Large shortlists are paginated to improve performance
2. **Indexing**: Database indexes on user and property IDs for fast lookups
3. **Caching**: Consider caching frequently accessed shortlist data
4. **Lazy Loading**: Property details are loaded only when needed

## Future Enhancements

1. **Bulk Operations**: Add/remove multiple properties at once
2. **Shortlist Categories**: Organize properties into custom categories
3. **Sharing**: Allow users to share their shortlist with others
4. **Notifications**: Notify users when shortlisted properties have updates
5. **Analytics**: Track shortlist usage patterns
6. **Export**: Export shortlist data to various formats

---

*This documentation covers the complete shortlist properties API implementation for the Zuhaush Backend system.*
