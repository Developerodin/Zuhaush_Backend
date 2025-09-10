# New User Flow API Documentation

## Overview
This document describes the new user authentication flow that matches your requirements:
1. **Login Flow**: User enters email + password → gets OTP → verifies OTP → logged in
2. **Registration Flow**: User enters email + password → gets OTP → verifies OTP → fills profile details → registration complete

## Base URL
```
http://localhost:3000/api/v1
```

## New Authentication Flow

### 1. Login Flow

#### Step 1: Login with Email and Password
```http
POST /auth/login-with-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email. Please verify to complete login.",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "john@example.com"
}
```

#### Step 2: Complete Login with OTP
```http
POST /auth/complete-login-otp
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
    "accountType": "registered",
    "contactNumber": "+919876543210",
    "city": "Mumbai",
    "lastLoginAt": "2023-12-21T10:30:00.000Z"
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

### 2. Registration Flow

#### Step 1: Register with Email and Password
```http
POST /auth/register-with-otp
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "email": "jane@example.com"
}
```

#### Step 2: Verify OTP
```http
POST /auth/verify-registration-otp
Content-Type: application/json

{
  "email": "jane@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully. Please complete your profile.",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "email": "jane@example.com"
}
```

#### Step 3: Complete Registration with Profile Details
```http
POST /auth/complete-registration-profile
Content-Type: application/json

{
  "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "name": "Jane Doe",
  "contactNumber": "+919876543211",
  "city": "Delhi"
}
```

**Response:**
```json
{
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "isEmailVerified": true,
    "accountType": "registered",
    "contactNumber": "+919876543211",
    "city": "Delhi",
    "lastLoginAt": "2023-12-21T10:30:00.000Z"
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

## Frontend Integration Flow

### Login Screen Implementation
```javascript
// Login Screen - Step 1
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('/api/v1/auth/login-with-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Navigate to OTP verification screen
      // Store userId and email for next step
      navigateToOTPScreen(data.userId, data.email);
    }
  } catch (error) {
    // Handle error
  }
};

// OTP Verification Screen - Step 2
const handleOTPVerification = async (email, otp) => {
  try {
    const response = await fetch('/api/v1/auth/complete-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store tokens and user data
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate to main app
      navigateToMainApp();
    }
  } catch (error) {
    // Handle error
  }
};
```

### Registration Screen Implementation
```javascript
// Registration Screen - Step 1
const handleRegistration = async (email, password) => {
  try {
    const response = await fetch('/api/v1/auth/register-with-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Navigate to OTP verification screen
      // Store userId and email for next step
      navigateToOTPScreen(data.userId, data.email);
    }
  } catch (error) {
    // Handle error
  }
};

// OTP Verification Screen - Step 2
const handleOTPVerification = async (email, otp) => {
  try {
    const response = await fetch('/api/v1/auth/verify-registration-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Navigate to profile completion screen
      // Store userId for next step
      navigateToProfileScreen(data.userId);
    }
  } catch (error) {
    // Handle error
  }
};

// Profile Completion Screen - Step 3
const handleProfileCompletion = async (userId, profileData) => {
  try {
    const response = await fetch('/api/v1/auth/complete-registration-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...profileData })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store tokens and user data
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate to main app
      navigateToMainApp();
    }
  } catch (error) {
    // Handle error
  }
};
```

## Error Handling

### Common Error Responses

#### Invalid Credentials (Login Step 1)
```json
{
  "statusCode": 401,
  "message": "Incorrect email or password",
  "error": "Unauthorized"
}
```

#### Email Already Exists (Registration Step 1)
```json
{
  "statusCode": 400,
  "message": "Email already taken",
  "error": "Bad Request"
}
```

#### Invalid OTP (Step 2)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired OTP",
  "error": "Unauthorized"
}
```

#### OTP Expired
```json
{
  "statusCode": 401,
  "message": "OTP has expired",
  "error": "Unauthorized"
}
```

#### Too Many Attempts
```json
{
  "statusCode": 429,
  "message": "Too many OTP verification attempts. Please try again later.",
  "error": "Too Many Requests"
}
```

## Security Features

### Rate Limiting
- **OTP Requests**: 5 per hour per email
- **Login Attempts**: 5 per 15 minutes per IP
- **Registration**: 3 per hour per IP

### OTP Security
- **Expiration**: 10 minutes
- **Format**: 6-digit numeric
- **Max Attempts**: 3 per OTP
- **Single Use**: OTP is deleted after successful verification

### Password Security
- **Minimum Length**: 8 characters
- **Requirements**: At least one letter and one number
- **Hashing**: Bcrypt with salt rounds: 8

## Complete User Journey

### Login Journey
1. **Login Screen**: User enters email and password
2. **API Call**: `POST /auth/login-with-otp`
3. **OTP Screen**: User receives OTP via email and enters it
4. **API Call**: `POST /auth/complete-login-otp`
5. **Success**: User is logged in with full access

### Registration Journey
1. **Registration Screen**: User enters email and password
2. **API Call**: `POST /auth/register-with-otp`
3. **OTP Screen**: User receives OTP via email and enters it
4. **API Call**: `POST /auth/verify-registration-otp`
5. **Profile Screen**: User fills profile details (name, phone, city)
6. **API Call**: `POST /auth/complete-registration-profile`
7. **Success**: User is registered and logged in

## Testing the Flow

### Test Login Flow
```bash
# Step 1: Login with credentials
curl -X POST http://localhost:3000/api/v1/auth/login-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Step 2: Complete login with OTP (use OTP from email)
curl -X POST http://localhost:3000/api/v1/auth/complete-login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### Test Registration Flow
```bash
# Step 1: Register with email and password
curl -X POST http://localhost:3000/api/v1/auth/register-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123"}'

# Step 2: Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/verify-registration-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "otp": "123456"}'

# Step 3: Complete registration with profile details
curl -X POST http://localhost:3000/api/v1/auth/complete-registration-profile \
  -H "Content-Type: application/json" \
  -d '{"userId": "60f7b3b3b3b3b3b3b3b3b3b4", "name": "New User", "contactNumber": "+919876543210", "city": "Mumbai"}'
```

This new flow provides a secure and user-friendly authentication experience that matches your Figma screens and requirements!
