# Agent Role Implementation Summary

## Overview
Successfully implemented the `agent` role in the user model with agent-specific fields. The implementation allows for both `user` and `agent` roles to register and login using OTP verification, with all fields optional to handle both roles.

## Changes Made

### 1. User Model (`src/models/user.model.js`)
**Added Agent-Specific Fields:**
- `reraNumber` (String, optional) - RERA registration number
- `state` (String, optional) - State of operation
- `agencyName` (String, optional) - Name of the agency
- `reraCertificate` (String, optional) - S3 URL for RERA certificate
- `reraCertificateKey` (String, optional) - S3 key for RERA certificate deletion
- `yearsOfExperience` (Number, optional) - Years of experience in real estate

**Updated:**
- Role enum now includes: `['user', 'agent', 'guest', 'admin', 'builder']`
- All fields remain optional to support both user and agent roles

**Common Fields (for both user and agent):**
- `name` - User/Agent name
- `cityofInterest` - City of interest/operation

### 2. Roles Configuration (`src/config/roles.js`)
- Added `agent` role to the roles configuration
- Agent role has the same permissions as regular users (can be customized later)

### 3. Validations

#### Auth Validation (`src/validations/auth.validation.js`)
- **`registerWithPasswordAndSendOTP`**: Added `role` field (optional, defaults to 'user', accepts 'user' or 'agent')
- **`completeRegistrationWithProfile`**: Added all agent-specific fields as optional parameters

#### User Validation (`src/validations/user.validation.js`)
Updated the following validations to include agent-specific fields:
- `createUser` - Added role validation including 'agent'
- `updateUser` - Added agent fields to update validation
- `updateProfile` - Added agent fields to profile update
- `completeRegistrationWithProfile` - Added agent fields

### 4. Services

#### Auth Service (`src/services/auth.service.js`)
- **`registerWithPasswordAndSendOTP`**: Updated to accept and store the `role` field during registration
- Returns the user's role in the response

#### User Service (`src/services/user.service.js`)
- No changes required - already handles all fields generically through `createUser` and `updateUserById`

### 5. File Upload Flow
**Uses existing common upload endpoint:**
- Agent uploads RERA certificate using `/api/v1/common/upload` (same as user profile images)
- Returns S3 URL and key
- Agent then updates profile with `reraCertificate` and `reraCertificateKey`
- File size limit: 5MB (configurable in `common.controller.js`)

### 6. Controllers
**No changes required** - Uses existing:
- `common.controller.js` - `uploadFile` for S3 upload
- `user.controller.js` - `updateProfile` to save URL and key

## API Usage Examples

### 1. Register as Agent (Step 1: Send OTP)
```http
POST /api/v1/auth/register-with-otp
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "password123",
  "role": "agent"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "userId": "60d5ec49f1b2c72b4c8e4a1a",
  "email": "agent@example.com",
  "role": "agent"
}
```

### 2. Verify Registration OTP (Step 2)
```http
POST /api/v1/auth/verify-registration-otp
Content-Type: application/json

{
  "email": "agent@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully. Please complete your profile.",
  "userId": "60d5ec49f1b2c72b4c8e4a1a",
  "email": "agent@example.com"
}
```

### 3. Complete Registration with Profile (Step 3)
```http
POST /api/v1/auth/complete-registration-profile
Content-Type: application/json

{
  "userId": "60d5ec49f1b2c72b4c8e4a1a",
  "name": "John Doe",
  "contactNumber": "+1234567890",
  "cityofInterest": "Mumbai",
  "reraNumber": "A12345678",
  "state": "Maharashtra",
  "agencyName": "Dream Homes Realty",
  "yearsOfExperience": 5
}
```

**Response:**
```json
{
  "user": {
    "id": "60d5ec49f1b2c72b4c8e4a1a",
    "email": "agent@example.com",
    "name": "John Doe",
    "role": "agent",
    "reraNumber": "A12345678",
    "state": "Maharashtra",
    "agencyName": "Dream Homes Realty",
    "yearsOfExperience": 5,
    "isEmailVerified": true,
    ...
  },
  "tokens": {
    "access": { "token": "...", "expires": "..." },
    "refresh": { "token": "...", "expires": "..." }
  }
}
```

### 4. Upload RERA Certificate (Step 1: Upload to S3)
```http
POST /api/v1/common/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://your-bucket.s3.amazonaws.com/1234567890-uuid.pdf",
    "key": "1234567890-uuid.pdf",
    "originalName": "rera-certificate.pdf",
    "mimeType": "application/pdf",
    "size": 123456
  }
}
```

### 5. Update Profile with RERA Certificate (Step 2: Save URL & Key)
```http
PATCH /api/v1/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reraCertificate": "https://your-bucket.s3.amazonaws.com/1234567890-uuid.pdf",
  "reraCertificateKey": "1234567890-uuid.pdf"
}
```

**Response:**
```json
{
  "id": "60d5ec49f1b2c72b4c8e4a1a",
  "email": "agent@example.com",
  "name": "John Doe",
  "role": "agent",
  "reraCertificate": "https://your-bucket.s3.amazonaws.com/1234567890-uuid.pdf",
  "reraCertificateKey": "1234567890-uuid.pdf",
  ...
}
```

### 6. Login as Agent (Using existing OTP flow)
```http
POST /api/v1/auth/login-with-otp
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "password123"
}
```

Then complete with OTP verification as usual.

## User Registration Flow (for both User and Agent)

### Regular User:
1. Send registration request with `role: "user"` (or omit role, defaults to user)
2. Verify OTP
3. Complete profile with: name, cityofInterest (and optional preferences)

### Agent:
1. Send registration request with `role: "agent"`
2. Verify OTP
3. Complete profile with: name, cityofInterest, reraNumber, state, agencyName, yearsOfExperience
4. (Optional) Upload RERA certificate:
   - Step 1: Upload file to S3 using `/api/v1/common/upload` → Get URL & key
   - Step 2: Update profile with URL & key using `/api/v1/users/profile`

## Database Fields Summary

### Common Fields (Both User & Agent):
- `name` - Required for both
- `email` - Required for both
- `password` - Required for both
- `cityofInterest` - Optional for both
- `contactNumber` - Optional for both
- `role` - 'user' or 'agent'

### Agent-Only Fields (Optional):
- `reraNumber` - RERA registration number
- `state` - State of operation
- `agencyName` - Agency name
- `reraCertificate` - S3 URL of RERA certificate
- `reraCertificateKey` - S3 key for certificate
- `yearsOfExperience` - Years of experience

## Notes

1. **All fields are optional** to accommodate both roles in the same model
2. **OTP verification** works the same way for both users and agents
3. **Login flow** is identical for both roles
4. **RERA certificate upload** uses the same common upload flow as user profile images:
   - Upload to S3 via `/api/v1/common/upload`
   - Save URL and key via `/api/v1/users/profile`
5. **File upload** supports 5MB file size limit (configurable)
6. Agent-specific fields are returned in API responses when populated

## Testing

To test the implementation:
1. Register as an agent with the role field set to "agent"
2. Complete the OTP verification
3. Complete profile with agent-specific fields
4. Upload RERA certificate:
   - Upload file to `/api/v1/common/upload` and get URL & key
   - Update profile with the URL & key using `/api/v1/users/profile`
5. Verify all fields are stored correctly in the database

## Future Enhancements

Consider implementing:
1. Agent-specific permissions in the roles system
2. Validation to require certain fields based on role
3. Agent-specific endpoints for property listings
4. Agent dashboard features
5. RERA certificate verification workflow

