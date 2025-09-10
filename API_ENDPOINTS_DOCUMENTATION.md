# Real Estate API Endpoints Documentation

## Overview
This document provides a comprehensive list of all API endpoints for the real estate application backend, including the new OTP-based authentication flow.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Endpoints

### Traditional Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout User
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Tokens
```http
POST /auth/refresh-tokens
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Forgot Password (Token-based)
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password (Token-based)
```http
POST /auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### OTP-based Authentication

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "type": "email_verification" // or "password_reset"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "type": "email_verification" // or "password_reset"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### Login with OTP
```http
POST /auth/login-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "accountType": "registered"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-12-31T23:59:59.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-01-30T23:59:59.000Z"
    }
  }
}
```

#### Register with OTP
```http
POST /auth/register-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "password123",
  "contactNumber": "+919876543210",
  "city": "Mumbai"
}
```

**Response:**
```json
{
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "accountType": "registered",
    "contactNumber": "+919876543210",
    "city": "Mumbai"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-12-31T23:59:59.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-01-30T23:59:59.000Z"
    }
  }
}
```

#### Reset Password with OTP
```http
POST /auth/reset-password-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### Guest Login
```http
POST /auth/guest-login
Content-Type: application/json
```

**Response:**
```json
{
  "user": {
    "id": "guest_1703123456789",
    "name": "Guest User",
    "email": "guest@zuhaush.com",
    "role": "guest",
    "accountType": "guest",
    "isEmailVerified": false
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-12-31T23:59:59.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-01-30T23:59:59.000Z"
    }
  }
}
```

## User Profile Endpoints

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "John Doe",
  "email": "john@example.com",
  "contactNumber": "+919876543210",
  "city": "Mumbai",
  "role": "user",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "accountType": "registered",
  "preferences": {
    "propertyTypes": ["apartment", "villa"],
    "budgetRange": {
      "min": 5000000,
      "max": 15000000
    },
    "locations": ["Mumbai", "Pune"]
  },
  "lastLoginAt": "2023-12-21T10:30:00.000Z",
  "isActive": true
}
```

### Update User Profile
```http
PATCH /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Smith",
  "contactNumber": "+919876543211",
  "city": "Delhi"
}
```

### Get User Preferences
```http
GET /users/preferences
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "preferences": {
    "propertyTypes": ["apartment", "villa"],
    "budgetRange": {
      "min": 5000000,
      "max": 15000000
    },
    "locations": ["Mumbai", "Pune"]
  }
}
```

### Update User Preferences
```http
POST /users/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "propertyTypes": ["apartment", "villa", "penthouse"],
  "budgetRange": {
    "min": 7000000,
    "max": 20000000
  },
  "locations": ["Mumbai", "Pune", "Bangalore"]
}
```

## City Endpoints

### Get All Active Cities
```http
GET /cities
```

**Response:**
```json
[
  {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "isActive": true
  },
  {
    "id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Delhi",
    "state": "Delhi",
    "country": "India",
    "isActive": true
  }
]
```

### Search Cities
```http
GET /cities/search?q=mum&limit=10&page=1
```

**Response:**
```json
{
  "results": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "isActive": true
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

### Get City by ID
```http
GET /cities/{cityId}
```

### Create City (Admin Only)
```http
POST /cities
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Pune",
  "state": "Maharashtra",
  "country": "India"
}
```

### Update City (Admin Only)
```http
PUT /cities/{cityId}
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Pune",
  "state": "Maharashtra",
  "isActive": true
}
```

### Delete City (Admin Only)
```http
DELETE /cities/{cityId}
Authorization: Bearer <admin_access_token>
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid OTP type",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired OTP",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "No user found with this email",
  "error": "Not Found"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many OTP requests. Please try again later.",
  "error": "Too Many Requests"
}
```

## Rate Limiting

- **OTP Requests**: 5 per hour per email
- **Login Attempts**: 5 per 15 minutes per IP
- **Registration**: 3 per hour per IP

## OTP Security

- **Expiration**: 10 minutes
- **Format**: 6-digit numeric
- **Max Attempts**: 3 per OTP
- **Single Use**: OTP is deleted after successful verification

## User Flow Examples

### Complete Registration Flow
1. User enters email and password on login screen
2. System detects new email and sends OTP
3. User receives OTP via email
4. User enters OTP on verification screen
5. User completes profile with additional details
6. User is logged in with full access

### Password Reset Flow
1. User clicks "Forgot Password?" on login screen
2. User enters email address
3. System sends OTP to email
4. User enters OTP and new password
5. Password is updated and user can login

### Guest Access Flow
1. User clicks "Continue as a guest"
2. System creates temporary guest session
3. User has limited access to browse properties
4. User can convert to registered account anytime

This API documentation covers all the endpoints needed to implement the complete user authentication and onboarding flow for the real estate application.
