const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { HTTP_STATUS } = require('../configs/constants');

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const verificationMimeTypes = [
  ...imageMimeTypes,
  'application/pdf'
];

const createFileFilter = (allowedMimeTypes, message) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    const error = new Error(message);
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    return cb(error, false);
  };
};

const createUploader = (allowedMimeTypes, message) => multer({
  storage,
  fileFilter: createFileFilter(allowedMimeTypes, message),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

const imageUpload = createUploader(
  imageMimeTypes,
  'Invalid file type. Only JPEG, JPG, PNG, WEBP and GIF are allowed.'
);

const verificationUpload = createUploader(
  verificationMimeTypes,
  'Invalid file type. Only JPEG, JPG, PNG, WEBP, GIF and PDF are allowed.'
);

module.exports = imageUpload;
module.exports.imageUpload = imageUpload;
module.exports.verificationUpload = verificationUpload;
