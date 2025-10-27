# Builder Registration Flow API Documentation

## Overview

This document describes the new 4-layer registration and login flow specifically designed for builders. The flow intelligently handles both new builder registration and existing builder login based on email verification.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  BUILDER PROVIDES EMAIL                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │  1. CHECK EMAIL EXISTENCE       │
         │  POST /builders/check-email     │
         └────────┬───────────────┬────────┘
                  │               │
         EXISTS ──┘               └── DOESN'T EXIST
                  │                        │
                  ▼                        ▼
  ┌──────────────────────────┐  ┌─────────────────────────────┐
  │   EXISTING BUILDER FLOW │  │   NEW BUILDER FLOW          │
  └──────────────────────────┘  └─────────────────────────────┘
  │  2. LOGIN WITH PASSWORD  │  │  2. SEND REGISTRATION OTP   │
  │  POST /builders/login    │  │  POST /builders/send-otp    │
  │                          │  │                             │
  │  Headers:                │  │  Body:                      │
  │  { email, password }     │  │  {                         │
  │                          │  │    email,                  │
  │                          │  │    type: "registration"    │
  │                          │  │  }                         │
  │                          │  │                            │
  │                          │  ├───────────────────────────┤
  │                          │  │  3. VERIFY OTP            │
  │                          │  │  POST /builders/verify-otp│
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
  │                          │  │  POST /builders/create-│
  │                          │  │       password         │
  │                          │  │                        │
  │                          │  │  Body:                │
  │                          │  │  {                   │
  │                          │  │    email,            │
  │                          │  │    password          │
  │                          │  │  }                   │
  │                          │  │                      │
  │                          │  ├─────────────────────┤
  │                          │  │  5. COMPLETE PROFILE│
  │                          │  │  POST /builders/     │
  │                          │  │    complete-registration│
  │                          │  │                     │
  │                          │  │  Body:             │
  │                          │  │  {                │
  │                          │  │    builderId,     │
  │                          │  │    name,          │
  │                          │  │    company,       │
  │                          │  │    ...            │
  │                          │  │  }                │
  │                          │  │                   │
  │                          │  └───────────────────┘
  │                          │
                          ▼
         ┌──────────────────────────────────┐
         │     GET AUTH TOKENS & BUILDER     │
         └──────────────────────────────────┘
