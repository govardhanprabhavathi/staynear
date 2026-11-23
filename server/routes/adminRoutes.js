const express = require('express');
const router = express.Router();
const {
  getAdminDashboardMetrics,
  getOwnerApplications,
  getPrivateDocument,
  reviewOwnerApplication,
  getAdminProperties,
  reviewProperty,
  getAllUsers,
  updateUserStatus,
  getAllReports,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here are restricted to Admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardMetrics);

// Owner Applications
router.get('/owners', getOwnerApplications);
router.get('/documents/:filename', getPrivateDocument);
router.patch('/owners/:id/review', reviewOwnerApplication);

// Property Moderation
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/review', reviewProperty);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

// Safety & Reports
router.get('/reports', getAllReports);
router.patch('/reports/:id', updateReportStatus);

module.exports = router;
