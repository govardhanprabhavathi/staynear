import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';

const LOCALITIES = [
  'All',
  'SG Palya',
  'Koramangala',
  'Tavarekere',
  'BTM Layout',
  'HSR Layout',
  'Bannerghatta Road',
];

const CATEGORIES = ['All', 'Boys PG', 'Girls PG', 'Co-living'];
const SHARING_OPTIONS = ['All', 'Single', 'Double', 'Triple', 'Four'];

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
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minRent, setMinRent] = useState(searchParams.get('minRent') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('maxRent') || '');
  const [sharing, setSharing] = useState(searchParams.get('sharing') || 'All');
  const [foodOnly, setFoodOnly] = useState(searchParams.get('food') === 'true');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Drawer state for mobile
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Results State
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('locality')) setLocality(searchParams.get('locality'));
    if (searchParams.get('category')) setCategory(searchParams.get('category'));
    if (searchParams.get('minRent')) setMinRent(searchParams.get('minRent'));
    if (searchParams.get('maxRent')) setMaxRent(searchParams.get('maxRent'));
    if (searchParams.get('sharing')) setSharing(searchParams.get('sharing'));
    if (searchParams.get('food')) setFoodOnly(searchParams.get('food') === 'true');
  }, [searchParams]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (locality !== 'All') params.locality = locality;
        if (category !== 'All') params.category = category;
        if (minRent) params.minRent = minRent;
        if (maxRent) params.maxRent = maxRent;
        if (sharing !== 'All') params.sharing = sharing;
        if (foodOnly) params.food = 'true';
        if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
        if (sort) params.sort = sort;

        const data = await propertyService.getProperties(params);
        if (data.success) {
          setProperties(data.properties);
          setTotalCount(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [search, locality, category, minRent, maxRent, sharing, foodOnly, selectedAmenities, sort]);

  const handleToggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleClearAll = () => {
    setSearch('');
    setLocality('All');
    setCategory('All');
    setMinRent('');
    setMaxRent('');
    setSharing('All');
    setFoodOnly(false);
    setSelectedAmenities([]);
    setSort('newest');
    setSearchParams({});
  };

  const activeFilters = [];
  if (locality !== 'All') activeFilters.push({ label: locality, clear: () => setLocality('All') });
  if (category !== 'All') activeFilters.push({ label: category, clear: () => setCategory('All') });
  if (sharing !== 'All') activeFilters.push({ label: `${sharing} Sharing`, clear: () => setSharing('All') });
  if (foodOnly) activeFilters.push({ label: 'Meals Included', clear: () => setFoodOnly(false) });
  if (minRent) activeFilters.push({ label: `Min ₹${minRent}`, clear: () => setMinRent('') });
  if (maxRent) activeFilters.push({ label: `Max ₹${maxRent}`, clear: () => setMaxRent('') });
  selectedAmenities.forEach((a) => {
    activeFilters.push({ label: a, clear: () => handleToggleAmenity(a) });
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-nearBlack pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-hairline">
          <span className="font-mono text-[10px] uppercase tracking-widest text-mutedSage">
            [ DIRECTORY ]
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1.5">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-nearBlack tracking-tight">
                Accommodations
              </h1>
              <p className="text-xs text-textMuted font-mono mt-1">
                Showing {totalCount} verified stay{totalCount === 1 ? '' : 's'} around campus.
              </p>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex items-center gap-3 md:hidden">
              <Button
                variant="secondary"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setMobileFilterOpen(true)}
              >
                Filters ({activeFilters.length})
              </Button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs py-2 px-3 rounded-full bg-pureWhite border border-hairline text-nearBlack"
              >
                <option value="newest">Recently Added</option>
                <option value="rent_asc">Rent: Low to High</option>
                <option value="rent_desc">Rent: High to Low</option>
                <option value="relevance">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar Strip */}
        <div className="bg-pureWhite p-3 rounded-xl border border-hairline mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, landmark, or street..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surfaceMuted/50 border border-transparent focus:border-nearBlack text-nearBlack placeholder:text-textMuted focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-nearBlack"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-textMuted">
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg bg-surfaceMuted/60 border border-hairline text-nearBlack focus:outline-none cursor-pointer"
            >
              <option value="newest">Recently Added</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
              <option value="relevance">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[11px] font-mono text-textMuted">Active:</span>
            {activeFilters.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-pureWhite border border-hairline text-nearBlack"
              >
                <span>{f.label}</span>
                <button
                  onClick={f.clear}
                  className="hover:text-softRed p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="text-[11px] font-mono text-mutedSage hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 bg-pureWhite p-6 rounded-xl border border-hairline space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <span className="font-heading font-bold text-sm text-nearBlack">
                Refine
              </span>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-mono text-textMuted hover:text-nearBlack flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                Living Style
              </label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      category === cat
                        ? 'bg-nearBlack text-pureWhite'
                        : 'text-textSecondary hover:bg-surfaceMuted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Locality */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                Locality
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Rent Range */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                Monthly Rent (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
                />
              </div>
            </div>

            {/* Room Sharing */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                Room Sharing
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SHARING_OPTIONS.map((share) => (
                  <button
                    key={share}
                    onClick={() => setSharing(share)}
                    className={`text-[11px] py-1.5 px-2 rounded font-medium text-center border transition-all ${
                      sharing === share
                        ? 'bg-nearBlack text-pureWhite border-nearBlack'
                        : 'bg-surfaceMuted/40 text-textSecondary border-hairline hover:border-nearBlack'
                    }`}
                  >
                    {share}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Included */}
            <div className="pt-2 border-t border-hairline">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-nearBlack">
                  Meals Included
                </span>
                <input
                  type="checkbox"
                  checked={foodOnly}
                  onChange={(e) => setFoodOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-mutedSage focus:ring-0 accent-mutedSage cursor-pointer"
                />
              </label>
            </div>

            {/* Amenities */}
            <div className="pt-2 border-t border-hairline">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                Amenities
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {AMENITY_OPTIONS.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-xs text-textSecondary hover:text-nearBlack cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleToggleAmenity(amenity)}
                      className="w-3.5 h-3.5 rounded text-mutedSage focus:ring-0 accent-mutedSage"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Main Results */}
          <main className="col-span-1 md:col-span-8 lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-pureWhite rounded-xl border border-hairline h-80 flex flex-col p-4 gap-3"
                  >
                    <div className="bg-surfaceMuted rounded-lg h-44 w-full" />
                    <div className="bg-surfaceMuted rounded h-4 w-3/4" />
                    <div className="bg-surfaceMuted rounded h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-pureWhite rounded-xl border border-hairline p-12 text-center max-w-md mx-auto my-8">
                <h3 className="font-heading font-bold text-lg text-nearBlack">
                  No accommodations found
                </h3>
                <p className="text-xs text-textMuted mt-1 max-w-xs mx-auto">
                  Try adjusting your budget or selecting all localities.
                </p>
                <div className="mt-5">
                  <Button variant="primary" size="sm" onClick={handleClearAll}>
                    Reset filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            <div
              className="fixed inset-0 bg-nearBlack/40 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xs bg-pureWhite h-full shadow-floating overflow-y-auto p-6 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <span className="font-heading font-bold text-base text-nearBlack">
                    Filter Stays
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-textMuted hover:text-nearBlack"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Living Style */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                    Living Style
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-center text-xs py-2 px-2.5 rounded-lg font-medium transition-colors ${
                          category === cat
                            ? 'bg-nearBlack text-pureWhite'
                            : 'bg-surfaceMuted/40 text-textSecondary border border-hairline'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locality */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                    Locality
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
                  >
                    {LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly Rent */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                    Monthly Rent (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minRent}
                      onChange={(e) => setMinRent(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-surfaceMuted/50 border border-hairline text-nearBlack focus:outline-none"
                    />
                  </div>
                </div>

                {/* Room Sharing */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                    Room Sharing
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SHARING_OPTIONS.map((share) => (
                      <button
                        key={share}
                        onClick={() => setSharing(share)}
                        className={`text-[11px] py-1.5 px-2 rounded font-medium text-center border transition-all ${
                          sharing === share
                            ? 'bg-nearBlack text-pureWhite border-nearBlack'
                            : 'bg-surfaceMuted/40 text-textSecondary border-hairline hover:border-nearBlack'
                        }`}
                      >
                        {share}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meals */}
                <div className="pt-2 border-t border-hairline">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-nearBlack">
                      Meals Included
                    </span>
                    <input
                      type="checkbox"
                      checked={foodOnly}
                      onChange={(e) => setFoodOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-mutedSage focus:ring-0 accent-mutedSage cursor-pointer"
                    />
                  </label>
                </div>

                {/* Amenities */}
                <div className="pt-2 border-t border-hairline">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-textMuted mb-2">
                    Amenities
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {AMENITY_OPTIONS.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 text-xs text-textSecondary hover:text-nearBlack cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="w-3.5 h-3.5 rounded text-mutedSage focus:ring-0 accent-mutedSage"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply & Close */}
              <div className="pt-4 border-t border-hairline flex gap-3">
                <Button
                  variant="secondary"
                  className="w-1/2 justify-center"
                  onClick={handleClearAll}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  className="w-1/2 justify-center"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Show Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;
