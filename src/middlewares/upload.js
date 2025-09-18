import multer from 'multer';
import path from 'path';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { s3 } from '../utils/s3Connection.js';
import config from '../config/config.js';

// S3 upload function
const uploadToS3 = async (file, folder = 'properties') => {
  const fileExtension = path.extname(file.originalname);
  const fileName = path.basename(file.originalname, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const key = `${folder}/${file.fieldname || 'files'}/${timestamp}_${fileName}${fileExtension}`;

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
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    if (error.code === 'AccessDenied' && error.message.includes('ACL')) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'S3 bucket ACLs are disabled. Please enable ACLs or configure bucket policy for public access.');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `S3 upload failed: ${error.message}`);
  }
};

// File filter function
const fileFilter = (req, file, cb) => {
  // For multipart/form-data, req.body might not be available yet
  // We'll allow all file types and validate in the controller instead
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // Allow all supported file types for now, validation will happen in controller
  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, `Invalid file type. Allowed types: ${allAllowedTypes.join(', ')}`), false);
  }
};

// Memory storage for S3 uploads
const storage = multer.memoryStorage();

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName = 'file', folder = 'properties') => {
  return async (req, res, next) => {
    const uploadSingleFile = upload.single(fieldName);

    uploadSingleFile(req, res, async (err) => {
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

      // Upload to S3 if file exists
      if (req.file) {
        try {
          const s3Result = await uploadToS3(req.file, folder);
          req.file.s3 = s3Result;
          req.file.url = s3Result.location;
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName = 'files', maxCount = 10, folder = 'properties') => {
  return async (req, res, next) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount);

    uploadMultipleFiles(req, res, async (err) => {
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

      // Upload all files to S3
      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map((file) => uploadToS3(file, folder));
          const s3Results = await Promise.all(uploadPromises);

          // Add S3 info to each file
          req.files.forEach((file, index) => {
            // eslint-disable-next-line no-param-reassign
            file.s3 = s3Results[index];
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

// Middleware for mixed file uploads (different field names)
export const uploadFields = (fields, folder = 'properties') => {
  return async (req, res, next) => {
    const uploadFieldsFiles = upload.fields(fields);

    uploadFieldsFiles(req, res, async (err) => {
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

      // Upload all files to S3
      if (req.files) {
        try {
          const fieldNames = Object.keys(req.files);
          const allUploadPromises = fieldNames.map(async (fieldName) => {
            const files = req.files[fieldName];
            const uploadPromises = files.map((file) => uploadToS3(file, folder));
            const s3Results = await Promise.all(uploadPromises);

            // Add S3 info to each file
            files.forEach((file, index) => {
              // eslint-disable-next-line no-param-reassign
              file.s3 = s3Results[index];
              // eslint-disable-next-line no-param-reassign
              file.url = s3Results[index].location;
            });
          });

          await Promise.all(allUploadPromises);
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};

// Helper function to delete uploaded file from S3
export const deleteUploadedFile = async (s3Key) => {
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
    console.error('Error deleting file from S3:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete file from S3');
  }
};

// Helper function to get file URL (now returns S3 URL directly)
export const getFileUrl = (s3Location) => {
  return s3Location || null;
};

// Helper function to delete multiple files from S3
export const deleteMultipleFiles = async (s3Keys) => {
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
    console.error('Error deleting files from S3:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete files from S3');
  }
};

export default upload;
