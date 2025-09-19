# Builder Frontend API Examples

This guide provides comprehensive examples for creating and updating builders with document uploads.

## 📋 Table of Contents
1. [Basic Builder Creation](#basic-builder-creation)
2. [Builder Creation with Documents](#builder-creation-with-documents)
3. [Builder Updates](#builder-updates)
4. [Document Upload Operations](#document-upload-operations)
5. [Complete React Components](#complete-react-components)
6. [Error Handling](#error-handling)

---

## 🏗️ Basic Builder Creation

### JavaScript/Fetch API
```javascript
const createBuilder = async (builderData) => {
  try {
    const response = await fetch('/api/v1/builders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <your-jwt-token>' // If authenticated
      },
      body: JSON.stringify(builderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const builder = await response.json();
    console.log('Builder created:', builder);
    return builder;
  } catch (error) {
    console.error('Error creating builder:', error);
    throw error;
  }
};

// Usage
const builderData = {
  name: "ABC Construction Ltd",
  email: "contact@abcconstruction.com",
  password: "SecurePass123",
  contactInfo: "+91-9876543210",
  address: "123 Construction Street, Mumbai",
  company: "ABC Construction Ltd",
  city: "Mumbai",
  reraRegistrationId: "RERA123456789",
  contactPerson: "John Doe",
  phone: "+919876543210",
  website: "https://abcconstruction.com",
  supportingDocuments: [] // Empty array for now
};

createBuilder(builderData);
```

### Axios Example
```javascript
import axios from 'axios';

const createBuilder = async (builderData) => {
  try {
    const response = await axios.post('/api/v1/builders', builderData, {
      headers: {
        'Authorization': 'Bearer <your-jwt-token>'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating builder:', error.response?.data?.message || error.message);
    throw error;
  }
};
```

---

## 📄 Builder Creation with Documents

### Method 1: Create Builder First, Then Upload Documents
```javascript
const createBuilderWithDocuments = async (builderData, documentFiles) => {
  try {
    // Step 1: Create builder
    const builder = await createBuilder(builderData);
    console.log('Builder created with ID:', builder._id);

    // Step 2: Upload documents if any
    if (documentFiles && documentFiles.length > 0) {
      const uploadedDocuments = await uploadMultipleDocuments(builder._id, documentFiles);
      console.log('Documents uploaded:', uploadedDocuments);
    }

    return builder;
  } catch (error) {
    console.error('Error in builder creation process:', error);
    throw error;
  }
};

const uploadMultipleDocuments = async (builderId, files, documentType = 'other') => {
  const formData = new FormData();
  
  // Add files to FormData
  files.forEach(file => {
    formData.append('documents', file);
  });
  
  // Add document type
  formData.append('documentType', documentType);

  const response = await fetch(`/api/v1/builders/${builderId}/documents/multiple`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <your-jwt-token>'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Method 2: Create Builder with Pre-uploaded Document URLs
```javascript
const createBuilderWithDocumentUrls = async (builderData, documentUrls) => {
  const builderDataWithDocs = {
    ...builderData,
    supportingDocuments: documentUrls.map((url, index) => ({
      url: url,
      originalName: `document_${index + 1}.pdf`,
      documentType: 'other',
      uploadedAt: new Date().toISOString()
    }))
  };

  return createBuilder(builderDataWithDocs);
};

// Usage
const documentUrls = [
  'https://s3.amazonaws.com/bucket/license.pdf',
  'https://s3.amazonaws.com/bucket/certificate.pdf'
];

createBuilderWithDocumentUrls(builderData, documentUrls);
```

---

## 🔄 Builder Updates

### Basic Builder Update
```javascript
const updateBuilder = async (builderId, updateData) => {
  try {
    const response = await fetch(`/api/v1/builders/${builderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <your-jwt-token>'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const updatedBuilder = await response.json();
    console.log('Builder updated:', updatedBuilder);
    return updatedBuilder;
  } catch (error) {
    console.error('Error updating builder:', error);
    throw error;
  }
};

// Usage examples
await updateBuilder('64a1b2c3d4e5f6789012345', {
  name: "ABC Construction Ltd - Updated",
  website: "https://newwebsite.com",
  contactPerson: "Jane Smith"
});

// Update only specific fields
await updateBuilder('64a1b2c3d4e5f6789012345', {
  city: "Delhi",
  phone: "+919876543211"
});
```

### Update Builder Profile (Authenticated)
```javascript
const updateBuilderProfile = async (updateData) => {
  try {
    const response = await fetch('/api/v1/builders/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <your-jwt-token>'
      },
      body: JSON.stringify(updateData)
    });

    return response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Usage
await updateBuilderProfile({
  name: "Updated Company Name",
  address: "New Address",
  website: "https://newwebsite.com"
});
```

---

## 📎 Document Upload Operations

### Single Document Upload
```javascript
const uploadSingleDocument = async (builderId, file, documentType = 'other') => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const response = await fetch(`/api/v1/builders/${builderId}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <your-jwt-token>'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// Usage
const fileInput = document.getElementById('documentInput');
const file = fileInput.files[0];

if (file) {
  uploadSingleDocument('64a1b2c3d4e5f6789012345', file, 'license');
}
```

### Multiple Documents Upload
```javascript
const uploadMultipleDocuments = async (builderId, files, documentType = 'other') => {
  const formData = new FormData();
  
  // Add all files
  files.forEach(file => {
    formData.append('documents', file);
  });
  
  // Add document type
  formData.append('documentType', documentType);

  const response = await fetch(`/api/v1/builders/${builderId}/documents/multiple`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <your-jwt-token>'
    },
    body: formData
  });

  return response.json();
};

// Usage with file input
const fileInput = document.getElementById('multipleDocuments');
const files = Array.from(fileInput.files);

uploadMultipleDocuments('64a1b2c3d4e5f6789012345', files, 'certificate');
```

### Mixed Field Document Upload
```javascript
const uploadDocumentFields = async (builderId, fieldFiles) => {
  const formData = new FormData();
  
  // Add files for different document types
  if (fieldFiles.licenses) {
    fieldFiles.licenses.forEach(file => {
      formData.append('license', file);
    });
    formData.append('licenseType', 'license');
  }
  
  if (fieldFiles.certificates) {
    fieldFiles.certificates.forEach(file => {
      formData.append('certificate', file);
    });
    formData.append('certificateType', 'certificate');
  }
  
  if (fieldFiles.registrations) {
    fieldFiles.registrations.forEach(file => {
      formData.append('registration', file);
    });
    formData.append('registrationType', 'registration');
  }

  const response = await fetch(`/api/v1/builders/${builderId}/documents/fields`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <your-jwt-token>'
    },
    body: formData
  });

  return response.json();
};

// Usage
const fieldFiles = {
  licenses: [licenseFile1, licenseFile2],
  certificates: [certFile1],
  registrations: [regFile1]
};

uploadDocumentFields('64a1b2c3d4e5f6789012345', fieldFiles);
```

### Remove Document
```javascript
const removeDocument = async (builderId, documentId) => {
  try {
    const response = await fetch(`/api/v1/builders/${builderId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer <your-jwt-token>'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  } catch (error) {
    console.error('Error removing document:', error);
    throw error;
  }
};

// Usage
removeDocument('64a1b2c3d4e5f6789012345', '64a1b2c3d4e5f6789012346');
```

---

## ⚛️ Complete React Components

### Builder Creation Form
```jsx
import React, { useState } from 'react';

const BuilderCreationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactInfo: '',
    address: '',
    company: '',
    city: '',
    reraRegistrationId: '',
    contactPerson: '',
    phone: '',
    website: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create builder
      const response = await fetch('/api/v1/builders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create builder');
      }

      const builder = await response.json();
      console.log('Builder created:', builder);

      // Step 2: Upload documents if any
      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach(file => {
          formData.append('documents', file);
        });
        formData.append('documentType', 'other');

        const uploadResponse = await fetch(`/api/v1/builders/${builder._id}/documents/multiple`, {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          console.log('Documents uploaded successfully');
        }
      }

      alert('Builder created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create builder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="builder-form">
      <h2>Create Builder</h2>
      
      <div className="form-group">
        <label>Company Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Company:</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>RERA Registration ID:</label>
        <input
          type="text"
          name="reraRegistrationId"
          value={formData.reraRegistrationId}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Contact Person:</label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Address:</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Website:</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Supporting Documents:</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <small>Upload licenses, certificates, and other supporting documents</small>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Builder'}
      </button>
    </form>
  );
};

export default BuilderCreationForm;
```

### Builder Update Form
```jsx
import React, { useState, useEffect } from 'react';

const BuilderUpdateForm = ({ builderId }) => {
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuilder();
  }, [builderId]);

  const fetchBuilder = async () => {
    try {
      const response = await fetch(`/api/v1/builders/${builderId}`, {
        headers: {
          'Authorization': 'Bearer <your-jwt-token>'
        }
      });
      const builder = await response.json();
      setFormData(builder);
      setDocuments(builder.supportingDocuments || []);
    } catch (error) {
      console.error('Error fetching builder:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    formData.append('documentType', 'other');

    try {
      const response = await fetch(`/api/v1/builders/${builderId}/documents/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer <your-jwt-token>'
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(prev => [...prev, ...result.documents]);
        alert('Documents uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents');
    }
  };

  const handleRemoveDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/v1/builders/${builderId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer <your-jwt-token>'
        }
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc._id !== documentId));
        alert('Document removed successfully!');
      }
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Failed to remove document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/builders/${builderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <your-jwt-token>'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Builder updated successfully!');
      }
    } catch (error) {
      console.error('Error updating builder:', error);
      alert('Failed to update builder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="builder-update-form">
      <h2>Update Builder</h2>
      
      <div className="form-group">
        <label>Company Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Company:</label>
        <input
          type="text"
          name="company"
          value={formData.company || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          name="city"
          value={formData.city || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Website:</label>
        <input
          type="url"
          name="website"
          value={formData.website || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Upload New Documents:</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
        />
      </div>

      <div className="documents-list">
        <h3>Current Documents:</h3>
        {documents.map(doc => (
          <div key={doc._id} className="document-item">
            <span>{doc.originalName || 'Document'}</span>
            <span className="document-type">({doc.documentType})</span>
            <button 
              type="button" 
              onClick={() => handleRemoveDocument(doc._id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Builder'}
      </button>
    </form>
  );
};

export default BuilderUpdateForm;
```

---

## ❌ Error Handling

### Comprehensive Error Handling
```javascript
const handleBuilderOperation = async (operation) => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Server error';
      return { success: false, error: errorMessage };
    } else if (error.request) {
      // Network error
      return { success: false, error: 'Network error. Please check your connection.' };
    } else {
      // Other errors
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
  }
};

// Usage
const result = await handleBuilderOperation(async () => {
  return createBuilder(builderData);
});

if (result.success) {
  console.log('Builder created:', result.data);
} else {
  console.error('Error:', result.error);
  alert(result.error);
}
```

### File Upload Progress
```javascript
const uploadWithProgress = async (builderId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('document', file);
    formData.append('documentType', 'other');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `/api/v1/builders/${builderId}/documents`);
    xhr.setRequestHeader('Authorization', 'Bearer <your-jwt-token>');
    xhr.send(formData);
  });
};

// Usage with progress
uploadWithProgress(
  '64a1b2c3d4e5f6789012345', 
  file, 
  (progress) => {
    console.log(`Upload progress: ${progress.toFixed(2)}%`);
    // Update progress bar
  }
);
```

---

## 🔑 Key Points

1. **Authentication**: Always include JWT token in Authorization header for protected routes
2. **File Uploads**: Use FormData for file uploads, not JSON
3. **Error Handling**: Implement comprehensive error handling for better UX
4. **Progress Tracking**: Use XMLHttpRequest for upload progress tracking
5. **Validation**: Validate files on frontend before upload (size, type)
6. **Loading States**: Show loading indicators during operations
7. **Success Feedback**: Provide clear success/error messages to users

## 📝 API Endpoints Summary

- `POST /api/v1/builders` - Create builder
- `PATCH /api/v1/builders/:id` - Update builder
- `GET /api/v1/builders/:id` - Get builder
- `POST /api/v1/builders/:id/documents` - Upload single document
- `POST /api/v1/builders/:id/documents/multiple` - Upload multiple documents
- `POST /api/v1/builders/:id/documents/fields` - Upload mixed field documents
- `DELETE /api/v1/builders/:id/documents/:docId` - Remove document
