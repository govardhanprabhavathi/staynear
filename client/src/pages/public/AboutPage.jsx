import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Heart, Compass, Sparkles, Building2, Users } from 'lucide-react';
import Button from '../../components/common/Button';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pureWhite text-nearBlack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Editorial Header */}
        <div className="space-y-6 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
            Our Manifesto & Philosophy
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-nearBlack tracking-tighter leading-[1.1]">
            Finding a home away from home should never be an ordeal.
          </h1>
          <p className="text-base sm:text-xl text-neutral-600 font-light leading-relaxed">
            Every semester, tens of thousands of students move to Bengaluru to attend Christ University and top institutions. Too often, they face exorbitant broker demands, misleading room photos, hidden maintenance surcharges, and unverified properties.
          </p>
        </div>

        {/* Big Editorial Image Section */}
        <div className="rounded-3xl overflow-hidden aspect-[21/9] bg-warmOffWhite border border-warmSand">
          <img
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=85"
            alt="Students collaborating in bright study space"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Why StayNear Exists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              The Problem
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-nearBlack tracking-tight">
              A fragmented market filled with uncertainty.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-normal">
              Before StayNear, students relied on handwritten posters, phone numbers taped to light poles, and aggressive agents who demanded a full month's rent as a commission fee just for introducing them to a PG owner.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
              The StayNear Solution
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-nearBlack tracking-tight">
              Curated clarity, verified owners, direct visits.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-normal">
              StayNear establishes a clean, editorial platform where every owner submits government identity and ownership documents before publishing. Students can browse freely, connect directly, and schedule physical walk-throughs with zero middleman markups.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-warmOffWhite p-8 sm:p-12 rounded-3xl border border-warmSand space-y-8">
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-nearBlack tracking-tight">
            Our Core Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-nearBlack">
                Radical Transparency
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Clear monthly rent, exact deposit amounts, food menus, and house rules. No hidden fees disclosed on move-in day.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-nearBlack">
                Respect for Privacy
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Owner verification documents are stored securely and never accessible by public bots or scraping services.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-lightSage flex items-center justify-center text-mutedSage">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-nearBlack">
                Student-First Focus
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tailored around campus walking distances, study needs, high-speed WiFi connectivity, and nutritious meals.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 space-y-4">
          <h2 className="font-heading font-extrabold text-3xl text-nearBlack">
            Ready to find your next stay?
          </h2>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/explore')}>
              Explore PGs
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
