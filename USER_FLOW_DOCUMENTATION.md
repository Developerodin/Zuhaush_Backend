# Real Estate User Flow Documentation

## Overview
This document outlines the user authentication and onboarding flow for the real estate application backend, based on the provided Figma screens and current Node.js/MongoDB/SMTP implementation.

## User Model Schema

### Current User Model (Enhanced for Real Estate)
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate: {
      validator: function(value) {
        return value.match(/\d/) && value.match(/[a-zA-Z]/);
      },
      message: 'Password must contain at least one letter and one number'
    },
    private: true
  },
  contactNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(value) {
        return !value || /^\+?[1-9]\d{1,14}$/.test(value);
      },
      message: 'Invalid phone number format'
    }
  },
  city: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guest'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  accountType: {
    type: String,
    enum: ['registered', 'guest'],
    default: 'registered'
  },
  preferences: {
    propertyTypes: [String],
    budgetRange: {
      min: Number,
      max: Number
    },
    locations: [String]
  },
  lastLoginAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

## Authentication Flow

### 1. Login/Signup Screen
**Screen**: "Login or Sign up"
**Purpose**: Initial authentication entry point

**Fields**:
- Email (required)
- Password (required)
- "Forgot Password?" link
- "Continue" button (primary action)
- "Continue as a guest" button (secondary action)

**API Endpoints**:
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/guest-login` - Guest access

**Flow**:
1. User enters email and password
2. System checks if email exists
3. If exists: Login flow
4. If not exists: Registration flow
5. Guest option bypasses authentication

### 2. OTP Verification Screens
**Screens**: "Enter OTP" (Login) and "Enter OTP" (Signup)
**Purpose**: Email verification using OTP

**Fields**:
- OTP input field (6 digits)
- "OTP has been sent to {email}" message
- "Edit" link to change email
- "Verify" or "Login"/"Sign up" button

**API Endpoints**:
- `POST /api/v1/auth/send-otp` - Send OTP to email
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/resend-otp` - Resend OTP

**Flow**:
1. System generates 6-digit OTP
2. OTP sent via SMTP to user's email
3. User enters OTP
4. System validates OTP
5. If valid: Proceed to next step
6. If invalid: Show error, allow retry

### 3. Forgot Password Screen
**Screen**: "Forgot Password?"
**Purpose**: Password reset initiation

**Fields**:
- Email input field
- "Send OTP" button

**API Endpoints**:
- `POST /api/v1/auth/forgot-password` - Send reset OTP
- `POST /api/v1/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/v1/auth/reset-password` - Reset password with OTP

**Flow**:
1. User enters registered email
2. System sends OTP to email
3. User verifies OTP
4. User sets new password

### 4. Password Reset Screen
**Screen**: "Enter OTP" + "Enter New Password"
**Purpose**: Complete password reset process

**Fields**:
- OTP input field
- New password field
- Re-enter password field
- "Update Password" button

**API Endpoints**:
- `POST /api/v1/auth/verify-reset-otp` - Verify OTP for password reset
- `POST /api/v1/auth/reset-password` - Update password

### 5. Personalization Screen
**Screen**: "Let's Personalize Your Experience"
**Purpose**: Collect user preferences for property recommendations

**Fields**:
- Name (required)
- Email Address (pre-filled, verified)
- Contact Number (with country code +91)
- City of Interest (dropdown/autocomplete)
- "Show Me Properties" button

**API Endpoints**:
- `POST /api/v1/users/profile` - Update user profile
- `GET /api/v1/cities` - Get available cities
- `POST /api/v1/users/preferences` - Save user preferences

## Enhanced Models for Real Estate

### OTP Model
```javascript
{
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'phone_verification'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}
```

### City Model
```javascript
{
  name: {
    type: String,
    required: true,
    unique: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

## API Endpoints Structure

### Authentication Routes
```
POST   /api/v1/auth/register           - User registration
POST   /api/v1/auth/login              - User login
POST   /api/v1/auth/guest-login        - Guest access
POST   /api/v1/auth/logout             - User logout
POST   /api/v1/auth/refresh-tokens     - Refresh access token

