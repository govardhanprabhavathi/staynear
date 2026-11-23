import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Users,
  Utensils,
  Wifi,
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useNotification } from '../../context/NotificationContext';
import { CategoryBadge, VerifiedBadge } from '../../components/common/Badge';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();
  const { isFavorited, toggleFavourite } = useFavourites();
  const { showToast } = useNotification();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Modals state
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState(
    'Hi, I am interested in this accommodation and would like to confirm current availability and details.'
  );
  const [interestContactPref, setInterestContactPref] = useState('phone');
  const [submittingInterest, setSubmittingInterest] = useState(false);

  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM - 12:30 PM');
  const [visitNotes, setVisitNotes] = useState('');
  const [submittingVisit, setSubmittingVisit] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate pricing or hidden charges');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Fetch property and similar listings
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const prop = await propertyService.getById(id);
        setProperty(prop);
        setActiveImageIndex(0);

        // Fetch similar listings
        const similar = await propertyService.getSimilar(id);
        setSimilarProperties(similar);
      } catch (err) {
        showToast('Could not load property details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pureWhite pt-36 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nearBlack" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-pureWhite pt-36 pb-20 text-center px-4">
        <h2 className="font-heading font-bold text-2xl text-nearBlack">Listing not found</h2>
        <p className="text-sm text-neutral-500 mt-2">
          This accommodation listing may have been unlisted or removed.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/explore')}>
            Browse all PGs
          </Button>
        </div>
      </div>
    );
  }

  const saved = isFavorited(property._id);

  // Handle Interest Submission
  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!isStudent) {
      showToast('Only student accounts can express interest in accommodations.', 'warning');
      return;
    }

    setSubmittingInterest(true);
    try {
      const res = await studentService.createInterest({
        propertyId: property._id,
        message: interestMessage,
        contactPreference: interestContactPref,
      });
      if (res.success) {
        showToast('Enquiry sent successfully! The owner has been notified.', 'success');
        setInterestModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit enquiry.', 'error');
    } finally {
      setSubmittingInterest(false);
    }
  };

  // Handle Visit Request Submission
  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!isStudent) {
      showToast('Only student accounts can schedule visits.', 'warning');
      return;
    }
    if (!visitDate) {
      showToast('Please select a visit date.', 'warning');
      return;
    }

    setSubmittingVisit(true);
    try {
      const res = await studentService.createAppointment({
        propertyId: property._id,
        requestedDate: visitDate,
        requestedTime: visitTime,
        notes: visitNotes,
      });
      if (res.success) {
        showToast('Visit request sent! The owner will review and confirm.', 'success');
        setVisitModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule visit.', 'error');
    } finally {
      setSubmittingVisit(false);
    }
  };

  // Handle Report Submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setSubmittingReport(true);
    try {
      const res = await propertyService.report(property._id, {
        reason: reportReason,
        description: reportDescription,
      });
      if (res.success) {
        showToast('Report submitted for administrative review.', 'success');
        setReportModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const images = property.images && property.images.length > 0 ? property.images : [property.coverImage];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121212] pt-28 pb-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Back Link & Share */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!', 'info');
              }}
              className="p-2 rounded-full border border-black/[0.08] bg-white hover:border-black text-neutral-600 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavourite(property)}
              className="p-2 rounded-full border border-black/[0.08] bg-white hover:border-black text-neutral-600 transition-colors"
              title={saved ? 'Remove from saved' : 'Save listing'}
            >
              <Heart
                className={`w-4 h-4 ${saved ? 'fill-softRed text-softRed' : 'text-neutral-600'}`}
              />
            </button>
          </div>
        </div>

        {/* 1. EDITORIAL IMAGE GALLERY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          {/* Main Active Image */}
          <div className="lg:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-neutral-100 border border-black/[0.08] shadow-sm">
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {images.length > 1 && (
              <div className="absolute inset-x-4 bottom-4 flex justify-between pointer-events-none">
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="pointer-events-auto w-9 h-9 rounded-full bg-nearBlack/60 backdrop-blur-sm text-pureWhite flex items-center justify-center hover:bg-nearBlack transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="pointer-events-auto w-9 h-9 rounded-full bg-nearBlack/60 backdrop-blur-sm text-pureWhite flex items-center justify-center hover:bg-nearBlack transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails Sidebar */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-nearBlack ring-2 ring-nearBlack/20'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 2. MAIN DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Details Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Title & Locality Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge category={property.accommodationType} />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warmSand text-nearBlack">
                  {property.sharingType} Sharing
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-lightSage text-nearBlack">
                  {property.availability || 'Available Now'}
                </span>
                {property.isOwnerVerified !== false && <VerifiedBadge />}
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-nearBlack tracking-tight mt-1">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2 font-medium">
                <MapPin className="w-4 h-4 text-mutedSage shrink-0" />
                <span>{property.location?.address}, {property.location?.locality}, {property.location?.city}</span>
                {property.location?.distanceToCampus && (
                  <span className="text-nearBlack font-bold bg-warmOffWhite px-2 py-0.5 rounded text-xs">
                    {property.location.distanceToCampus} from campus
                  </span>
                )}
              </div>
            </div>

            {/* Pricing Summary Grid */}
            <div className="p-6 rounded-2xl bg-warmOffWhite border border-warmSand grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <span className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Monthly Rent
                </span>
                <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                  ₹{property.monthlyRent?.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-neutral-500">Per person / month</span>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Security Deposit
                </span>
                <span className="font-heading font-bold text-xl text-nearBlack mt-1 block">
                  ₹{property.deposit ? property.deposit.toLocaleString('en-IN') : '0'}
                </span>
                <span className="text-[11px] text-neutral-500">Refundable move-out deposit</span>
              </div>

              <div>
                <span className="block text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  Maintenance
                </span>
                <span className="font-heading font-bold text-xl text-nearBlack mt-1 block">
                  {property.additionalCharges ? `₹${property.additionalCharges}` : 'Included'}
                </span>
                <span className="text-[11px] text-neutral-500">Electricity & water</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                About this accommodation
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4 pt-6 border-t border-warmSand/70">
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities?.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-warmOffWhite/70 border border-warmSand/60 text-xs font-semibold text-nearBlack"
                  >
                    <CheckCircle2 className="w-4 h-4 text-mutedSage shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food & Dining Details */}
            <div className="space-y-3 pt-6 border-t border-warmSand/70">
              <h3 className="font-heading font-bold text-xl text-nearBlack flex items-center gap-2">
                <Utensils className="w-5 h-5 text-mutedSage" />
                <span>Food & Dining Information</span>
              </h3>
              {property.foodAvailability?.included ? (
                <div className="p-5 rounded-2xl bg-lightSage/40 border border-mutedSage/20 space-y-2">
                  <div className="text-xs font-bold text-nearBlack uppercase tracking-wider">
                    Meals Provided: {property.foodAvailability.mealTypes?.join(', ')}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700">
                    {property.foodAvailability.description || 'Hygienic vegetarian and non-vegetarian food prepared fresh daily.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  Meals are self-catered. A common modular kitchenette or nearby tiffin subscriptions are available.
                </p>
              )}
            </div>

            {/* House Rules */}
            <div className="space-y-3 pt-6 border-t border-warmSand/70">
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                House Rules & Policies
              </h3>
              <ul className="space-y-2">
                {property.houseRules?.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-nearBlack mt-2 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location & Map Landmark */}
            <div className="space-y-3 pt-6 border-t border-warmSand/70">
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                Location & Proximity
              </h3>
              <div className="p-6 rounded-2xl bg-warmOffWhite border border-warmSand flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-sm font-bold text-nearBlack">
                    {property.location?.landmark || property.location?.locality}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {property.location?.address}, Bengaluru
                  </div>
                  {property.location?.distanceToCampus && (
                    <div className="text-xs font-semibold text-mutedSage mt-2">
                      Walking Distance: {property.location.distanceToCampus} to Christ University
                    </div>
                  )}
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${property.title} ${property.location?.address} ${property.location?.locality} Bengaluru`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-nearBlack text-pureWhite text-xs font-semibold hover:bg-black transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Report listing */}
            <div className="pt-6 border-t border-warmSand/70 flex justify-between items-center text-xs text-neutral-500">
              <span>Listing ID: {property._id}</span>
              <button
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1 text-neutral-400 hover:text-softRed transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report this listing</span>
              </button>
            </div>
          </div>

          {/* Right Sticky Action Card (Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 bg-pureWhite p-6 rounded-3xl border border-warmSand shadow-elevated space-y-6">
              {/* Price Banner */}
              <div className="pb-4 border-b border-warmSand/80">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                  All-Inclusive Rent
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-heading font-black text-3xl text-nearBlack">
                    ₹{property.monthlyRent?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">/ month</span>
                </div>
                <div className="text-[11px] text-mutedSage mt-1 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero brokerage • Direct owner contact</span>
                </div>
              </div>

              {/* Owner Info Box */}
              <div className="p-4 rounded-xl bg-warmOffWhite border border-warmSand/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Property Managed By
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-9 h-9 rounded-full bg-lightSage flex items-center justify-center font-bold text-sm text-nearBlack">
                    {property.ownerId?.name?.[0] || 'O'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-nearBlack">
                      {property.ownerId?.name || 'Verified Owner'}
                    </div>
                    <div className="text-[11px] text-mutedSage font-medium">
                      Verified StayNear Partner
                    </div>
                  </div>
                </div>

                {/* Authenticated Owner Phone Display */}
                {isAuthenticated && property.ownerId?.phone ? (
                  <div className="mt-3 pt-3 border-t border-warmSand/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Contact:</span>
                    <a
                      href={`tel:${property.ownerId.phone}`}
                      className="font-bold text-nearBlack hover:text-mutedSage flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{property.ownerId.phone}</span>
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-warmSand/80 text-[11px] text-neutral-500">
                    Sign in as a student to view verified owner phone.
                  </div>
                )}
              </div>

              {/* Primary Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  icon={Calendar}
                  onClick={() => setVisitModalOpen(true)}
                >
                  Schedule a Visit
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center"
                  icon={MessageSquare}
                  onClick={() => setInterestModalOpen(true)}
                >
                  Express Interest
                </Button>
              </div>

              <div className="text-center text-[11px] text-neutral-500 font-light">
                No booking fees or card required. You pay rent directly upon moving in.
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR ACCOMMODATIONS */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-14 border-t border-warmSand">
            <h2 className="font-heading font-extrabold text-2xl text-nearBlack mb-6">
              Similar Accommodations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-pureWhite/95 backdrop-blur-md border-t border-warmSand p-4 z-40 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400">Monthly</span>
          <div className="font-heading font-black text-lg text-nearBlack">
            ₹{property.monthlyRent?.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setInterestModalOpen(true)}
          >
            Inquire
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => setVisitModalOpen(true)}
          >
            Schedule Visit
          </Button>
        </div>
      </div>

      {/* MODAL 1: EXPRESS INTEREST */}
      <Modal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        title="Express Interest in Property"
        subtitle={`To owner of ${property.title}`}
      >
        <form onSubmit={handleSubmitInterest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Your Message or Question
            </label>
            <textarea
              rows={4}
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              required
              className="w-full text-xs sm:text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
              placeholder="Ask about room availability, deposit, or food preferences..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Preferred Contact Channel
            </label>
            <select
              value={interestContactPref}
              onChange={(e) => setInterestContactPref(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="phone">Phone Call / WhatsApp</option>
              <option value="email">Email</option>
              <option value="platform">StayNear In-App Messages</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              isLoading={submittingInterest}
            >
              Send Enquiry to Owner
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: SCHEDULE A VISIT */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule a Physical Visit"
        subtitle="Meet the owner and inspect the accommodation"
      >
        <form onSubmit={handleSubmitVisit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Select Visit Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Preferred Time Slot
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
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
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Coming with parents or friends"
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
            />
          </div>

          <div className="p-3 rounded-xl bg-warmSand/40 text-[11px] text-neutral-600">
            <strong>Note:</strong> Visit requests are subject to owner confirmation. The owner will respond with confirmation or propose an alternate slot.
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              isLoading={submittingVisit}
            >
              Request Visit Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: REPORT PROPERTY */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report This Listing"
        subtitle="Help maintain StayNear quality & safety standards"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Reason for Reporting
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="Inaccurate pricing or hidden charges">Inaccurate pricing or hidden charges</option>
              <option value="Misleading photographs or description">Misleading photographs or description</option>
              <option value="Owner unresponsive or unprofessional">Owner unresponsive or unprofessional</option>
              <option value="Property does not exist at location">Property does not exist at location</option>
              <option value="Safety or hygiene concerns">Safety or hygiene concerns</option>
              <option value="Other violation of platform terms">Other violation of platform terms</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Details
            </label>
            <textarea
              rows={3}
              required
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please describe what you observed..."
              className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="danger"
              className="w-full justify-center"
              isLoading={submittingReport}
            >
              Submit Moderation Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PropertyDetailPage;
