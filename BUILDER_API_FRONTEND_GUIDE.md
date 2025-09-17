# Builder API Frontend Integration Guide

This guide provides comprehensive documentation for integrating with the Builder API endpoints from your frontend application.

## Base URL
```
http://localhost:3002/v1/builders
```

## Authentication
Most endpoints require authentication. You can use either **Admin tokens** or **Builder tokens**. Include the JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Note**: Both admin and builder tokens are accepted for builder endpoints. Admin tokens have full access to all builder operations, while builder tokens have access to their own profile and team management operations.

### Token Types:
- **Admin Token**: Can access all builder endpoints with full permissions
- **Builder Token**: Can access builder-specific endpoints (profile, team members, status management)

---

## 1. Authentication Endpoints

### Login Builder
**POST** `/v1/builders/login`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "builder": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Builder Name",
    "email": "builder@example.com",
    "company": "ABC Construction",
    "city": "Mumbai",
    "status": "approved",
    "isActive": true,
    "lastLoginAt": "2023-07-20T10:30:00.000Z",
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:30:00.000Z"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-07-20T11:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-08-19T10:30:00.000Z"
    }
  }
}
```

#### Frontend Example
```javascript
const loginBuilder = async (email, password) => {
  try {
    const response = await fetch('/v1/builders/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      return data.builder;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### Register Builder (Direct)
**POST** `/v1/builders/register`

**No authentication required**

#### Request Body
```json
{
  "name": "Builder Name",
  "email": "builder@example.com",
  "password": "password123",
  "contactInfo": "+1234567890",
  "address": "123 Main St, City",
  "company": "ABC Construction",
  "city": "Mumbai",
  "reraRegistrationId": "RERA123456",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "website": "https://example.com",
  "logo": "base64string",
  "logoName": "logo.png",
  "supportingDocuments": ["doc1.pdf", "doc2.pdf"]
}
```

#### Response
```json
{
  "builder": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Builder Name",
    "email": "builder@example.com",
    "company": "ABC Construction",
    "status": "draft",
    "isActive": true,
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-07-20T11:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-08-19T10:30:00.000Z"
    }
  }
}
```

---

## 2. OTP-Based Registration Flow

### Register with OTP
**POST** `/v1/builders/register-with-otp`

**No authentication required**

#### Request Body
```json
{
  "name": "Builder Name",
  "email": "builder@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "builderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "builder@example.com"
}
```

### Verify Registration OTP
**POST** `/v1/builders/verify-registration-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "otp": "123456"
}
```

#### Response
```json
{
  "message": "OTP verified successfully. Please complete your profile.",
  "builderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "builder@example.com"
}
```

### Complete Registration with Profile
**POST** `/v1/builders/complete-registration`

**No authentication required**

#### Request Body
```json
{
  "builderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "contactInfo": "+1234567890",
  "address": "123 Main St, City",
  "company": "ABC Construction",
  "city": "Mumbai",
  "reraRegistrationId": "RERA123456",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "website": "https://example.com",
  "logo": "base64string",
  "logoName": "logo.png",
  "supportingDocuments": ["doc1.pdf", "doc2.pdf"]
}
```

#### Response
```json
{
  "builder": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Builder Name",
    "email": "builder@example.com",
    "company": "ABC Construction",
    "status": "draft",
    "isActive": true,
    "isOtpVerified": true,
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-07-20T11:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-08-19T10:30:00.000Z"
    }
  }
}
```

---

## 3. OTP-Based Login Flow

### Login with OTP
**POST** `/v1/builders/login-with-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "message": "OTP sent to your email. Please verify to complete login.",
  "builderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "builder@example.com"
}
```

### Complete Login with OTP
**POST** `/v1/builders/complete-login-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "otp": "123456"
}
```

#### Response
```json
{
  "builder": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Builder Name",
    "email": "builder@example.com",
    "company": "ABC Construction",
    "status": "approved",
    "isActive": true,
    "lastLoginAt": "2023-07-20T10:30:00.000Z",
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:30:00.000Z"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-07-20T11:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-08-19T10:30:00.000Z"
    }
  }
}
```

---

## 4. Password Reset Flow

### Send Forgot Password OTP
**POST** `/v1/builders/forgot-password`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com"
}
```

#### Response
```json
{
  "message": "OTP sent to your email for password reset.",
  "email": "builder@example.com"
}
```

### Verify Forgot Password OTP
**POST** `/v1/builders/verify-forgot-password-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "otp": "123456"
}
```

#### Response
```json
{
  "message": "OTP verified successfully. You can now reset your password.",
  "email": "builder@example.com",
  "resetToken": "verified"
}
```

### Reset Password with OTP
**POST** `/v1/builders/reset-password`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

#### Response
```json
{
  "message": "Password reset successfully"
}
```

---

## 5. Builder Management Endpoints (Admin Only)

### Create Builder
**POST** `/v1/builders`

#### Request Body
```json
{
  "name": "Builder Name",
  "email": "builder@example.com",
  "password": "password123",
  "contactInfo": "+1234567890",
  "address": "123 Main St, City",
  "company": "ABC Construction",
  "city": "Mumbai",
  "reraRegistrationId": "RERA123456",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "website": "https://example.com",
  "logo": "base64string",
  "logoName": "logo.png",
  "supportingDocuments": ["doc1.pdf", "doc2.pdf"]
}
```

### Get All Builders
**GET** `/v1/builders`

#### Query Parameters
- `name` (string): Filter by builder name
- `email` (string): Filter by email
- `company` (string): Filter by company name
- `city` (string): Filter by city
- `status` (string): Filter by status ('draft', 'submitted', 'approved', 'rejected')
- `isActive` (boolean): Filter by active status
- `sortBy` (string): Sort field (e.g., 'name:asc', 'createdAt:desc')
- `limit` (number): Results per page (default: 10, max: 100)
- `page` (number): Page number (default: 1)

#### Example Request
```
GET /v1/builders?status=approved&isActive=true&limit=20&page=1&sortBy=name:asc
```

#### Response
```json
{
  "results": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Builder Name",
      "email": "builder@example.com",
      "company": "ABC Construction",
      "city": "Mumbai",
      "status": "approved",
      "isActive": true,
      "lastLoginAt": "2023-07-20T10:30:00.000Z",
      "createdAt": "2023-07-20T10:00:00.000Z",
      "updatedAt": "2023-07-20T10:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "totalResults": 1
}
```

### Get Single Builder
**GET** `/v1/builders/:builderId`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "email": "builder@example.com",
  "contactInfo": "+1234567890",
  "address": "123 Main St, City",
  "company": "ABC Construction",
  "city": "Mumbai",
  "reraRegistrationId": "RERA123456",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "website": "https://example.com",
  "logo": "base64string",
  "logoName": "logo.png",
  "supportingDocuments": ["doc1.pdf", "doc2.pdf"],
  "status": "approved",
  "isActive": true,
  "lastLoginAt": "2023-07-20T10:30:00.000Z",
  "createdAt": "2023-07-20T10:00:00.000Z",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Update Builder
**PATCH** `/v1/builders/:builderId`

#### Request Body (all fields optional)
```json
{
  "name": "Updated Builder Name",
  "email": "updated@example.com",
  "contactInfo": "+9876543210",
  "address": "456 New St, City",
  "company": "XYZ Construction",
  "city": "Delhi",
  "reraRegistrationId": "RERA789012",
  "contactPerson": "Jane Doe",
  "phone": "+9876543210",
  "website": "https://updated.com",
  "logo": "newbase64string",
  "logoName": "newlogo.png",
  "supportingDocuments": ["newdoc1.pdf", "newdoc2.pdf"],
  "status": "approved",
  "isActive": true
}
```

### Delete Builder
**DELETE** `/v1/builders/:builderId`

#### Response
```
Status: 204 No Content
```

---

## 6. Profile Management

### Get Current Builder Profile
**GET** `/v1/builders/profile`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "email": "builder@example.com",
  "contactInfo": "+1234567890",
  "address": "123 Main St, City",
  "company": "ABC Construction",
  "city": "Mumbai",
  "reraRegistrationId": "RERA123456",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "website": "https://example.com",
  "logo": "base64string",
  "logoName": "logo.png",
  "supportingDocuments": ["doc1.pdf", "doc2.pdf"],
  "status": "approved",
  "isActive": true,
  "lastLoginAt": "2023-07-20T10:30:00.000Z",
  "createdAt": "2023-07-20T10:00:00.000Z",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Update Profile
**PATCH** `/v1/builders/profile`

#### Request Body
```json
{
  "name": "Updated Name",
  "contactInfo": "+9876543210",
  "address": "456 New St, City",
  "company": "XYZ Construction",
  "city": "Delhi",
  "reraRegistrationId": "RERA789012",
  "contactPerson": "Jane Doe",
  "phone": "+9876543210",
  "website": "https://updated.com",
  "logo": "newbase64string",
  "logoName": "newlogo.png",
  "supportingDocuments": ["newdoc1.pdf", "newdoc2.pdf"]
}
```

### Change Password
**POST** `/v1/builders/change-password`

#### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Response
```json
{
  "message": "Password changed successfully"
}
```

---

## 7. Builder Status Management

### Submit for Review
**POST** `/v1/builders/submit-for-review`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "status": "submitted",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Reset to Draft
**POST** `/v1/builders/reset-to-draft`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "status": "draft",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

---

## 8. Admin Operations

### Approve Builder
**PATCH** `/v1/builders/:builderId/approve`

#### Request Body
```json
{
  "notes": "Approved after review"
}
```

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "status": "approved",
  "adminDecision": {
    "status": "approved",
    "notes": "Approved after review",
    "reviewedBy": "60f7b3b3b3b3b3b3b3b3b3b4",
    "reviewedAt": "2023-07-20T10:30:00.000Z"
  },
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Reject Builder
**PATCH** `/v1/builders/:builderId/reject`

#### Request Body
```json
{
  "notes": "Incomplete documentation"
}
```

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "status": "rejected",
  "adminDecision": {
    "status": "rejected",
    "notes": "Incomplete documentation",
    "reviewedBy": "60f7b3b3b3b3b3b3b3b3b3b4",
    "reviewedAt": "2023-07-20T10:30:00.000Z"
  },
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Activate Builder
**PATCH** `/v1/builders/:builderId/activate`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "isActive": true,
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Deactivate Builder
**PATCH** `/v1/builders/:builderId/deactivate`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "isActive": false,
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Get Builder Statistics
**GET** `/v1/builders/stats`

#### Response
```json
{
  "totalBuilders": 50,
  "activeBuilders": 45,
  "approvedBuilders": 40,
  "pendingBuilders": 5,
  "draftBuilders": 3,
  "rejectedBuilders": 2
}
```

---

## 9. Team Member Management

### Add Team Member
**POST** `/v1/builders/team-members`

#### Request Body
```json
{
  "name": "Team Member Name",
  "email": "member@example.com",
  "password": "password123",
  "role": "team_member",
  "navigationPermissions": {
    "dashboard": true,
    "myProperties": true,
    "analytics": false,
    "messages": true,
    "myProfile": true,
    "users": false
  }
}
```

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "teamMembers": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Team Member Name",
      "email": "member@example.com",
      "role": "team_member",
      "navigationPermissions": {
        "dashboard": true,
        "myProperties": true,
        "analytics": false,
        "messages": true,
        "myProfile": true,
        "users": false
      },
      "isActive": true,
      "createdAt": "2023-07-20T10:00:00.000Z"
    }
  ],
  "updatedAt": "2023-07-20T10:00:00.000Z"
}
```

### Get Team Members
**GET** `/v1/builders/team-members`

#### Response
```json
{
  "teamMembers": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Team Member Name",
      "email": "member@example.com",
      "role": "team_member",
      "navigationPermissions": {
        "dashboard": true,
        "myProperties": true,
        "analytics": false,
        "messages": true,
        "myProfile": true,
        "users": false
      },
      "isActive": true,
      "lastLoginAt": "2023-07-20T10:30:00.000Z",
      "createdAt": "2023-07-20T10:00:00.000Z"
    }
  ]
}
```

### Get Team Member
**GET** `/v1/builders/team-members/:memberId`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b5",
  "name": "Team Member Name",
  "email": "member@example.com",
  "role": "team_member",
  "navigationPermissions": {
    "dashboard": true,
    "myProperties": true,
    "analytics": false,
    "messages": true,
    "myProfile": true,
    "users": false
  },
  "isActive": true,
  "lastLoginAt": "2023-07-20T10:30:00.000Z",
  "createdAt": "2023-07-20T10:00:00.000Z"
}
```

### Update Team Member
**PATCH** `/v1/builders/team-members/:memberId`

#### Request Body
```json
{
  "name": "Updated Member Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "manager",
  "navigationPermissions": {
    "dashboard": true,
    "myProperties": true,
    "analytics": true,
    "messages": true,
    "myProfile": true,
    "users": true
  },
  "isActive": true
}
```

### Remove Team Member
**DELETE** `/v1/builders/team-members/:memberId`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Builder Name",
  "teamMembers": [],
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Team Member Login
**POST** `/v1/builders/team-members/login`

**No authentication required**

#### Request Body
```json
{
  "email": "member@example.com",
  "password": "password123",
  "builderId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### Response
```json
{
  "teamMember": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "name": "Team Member Name",
    "email": "member@example.com",
    "role": "team_member",
    "navigationPermissions": {
      "dashboard": true,
      "myProperties": true,
      "analytics": false,
      "messages": true,
      "myProfile": true,
      "users": false
    },
    "isActive": true,
    "lastLoginAt": "2023-07-20T10:30:00.000Z"
  },
  "builder": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Builder Name",
    "company": "ABC Construction"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-07-20T11:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires": "2023-08-19T10:30:00.000Z"
    }
  }
}
```

---

## 10. OTP Operations

### Send OTP
**POST** `/v1/builders/send-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "type": "email_verification"
}
```

#### Response
```json
{
  "message": "OTP sent successfully"
}
```

### Verify OTP
**POST** `/v1/builders/verify-otp`

**No authentication required**

#### Request Body
```json
{
  "email": "builder@example.com",
  "otp": "123456",
  "type": "email_verification"
}
```

#### Response
```json
{
  "message": "OTP verified successfully",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Email already taken"
}
```

### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Incorrect email or password"
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Builder not found"
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

## Frontend Integration Examples

### Complete Builder Service Class
```javascript
class BuilderService {
  constructor(baseURL = '/v1/builders') {
    this.baseURL = baseURL;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    };
  }

  // Authentication methods
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  }

  async register(builderData) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(builderData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  }

  // OTP-based registration
  async registerWithOTP(builderData) {
    const response = await fetch(`${this.baseURL}/register-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(builderData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  }

  async verifyRegistrationOTP(email, otp) {
    const response = await fetch(`${this.baseURL}/verify-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!response.ok) throw new Error('OTP verification failed');
    return await response.json();
  }

  async completeRegistration(builderId, profileData) {
    const response = await fetch(`${this.baseURL}/complete-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ builderId, ...profileData })
    });
    
    if (!response.ok) throw new Error('Profile completion failed');
    return await response.json();
  }

  // OTP-based login
  async loginWithOTP(email, password) {
    const response = await fetch(`${this.baseURL}/login-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  }

  async completeLoginWithOTP(email, otp) {
    const response = await fetch(`${this.baseURL}/complete-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!response.ok) throw new Error('OTP verification failed');
    return await response.json();
  }

  // Password reset
  async sendForgotPasswordOTP(email) {
    const response = await fetch(`${this.baseURL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) throw new Error('Failed to send OTP');
    return await response.json();
  }

  async verifyForgotPasswordOTP(email, otp) {
    const response = await fetch(`${this.baseURL}/verify-forgot-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!response.ok) throw new Error('OTP verification failed');
    return await response.json();
  }

  async resetPassword(email, otp, newPassword) {
    const response = await fetch(`${this.baseURL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    
    if (!response.ok) throw new Error('Password reset failed');
    return await response.json();
  }

  // Profile management
  async getProfile() {
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  }

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${this.baseURL}/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) throw new Error('Failed to change password');
    return await response.json();
  }

  // Status management
  async submitForReview() {
    const response = await fetch(`${this.baseURL}/submit-for-review`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to submit for review');
    return await response.json();
  }

  async resetToDraft() {
    const response = await fetch(`${this.baseURL}/reset-to-draft`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to reset to draft');
    return await response.json();
  }

  // Team member management
  async addTeamMember(memberData) {
    const response = await fetch(`${this.baseURL}/team-members`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    
    if (!response.ok) throw new Error('Failed to add team member');
    return await response.json();
  }

  async getTeamMembers() {
    const response = await fetch(`${this.baseURL}/team-members`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch team members');
    return await response.json();
  }

  async updateTeamMember(memberId, updateData) {
    const response = await fetch(`${this.baseURL}/team-members/${memberId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) throw new Error('Failed to update team member');
    return await response.json();
  }

  async removeTeamMember(memberId) {
    const response = await fetch(`${this.baseURL}/team-members/${memberId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to remove team member');
    return await response.json();
  }

  async teamMemberLogin(email, password, builderId) {
    const response = await fetch(`${this.baseURL}/team-members/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, builderId })
    });
    
    if (!response.ok) throw new Error('Team member login failed');
    return await response.json();
  }

  // Admin operations
  async getBuilders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch builders');
    return await response.json();
  }

  async createBuilder(builderData) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(builderData)
    });
    
    if (!response.ok) throw new Error('Failed to create builder');
    return await response.json();
  }

  async updateBuilder(builderId, updateData) {
    const response = await fetch(`${this.baseURL}/${builderId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) throw new Error('Failed to update builder');
    return await response.json();
  }

  async deleteBuilder(builderId) {
    const response = await fetch(`${this.baseURL}/${builderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete builder');
  }

  async approveBuilder(builderId, notes = '') {
    const response = await fetch(`${this.baseURL}/${builderId}/approve`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    
    if (!response.ok) throw new Error('Failed to approve builder');
    return await response.json();
  }

  async rejectBuilder(builderId, notes) {
    const response = await fetch(`${this.baseURL}/${builderId}/reject`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    
    if (!response.ok) throw new Error('Failed to reject builder');
    return await response.json();
  }

  async activateBuilder(builderId) {
    const response = await fetch(`${this.baseURL}/${builderId}/activate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to activate builder');
    return await response.json();
  }

  async deactivateBuilder(builderId) {
    const response = await fetch(`${this.baseURL}/${builderId}/deactivate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to deactivate builder');
    return await response.json();
  }

  async getBuilderStats() {
    const response = await fetch(`${this.baseURL}/stats`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  }

  // OTP operations
  async sendOTP(email, type) {
    const response = await fetch(`${this.baseURL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    
    if (!response.ok) throw new Error('Failed to send OTP');
    return await response.json();
  }

  async verifyOTP(email, otp, type) {
    const response = await fetch(`${this.baseURL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, type })
    });
    
    if (!response.ok) throw new Error('Failed to verify OTP');
    return await response.json();
  }
}

// Usage example
const builderService = new BuilderService();

// Registration flow
const registerData = await builderService.registerWithOTP({
  name: 'Builder Name',
  email: 'builder@example.com',
  password: 'password123'
});

const verifyData = await builderService.verifyRegistrationOTP('builder@example.com', '123456');

const completeData = await builderService.completeRegistration(verifyData.builderId, {
  contactInfo: '+1234567890',
  address: '123 Main St, City',
  company: 'ABC Construction',
  city: 'Mumbai',
  reraRegistrationId: 'RERA123456',
  contactPerson: 'John Doe',
  phone: '+1234567890'
});

// Login flow
const loginData = await builderService.loginWithOTP('builder@example.com', 'password123');
const completeLogin = await builderService.completeLoginWithOTP('builder@example.com', '123456');

// Profile management
const profile = await builderService.getProfile();
const updatedProfile = await builderService.updateProfile({
  name: 'Updated Builder Name',
  company: 'Updated Company'
});

// Team member management
const teamMember = await builderService.addTeamMember({
  name: 'Team Member',
  email: 'member@example.com',
  password: 'password123',
  role: 'team_member',
  navigationPermissions: {
    dashboard: true,
    myProperties: true,
    analytics: false,
    messages: true,
    myProfile: true,
    users: false
  }
});
```

---

## Notes

1. **Authentication**: Most endpoints require a valid JWT token in the Authorization header
2. **Password Requirements**: Passwords must be at least 8 characters and contain at least one letter and one number
3. **Phone Number Format**: Phone numbers must follow international format (+1234567890)
4. **Builder Status Flow**: draft → submitted → approved/rejected → draft (if rejected)
5. **OTP Expiry**: OTPs typically expire after 10 minutes
6. **File Uploads**: Logo and supporting documents should be base64 encoded strings
7. **Team Member Roles**: 'team_member', 'admin', 'manager'
8. **Navigation Permissions**: Control access to different sections of the builder dashboard
9. **Error Handling**: Always check response status and handle errors appropriately
10. **Token Management**: Store tokens securely and implement refresh token logic

This guide provides everything needed to integrate the Builder API with your frontend application. All endpoints are RESTful and follow standard HTTP conventions.
