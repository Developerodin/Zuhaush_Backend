# Property View Tracking API

This API allows tracking when users view properties and retrieving their viewing history.

## Endpoints

### 1. Track Property View
**POST** `/api/v1/property-views`

Track when a user views a property.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "property": "property_id_here"
}
```

**Response:**
```json
{
  "id": "view_id",
  "user": "user_id",
  "property": "property_id",
  "viewedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get My Property Views
**GET** `/api/v1/property-views/my-views`

Get all property views for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `sortBy` (optional): Sort field and order (default: viewedAt:desc)

**Response:**
```json
{
  "results": [
    {
      "id": "view_id",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "property": {
        "id": "property_id",
        "name": "Property Name",
        "type": "apartment",
        "city": "Mumbai",
        "locality": "Bandra",
        "price": 5000000,
        "area": "1200 sq ft",
        "media": ["image1.jpg", "image2.jpg"],
        "builder": "builder_id",
        "status": "active"
      },
      "viewedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "totalResults": 50
}
```

### 3. Get My Property View Statistics
**GET** `/api/v1/property-views/my-stats`

Get viewing statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalViews": 150,
  "uniquePropertyCount": 45,
  "lastViewedAt": "2024-01-15T10:30:00.000Z",
  "firstViewedAt": "2024-01-01T09:00:00.000Z"
}
```

### 4. Get My Most Viewed Properties
**GET** `/api/v1/property-views/my-most-viewed`

Get the most viewed properties for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10, max: 50)

**Response:**
```json
{
  "results": [
    {
      "property": {
        "id": "property_id",
        "name": "Property Name",
        "type": "apartment",
        "city": "Mumbai",
        "locality": "Bandra",
        "price": 5000000,
        "area": "1200 sq ft",
        "media": ["image1.jpg"],
        "builder": "builder_id",
        "status": "active"
      },
      "viewCount": 15,
      "lastViewedAt": "2024-01-15T10:30:00.000Z",
      "firstViewedAt": "2024-01-01T09:00:00.000Z"
    }
  ],
  "totalResults": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 5. Get Property Views by User (Admin/Builder Access)
**GET** `/api/v1/property-views/user/:userId`

Get all property views for a specific user (admin/builder access).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId`: User ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `sortBy` (optional): Sort field and order (default: viewedAt:desc)

**Response:** Same format as "Get My Property Views"

## Usage Examples

### Track a Property View
```javascript
// When user views a property page
const response = await fetch('/api/v1/property-views', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    property: 'property_id_here'
  })
});

const viewRecord = await response.json();
```

### Get User's View History
```javascript
// Get user's property view history
const response = await fetch('/api/v1/property-views/my-views?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const viewHistory = await response.json();
```

## Notes

- All endpoints require authentication
- The `viewedAt` timestamp is automatically set when creating a view record
- Property views are tracked every time the API is called, allowing for multiple views of the same property
- The API includes pagination for large result sets
- Statistics provide insights into user viewing behavior
- Most viewed properties help identify user preferences
