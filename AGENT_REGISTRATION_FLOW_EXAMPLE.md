# Agent Registration & RERA Certificate Upload Flow

This document provides a complete example of the agent registration flow with RERA certificate upload.

## Complete Flow Example

### Step 1: Register as Agent
```bash
POST /api/v1/auth/register-with-otp
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "StrongPass123",
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

---

### Step 2: Verify OTP
```bash
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

---

### Step 3: Complete Profile with Agent Details
```bash
POST /api/v1/auth/complete-registration-profile
Content-Type: application/json

{
  "userId": "60d5ec49f1b2c72b4c8e4a1a",
  "name": "Rajesh Kumar",
  "contactNumber": "+919876543210",
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
    "name": "Rajesh Kumar",
    "contactNumber": "+919876543210",
    "cityofInterest": "Mumbai",
    "role": "agent",
    "reraNumber": "A12345678",
    "state": "Maharashtra",
    "agencyName": "Dream Homes Realty",
    "yearsOfExperience": 5,
    "isEmailVerified": true,
    "isActive": true,
    "registrationStatus": "completed"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-01-01T12:00:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2024-01-30T12:00:00.000Z"
    }
  }
}
```

---

### Step 4a: Upload RERA Certificate to S3
**Note:** This uses the same common upload endpoint as user profile images.

```bash
POST /api/v1/common/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: [Select your RERA certificate PDF/image file]
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://your-bucket.s3.amazonaws.com/1699876543210-a1b2c3d4-e5f6.pdf",
    "key": "1699876543210-a1b2c3d4-e5f6.pdf",
    "originalName": "rera-certificate.pdf",
    "mimeType": "application/pdf",
    "size": 245678
  }
}
```

---

### Step 4b: Save RERA Certificate URL & Key to Profile
```bash
PATCH /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reraCertificate": "https://your-bucket.s3.amazonaws.com/1699876543210-a1b2c3d4-e5f6.pdf",
  "reraCertificateKey": "1699876543210-a1b2c3d4-e5f6.pdf"
}
```

**Response:**
```json
{
  "id": "60d5ec49f1b2c72b4c8e4a1a",
  "email": "agent@example.com",
  "name": "Rajesh Kumar",
  "contactNumber": "+919876543210",
  "cityofInterest": "Mumbai",
  "role": "agent",
  "reraNumber": "A12345678",
  "state": "Maharashtra",
  "agencyName": "Dream Homes Realty",
  "yearsOfExperience": 5,
  "reraCertificate": "https://your-bucket.s3.amazonaws.com/1699876543210-a1b2c3d4-e5f6.pdf",
  "reraCertificateKey": "1699876543210-a1b2c3d4-e5f6.pdf",
  "isEmailVerified": true,
  "isActive": true
}
```

---

## Later: Update Agent Profile

If the agent wants to update their profile later (e.g., update years of experience or upload a new RERA certificate):

```bash
PATCH /api/v1/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "yearsOfExperience": 6,
  "agencyName": "Updated Realty Name"
}
```

---

## Delete Old RERA Certificate (Optional)

If uploading a new RERA certificate, you can delete the old one first:

```bash
DELETE /api/v1/common/files/1699876543210-a1b2c3d4-e5f6.pdf
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Key Points

### ✅ Same Flow as User Profile Images
- RERA certificate upload uses the **exact same flow** as uploading user profile images
- First upload to S3 → Get URL & key → Update profile

### ✅ Two-Step Process
1. **Upload file**: `/api/v1/common/upload` → Returns S3 URL and key
2. **Save to profile**: `/api/v1/users/profile` → Pass URL and key

### ✅ Advantages of This Approach
- **Consistent**: Same pattern across all file uploads
- **Flexible**: Can validate/preview file before saving to profile
- **Reusable**: Uses existing upload infrastructure
- **Clean separation**: File storage vs. data storage

### ✅ File Limits
- Max file size: **5MB** (configurable in `common.controller.js`)
- Supported formats: All formats (can add validation if needed)

---

## Frontend Implementation Example (JavaScript)

```javascript
// Step 4a: Upload RERA certificate to S3
async function uploadReraCertificate(file, accessToken) {
  const formData = new FormData();
  formData.append('file', file);

  const uploadResponse = await fetch('/api/v1/common/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  const uploadData = await uploadResponse.json();
  
  // Step 4b: Save URL and key to profile
  const profileResponse = await fetch('/api/v1/users/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reraCertificate: uploadData.data.url,
      reraCertificateKey: uploadData.data.key
    })
  });

  return await profileResponse.json();
}
```

---

## Summary

The agent can upload their RERA certificate **anytime after registration** using the same two-step upload flow:
1. Upload to S3 via common endpoint
2. Save URL & key to their profile

This keeps the implementation clean, consistent, and reusable across all file upload scenarios! 🎉

