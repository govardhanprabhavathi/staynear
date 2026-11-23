import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Return success representation regardless for privacy
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmOffWhite/40 flex items-center justify-center px-4 py-28">
      <div className="w-full max-w-md bg-pureWhite p-8 sm:p-10 rounded-3xl border border-warmSand shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-nearBlack flex items-center justify-center text-pureWhite">
              <span className="font-heading font-black text-xs tracking-tighter">SN</span>
            </div>
            <span className="font-heading font-bold text-xl text-nearBlack tracking-tight">
              Stay<span className="text-mutedSage">Near</span>
            </span>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl text-nearBlack tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your email and we'll send you recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-lightSage flex items-center justify-center mx-auto text-mutedSage">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              If an account is associated with <strong>{email}</strong>, a reset link has been dispatched to your inbox.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="secondary" className="w-full justify-center">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Your Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm p-3 rounded-xl bg-warmOffWhite/60 border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                placeholder="name@example.com"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={loading}
              icon={Mail}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-nearBlack"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
