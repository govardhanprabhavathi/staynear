import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Phone,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Check,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { SAMPLE_PROPERTIES } from '../../data/sampleProperties';

// 12 Floating portraits & room photos for TAL-style scattered hero
const SCATTERED_CARDS = [
  { img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', rotate: -12, top: '9%', left: '4%', anim: 'animate-float-1', yRange: [-20, 40] },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', rotate: 14, top: '5%', left: '26%', anim: 'animate-float-2', yRange: [-35, 60] },
  { img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80', rotate: -8, top: '7%', right: '28%', anim: 'animate-float-3', yRange: [-25, 45] },
  { img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', rotate: 16, top: '10%', right: '5%', anim: 'animate-float-1', yRange: [-40, 70] },
  { img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', rotate: -15, top: '38%', left: '2%', anim: 'animate-float-3', yRange: [-15, 30] },
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', rotate: 10, top: '42%', right: '3%', anim: 'animate-float-2', yRange: [-30, 50] },
  { img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80', rotate: 8, bottom: '14%', left: '5%', anim: 'animate-float-1', yRange: [0, 80] },
  { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80', rotate: -10, bottom: '16%', right: '6%', anim: 'animate-float-2', yRange: [0, 90] },
  { img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80', rotate: 6, bottom: '6%', left: '24%', anim: 'animate-float-3', yRange: [10, 60] },
  { img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', rotate: -14, bottom: '7%', right: '22%', anim: 'animate-float-1', yRange: [15, 75] },
];

const FEATURED_CAMPUS_PGS = [
  { name: 'Trends Living Spaces', subtitle: 'SG Palya · 200m to Gate 1' },
  { name: 'Pezzles', subtitle: 'Tavarekere · 380m to Campus' },
  { name: 'Singapore PG', subtitle: 'Christ Main Gate · 150m' },
  { name: 'Shivam Living Spaces', subtitle: 'SG Palya 2nd Cross · 280m' },
  { name: 'Livoza', subtitle: 'Koramangala 1st · 600m' },
  { name: 'Bellave Boys & Girls PG', subtitle: 'SG Palya 1st Cross · 220m' },
  { name: 'Zendal Serenity Luxury Living', subtitle: 'Koramangala · 500m' },
  { name: 'Mirai by Mayos Homes', subtitle: 'Bhavani Nagar · 350m' },
  { name: 'Preva Enclave Boys PG', subtitle: 'SG Palya Main · 300m' },
  { name: 'Fly Homes', subtitle: 'Tavarekere Hub · 450m' },
  { name: 'SN Comforts Boys PG', subtitle: 'Christ Gate 1 · 180m' },
  { name: 'Green View Executive', subtitle: 'Dairy Circle · 520m' },
];

const DEMO_PROPERTIES = SAMPLE_PROPERTIES;

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [properties, setProperties] = useState(DEMO_PROPERTIES);
  const [activePropIndex, setActivePropIndex] = useState(0);
  const [quickPhone, setQuickPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [direction, setDirection] = useState(1);

  // Parallax scroll hook
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);
  const heroTranslateY = useTransform(scrollY, [0, 400], [0, 60]);

  // Click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const data = await propertyService.getProperties({ limit: 6 });
        if (data.success && data.properties.length > 0) {
          const enriched = data.properties.map((p, idx) => ({
            ...p,
            quote: p.quote || (idx % 2 === 0
              ? 'Ergonomic study desks, quiet study hours, and freshly prepared North & South Indian meals.'
              : 'Multi-tier biometric security, high-speed fiber, and serene study areas.'),
            walkTime: p.location?.distanceToCampus ? `${p.location.distanceToCampus} to campus` : '5 min walk',
          }));
          setProperties(enriched);
        }
      } catch (err) {
        console.error('Using demo properties:', err);
      }
    };
    fetchProps();
  }, []);

  const activeProperty = properties[activePropIndex] || DEMO_PROPERTIES[0];

  const handleNextStay = () => {
    setDirection(1);
    setActivePropIndex((prev) => (prev + 1) % properties.length);
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickPhone.trim()) {
      navigate(`/register?phone=${encodeURIComponent(`${selectedCountry.code} ${quickPhone.trim()}`)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121212] overflow-x-hidden selection:bg-[#DCEBE3]">
      {/* 1. TAL-STYLE SCATTERED HERO SECTION (IMAGE 1) */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-24 sm:pt-40 sm:pb-36 flex flex-col items-center justify-center text-center px-4 overflow-hidden min-h-[88vh]"
      >
        {/* Floating Scattered Squircles in Background with subtle CSS float and parallax */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {SCATTERED_CARDS.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.8, delay: idx * 0.04 }}
              style={{
                top: card.top,
                bottom: card.bottom,
                left: card.left,
                right: card.right,
                transform: `rotate(${card.rotate}deg)`,
              }}
              className={`absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-elevated border border-black/[0.06] p-1 ${card.anim}`}
            >
              <img
                src={card.img}
                alt="Student & space preview"
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
              />
            </motion.div>
          ))}
        </div>

        {/* Central Content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroTranslateY }}
          className="relative z-10 max-w-4xl mx-auto space-y-7"
        >
          {/* Main Huge Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-[#111111] leading-[0.98]"
          >
            Find your stay <br />
            near campus
          </motion.h1>

          {/* Minimalist Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-neutral-600 font-medium max-w-xl mx-auto"
          >
            A simple, direct way for students to discover verified rooms around Christ University. Zero brokers, zero middleman fees.
          </motion.p>

          {/* Value Props Bar with Hairline Dividers (Honest, direct student guarantees) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-center"
          >
            <div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                Direct Owners
              </div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                talk directly to landlords
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-black/[0.08]" />

            <div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                Zero Brokerage
              </div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                never pay agent commissions
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-black/[0.08]" />

            <div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                Inspect In Person
              </div>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                visit rooms before deciding
              </div>
            </div>
          </motion.div>

          {/* TAL Pill Button with Micro-Arrow (Matching Image 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4"
          >
            <button
              onClick={() => navigate('/explore')}
              className="px-8 py-3.5 rounded-full bg-black text-white font-heading font-bold text-sm tracking-tight inline-flex items-center gap-2 shadow-floating hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Explore Residences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. TOP VERIFIED PGS AROUND CHRIST UNIVERSITY (MATCHING IMAGE 2) */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
            VERIFIED PGS & RESIDENCES AROUND CHRIST UNIVERSITY CAMPUS
          </span>
        </motion.div>

        {/* 2 Rows x 6 Columns Hairline Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl border border-black/[0.08] shadow-sm overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          {FEATURED_CAMPUS_PGS.map((pg, idx) => {
            const isLastInLgRow = idx % 6 === 5;
            const isLastInSmRow = idx % 3 === 2;
            const isLastInBaseRow = idx % 2 === 1;
            const isBottomLgRow = idx >= 6;
            const isBottomSmRow = idx >= 9;
            const isBottomBaseRow = idx >= 10;

            return (
              <div
                key={idx}
                onClick={() => navigate(`/explore?search=${encodeURIComponent(pg.name)}`)}
                className={`p-5 flex flex-col items-center justify-center text-center hover:bg-neutral-50/80 transition-all group cursor-pointer active:scale-95 border-black/[0.06] ${
                  !isLastInBaseRow ? 'border-r sm:border-r-0 ' : ''
                }${
                  !isLastInSmRow ? 'sm:border-r lg:border-r-0 ' : ''
                }${
                  !isLastInLgRow ? 'lg:border-r ' : ''
                }${
                  !isBottomBaseRow ? 'border-b ' : ''
                }${
                  isBottomSmRow ? 'sm:border-b-0 ' : 'sm:border-b '
                }${
                  isBottomLgRow ? 'lg:border-b-0 ' : 'lg:border-b '
                }`}
                title={`Explore ${pg.name}`}
              >
                <span className="font-heading font-bold text-xs sm:text-[13px] text-black group-hover:text-mutedSage transition-colors tracking-tight line-clamp-1">
                  {pg.name}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">
                  {pg.subtitle}
                </span>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. INTERACTIVE RESIDENCE SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 space-y-2"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-mutedSage font-bold">
            CAMPUS RESIDENCE SHOWCASE
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-black tracking-tight">
            Meet the accommodation before you visit.
          </h2>
        </motion.div>

        {/* The Card Container */}
        <div className="bg-white rounded-[32px] border border-black/[0.08] shadow-floating p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProperty._id || activePropIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Left: Aspect Ratio Photo with Live Green Dot Pill */}
              <div className="md:col-span-5 relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 shadow-inner">
                <img
                  src={activeProperty.coverImage || activeProperty.images?.[0]}
                  alt={activeProperty.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Available today</span>
                  </span>
                </div>
              </div>

              {/* Right: Detailed Specification */}
              <div className="md:col-span-7 space-y-5">
                {/* Name & Subtitle */}
                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                    {activeProperty.title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-1">
                    {activeProperty.location?.locality} · {activeProperty.location?.landmark}
                  </p>
                </div>

                {/* Badges Pill Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-black tabular-nums">
                    ₹{activeProperty.monthlyRent?.toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700">
                    {activeProperty.sharingType} Sharing
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E2ECE6] text-mutedSage">
                    {activeProperty.accommodationType}
                  </span>
                </div>

                {/* Direct Owner Connection Highlight */}
                <div className="flex items-center gap-3.5 py-1">
                  <div className="w-10 h-10 rounded-2xl bg-lightSage/70 flex items-center justify-center text-mutedSage shrink-0">
                    <ShieldCheck className="w-5 h-5 text-mutedSage" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">Direct Owner Connection</div>
                    <div className="text-xs text-neutral-500 font-light">
                      Verified owner profiles. Connect and schedule physical visits directly.
                    </div>
                  </div>
                </div>

                {/* Curator Highlight Box */}
                <div className="bg-[#F6F5F2] p-4 rounded-2xl space-y-1">
                  <div className="text-[11px] font-mono uppercase text-neutral-500 font-bold">
                    Curator's Note
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-black leading-snug">
                    "{activeProperty.quote || 'Ergonomic study desks, quiet study hours, and freshly prepared North & South Indian meals.'}"
                  </p>
                </div>

                {/* Amenities Pills */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-2 font-semibold">
                    What this stay brings to you
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeProperty.amenities?.slice(0, 4).map((am, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-100 text-neutral-700"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Journey / Location Row */}
                <div className="pt-2 border-t border-black/[0.04] flex items-center gap-2 text-xs text-neutral-500">
                  <MapPin className="w-3.5 h-3.5 text-mutedSage" />
                  <span className="font-medium text-neutral-700">{activeProperty.walkTime || '4 min walk to campus'}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Card Bottom Bar (Matching Image 3) */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-heading font-black text-xs">
                SN
              </div>
              <span className="text-xs font-bold text-black hidden sm:inline-block">StayNear Verified</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNextStay}
                className="px-5 py-2.5 rounded-full border border-black/[0.12] text-xs font-bold text-neutral-700 hover:border-black hover:text-black transition-all active:scale-95"
              >
                ✕ Next Stay
              </button>

              <button
                onClick={() => navigate(`/property/${activeProperty._id || ''}`)}
                className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-neutral-800 transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Visit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW STAYNEAR HELPS (HONEST & HELPFUL VALUE PROPOSITION) */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:text-left"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-mutedSage font-bold">
            BUILT FOR STUDENTS
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-black tracking-tight mt-1">
            A simpler way to find your room
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
            We started StayNear to help Christ University students find dependable accommodation within walking distance, directly from verified landlords.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card: Walking distance stays */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl border border-black/[0.08] shadow-sm p-8 flex flex-col justify-between space-y-6 group"
          >
            <div>
              <div className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                Walking distance to campus
              </div>
              <p className="text-sm font-medium text-neutral-600 mt-1">
                Curated rooms across SG Palya, Tavarekere, and Koramangala. 200m to 600m from Gate 1 and Gate 2.
              </p>
            </div>

            {/* Stacked Fan Preview Cards with Hover Interactive Spread */}
            <div className="relative h-56 flex items-center justify-center">
              <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-lg border border-black/[0.08] transform -rotate-12 translate-x-[-30px] group-hover:-rotate-16 group-hover:translate-x-[-42px] transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80"
                  alt="Student room"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08] transform rotate-2 z-10 group-hover:scale-105 transition-transform duration-500 relative">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80"
                  alt="Student studying"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md rounded-lg p-1.5 text-center">
                  <span className="text-[9px] font-medium text-white leading-tight block">
                    Zero commute to campus
                  </span>
                </div>
              </div>
              <div className="w-36 h-48 rounded-2xl overflow-hidden shadow-lg border border-black/[0.08] transform rotate-12 translate-x-[30px] group-hover:rotate-16 group-hover:translate-x-[42px] transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80"
                  alt="Co-living lounge"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Card: Direct contact with landlords */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-3xl border border-black/[0.08] shadow-sm p-8 flex flex-col justify-between space-y-6"
          >
            <div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                Direct contact with property owners
              </h3>
              <p className="text-sm font-medium text-neutral-600 mt-1">
                No middleman brokers taking commissions or pushing unauthorized properties.
              </p>
            </div>

            {/* Nested Card with Honest Value Points */}
            <div className="bg-[#FAF9F6] rounded-2xl border border-black/[0.06] p-6 text-left space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E2ECE6] flex items-center justify-center text-mutedSage shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-heading font-bold text-sm text-black">
                    Transparent Student Stays
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    What you see is what you pay
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mutedSage shrink-0" />
                  <span>Verified photos of rooms and facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mutedSage shrink-0" />
                  <span>Direct phone contact to arrange visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mutedSage shrink-0" />
                  <span>Inspect the room in person before paying any token</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">Zero commission fee</span>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-mutedSage bg-[#E2ECE6] px-2.5 py-1 rounded-full">
                  100% Free for Students
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. MINIMAL TAL PHONE / QUICK BOOK BANNER (MATCHING IMAGE 5) */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-black tracking-tight whitespace-nowrap">
            Find your stay near campus
          </h2>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-semibold text-neutral-800 whitespace-nowrap">
              Discover verified student rooms around Christ University
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 font-light whitespace-nowrap">
              Enter your mobile number to receive curated room options directly
            </p>
          </div>
        </motion.div>

        {/* TAL Pill Input (Matching Image 5) */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleQuickSubmit}
          className="pt-3 max-w-md mx-auto space-y-4"
        >
          <div className="relative flex items-center px-4 py-3.5 rounded-full border border-black/20 bg-white shadow-sm focus-within:border-black transition-colors">
            {/* Interactive Country Code Dropdown Trigger */}
            <div className="relative" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 pr-3 border-r border-black/15 shrink-0 whitespace-nowrap select-none hover:text-black transition-colors focus:outline-none"
                aria-label="Select country code"
                aria-expanded={countryDropdownOpen}
              >
                <span className="text-base leading-none">{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 shrink-0 transition-transform duration-200 ${
                    countryDropdownOpen ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>

              {/* Animated Floating Country Code Menu */}
              <AnimatePresence>
                {countryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto rounded-2xl bg-white border border-black/10 shadow-floating py-2 z-50 text-left"
                  >
                    <div className="px-3.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold border-b border-black/[0.06] mb-1">
                      Select Country Code
                    </div>
                    {COUNTRY_CODES.map((item) => (
                      <button
                        key={item.code + item.country}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(item);
                          setCountryDropdownOpen(false);
                          phoneInputRef.current?.focus();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-neutral-100 ${
                          selectedCountry.code === item.code ? 'bg-neutral-50 text-black font-bold' : 'text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{item.flag}</span>
                          <span className="truncate max-w-[130px]">{item.country}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-neutral-500">{item.code}</span>
                          {selectedCountry.code === item.code && (
                            <Check className="w-3.5 h-3.5 text-black shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              ref={phoneInputRef}
              type="tel"
              placeholder="98765 43210"
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
              className="w-full pl-3 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 bg-transparent focus:outline-none tracking-wide"
            />
          </div>

          <p className="text-[11px] sm:text-xs text-neutral-400 whitespace-nowrap">
            We’ll text you instant verified links and campus map
          </p>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-black text-white font-heading font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 shadow-floating hover:bg-neutral-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] sm:text-[11px] text-neutral-400 pt-1 whitespace-nowrap">
            By requesting a code, you agree to StayNear's Terms of Service and Privacy Policy.
          </p>
        </motion.form>
      </section>

      {/* 6. MINIMAL TAL FOOTER (MATCHING IMAGE 5) */}
      <footer className="border-t border-black/[0.06] py-10 px-6 sm:px-12 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex flex-col items-center justify-center font-heading font-black text-[11px] tracking-tighter leading-none shadow-sm">
              <span>stay</span>
              <span className="text-[7px] text-[#DCEBE3] uppercase">NEAR</span>
            </div>
            <span className="text-neutral-400 font-mono">© 2026 staynear</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-neutral-600">
            <Link to="/list-property" className="hover:text-black transition-colors">For Owners</Link>
            <Link to="/about" className="hover:text-black transition-colors">About</Link>
            <Link to="/contact" className="hover:text-black transition-colors">Support</Link>
            <Link to="/explore" className="hover:text-black transition-colors">Looking for a PG? Explore stays</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

