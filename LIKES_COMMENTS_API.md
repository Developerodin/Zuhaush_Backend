# Likes and Comments API Documentation

This document describes the API endpoints for property likes and comments functionality.

## Table of Contents
- [Likes API](#likes-api)
- [Comments API](#comments-api)

---

## Likes API

### Toggle Like on Property
Toggle like/unlike on a property. If the user has already liked the property, it will be unliked. If not, it will be liked.

**Endpoint:** `POST /api/v1/properties/:propertyId/like`

**Authentication:** Required (User token)

**URL Parameters:**
- `propertyId` (string, required) - Property ID

**Response:**
```json
{
  "liked": true,
  "message": "Property liked successfully",
  "likeCount": 15
}
```

**Example:**
```bash
curl -X POST https://api.example.com/api/v1/properties/64a1b2c3d4e5f6g7h8i9j0k1/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Check Like Status
Check if the current user has liked a specific property.

**Endpoint:** `GET /api/v1/properties/:propertyId/like/status`

**Authentication:** Required (User token)

**URL Parameters:**
- `propertyId` (string, required) - Property ID

**Response:**
```json
{
  "liked": true,
  "likeCount": 15
}
```

---

### Get Property Likes
Get all users who have liked a property (with pagination).

**Endpoint:** `GET /api/v1/properties/:propertyId/likes`

**Authentication:** Not Required

**URL Parameters:**
- `propertyId` (string, required) - Property ID

**Query Parameters:**
- `sortBy` (string, optional) - Sort by field (e.g., "createdAt:desc")
- `limit` (integer, optional) - Number of results per page (default: 10)
- `page` (integer, optional) - Page number (default: 1)

**Response:**
```json
{
  "results": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "property": "property123",
      "type": "like",
      "status": "active",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "totalResults": 15
}
```

---

## Comments API

### Create Comment on Property
Add a comment to a property.

**Endpoint:** `POST /api/v1/properties/:propertyId/comments`

**Authentication:** Required (User token)

**URL Parameters:**
- `propertyId` (string, required) - Property ID

**Request Body:**
```json
{
  "text": "This is a great property! Very spacious and well-located."
}
```

**Validation:**
- `text` (string, required) - Comment text (max 1000 characters)

**Response:**
```json
{
  "id": "comment123",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "property": "property123",
  "text": "This is a great property! Very spacious and well-located.",
  "status": "active",
  "metadata": {
    "isEdited": false
  },
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

**Note:** Internal fields like `flagged`, `flagReason`, `replyCount`, `likeCount`, `dislikeCount`, and `parentComment` are excluded from the response.

---

### Get Property Comments
Get all comments for a specific property (with pagination).

**Endpoint:** `GET /api/v1/properties/:propertyId/comments`

**Authentication:** Not Required

**URL Parameters:**
- `propertyId` (string, required) - Property ID

**Query Parameters:**
- `sortBy` (string, optional) - Sort by field (default: "-createdAt")
- `limit` (integer, optional) - Number of results per page (default: 10)
- `page` (integer, optional) - Page number (default: 1)

**Response:**
```json
{
  "results": [
    {
      "id": "comment123",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "property": "property123",
      "text": "This is a great property!",
      "status": "active",
      "metadata": {
        "isEdited": false
      },
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "totalResults": 25
}
```

---

### Update Comment
Update user's own comment.

**Endpoint:** `PATCH /api/v1/comments/:commentId`

**Authentication:** Required (User token - must be comment owner)

**URL Parameters:**
- `commentId` (string, required) - Comment ID

**Request Body:**
```json
{
  "text": "Updated comment text here."
}
```

**Validation:**
- `text` (string, required) - Updated comment text (max 1000 characters)

**Response:**
```json
{
  "id": "comment123",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "property": "property123",
  "text": "Updated comment text here.",
  "status": "active",
  "metadata": {
    "isEdited": true,
    "editedAt": "2024-01-02T15:30:00.000Z"
  },
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-02T15:30:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden` - User is not the owner of the comment
- `404 Not Found` - Comment not found

---

### Delete Comment
Soft delete user's own comment.

**Endpoint:** `DELETE /api/v1/comments/:commentId`

**Authentication:** Required (User token - must be comment owner)

**URL Parameters:**
- `commentId` (string, required) - Comment ID

**Response:** `204 No Content`

**Error Responses:**
- `403 Forbidden` - User is not the owner of the comment
- `404 Not Found` - Comment not found

---

### Get Builder's Property Comments
Get all comments on all properties owned by the builder.

**Endpoint:** `GET /api/v1/builder/comments`

**Authentication:** Required (Builder/User token)

**Query Parameters:**
- `sortBy` (string, optional) - Sort by field (default: "-createdAt")
- `limit` (integer, optional) - Number of results per page (default: 10)
- `page` (integer, optional) - Page number (default: 1)

**Response:**
```json
{
  "results": [
    {
      "id": "comment123",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "property": {
        "id": "property123",
        "name": "Luxury Apartment in Downtown"
      },
      "text": "Interested in this property!",
      "status": "active",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "totalResults": 48
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Property not found"
}
```

### 500 Internal Server Error
```json
{
  "code": 500,
  "message": "Internal server error"
}
```

---

## Usage Examples

### Like a Property (JavaScript)
```javascript
const likeProperty = async (propertyId, token) => {
  const response = await fetch(`/api/v1/properties/${propertyId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### Add a Comment (JavaScript)
```javascript
const addComment = async (propertyId, text, token) => {
  const response = await fetch(`/api/v1/properties/${propertyId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  return await response.json();
};
```

### Get Comments (JavaScript)
```javascript
const getComments = async (propertyId, page = 1, limit = 10) => {
  const response = await fetch(
    `/api/v1/properties/${propertyId}/comments?page=${page}&limit=${limit}`
  );
  return await response.json();
};
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination uses 1-based indexing
- Comments are soft-deleted (status changed to 'deleted') rather than permanently removed
- Likes are completely removed when unliked
- The property's `likes` count is automatically updated when users like/unlike
- Builders can view all comments on their properties using the builder endpoint

