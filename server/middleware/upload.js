const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const propertyUploadDir = path.join(__dirname, '../uploads/properties');
const privateDocDir = path.join(__dirname, '../private_documents');

if (!fs.existsSync(propertyUploadDir)) {
  fs.mkdirSync(propertyUploadDir, { recursive: true });
}
if (!fs.existsSync(privateDocDir)) {
  fs.mkdirSync(privateDocDir, { recursive: true });
}

// Storage for public property photos
const propertyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, propertyUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// Storage for private owner verification documents
const privateDocStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, privateDocDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only high-quality image formats (JPEG, JPG, PNG, WEBP) are supported for properties!'));
  }
};

// File filter for private verification documents (images or PDFs)
const docFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Documents must be in PDF, JPG, or PNG format!'));
  }
};

const uploadPropertyImages = multer({
  storage: propertyStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: imageFileFilter,
});

const uploadPrivateDocuments = multer({
  storage: privateDocStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: docFileFilter,
});

module.exports = {
  uploadPropertyImages,
  uploadPrivateDocuments,
  propertyUploadDir,
  privateDocDir,
};
