import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Compass,
  MessageSquare,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Image as ImageIcon,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  LogOut,
  Upload,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ownerService } from '../../services/ownerService';
import { propertyService } from '../../services/propertyService';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AMENITY_OPTIONS = [
  'High-Speed WiFi',
  'Power Backup',
  'Attached Bathroom',
  'Air Conditioning',
  'Daily Housekeeping',
  'Washing Machine',
  'RO Drinking Water',
  'CCTV Security',
  'Biometric Entry',
  'Study Desk',
  'Refrigerator',
  'Geyser',
  'Gym Access',
  'Recreation Lounge',
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user, logout } = useAuth();
  const { showToast } = useNotification();

  // Metrics & Inventory State
  const [metrics, setMetrics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Multi-step Wizard State (Steps 1 to 6)
  const [step, setStep] = useState(1);
  const [submittingProperty, setSubmittingProperty] = useState(false);

  // Property Form State
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    accommodationType: 'Boys PG',
    monthlyRent: '',
    deposit: '',
    additionalCharges: '0',
    address: '',
    locality: 'SG Palya',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560029',
    landmark: 'Near Christ University Gate 1',
    distanceToCampus: '400m',
    sharingType: 'Double',
    capacity: 2,
    foodIncluded: true,
    foodMeals: ['Breakfast', 'Dinner'],
    foodDescription: 'Nutritious North & South Indian meals prepared fresh daily.',
    amenities: ['High-Speed WiFi', 'Daily Housekeeping', 'Attached Bathroom', 'Power Backup'],
    houseRules: [
      'Entry gate access until 10:30 PM',
      'Visitors allowed in ground floor lobby only',
      'Quiet study hours after 11:00 PM',
    ],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Reschedule Appointment Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('04:00 PM - 05:30 PM');
  const [ownerNote, setOwnerNote] = useState('');

  // Reject Appointment Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Slot unavailable');

  // Load Owner Data
  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [metricsData, propsData, enqData, apptData, appStatus] = await Promise.all([
        ownerService.getDashboardMetrics(),
        ownerService.getMyProperties(),
        ownerService.getEnquiries(),
        ownerService.getAppointments(),
        ownerService.getApplicationStatus(),
      ]);

      if (metricsData.success) setMetrics(metricsData.metrics);
      setProperties(propsData || []);
      setEnquiries(enqData || []);
      setAppointments(apptData || []);
      setApplicationStatus(appStatus?.application || null);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Toggle Amenity in Form
  const handleToggleAmenity = (amenity) => {
    if (propertyForm.amenities.includes(amenity)) {
      setPropertyForm({
        ...propertyForm,
        amenities: propertyForm.amenities.filter((a) => a !== amenity),
      });
    } else {
      setPropertyForm({
        ...propertyForm,
        amenities: [...propertyForm.amenities, amenity],
      });
    }
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setPropertyForm({
        ...propertyForm,
        images: [...propertyForm.images, newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  // Submit Listing Form
  const handleSubmitProperty = async () => {
    if (!applicationStatus || applicationStatus.reviewStatus !== 'approved') {
      showToast('Your owner application must be approved before publishing properties.', 'warning');
      return;
    }

    setSubmittingProperty(true);
    try {
      const payload = {
        title: propertyForm.title,
        description: propertyForm.description,
        accommodationType: propertyForm.accommodationType,
        monthlyRent: Number(propertyForm.monthlyRent),
        deposit: Number(propertyForm.deposit),
        additionalCharges: Number(propertyForm.additionalCharges),
        location: {
          address: propertyForm.address,
          locality: propertyForm.locality,
          city: propertyForm.city,
          state: propertyForm.state,
          postalCode: propertyForm.postalCode,
          landmark: propertyForm.landmark,
          distanceToCampus: propertyForm.distanceToCampus,
        },
        sharingType: propertyForm.sharingType,
        capacity: Number(propertyForm.capacity),
        foodAvailability: {
          included: propertyForm.foodIncluded,
          mealTypes: propertyForm.foodMeals,
          description: propertyForm.foodDescription,
        },
        amenities: propertyForm.amenities,
        houseRules: propertyForm.houseRules,
        images: propertyForm.images,
        coverImage: propertyForm.coverImage || propertyForm.images[0],
      };

      const res = await propertyService.create(payload);
      if (res.success) {
        showToast('Property submitted successfully! It is now pending admin moderation.', 'success');
        setStep(1);
        setTab('properties');
        loadOwnerData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit property.', 'error');
    } finally {
      setSubmittingProperty(false);
    }
  };

  // Handle Enquiry Status Update
  const handleUpdateEnquiry = async (enquiryId, status) => {
    try {
      await ownerService.updateEnquiryStatus(enquiryId, { status });
      showToast(`Enquiry marked as ${status}.`, 'info');
      loadOwnerData();
    } catch (err) {
      showToast('Could not update enquiry status.', 'error');
    }
  };

  // Handle Appointment Status Update (Confirm)
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await ownerService.updateAppointmentStatus(appointmentId, {
        status: 'confirmed',
        ownerResponse: 'Confirmed by property owner. Looking forward to meeting you.',
      });
      showToast('Visit confirmed! Student has been notified.', 'success');
      loadOwnerData();
    } catch (err) {
      showToast('Could not confirm visit.', 'error');
    }
  };

  // Handle Appointment Rejection
  const handleRejectAppointment = async () => {
    if (!activeAppointmentId) return;
    try {
      await ownerService.updateAppointmentStatus(activeAppointmentId, {
        status: 'rejected',
        cancellationReason: rejectReason,
      });
      showToast('Visit declined.', 'info');
      setRejectModalOpen(false);
      loadOwnerData();
    } catch (err) {
      showToast('Could not reject appointment.', 'error');
    }
  };

  // Handle Appointment Reschedule
  const handleRescheduleAppointment = async () => {
    if (!activeAppointmentId || !proposedDate) {
      showToast('Please select a proposed date.', 'warning');
      return;
    }
    try {
      await ownerService.updateAppointmentStatus(activeAppointmentId, {
        status: 'rescheduled',
        proposedDate,
        proposedTime,
        ownerResponse: ownerNote || 'Proposing an alternate time slot.',
      });
      showToast('Reschedule proposed! Student has been notified.', 'success');
      setRescheduleModalOpen(false);
      loadOwnerData();
    } catch (err) {
      showToast('Could not propose reschedule.', 'error');
    }
  };

  // Handle Delete Property
  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await propertyService.delete(propId);
      showToast('Property listing removed.', 'info');
      loadOwnerData();
    } catch (err) {
      showToast('Failed to delete property.', 'error');
    }
  };

  // Handle Toggle Sponsored Promotion
  const handleToggleSponsor = async (prop) => {
    try {
      const nextState = !prop.isSponsored;
      await propertyService.update(prop._id, { isSponsored: nextState });
      showToast(
        nextState
          ? 'PG promoted! It will now roll first in Sponsored PGs on Explore.'
          : 'Sponsored promotion paused for this listing.',
        nextState ? 'success' : 'info'
      );
      loadOwnerData();
    } catch (err) {
      showToast('Could not update promotion status.', 'error');
    }
  };

  const isOwnerVerified = applicationStatus?.reviewStatus === 'approved';

  return (
    <div className="min-h-screen bg-warmOffWhite/30 text-nearBlack pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Alert Banner if Not Approved */}
        {!isOwnerVerified && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-mutedGold/15 border border-mutedGold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-mutedGold shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-nearBlack">Owner Verification Status: </span>
                <span className="font-semibold uppercase tracking-wider text-neutral-700">
                  {applicationStatus ? applicationStatus.reviewStatus.replace('_', ' ') : 'Not Submitted'}
                </span>
                <p className="text-neutral-600 text-xs mt-0.5">
                  Complete identity & property document submission to unlock listing publication rights.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/owner/apply')}
            >
              {applicationStatus ? 'View Application' : 'Submit Verification'}
            </Button>
          </div>
        )}

        {/* Top Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
            Owner Management Portal
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-nearBlack tracking-tight">
                {user?.name}'s Residences
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Manage your listings, reply to inquiries, and confirm student visits.
              </p>
            </div>

            {isOwnerVerified && (
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => {
                  setStep(1);
                  setTab('add');
                }}
              >
                Add New Accommodation
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 bg-pureWhite p-4 rounded-2xl border border-warmSand shadow-subtle space-y-1">
            <button
              onClick={() => setTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'overview'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setTab('properties')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'properties'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>My Properties</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentTab === 'properties'
                    ? 'bg-white/20 text-pureWhite'
                    : 'bg-warmSand text-nearBlack'
                }`}
              >
                {properties.length}
              </span>
            </button>

            {isOwnerVerified && (
              <button
                onClick={() => {
                  setStep(1);
                  setTab('add');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                  currentTab === 'add'
                    ? 'bg-nearBlack text-pureWhite'
                    : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Property (Wizard)</span>
              </button>
            )}

            <button
              onClick={() => setTab('enquiries')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'enquiries'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Student Enquiries</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentTab === 'enquiries'
                    ? 'bg-white/20 text-pureWhite'
                    : 'bg-warmSand text-nearBlack'
                }`}
              >
                {enquiries.length}
              </span>
            </button>

            <button
              onClick={() => setTab('visits')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'visits'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Visit Requests</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentTab === 'visits'
                    ? 'bg-white/20 text-pureWhite'
                    : 'bg-warmSand text-nearBlack'
                }`}
              >
                {appointments.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/owner/apply')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack transition-all text-left"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verification Documents</span>
            </button>

            <div className="pt-3 border-t border-warmSand/70">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-softRed hover:bg-softRed/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Tab Content */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {currentTab === 'overview' && (
              <div className="space-y-6">
                {/* 5 Real Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Total Listings
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.totalProperties ?? properties.length}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mutedSage block">
                      Active Listings
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.activeProperties ?? properties.filter((p) => p.approvalStatus === 'approved').length}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Pending Review
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.pendingApprovals ?? properties.filter((p) => p.approvalStatus === 'pending').length}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Enquiries
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.totalEnquiries ?? enquiries.length}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGold block">
                      Upcoming Visits
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.upcomingVisits ?? appointments.filter((a) => a.status === 'confirmed').length}
                    </span>
                  </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      Recent Student Inquiries
                    </h3>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setTab('enquiries')}
                      withArrow
                    >
                      View all ({enquiries.length})
                    </Button>
                  </div>

                  {enquiries.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-6 text-center">
                      No student inquiries received yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-warmSand/60">
                      {enquiries.slice(0, 3).map((enq) => (
                        <div
                          key={enq._id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="text-xs font-bold text-nearBlack">
                              {enq.studentId?.name} •{' '}
                              <span className="text-neutral-500 font-normal">
                                {enq.propertyId?.title}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 line-clamp-1 mt-0.5">
                              "{enq.message}"
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warmOffWhite border border-warmSand capitalize self-start sm:self-auto">
                            {enq.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Scheduled Visits */}
                <div className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      Pending Visit Requests
                    </h3>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setTab('visits')}
                      withArrow
                    >
                      Manage visits ({appointments.length})
                    </Button>
                  </div>

                  {appointments.filter((a) => a.status === 'pending').length === 0 ? (
                    <p className="text-xs text-neutral-400 py-6 text-center">
                      No pending visit requests requiring response.
                    </p>
                  ) : (
                    <div className="divide-y divide-warmSand/60">
                      {appointments
                        .filter((a) => a.status === 'pending')
                        .slice(0, 3)
                        .map((app) => (
                          <div
                            key={app._id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-bold text-nearBlack">
                                {app.studentId?.name} requested to visit "{app.propertyId?.title}"
                              </div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {new Date(app.requestedDate).toLocaleDateString('en-IN')} ({app.requestedTime})
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleConfirmAppointment(app._id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setActiveAppointmentId(app._id);
                                  setRescheduleModalOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY PROPERTIES */}
            {currentTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    My Accommodations ({properties.length})
                  </h2>
                  {isOwnerVerified && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => {
                        setStep(1);
                        setTab('add');
                      }}
                    >
                      Add Accommodation
                    </Button>
                  )}
                </div>

                {properties.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No properties listed yet
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {isOwnerVerified
                        ? 'Click below to submit your first PG accommodation.'
                        : 'Submit and get your owner verification approved to list properties.'}
                    </p>
                    <div className="mt-5">
                      {isOwnerVerified ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setStep(1);
                            setTab('add');
                          }}
                        >
                          Add Property
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate('/owner/apply')}
                        >
                          Submit Verification
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((prop) => (
                      <div
                        key={prop._id}
                        className="bg-pureWhite rounded-2xl border border-warmSand overflow-hidden shadow-subtle flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] bg-warmOffWhite">
                          <img
                            src={prop.coverImage || prop.images?.[0]}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <StatusBadge status={prop.approvalStatus} />
                            {prop.isSponsored && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A4E0B] bg-[#FBF3E4]/95 px-2 py-0.5 rounded-full border border-[#E7C98F]">
                                <Megaphone className="w-2.5 h-2.5" />
                                <span>Sponsored</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-heading font-bold text-sm text-nearBlack line-clamp-1">
                            {prop.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>{prop.location?.locality}</span>
                            <span className="font-bold text-nearBlack">
                              ₹{prop.monthlyRent?.toLocaleString('en-IN')}/mo
                            </span>
                          </div>

                          {prop.approvalStatus === 'rejected' && prop.rejectionReason && (
                            <div className="p-2 rounded bg-softRed/10 text-[11px] text-softRed">
                              Reason: {prop.rejectionReason}
                            </div>
                          )}

                          <div className="pt-3 border-t border-warmSand/70 flex items-center justify-between gap-2">
                            <Link
                              to={`/property/${prop._id}`}
                              className="text-xs font-semibold text-mutedSage hover:underline flex items-center gap-1"
                            >
                              <span>Preview</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            {prop.approvalStatus === 'approved' && (
                              <button
                                onClick={() => handleToggleSponsor(prop)}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                                  prop.isSponsored
                                    ? 'bg-[#FBF3E4] text-[#7A4E0B] border-[#E7C98F] hover:bg-[#F5E6C8]'
                                    : 'bg-warmOffWhite text-nearBlack border-warmSand hover:border-nearBlack'
                                }`}
                              >
                                <Megaphone className="w-3 h-3" />
                                <span>{prop.isSponsored ? 'Promoted' : 'Promote PG'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteProperty(prop._id)}
                              className="text-xs font-medium text-neutral-400 hover:text-softRed flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADD PROPERTY MULTI-STEP WIZARD */}
            {currentTab === 'add' && (
              <div className="bg-pureWhite p-8 rounded-3xl border border-warmSand shadow-subtle space-y-8">
                {/* Wizard Stepper */}
                <div className="border-b border-warmSand pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
                      Listing Creation Wizard • Step {step} of 6
                    </span>
                    <span className="text-xs text-neutral-500">
                      {step === 1 && 'Basic Information'}
                      {step === 2 && 'Location & Campus Proximity'}
                      {step === 3 && 'Pricing & Deposit'}
                      {step === 4 && 'Accommodation & House Rules'}
                      {step === 5 && 'Photography & Cover Selection'}
                      {step === 6 && 'Review & Final Submission'}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s <= step ? 'bg-nearBlack' : 'bg-warmSand'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                  <div className="space-y-4 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 1: Basic Information
                    </h3>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Property Listing Title
                      </label>
                      <input
                        type="text"
                        required
                        value={propertyForm.title}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, title: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="e.g. Prestige Scholar Residency — SG Palya"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Accommodation Category
                      </label>
                      <select
                        value={propertyForm.accommodationType}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, accommodationType: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                      >
                        <option value="Boys PG">Boys PG</option>
                        <option value="Girls PG">Girls PG</option>
                        <option value="Co-living">Co-Living</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Description & Unique Highlights
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={propertyForm.description}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, description: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="Describe room amenities, study atmosphere, cleanliness, food menu, and surrounding conveniences..."
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!propertyForm.title || !propertyForm.description) {
                            showToast('Please complete title and description.', 'warning');
                            return;
                          }
                          setStep(2);
                        }}
                      >
                        Continue to Location
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION */}
                {step === 2 && (
                  <div className="space-y-4 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 2: Location & Proximity
                    </h3>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={propertyForm.address}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, address: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="e.g. 42, 2nd Cross, Venkateshwara Layout"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Locality / Area
                        </label>
                        <select
                          value={propertyForm.locality}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, locality: e.target.value })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                        >
                          <option value="SG Palya">SG Palya</option>
                          <option value="Koramangala">Koramangala</option>
                          <option value="Tavarekere">Tavarekere</option>
                          <option value="BTM Layout">BTM Layout</option>
                          <option value="HSR Layout">HSR Layout</option>
                          <option value="Bannerghatta Road">Bannerghatta Road</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={propertyForm.postalCode}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, postalCode: e.target.value })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={propertyForm.landmark}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, landmark: e.target.value })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                          placeholder="e.g. Near Christ Gate 1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Walking Distance to Campus
                        </label>
                        <input
                          type="text"
                          value={propertyForm.distanceToCampus}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, distanceToCampus: e.target.value })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                          placeholder="e.g. 350m"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="secondary" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!propertyForm.address || !propertyForm.locality) {
                            showToast('Please provide an address and locality.', 'warning');
                            return;
                          }
                          setStep(3);
                        }}
                      >
                        Continue to Pricing
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PRICING */}
                {step === 3 && (
                  <div className="space-y-4 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 3: Pricing & Deposit
                    </h3>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Monthly Rent per Person (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={propertyForm.monthlyRent}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, monthlyRent: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="e.g. 14500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Security Deposit (₹)
                      </label>
                      <input
                        type="number"
                        value={propertyForm.deposit}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, deposit: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="e.g. 20000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Additional Monthly Charges (₹)
                      </label>
                      <input
                        type="number"
                        value={propertyForm.additionalCharges}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, additionalCharges: e.target.value })
                        }
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                        placeholder="e.g. 500 (Electricity / Maintenance)"
                      />
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="secondary" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!propertyForm.monthlyRent || Number(propertyForm.monthlyRent) < 1000) {
                            showToast('Please specify a valid monthly rent.', 'warning');
                            return;
                          }
                          setStep(4);
                        }}
                      >
                        Continue to Specs
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: ACCOMMODATION SPECS */}
                {step === 4 && (
                  <div className="space-y-6 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 4: Accommodation Specs & Rules
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Room Sharing Type
                        </label>
                        <select
                          value={propertyForm.sharingType}
                          onChange={(e) =>
                            setPropertyForm({ ...propertyForm, sharingType: e.target.value })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                        >
                          <option value="Single">Single (Private Room)</option>
                          <option value="Double">Double Sharing</option>
                          <option value="Triple">Triple Sharing</option>
                          <option value="Four">Four Sharing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          Food Included
                        </label>
                        <select
                          value={propertyForm.foodIncluded ? 'yes' : 'no'}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              foodIncluded: e.target.value === 'yes',
                            })
                          }
                          className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                        >
                          <option value="yes">Yes, Meals Included</option>
                          <option value="no">No, Self-Catered</option>
                        </select>
                      </div>
                    </div>

                    {/* Amenities Selection */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Included Amenities & Services
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {AMENITY_OPTIONS.map((am) => (
                          <label
                            key={am}
                            className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer p-2 rounded-lg bg-warmOffWhite hover:bg-warmSand/50"
                          >
                            <input
                              type="checkbox"
                              checked={propertyForm.amenities.includes(am)}
                              onChange={() => handleToggleAmenity(am)}
                              className="w-4 h-4 rounded text-mutedSage focus:ring-mutedSage accent-mutedSage"
                            />
                            <span>{am}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="secondary" onClick={() => setStep(3)}>
                        Back
                      </Button>
                      <Button variant="primary" onClick={() => setStep(5)}>
                        Continue to Photos
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: PHOTOS */}
                {step === 5 && (
                  <div className="space-y-6 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 5: Photos & Cover Image
                    </h3>
                    <p className="text-xs text-neutral-500">
                      High quality, realistic interior photography significantly increases student visit appointments.
                    </p>

                    {/* Add Image URL or Sample */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Add high-resolution image URL..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 text-xs p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddImageUrl}
                      >
                        Add Photo
                      </Button>
                    </div>

                    {/* Image Previews Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {propertyForm.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPropertyForm({ ...propertyForm, coverImage: imgUrl })}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                            propertyForm.coverImage === imgUrl
                              ? 'border-mutedSage ring-2 ring-mutedSage/30'
                              : 'border-transparent'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {propertyForm.coverImage === imgUrl && (
                            <span className="absolute top-1 left-1 text-[10px] font-bold bg-mutedSage text-pureWhite px-1.5 py-0.5 rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="secondary" onClick={() => setStep(4)}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (propertyForm.images.length === 0) {
                            showToast('Please provide at least one photo.', 'warning');
                            return;
                          }
                          setStep(6);
                        }}
                      >
                        Review Listing
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 6: REVIEW & SUBMIT */}
                {step === 6 && (
                  <div className="space-y-6 max-w-xl">
                    <h3 className="font-heading font-bold text-xl text-nearBlack">
                      Step 6: Review & Submit for Moderation
                    </h3>

                    <div className="bg-warmOffWhite p-6 rounded-2xl border border-warmSand space-y-4 text-xs">
                      <div>
                        <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                          Title & Category
                        </span>
                        <div className="font-bold text-sm text-nearBlack mt-0.5">
                          {propertyForm.title} ({propertyForm.accommodationType})
                        </div>
                      </div>

                      <div>
                        <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                          Location
                        </span>
                        <div className="text-nearBlack mt-0.5">
                          {propertyForm.address}, {propertyForm.locality}, Bengaluru
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                            Rent
                          </span>
                          <div className="font-bold text-nearBlack mt-0.5">
                            ₹{Number(propertyForm.monthlyRent).toLocaleString('en-IN')} / mo
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                            Sharing
                          </span>
                          <div className="font-bold text-nearBlack mt-0.5">
                            {propertyForm.sharingType} Sharing
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                          Amenities ({propertyForm.amenities.length})
                        </span>
                        <div className="text-neutral-600 mt-0.5">
                          {propertyForm.amenities.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-lightSage/40 border border-mutedSage/30 text-[11px] text-neutral-700">
                      <strong>Moderation Notice:</strong> Upon submission, your property will be assigned status <strong>Pending Review</strong>. StayNear administrators review photos and pricing realism before it appears publicly on the explore directory.
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="secondary" onClick={() => setStep(5)}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        isLoading={submittingProperty}
                        onClick={handleSubmitProperty}
                      >
                        Submit Listing for Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ENQUIRIES */}
            {currentTab === 'enquiries' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-nearBlack">
                  Student Enquiries ({enquiries.length})
                </h2>

                {enquiries.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No student enquiries yet
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      When students express interest in your published listings, their questions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enq) => (
                      <div
                        key={enq._id}
                        className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-warmSand/60">
                          <div>
                            <span className="text-xs font-bold text-nearBlack">
                              {enq.studentId?.name}
                            </span>
                            <span className="text-xs text-neutral-500 ml-2">
                              for "{enq.propertyId?.title}"
                            </span>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              Contact: {enq.studentPhone} • {enq.studentEmail}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warmOffWhite border border-warmSand capitalize">
                              {enq.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-neutral-800 bg-warmOffWhite p-3.5 rounded-xl">
                          "{enq.message}"
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          {enq.status !== 'responded' && (
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => handleUpdateEnquiry(enq._id, 'responded')}
                            >
                              Mark Responded
                            </Button>
                          )}
                          {enq.status !== 'closed' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUpdateEnquiry(enq._id, 'closed')}
                            >
                              Close Enquiry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: VISIT REQUESTS */}
            {currentTab === 'visits' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-nearBlack">
                  Visit Requests ({appointments.length})
                </h2>

                {appointments.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No visit appointments yet
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Students booking physical walkthroughs of your accommodation will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div
                        key={app._id}
                        className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-warmSand/60">
                          <div>
                            <span className="font-bold text-base text-nearBlack">
                              {app.studentId?.name}
                            </span>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              Listing: {app.propertyId?.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              Phone: {app.studentId?.phone} • Email: {app.studentId?.email}
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={app.status} />
                          </div>
                        </div>

                        {/* Timing */}
                        <div className="bg-warmOffWhite p-4 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-nearBlack">
                            Requested Time:{' '}
                            {new Date(app.requestedDate).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            ({app.requestedTime})
                          </div>
                          {app.notes && (
                            <div className="text-neutral-600">Student Note: "{app.notes}"</div>
                          )}
                        </div>

                        {/* Action buttons */}
                        {app.status === 'pending' && (
                          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleConfirmAppointment(app._id)}
                            >
                              Confirm Visit Slot
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setActiveAppointmentId(app._id);
                                setRescheduleModalOpen(true);
                              }}
                            >
                              Propose Alternate Time
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-softRed border-softRed/20 hover:bg-softRed/5"
                              onClick={() => {
                                setActiveAppointmentId(app._id);
                                setRejectModalOpen(true);
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Propose Alternate Visit Time"
        subtitle="Suggest another convenient date or time slot"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Alternate Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Alternate Time Slot
            </label>
            <select
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="10:00 AM - 11:30 AM">10:00 AM – 11:30 AM (Morning)</option>
              <option value="11:30 AM - 01:00 PM">11:30 AM – 01:00 PM (Mid-day)</option>
              <option value="02:00 PM - 03:30 PM">02:00 PM – 03:30 PM (Afternoon)</option>
              <option value="04:00 PM - 05:30 PM">04:00 PM – 05:30 PM (Evening)</option>
              <option value="05:30 PM - 07:00 PM">05:30 PM – 07:00 PM (Late Evening)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Note to Student (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. I am away in morning, afternoon works best."
              value={ownerNote}
              onChange={(e) => setOwnerNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setRescheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleRescheduleAppointment}
            >
              Send Reschedule Proposal
            </Button>
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Visit Request"
        subtitle="Notify student that you cannot accommodate this request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Reason for Declining
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="Slot unavailable / Fully booked">Slot unavailable / Fully booked</option>
              <option value="Rooms currently under maintenance">Rooms currently under maintenance</option>
              <option value="Already full occupancy for this term">Already full occupancy for this term</option>
              <option value="Other scheduling conflict">Other scheduling conflict</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setRejectModalOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectAppointment}
            >
              Decline Visit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerDashboard;
