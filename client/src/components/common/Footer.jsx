import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  // HomePage already contains the minimal TAL-style footer
  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer className="bg-[#FAF9F5] border-t border-hairline text-textSecondary pt-16 sm:pt-20 pb-12 sm:pb-14 text-xs font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-hairline">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tighter text-nearBlack">
                Stay<span className="font-serif italic font-normal text-mutedSage">Near</span>
              </span>
            </Link>
            <p className="text-textSecondary max-w-sm leading-relaxed text-xs">
              Curated, verified student and professional accommodations surrounding Christ University and Bengaluru's central tech corridors.
            </p>
            <div className="pt-1 font-mono text-[10px] uppercase tracking-wider text-mutedSage">
              Pure Discovery & Visit Engine • Zero Brokerage
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-textMuted block">
              Living Styles
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?category=Boys+PG" className="hover:text-nearBlack transition-colors">
                  Boys PG
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Girls+PG" className="hover:text-nearBlack transition-colors">
                  Girls PG
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Co-living" className="hover:text-nearBlack transition-colors">
                  Co-Living Spaces
                </Link>
              </li>
              <li>
                <Link to="/explore?sharing=Single" className="hover:text-nearBlack transition-colors">
                  Private Single Rooms
                </Link>
              </li>
            </ul>
          </div>

          {/* Localities */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-textMuted block">
              Bengaluru Hubs
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?locality=SG+Palya" className="hover:text-nearBlack transition-colors">
                  SG Palya (Gate 1 & 2)
                </Link>
              </li>
              <li>
                <Link to="/explore?locality=Koramangala" className="hover:text-nearBlack transition-colors">
                  Koramangala 1st Block
                </Link>
              </li>
              <li>
                <Link to="/explore?locality=Tavarekere" className="hover:text-nearBlack transition-colors">
                  Tavarekere / Forum
                </Link>
              </li>
              <li>
                <Link to="/explore?locality=HSR+Layout" className="hover:text-nearBlack transition-colors">
                  HSR Layout
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Owners */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-textMuted block">
              Platform
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-nearBlack transition-colors">
                  Philosophy
                </Link>
              </li>
              <li>
                <Link to="/list-property" className="hover:text-nearBlack text-mutedSage font-medium flex items-center gap-1 transition-colors">
                  <span>List Your PG</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-nearBlack transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-nearBlack transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-textMuted font-mono gap-4">
          <p>© 2026 StayNear Technologies Inc. Handcrafted for Christ University students.</p>
          <div className="flex items-center gap-4">
            <span>Bengaluru, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