```

---

## API Endpoints

### 1. Check Email Existence

Check if a builder with the provided email already exists in the system.

**Endpoint:** `POST /api/v1/builders/check-email`

**Request Body:**
```json
{
  "email": "builder@example.com"
}
```

**Response (Builder Exists):**
```json
{
  "exists": true,
  "message": "Builder already exists. Please login with your password."
}
```

**Response (Builder Doesn't Exist):**
```json
{
  "exists": false,
  "message": "New builder. Please proceed with registration."
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

### 2A. Login (For Existing Builders)

Login with email and password for builders who already have an account.

**Endpoint:** `POST /api/v1/builders/login`

**Request Body:**
```json
{
  "email": "builder@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "builder": {
    "id": "507f1f77bcf86cd799439011",
    "name": "ABC Builders",
    "email": "builder@example.com",
    "company": "ABC Construction",
    "role": "builder",
    "isEmailVerified": true,
    "isActive": true,
    "status": "approved"
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
  "message": "Incorrect email or password"
}
```

**Error Response (401 - Inactive Account):**
```json
{
  "code": 401,
  "message": "Account is deactivated"
}
```

---

### 2B. Send Registration OTP (For New Builders)

Send an OTP to the builder's email for registration verification.

**Endpoint:** `POST /api/v1/builders/send-otp`

**Request Body:**
```json
{
  "email": "newbuilder@example.com",
  "type": "registration"
}
```

**Note:** The `type` must be `"registration"` for new builder registration.

**Success Response (200):**
```json
{
  "message": "OTP sent to your email",
  "tempBuilderId": "507f1f77bcf86cd799439011"
}
```

**Error Response (409):**
```json
{
  "code": 409,
  "message": "Builder already exists with this email"
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

Verify the OTP sent to the builder's email.

**Endpoint:** `POST /api/v1/builders/verify-otp`

**Request Body:**
```json
{
  "email": "newbuilder@example.com",
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

**Endpoint:** `POST /api/v1/builders/create-password`

**Request Body:**
```json
{
  "email": "newbuilder@example.com",
  "password": "SecurePass123"
}
```

**Note:** 
- Password must contain at least 8 characters, one letter, and one number
- OTP verification from step 3 is required before this step
- Role is automatically set to "builder"

**Success Response (201):**
```json
{
  "message": "Password created successfully",
  "builderId": "507f1f77bcf86cd799439011",
  "email": "newbuilder@example.com",
  "role": "builder"
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
  "message": "Builder not found. Please complete OTP verification first."
}
```

**Error Response (409):**
```json
{
  "code": 409,
  "message": "Registration already completed"
}
```

---

### 5. Complete Registration Profile

Complete the builder's profile with additional information.

**Endpoint:** `POST /api/v1/builders/complete-registration`

**Request Body:**
```json
{
  "builderId": "507f1f77bcf86cd799439011",
  "name": "ABC Builders",
  "company": "ABC Construction Ltd.",
  "contactPerson": "John Doe",
  "contactInfo": "info@abcbuilders.com",
  "phone": "+1234567890",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "website": "https://abcbuilders.com",
  "reraRegistrationId": "RERA123456",
  "yearsOfExperience": 10
}
```

**Success Response (200):**
```json
{
  "message": "Registration completed successfully",
  "builder": {
    "id": "507f1f77bcf86cd799439011",
    "name": "ABC Builders",
    "email": "newbuilder@example.com",
    "company": "ABC Construction Ltd.",
    "role": "builder",
    "status": "draft",
    "registrationStatus": "completed",
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "2023-12-01T10:00:00.000Z"
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
  "message": "Builder not found"
}
```

**Error Response (400):**
```json
{
  "code": 400,
  "message": "Please verify your email with OTP first"
}
```

---

## Complete Registration Flow Examples

### Example 1: New Builder Registration

**Step 1: Check Email**
```bash
curl -X POST http://localhost:3000/api/v1/builders/check-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "builder@example.com"
  }'
```

**Response:**
```json
{
  "exists": false,
  "message": "New builder. Please proceed with registration."
}
```

**Step 2: Send Registration OTP**
```bash
curl -X POST http://localhost:3000/api/v1/builders/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "builder@example.com",
    "type": "registration"
  }'
```

**Step 3: Verify OTP**
```bash
curl -X POST http://localhost:3000/api/v1/builders/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "builder@example.com",
    "otp": "123456",
    "type": "registration"
  }'
```

**Step 4: Create Password**
```bash
curl -X POST http://localhost:3000/api/v1/builders/create-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "builder@example.com",
    "password": "SecurePass123"
  }'
```

**Step 5: Complete Profile**
```bash
curl -X POST http://localhost:3000/api/v1/builders/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "builderId": "507f1f77bcf86cd799439011",
    "name": "ABC Builders",
    "company": "ABC Construction Ltd.",
    "contactPerson": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "reraRegistrationId": "RERA123456"
  }'
```

---

### Example 2: Existing Builder Login

**Step 1: Check Email**
```bash
curl -X POST http://localhost:3000/api/v1/builders/check-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com"
  }'
```

**Response:**
```json
{
  "exists": true,
  "message": "Builder already exists. Please login with your password."
}
```

**Step 2: Login**
```bash
curl -X POST http://localhost:3000/api/v1/builders/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "SecurePass123"
  }'
```

---

## Builder Profile Fields

### Required Fields
- `name` - Builder company name
- `email` - Valid email address (must be unique)
- `password` - Minimum 8 characters with letter and number

### Optional Fields
- `company` - Company name
- `contactPerson` - Name of primary contact
- `contactInfo` - Additional contact information
- `phone` - Phone number in international format
- `address` - Street address
- `city` - City name
- `state` - State/Province
- `website` - Company website URL
- `reraRegistrationId` - RERA registration number
- `reraCertificate` - URL to RERA certificate (uploaded separately)
- `reraCertificateKey` - S3 key for RERA certificate
- `logo` - URL to company logo (uploaded separately)
- `logoKey` - S3 key for logo
- `logoName` - Original logo filename

### System Fields (Auto-generated)
- `role` - Always set to "builder"
- `status` - Set to "draft" initially (draft, submitted, approved, rejected)
- `registrationStatus` - Tracks registration progress (partial, otp_verified, completed)
- `isEmailVerified` - Email verification status
- `isActive` - Account active status
- `createdAt` - Registration timestamp
- `lastLoginAt` - Last login timestamp

---

## Builder Status Flow

After registration, builders must follow an approval workflow:

1. **draft** - Initial state after registration
2. **submitted** - Builder submits for admin review
3. **approved** - Admin approves the builder
4. **rejected** - Admin rejects the builder (with notes)

### Submit for Review

**Endpoint:** `POST /api/v1/builders/submit-for-review`

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "Profile submitted for review",
  "builder": {
    "id": "507f1f77bcf86cd799439011",
    "status": "submitted",
    ...
  }
}
```

### Reset to Draft

**Endpoint:** `POST /api/v1/builders/reset-to-draft`

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "Profile reset to draft",
  "builder": {
    "id": "507f1f77bcf86cd799439011",
    "status": "draft",
    ...
  }
}
```

---

## Document Upload

Builders can upload supporting documents such as licenses, certificates, and registrations.

### Upload Single Document

**Endpoint:** `POST /api/v1/builders/:builderId/documents/single`

**Authentication:** Required (Bearer token)

**Request:** Multipart form data with `document` field

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/builders/507f1f77bcf86cd799439011/documents/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/certificate.pdf"
```

### Upload Multiple Documents

**Endpoint:** `POST /api/v1/builders/:builderId/documents/multiple`

**Authentication:** Required (Bearer token)

**Request:** Multipart form data with `documents` field (array)

---

## Field Requirements

### Password Requirements
- Minimum 8 characters
- At least one letter (a-z or A-Z)
- At least one number (0-9)

### Email Requirements
- Valid email format
- Must be unique in the system

### Phone Requirements
- Valid international format
- Pattern: `^\+?[1-9]\d{1,14}$`

### Website Requirements
- Valid URL format

### RERA Requirements
- RERA registration ID is optional but recommended
- Certificate should be uploaded as a document

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
7. **Admin Approval**: Builders require admin approval before active use

---

## Frontend Integration Guide

### Recommended Flow

1. **Email Input Screen**
   - Builder enters email
   - Call `/builders/check-email`
   - Show appropriate UI based on response

2. **If Builder Exists (Login Path)**
   - Show password input field
   - Call `/builders/login` with email + password
   - Store tokens and redirect to dashboard

3. **If New Builder (Registration Path)**
   - Show "Registration" header
   - Call `/builders/send-otp` with type: "registration"
   - Show OTP input screen
   - Call `/builders/verify-otp`
   - Show password input screen
   - Call `/builders/create-password`
   - Show profile completion screen
   - Call `/builders/complete-registration`
   - Store tokens and show "Submission pending" message
   - Wait for admin approval

4. **After Admin Approval**
   - Builder receives notification
   - Builder can now login and access dashboard

### State Management

```javascript
// Example React state
const [registrationState, setRegistrationState] = useState({
  email: '',
  builderExists: null,
  otpSent: false,
  otpVerified: false,
  passwordCreated: false,
  builderId: null,
  status: 'draft'
});

// State transitions
// 1. checkEmail() → set builderExists
// 2. sendOTP() → set otpSent = true
// 3. verifyOTP() → set otpVerified = true
// 4. createPassword() → set passwordCreated = true, set builderId
// 5. completeRegistration() → set status, redirect to pending screen
```

---

## Migration from Old Flow

### Old Flow
```
1. POST /builders/register-with-otp
2. POST /builders/verify-registration-otp
3. POST /builders/complete-registration
```

### New Flow
```
1. POST /builders/check-email
2. (if new) POST /builders/send-otp with type: "registration"
3. (if new) POST /builders/verify-otp with type: "registration"
4. (if new) POST /builders/create-password
5. (if new) POST /builders/complete-registration
```

The old endpoints are still functional but the new flow provides better user experience by checking builder existence first.

---

## Testing

Use the provided cURL examples or Postman collection to test the flow.

### Test Data
- **Existing Builder Email:** `existing@example.com`
- **New Builder Email:** `newbuilder@example.com`
- **Test OTP:** Use the actual OTP sent to email
- **Test Password:** `BuilderPass123`

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

5. **"Account is deactivated"**
   - Admin has deactivated the account
   - Contact support for assistance

6. **"Profile not approved"**
   - Builder must be approved by admin
   - Check status and wait for approval

---

## Support

For questions or issues, please contact the backend development team or refer to the main API documentation.

