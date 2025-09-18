# User API Frontend Guide

This guide explains how to make frontend requests to the User API endpoints using flexible authentication that supports Admin, Builder, and User roles.

## Table of Contents
- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication Flows](#authentication-flows)
- [User Management Endpoints](#user-management-endpoints)
- [Profile Management](#profile-management)
- [OTP Operations](#otp-operations)
- [Admin Operations](#admin-operations)
- [Error Handling](#error-handling)
- [Complete Examples](#complete-examples)

## Overview

The User API provides comprehensive user management functionality with flexible authentication. The `flexibleAuth` middleware automatically handles authentication for Admin, Builder, and User roles.

### Supported Operations
- **User Registration & Authentication**: OTP-based registration and login flows
- **Profile Management**: Update user profiles and preferences
- **Password Management**: Change passwords and reset with OTP
- **Admin Operations**: Full user management (create, read, update, delete, activate/deactivate)
- **Statistics**: User analytics and reporting

## Base Configuration

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/v1';
```

### Default Headers
```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
```

### Authentication Helper
```javascript
const getAuthHeaders = (userType = 'user') => {
  const token = userType === 'admin' 
    ? localStorage.getItem('adminAccessToken')
    : localStorage.getItem('accessToken');
  
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`,
  };
};
```

## Authentication Flows

### 1. User Registration Flow

#### Step 1: Register with OTP
```javascript
const registerWithOTP = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-with-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message,
        userId: data.userId,
        email: data.email
      };
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
```

#### Step 2: Verify Registration OTP
```javascript
const verifyRegistrationOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message,
        userId: data.userId,
        email: data.email
      };
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};
```

#### Step 3: Complete Registration
```javascript
const completeRegistration = async (userId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ userId, ...profileData }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens
      };
    } else {
      throw new Error(data.message || 'Profile completion failed');
    }
  } catch (error) {
    console.error('Profile completion error:', error);
    throw error;
  }
};
```

### 2. User Login Flow

#### Standard Login
```javascript
const userLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens
      };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

#### OTP-based Login
```javascript
// Step 1: Login with password and send OTP
const loginWithOTP = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login-with-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message,
        userId: data.userId,
        email: data.email
      };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Step 2: Complete login with OTP
const completeLoginWithOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/complete-login-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens
      };
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};
```

### 3. Admin Login Flow

```javascript
const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store admin tokens
      localStorage.setItem('adminAccessToken', data.tokens.access.token);
      localStorage.setItem('adminRefreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens
      };
    } else {
      throw new Error(data.message || 'Admin login failed');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};
```

## User Management Endpoints

### 1. Create User (Admin Only)

```javascript
const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'User creation failed');
    }
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Example usage
const newUser = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user',
  contactNumber: '+1234567890',
  cityofInterest: 'New York'
});
```

### 2. Get All Users (Admin Only)

```javascript
const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders('admin'),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        users: data.results,
        pagination: {
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      };
    } else {
      throw new Error(data.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

// Example usage with filters
const users = await getAllUsers({
  role: 'user',
  isActive: true,
  page: 1,
  limit: 10,
  sortBy: 'createdAt:desc'
});
```

### 3. Get User by ID (Admin Only)

```javascript
const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders('admin'),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'User not found');
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};
```

### 4. Update User (Admin Only)

```javascript
const updateUser = async (userId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'User update failed');
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Example usage
const updatedUser = await updateUser('userId123', {
  name: 'John Updated',
  contactNumber: '+1234567890',
  cityofInterest: 'Los Angeles'
});
```

### 5. Delete User (Admin Only)

```javascript
const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin'),
    });

    if (response.ok) {
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } else {
      const data = await response.json();
      throw new Error(data.message || 'User deletion failed');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};
```

## Profile Management

### 1. Get User Profile

```javascript
const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'Failed to fetch profile');
    }
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};
```

### 2. Update User Profile

```javascript
const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Update stored user data
      localStorage.setItem('userData', JSON.stringify(data));
      
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'Profile update failed');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Example usage
const updatedProfile = await updateUserProfile({
  name: 'John Doe',
  contactNumber: '+1234567890',
  cityofInterest: 'New York',
  image: 'https://example.com/profile.jpg'
});
```

### 3. Get User Preferences

```javascript
const getUserPreferences = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        preferences: data.preferences
      };
    } else {
      throw new Error(data.message || 'Failed to fetch preferences');
    }
  } catch (error) {
    console.error('Get preferences error:', error);
    throw error;
  }
};
```

### 4. Update User Preferences

```javascript
const updateUserPreferences = async (preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        preferences: data.preferences
      };
    } else {
      throw new Error(data.message || 'Preferences update failed');
    }
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

// Example usage
const updatedPreferences = await updateUserPreferences({
  propertyTypes: ['apartment', 'house'],
  budgetRange: {
    min: 100000,
    max: 500000
  },
  locations: ['New York', 'Los Angeles'],
  permissions: {
    newProperties: true,
    visitConfirmation: true,
    visitReminder: false,
    releaseMessages: true
  }
});
```

## Password Management

### 1. Change Password

```javascript
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'Password change failed');
    }
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};
```

### 2. Forgot Password Flow

```javascript
// Step 1: Send forgot password OTP
const sendForgotPasswordOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Send forgot password OTP error:', error);
    throw error;
  }
};

