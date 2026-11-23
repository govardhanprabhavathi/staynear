const mongoose = require('mongoose');

const ownerApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One application per owner
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    identityInformation: {
      idType: {
        type: String,
        enum: ['Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License'],
        required: true,
      },
      idNumber: {
        type: String,
        required: true,
        trim: true,
      },
    },
    // Reference/filename of document stored privately on server/cloud
    identityDocumentReference: {
      type: String,
      required: [true, 'Identity document reference is required'],
    },
    // Reference/filename of proof of ownership or authorization
    propertyOwnershipProofReference: {
      type: String,
      required: [true, 'Property ownership or management authorization document is required'],
    },
    phoneVerificationStatus: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'verified', // Simulation/verified
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'info_required'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
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

module.exports = mongoose.model('OwnerApplication', ownerApplicationSchema);
