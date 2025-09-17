# Frontend Flexible Authentication Guide

This guide explains how to make frontend requests to the Zuhaush Backend API using flexible authentication that supports Admin, Builder, and User roles.

## Table of Contents
- [Overview](#overview)
- [Authentication Types](#authentication-types)
- [Base Configuration](#base-configuration)
- [Authentication Flows](#authentication-flows)
- [Making Authenticated Requests](#making-authenticated-requests)
- [Role-Based Access Examples](#role-based-access-examples)
- [Error Handling](#error-handling)
- [Token Management](#token-management)
- [Complete Examples](#complete-examples)

## Overview

The Zuhaush Backend uses a flexible authentication system that allows different user types (Admin, Builder, User) to access the same endpoints with appropriate permissions. The `flexibleAuth` middleware automatically handles authentication for all three user types.

### Supported User Types
- **Admin**: Full access to all endpoints including admin-specific operations
- **Builder**: Access to builder-related operations (property management, etc.)
- **User**: Access to user-related operations (viewing properties, profile management, etc.)

## Authentication Types

### 1. Admin Authentication
- **Strategy**: `admin-jwt`
- **Token Type**: JWT with admin role
- **Access Level**: Full system access

### 2. Builder Authentication
- **Strategy**: `jwt` (regular JWT)
- **Token Type**: JWT with builder role
- **Access Level**: Builder-specific operations

### 3. User Authentication
- **Strategy**: `jwt` (regular JWT)
- **Token Type**: JWT with user role
- **Access Level**: User-specific operations

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

## Authentication Flows

### 1. Admin Login Flow

```javascript
// Step 1: Admin Login
const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('adminAccessToken', data.tokens.access.token);
      localStorage.setItem('adminRefreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return data;
    } else {
      throw new Error(data.message || 'Admin login failed');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};
```

### 2. Builder Login Flow

```javascript
// Step 1: Builder Login
const builderLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/builder/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      localStorage.setItem('userType', 'builder');
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return data;
    } else {
      throw new Error(data.message || 'Builder login failed');
    }
  } catch (error) {
    console.error('Builder login error:', error);
    throw error;
  }
};
```

### 3. User Login Flow

```javascript
// Step 1: User Login
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
      
      return data;
    } else {
      throw new Error(data.message || 'User login failed');
    }
  } catch (error) {
    console.error('User login error:', error);
    throw error;
  }
};
```

### 4. User Registration Flow

```javascript
// Step 1: Register with OTP
const registerWithOTP = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-with-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return data; // Contains userId and email
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Step 2: Verify OTP
const verifyRegistrationOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

// Step 3: Complete Registration
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
      
      return data;
    } else {
      throw new Error(data.message || 'Profile completion failed');
    }
  } catch (error) {
    console.error('Profile completion error:', error);
    throw error;
  }
};
```

## Making Authenticated Requests

### Generic Request Function

```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const userType = localStorage.getItem('userType');
  let accessToken;

  // Get appropriate token based on user type
  if (userType === 'admin') {
    accessToken = localStorage.getItem('adminAccessToken');
  } else {
    accessToken = localStorage.getItem('accessToken');
  }

  if (!accessToken) {
    throw new Error('No access token found. Please login first.');
  }

  const headers = {
    ...defaultHeaders,
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token refresh if needed
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the request with new token
        headers.Authorization = `Bearer ${localStorage.getItem(userType === 'admin' ? 'adminAccessToken' : 'accessToken')}`;
        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};
```

### Token Refresh Function

```javascript
const refreshToken = async () => {
  const userType = localStorage.getItem('userType');
  const refreshToken = localStorage.getItem(userType === 'admin' ? 'adminRefreshToken' : 'refreshToken');

  if (!refreshToken) {
    // Redirect to login
    window.location.href = '/login';
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-tokens`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      // Update stored tokens
      if (userType === 'admin') {
        localStorage.setItem('adminAccessToken', data.access.token);
        localStorage.setItem('adminRefreshToken', data.refresh.token);
      } else {
        localStorage.setItem('accessToken', data.access.token);
        localStorage.setItem('refreshToken', data.refresh.token);
      }
      return true;
    } else {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.clear();
    window.location.href = '/login';
    return false;
  }
};
```

## Role-Based Access Examples

### 1. Property Management (All Roles)

```javascript
// Get all properties (public endpoint)
const getProperties = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/properties?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// Get property by ID (public endpoint)
const getProperty = async (propertyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

// Search properties (public endpoint)
const searchProperties = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams(searchParams);
    const response = await fetch(`${API_BASE_URL}/properties/search?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};
```

### 2. Builder-Specific Operations

```javascript
// Create property (Builder only)
const createProperty = async (propertyData) => {
  try {
    const response = await makeAuthenticatedRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Update property (Builder only)
const updateProperty = async (propertyId, updateData) => {
  try {
    const response = await makeAuthenticatedRequest(`/properties/${propertyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// Delete property (Builder only)
const deleteProperty = async (propertyId) => {
  try {
    const response = await makeAuthenticatedRequest(`/properties/${propertyId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Get builder's properties
const getBuilderProperties = async (builderId) => {
  try {
    const response = await makeAuthenticatedRequest(`/properties/builder/${builderId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching builder properties:', error);
    throw error;
  }
};

// Upload property media
const uploadPropertyMedia = async (propertyId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await makeAuthenticatedRequest(`/properties/${propertyId}/media`, {
      method: 'POST',
      headers: {}, // Remove Content-Type header for FormData
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};
```

### 3. Admin-Specific Operations

```javascript
// Approve property (Admin only)
const approveProperty = async (propertyId) => {
  try {
    const response = await makeAuthenticatedRequest(`/properties/${propertyId}/approve`, {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error approving property:', error);
    throw error;
  }
};

// Reject property (Admin only)
const rejectProperty = async (propertyId) => {
  try {
    const response = await makeAuthenticatedRequest(`/properties/${propertyId}/reject`, {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rejecting property:', error);
    throw error;
  }
};

// Get all users (Admin only)
const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await makeAuthenticatedRequest(`/users?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get all builders (Admin only)
const getAllBuilders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await makeAuthenticatedRequest(`/builders?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching builders:', error);
    throw error;
  }
};
```

### 4. User-Specific Operations

```javascript
// Get user profile
const getUserProfile = async () => {
  try {
    const response = await makeAuthenticatedRequest('/users/profile');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (profileData) => {
  try {
    const response = await makeAuthenticatedRequest('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user preferences
const updateUserPreferences = async (preferences) => {
  try {
    const response = await makeAuthenticatedRequest('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Change password
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await makeAuthenticatedRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
```

## Error Handling

### Common Error Responses

```javascript
const handleApiError = (error, response) => {
  if (response) {
    switch (response.status) {
      case 401:
        // Unauthorized - token expired or invalid
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden - insufficient permissions
        console.error('Access denied. Insufficient permissions.');
        break;
      case 404:
        // Not found
        console.error('Resource not found.');
        break;
      case 422:
        // Validation error
        console.error('Validation error:', error.message);
        break;
      case 500:
        // Server error
        console.error('Server error. Please try again later.');
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

## Token Management

### Token Storage Helper

```javascript
const TokenManager = {
  // Store tokens
  setTokens: (tokens, userType = 'user') => {
    if (userType === 'admin') {
      localStorage.setItem('adminAccessToken', tokens.access.token);
      localStorage.setItem('adminRefreshToken', tokens.refresh.token);
    } else {
      localStorage.setItem('accessToken', tokens.access.token);
      localStorage.setItem('refreshToken', tokens.refresh.token);
    }
  },

  // Get access token
  getAccessToken: (userType = 'user') => {
    return userType === 'admin' 
      ? localStorage.getItem('adminAccessToken')
      : localStorage.getItem('accessToken');
  },

  // Get refresh token
  getRefreshToken: (userType = 'user') => {
    return userType === 'admin'
      ? localStorage.getItem('adminRefreshToken')
      : localStorage.getItem('refreshToken');
  },

  // Clear all tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const userType = localStorage.getItem('userType');
    const token = userType === 'admin' 
      ? localStorage.getItem('adminAccessToken')
      : localStorage.getItem('accessToken');
    return !!token;
  },

  // Get current user data
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};
```

## Complete Examples

### React Hook Example

```javascript
import { useState, useEffect, useCallback } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = TokenManager.getCurrentUser();
      const storedUserType = localStorage.getItem('userType');
      
      if (storedUser && storedUserType) {
        setUser(storedUser);
        setUserType(storedUserType);
      }
      setLoading(false);
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
        case 'builder':
          response = await builderLogin(email, password);
          break;
        default:
          response = await userLogin(email, password);
      }

      TokenManager.setTokens(response.tokens, type);
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
    TokenManager.clearTokens();
    setUser(null);
    setUserType(null);
  }, []);

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    return makeAuthenticatedRequest(endpoint, options);
  }, []);

  return {
    user,
    userType,
    loading,
    login,
    logout,
    makeRequest,
    isAuthenticated: TokenManager.isAuthenticated()
  };
};

export default useAuth;
```

### Vue.js Composable Example

```javascript
import { ref, computed, onMounted } from 'vue';

export const useAuth = () => {
  const user = ref(null);
  const userType = ref(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value);

  const initializeAuth = () => {
    const storedUser = TokenManager.getCurrentUser();
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser && storedUserType) {
      user.value = storedUser;
      userType.value = storedUserType;
    }
    loading.value = false;
  };

  const login = async (email, password, type = 'user') => {
    try {
      loading.value = true;
      let response;
      
      switch (type) {
        case 'admin':
          response = await adminLogin(email, password);
          break;
        case 'builder':
          response = await builderLogin(email, password);
          break;
        default:
          response = await userLogin(email, password);
      }

      TokenManager.setTokens(response.tokens, type);
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
    TokenManager.clearTokens();
    user.value = null;
    userType.value = null;
  };

  const makeRequest = async (endpoint, options = {}) => {
    return makeAuthenticatedRequest(endpoint, options);
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
    makeRequest
  };
};
```

## Best Practices

1. **Always check authentication status** before making requests
2. **Handle token refresh** automatically
3. **Store tokens securely** (consider using httpOnly cookies for production)
4. **Implement proper error handling** for all API calls
5. **Use appropriate user type** for different operations
6. **Clear tokens on logout** and handle expired tokens
7. **Validate user permissions** on the frontend before making requests
8. **Implement loading states** for better UX

## Security Notes

- Never store sensitive data in localStorage in production
- Always validate tokens on the backend
- Implement proper CORS policies
- Use HTTPS in production
- Consider implementing token rotation for enhanced security

This guide provides a comprehensive foundation for implementing flexible authentication in your frontend application with the Zuhaush Backend API.
