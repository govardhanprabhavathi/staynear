const OwnerApplication = require('../models/OwnerApplication');
const Property = require('../models/Property');
const Interest = require('../models/Interest');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Submit PG Owner Verification Application
// @route   POST /api/owners/apply
// @access  Private (Owner)
const applyOwner = async (req, res, next) => {
  try {
    const {
      businessName,
      idType,
      idNumber,
      identityDocumentReference,
      propertyOwnershipProofReference,
    } = req.body;

    if (!idType || !idNumber || !identityDocumentReference || !propertyOwnershipProofReference) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ID type, ID number, identity document, and proof of property ownership.',
      });
    }

    let application = await OwnerApplication.findOne({ userId: req.user._id });

    if (application) {
      // If already submitted and under review or approved
      if (application.reviewStatus === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Your owner account has already been verified and approved.',
        });
      }

      // Re-apply or update
      application.businessName = businessName || application.businessName;
      application.identityInformation = { idType, idNumber };
      application.identityDocumentReference = identityDocumentReference;
      application.propertyOwnershipProofReference = propertyOwnershipProofReference;
      application.reviewStatus = 'pending';
      application.rejectionReason = '';
      await application.save();
    } else {
      application = await OwnerApplication.create({
        userId: req.user._id,
        businessName: businessName || '',
        identityInformation: { idType, idNumber },
        identityDocumentReference,
        propertyOwnershipProofReference,
        phoneVerificationStatus: 'verified',
        reviewStatus: 'pending',
      });
    }

    // Notify admins asynchronously
    await Notification.create({
      userId: req.user._id,
      title: 'Verification Submitted',
      message: 'Your PG Owner verification application has been submitted and is currently under review by our administration team.',
      type: 'approval',
      relatedEntityId: application._id,
    });

    res.status(201).json({
      success: true,
      message: 'Verification application submitted successfully. Verification takes 1-2 business days.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner Application Status
// @route   GET /api/owners/application-status
// @access  Private (Owner)
const getApplicationStatus = async (req, res, next) => {
  try {
    const application = await OwnerApplication.findOne({ userId: req.user._id });

    res.json({
      success: true,
      application: application || null,
      isApproved: application?.reviewStatus === 'approved',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner Dashboard Statistics
// @route   GET /api/owners/dashboard
// @access  Private (Owner)
const getOwnerDashboardMetrics = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [totalProperties, activeProperties, pendingApprovals] = await Promise.all([
      Property.countDocuments({ ownerId }),
      Property.countDocuments({ ownerId, approvalStatus: 'approved' }),
      Property.countDocuments({ ownerId, approvalStatus: 'pending' }),
    ]);

    const totalEnquiries = await Interest.countDocuments({ ownerId });
    const upcomingVisits = await Appointment.countDocuments({
      ownerId,
      status: { $in: ['pending', 'confirmed'] },
      requestedDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      success: true,
      metrics: {
        totalProperties,
        activeProperties,
        pendingApprovals,
        totalEnquiries,
        upcomingVisits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Owner's Properties
// @route   GET /api/owners/properties
// @access  Private (Owner)
const getOwnerProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Enquiries received by Owner
// @route   GET /api/owners/enquiries
// @access  Private (Owner)
const getOwnerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Interest.find({ ownerId: req.user._id })
      .populate('studentId', 'name email phone profileImage')
      .populate('propertyId', 'title location monthlyRent coverImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Enquiry status (responded / closed)
// @route   PATCH /api/owners/enquiries/:id/status
// @access  Private (Owner)
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, ownerNotes } = req.body;

    const enquiry = await Interest.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    if (status) enquiry.status = status;
    if (ownerNotes !== undefined) enquiry.ownerNotes = ownerNotes;
    await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner's visit requests
// @route   GET /api/owners/appointments
// @access  Private (Owner)
const getOwnerAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ ownerId: req.user._id })
      .populate('studentId', 'name email phone profileImage')
      .populate('propertyId', 'title location coverImage monthlyRent')
      .sort({ requestedDate: 1, createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Visit Request Status (Confirm, Reject, or Reschedule)
// @route   PATCH /api/owners/appointments/:id/status
// @access  Private (Owner)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, ownerResponse, proposedDate, proposedTime, cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).populate('propertyId', 'title');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Visit appointment not found.' });
    }

    if (status) appointment.status = status;
    if (ownerResponse) appointment.ownerResponse = ownerResponse;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    if (status === 'rescheduled') {
      if (!proposedDate || !proposedTime) {
        return res.status(400).json({
          success: false,
          message: 'Please propose both an alternate date and time slot for the rescheduled visit.',
        });
      }
      appointment.proposedDate = proposedDate;
      appointment.proposedTime = proposedTime;
    }

    await appointment.save();

    // Create notification for student
    let notifTitle = 'Visit Request Updated';
    let notifMessage = `The owner responded to your visit request for "${appointment.propertyId?.title || 'the accommodation'}": Status changed to ${status}.`;

    if (status === 'confirmed') {
      notifTitle = 'Visit Confirmed! 🎉';
      notifMessage = `Your visit for "${appointment.propertyId?.title}" has been confirmed by the owner.`;
    } else if (status === 'rescheduled') {
      notifTitle = 'Visit Reschedule Proposed';
      notifMessage = `The owner suggested an alternate time (${proposedTime} on ${new Date(proposedDate).toLocaleDateString()}) for "${appointment.propertyId?.title}". Please review it in your dashboard.`;
    } else if (status === 'rejected') {
      notifTitle = 'Visit Request Declined';
      notifMessage = `Your visit request for "${appointment.propertyId?.title}" could not be accommodated. ${cancellationReason ? `Reason: ${cancellationReason}` : ''}`;
    }

    await Notification.create({
      userId: appointment.studentId,
      title: notifTitle,
      message: notifMessage,
      type: 'appointment',
      relatedEntityId: appointment._id,
    });

    res.json({
      success: true,
      message: `Visit appointment marked as ${status}.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyOwner,
  getApplicationStatus,
  getOwnerDashboardMetrics,
  getOwnerProperties,
  getOwnerEnquiries,
  updateEnquiryStatus,
  getOwnerAppointments,
  updateAppointmentStatus,
};
