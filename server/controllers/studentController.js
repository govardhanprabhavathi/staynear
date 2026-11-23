const Property = require('../models/Property');
const Interest = require('../models/Interest');
const Appointment = require('../models/Appointment');
const Favourite = require('../models/Favourite');
const Notification = require('../models/Notification');

// @desc    Get Student Dashboard Statistics & Overview
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboardMetrics = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [savedCount, interestsCount, visitsCount, upcomingVisits] = await Promise.all([
      Favourite.countDocuments({ studentId }),
      Interest.countDocuments({ studentId }),
      Appointment.countDocuments({ studentId }),
      Appointment.find({
        studentId,
        status: { $in: ['pending', 'confirmed', 'rescheduled'] },
        requestedDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      })
        .populate('propertyId', 'title location coverImage monthlyRent')
        .populate('ownerId', 'name phone')
        .sort({ requestedDate: 1 })
        .limit(3),
    ]);

    const recentInterests = await Interest.find({ studentId })
      .populate('propertyId', 'title location coverImage monthlyRent')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      metrics: {
        savedCount,
        interestsCount,
        visitsCount,
      },
      upcomingVisits,
      recentInterests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Interest / Enquiry for a property
// @route   POST /api/interests
// @access  Private (Student)
const createInterest = async (req, res, next) => {
  try {
    const { propertyId, message, contactPreference } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both property ID and an enquiry message.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.approvalStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Property is not available for enquiries.',
      });
    }

    const interest = await Interest.create({
      studentId: req.user._id,
      propertyId: property._id,
      ownerId: property.ownerId,
      message,
      contactPreference: contactPreference || 'phone',
      studentPhone: req.user.phone,
      studentEmail: req.user.email,
      status: 'pending',
    });

    // Notify owner
    await Notification.create({
      userId: property.ownerId,
      title: 'New Student Enquiry',
      message: `${req.user.name} expressed interest in your property "${property.title}".`,
      type: 'interest',
      relatedEntityId: interest._id,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted! The property owner has been notified.',
      interest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student's Enquiries
// @route   GET /api/interests/my-interests
// @access  Private (Student)
const getMyInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({ studentId: req.user._id })
      .populate('propertyId', 'title location monthlyRent coverImage accommodationType')
      .populate('ownerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      interests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a property visit
// @route   POST /api/appointments
// @access  Private (Student)
const createAppointment = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, requestedTime, notes } = req.body;

    if (!propertyId || !requestedDate || !requestedTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the property, desired visit date, and preferred time slot.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.approvalStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Property is not available for visits.',
      });
    }

    const appointment = await Appointment.create({
      studentId: req.user._id,
      propertyId: property._id,
      ownerId: property.ownerId,
      requestedDate: new Date(requestedDate),
      requestedTime,
      notes: notes || '',
      status: 'pending', // Requires owner confirmation
    });

    // Notify owner
    await Notification.create({
      userId: property.ownerId,
      title: 'New Visit Request 📅',
      message: `${req.user.name} requested a visit to "${property.title}" on ${new Date(requestedDate).toLocaleDateString()} (${requestedTime}).`,
      type: 'appointment',
      relatedEntityId: appointment._id,
    });

    res.status(201).json({
      success: true,
      message: 'Visit request submitted! The owner will review and confirm your slot.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student's Visit Appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Student)
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ studentId: req.user._id })
      .populate('propertyId', 'title location coverImage monthlyRent')
      .populate('ownerId', 'name phone email')
      .sort({ requestedDate: 1, createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Visit Appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (Student)
const cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    }).populate('propertyId', 'title');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by student';
    await appointment.save();

    // Notify owner
    await Notification.create({
      userId: appointment.ownerId,
      title: 'Visit Cancelled',
      message: `The visit request for "${appointment.propertyId?.title}" was cancelled by the student.`,
      type: 'appointment',
      relatedEntityId: appointment._id,
    });

    res.json({
      success: true,
      message: 'Visit appointment has been cancelled.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept Rescheduled Visit
// @route   PATCH /api/appointments/:id/accept-reschedule
// @access  Private (Student)
const acceptReschedule = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      studentId: req.user._id,
      status: 'rescheduled',
    }).populate('propertyId', 'title');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rescheduled appointment not found.' });
    }

    appointment.requestedDate = appointment.proposedDate;
    appointment.requestedTime = appointment.proposedTime;
    appointment.status = 'confirmed';
    await appointment.save();

    // Notify owner
    await Notification.create({
      userId: appointment.ownerId,
      title: 'Reschedule Accepted',
      message: `Student agreed to the proposed reschedule for "${appointment.propertyId?.title}". Visit is now confirmed.`,
      type: 'appointment',
      relatedEntityId: appointment._id,
    });

    res.json({
      success: true,
      message: 'Rescheduled time accepted! Your visit is now confirmed.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Favourites
// @route   GET /api/favourites
// @access  Private (Student)
const getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ studentId: req.user._id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    const validFavourites = favourites
      .filter((fav) => fav.propertyId && fav.propertyId.approvalStatus === 'approved')
      .map((fav) => fav.propertyId);

    res.json({
      success: true,
      favourites: validFavourites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add property to favourites
// @route   POST /api/favourites/:propertyId
// @access  Private (Student)
const addFavourite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existing = await Favourite.findOne({
      studentId: req.user._id,
      propertyId,
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Property is already in your saved list.',
        isFavorited: true,
      });
    }

    await Favourite.create({
      studentId: req.user._id,
      propertyId,
    });

    res.status(201).json({
      success: true,
      message: 'Saved to your favourites.',
      isFavorited: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove property from favourites
// @route   DELETE /api/favourites/:propertyId
// @access  Private (Student)
const removeFavourite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await Favourite.findOneAndDelete({
      studentId: req.user._id,
      propertyId,
    });

    res.json({
      success: true,
      message: 'Removed from your saved list.',
      isFavorited: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
