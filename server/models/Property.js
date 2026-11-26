const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed property description'],
    },
    accommodationType: {
      type: String,
      enum: ['Boys PG', 'Girls PG', 'Co-living'],
      required: [true, 'Please select an accommodation category'],
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Please specify monthly rent in INR'],
      min: [1000, 'Rent must be at least ₹1,000'],
    },
    deposit: {
      type: Number,
      default: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0, // e.g. maintenance / electricity
    },
    location: {
      address: { type: String, required: true },
      locality: { type: String, required: true, trim: true },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, default: '560029' },
      landmark: { type: String, default: 'Near Christ University' },
      distanceToCampus: { type: String, default: '500m' },
      coordinates: {
        lat: { type: Number, default: 12.9352 },
        lng: { type: Number, default: 77.6062 },
      },
    },
    sharingType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Four'],
      required: true,
      default: 'Double',
    },
    capacity: {
      type: Number,
      default: 2,
    },
    foodAvailability: {
      included: { type: Boolean, default: true },
      mealTypes: {
        type: [String],
        default: ['Breakfast', 'Dinner'],
      },
      description: {
        type: String,
        default: 'Hygienic North & South Indian meals included with weekend specials.',
      },
    },
    amenities: {
      type: [String],
      default: [
        'High-Speed WiFi',
        'Daily Housekeeping',
        'Attached Bathroom',
        'Power Backup',
        'RO Drinking Water',
        'Washing Machine',
        'CCTV Security',
      ],
    },
    houseRules: {
      type: [String],
      default: [
        'Main gate access until 10:30 PM',
        'Visitors permitted in ground floor lounge',
        'No smoking inside residential rooms',
        'Quiet hours after 11:00 PM for study',
      ],
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length > 0,
        'Please provide at least one photo for the accommodation',
      ],
    },
    coverImage: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      enum: ['Available Now', 'Filling Fast', 'Sold Out'],
      default: 'Available Now',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    sponsoredAt: {
      type: Date,
      default: null,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
propertySchema.index({ approvalStatus: 1, isSponsored: -1, createdAt: -1 });
propertySchema.index({ approvalStatus: 1, monthlyRent: 1 });
propertySchema.index({ 'location.locality': 1, accommodationType: 1 });
propertySchema.index({ title: 'text', description: 'text', 'location.locality': 'text' });

module.exports = mongoose.model('Property', propertySchema);
