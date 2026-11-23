import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavouritesProvider } from './context/FavouritesContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';

// Public Pages
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ListPropertyPage from './pages/public/ListPropertyPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Role Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerApplyPage from './pages/owner/OwnerApplyPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Scroll to top on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-pureWhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nearBlack" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to respective dashboard if role doesn't match
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <FavouritesProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen font-sans selection:bg-lightSage selection:text-nearBlack">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/list-property" element={<ListPropertyPage />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Student Protected Routes */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* PG Owner Protected Routes */}
                  <Route
                    path="/owner/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/owner/apply"
                    element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerApplyPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
              <ToastContainer />
            </div>
          </FavouritesProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
