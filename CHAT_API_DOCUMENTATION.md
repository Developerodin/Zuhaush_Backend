# Simple Chat API Documentation

This document provides documentation for the simplified Chat API system in the Zuhaush Backend application.

## Overview

The Chat API enables simple messaging between users and builders. It supports only basic text messaging with a simple schema.

## Base URL

```
/api/v1/chat
```

## Models

### Message Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  builderId: ObjectId, // Reference to Builder
  message: String, // Message content (max 1000 chars)
  senderType: String, // 'User' or 'Builder' - who sent the message
  createdAt: Date, // Created timestamp (system generated)
  updatedAt: Date // Updated timestamp (system generated)
}
```

## API Endpoints

### 1. Send Message

**POST** `/send`

Send a message between a user and builder.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "builderId": "builder_id_here",
  "message": "Hello, I'm interested in this property",
  "senderType": "User"
}
```

**Note:** `senderType` must be either `"User"` or `"Builder"` to indicate who is sending the message.

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "userId": {
      "name": "John Doe",
      "email": "john@example.com",
      "id": "user_id"
    },
    "builderId": {
      "name": "Builder Name",
      "email": "builder@example.com",
      "id": "builder_id"
    },
    "message": "Hello, I'm interested in this property",
    "senderType": "User",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "id": "message_id"
  }
}
```

### 2. Get Message History

**GET** `/history`

Get message history between a specific user and builder.

**Query Parameters:**
- `userId` (required): User ID
- `builderId` (required): Builder ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Message history retrieved successfully",
  "data": {
    "messages": [
      {
        "userId": {
          "email": "user@example.com",
          "name": "User Name",
          "id": "user_id"
        },
        "builderId": {
          "name": "Builder Name",
          "email": "builder@example.com",
          "id": "builder_id"
        },
        "message": "Hello, I'm interested in this property",
        "senderType": "User",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "id": "message_id"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

### 3. Get User Messages

**GET** `/messages`

Get all unique conversations for a specific user, showing only the latest message from each conversation.

**Query Parameters:**
- `userId` (required): User ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "userId": {
          "email": "user@example.com",
          "name": "User Name",
          "id": "user_id"
        },
        "builderId": {
          "name": "Builder Name",
          "email": "builder@example.com",
          "id": "builder_id"
        },
        "message": "Latest message in this conversation",
        "senderType": "Builder",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "id": "message_id"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Note:** This endpoint returns only the most recent message from each unique conversation. If a user has multiple messages with the same builder, only the latest one will be returned. To see the full conversation history between a specific user and builder, use the `/history` endpoint.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Optional validation errors
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

## Usage Examples

### Sending a Message

```javascript
const response = await fetch('/api/v1/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user_id_here',
    builderId: 'builder_id_here',
    message: 'I am interested in this property. Can we schedule a visit?',
    senderType: 'User' // or 'Builder' depending on who is sending
  })
});
```

### Getting Message History

```javascript
const response = await fetch('/api/v1/chat/history?userId=user_id&builderId=builder_id&page=1&limit=20');
```

### Getting All User Messages

```javascript
const response = await fetch('/api/v1/chat/messages?userId=user_id&page=1&limit=20');
```

## Database Indexes

The chat system includes optimized indexes for:
- Message queries by userId, builderId and timestamp
- Efficient message retrieval and pagination

## Performance Considerations

- Messages are paginated to handle large conversations
- Database indexes optimize query performance
- Simple schema reduces complexity and improves performance