// Step 2: Verify forgot password OTP
const verifyForgotPasswordOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-forgot-password-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message,
        resetToken: data.resetToken
      };
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    throw error;
  }
};

// Step 3: Reset password with OTP
const resetPasswordWithOTP = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'Password reset failed');
    }
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};
```

## OTP Operations

### 1. Send OTP

```javascript
const sendOTP = async (email, type = 'email_verification') => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/send-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, type }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};
```

### 2. Verify OTP

```javascript
const verifyOTP = async (email, otp, type = 'email_verification') => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp, type }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};
```

## Admin Operations

### 1. Activate User (Admin Only)

```javascript
const activateUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
      method: 'PATCH',
      headers: getAuthHeaders('admin'),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'User activation failed');
    }
  } catch (error) {
    console.error('Activate user error:', error);
    throw error;
  }
};
```

### 2. Deactivate User (Admin Only)

```javascript
const deactivateUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: getAuthHeaders('admin'),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        user: data
      };
    } else {
      throw new Error(data.message || 'User deactivation failed');
    }
  } catch (error) {
    console.error('Deactivate user error:', error);
    throw error;
  }
};
```

### 3. Get User Statistics (Admin Only)

```javascript
const getUserStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: getAuthHeaders('admin'),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        stats: data
      };
    } else {
      throw new Error(data.message || 'Failed to fetch user statistics');
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

// Example response
// {
//   success: true,
//   stats: {
//     totalUsers: 150,
//     activeUsers: 140,
//     verifiedUsers: 135,
//     completedRegistrations: 130,
//     pendingRegistrations: 20
//   }
// }
```

## Error Handling

### Common Error Responses

```javascript
const handleApiError = (error, response) => {
  if (response) {
    switch (response.status) {
      case 400:
        console.error('Bad Request:', error.message);
        break;
      case 401:
        console.error('Unauthorized - Please login again');
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden - Insufficient permissions');
        break;
      case 404:
        console.error('Not Found - Resource not found');
        break;
      case 422:
        console.error('Validation Error:', error.message);
        break;
      case 500:
        console.error('Server Error - Please try again later');
        break;
      default:
        console.error('An error occurred:', error.message);
    }
  } else {
    console.error('Network error:', error.message);
  }
};
```

### Error Handling Wrapper

```javascript
const apiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    handleApiError(error, error.response);
    return { success: false, error: error.message };
  }
};
```

## Complete Examples

### React Hook Example

```javascript
import { useState, useEffect, useCallback } from 'react';

const useUserAPI = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = JSON.parse(localStorage.getItem('userData') || 'null');
      const storedUserType = localStorage.getItem('userType');
      
      if (storedUser && storedUserType) {
        setUser(storedUser);
        setUserType(storedUserType);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password, type = 'user') => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'admin':
          response = await adminLogin(email, password);
          break;
        default:
          response = await userLogin(email, password);
      }

      setUser(response.user);
      setUserType(type);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setUserType(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const result = await updateUserProfile(profileData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    userType,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };
};

export default useUserAPI;
```

### Vue.js Composable Example

```javascript
import { ref, computed, onMounted } from 'vue';

export const useUserAPI = () => {
  const user = ref(null);
  const loading = ref(false);
  const userType = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  const initializeAuth = () => {
    const storedUser = JSON.parse(localStorage.getItem('userData') || 'null');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser && storedUserType) {
      user.value = storedUser;
      userType.value = storedUserType;
    }
  };

  const login = async (email, password, type = 'user') => {
    try {
      loading.value = true;
      let response;
      
      switch (type) {
        case 'admin':
          response = await adminLogin(email, password);
          break;
        default:
          response = await userLogin(email, password);
      }

      user.value = response.user;
      userType.value = type;
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.clear();
    user.value = null;
    userType.value = null;
  };

  const updateProfile = async (profileData) => {
    try {
      loading.value = true;
      const result = await updateUserProfile(profileData);
      if (result.success) {
        user.value = result.user;
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    initializeAuth();
  });

  return {
    user,
    userType,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile
  };
};
```

## Best Practices

1. **Always check authentication status** before making requests
2. **Handle token refresh** automatically
3. **Store user data securely** and update it after profile changes
4. **Implement proper error handling** for all API calls
5. **Use appropriate user type** for different operations
6. **Clear tokens on logout** and handle expired tokens
7. **Validate user permissions** on the frontend before making requests
8. **Implement loading states** for better UX
9. **Use OTP flows** for enhanced security
10. **Handle registration completion** properly

## Security Notes

- Never store sensitive data in localStorage in production
- Always validate tokens on the backend
- Implement proper CORS policies
- Use HTTPS in production
- Consider implementing token rotation for enhanced security
- Use OTP verification for sensitive operations

This guide provides a comprehensive foundation for implementing user management in your frontend application with the Zuhaush Backend API using flexible authentication.
