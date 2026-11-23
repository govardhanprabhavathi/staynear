const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const OwnerApplication = require('../models/OwnerApplication');
const Property = require('../models/Property');
const Interest = require('../models/Interest');
const Appointment = require('../models/Appointment');
const Favourite = require('../models/Favourite');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    console.log('🌱 Starting StayNear database seeding...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      OwnerApplication.deleteMany(),
      Property.deleteMany(),
      Interest.deleteMany(),
      Appointment.deleteMany(),
      Favourite.deleteMany(),
      Notification.deleteMany(),
      Report.deleteMany(),
    ]);

    console.log('🧹 Purged existing database collections.');

    // 1. Create Core Users
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

    console.log('👤 Users created successfully.');

    // 2. Owner Applications
    // Verified Owner Application (Approved)
    await OwnerApplication.create({
      userId: verifiedOwner._id,
      businessName: 'Sharma Living Spaces & Residences',
      identityInformation: {
        idType: 'Aadhaar',
        idNumber: 'XXXX-XXXX-8921',
      },
      identityDocumentReference: 'doc-sample-aadhaar-rajesh.pdf',
      propertyOwnershipProofReference: 'doc-sample-khata-certificate.pdf',
      phoneVerificationStatus: 'verified',
      reviewStatus: 'approved',
      adminNotes: 'Government identity verified against national database. Property tax khata verified for SG Palya premises.',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    });

    // Pending Owner Application (For Admin Review testing)
    const pendingApp = await OwnerApplication.create({
      userId: pendingOwner._id,
      businessName: 'Reddy Urban Co-Living Solutions',
      identityInformation: {
        idType: 'PAN',
        idNumber: 'ABCDE1234F',
      },
      identityDocumentReference: 'doc-sample-pan-vikram.pdf',
      propertyOwnershipProofReference: 'doc-sample-lease-agreement.pdf',
      phoneVerificationStatus: 'verified',
      reviewStatus: 'pending',
      adminNotes: 'Pending review of commercial lease document for Koramangala 1st Block.',
    });

    console.log('📄 Owner Applications seeded.');

    // 3. Properties around Christ University & Bengaluru Hubs
    const propertiesData = [
      {
        ownerId: verifiedOwner._id,
        title: 'The Prestige Scholar Residency — SG Palya',
        description: 'Architect-designed student living specifically curated for Christ University scholars. Located just 350 meters from Gate 1, featuring ergonomic Herman Miller study spaces, silent acoustic insulation, high-speed dual-fiber internet, and freshly cooked homely meals thrice daily.',
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
          landmark: '350m from Christ University Gate 1',
          distanceToCampus: '350m',
          coordinates: { lat: 12.9348, lng: 77.6074 },
        },
        sharingType: 'Double',
        capacity: 2,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Dinner', 'Weekend Lunch'],
          description: 'Hygienic North & South Indian buffet, rotating weekend non-veg special.',
        },
        amenities: [
          'High-Speed WiFi',
          'Power Backup',
          'Attached Bathroom',
          'Daily Housekeeping',
          'RO Drinking Water',
          'Washing Machine',
          'CCTV Security',
          'Study Desk',
          'Geyser',
        ],
        houseRules: [
          'Entry gate access until 10:30 PM',
          'Visitors allowed in ground floor cafeteria only',
          'Quiet hours strictly after 11:00 PM',
        ],
        coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Available Now',
        approvalStatus: 'approved',
        featured: true,
        viewsCount: 342,
      },
      {
        ownerId: verifiedOwner._id,
        title: 'Aura Comforts — Luxury Girls PG Koramangala',
        description: 'An elegant, peaceful sanctuary for female students and working executives in Koramangala 1st Block. High-security biometric entry, female warden on-premises 24/7, daily housekeeping, organic wholesome meals, and expansive sunlit balconies.',
        accommodationType: 'Girls PG',
        monthlyRent: 17500,
        deposit: 25000,
        additionalCharges: 0,
        location: {
          address: '88, 7th Main, 1st Block Koramangala',
          locality: 'Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560034',
          landmark: 'Opposite Wipro Park, 1.2km to Christ University',
          distanceToCampus: '1.2 km',
          coordinates: { lat: 12.9279, lng: 77.6271 },
        },
        sharingType: 'Single',
        capacity: 1,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
          description: 'Home-style 3-course organic meals curated by professional dietitians.',
        },
        amenities: [
          'High-Speed WiFi',
          'Air Conditioning',
          'Biometric Entry',
          'Attached Bathroom',
          'Daily Housekeeping',
          'Refrigerator',
          'Washing Machine',
          'Power Backup',
          'CCTV Security',
        ],
        houseRules: [
          'Main gate closes at 10:00 PM (Late pass available via app)',
          'Female guests permitted with advance notice',
          'No smoking or substance consumption',
        ],
        coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Filling Fast',
        approvalStatus: 'approved',
        featured: true,
        viewsCount: 512,
      },
      {
        ownerId: verifiedOwner._id,
        title: 'Nexus Studio Co-Living — Tavarekere',
        description: 'Modern, design-forward co-living community offering private and dual-occupancy studios for co-ed students and startup professionals. Includes co-working lounge, rooftop screening terrace, pool table, and high-speed multi-gigabit connectivity.',
        accommodationType: 'Co-living',
        monthlyRent: 19000,
        deposit: 30000,
        additionalCharges: 750,
        location: {
          address: '15, Maruthi Layout, Tavarekere Main Road',
          locality: 'Tavarekere',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560029',
          landmark: '600m from Forum Mall / Christ University',
          distanceToCampus: '600m',
          coordinates: { lat: 12.9298, lng: 77.6112 },
        },
        sharingType: 'Single',
        capacity: 1,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Dinner'],
          description: 'Contemporary multi-cuisine pantry and community kitchen.',
        },
        amenities: [
          'High-Speed WiFi',
          'Air Conditioning',
          'Power Backup',
          'Gym Access',
          'Recreation Lounge',
          'Washing Machine',
          'Attached Bathroom',
          'Housekeeping',
        ],
        houseRules: [
          '24/7 unrestricted secure access via smart keycard',
          'Respectful quiet hours in co-working zones',
        ],
        coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Available Now',
        approvalStatus: 'approved',
        featured: true,
        viewsCount: 289,
      },
      {
        ownerId: verifiedOwner._id,
        title: 'Serene Heights Boys Living — BTM 1st Stage',
        description: 'Affordable, clean, and spacious rooms tailored for budget-conscious students with zero compromise on hygiene. Features large study desks, attached washrooms, continuous power backup, and generous locker storage.',
        accommodationType: 'Boys PG',
        monthlyRent: 9500,
        deposit: 12000,
        additionalCharges: 300,
        location: {
          address: '23, 100 Feet Ring Road, BTM 1st Stage',
          locality: 'BTM Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560068',
          landmark: 'Near Silk Board Junction, 1.8km to Christ Central Campus',
          distanceToCampus: '1.8 km',
          coordinates: { lat: 12.9166, lng: 77.6101 },
        },
        sharingType: 'Triple',
        capacity: 3,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Dinner'],
          description: 'Wholesome South & North Indian vegetarian and non-vegetarian food.',
        },
        amenities: [
          'High-Speed WiFi',
          'Attached Bathroom',
          'RO Drinking Water',
          'Washing Machine',
          'CCTV Security',
          'Power Backup',
        ],
        houseRules: [
          'Curfew 10:30 PM',
          'No loud music after 10:00 PM',
        ],
        coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Available Now',
        approvalStatus: 'approved',
        featured: false,
        viewsCount: 145,
      },
      {
        ownerId: verifiedOwner._id,
        title: 'Lotus Palms Girls Residence — SG Palya',
        description: 'Prime accommodation situated right next to Christ University Back Gate. Safe residential lane, video doorbell entry, purified water, solar hot water, and silent study zones.',
        accommodationType: 'Girls PG',
        monthlyRent: 13000,
        deposit: 18000,
        additionalCharges: 0,
        location: {
          address: '11, 4th Cross, Venkateshwara Layout, SG Palya',
          locality: 'SG Palya',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560029',
          landmark: '200m from Christ Back Gate',
          distanceToCampus: '200m',
          coordinates: { lat: 12.9341, lng: 77.6082 },
        },
        sharingType: 'Double',
        capacity: 2,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
          description: 'Three hearty meals daily plus evening tea and snacks.',
        },
        amenities: [
          'High-Speed WiFi',
          'Attached Bathroom',
          'Power Backup',
          'CCTV Security',
          'RO Drinking Water',
          'Daily Housekeeping',
        ],
        houseRules: [
          'Entry gate closes at 10:15 PM',
          'Female visitors allowed in visitor lounge',
        ],
        coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Filling Fast',
        approvalStatus: 'approved',
        featured: false,
        viewsCount: 220,
      },
      {
        ownerId: verifiedOwner._id,
        title: 'Canvas Co-Living Urban House — HSR Layout Sector 2',
        description: 'Boutique premium co-living space designed for designers, engineers, and Christ University management scholars. High ceilings, Scandinavian minimalist aesthetics, private work pods, and an artisanal cafe on the ground floor.',
        accommodationType: 'Co-living',
        monthlyRent: 21500,
        deposit: 35000,
        additionalCharges: 1000,
        location: {
          address: '412, 14th Main Road, Sector 2, HSR Layout',
          locality: 'HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560102',
          landmark: 'Near 27th Main Junction, direct bus to Christ Campus',
          distanceToCampus: '3.5 km',
          coordinates: { lat: 12.9116, lng: 77.6473 },
        },
        sharingType: 'Single',
        capacity: 1,
        foodAvailability: {
          included: false,
          mealTypes: [],
          description: 'Fully equipped modular kitchen + cafe discounts.',
        },
        amenities: [
          'High-Speed WiFi',
          'Air Conditioning',
          'Power Backup',
          'Study Desk',
          'Attached Bathroom',
          'Gym Access',
          'Housekeeping',
        ],
        houseRules: [
          'Digital keycard entry anytime',
          'No loud parties after midnight',
        ],
        coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        ],
        availability: 'Available Now',
        approvalStatus: 'approved',
        featured: true,
        viewsCount: 410,
      },
      // PENDING PROPERTY for Admin Moderation Demonstration
      {
        ownerId: verifiedOwner._id,
        title: 'Green View Executive Stay — Bannerghatta Road',
        description: 'Newly constructed executive PG adjacent to Christ University Bannerghatta Road Campus. Large ventilated rooms with panoramic lake views.',
        accommodationType: 'Boys PG',
        monthlyRent: 12000,
        deposit: 15000,
        additionalCharges: 0,
        location: {
          address: '19, Hulimavu Gate, Bannerghatta Main Road',
          locality: 'Bannerghatta Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560076',
          landmark: '400m from Christ Bannerghatta Campus',
          distanceToCampus: '400m',
          coordinates: { lat: 12.8762, lng: 77.5963 },
        },
        sharingType: 'Double',
        capacity: 2,
        foodAvailability: {
          included: true,
          mealTypes: ['Breakfast', 'Dinner'],
          description: 'Hygienic vegetarian & non-vegetarian food.',
        },
        amenities: ['High-Speed WiFi', 'Power Backup', 'Attached Bathroom'],
        houseRules: ['Entry closes at 10:30 PM'],
        coverImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
        availability: 'Available Now',
        approvalStatus: 'pending', // Pending Admin Approval
        featured: false,
        viewsCount: 12,
      },
    ];

    const seededProperties = await Property.insertMany(propertiesData);
    console.log(`🏠 Seeded ${seededProperties.length} PG properties.`);

    const firstProp = seededProperties[0];
    const secondProp = seededProperties[1];

    // 4. Seed Student Favourite
    await Favourite.create({
      studentId: student._id,
      propertyId: firstProp._id,
    });

    // 5. Seed Student Interest / Enquiry
    await Interest.create({
      studentId: student._id,
      propertyId: firstProp._id,
      ownerId: verifiedOwner._id,
      message: 'Hello, I am a 2nd year MCA student at Christ University. Is the double-sharing room available starting next month? Also wanted to check if visitors are allowed during weekends.',
      contactPreference: 'phone',
      studentPhone: student.phone,
      studentEmail: student.email,
      status: 'pending',
    });

    // 6. Seed Student Visit Appointment (Confirmed)
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + 2); // 2 days from now

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

    // 7. Seed Student Visit Appointment (Pending)
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

    // 8. Seed Notifications
    await Notification.create([
      {
        userId: student._id,
        title: 'Visit Confirmed! 🎉',
        message: `Your visit to "${firstProp.title}" on ${visitDate.toLocaleDateString()} at 04:00 PM - 05:30 PM has been confirmed by the owner.`,
        type: 'appointment',
        readStatus: false,
      },
      {
        userId: verifiedOwner._id,
        title: 'New Student Enquiry',
        message: `${student.name} expressed interest in your property "${firstProp.title}".`,
        type: 'interest',
        readStatus: false,
      },
      {
        userId: admin._id,
        title: 'New Listing Pending Review',
        message: 'A new property "Green View Executive Stay" requires moderation.',
        type: 'approval',
        readStatus: false,
      },
    ]);

    console.log('✅ StayNear Database successfully populated with realistic demo data!');
    console.log('\n================ DEMO CREDENTIALS ================');
    console.log('👑 Admin:   admin@staynear.com    | Admin@12345');
    console.log('🏡 Owner:   owner@staynear.com    | Owner@12345');
    console.log('⏳ NewOwner: newowner@staynear.com | Owner@12345');
    console.log('🎓 Student: student@staynear.com  | Student@12345');
    console.log('===================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
