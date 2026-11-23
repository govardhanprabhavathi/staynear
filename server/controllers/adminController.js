const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const OwnerApplication = require('../models/OwnerApplication');
const Property = require('../models/Property');
const Interest = require('../models/Interest');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { privateDocDir } = require('../middleware/upload');

// @desc    Get Admin Dashboard High-Level Metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalOwners,
      pendingOwnerApplications,
      approvedOwners,
      totalProperties,
      pendingPropertyApprovals,
      activeListings,
      totalEnquiries,
      upcomingVisits,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'owner' }),
      OwnerApplication.countDocuments({ reviewStatus: 'pending' }),
      OwnerApplication.countDocuments({ reviewStatus: 'approved' }),
      Property.countDocuments(),
      Property.countDocuments({ approvalStatus: 'pending' }),
      Property.countDocuments({ approvalStatus: 'approved' }),
      Interest.countDocuments(),
      Appointment.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      metrics: {
        totalStudents,
        totalOwners,
        pendingOwnerApplications,
        approvedOwners,
        totalProperties,
        pendingPropertyApprovals,
        activeListings,
        totalEnquiries,
        upcomingVisits,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Owner Applications (Pending or All)
// @route   GET /api/admin/owners
// @access  Private (Admin)
const getOwnerApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.reviewStatus = status;
    }

    const applications = await OwnerApplication.find(query)
      .populate('userId', 'name email phone accountStatus createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure Private Verification Document Stream
// @route   GET /api/admin/documents/:filename
// @access  Private (Admin only)
const getPrivateDocument = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(privateDocDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Requested document reference not found in secure storage.',
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Review Owner Verification Application (Approve / Reject / Request Info)
// @route   PATCH /api/admin/owners/:id/review
// @access  Private (Admin)
const reviewOwnerApplication = async (req, res, next) => {
  try {
    const { status, rejectionReason, adminNotes } = req.body;

    if (!['approved', 'rejected', 'info_required'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or info_required.',
      });
    }

    const application = await OwnerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.reviewStatus = status;
    application.adminNotes = adminNotes || application.adminNotes;
    application.rejectionReason = rejectionReason || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Create Notification for the Owner
    let notifTitle = 'Owner Application Status Updated';
    let notifMsg = `Your PG Owner verification application has been marked as ${status}.`;

    if (status === 'approved') {
      notifTitle = 'Verification Approved! 🌟';
      notifMsg = 'Congratulations! Your PG Owner account is now verified. You can now publish your accommodations on StayNear.';
    } else if (status === 'rejected') {
      notifTitle = 'Verification Application Rejected';
      notifMsg = `Your application was rejected. Reason: ${rejectionReason || 'Documents did not meet criteria.'}`;
    } else if (status === 'info_required') {
      notifTitle = 'Additional Information Required';
      notifMsg = `Our moderation team requires more details or clearer document copies: ${adminNotes || 'Please check your application portal.'}`;
    }

    await Notification.create({
      userId: application.userId,
      title: notifTitle,
      message: notifMsg,
      type: 'approval',
      relatedEntityId: application._id,
    });

    res.json({
      success: true,
      message: `Owner application has been successfully marked as ${status}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Properties for moderation (Pending or Filtered)
// @route   GET /api/admin/properties
// @access  Private (Admin)
const getAdminProperties = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.approvalStatus = status;
    }

    const properties = await Property.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review Property Listing (Approve / Reject)
// @route   PATCH /api/admin/properties/:id/review
// @access  Private (Admin)
const reviewProperty = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected.',
      });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    property.approvalStatus = status;
    if (status === 'rejected') {
      property.rejectionReason = rejectionReason || 'Listing does not comply with StayNear standards.';
    } else {
      property.rejectionReason = '';
    }
    await property.save();

    // Notify owner
    const notifTitle = status === 'approved' ? 'Property Listing Approved! 🏠' : 'Property Listing Declined';
    const notifMsg =
      status === 'approved'
        ? `Your property "${property.title}" has been approved and is now live on StayNear!`
        : `Your property "${property.title}" was declined. Reason: ${property.rejectionReason}`;

    await Notification.create({
      userId: property.ownerId,
      title: notifTitle,
      message: notifMsg,
      type: 'approval',
      relatedEntityId: property._id,
    });

    res.json({
      success: true,
      message: `Property listing successfully marked as ${status}.`,
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Platform Users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Account Status (Suspend / Reactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;

    if (!['active', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
    }

    // Prevent suspending oneself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User account has been marked as ${accountStatus}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Moderation Reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email phone')
      .populate('propertyId', 'title location monthlyRent coverImage')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Report Status
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    res.json({
      success: true,
      message: 'Report status updated.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
