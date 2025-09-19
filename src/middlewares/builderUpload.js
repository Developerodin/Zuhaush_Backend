import multer from 'multer';
import path from 'path';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { s3 } from '../utils/s3Connection.js';
import config from '../config/config.js';

// S3 upload function for builder documents
const uploadDocumentToS3 = async (file, builderId, documentType = 'other') => {
  const fileExtension = path.extname(file.originalname);
  const fileName = path.basename(file.originalname, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const key = `builders/${builderId}/documents/${documentType}/${timestamp}_${fileName}${fileExtension}`;

  const uploadParams = {
    Bucket: config.aws.s3.bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL removed - bucket doesn't allow ACLs, files will be accessible via bucket policy
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    return {
      key: result.Key,
      location: result.Location,
      bucket: result.Bucket,
      originalName: file.originalname,
      documentType,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    if (error.code === 'AccessDenied' && error.message.includes('ACL')) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'S3 bucket ACLs are disabled. Please enable ACLs or configure bucket policy for public access.');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `S3 upload failed: ${error.message}`);
  }
};

// File filter for builder documents
const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type. Allowed types: ${allowedDocTypes.join(', ')}`), false);
  }
};

// Memory storage for S3 uploads
const storage = multer.memoryStorage();

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    files: 5, // Maximum 5 files per request
  },
});

// Middleware for single document upload
export const uploadSingleDocument = (fieldName = 'document') => {
  return async (req, res, next) => {
    const uploadSingleFile = upload.single(fieldName);

    uploadSingleFile(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 10MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'Too many files. Maximum is 5 files'));
          }
        }
        return next(err);
      }

      // Upload to S3 if file exists
      if (req.file) {
        try {
          const builderId = req.params.builderId || req.body.builderId || 'temp';
          const documentType = req.body.documentType || 'other';
          
          const s3Result = await uploadDocumentToS3(req.file, builderId, documentType);
          req.file.document = s3Result;
          req.file.url = s3Result.location;
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};

// Middleware for multiple document uploads
export const uploadMultipleDocuments = (fieldName = 'documents', maxCount = 5) => {
  return async (req, res, next) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount);

    uploadMultipleFiles(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 10MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, `Too many files. Maximum is ${maxCount} files`));
          }
        }
        return next(err);
      }

      // Upload all files to S3
      if (req.files && req.files.length > 0) {
        try {
          const builderId = req.params.builderId || req.body.builderId || 'temp';
          
          const uploadPromises = req.files.map(async (file) => {
            const documentType = req.body.documentType || 'other';
            return uploadDocumentToS3(file, builderId, documentType);
          });
          
          const s3Results = await Promise.all(uploadPromises);

          // Add S3 info to each file
          req.files.forEach((file, index) => {
            // eslint-disable-next-line no-param-reassign
            file.document = s3Results[index];
            // eslint-disable-next-line no-param-reassign
            file.url = s3Results[index].location;
          });
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};

// Middleware for mixed document uploads (different field names)
export const uploadDocumentFields = (fields) => {
  return async (req, res, next) => {
    const uploadFieldsFiles = upload.fields(fields);

    uploadFieldsFiles(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum size is 10MB'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(httpStatus.BAD_REQUEST, 'Too many files. Maximum is 5 files'));
          }
        }
        return next(err);
      }

      // Upload all files to S3
      if (req.files) {
        try {
          const builderId = req.params.builderId || req.body.builderId || 'temp';
          
          const fieldNames = Object.keys(req.files);
          const allUploadPromises = fieldNames.map(async (fieldName) => {
            const files = req.files[fieldName];
            const uploadPromises = files.map(async (file) => {
              const documentType = req.body[`${fieldName}Type`] || 'other';
              return uploadDocumentToS3(file, builderId, documentType);
            });
            return Promise.all(uploadPromises);
          });

          const allResults = await Promise.all(allUploadPromises);

          // Add S3 info to each file
          fieldNames.forEach((fieldName, fieldIndex) => {
            const files = req.files[fieldName];
            const fieldResults = allResults[fieldIndex];
            
            files.forEach((file, fileIndex) => {
              // eslint-disable-next-line no-param-reassign
              file.document = fieldResults[fileIndex];
              // eslint-disable-next-line no-param-reassign
              file.url = fieldResults[fileIndex].location;
            });
          });
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};

// Helper function to delete uploaded document from S3
export const deleteUploadedDocument = async (s3Key) => {
  if (!s3Key) return;

  try {
    await s3
      .deleteObject({
        Bucket: config.aws.s3.bucket,
        Key: s3Key,
      })
      .promise();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting document from S3:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete document from S3');
  }
};

// Helper function to delete multiple documents from S3
export const deleteMultipleDocuments = async (s3Keys) => {
  if (!s3Keys || s3Keys.length === 0) return;

  try {
    const deleteParams = {
      Bucket: config.aws.s3.bucket,
      Delete: {
        Objects: s3Keys.map((key) => ({ Key: key })),
      },
    };

    await s3.deleteObjects(deleteParams).promise();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting documents from S3:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete documents from S3');
  }
};

export default upload;
