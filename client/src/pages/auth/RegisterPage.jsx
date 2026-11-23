import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, Building2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'student';

  const { register } = useAuth();
  const { showToast } = useNotification();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (data.success) {
        showToast('Account created successfully!', 'success');
        if (role === 'owner') {
          navigate('/owner/apply');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4 py-28">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.08] shadow-floating space-y-6">
        {/* Header with TAL Squircle Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex flex-col items-center justify-center font-heading font-black tracking-tighter shadow-sm leading-none">
              <span className="text-[13px] tracking-tight">stay</span>
              <span className="text-[8px] font-mono tracking-widest text-[#DCEBE3] uppercase">NEAR</span>
            </div>
          </Link>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-neutral-500">
            Join StayNear to discover stays or manage your PG property
          </p>
        </div>

        {/* Role Switcher Pill */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#F6F5F2] border border-black/[0.06] gap-1">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all ${
              role === 'student'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>I'm a Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all ${
              role === 'owner'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>I'm a PG Owner</span>
          </button>
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
              placeholder="e.g. Aarav Mehta"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="aarav@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
                placeholder="+91 98450 12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm p-3.5 rounded-2xl bg-[#F6F5F2] border border-transparent focus:border-black text-black focus:outline-none transition-colors"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {role === 'owner' && (
            <div className="p-3.5 rounded-2xl bg-[#F6F5F2] border border-black/[0.06] text-xs text-neutral-700 leading-relaxed">
              <strong>Owner Notice:</strong> To maintain platform trust, you will complete an identity and property document submission before publishing listings.
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-black text-white font-heading font-bold text-sm tracking-tight flex items-center justify-center gap-1.5 shadow-floating hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create {role === 'owner' ? 'Owner' : 'Student'} Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
