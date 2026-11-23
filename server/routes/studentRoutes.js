const express = require('express');
const router = express.Router();
const {
  getStudentDashboardMetrics,
  createInterest,
  getMyInterests,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  acceptReschedule,
  getFavourites,
  addFavourite,
  removeFavourite,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Student Dashboard Overview
router.get('/dashboard', protect, authorize('student'), getStudentDashboardMetrics);

// Interests / Enquiries
router.post('/interests', protect, authorize('student'), createInterest);
router.get('/interests/my-interests', protect, authorize('student'), getMyInterests);

// Appointments / Visits
router.post('/appointments', protect, authorize('student'), createAppointment);
router.get('/appointments/my-appointments', protect, authorize('student'), getMyAppointments);
router.patch('/appointments/:id/cancel', protect, authorize('student'), cancelAppointment);
router.patch('/appointments/:id/accept-reschedule', protect, authorize('student'), acceptReschedule);

// Favourites
router.get('/favourites', protect, authorize('student'), getFavourites);
router.post('/favourites/:propertyId', protect, authorize('student'), addFavourite);
router.delete('/favourites/:propertyId', protect, authorize('student'), removeFavourite);

module.exports = router;
