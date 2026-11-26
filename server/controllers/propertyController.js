const Property = require('../models/Property');
const OwnerApplication = require('../models/OwnerApplication');
const Report = require('../models/Report');
const Favourite = require('../models/Favourite');

// @desc    Get all public approved properties with filtering, searching, and sorting
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      locality,
      category,
      minRent,
      maxRent,
      sharing,
      food,
      amenities,
      availability,
      sponsored,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = {
      approvalStatus: 'approved', // Strictly approved only for public
    };

    if (sponsored === 'true') {
      query.isSponsored = true;
    }

    // Keyword search across title, description, and locality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.locality': searchRegex },
        { 'location.address': searchRegex },
        { 'location.landmark': searchRegex },
      ];
    }

    // Locality filter
    if (locality && locality !== 'all') {
      query['location.locality'] = new RegExp(locality.trim(), 'i');
    }

    // Accommodation Category (Boys PG, Girls PG, Co-living)
    if (category && category !== 'all') {
      query.accommodationType = category;
    }

    // Rent Range
    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = Number(minRent);
      if (maxRent) query.monthlyRent.$lte = Number(maxRent);
    }

    // Sharing type
    if (sharing && sharing !== 'all') {
      query.sharingType = sharing;
    }

    // Food availability
    if (food === 'true') {
      query['foodAvailability.included'] = true;
    }

    // Amenities (comma separated)
    if (amenities) {
      const amenitiesList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Availability
    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    // Sorting — sponsored PGs roll first on default/relevance/sponsored views
    let sortOption = { isSponsored: -1, sponsoredAt: -1, createdAt: -1 }; // Default: sponsored first, then newest
    if (sort === 'rent_asc') {
      sortOption = { monthlyRent: 1 };
    } else if (sort === 'rent_desc') {
      sortOption = { monthlyRent: -1 };
    } else if (sort === 'relevance' || sort === 'views') {
      sortOption = { isSponsored: -1, sponsoredAt: -1, viewsCount: -1, createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('ownerId', 'name phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // If user is logged in, attach isFavorited flag
    let userFavourites = new Set();
    if (req.user) {
      const favs = await Favourite.find({ studentId: req.user._id });
      favs.forEach((f) => userFavourites.add(f.propertyId.toString()));
    }

    const propertiesWithFav = properties.map((prop) => {
      const obj = prop.toObject();
      obj.isFavorited = userFavourites.has(prop._id.toString());
      return obj;
    });

    res.json({
      success: true,
      count: propertiesWithFav.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      properties: propertiesWithFav,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured properties for landing page
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res, next) => {
  try {
    const featured = await Property.find({
      approvalStatus: 'approved',
      $or: [{ featured: true }, { viewsCount: { $gt: 0 } }],
    })
      .populate('ownerId', 'name phone')
      .limit(6);

    // Fallback if none flagged featured: get newest approved
    let results = featured;
    if (results.length === 0) {
      results = await Property.find({ approvalStatus: 'approved' })
        .populate('ownerId', 'name phone')
        .sort({ createdAt: -1 })
        .limit(6);
    }

    res.json({
      success: true,
      properties: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property detail
// @route   GET /api/properties/:id
// @access  Public (with optional auth)
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'ownerId',
      'name phone email createdAt'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Security check: Only approved properties are visible publicly.
    // Unapproved properties can only be viewed by the owner or an admin.
    if (property.approvalStatus !== 'approved') {
      const isOwner = req.user && req.user._id.toString() === property.ownerId._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Property is not published or currently under review.',
        });
      }
    }

    // Increment view count asynchronously
    Property.findByIdAndUpdate(property._id, { $inc: { viewsCount: 1 } }).exec();

    // Check if favorited by current user
    let isFavorited = false;
    if (req.user) {
      const fav = await Favourite.findOne({
        studentId: req.user._id,
        propertyId: property._id,
      });
      isFavorited = !!fav;
    }

    // Check if owner is verified
    const ownerApp = await OwnerApplication.findOne({
      userId: property.ownerId._id,
      reviewStatus: 'approved',
    });
    const isOwnerVerified = !!ownerApp;

    const propertyObj = property.toObject();
    propertyObj.isFavorited = isFavorited;
    propertyObj.isOwnerVerified = isOwnerVerified;

    res.json({
      success: true,
      property: propertyObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
const getSimilarProperties = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const similar = await Property.find({
      _id: { $ne: property._id },
      approvalStatus: 'approved',
      $or: [
        { accommodationType: property.accommodationType },
        { 'location.locality': property.location.locality },
      ],
    })
      .populate('ownerId', 'name phone')
      .limit(3);

    res.json({
      success: true,
      properties: similar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new property listing (Owner only)
// @route   POST /api/properties
// @access  Private (Owner)
const createProperty = async (req, res, next) => {
  try {
    // 1. Verify owner application is approved by admin
    const ownerApplication = await OwnerApplication.findOne({
      userId: req.user._id,
      reviewStatus: 'approved',
    });

    if (!ownerApplication) {
      return res.status(403).json({
        success: false,
        message:
          'Your owner application must be approved by StayNear administration before you can publish properties.',
      });
    }

    const {
      title,
      description,
      accommodationType,
      monthlyRent,
      deposit,
      additionalCharges,
      location,
      sharingType,
      capacity,
      foodAvailability,
      amenities,
      houseRules,
      images,
      coverImage,
      isSponsored,
    } = req.body;

    if (!title || !description || !accommodationType || !monthlyRent || !location || !location.address || !location.locality) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields (title, description, accommodation category, rent, and address).',
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one property photograph.',
      });
    }

    const newProperty = await Property.create({
      ownerId: req.user._id,
      title,
      description,
      accommodationType,
      monthlyRent: Number(monthlyRent),
      deposit: Number(deposit) || 0,
      additionalCharges: Number(additionalCharges) || 0,
      location,
      sharingType: sharingType || 'Double',
      capacity: Number(capacity) || 2,
      foodAvailability: foodAvailability || { included: true, mealTypes: ['Breakfast', 'Dinner'], description: 'Food provided' },
      amenities: amenities || [],
      houseRules: houseRules || [],
      images,
      coverImage: coverImage || images[0],
      isSponsored: Boolean(isSponsored),
      sponsoredAt: isSponsored ? new Date() : null,
      availability: 'Available Now',
      approvalStatus: 'pending', // Strictly pending review
    });

    res.status(201).json({
      success: true,
      message: 'Property listing submitted successfully! It is now pending administrator review.',
      property: newProperty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner or Admin)
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Verify ownership or admin role
    const isOwner = property.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this property.',
      });
    }

    const updatePayload = { ...req.body };
    if (typeof req.body.isSponsored === 'boolean') {
      updatePayload.sponsoredAt = req.body.isSponsored ? new Date() : null;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Property updated successfully.',
      property: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner or Admin)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = property.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property.',
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a property
// @route   POST /api/properties/:id/report
// @access  Private (Student/User)
const reportProperty = async (req, res, next) => {
  try {
    const { reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason and detailed description for your report.',
      });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      propertyId: property._id,
      reason,
      description,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. Our trust & safety team will review this listing.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  reportProperty,
};
