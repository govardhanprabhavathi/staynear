const express = require('express');
const router = express.Router();
const { uploadPropertyImages, uploadPrivateDocuments } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Upload public property photos
router.post(
  '/property-images',
  protect,
  authorize('owner', 'admin'),
  uploadPropertyImages.array('images', 10),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No images were uploaded.' });
      }

      const imageUrls = req.files.map((file) => `/uploads/properties/${file.filename}`);

      res.json({
        success: true,
        message: 'Images uploaded successfully.',
        urls: imageUrls,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Upload private owner verification documents
router.post(
  '/documents',
  protect,
  authorize('owner'),
  uploadPrivateDocuments.fields([
    { name: 'identityDocument', maxCount: 1 },
    { name: 'propertyProof', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).json({ success: false, message: 'No documents were uploaded.' });
      }

      const result = {};

      if (req.files.identityDocument && req.files.identityDocument[0]) {
        result.identityDocumentReference = req.files.identityDocument[0].filename;
      }
      if (req.files.propertyProof && req.files.propertyProof[0]) {
        result.propertyOwnershipProofReference = req.files.propertyProof[0].filename;
      }

      res.json({
        success: true,
        message: 'Verification documents received and stored securely.',
        references: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
