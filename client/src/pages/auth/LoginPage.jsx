import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      if (data.success) {
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        if (redirect) {
          navigate(redirect);
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4 py-28">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.08] shadow-floating space-y-8">
        {/* Header with TAL Squircle Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex flex-col items-center justify-center font-heading font-black tracking-tighter shadow-sm">
              <span className="text-[13px] tracking-tight">stay</span>
              <span className="text-[8px] font-mono tracking-widest text-[#DCEBE3] uppercase">NEAR</span>
            </div>
          </Link>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
            Sign in to StayNear
          </h1>
          <p className="text-xs text-neutral-500">
            Access your saved accommodations, enquiries, or listings
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-softRed/10 border border-softRed/20 text-softRed text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-mutedSage hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-black text-white font-heading font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 shadow-floating hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-black/[0.06] space-y-2.5">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 text-center">
            One-Click Demo Switcher
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student@staynear.com', 'Student@12345')}
              className="text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-black hover:text-white transition-all font-semibold text-black text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('owner@staynear.com', 'Owner@12345')}
              className="text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-black hover:text-white transition-all font-semibold text-black text-center"
            >
              PG Owner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@staynear.com', 'Admin@12345')}
              className="text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-black hover:text-white transition-all font-semibold text-black text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-neutral-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
