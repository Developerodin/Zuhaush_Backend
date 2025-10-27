# New Registration & Login Flow API Documentation

## Overview

This document describes the new 4-layer registration and login flow that intelligently handles both new user registration and existing user login based on email verification.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER PROVIDES EMAIL                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │  1. CHECK EMAIL EXISTENCE       │
         │  POST /auth/check-email         │
         └────────┬───────────────┬────────┘
                  │               │
         EXISTS ──┘               └── DOESN'T EXIST
                  │                        │
                  ▼                        ▼
  ┌──────────────────────────┐  ┌─────────────────────────────┐
  │   EXISTING USER FLOW     │  │   NEW USER FLOW             │
  └──────────────────────────┘  └─────────────────────────────┘
  │  2. LOGIN WITH PASSWORD  │  │  2. SEND REGISTRATION OTP   │
  │  POST /auth/login        │  │  POST /auth/send-otp        │
  │                          │  │                             │
  │  Headers:                │  │  Body:                      │
  │  { email, password }     │  │  {                         │
  │                          │  │    email,                  │
  │                          │  │    type: "registration"    │
  │                          │  │  }                         │
  │                          │  │                            │
  │                          │  ├───────────────────────────┤
  │                          │  │  3. VERIFY OTP            │
  │                          │  │  POST /auth/verify-otp    │
  │                          │  │                          │
  │                          │  │  Body:                   │
  │                          │  │  {                      │
  │                          │  │    email,               │
  │                          │  │    otp,                 │
  │                          │  │    type: "registration" │
  │                          │  │  }                      │
  │                          │  │                         │
  │                          │  ├────────────────────────┤
  │                          │  │  4. CREATE PASSWORD    │
  │                          │  │  POST /auth/create-    │
  │                          │  │       password         │
  │                          │  │                        │
  │                          │  │  Body:                │
  │                          │  │  {                   │
  │                          │  │    email,            │
  │                          │  │    password,         │
  │                          │  │    role              │
  │                          │  │  }                   │
  │                          │  │                      │
  │                          │  ├─────────────────────┤
  │                          │  │  5. COMPLETE PROFILE │
  │                          │  │  POST /auth/         │
  │                          │  │    complete-registration-│
  │                          │  │    profile           │
  │                          │  │                     │
  │                          │  │  Body:             │
  │                          │  │  {                │
  │                          │  │    userId,        │
  │                          │  │    name,          │
  │                          │  │    contactNumber, │
  │                          │  │    cityofInterest │
  │                          │  │  }                │
  │                          │  │                   │
  │                          │  └───────────────────┘
  │                          │
  │                          ▼
         ┌──────────────────────────────────┐
         │     GET AUTH TOKENS & USER        │
         └──────────────────────────────────┘
```

---

## API Endpoints

### 1. Check Email Existence

Check if a user with the provided email already exists in the system.

**Endpoint:** `POST /api/v1/auth/check-email`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (User Exists):**
```json
{
  "exists": true,
  "message": "User already exists. Please login with your password."
}
```

**Response (User Doesn't Exist):**
```json
{
  "exists": false,
  "message": "New user. Please proceed with registration."
}
```

**Error Response:**
```json
{
  "code": 400,
  "message": "Invalid email format"
}
```

---

### 2A. Login (For Existing Users)

Login with email and password for users who already have an account.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "isEmailVerified": true,
    "isActive": true
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-12-31T12:00:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-12-31T12:00:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "code": 401,
 decssage": "Incorrect email or password"
}
```

---

### 2B. Send Registration OTP (For New Users)

Send an OTP to the user's email for registration verification.

**Endpoint:** `POST /api/v1/auth/send-otp`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "type": "registration"
}
```

**Note:** The `type` must be `"registration"` for new user registration.

**Success Response (200):**
```json
{
  "message": "OTP sent successfully to newuser@example.com"
}
```

**Error Response (429):**
```json
{
  "code": 429,
  "message": "Too many OTP requests. Please try again later."
}
```

---

### 3. Verify Registration OTP

Verify the OTP sent to the user's email.

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "otp": "123456",
  "type": "registration"
}
```

**Success Response (200):**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

**Error Response (401):**
```json
{
  "code": 401,
  "message": "Invalid or expired OTP"
}
```

---

### 4. Create Password

Create password for the account. OTP was already verified in the previous step.

**Endpoint:** `POST /api/v1/auth/create-password`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Note:** 
- The `role` can be either `"user"` or `"agent"` (default: `"user"`)
- Password must contain at least 8 characters, one letter, and one number
- OTP verification from step 3 is required before this step
- No need to send OTP again - it's already verified

**Success Response (201):**
```json
{
  "message": "Password created successfully",
  "userId": "507f1f77bcf86cd799439011",
  "email": "newuser@example.com",
  "role": "user"
}
```

**Error Response (400):**
```json
{
  "code": 400,
  "message": "Please verify OTP first"
}
```

**Error Response (404):**
```json
{
  "code": 404,
  "message": "User not found. Please complete OTP verification first."
}
```

**Error Response (409):**
```json
{
  "code": 409,
  "message": "Email already taken"
}
```

---

### 5. Complete Registration Profile

Complete the user's profile with additional information.

**Endpoint:** `POST /api/v1/auth/complete-registration-profile`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "contactNumber": "+1234567890",
  "cityofInterest": "New York"
}
```

**For Agent Role - Additional Fields:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "Jane Agent",
  "contactNumber": "+1234567890",
  "cityofInterest": "Los Angeles",
  "reraNumber": "RERA123456",
  "state": "California",
  "agencyName": "Premium Real Estate",
  "reraCertificate": "https://s3.amazonaws.com/...",
  "reraCertificateKey": "certificates/...",
  "yearsOfExperience": 5
}
```

