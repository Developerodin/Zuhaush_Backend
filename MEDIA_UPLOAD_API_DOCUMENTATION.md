# Media Upload API Documentation

## Overview
This document explains how to upload media (images, videos, documents, floor plans, brochures) to a property.

## Endpoint
```
POST /v1/properties/:propertyId/media
```

## Authentication
Requires Builder authentication token in the Authorization header:
```
Authorization: Bearer <builder_token>
```

**Note**: You can only upload media to your own properties.

---

## Request Format

### Important: This is a Multipart/Form-Data Request ⚠️

You **MUST** use `multipart/form-data` encoding (NOT JSON) because you're uploading a file.

### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `file` | File | The actual file to upload | **Required** (unless using `url`) |
| `type` | String | Media type | **Required**. Must be one of: `image`, `video`, `document`, `floor_plan`, `brochure` |

### Optional Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `caption` | String | Media caption/description | Max 200 characters |
| `isPrimary` | Boolean | Set as primary media | Default: false |

---

## Media Type & File Type Compatibility

### Image
- **Media Type**: `image`
- **Allowed File Types**: 
  - `image/jpeg` (.jpg, .jpeg)
  - `image/png` (.png)
  - `image/webp` (.webp)

### Video
- **Media Type**: `video`
- **Allowed File Types**:
  - `video/mp4` (.mp4)
  - `video/avi` (.avi)
  - `video/mov` (.mov)
  - `video/wmv` (.wmv)

### Document
- **Media Type**: `document`
- **Allowed File Types**:
  - `application/pdf` (.pdf)
  - `application/msword` (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)

### Floor Plan
- **Media Type**: `floor_plan`
- **Allowed File Types**:
  - All image types (jpeg, png, webp)
  - All document types (pdf, doc, docx)

### Brochure
- **Media Type**: `brochure`
- **Allowed File Types**:
  - `application/pdf` (.pdf)
  - `application/msword` (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)

---

## Example Requests

### Example 1: Using cURL
```bash
curl -X POST https://api.example.com/v1/properties/68ec991ba5bc0bcff39d820d/media \
  -H "Authorization: Bearer YOUR_BUILDER_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "type=image" \
  -F "caption=Beautiful Living Room" \
  -F "isPrimary=true"
```

### Example 2: Using Postman

1. **Set Request Type**: POST
2. **URL**: `https://api.example.com/v1/properties/68ec991ba5bc0bcff39d820d/media`
3. **Headers**:
   - `Authorization: Bearer YOUR_BUILDER_TOKEN`
4. **Body** (Select "form-data"):
   - Key: `file` | Type: File | Value: Select your file
   - Key: `type` | Type: Text | Value: `image`
   - Key: `caption` | Type: Text | Value: `Beautiful Living Room`
   - Key: `isPrimary` | Type: Text | Value: `true`

### Example 3: Using JavaScript (Fetch API)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]); // File from input element
formData.append('type', 'image');
formData.append('caption', 'Beautiful Living Room');
formData.append('isPrimary', 'true');

fetch('https://api.example.com/v1/properties/68ec991ba5bc0bcff39d820d/media', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_BUILDER_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Example 4: Using Axios (JavaScript/Node.js)
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/image.jpg'));
formData.append('type', 'image');
formData.append('caption', 'Beautiful Living Room');
formData.append('isPrimary', 'true');

axios.post(
  'https://api.example.com/v1/properties/68ec991ba5bc0bcff39d820d/media',
  formData,
  {
    headers: {
      'Authorization': 'Bearer YOUR_BUILDER_TOKEN',
      ...formData.getHeaders() // Important for multipart/form-data
    }
  }
)
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error.response.data));
```

### Example 5: Using React Native
```javascript
const uploadMedia = async (propertyId, fileUri, fileType, fileName) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: fileUri,
    type: fileType, // e.g., 'image/jpeg'
    name: fileName  // e.g., 'photo.jpg'
  });
  formData.append('type', 'image');
  formData.append('caption', 'Property Image');
  formData.append('isPrimary', 'false');

  try {
    const response = await fetch(
      `https://api.example.com/v1/properties/${propertyId}/media`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YOUR_BUILDER_TOKEN}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );
    
    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## Response

