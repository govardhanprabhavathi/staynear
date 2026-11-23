const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OwnerApplication = require('../models/OwnerApplication');
const { JWT_SECRET } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user (Student or PG Owner)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Role can be student or owner. Admin cannot self-register.
    const userRole = role === 'owner' ? 'owner' : 'student';

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: userRole,
      phoneVerified: true, // Auto-verified for seamless UX / prototype demo
      emailVerified: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        preferredLocality: user.preferredLocality,
        budget: user.budget,
        accommodationPreference: user.accommodationPreference,
      },
      message: 'Account created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    // Generic error message for security (prevents account enumeration)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by administration.',
      });
    }

    const token = generateToken(user._id);

    // If owner, check application status
    let ownerApplication = null;
    if (user.role === 'owner') {
      ownerApplication = await OwnerApplication.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        preferredLocality: user.preferredLocality,
        budget: user.budget,
        accommodationPreference: user.accommodationPreference,
        ownerApplication: ownerApplication
          ? {
              status: ownerApplication.reviewStatus,
              id: ownerApplication._id,
              rejectionReason: ownerApplication.rejectionReason,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user session
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let ownerApplication = null;

    if (user.role === 'owner') {
      ownerApplication = await OwnerApplication.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        preferredLocality: user.preferredLocality,
        budget: user.budget,
        accommodationPreference: user.accommodationPreference,
        ownerApplication: ownerApplication
          ? {
              status: ownerApplication.reviewStatus,
              id: ownerApplication._id,
              rejectionReason: ownerApplication.rejectionReason,
              businessName: ownerApplication.businessName,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredLocality, budget, accommodationPreference, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredLocality) user.preferredLocality = preferredLocality;
    if (budget) user.budget = Number(budget);
    if (accommodationPreference) user.accommodationPreference = accommodationPreference;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        preferredLocality: user.preferredLocality,
        budget: user.budget,
        accommodationPreference: user.accommodationPreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase() : '' });

    // Always return success message to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
};
