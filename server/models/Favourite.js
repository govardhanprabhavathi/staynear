const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favourites per student
favouriteSchema.index({ studentId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
