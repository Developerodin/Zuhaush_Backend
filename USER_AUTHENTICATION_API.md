# User Authentication API Documentation

This document describes the authentication and user registration endpoints for the Zuhaush Backend API.

**Base URL**: `http://localhost:3000/v1/users`

---

## Table of Contents

1. [Basic Authentication](#basic-authentication)
   - [Login](#1-login)
   - [Register](#2-register)
2. [OTP-Based Registration Flow](#otp-based-registration-flow)
   - [Step 1: Register with OTP](#3-register-with-otp)
   - [Step 2: Verify Registration OTP](#4-verify-registration-otp)
   - [Step 3: Complete Registration](#5-complete-registration)
3. [OTP-Based Login Flow](#otp-based-login-flow)
   - [Step 1: Login with OTP](#6-login-with-otp)
   - [Step 2: Complete Login with OTP](#7-complete-login-with-otp)
4. [Password Reset Flow](#password-reset-flow)
   - [Step 1: Send Forgot Password OTP](#8-forgot-password)
   - [Step 2: Verify Forgot Password OTP](#9-verify-forgot-password-otp)
   - [Step 3: Reset Password](#10-reset-password)

---

## Basic Authentication

### 1. Login

**Endpoint**: `POST /v1/users/login`

**Description**: Standard email and password login.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isEmailVerified": true,
    "isActive": true,
    "contactNumber": "+1234567890",
    "cityofInterest": "New York"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-01T10:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-31T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

- **400 Bad Request** - Invalid email or password format
```json
{
  "code": 400,
  "message": "Validation error: email must be a valid email"
}
```

- **401 Unauthorized** - Incorrect credentials
```json
{
  "code": 401,
  "message": "Incorrect email or password"
}
```

---

### 2. Register

**Endpoint**: `POST /v1/users/register`

**Description**: Standard registration with email and password. Immediately creates a fully registered user.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "Password123",
  "name": "Jane Doe",
  "contactNumber": "+1234567890",
  "cityofInterest": "Los Angeles"
}
```

**Required Fields**:
- `email` (string, valid email)
- `password` (string, min 8 characters, must contain at least one letter and one number)

**Optional Fields**:
- `name` (string)
- `contactNumber` (string)
- `cityofInterest` (string)

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123",
    "name": "Jane Doe",
    "contactNumber": "+1234567890",
    "cityofInterest": "Los Angeles"
  }'
```

**Success Response** (201 Created):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "user",
    "isEmailVerified": false,
    "isActive": true,
    "contactNumber": "+1234567890",
    "cityofInterest": "Los Angeles",
    "registrationStatus": "completed"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-01T10:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-31T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

- **400 Bad Request** - Email already exists
```json
{
  "code": 400,
  "message": "Email already taken"
}
```

- **400 Bad Request** - Validation error
```json
{
  "code": 400,
  "message": "Validation error: password must be at least 8 characters and contain at least one letter and one number"
}
```

---

## OTP-Based Registration Flow

This is a three-step registration process with email verification.

### 3. Register with OTP

**Endpoint**: `POST /v1/users/register-with-otp`

**Description**: Step 1 - Create a user account with email and password, and send an OTP to the email for verification.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "Password123"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/register-with-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "OTP sent to email successfully",
  "userId": "507f1f77bcf86cd799439013",
  "email": "newuser@example.com",
  "registrationStatus": "partial"
}
```

**Error Responses**:

- **400 Bad Request** - Email already exists
```json
{
  "code": 400,
  "message": "Email already taken"
}
```

---

### 4. Verify Registration OTP

**Endpoint**: `POST /v1/users/verify-registration-otp`

**Description**: Step 2 - Verify the OTP sent to the user's email during registration.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "otp": "123456"
}
```

**Field Requirements**:
- `otp` must be exactly 6 digits

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/verify-registration-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "otp": "123456"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "OTP verified successfully",
  "userId": "507f1f77bcf86cd799439013",
  "email": "newuser@example.com",
  "isEmailVerified": true,
  "registrationStatus": "otp_verified"
}
```

**Error Responses**:

- **400 Bad Request** - Invalid or expired OTP
```json
{
  "code": 400,
  "message": "Invalid or expired OTP"
}
```

- **404 Not Found** - User not found
```json
{
  "code": 404,
  "message": "User not found"
}
```

---

### 5. Complete Registration

**Endpoint**: `POST /v1/users/complete-registration`

**Description**: Step 3 - Complete the registration by providing profile information. Returns authentication tokens.

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "name": "Jane Doe",
  "contactNumber": "+1234567890",
  "cityofInterest": "Los Angeles",
  "preferences": {
    "propertyTypes": ["apartment", "house"],
    "budgetRange": {
      "min": 100000,
      "max": 500000
    },
    "locations": ["Downtown", "Suburbs"]
  }
}
```

**Required Fields**:
- `userId` (string, MongoDB ObjectId)
- `name` (string)

**Optional Fields**:
- `contactNumber` (string)
- `cityofInterest` (string)
- `preferences` (object)
  - `propertyTypes` (array of strings)
  - `budgetRange` (object with `min` and `max` numbers)
  - `locations` (array of strings)

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439013",
    "name": "Jane Doe",
    "contactNumber": "+1234567890",
    "cityofInterest": "Los Angeles",
    "preferences": {
      "propertyTypes": ["apartment", "house"],
      "budgetRange": {
        "min": 100000,
        "max": 500000
      },
      "locations": ["Downtown", "Suburbs"]
    }
  }'
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "user",
    "isEmailVerified": true,
    "isActive": true,
    "contactNumber": "+1234567890",
    "cityofInterest": "Los Angeles",
    "registrationStatus": "completed",
    "preferences": {
      "propertyTypes": ["apartment", "house"],
      "budgetRange": {
        "min": 100000,
        "max": 500000
      },
      "locations": ["Downtown", "Suburbs"]
    }
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-01T10:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-31T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

- **400 Bad Request** - Invalid userId or registration not verified
```json
{
  "code": 400,
  "message": "Email not verified. Please verify your email first."
}
```

---

## OTP-Based Login Flow

This is a two-step login process with OTP verification.

### 6. Login with OTP

**Endpoint**: `POST /v1/users/login-with-otp`

**Description**: Step 1 - Verify password and send OTP to user's email for additional security.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/login-with-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "OTP sent to email successfully. Please verify to complete login.",
  "email": "user@example.com"
}
```

**Error Responses**:

- **401 Unauthorized** - Incorrect credentials
```json
{
  "code": 401,
  "message": "Incorrect email or password"
}
```

---

### 7. Complete Login with OTP

**Endpoint**: `POST /v1/users/complete-login-otp`

**Description**: Step 2 - Verify the OTP to complete the login process and receive authentication tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Field Requirements**:
- `otp` must be exactly 6 digits

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/complete-login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isEmailVerified": true,
    "isActive": true,
    "contactNumber": "+1234567890",
    "cityofInterest": "New York"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-01T10:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2025-10-31T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

- **400 Bad Request** - Invalid or expired OTP
```json
{
  "code": 400,
  "message": "Invalid or expired OTP"
}
```

---

## Password Reset Flow

This is a three-step password reset process.

### 8. Forgot Password

**Endpoint**: `POST /v1/users/forgot-password`

**Description**: Step 1 - Send a password reset OTP to the user's email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset OTP sent to email successfully",
  "email": "user@example.com"
}
```

**Error Responses**:

- **404 Not Found** - User not found
```json
{
  "code": 404,
  "message": "No user found with this email"
}
```

---

### 9. Verify Forgot Password OTP

**Endpoint**: `POST /v1/users/verify-forgot-password-otp`

**Description**: Step 2 - Verify the password reset OTP sent to the user's email.

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Field Requirements**:
- `otp` must be exactly 6 digits

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/verify-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "OTP verified successfully. You can now reset your password.",
  "email": "user@example.com",
  "verified": true
}
```

**Error Responses**:

- **400 Bad Request** - Invalid or expired OTP
```json
{
  "code": 400,
  "message": "Invalid or expired OTP"
}
```

---

### 10. Reset Password

**Endpoint**: `POST /v1/users/reset-password`

**Description**: Step 3 - Reset the password after OTP verification.

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword456"
}
```

**Field Requirements**:
- `otp` must be exactly 6 digits
- `newPassword` must be at least 8 characters and contain at least one letter and one number

**cURL Example**:
```bash
curl -X POST http://localhost:3000/v1/users/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "NewPassword456"
  }'
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successfully",
  "email": "user@example.com"
}
```

**Error Responses**:

- **400 Bad Request** - Invalid OTP or password validation failed
```json
{
  "code": 400,
  "message": "Invalid or expired OTP"
}
```

```json
{
  "code": 400,
  "message": "Validation error: newPassword must be at least 8 characters and contain at least one letter and one number"
}
```

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "code": 400,
  "message": "Error message description"
}
```

### HTTP Status Codes Used:

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Validation error or invalid input
- **401 Unauthorized** - Authentication failed
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Authentication Token Usage

After successful login or registration, you'll receive access and refresh tokens. Use the access token in subsequent API requests:

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Authenticated Request**:
```bash
curl -X GET http://localhost:3000/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Token Expiration**:
- Access Token: 30 minutes (default)
- Refresh Token: 30 days (default)

---

## Notes

1. **OTP Expiration**: OTPs typically expire after 10 minutes
2. **OTP Format**: All OTPs are 6-digit numeric codes
3. **Password Requirements**: Minimum 8 characters with at least one letter and one number
4. **Email Format**: Must be a valid email address
5. **Rate Limiting**: API may be rate-limited to prevent abuse

---

## Testing with Postman

### Import Collection
You can create a Postman collection with these endpoints. Here's a basic workflow:

1. **Basic Login Flow**:
   - Register → Login

2. **OTP Registration Flow**:
   - Register with OTP → Verify Registration OTP → Complete Registration

3. **OTP Login Flow**:
   - Login with OTP → Complete Login with OTP

4. **Password Reset Flow**:
   - Forgot Password → Verify Forgot Password OTP → Reset Password

### Environment Variables
Set these environment variables in Postman:
- `baseUrl`: `http://localhost:3000/v1/users`
- `accessToken`: (will be set from login response)
- `userId`: (will be set from registration response)

---

## Support

For issues or questions about these APIs, please contact the development team or refer to the main project documentation.

