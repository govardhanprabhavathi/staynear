import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Heart,
  Calendar,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  ExternalLink,
  ChevronRight,
  LogOut,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useNotification } from '../../context/NotificationContext';
import { studentService } from '../../services/studentService';
import PropertyCard from '../../components/property/PropertyCard';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user, logout, updateProfile } = useAuth();
  const { favourites, refreshFavourites } = useFavourites();
  const { showToast } = useNotification();

  // Dashboard Data State
  const [metrics, setMetrics] = useState(null);
  const [interests, setInterests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [preferredLocality, setPreferredLocality] = useState(
    user?.preferredLocality || 'Christ University / Koramangala'
  );
  const [profileBudget, setProfileBudget] = useState(user?.budget || 15000);
  const [profileCategory, setProfileCategory] = useState(
    user?.accommodationPreference || 'Any'
  );
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Cancel Appointment Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  // Fetch Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewData, myInterests, myVisits] = await Promise.all([
        studentService.getDashboardMetrics(),
        studentService.getMyInterests(),
        studentService.getMyAppointments(),
      ]);

      if (overviewData.success) {
        setMetrics(overviewData.metrics);
      }
      setInterests(myInterests);
      setAppointments(myVisits);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Handle Cancel Appointment
  const handleConfirmCancel = async () => {
    if (!selectedAppointmentId) return;
    setCancelling(true);
    try {
      await studentService.cancelAppointment(selectedAppointmentId, cancelReason);
      showToast('Visit appointment cancelled.', 'info');
      setCancelModalOpen(false);
      loadDashboardData();
    } catch (err) {
      showToast('Could not cancel appointment.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Handle Accept Reschedule
  const handleAcceptReschedule = async (appointmentId) => {
    try {
      await studentService.acceptReschedule(appointmentId);
      showToast('Rescheduled visit confirmed!', 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Could not accept reschedule.', 'error');
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        preferredLocality,
        budget: profileBudget,
        accommodationPreference: profileCategory,
      });
      showToast('Profile preferences updated.', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmOffWhite/30 text-nearBlack pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
            Student Space
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-nearBlack tracking-tight mt-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage your saved listings, enquiries, and visit appointments in one place.
          </p>
        </div>

        {/* Dashboard Layout: Left Nav Sidebar, Right Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
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
              onClick={() => setTab('saved')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'saved'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Saved PGs</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentTab === 'saved'
                    ? 'bg-white/20 text-pureWhite'
                    : 'bg-warmSand text-nearBlack'
                }`}
              >
                {favourites.length}
              </span>
            </button>

            <button
              onClick={() => setTab('interests')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'interests'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>My Interests</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentTab === 'interests'
                    ? 'bg-white/20 text-pureWhite'
                    : 'bg-warmSand text-nearBlack'
                }`}
              >
                {interests.length}
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
                <span>Visit Appointments</span>
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
              onClick={() => setTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'profile'
                  ? 'bg-nearBlack text-pureWhite'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Housing Prefs</span>
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
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setTab('saved')}
                    className="cursor-pointer bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle hover:border-neutral-400 transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Saved PGs
                      </span>
                      <Heart className="w-4 h-4 text-softRed" />
                    </div>
                    <div className="font-heading font-black text-3xl text-nearBlack mt-2">
                      {favourites.length}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Properties bookmarked
                    </div>
                  </div>

                  <div
                    onClick={() => setTab('interests')}
                    className="cursor-pointer bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle hover:border-neutral-400 transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Enquiries Sent
                      </span>
                      <MessageSquare className="w-4 h-4 text-mutedSage" />
                    </div>
                    <div className="font-heading font-black text-3xl text-nearBlack mt-2">
                      {interests.length}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Direct owner questions
                    </div>
                  </div>

                  <div
                    onClick={() => setTab('visits')}
                    className="cursor-pointer bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle hover:border-neutral-400 transition-all"
                  >
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Visits Booked
                      </span>
                      <Calendar className="w-4 h-4 text-mutedGold" />
                    </div>
                    <div className="font-heading font-black text-3xl text-nearBlack mt-2">
                      {appointments.length}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      In-person walkthroughs
                    </div>
                  </div>
                </div>

                {/* Upcoming Visit Callout */}
                <div className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      Upcoming Property Visits
                    </h3>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setTab('visits')}
                      withArrow
                    >
                      View all visits
                    </Button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-xs">
                      No upcoming visits scheduled yet.{' '}
                      <Link to="/explore" className="text-mutedSage underline font-semibold">
                        Explore PGs to book a visit
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-warmSand/60">
                      {appointments.slice(0, 3).map((app) => (
                        <div
                          key={app._id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <Link
                              to={`/property/${app.propertyId?._id}`}
                              className="font-bold text-sm text-nearBlack hover:underline"
                            >
                              {app.propertyId?.title || 'Accommodation'}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                              <span>
                                {new Date(app.requestedDate).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>•</span>
                              <span>{app.requestedTime}</span>
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={app.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Explore Action */}
                <div className="bg-nearBlack text-pureWhite p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-pureWhite">
                      Searching for stays around your campus?
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Filter verified listings within walking distance of Christ University.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-pureWhite text-nearBlack shrink-0"
                    onClick={() => navigate('/explore')}
                  >
                    Browse Listings
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: SAVED PROPERTIES */}
            {currentTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    Saved Accommodations ({favourites.length})
                  </h2>
                </div>

                {favourites.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No saved properties
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      You haven't bookmarked any accommodations yet. Click the heart icon on any PG card to save it here.
                    </p>
                    <div className="mt-5">
                      <Button variant="primary" size="sm" onClick={() => navigate('/explore')}>
                        Explore PGs
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favourites.map((prop) => (
                      <PropertyCard key={prop._id} property={prop} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY INTERESTS */}
            {currentTab === 'interests' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-nearBlack">
                  My Enquiries ({interests.length})
                </h2>

                {interests.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No enquiries sent
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      When you submit questions to property owners, your enquiries and responses will be tracked here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interests.map((interest) => (
                      <div
                        key={interest._id}
                        className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-warmSand/60">
                          <div>
                            <Link
                              to={`/property/${interest.propertyId?._id}`}
                              className="font-heading font-bold text-base text-nearBlack hover:underline"
                            >
                              {interest.propertyId?.title || 'Accommodation'}
                            </Link>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              Owner: {interest.ownerId?.name || 'Property Manager'} •{' '}
                              {new Date(interest.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warmOffWhite border border-warmSand capitalize">
                              Status: {interest.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-neutral-700 bg-warmOffWhite p-3.5 rounded-xl">
                          <span className="font-bold text-nearBlack block mb-1">Your Message:</span>
                          "{interest.message}"
                        </div>

                        {interest.ownerNotes && (
                          <div className="text-xs text-neutral-800 bg-lightSage/50 p-3.5 rounded-xl border border-mutedSage/20">
                            <span className="font-bold text-nearBlack block mb-1">Owner Response:</span>
                            "{interest.ownerNotes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VISIT APPOINTMENTS */}
            {currentTab === 'visits' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-nearBlack">
                  Visit Appointments ({appointments.length})
                </h2>

                {appointments.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      No appointments scheduled
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      You haven't requested any physical walkthroughs yet. Find a property you like and click "Schedule a Visit".
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
                            <Link
                              to={`/property/${app.propertyId?._id}`}
                              className="font-heading font-bold text-base text-nearBlack hover:underline"
                            >
                              {app.propertyId?.title || 'Accommodation'}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-mutedSage" />
                              <span>{app.propertyId?.location?.locality || 'Bengaluru'}</span>
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={app.status} />
                          </div>
                        </div>

                        {/* Timing Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-warmOffWhite p-4 rounded-xl">
                          <div>
                            <span className="text-neutral-400 uppercase font-bold text-[10px] block">
                              Requested Date & Slot
                            </span>
                            <span className="font-semibold text-nearBlack mt-0.5 block">
                              {new Date(app.requestedDate).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-neutral-600">{app.requestedTime}</span>
                          </div>

                          {app.status === 'rescheduled' && app.proposedDate && (
                            <div className="bg-mutedGold/15 p-2 rounded-lg border border-mutedGold/30">
                              <span className="text-neutral-600 uppercase font-bold text-[10px] block">
                                Owner's Proposed Reschedule
                              </span>
                              <span className="font-bold text-nearBlack block">
                                {new Date(app.proposedDate).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-xs text-neutral-700">{app.proposedTime}</span>
                            </div>
                          )}

                          {app.ownerId?.phone && app.status === 'confirmed' && (
                            <div>
                              <span className="text-neutral-400 uppercase font-bold text-[10px] block">
                                Owner Contact
                              </span>
                              <a
                                href={`tel:${app.ownerId.phone}`}
                                className="font-bold text-nearBlack hover:text-mutedSage"
                              >
                                {app.ownerId.phone} ({app.ownerId.name})
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Owner Note / Reason */}
                        {app.ownerResponse && (
                          <div className="text-xs text-neutral-700 bg-lightSage/40 p-3 rounded-lg border border-mutedSage/20">
                            <strong>Owner Note:</strong> {app.ownerResponse}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          {app.status === 'rescheduled' && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleAcceptReschedule(app._id)}
                            >
                              Accept Proposed Reschedule
                            </Button>
                          )}

                          {['pending', 'confirmed', 'rescheduled'].includes(app.status) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-softRed border-softRed/20 hover:bg-softRed/5"
                              onClick={() => {
                                setSelectedAppointmentId(app._id);
                                setCancelModalOpen(true);
                              }}
                            >
                              Cancel Appointment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PROFILE & HOUSING PREFERENCES */}
            {currentTab === 'profile' && (
              <div className="bg-pureWhite p-8 rounded-2xl border border-warmSand shadow-subtle space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    Student Profile & Preferences
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Help owners know what kind of accommodation you are searching for.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Preferred Campus / Locality
                    </label>
                    <input
                      type="text"
                      value={preferredLocality}
                      onChange={(e) => setPreferredLocality(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                      placeholder="e.g. SG Palya, Koramangala"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Monthly Budget Target (₹)
                      </label>
                      <input
                        type="number"
                        value={profileBudget}
                        onChange={(e) => setProfileBudget(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Preferred Living Style
                      </label>
                      <select
                        value={profileCategory}
                        onChange={(e) => setProfileCategory(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                      >
                        <option value="Any">Any Accommodation</option>
                        <option value="Boys PG">Boys PG</option>
                        <option value="Girls PG">Girls PG</option>
                        <option value="Co-living">Co-Living</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={updatingProfile}
                    >
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* CANCEL APPOINTMENT MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Visit Appointment"
        subtitle="Please provide a brief reason for the owner"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Cancellation Reason
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
            >
              <option value="Change of plans">Change of plans / Schedule conflict</option>
              <option value="Found another accommodation">Found another accommodation</option>
              <option value="Distance from campus is too far">Distance from campus is too far</option>
              <option value="Other personal reason">Other personal reason</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              isLoading={cancelling}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
