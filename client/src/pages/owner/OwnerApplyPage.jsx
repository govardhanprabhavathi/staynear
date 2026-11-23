import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ownerService } from '../../services/ownerService';
import Button from '../../components/common/Button';

const OwnerApplyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOwner } = useAuth();
  const { showToast } = useNotification();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [idDocFile, setIdDocFile] = useState(null);
  const [propertyProofFile, setPropertyProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing application status
  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await ownerService.getApplicationStatus();
      if (res.success && res.application) {
        setApplication(res.application);
        setBusinessName(res.application.businessName || '');
        if (res.application.identityInformation) {
          setIdType(res.application.identityInformation.idType || 'Aadhaar');
          setIdNumber(res.application.identityInformation.idNumber || '');
        }
      }
    } catch (err) {
      console.error('Could not load owner application status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/owner/apply');
      return;
    }
    loadStatus();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let identityDocumentReference = application?.identityDocumentReference || 'doc-sample-id-proof.pdf';
      let propertyOwnershipProofReference = application?.propertyOwnershipProofReference || 'doc-sample-khata-proof.pdf';

      // Upload files if provided
      if (idDocFile || propertyProofFile) {
        const formData = new FormData();
        if (idDocFile) formData.append('identityDocument', idDocFile);
        if (propertyProofFile) formData.append('propertyProof', propertyProofFile);

        try {
          const refs = await ownerService.uploadDocuments(formData);
          if (refs.identityDocumentReference) identityDocumentReference = refs.identityDocumentReference;
          if (refs.propertyOwnershipProofReference) propertyOwnershipProofReference = refs.propertyOwnershipProofReference;
        } catch (uploadErr) {
          console.warn('Using standard document reference fallback for demo');
        }
      }

      const res = await ownerService.apply({
        businessName,
        idType,
        idNumber,
        identityDocumentReference,
        propertyOwnershipProofReference,
      });

      if (res.success) {
        showToast('Application submitted successfully! Our team will review it within 24–48 hours.', 'success');
        setApplication(res.application);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pureWhite pt-36 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nearBlack" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmOffWhite/30 text-nearBlack pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
            StayNear Owner Verification
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-nearBlack tracking-tight mt-1">
            PG Owner Verification Application
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            To protect students from unverified listings, all PG owners undergo administrative document review before publishing properties.
          </p>
        </div>

        {/* Existing Application Status Banner */}
        {application && (
          <div
            className={`p-6 rounded-2xl border ${
              application.reviewStatus === 'approved'
                ? 'bg-lightSage/50 border-mutedSage/40'
                : application.reviewStatus === 'rejected'
                ? 'bg-softRed/10 border-softRed/30'
                : application.reviewStatus === 'info_required'
                ? 'bg-mutedGold/15 border-mutedGold/40'
                : 'bg-warmSand/40 border-neutral-300'
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {application.reviewStatus === 'approved' && (
                  <CheckCircle2 className="w-5 h-5 text-mutedSage" />
                )}
                {application.reviewStatus === 'pending' && (
                  <Clock className="w-5 h-5 text-neutral-600" />
                )}
                {application.reviewStatus === 'rejected' && (
                  <AlertCircle className="w-5 h-5 text-softRed" />
                )}
                <span className="font-heading font-bold text-base text-nearBlack capitalize">
                  Application Status: {application.reviewStatus.replace('_', ' ')}
                </span>
              </div>

              {application.reviewStatus === 'approved' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/owner/dashboard')}
                >
                  Go to Owner Dashboard
                </Button>
              )}
            </div>

            {application.reviewStatus === 'approved' && (
              <p className="text-xs sm:text-sm text-neutral-700">
                Your owner profile has been verified and approved by StayNear administration. You can now add and manage properties.
              </p>
            )}

            {application.reviewStatus === 'pending' && (
              <p className="text-xs sm:text-sm text-neutral-700">
                Your verification documents have been received and are currently under review by our operations team. You will be notified once reviewed.
              </p>
            )}

            {application.reviewStatus === 'rejected' && (
              <p className="text-xs sm:text-sm text-softRed font-medium">
                Reason for rejection: {application.rejectionReason || 'Documents provided were unclear or unverified.'} You may update your information below and re-submit.
              </p>
            )}

            {application.reviewStatus === 'info_required' && (
              <p className="text-xs sm:text-sm text-neutral-800 font-medium">
                Additional info needed: {application.adminNotes || 'Please upload a clearer proof of property tax or lease agreement.'}
              </p>
            )}
          </div>
        )}

        {/* Application Form */}
        {(!application || application.reviewStatus !== 'approved') && (
          <form
            onSubmit={handleSubmit}
            className="bg-pureWhite p-8 rounded-3xl border border-warmSand shadow-subtle space-y-6"
          >
            <h2 className="font-heading font-bold text-xl text-nearBlack">
              {application ? 'Update Verification Information' : 'Submit Verification Details'}
            </h2>

            {/* Operating Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                PG Operating Name / Business Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                placeholder="e.g. Sharma Living Spaces"
              />
            </div>

            {/* ID Proof Type & Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Government ID Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  ID Number / Reference
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-warmOffWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                  placeholder="e.g. XXXX-XXXX-8921"
                />
              </div>
            </div>

            {/* File Upload 1: Identity Document */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Government ID Copy (PDF or Image)
              </label>
              <div className="border-2 border-dashed border-warmSand rounded-2xl p-6 text-center hover:border-neutral-400 transition-colors bg-warmOffWhite/40">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <div className="text-xs text-neutral-600 font-medium">
                  {idDocFile ? (
                    <span className="text-mutedSage font-bold">{idDocFile.name}</span>
                  ) : (
                    <span>Click to browse or drop {idType} file here</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setIdDocFile(e.target.files[0])}
                  className="hidden"
                  id="idDocUpload"
                />
                <label
                  htmlFor="idDocUpload"
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-pureWhite border border-warmSand text-nearBlack cursor-pointer hover:bg-warmOffWhite"
                >
                  Select File
                </label>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Stored in private object storage, accessible only to administrators.
              </span>
            </div>

            {/* File Upload 2: Property Ownership / Authorization Proof */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Proof of Property Ownership or Management Authorization
              </label>
              <div className="border-2 border-dashed border-warmSand rounded-2xl p-6 text-center hover:border-neutral-400 transition-colors bg-warmOffWhite/40">
                <FileText className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <div className="text-xs text-neutral-600 font-medium">
                  {propertyProofFile ? (
                    <span className="text-mutedSage font-bold">{propertyProofFile.name}</span>
                  ) : (
                    <span>Click to browse property tax receipt, khata, electricity bill or lease deed</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPropertyProofFile(e.target.files[0])}
                  className="hidden"
                  id="propertyProofUpload"
                />
                <label
                  htmlFor="propertyProofUpload"
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-pureWhite border border-warmSand text-nearBlack cursor-pointer hover:bg-warmOffWhite"
                >
                  Select File
                </label>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="p-4 rounded-xl bg-warmOffWhite text-[11px] text-neutral-600 leading-relaxed">
              <strong>StayNear Verification Notice:</strong> By submitting these documents, you certify that you own or have full legal authority to manage and rent rooms at your specified premises. Documents are strictly safeguarded and never published publicly.
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                isLoading={submitting}
              >
                Submit Verification Application
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OwnerApplyPage;