POST   /api/v1/auth/send-otp           - Send OTP to email
POST   /api/v1/auth/verify-otp         - Verify OTP
POST   /api/v1/auth/resend-otp         - Resend OTP

POST   /api/v1/auth/forgot-password    - Initiate password reset
POST   /api/v1/auth/verify-reset-otp   - Verify reset OTP
POST   /api/v1/auth/reset-password     - Reset password
```

### User Profile Routes
```
GET    /api/v1/users/profile           - Get user profile
PUT    /api/v1/users/profile           - Update user profile
POST   /api/v1/users/preferences       - Save user preferences
GET    /api/v1/users/preferences       - Get user preferences
```

### Utility Routes
```
GET    /api/v1/cities                  - Get available cities
GET    /api/v1/cities/search           - Search cities
```

## Email Templates

### OTP Email Template
```html
Subject: Your OTP for Zuhaush
Body:
Dear {name},

Your One-Time Password (OTP) is: {otp}

This OTP is valid for 10 minutes. Please do not share this OTP with anyone.

If you didn't request this OTP, please ignore this email.

Best regards,
Zuhaush Team
```

### Password Reset Email Template
```html
Subject: Password Reset - Zuhaush
Body:
Dear {name},

Your password reset OTP is: {otp}

This OTP is valid for 10 minutes. Please do not share this OTP with anyone.

If you didn't request a password reset, please ignore this email.

Best regards,
Zuhaush Team
```

## Security Considerations

### OTP Security
- OTP expires in 10 minutes
- Maximum 3 verification attempts
- Rate limiting: 5 OTP requests per hour per email
- OTP is 6-digit numeric only
- OTP is single-use (deleted after successful verification)

### Password Security
- Minimum 8 characters
- Must contain at least one letter and one number
- Bcrypt hashing with salt rounds: 8
- Password reset requires OTP verification

### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- OTP requests: 5 per hour per email
- Registration: 3 per hour per IP

## Database Indexes

```javascript
// User model indexes
{ email: 1 } // Unique index
{ contactNumber: 1 } // Sparse index
{ role: 1 }
{ isActive: 1 }
{ createdAt: -1 }

// OTP model indexes
{ email: 1, type: 1, expiresAt: 1 }
{ otp: 1, email: 1, type: 1 }
{ createdAt: 1 } // TTL index for cleanup

// City model indexes
{ name: 1 } // Unique index
{ state: 1 }
{ isActive: 1 }
```

## Error Handling

### Common Error Responses
```javascript
// Invalid OTP
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}

// OTP Expired
{
  "statusCode": 400,
  "message": "OTP has expired",
  "error": "Bad Request"
}

// Too Many Attempts
{
  "statusCode": 429,
  "message": "Too many OTP verification attempts",
  "error": "Too Many Requests"
}

// Rate Limited
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

## Implementation Notes

### Guest User Handling
- Guest users have limited access to features
- Guest users can browse properties but cannot save favorites
- Guest users cannot access personalized recommendations
- Guest users can convert to registered users anytime

### Email Verification Flow
- Email verification is required for full access
- Users can use the app with limited features before email verification
- Email verification OTP is sent during registration
- Users can resend verification email from profile settings

### Phone Verification (Future Enhancement)
- Phone verification will be optional initially
- Will use SMS OTP for verification
- Required for certain premium features

## Testing Strategy

### Unit Tests
- User model validation
- OTP generation and verification
- Password hashing and comparison
- Email service functionality

### Integration Tests
- Complete authentication flows
- OTP verification process
- Password reset flow
- Guest user flow

### API Tests
- All authentication endpoints
- Error handling scenarios
- Rate limiting verification
- Security validations

This documentation provides a comprehensive guide for implementing the user authentication and onboarding flow for the real estate application backend.