**Success Response (200):**
```json
{
  "message": "Registration completed successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "newuser@example.com",
    "role": "user",
    "contactNumber": "+1234567890",
    "cityofInterest": "New York",
    "isEmailVerified": true,
    "registrationStatus": "completed",
    "isActive": true
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-12-31T12:00:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-12-31T12:00:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "code": 404,
  "message": "User not found"
}
```

---

## Complete Registration Flow Examples

### Example 1: New User Registration (Standard User)

**Step 1: Check Email**
```bash
curl -X POST http://localhost:3000/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "exists": false,
  "message": "New user. Please proceed with registration."
}
```

**Step 2: Send Registration OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "type": "registration"
  }'
```

**Step 3: Verify OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "type": "registration"
  }'
```

**Step 4: Create Password**
```bash
curl -X POST http://localhost:3000/api/v1/auth/create-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "user"
  }'
```

**Step 5: Complete Profile**
```bash
curl -X POST http://localhost:3000/api/v1/auth/complete-registration-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "contactNumber": "+1234567890",
    "cityofInterest": "New York"
  }'
```

---

### Example 2: Existing User Login

**Step 1: Check Email**
```bash
curl -X POST http://localhost:3000/api/v1/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com"
  }'
```

**Response:**
```json
{
  "exists": true,
  "message": "User already exists. Please login with your password."
}
```

**Step 2: Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "SecurePass123"
  }'
```

---

### Example 3: New Agent Registration

**Step 1-4:** Same as standard user registration, but with `"role": "agent"` in Step 4.

**Step 5: Complete Profile with Agent Details**
```bash
curl -X POST http://localhost:3000/api/v1/auth/complete-registration-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439012",
    "name": "Jane Agent",
    "contactNumber": "+1234567890",
    "cityofInterest": "Los Angeles",
    "reraNumber": "RERA123456",
    "state": "California",
    "agencyName": "Premium Real Estate",
    "reraCertificate": "https://s3.amazonaws.com/bucket/cert.pdf",
    "reraCertificateKey": "certificates/cert.pdf",
    "yearsOfExperience": 5
  }'
```

---

## Field Requirements

### Password Requirements
- Minimum 8 characters
- At least one letter (a-z or A-Z)
- At least one number (0-9)

### Email Requirements
- Valid email format
- Must be unique in the system

### Contact Number Requirements
- Valid international format
- Optional but recommended

### Role Options
- `"user"` - Standard user (default)
- `"agent"` - Real estate agent

### Agent-Specific Fields (Optional)
- `reraNumber` - String
- `state` - String
- `agencyName` - String
- `reraCertificate` - URL string
- `reraCertificateKey` - S3 key string
- `yearsOfExperience` - Number (minimum 0)

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials or OTP |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Email already taken |
| 429 | Too Many Requests - Rate limit exceeded |

---

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Rate Limiting**: Maximum 3 OTP requests per 15 minutes per email
3. **OTP Attempts**: Maximum 5 verification attempts per OTP
4. **Password Hashing**: Passwords are hashed using bcrypt
5. **JWT Tokens**: Secure authentication tokens with expiration
6. **OTP Blacklisting**: OTPs are blacklisted after successful verification

---

## Frontend Integration Guide

### Recommended Flow

1. **Email Input Screen**
   - User enters email
   - Call `/auth/check-email`
   - Show appropriate UI based on response

2. **If User Exists (Login Path)**
   - Show password input field
   - Call `/auth/login` with email + password
   - Store tokens and redirect to dashboard

3. **If New User (Registration Path)**
   - Show "Registration" header
   - Call `/auth/send-otp` with type: "registration"
   - Show OTP input screen
   - Call `/auth/verify-otp`
   - Show credentials screen (password + role)
   - Call `/auth/create-user-credentials`
   - Show profile completion screen
   - Call `/auth/complete-registration-profile`
   - Store tokens and redirect to dashboard

### State Management

```javascript
// Example React state
const [registrationState, setRegistrationState] = useState({
  email: '',
  userExists: null,
  otpSent: false,
  otpVerified: false,
  credentialsCreated: false,
  userId: null
});

// State transitions
// 1. checkEmail() → set userExists
// 2. sendOTP() → set otpSent = true
// 3. verifyOTP() → set otpVerified = true
// 4. createCredentials() → set credentialsCreated = true, set userId
// 5. completeProfile() → redirect to dashboard
```

---

## Migration from Old Flow

### Old Flow
```
1. POST /auth/register-with-otp
2. POST /auth/verify-registration-otp
3. POST /auth/complete-registration-profile
```

### New Flow
```
1. POST /auth/check-email
2. (if new) POST /auth/send-otp with type: "registration"
3. (if new) POST /auth/verify-otp with type: "registration"
4. (if new) POST /auth/create-user-credentials
5. (if new) POST /auth/complete-registration-profile
```

The old endpoints are still functional but the new flow provides better user experience by checking user existence first.

---

## Testing

Use the provided cURL examples or Postman collection to test the flow.

### Test Data
- **Existing User Email:** `existing@example.com`
- **New User Email:** `newuser@example.com`
- **Test OTP:** Use the actual OTP sent to email
- **Test Password:** `TestPass123`

---

## Troubleshooting

### Common Issues

1. **"OTP expired or not found"**
   - OTP expires after 10 minutes
   - Request a new OTP if expired

2. **"Too many OTP requests"**
   - Rate limit: 3 requests per 15 minutes
   - Wait before requesting another OTP

3. **"Email already taken"**
   - The email is already registered
   - Use login endpoint instead

4. **"Invalid OTP"**
   - Check the OTP entered
   - You have 5 attempts per OTP

---

## Support

For questions or issues, please contact the backend development team or refer to the main API documentation.

