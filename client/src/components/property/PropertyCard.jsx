import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, ArrowUpRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { CategoryBadge } from '../common/Badge';
import { useFavourites } from '../../context/FavouritesContext';

const PropertyCard = ({ property, priority = false }) => {
  const navigate = useNavigate();
  const { isFavorited, toggleFavourite } = useFavourites();

  if (!property) return null;

  const saved = isFavorited(property._id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/property/${property._id}`)}
      className="group cursor-pointer bg-pureWhite rounded-xl border border-hairline overflow-hidden transition-all duration-300 hover:border-nearBlack hover:shadow-elevated flex flex-col h-full"
    >
      {/* Image Container with Architectural Aspect */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-surfaceMuted">
        <img
          src={property.coverImage || property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {property.isSponsored && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7A4E0B] bg-[#FBF3E4]/95 backdrop-blur-sm px-2 py-0.5 rounded border border-[#E7C98F]">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>Trending</span>
            </span>
          )}
          <CategoryBadge category={property.accommodationType} />
          {property.isOwnerVerified !== false && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-mutedSage bg-pureWhite/90 backdrop-blur-sm px-2 py-0.5 rounded border border-hairline">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Minimal Favourite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pureWhite/90 backdrop-blur-sm border border-hairline flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              saved ? 'fill-softRed text-softRed' : 'text-neutral-500 hover:text-softRed'
            }`}
          />
        </button>

        {/* Subtle Availability */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-nearBlack/80 text-pureWhite backdrop-blur-sm">
            {property.availability || 'Available'}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Locality & Campus Distance */}
          <div className="flex items-center gap-1.5 text-xs text-textMuted font-mono mb-1.5">
            <MapPin className="w-3 h-3 text-mutedSage shrink-0" />
            <span className="truncate">{property.location?.locality || 'Bengaluru'}</span>
            {property.location?.distanceToCampus && (
              <>
                <span>•</span>
                <span className="text-textSecondary">{property.location.distanceToCampus} to campus</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-base text-nearBlack tracking-tight group-hover:text-mutedSage transition-colors line-clamp-1">
            {property.title}
          </h3>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-textSecondary mt-2">
            <span>{property.sharingType} Sharing</span>
            {property.foodAvailability?.included && (
              <>
                <span>•</span>
                <span>Meals Included</span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & Link */}
        <div className="pt-3.5 border-t border-hairline flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-textMuted block">
              Monthly
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-heading font-extrabold text-lg text-nearBlack tabular-nums">
                ₹{property.monthlyRent?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-textMuted">/mo</span>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full border border-hairline group-hover:border-nearBlack flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-nearBlack transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
