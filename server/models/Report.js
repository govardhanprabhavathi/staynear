const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please select a reason for reporting this property'],
      enum: [
        'Inaccurate pricing or hidden charges',
        'Misleading photographs or description',
        'Owner unresponsive or unprofessional',
        'Property does not exist at location',
        'Safety or hygiene concerns',
        'Other violation of platform terms',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide details about your report'],
      maxlength: [800, 'Description cannot exceed 800 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
