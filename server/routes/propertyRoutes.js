const express = require('express');
const router = express.Router();
const {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  reportProperty,
} = require('../controllers/propertyController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/', optionalAuth, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', optionalAuth, getPropertyById);
router.get('/:id/similar', getSimilarProperties);

// Owner-only creation
router.post('/', protect, authorize('owner'), createProperty);
router.put('/:id', protect, authorize('owner', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

// Student/User reporting
router.post('/:id/report', protect, reportProperty);

module.exports = router;
