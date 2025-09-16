import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/properties/images',
    'uploads/properties/videos',
    'uploads/properties/documents',
    'uploads/properties/floor-plans',
    'uploads/properties/brochures',
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  let allowedTypes = [];
  
  switch (req.body.type) {
    case 'image':
      allowedTypes = allowedImageTypes;
      break;
    case 'video':
      allowedTypes = allowedVideoTypes;
      break;
    case 'document':
    case 'brochure':
      allowedTypes = allowedDocTypes;
      break;
    case 'floor_plan':
      allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
      break;
    default:
      return cb(new ApiError(httpStatus.BAD_REQUEST, 'Invalid media type'), false);
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type for ${req.body.type}. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/properties/';
    
    switch (req.body.type) {
      case 'image':
        uploadPath += 'images/';
        break;
      case 'video':
        uploadPath += 'videos/';
        break;
      case 'document':
        uploadPath += 'documents/';
        break;
      case 'floor_plan':
        uploadPath += 'floor-plans/';
        break;
      case 'brochure':
        uploadPath += 'brochures/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: propertyId_timestamp_originalname
    const propertyId = req.params.propertyId || 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${propertyId}_${timestamp}_${name}${ext}`;
    cb(null, filename);
  }
});

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  }
});

// Middleware for single file upload
export const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadSingleFile = upload.single(fieldName);
    
    uploadSingleFile(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 50MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'Too many files. Maximum is 10 files'));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return (req, res, next) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount);
    
    uploadMultipleFiles(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 50MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, `Too many files. Maximum is ${maxCount} files`));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for mixed file uploads (different field names)
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadFieldsFiles = upload.fields(fields);
    
    uploadFieldsFiles(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 50MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'Too many files. Maximum is 10 files'));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Helper function to delete uploaded file
export const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to get file URL
export const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

export default upload;
