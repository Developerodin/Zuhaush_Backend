# Admin API Frontend Integration Guide

This guide provides comprehensive documentation for integrating with the Admin API endpoints from your frontend application.

## Base URL
```
http://localhost:3002/v1/admins
```

## Authentication

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Note**: Admin tokens can also be used to access builder endpoints (`/v1/builders/*`) with full administrative permissions.

---

## 1. Authentication Endpoints

### Login Admin
**POST** `/v1/admins/login`

**No authentication required**

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "admin": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "admin@example.com",
    "name": "Admin User",
    "roleName": "admin",
    "navigationPermissions": {
      "dashboard": true,
      "builders": true,
      "users": true,
      "properties": true,
      "analytics": true,
      "messages": true,
      "appointments": true,
      "comments": true,
      "settings": true,
      "others": false
    },
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
const loginAdmin = async (email, password) => {
  try {
    const response = await fetch('/v1/admins/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store tokens in localStorage or secure storage
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      return data.admin;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

---

## 2. Admin Management Endpoints

### Create Admin
**POST** `/v1/admins`

#### Request Body
```json
{
  "email": "newadmin@example.com",
  "password": "password123",
  "name": "New Admin",
  "roleName": "admin",
  "navigationPermissions": {
    "dashboard": true,
    "builders": true,
    "users": false,
    "properties": true,
    "analytics": false,
    "messages": true,
    "appointments": true,
    "comments": true,
    "settings": false,
    "others": false
  },
  "isActive": true
}
```

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "email": "newadmin@example.com",
  "name": "New Admin",
  "roleName": "admin",
  "navigationPermissions": {
    "dashboard": true,
    "builders": true,
    "users": false,
    "properties": true,
    "analytics": false,
    "messages": true,
    "appointments": true,
    "comments": true,
    "settings": false,
    "others": false
  },
  "isActive": true,
  "createdAt": "2023-07-20T10:00:00.000Z",
  "updatedAt": "2023-07-20T10:00:00.000Z"
}
```

### Get All Admins
**GET** `/v1/admins`

#### Query Parameters
- `name` (string): Filter by admin name
- `roleName` (string): Filter by role ('admin' or 'super_admin')
- `isActive` (boolean): Filter by active status
- `email` (string): Filter by email
- `sortBy` (string): Sort field (e.g., 'name:asc', 'createdAt:desc')
- `limit` (number): Results per page (default: 10, max: 100)
- `page` (number): Page number (default: 1)

#### Example Request
```
GET /v1/admins?roleName=admin&isActive=true&limit=20&page=1&sortBy=name:asc
```

#### Response
```json
{
  "results": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "admin@example.com",
      "name": "Admin User",
      "roleName": "admin",
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

### Get Single Admin
**GET** `/v1/admins/:adminId`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "admin@example.com",
  "name": "Admin User",
  "roleName": "admin",
  "navigationPermissions": {
    "dashboard": true,
    "builders": true,
    "users": true,
    "properties": true,
    "analytics": true,
    "messages": true,
    "appointments": true,
    "comments": true,
    "settings": true,
    "others": false
  },
  "isActive": true,
  "lastLoginAt": "2023-07-20T10:30:00.000Z",
  "createdAt": "2023-07-20T10:00:00.000Z",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Update Admin
**PATCH** `/v1/admins/:adminId`

#### Request Body (all fields optional)
```json
{
  "name": "Updated Admin Name",
  "email": "updated@example.com",
  "roleName": "super_admin",
  "isActive": false,
  "navigationPermissions": {
    "dashboard": true,
    "builders": false,
    "users": true,
    "properties": true,
    "analytics": false,
    "messages": true,
    "appointments": false,
    "comments": true,
    "settings": true,
    "others": false
  }
}
```

### Delete Admin
**DELETE** `/v1/admins/:adminId`

#### Response
```
Status: 204 No Content
```

---

## 3. Navigation Permissions Management

### Get Navigation Permissions
**GET** `/v1/admins/:adminId/navigation-permissions`

#### Response
```json
{
  "navigationPermissions": {
    "dashboard": true,
    "builders": true,
    "users": true,
    "properties": true,
    "analytics": true,
    "messages": true,
    "appointments": true,
    "comments": true,
    "settings": true,
    "others": false
  }
}
```

### Update Navigation Permissions
**PATCH** `/v1/admins/:adminId/navigation-permissions`

#### Request Body
```json
{
  "dashboard": true,
  "builders": false,
  "users": true,
  "properties": true,
  "analytics": false,
  "messages": true,
  "appointments": false,
  "comments": true,
  "settings": true,
  "others": false
}
```

#### Frontend Example
```javascript
const updateAdminPermissions = async (adminId, permissions) => {
  try {
    const response = await fetch(`/api/v1/admins/${adminId}/navigation-permissions`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissions)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to update permissions');
    }
  } catch (error) {
    console.error('Update permissions error:', error);
    throw error;
  }
};
```

---

## 4. Account Management

### Activate Admin
**PATCH** `/v1/admins/:adminId/activate`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "admin@example.com",
  "name": "Admin User",
  "isActive": true,
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Deactivate Admin
**PATCH** `/v1/admins/:adminId/deactivate`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "admin@example.com",
  "name": "Admin User",
  "isActive": false,
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

---

## 5. Profile Management

### Get Current Admin Profile
**GET** `/v1/admins/profile`

#### Response
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "admin@example.com",
  "name": "Admin User",
  "roleName": "admin",
  "navigationPermissions": {
    "dashboard": true,
    "builders": true,
    "users": true,
    "properties": true,
    "analytics": true,
    "messages": true,
    "appointments": true,
    "comments": true,
    "settings": true,
    "others": false
  },
  "isActive": true,
  "lastLoginAt": "2023-07-20T10:30:00.000Z",
  "createdAt": "2023-07-20T10:00:00.000Z",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

### Update Profile
**PATCH** `/v1/admins/profile`

#### Request Body
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Change Password
**PATCH** `/v1/admins/profile/change-password`

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

#### Frontend Example
```javascript
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch('/api/v1/admins/profile/change-password', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data.message;
    } else {
      throw new Error(data.message || 'Password change failed');
    }
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};
```

---

## 6. Statistics

### Get Admin Statistics
**GET** `/v1/admins/stats`

#### Response
```json
{
  "totalAdmins": 5,
  "activeAdmins": 4,
  "inactiveAdmins": 1,
  "superAdmins": 1,
  "regularAdmins": 4,
  "recentLogins": 3
}
```

---

## 7. Permission Checking

### Check Permission
**GET** `/v1/admins/check-permission/:permission`

#### URL Parameters
- `permission`: One of: `dashboard`, `builders`, `users`, `properties`, `analytics`, `messages`, `appointments`, `comments`, `settings`, `others`

#### Example Request
```
GET /v1/admins/check-permission/dashboard
```

#### Response
```json
{
  "permission": "dashboard",
  "hasPermission": true,
  "adminId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### Frontend Example
```javascript
const checkPermission = async (permission) => {
  try {
    const response = await fetch(`/api/v1/admins/check-permission/${permission}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    
    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};
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
  "message": "Admin not found"
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

### Complete Admin Management Component
```javascript
class AdminService {
  constructor(baseURL = '/api/v1/admins') {
    this.baseURL = baseURL;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    };
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  }

  async getAdmins(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch admins');
    return await response.json();
  }

  async createAdmin(adminData) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(adminData)
    });
    
    if (!response.ok) throw new Error('Failed to create admin');
    return await response.json();
  }

  async updateAdmin(adminId, updateData) {
    const response = await fetch(`${this.baseURL}/${adminId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) throw new Error('Failed to update admin');
    return await response.json();
  }

  async deleteAdmin(adminId) {
    const response = await fetch(`${this.baseURL}/${adminId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete admin');
  }

  async updatePermissions(adminId, permissions) {
    const response = await fetch(`${this.baseURL}/${adminId}/navigation-permissions`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(permissions)
    });
    
    if (!response.ok) throw new Error('Failed to update permissions');
    return await response.json();
  }

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
    const response = await fetch(`${this.baseURL}/profile/change-password`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) throw new Error('Failed to change password');
    return await response.json();
  }

  async getStats() {
    const response = await fetch(`${this.baseURL}/stats`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  }

  async checkPermission(permission) {
    const response = await fetch(`${this.baseURL}/check-permission/${permission}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to check permission');
    const data = await response.json();
    return data.hasPermission;
  }
}

// Usage example
const adminService = new AdminService();

// Login
const loginData = await adminService.login('admin@example.com', 'password123');

// Get all admins with filters
const admins = await adminService.getAdmins({
  roleName: 'admin',
  isActive: true,
  limit: 20,
  page: 1
});

// Create new admin
const newAdmin = await adminService.createAdmin({
  email: 'newadmin@example.com',
  password: 'password123',
  name: 'New Admin',
  roleName: 'admin',
  navigationPermissions: {
    dashboard: true,
    builders: true,
    users: false,
    properties: true,
    analytics: false,
    messages: true,
    appointments: true,
    comments: true,
    settings: false,
    others: false
  }
});
```

---

## Notes

1. **Authentication**: Most endpoints require a valid JWT token in the Authorization header
2. **Password Requirements**: Passwords must be at least 8 characters and contain at least one letter and one number
3. **Role Types**: Only `admin` and `super_admin` roles are supported
4. **Navigation Permissions**: All permission fields are boolean values
5. **Pagination**: Use `limit` and `page` query parameters for paginated results
6. **Error Handling**: Always check response status and handle errors appropriately
7. **Token Management**: Store tokens securely and implement refresh token logic
8. **CORS**: Ensure your frontend domain is configured for CORS if making requests from a different domain

This guide provides everything needed to integrate the Admin API with your frontend application. All endpoints are RESTful and follow standard HTTP conventions.
