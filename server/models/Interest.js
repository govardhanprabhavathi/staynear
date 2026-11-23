const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide an inquiry message or question'],
      trim: true,
      maxlength: [600, 'Message cannot exceed 600 characters'],
    },
    contactPreference: {
      type: String,
      enum: ['phone', 'email', 'platform'],
      default: 'phone',
    },
    studentPhone: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'closed'],
      default: 'pending',
    },
    ownerNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interestSchema.index({ studentId: 1, propertyId: 1 });
interestSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('Interest', interestSchema);
