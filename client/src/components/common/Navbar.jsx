import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Heart,
  Calendar,
  Building2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { user, isAuthenticated, isStudent, isOwner, isAdmin, logout } = useAuth();
  const { favouriteIds } = useFavourites();
  const { notifications, unreadCount, markAllRead } = useNotification();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOwner) return '/owner/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 py-4 sm:py-5 transition-all duration-300">
      {/* Sticky Smooth Gradient Blur Fade (No box edges, melts seamlessly into page) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-32 select-none -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(251, 251, 250, 0.96) 0%, rgba(251, 251, 250, 0.75) 50%, rgba(251, 251, 250, 0) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="flex items-center justify-between gap-3">
          {/* TAL-style Squircle Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black text-white flex flex-col items-center justify-center font-heading font-black tracking-tighter shadow-sm leading-none transition-transform group-hover:scale-95">
              <span className="text-[13px] tracking-tight">stay</span>
              <span className="text-[9px] font-mono tracking-widest text-[#DCEBE3] uppercase">NEAR</span>
            </div>
          </Link>

          {/* Right Links & Auth */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/explore"
              className="text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
            >
              Explore PGs
            </Link>

            <Link
              to="/about"
              className="text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
            >
              About & Safety
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isStudent && (
                  <Link
                    to="/student/dashboard?tab=saved"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-neutral-700 hover:text-black border border-black/[0.08] bg-white transition-colors"
                    title="Saved PGs"
                  >
                    <Heart className="w-3.5 h-3.5 text-softRed fill-softRed" />
                    <span>{favouriteIds.size}</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 rounded-full text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-softRed" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-black/[0.08] p-4 z-50"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                            Activity ({unreadCount})
                          </span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs text-mutedSage hover:underline font-medium"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-black/[0.04] my-1">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-neutral-400 py-5 text-center">
                              No notifications
                            </p>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n._id}
                                className={`py-2.5 text-left ${
                                  !n.readStatus ? 'font-medium' : 'text-neutral-500'
                                }`}
                              >
                                <p className="text-xs text-nearBlack">{n.title}</p>
                                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-black/[0.08] bg-white hover:border-black transition-all text-xs font-semibold shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-black text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-nearBlack max-w-[90px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-floating border border-black/[0.08] py-2 z-50 text-xs"
                      >
                        <div className="px-4 py-2 border-b border-black/[0.06]">
                          <p className="font-semibold text-nearBlack">{user?.name}</p>
                          <p className="text-[10px] font-mono uppercase text-mutedSage mt-0.5">
                            {user?.role}
                          </p>
                        </div>

                        <Link
                          to={getDashboardLink()}
                          className="flex items-center gap-2.5 px-4 py-2 font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-mutedSage" />
                          Dashboard
                        </Link>

                        <div className="border-t border-black/[0.06] my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 font-medium text-softRed hover:bg-softRed/5 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to={getDashboardLink()}
                  className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  to="/list-property"
                  className="text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
                >
                  I'm an owner &gt;
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  <span>Login</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <Link
                  to="/register"
                  className="text-xs font-semibold text-neutral-700 hover:text-black transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Quick Actions + Menu Button (Matching Reference Mobile Header) */}
          <div className="flex items-center gap-2.5 md:hidden">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span>Login</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-neutral-700 hover:text-black px-1"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-nearBlack hover:bg-black/[0.05] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-black/[0.08] px-6 py-6 space-y-4 shadow-floating"
          >
            <nav className="flex flex-col space-y-3 font-semibold text-sm text-neutral-700">
              <Link to="/explore" className="py-1 hover:text-black">
                Explore PGs
              </Link>
              <Link to="/list-property" className="py-1 text-mutedSage">
                For PG Owners
              </Link>
              <Link to="/about" className="py-1 hover:text-black">
                About & Safety
              </Link>
            </nav>

            <div className="pt-4 border-t border-black/[0.06] flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="w-full py-2.5 rounded-full bg-black text-white text-xs font-semibold text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-full border border-softRed/30 text-softRed text-xs font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2.5 rounded-full bg-black text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 rounded-full border border-black/[0.1] text-nearBlack text-xs font-semibold text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
