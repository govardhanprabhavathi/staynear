const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting for Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve PUBLIC property images statically
// CRITICAL SECURITY RULE: private_documents is NOT exposed statically!
app.use('/uploads/properties', express.static(path.join(__dirname, 'uploads/properties')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/student', studentRoutes);
// Direct aliases matching API design specs:
app.use('/api/interests', studentRoutes);
app.use('/api/appointments', studentRoutes);
app.use('/api/favourites', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'StayNear API',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if running fresh database (e.g. in-memory or empty Atlas DB)
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Empty database detected. Seeding initial StayNear demo listings and accounts...');
      const Property = require('./models/Property');
      const OwnerApplication = require('./models/OwnerApplication');
      const Interest = require('./models/Interest');
      const Appointment = require('./models/Appointment');
      const Favourite = require('./models/Favourite');
      const Notification = require('./models/Notification');

      const adminPasswordHash = await User.hashPassword('Admin@12345');
      const ownerPasswordHash = await User.hashPassword('Owner@12345');
      const studentPasswordHash = await User.hashPassword('Student@12345');

      const admin = await User.create({
        name: 'StayNear Admin',
        email: 'admin@staynear.com',
        phone: '+91 80000 00001',
        passwordHash: adminPasswordHash,
        role: 'admin',
        accountStatus: 'active',
        phoneVerified: true,
        emailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });

      const verifiedOwner = await User.create({
        name: 'Rajesh Sharma',
        email: 'owner@staynear.com',
        phone: '+91 98450 12345',
        passwordHash: ownerPasswordHash,
        role: 'owner',
        accountStatus: 'active',
        phoneVerified: true,
        emailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      });

      const pendingOwner = await User.create({
        name: 'Vikram Reddy',
        email: 'newowner@staynear.com',
        phone: '+91 98765 43210',
        passwordHash: ownerPasswordHash,
        role: 'owner',
        accountStatus: 'active',
        phoneVerified: true,
        emailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      });

      const student = await User.create({
        name: 'Aarav Mehta',
        email: 'student@staynear.com',
        phone: '+91 91234 56789',
        passwordHash: studentPasswordHash,
        role: 'student',
        accountStatus: 'active',
        phoneVerified: true,
        emailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        preferredLocality: 'Christ University / Koramangala',
        budget: 16000,
        accommodationPreference: 'Boys PG',
      });

      await OwnerApplication.create({
        userId: verifiedOwner._id,
        businessName: 'Sharma Living Spaces & Residences',
        identityInformation: { idType: 'Aadhaar', idNumber: 'XXXX-XXXX-8921' },
        identityDocumentReference: 'doc-sample-aadhaar-rajesh.pdf',
        propertyOwnershipProofReference: 'doc-sample-khata-certificate.pdf',
        phoneVerificationStatus: 'verified',
        reviewStatus: 'approved',
        adminNotes: 'Government identity verified against national database. Property tax khata verified for SG Palya premises.',
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      });

      await OwnerApplication.create({
        userId: pendingOwner._id,
        businessName: 'Reddy Urban Co-Living Solutions',
        identityInformation: { idType: 'PAN', idNumber: 'ABCDE1234F' },
        identityDocumentReference: 'doc-sample-pan-vikram.pdf',
        propertyOwnershipProofReference: 'doc-sample-lease-agreement.pdf',
        phoneVerificationStatus: 'verified',
        reviewStatus: 'pending',
        adminNotes: 'Pending review of commercial lease document for Koramangala 1st Block.',
      });

      const propertiesData = [
        {
          ownerId: verifiedOwner._id,
          title: 'Trends Living Spaces — SG Palya',
          description: 'Architect-designed student living curated for Christ University scholars. Located just 200 meters from Gate 1, featuring ergonomic study spaces, silent acoustic insulation, high-speed dual-fiber internet, and freshly cooked homely meals thrice daily.',
          accommodationType: 'Boys PG',
          monthlyRent: 14500,
          deposit: 20000,
          additionalCharges: 500,
          location: {
            address: '42, 2nd Cross, SG Palya Main Road',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '200m from Christ University Gate 1',
            distanceToCampus: '200m',
            coordinates: { lat: 12.9348, lng: 77.6074 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner', 'Weekend Lunch'],
            description: 'Hygienic North & South Indian buffet, rotating weekend non-veg special.',
          },
          amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom', 'Daily Housekeeping', 'RO Drinking Water', 'Washing Machine', 'CCTV Security', 'Study Desk', 'Geyser'],
          houseRules: ['Entry gate access until 10:30 PM', 'Visitors allowed in ground floor cafeteria only', 'Quiet hours strictly after 11:00 PM'],
          coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          ],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          isSponsored: true,
          sponsoredAt: new Date(),
          viewsCount: 342,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Pezzles — Luxury Student Living',
          description: 'Contemporary, design-forward co-living community offering private and dual-occupancy studios for students and executives. Includes co-working lounge, rooftop screening terrace, pool table, and high-speed multi-gigabit connectivity.',
          accommodationType: 'Co-living',
          monthlyRent: 17500,
          deposit: 25000,
          additionalCharges: 750,
          location: {
            address: '15, Maruthi Layout, Tavarekere Main Road',
            locality: 'Tavarekere',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '380m from Forum Mall / Christ University',
            distanceToCampus: '380m',
            coordinates: { lat: 12.9298, lng: 77.6112 },
          },
          sharingType: 'Single',
          capacity: 1,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Contemporary multi-cuisine pantry and community kitchen.',
          },
          amenities: ['High-Speed WiFi', 'Air Conditioning', 'Power Backup', 'Gym Access', 'Recreation Lounge', 'Washing Machine', 'Attached Bathroom', 'Housekeeping'],
          houseRules: ['24/7 unrestricted secure access via smart keycard', 'Respectful quiet hours in co-working zones'],
          coverImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          ],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          isSponsored: true,
          sponsoredAt: new Date(),
          viewsCount: 512,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Singapore PG — SG Palya Gate 1',
          description: 'Located right opposite Christ University Main Gate, Singapore PG provides premier convenience for students who want zero transit time. Featuring spacious shared rooms, attached washrooms, continuous power backup, and authentic homely meals.',
          accommodationType: 'Boys PG',
          monthlyRent: 12500,
          deposit: 18000,
          additionalCharges: 0,
          location: {
            address: '8, Main Road, SG Palya',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '150m from Christ University Main Gate',
            distanceToCampus: '150m',
            coordinates: { lat: 12.9351, lng: 77.6071 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
            description: 'Delicious South and North Indian meals with Sunday feast.',
          },
          amenities: ['High-Speed WiFi', 'Biometric Entry', 'Attached Bathroom', 'Power Backup', 'Daily Housekeeping', 'RO Drinking Water'],
          houseRules: ['Main gate closes at 10:30 PM', 'Smoking and alcohol strictly prohibited'],
          coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          viewsCount: 420,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Shivam Living Spaces — SG Palya 2nd Cross',
          description: 'A quiet, modern student haven 280 meters from Christ University campus. Ergonomic study desks, high-speed fiber internet, private lockers, and round-the-clock security.',
          accommodationType: 'Boys PG',
          monthlyRent: 15000,
          deposit: 22000,
          additionalCharges: 400,
          location: {
            address: '18, 2nd Cross, Venkateshwara Layout, SG Palya',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '280m from Christ University',
            distanceToCampus: '280m',
            coordinates: { lat: 12.9344, lng: 77.6080 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Nutritious vegetarian and non-vegetarian food cooked in hygienic kitchen.',
          },
          amenities: ['High-Speed WiFi', 'Attached Bathroom', 'Power Backup', 'Washing Machine', 'Housekeeping', 'CCTV Security'],
          houseRules: ['Entry access until 10:30 PM', 'Quiet hours in study rooms'],
          coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          viewsCount: 310,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Livoza — Premium Co-living Stays',
          description: 'Curated boutique suites for students and young tech professionals in Koramangala 1st Block, just 600m from Christ campus. Scandinavian minimalist interiors, rooftop terrace, gym, and private study bays.',
          accommodationType: 'Co-living',
          monthlyRent: 19000,
          deposit: 30000,
          additionalCharges: 0,
          location: {
            address: '77, 4th Main, 1st Block Koramangala',
            locality: 'Koramangala',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560034',
            landmark: 'Near Christ Campus Link, 600m walk',
            distanceToCampus: '600m',
            coordinates: { lat: 12.9285, lng: 77.6250 },
          },
          sharingType: 'Single',
          capacity: 1,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Chef-prepared wholesome meals with organic ingredients.',
          },
          amenities: ['Air Conditioning', 'Gigabit WiFi', 'Gym Access', 'Attached Bathroom', 'Housekeeping', 'Biometric Entry'],
          houseRules: ['Keyless 24/7 entry', 'Visitors permitted in ground floor lounge'],
          coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Filling Fast',
          approvalStatus: 'approved',
          featured: true,
          isSponsored: true,
          sponsoredAt: new Date(),
          viewsCount: 480,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Bellave Boys and Girls PG — SG Palya',
          description: 'A welcoming, well-managed PG establishment offering dedicated wings for boys and girls with strict 24/7 security. Just 220m from Christ Gate 1 with top hygiene standards and friendly staff.',
          accommodationType: 'Boys PG',
          monthlyRent: 13500,
          deposit: 18000,
          additionalCharges: 0,
          location: {
            address: '29, 1st Cross, SG Palya Main Road',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '220m from Christ University Gate 1',
            distanceToCampus: '220m',
            coordinates: { lat: 12.9347, lng: 77.6077 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
            description: 'South & North Indian meals prepared fresh daily.',
          },
          amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom', 'CCTV Security', 'Housekeeping', 'RO Drinking Water'],
          houseRules: ['Entry gate closes at 10:15 PM', 'Separate entry for boys and girls sections'],
          coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          viewsCount: 390,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Zendal Serenity Luxury Living — Koramangala',
          description: 'Ultra-luxurious student suites designed for peaceful academics and comfort. Acoustic glass, designer furniture, high-speed fiber, and daily professional housekeeping.',
          accommodationType: 'Co-living',
          monthlyRent: 20000,
          deposit: 30000,
          additionalCharges: 500,
          location: {
            address: '102, 5th Cross, Koramangala 1st Block',
            locality: 'Koramangala',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560034',
            landmark: '500m to Christ University Campus',
            distanceToCampus: '500m',
            coordinates: { lat: 12.9290, lng: 77.6260 },
          },
          sharingType: 'Single',
          capacity: 1,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Gourmet home-style meals with diet options.',
          },
          amenities: ['Air Conditioning', 'High-Speed WiFi', 'Power Backup', 'Attached Balcony', 'Daily Housekeeping', 'Gym Access'],
          houseRules: ['Smart card access', 'No loud parties after 11:00 PM'],
          coverImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          isSponsored: true,
          sponsoredAt: new Date(),
          viewsCount: 360,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Mirai by Mayos Homes — Bhavani Nagar',
          description: 'Contemporary student residence nestled in Bhavani Nagar, a peaceful 350m walk from Christ Campus Gate 2. Curated study lounges, fast WiFi, and freshly prepared hot meals.',
          accommodationType: 'Co-living',
          monthlyRent: 16000,
          deposit: 24000,
          additionalCharges: 0,
          location: {
            address: '14, Bhavani Nagar Main Road',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '350m from Christ University Gate 2',
            distanceToCampus: '350m',
            coordinates: { lat: 12.9338, lng: 77.6088 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Nutritious meals prepared under hygienic supervision.',
          },
          amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom', 'Washing Machine', 'Housekeeping'],
          houseRules: ['Entry access until 10:30 PM', 'No smoking permitted'],
          coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          viewsCount: 275,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Preva Enclave Boys PG — SG Palya',
          description: 'Comfortable, well-maintained accommodation for male students. 300m walking distance to Christ classes, with uninterrupted power backup and high-speed internet.',
          accommodationType: 'Boys PG',
          monthlyRent: 13000,
          deposit: 18000,
          additionalCharges: 300,
          location: {
            address: '55, SG Palya Main Road',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '300m to Christ University Gate 1',
            distanceToCampus: '300m',
            coordinates: { lat: 12.9345, lng: 77.6075 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'South and North Indian wholesome menu.',
          },
          amenities: ['High-Speed WiFi', 'Attached Bathroom', 'RO Drinking Water', 'Power Backup', 'Housekeeping'],
          houseRules: ['Curfew 10:30 PM', 'Visitors allowed in lobby only'],
          coverImage: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: false,
          viewsCount: 195,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Fly Homes — Tavarekere Hub',
          description: 'Spacious co-living residence for students and tech interns. Near Tavarekere Forum corridor with easy bus connectivity, gaming lounge, and community dinners.',
          accommodationType: 'Co-living',
          monthlyRent: 15500,
          deposit: 20000,
          additionalCharges: 0,
          location: {
            address: '62, Tavarekere Main Road',
            locality: 'Tavarekere',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '450m from Christ University',
            distanceToCampus: '450m',
            coordinates: { lat: 12.9302, lng: 77.6120 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Daily buffet meals with special weekend dishes.',
          },
          amenities: ['High-Speed WiFi', 'Air Conditioning', 'Power Backup', 'Gym Access', 'Housekeeping'],
          houseRules: ['Digital lock entry', 'Quiet hours after 11:00 PM'],
          coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: false,
          viewsCount: 230,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'SN Comforts Boys PG — Christ Gate 1',
          description: 'Premier student PG situated a mere 180m from Christ Gate 1. Features personal study pods, high-speed WiFi, attached bathrooms, and delicious three meals daily.',
          accommodationType: 'Boys PG',
          monthlyRent: 14000,
          deposit: 20000,
          additionalCharges: 0,
          location: {
            address: '3, Gate 1 Lane, SG Palya',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '180m to Christ University Gate 1',
            distanceToCampus: '180m',
            coordinates: { lat: 12.9349, lng: 77.6072 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
            description: 'Homely South and North Indian food prepared fresh.',
          },
          amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom', 'Daily Housekeeping', 'CCTV Security'],
          houseRules: ['Gate closes at 10:30 PM', 'No alcohol or smoking allowed'],
          coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: true,
          viewsCount: 310,
        },
        {
          ownerId: verifiedOwner._id,
          title: 'Green View Executive Stay — Dairy Circle',
          description: 'Newly constructed executive PG adjacent to Christ University and Dairy Circle link. Large ventilated rooms with calm surroundings, study desks, and modern bathrooms.',
          accommodationType: 'Boys PG',
          monthlyRent: 13000,
          deposit: 18000,
          additionalCharges: 0,
          location: {
            address: '19, Dairy Circle Road, SG Palya Link',
            locality: 'SG Palya',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560029',
            landmark: '520m to Christ University Campus',
            distanceToCampus: '520m',
            coordinates: { lat: 12.9320, lng: 77.6040 },
          },
          sharingType: 'Double',
          capacity: 2,
          foodAvailability: {
            included: true,
            mealTypes: ['Breakfast', 'Dinner'],
            description: 'Hygienic vegetarian & non-vegetarian food.',
          },
          amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom', 'Housekeeping'],
          houseRules: ['Entry closes at 10:30 PM'],
          coverImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
          availability: 'Available Now',
          approvalStatus: 'approved',
          featured: false,
          viewsCount: 160,
        },
      ];

      const seededProperties = await Property.insertMany(propertiesData);
      const firstProp = seededProperties[0];
      const secondProp = seededProperties[1];

      await Favourite.create({
        studentId: student._id,
        propertyId: firstProp._id,
      });

      await Interest.create({
        studentId: student._id,
        propertyId: firstProp._id,
        ownerId: verifiedOwner._id,
        message: 'Hello, I am a 2nd year MCA student at Christ University. Is the double-sharing room available starting next month?',
        contactPreference: 'phone',
        studentPhone: student.phone,
        studentEmail: student.email,
        status: 'pending',
      });

      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() + 2);

      await Appointment.create({
        studentId: student._id,
        propertyId: firstProp._id,
        ownerId: verifiedOwner._id,
        requestedDate: visitDate,
        requestedTime: '04:00 PM - 05:30 PM',
        status: 'confirmed',
        ownerResponse: 'Confirmed! You are welcome to visit. Please call on arrival at Gate 1.',
        notes: 'Coming along with my roommate to inspect the double sharing room.',
      });

      const pendingVisitDate = new Date();
      pendingVisitDate.setDate(pendingVisitDate.getDate() + 4);

      await Appointment.create({
        studentId: student._id,
        propertyId: secondProp._id,
        ownerId: verifiedOwner._id,
        requestedDate: pendingVisitDate,
        requestedTime: '11:00 AM - 12:30 PM',
        status: 'pending',
        notes: 'Looking to check the study desks and WiFi speed in person.',
      });

      await Notification.create([
        {
          userId: student._id,
          title: 'Visit Confirmed! 🎉',
          message: `Your visit to "${firstProp.title}" on ${visitDate.toLocaleDateString()} at 04:00 PM - 05:30 PM has been confirmed.`,
          type: 'appointment',
        },
        {
          userId: verifiedOwner._id,
          title: 'New Student Enquiry',
          message: `${student.name} expressed interest in your property "${firstProp.title}".`,
          type: 'interest',
        },
        {
          userId: admin._id,
          title: 'New Listing Pending Review',
          message: 'A new property "Green View Executive Stay" requires moderation.',
          type: 'approval',
        },
      ]);
      console.log('✅ Auto-seed completed successfully!');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 StayNear API Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server if called directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
