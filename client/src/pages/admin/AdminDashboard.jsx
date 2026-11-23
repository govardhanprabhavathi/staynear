import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink,
  Lock,
  Eye,
  Filter,
  Trash2,
  RotateCcw,
  Flag,
  Calendar,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { adminService } from '../../services/adminService';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  // Metrics State
  const [metrics, setMetrics] = useState(null);
  const [ownerApplications, setOwnerApplications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Review Owner Modal State
  const [reviewOwnerModalOpen, setReviewOwnerModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Property Modal State
  const [reviewPropModalOpen, setReviewPropModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);
  const [propAction, setPropAction] = useState('approved');
  const [propRejectReason, setPropRejectReason] = useState('');
  const [submittingPropReview, setSubmittingPropReview] = useState(false);

  // Document Inspection Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docRef, setDocRef] = useState('');

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsData, ownersData, propsData, usersData, reportsData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getOwnerApplications('all'),
        adminService.getProperties('all'),
        adminService.getUsers({ role: userRoleFilter, search: userSearch }),
        adminService.getReports(),
      ]);

      if (metricsData.success) setMetrics(metricsData.metrics);
      setOwnerApplications(ownersData || []);
      setProperties(propsData || []);
      setAllUsers(usersData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [userRoleFilter]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Submit Owner Review
  const handleOwnerReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmittingReview(true);
    try {
      const res = await adminService.reviewOwnerApplication(selectedApp._id, {
        status: reviewAction,
        adminNotes,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason : '',
      });

      if (res.success) {
        showToast(`Owner application marked as ${reviewAction}.`, 'success');
        setReviewOwnerModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      showToast('Failed to update owner status.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Property Review
  const handlePropReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProp) return;

    setSubmittingPropReview(true);
    try {
      const res = await adminService.reviewProperty(selectedProp._id, {
        status: propAction,
        rejectionReason: propAction === 'rejected' ? propRejectReason : '',
      });

      if (res.success) {
        showToast(
          propAction === 'approved'
            ? 'Property approved! It is now live on StayNear explore.'
            : 'Property rejected with feedback.',
          'success'
        );
        setReviewPropModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      showToast('Failed to review property.', 'error');
    } finally {
      setSubmittingPropReview(false);
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(userId, nextStatus);
      showToast(`User account marked as ${nextStatus}.`, 'info');
      loadAdminData();
    } catch (err) {
      showToast('Failed to update user account status.', 'error');
    }
  };

  // Open Document Viewer
  const handleViewDocument = (title, ref) => {
    setDocTitle(title);
    setDocRef(ref);
    setDocModalOpen(true);
  };

  // Filter pending properties
  const pendingProperties = properties.filter((p) => p.approvalStatus === 'pending');
  const pendingOwners = ownerApplications.filter((a) => a.reviewStatus === 'pending');

  return (
    <div className="min-h-screen bg-warmOffWhite/30 text-nearBlack pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mutedSage bg-lightSage/50 px-3 py-1 rounded-full mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>StayNear Command Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-nearBlack tracking-tight">
            Platform Administration & Quality Control
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Review owner identity documents, inspect submitted accommodations, and oversee platform integrity.
          </p>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Navigation Sidebar / Mobile Scrollable Tab Bar */}
          <aside className="md:col-span-4 lg:col-span-3 bg-pureWhite p-2 sm:p-4 rounded-2xl border border-warmSand shadow-subtle flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 md:space-y-1">
            <button
              onClick={() => setTab('overview')}
              className={`shrink-0 whitespace-nowrap md:w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'overview'
                  ? 'bg-nearBlack text-pureWhite shadow-sm'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Metrics</span>
            </button>

            <button
              onClick={() => setTab('owners')}
              className={`shrink-0 whitespace-nowrap md:w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'owners'
                  ? 'bg-nearBlack text-pureWhite shadow-sm'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Owners</span>
              </div>
              {pendingOwners.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-mutedGold text-nearBlack font-bold">
                  {pendingOwners.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('properties')}
              className={`shrink-0 whitespace-nowrap md:w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'properties'
                  ? 'bg-nearBlack text-pureWhite shadow-sm'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Properties</span>
              </div>
              {pendingProperties.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-mutedGold text-nearBlack font-bold">
                  {pendingProperties.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('users')}
              className={`shrink-0 whitespace-nowrap md:w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'users'
                  ? 'bg-nearBlack text-pureWhite shadow-sm'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Users className="w-4 h-4 shrink-0" />
                <span>Users</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-warmSand text-nearBlack">
                {allUsers.length}
              </span>
            </button>

            <button
              onClick={() => setTab('reports')}
              className={`shrink-0 whitespace-nowrap md:w-full flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                currentTab === 'reports'
                  ? 'bg-nearBlack text-pureWhite shadow-sm'
                  : 'text-neutral-600 hover:bg-warmOffWhite hover:text-nearBlack'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Flag className="w-4 h-4 shrink-0" />
                <span>Reports</span>
              </div>
              {reports.filter((r) => r.status === 'pending').length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-softRed text-pureWhite font-bold">
                  {reports.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* TAB 1: OVERVIEW METRICS */}
            {currentTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Total Students
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.totalStudents ?? 0}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Verified Owners
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.approvedOwners ?? 0}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mutedSage block">
                      Active Listings
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.activeListings ?? 0}
                    </span>
                  </div>

                  <div className="bg-pureWhite p-5 rounded-2xl border border-warmSand shadow-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Total Enquiries
                    </span>
                    <span className="font-heading font-black text-2xl text-nearBlack mt-1 block">
                      {metrics?.totalEnquiries ?? 0}
                    </span>
                  </div>
                </div>

                {/* Moderation Queues Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Pending Owner Approvals */}
                  <div className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-nearBlack">
                        Owner Verification Queue ({pendingOwners.length})
                      </h3>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => setTab('owners')}
                        withArrow
                      >
                        Review
                      </Button>
                    </div>

                    {pendingOwners.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-4 text-center">
                        All owner applications have been reviewed!
                      </p>
                    ) : (
                      <div className="divide-y divide-warmSand/60">
                        {pendingOwners.slice(0, 3).map((app) => (
                          <div
                            key={app._id}
                            className="py-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-nearBlack">
                                {app.userId?.name}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {app.businessName || 'PG Business'} • {app.identityInformation?.idType}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedApp(app);
                                setReviewOwnerModalOpen(true);
                              }}
                            >
                              Inspect
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Property Approvals */}
                  <div className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-nearBlack">
                        Property Listings Queue ({pendingProperties.length})
                      </h3>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => setTab('properties')}
                        withArrow
                      >
                        Review
                      </Button>
                    </div>

                    {pendingProperties.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-4 text-center">
                        No property submissions waiting for review!
                      </p>
                    ) : (
                      <div className="divide-y divide-warmSand/60">
                        {pendingProperties.slice(0, 3).map((prop) => (
                          <div
                            key={prop._id}
                            className="py-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-nearBlack">
                                {prop.title}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {prop.location?.locality} • ₹{prop.monthlyRent}/mo
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedProp(prop);
                                setReviewPropModalOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OWNER APPLICATIONS */}
            {currentTab === 'owners' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    Owner Verification Applications ({ownerApplications.length})
                  </h2>
                </div>

                <div className="bg-pureWhite rounded-2xl border border-warmSand shadow-subtle overflow-hidden">
                  <div className="divide-y divide-warmSand/60">
                    {ownerApplications.map((app) => (
                      <div key={app._id} className="p-6 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-heading font-bold text-base text-nearBlack">
                              {app.userId?.name}
                            </span>
                            <span className="text-xs text-neutral-500 ml-2">
                              ({app.businessName || 'Individual Owner'})
                            </span>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              Phone: {app.userId?.phone} • Email: {app.userId?.email}
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={app.reviewStatus} />
                          </div>
                        </div>

                        {/* ID & Document reference row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs bg-warmOffWhite p-3 rounded-xl">
                          <div>
                            <span className="text-neutral-400 font-bold uppercase text-[10px]">
                              ID Type & Number
                            </span>
                            <div className="font-semibold text-nearBlack">
                              {app.identityInformation?.idType}: {app.identityInformation?.idNumber}
                            </div>
                          </div>

                          <div className="border-l border-warmSand/80 pl-4">
                            <span className="text-neutral-400 font-bold uppercase text-[10px]">
                              Submitted Documents
                            </span>
                            <div className="flex items-center gap-3 mt-0.5">
                              <button
                                onClick={() =>
                                  handleViewDocument(
                                    'Government ID Proof',
                                    app.identityDocumentReference
                                  )
                                }
                                className="text-mutedSage hover:underline font-bold flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Inspect ID Document</span>
                              </button>
                              <span>•</span>
                              <button
                                onClick={() =>
                                  handleViewDocument(
                                    'Property Authorization Proof',
                                    app.propertyOwnershipProofReference
                                  )
                                }
                                className="text-mutedSage hover:underline font-bold flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Inspect Ownership Proof</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewAction('approved');
                              setReviewOwnerModalOpen(true);
                            }}
                          >
                            Update Decision
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROPERTY MODERATION */}
            {currentTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    Property Moderation Queue ({properties.length})
                  </h2>
                </div>

                <div className="bg-pureWhite rounded-2xl border border-warmSand shadow-subtle overflow-hidden">
                  <div className="divide-y divide-warmSand/60">
                    {properties.map((prop) => (
                      <div key={prop._id} className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <img
                              src={prop.coverImage || prop.images?.[0]}
                              alt={prop.title}
                              className="w-20 h-20 rounded-xl object-cover bg-warmOffWhite shrink-0"
                            />
                            <div>
                              <h4 className="font-heading font-bold text-base text-nearBlack">
                                {prop.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                <span>{prop.accommodationType}</span>
                                <span>•</span>
                                <span>{prop.location?.locality}</span>
                                <span>•</span>
                                <span className="font-bold text-nearBlack">
                                  ₹{prop.monthlyRent?.toLocaleString('en-IN')}/mo
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-1">
                                Owner: {prop.ownerId?.name} ({prop.ownerId?.phone})
                              </div>
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={prop.approvalStatus} />
                          </div>
                        </div>

                        <div className="text-xs text-neutral-600 bg-warmOffWhite p-3 rounded-xl line-clamp-2">
                          {prop.description}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <Link
                            to={`/property/${prop._id}`}
                            className="text-xs font-semibold text-mutedSage hover:underline flex items-center gap-1"
                          >
                            <span>Inspect Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedProp(prop);
                              setPropAction('approved');
                              setReviewPropModalOpen(true);
                            }}
                          >
                            Moderate Listing
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: USER MANAGEMENT */}
            {currentTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="font-heading font-bold text-xl text-nearBlack">
                    Platform Users ({allUsers.length})
                  </h2>

                  {/* Role filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-bold uppercase">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="text-xs p-2 rounded-lg bg-pureWhite border border-warmSand text-nearBlack font-medium"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="owner">Owners</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                <div className="bg-pureWhite rounded-2xl border border-warmSand shadow-subtle overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-warmOffWhite border-b border-warmSand uppercase tracking-wider text-neutral-400 font-bold">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmSand/60">
                      {allUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-warmOffWhite/40">
                          <td className="p-4">
                            <div className="font-bold text-nearBlack">{u.name}</div>
                            <div className="text-neutral-400">{u.email}</div>
                          </td>
                          <td className="p-4 capitalize font-semibold text-neutral-700">
                            {u.role}
                          </td>
                          <td className="p-4 text-neutral-600">{u.phone}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                u.accountStatus === 'active'
                                  ? 'bg-lightSage text-nearBlack'
                                  : 'bg-softRed/20 text-softRed'
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                                className={`text-xs font-semibold ${
                                  u.accountStatus === 'active'
                                    ? 'text-softRed hover:underline'
                                    : 'text-mutedSage hover:underline'
                                }`}
                              >
                                {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: REPORTS */}
            {currentTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-xl text-nearBlack">
                  Reported Accommodations ({reports.length})
                </h2>

                {reports.length === 0 ? (
                  <div className="bg-pureWhite rounded-2xl border border-warmSand p-12 text-center max-w-md mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-mutedSage mx-auto mb-3" />
                    <h3 className="font-heading font-bold text-lg text-nearBlack">
                      Clean moderation record
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      No active user reports or safety flags currently open.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report._id}
                        className="bg-pureWhite p-6 rounded-2xl border border-warmSand shadow-subtle space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-nearBlack">
                              {report.reason}
                            </span>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              Property: {report.propertyId?.title} • Reporter: {report.reporterId?.name}
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-softRed/10 text-softRed border border-softRed/20 capitalize">
                            {report.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-700 bg-warmOffWhite p-3 rounded-xl">
                          "{report.description}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL 1: OWNER APPLICATION REVIEW */}
      <Modal
        isOpen={reviewOwnerModalOpen}
        onClose={() => setReviewOwnerModalOpen(false)}
        title="Review PG Owner Application"
        subtitle={`Applicant: ${selectedApp?.userId?.name}`}
      >
        <form onSubmit={handleOwnerReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Decision Action
            </label>
            <select
              value={reviewAction}
              onChange={(e) => setReviewAction(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="approved">Approve (Grant Publishing Rights)</option>
              <option value="rejected">Reject (Deny Application)</option>
              <option value="info_required">Request Additional Information</option>
            </select>
          </div>

          {reviewAction === 'rejected' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Reason for Rejection
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Identity document expired or mismatch"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Admin Notes / Internal Audit Log
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Verified Aadhaar against national database and verified property tax khata..."
              className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setReviewOwnerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submittingReview}
            >
              Save Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: PROPERTY MODERATION REVIEW */}
      <Modal
        isOpen={reviewPropModalOpen}
        onClose={() => setReviewPropModalOpen(false)}
        title="Moderate Accommodation Listing"
        subtitle={`Listing: ${selectedProp?.title}`}
      >
        <form onSubmit={handlePropReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Decision
            </label>
            <select
              value={propAction}
              onChange={(e) => setPropAction(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-warmOffWhite border border-warmSand text-nearBlack"
            >
              <option value="approved">Approve & Publish Live</option>
              <option value="rejected">Reject Listing</option>
            </select>
          </div>

          {propAction === 'rejected' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Reason for Rejection
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unrealistic rent or low quality blurry images"
                value={propRejectReason}
                onChange={(e) => setPropRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setReviewPropModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submittingPropReview}
            >
              Confirm Moderation
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: PRIVATE DOCUMENT INSPECTION */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title="Secure Document Access"
        subtitle={docTitle}
      >
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-lightSage flex items-center justify-center mx-auto text-mutedSage">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-nearBlack">Protected Document Reference:</div>
            <div className="text-xs font-mono bg-warmOffWhite p-2 rounded mt-1 text-neutral-600">
              {docRef || 'doc-sample-reference.pdf'}
            </div>
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            This document is stored in StayNear private object storage and is protected by administrative role authentication.
          </p>
          <div className="pt-2">
            <a
              href={`/api/admin/documents/${docRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-nearBlack text-pureWhite text-xs font-semibold hover:bg-black transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Document Stream</span>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
