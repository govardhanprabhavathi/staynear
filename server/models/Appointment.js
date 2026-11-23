const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    requestedDate: {
      type: Date,
      required: [true, 'Please select a date for your visit'],
    },
    requestedTime: {
      type: String,
      required: [true, 'Please select a preferred time slot'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [400, 'Notes cannot exceed 400 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'rescheduled', 'cancelled', 'completed'],
      default: 'pending',
    },
    ownerResponse: {
      type: String,
      default: '',
    },
    proposedDate: {
      type: Date,
      default: null,
    },
    proposedTime: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ studentId: 1, status: 1 });
appointmentSchema.index({ ownerId: 1, status: 1 });
appointmentSchema.index({ propertyId: 1, requestedDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