### Success Response (201 Created)
```json
{
  "id": "68ec991ba5bc0bcff39d820d",
  "name": "Sunrise Luxury Apartments",
  "media": [
    {
      "type": "image",
      "url": "https://s3.amazonaws.com/bucket/properties/image123.jpg",
      "urlKey": "properties/image123.jpg",
      "caption": "Beautiful Living Room",
      "isPrimary": true,
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "_id": "68ec991ba5bc0bcff39d820e"
    }
  ],
  // ... other property fields
}
```

### Error Responses

#### 400 Bad Request - Missing Required Field
```json
{
  "code": 400,
  "message": "\"type\" is required"
}
```

**Solution**: Make sure to include the `type` field in your form data.

#### 400 Bad Request - Invalid Field
```json
{
  "code": 400,
  "message": "\"media\" is not allowed"
}
```

**Solution**: Don't send a field called `media`. Send individual fields: `file`, `type`, `caption`, `isPrimary`.

#### 400 Bad Request - File Required
```json
{
  "code": 400,
  "message": "File or URL is required"
}
```

**Solution**: Include the `file` field with an actual file in your form data.

#### 400 Bad Request - Invalid File Type
```json
{
  "code": 400,
  "message": "File type image/gif is not valid for media type image"
}
```

**Solution**: Make sure your file type matches the media type. See "Media Type & File Type Compatibility" section above.

#### 403 Forbidden
```json
{
  "code": 403,
  "message": "You can only add media to your own properties"
}
```

**Solution**: You can only upload media to properties you own.

#### 404 Not Found
```json
{
  "code": 404,
  "message": "Property not found"
}
```

**Solution**: Verify the property ID is correct.

---

## Common Mistakes ❌

### ❌ Wrong: Sending JSON
```javascript
// DON'T DO THIS - This won't work!
fetch('/properties/123/media', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    media: file,  // Wrong!
    type: 'image'
  })
});
```

### ✅ Correct: Sending Form Data
```javascript
// DO THIS - This will work!
const formData = new FormData();
formData.append('file', file);  // Correct field name!
formData.append('type', 'image');

fetch('/properties/123/media', {
  method: 'POST',
  body: formData  // Don't set Content-Type manually
});
```

---

## Step-by-Step Guide

### 1. Get your property ID
First, create a property or get an existing property ID.

### 2. Prepare your file
Have the file ready to upload (image, video, document, etc.)

### 3. Create FormData
```javascript
const formData = new FormData();
```

### 4. Append the file
```javascript
formData.append('file', yourFile);
```

### 5. Append required type field
```javascript
formData.append('type', 'image'); // or 'video', 'document', 'floor_plan', 'brochure'
```

### 6. Append optional fields (if needed)
```javascript
formData.append('caption', 'Your caption here');
formData.append('isPrimary', 'true');
```

### 7. Send the request
```javascript
fetch(`/v1/properties/${propertyId}/media`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## Tips & Best Practices

1. **Set Primary Image**: Always set at least one image as primary (`isPrimary: true`)
2. **Add Captions**: Captions improve SEO and user experience
3. **Optimize Images**: Compress images before uploading to save storage and bandwidth
4. **File Size Limits**: Check your server's file size limits (typically 5-10MB for images)
5. **Supported Formats**: Only upload files in supported formats (see compatibility table above)
6. **Error Handling**: Always implement proper error handling in your upload logic

---

## Need Help?

If you're still getting errors, double-check:
- ✅ Are you using `multipart/form-data` encoding?
- ✅ Is the file field named `file` (not `media` or anything else)?
- ✅ Did you include the required `type` field?
- ✅ Is the file type compatible with the media type?
- ✅ Do you have the correct Authorization header?
- ✅ Are you uploading to your own property?

