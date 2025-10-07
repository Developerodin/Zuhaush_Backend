# Image Upload API Documentation

## Overview
This guide explains how to upload an image to S3 and save it to a user's profile in two steps:
1. Upload the image to S3
2. Update the user profile with the image URL and key

---

## Step 1: Upload Image to S3

### Endpoint
```
POST /v1/common/upload
```

### Authentication
- **Required**: Yes
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <access_token>`

### Request
- **Content-Type**: `multipart/form-data`
- **Body Parameter**: 
  - `file` (required): The image file to upload

### File Constraints
- **Maximum Size**: 5MB
- **Supported Formats**: All image formats (jpg, png, gif, webp, etc.)

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/v1/common/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

### Example Request (JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append('file', imageFile); // imageFile is a File object

const response = await fetch('http://localhost:3000/v1/common/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### Example Request (Postman)
1. Set method to `POST`
2. Enter URL: `http://localhost:3000/v1/common/upload`
3. Go to **Headers** tab:
   - Add `Authorization: Bearer YOUR_ACCESS_TOKEN`
4. Go to **Body** tab:
   - Select `form-data`
   - Add key `file` with type `File`
   - Choose your image file

### Success Response
**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://your-bucket.s3.region.amazonaws.com/1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "key": "1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "originalName": "profile-picture.jpg",
    "mimeType": "image/jpeg",
    "size": 245678
  }
}
```

### Error Responses

**No File Uploaded**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**File Too Large**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB"
}
```

---

## Step 2: Update User Profile with Image

### Endpoint
```
PATCH /v1/users/profile
```

### Authentication
- **Required**: Yes
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <access_token>`

### Request
- **Content-Type**: `application/json`
- **Body Parameters**:
  - `image` (string, optional): The S3 URL from Step 1
  - `imageKey` (string, optional): The S3 key from Step 1

### Example Request (cURL)
```bash
curl -X PATCH http://localhost:3000/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://your-bucket.s3.region.amazonaws.com/1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "imageKey": "1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
  }'
```

### Example Request (JavaScript/Fetch)
```javascript
// Using data from Step 1 response
const uploadResponse = await fetch('http://localhost:3000/v1/common/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const uploadResult = await uploadResponse.json();

// Step 2: Update user profile
const updateResponse = await fetch('http://localhost:3000/v1/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: uploadResult.data.url,
    imageKey: uploadResult.data.key
  })
});

const updatedUser = await updateResponse.json();
console.log('Profile updated:', updatedUser);
```

### Success Response
**Status Code**: `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "image": "https://your-bucket.s3.region.amazonaws.com/1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "imageKey": "1699876543210-a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "contactNumber": "+1234567890",
  "cityofInterest": "New York",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:45:00.000Z"
}
```

---

## Complete Workflow Example (React)

```javascript
import { useState } from 'react';

const ProfileImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Step 1: Upload to S3
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:3000/v1/common/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('File uploaded:', uploadResult.data);

      // Step 2: Update user profile
      const updateResponse = await fetch('http://localhost:3000/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: uploadResult.data.url,
          imageKey: uploadResult.data.key
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await updateResponse.json();
      console.log('Profile updated successfully:', updatedUser);
      alert('Profile image updated successfully!');

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default ProfileImageUpload;
```

---

## Deleting an Image

If you need to delete an old image when uploading a new one:

### Endpoint
```
DELETE /v1/common/files/:key
```

### Example: Replace User Image
```javascript
const replaceUserImage = async (newImageFile) => {
  const accessToken = localStorage.getItem('accessToken');
  
  try {
    // Get current user to find old imageKey
    const userResponse = await fetch('http://localhost:3000/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const currentUser = await userResponse.json();

    // Delete old image if exists
    if (currentUser.imageKey) {
      await fetch(`http://localhost:3000/v1/common/files/${currentUser.imageKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Old image deleted');
    }

    // Upload new image
    const formData = new FormData();
    formData.append('file', newImageFile);

    const uploadResponse = await fetch('http://localhost:3000/v1/common/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    const uploadResult = await uploadResponse.json();

    // Update profile with new image
    const updateResponse = await fetch('http://localhost:3000/v1/users/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: uploadResult.data.url,
        imageKey: uploadResult.data.key
      })
    });

    const updatedUser = await updateResponse.json();
    console.log('Image replaced successfully:', updatedUser);
    
  } catch (error) {
    console.error('Error replacing image:', error);
  }
};
```

---

## Error Handling

### Common Errors

| Status Code | Error | Solution |
|------------|-------|----------|
| 401 | Unauthorized | Check if access token is valid and not expired |
| 400 | No file uploaded | Ensure file is attached with key name `file` |
| 413 | File too large | Reduce image size to under 5MB |
| 500 | S3 upload failed | Check AWS credentials and S3 bucket configuration |

### Best Practices

1. **Validate file size on client side** before uploading
2. **Validate file type** (only images)
3. **Delete old images** when uploading new ones to save storage
4. **Show upload progress** for better UX
5. **Handle errors gracefully** with user-friendly messages
6. **Compress images** before upload to reduce size

---

## Notes

- The `image` field stores the publicly accessible URL of the uploaded image
- The `imageKey` field stores the S3 key needed to delete the file later
- Both fields are optional in the user model
- The upload endpoint uses `multer` for handling multipart/form-data
- Files are stored in AWS S3 with unique names using timestamp + UUID

---

## Security Considerations

1. **Authentication Required**: Both endpoints require valid Bearer token
2. **File Size Limit**: Maximum 5MB to prevent abuse
3. **Content Type Validation**: Add file type validation in production
4. **Access Control**: Only authenticated users can upload files
5. **S3 Bucket Permissions**: Ensure proper IAM permissions are set

