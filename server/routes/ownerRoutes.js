const express = require('express');
const router = express.Router();
const {
  applyOwner,
  getApplicationStatus,
  getOwnerDashboardMetrics,
  getOwnerProperties,
  getOwnerEnquiries,
  updateEnquiryStatus,
  getOwnerAppointments,
  updateAppointmentStatus,
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

// Owner apply route - any authenticated owner user
router.post('/apply', protect, authorize('owner'), applyOwner);
router.get('/application-status', protect, authorize('owner'), getApplicationStatus);

// Owner management routes
router.get('/dashboard', protect, authorize('owner'), getOwnerDashboardMetrics);
router.get('/properties', protect, authorize('owner'), getOwnerProperties);
router.get('/enquiries', protect, authorize('owner'), getOwnerEnquiries);
router.patch('/enquiries/:id/status', protect, authorize('owner'), updateEnquiryStatus);
router.get('/appointments', protect, authorize('owner'), getOwnerAppointments);
router.patch('/appointments/:id/status', protect, authorize('owner'), updateAppointmentStatus);

module.exports = router;
