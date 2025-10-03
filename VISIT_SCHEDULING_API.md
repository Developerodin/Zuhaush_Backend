# Visit Scheduling API Documentation

This document provides comprehensive information about the Visit Scheduling APIs for the Zuhaush Backend system.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Visit Model](#visit-model)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Status Codes](#status-codes)

## Overview

The Visit Scheduling API allows users to:
- Schedule property visits
- Check available time slots
- Confirm, cancel, or reschedule visits
- View visit history and statistics
- Manage multiple property visits

## Authentication

All endpoints (except public ones) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### How to Pass Authentication Token

#### 1. cURL Command Example
```bash
curl -X POST "https://api.zuhaush.com/api/v1/visits/schedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "property": "property_id",
    "date": "2024-05-15T00:00:00.000Z",
    "time": "10:00 AM"
  }'
```

#### 2. JavaScript/Fetch API Example
```javascript
const token = 'your-jwt-token-here';

fetch('https://api.zuhaush.com/api/v1/visits/schedule', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    property: 'property_id',
    date: '2024-05-15T00:00:00.000Z',
    time: '10:00 AM'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

#### 3. Axios Example
```javascript
import axios from 'axios';

const token = 'your-jwt-token-here';

axios.post('https://api.zuhaush.com/api/v1/visits/schedule', {
  property: 'property_id',
  date: '2024-05-15T00:00:00.000Z',
  time: '10:00 AM'
}, {
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

const scheduleVisit = async (propertyId, date, time) => {
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch('https://api.zuhaush.com/api/v1/visits/schedule', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        property: propertyId,
        date: date,
        time: time
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to schedule visit');
    }
  } catch (error) {
    console.error('Error scheduling visit:', error);
    throw error;
  }
};
```

#### 5. Postman/API Testing Tools
- **Headers Tab**: 
  - Key: `Authorization`
  - Value: `Bearer your-jwt-token-here`
- **Body Tab** (raw JSON):
```json
{
  "property": "property_id",
  "date": "2024-05-15T00:00:00.000Z",
  "time": "10:00 AM"
}
```

#### 6. Python Example
```python
import requests

def schedule_visit(token, property_id, date, time):
    url = 'https://api.zuhaush.com/api/v1/visits/schedule'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'property': property_id,
        'date': date,
        'time': time
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f'Error: {response.status_code} - {response.text}')
        return None

# Usage
token = 'your-jwt-token-here'
result = schedule_visit(token, 'property_id', '2024-05-15T00:00:00.000Z', '10:00 AM')
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

## Visit Model

### Visit Status
- `scheduled` - Visit has been scheduled but not confirmed
- `confirmed` - Visit has been confirmed by admin/builder
- `completed` - Visit has been completed
- `cancelled` - Visit has been cancelled
- `rescheduled` - Visit has been rescheduled

### Visit Fields
```json
{
  "id": "visit_id",
  "user": "user_id",
  "property": "property_id",
  "date": "2024-05-15T00:00:00.000Z",
  "time": "10:00 AM",
  "status": "scheduled",
  "cancelledAt": null,
  "cancelledBy": null,
  "rescheduledAt": null,
  "rescheduledBy": null,
  "createdAt": "2024-05-01T10:00:00.000Z",
  "updatedAt": "2024-05-01T10:00:00.000Z"
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get Booked Time Slots
**GET** `/api/v1/visits/properties/{propertyId}/booked-slots`

Get booked time slots for a property on a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "bookedTimeSlots": [
    "10:00 AM",
    "2:00 PM",
    "4:00 PM"
  ]
}
```

#### 2. Check Time Slot Availability
**GET** `/api/v1/visits/properties/{propertyId}/check-availability`

Check if a specific time slot is available.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `time` (required): Time in HH:MM AM/PM format (e.g., "10:30 AM")

**Response:**
```json
{
  "isAvailable": true
}
```

### User Endpoints (Authentication Required)

#### 3. Schedule a Visit
**POST** `/api/v1/visits/schedule`

Schedule a new property visit.

**Request Body:**
```json
{
  "property": "property_id",
  "date": "2024-05-15T00:00:00.000Z",
  "time": "10:00 AM"
}
```

**Response:**
```json
{
  "id": "visit_id",
  "user": "user_id",
  "property": {
    "id": "property_id",
    "name": "Luxury Apartment",
    "type": "apartment",
    "city": "Mumbai",
    "locality": "Bandra",
    "price": {
      "value": 50,
      "unit": "lakh"
    },
    "area": {
      "value": 1200,
      "unit": "sqft"
    },
    "media": [...]
  },
  "date": "2024-05-15T00:00:00.000Z",
  "time": "10:00 AM",
  "status": "scheduled",
  "cancelledAt": null,
  "cancelledBy": null,
  "rescheduledAt": null,
  "rescheduledBy": null,
  "createdAt": "2024-05-01T10:00:00.000Z"
}
```

#### 4. Get My Visits
**GET** `/api/v1/visits/my-visits`

Get all visits for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (default: "createdAt:desc")
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "results": [
    {
      "id": "visit_id",
      "property": {
        "id": "property_id",
        "name": "Luxury Apartment",
        "type": "apartment",
        "city": "Mumbai",
        "locality": "Bandra",
        "price": {...},
        "area": {...},
        "media": [...]
      },
      "date": "2024-05-15T00:00:00.000Z",
      "time": "10:00 AM",
      "status": "scheduled",
      "createdAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

#### 5. Get Upcoming Visits
**GET** `/api/v1/visits/upcoming`

Get upcoming visits for the authenticated user.

**Query Parameters:**
- `sortBy` (optional): Sort field (default: "scheduledDate:asc")
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

#### 6. Get Visit Statistics
**GET** `/api/v1/visits/stats`

Get visit statistics for the authenticated user.

**Response:**
```json
{
  "totalVisits": 10,
  "scheduledVisits": 3,
  "confirmedVisits": 2,
  "completedVisits": 4,
  "cancelledVisits": 1,
  "rescheduledVisits": 0
}
```

#### 7. Get Visit Details
**GET** `/api/v1/visits/{visitId}`

Get detailed information about a specific visit.

**Response:**
```json
{
  "id": "visit_id",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1234567890"
  },
  "property": {
    "id": "property_id",
    "name": "Luxury Apartment",
    "type": "apartment",
    "city": "Mumbai",
    "locality": "Bandra",
    "price": {...},
    "area": {...},
    "media": [...],
    "builder": {
      "id": "builder_id",
      "name": "ABC Builders",
      "email": "contact@abc.com",
      "phone": "+1234567890"
    }
  },
  "scheduledDate": "2024-05-15T00:00:00.000Z",
  "scheduledTime": "10:00 AM",
  "status": "scheduled",
  "contactInfo": {...},
  "specialRequirements": "Wheelchair accessible",
  "duration": 30,
  "notes": "First time buyer",
  "createdAt": "2024-05-01T10:00:00.000Z",
  "updatedAt": "2024-05-01T10:00:00.000Z"
}
```

#### 8. Update My Visit
**PATCH** `/api/v1/visits/{visitId}`

Update a scheduled visit (only for scheduled status).

**Request Body:**
```json
{
  "date": "2024-05-16T00:00:00.000Z",
  "time": "11:00 AM"
}
```

#### 9. Cancel My Visit
**PATCH** `/api/v1/visits/{visitId}/cancel`

Cancel a visit.

**Response:**
```json
{
  "id": "visit_id",
  "status": "cancelled",
  "cancelledAt": "2024-05-01T12:00:00.000Z",
  "cancelledBy": "user_id"
}
```

#### 10. Reschedule My Visit
**PATCH** `/api/v1/visits/{visitId}/reschedule`

Reschedule a visit.

**Request Body:**
```json
{
  "date": "2024-05-20T00:00:00.000Z",
  "time": "2:00 PM"
}
```

**Response:**
```json
{
  "id": "visit_id",
  "status": "rescheduled",
  "date": "2024-05-20T00:00:00.000Z",
  "time": "2:00 PM",
  "rescheduledAt": "2024-05-01T12:00:00.000Z",
  "rescheduledBy": "user_id"
}
```

### Admin/Builder Endpoints (Authentication Required)

#### 11. Get All Visits
**GET** `/api/v1/visits`

Get all visits (admin/builder only).

**Query Parameters:**
- `user` (optional): Filter by user ID
- `property` (optional): Filter by property ID
- `status` (optional): Filter by status
- `date` (optional): Filter by date
- `sortBy` (optional): Sort field
- `limit` (optional): Number of results per page
- `page` (optional): Page number

#### 12. Get User Visits
**GET** `/api/v1/visits/users/{userId}`

Get all visits for a specific user (admin/builder only).

#### 13. Get Property Visits
**GET** `/api/v1/visits/properties/{propertyId}`

Get all visits for a specific property (admin/builder only).

#### 14. Confirm Visit
**PATCH** `/api/v1/visits/{visitId}/confirm`

Confirm a scheduled visit (admin/builder only).

**Response:**
```json
{
  "id": "visit_id",
  "status": "confirmed"
}
```

#### 15. Complete Visit
**PATCH** `/api/v1/visits/{visitId}/complete`

Mark a visit as completed (admin/builder only).

**Response:**
```json
{
  "id": "visit_id",
  "status": "completed"
}
```

#### 16. Update Visit
**PUT** `/api/v1/visits/{visitId}`

Update any visit (admin/builder only).

#### 17. Delete Visit
**DELETE** `/api/v1/visits/{visitId}`

Delete a visit (admin/builder only).

## Request/Response Examples

### Example 1: Schedule a Visit

**Request:**
```bash
curl -X POST "https://api.zuhaush.com/api/v1/visits/schedule" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "property": "64a1b2c3d4e5f6789012345",
    "date": "2024-05-15T00:00:00.000Z",
    "time": "10:00 AM"
  }'
```

**Response:**
```json
{
  "id": "64a1b2c3d4e5f6789012346",
  "user": "64a1b2c3d4e5f6789012347",
  "property": {
    "id": "64a1b2c3d4e5f6789012345",
    "name": "Luxury Apartment",
    "type": "apartment",
    "city": "Mumbai",
    "locality": "Bandra",
    "price": {
      "value": 50,
      "unit": "lakh"
    },
    "area": {
      "value": 1200,
      "unit": "sqft"
    }
  },
  "date": "2024-05-15T00:00:00.000Z",
  "time": "10:00 AM",
  "status": "scheduled",
  "cancelledAt": null,
  "cancelledBy": null,
  "rescheduledAt": null,
  "rescheduledBy": null,
  "createdAt": "2024-05-01T10:00:00.000Z"
}
```

### Example 2: Check Available Time Slots

**Request:**
```bash
curl -X GET "https://api.zuhaush.com/api/v1/visits/properties/64a1b2c3d4e5f6789012345/available-slots?date=2024-05-15"
```

**Response:**
```json
{
  "availableTimeSlots": [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM"
  ]
}
```

### Example 3: Get My Visits

**Request:**
```bash
curl -X GET "https://api.zuhaush.com/api/v1/visits/my-visits?status=scheduled&limit=5" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
{
  "results": [
    {
      "id": "64a1b2c3d4e5f6789012346",
      "property": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Luxury Apartment",
        "type": "apartment",
        "city": "Mumbai",
        "locality": "Bandra"
      },
      "date": "2024-05-15T00:00:00.000Z",
      "time": "10:00 AM",
      "status": "scheduled",
      "createdAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "totalResults": 1
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "code": 400,
  "message": "Time slot is not available"
}
```

#### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

#### 403 Forbidden
```json
{
  "code": 403,
  "message": "You can only update your own visits"
}
```

#### 404 Not Found
```json
{
  "code": 404,
  "message": "Visit not found"
}
```

#### 409 Conflict
```json
{
  "code": 409,
  "message": "Time slot is not available"
}
```

#### 422 Unprocessable Entity
```json
{
  "code": 422,
  "message": "Validation error",
  "details": {
    "date": "Date must be in the future",
    "time": "Invalid time slot"
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict (e.g., time slot not available) |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

## Configuration

### Visit Configuration

The visit system uses a simplified model with only essential fields:
- User ID (retrieved from authentication token)
- Property ID
- Date and time
- Status tracking
- Cancellation and rescheduling information

### Time Format

The system accepts time in flexible HH:MM AM/PM format:
- Valid formats: "9:00 AM", "10:30 AM", "1:00 PM", "2:45 PM"
- 12-hour format with AM/PM
- Hours: 1-12, Minutes: 00-59

## Notes

1. **Time Format**: The system accepts flexible time formats in HH:MM AM/PM (see Configuration section above)

2. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)

3. **Pagination**: All list endpoints support pagination with `limit` and `page` parameters

4. **Sorting**: Use `sortBy` parameter with format `field:direction` (e.g., `createdAt:desc`)

5. **User Permissions**: Users can only access and modify their own visits unless they are admin/builder

6. **Visit Status Flow**: 
   - `scheduled` → `confirmed` → `completed`
   - `scheduled` → `cancelled`
   - `scheduled` → `rescheduled` → `confirmed` → `completed`

7. **Time Slot Blocking**: When a visit is scheduled, that time slot is automatically blocked for the property on that date

8. **Multiple Properties**: Users can schedule visits for multiple properties simultaneously

9. **Simplified Model**: The visit system uses only essential fields - user ID (from token), property ID, date, time, status, and cancellation/rescheduling tracking

10. **Minimal API**: All endpoints work with simplified request/response bodies containing only necessary information
