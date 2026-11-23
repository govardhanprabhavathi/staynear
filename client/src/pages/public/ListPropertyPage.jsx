import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isOwner } = useAuth();

  const handleApplyClick = () => {
    if (isAuthenticated) {
      if (isOwner) {
        navigate('/owner/apply');
      } else {
        navigate('/owner/dashboard');
      }
    } else {
      navigate('/register?role=owner');
    }
  };

  return (
    <div className="min-h-screen bg-pureWhite text-nearBlack pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lightSage/70 border border-mutedSage/20 text-xs font-semibold text-nearBlack">
            <Building2 className="w-3.5 h-3.5 text-mutedSage" />
            <span>StayNear Partner Program for PG Owners</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-nearBlack tracking-tighter leading-[1.08]">
            Fill your rooms with verified students. Zero brokerage fees.
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 font-normal leading-relaxed">
            Connect directly with verified students and young professionals seeking accommodations around Christ University and Bengaluru's prime campuses.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Button size="lg" variant="primary" withArrow onClick={handleApplyClick}>
              Apply as a PG Owner
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
              Sign in to Owner Dashboard
            </Button>
          </div>
        </div>

        {/* Big Editorial Imagery Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-warmOffWhite border border-warmSand">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
              alt="Quality PG Room"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-warmOffWhite border border-warmSand">
            <img
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
              alt="Co-living Common Area"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-warmOffWhite border border-warmSand">
            <img
              src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=600&q=80"
              alt="Neat dining and living"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Why Owners Choose StayNear */}
        <div className="space-y-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
              The StayNear Advantage
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-nearBlack tracking-tight mt-1">
              Why list on StayNear?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-warmOffWhite border border-warmSand space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage font-bold text-sm">
                01
              </div>
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                Zero Broker Commission
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Retain 100% of your rental income. We do not take cuts or broker fees from your bookings.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-warmOffWhite border border-warmSand space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage font-bold text-sm">
                02
              </div>
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                Verified Owner Badge
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Gain immense trust from students and parents. Verified listings receive 3.5x more visit requests.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-warmOffWhite border border-warmSand space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage font-bold text-sm">
                03
              </div>
              <h3 className="font-heading font-bold text-xl text-nearBlack">
                Structured Visit Management
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                No random, unexpected door knocks. Students schedule appointment slots that you confirm or reschedule.
              </p>
            </div>
          </div>
        </div>

        {/* The 4-Step Onboarding Process */}
        <div className="p-10 sm:p-14 rounded-3xl bg-nearBlack text-pureWhite space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-lightSage">
              How It Works
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-pureWhite tracking-tight mt-1">
              From application to your first verified tenant.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="text-xs font-bold text-lightSage uppercase tracking-wider">
                Step 01
              </div>
              <h4 className="font-heading font-bold text-lg text-pureWhite">
                Apply & Submit Proof
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Register as an owner and upload your government ID and proof of property ownership or lease authorization.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-lightSage uppercase tracking-wider">
                Step 02
              </div>
              <h4 className="font-heading font-bold text-lg text-pureWhite">
                Admin Review
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Our operations team verifies your identity and authorization within 24–48 hours to grant listing rights.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-lightSage uppercase tracking-wider">
                Step 03
              </div>
              <h4 className="font-heading font-bold text-lg text-pureWhite">
                List Accommodation
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Use our 6-step property wizard to specify room sharing, rent, food menu, house rules, and upload high-res photos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-lightSage uppercase tracking-wider">
                Step 04
              </div>
              <h4 className="font-heading font-bold text-lg text-pureWhite">
                Receive Enquiries
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Get direct student enquiries and visit requests directly in your dashboard. Confirm visits and fill rooms.
              </p>
            </div>
          </div>
        </div>

        {/* Final Conversion Callout */}
        <div className="text-center py-6 space-y-4">
          <h2 className="font-heading font-extrabold text-3xl text-nearBlack">
            Begin your onboarding today.
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Join the network of respected PG owners providing quality accommodation to Bengaluru's students.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="primary" withArrow onClick={handleApplyClick}>
              Apply as a PG Owner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPropertyPage;
