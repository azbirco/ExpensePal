import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api'; 
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-email', { email });
      if (res.data.exists) {
        setStatus({ type: 'success', text: 'Email verified! Proceed to reset password.' });
        setTimeout(() => { setStep(2); setStatus({ type: '', text: '' }); }, 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || "Email not found." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setStatus({ type: 'error', text: "Passwords do not match!" });
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      setStatus({ type: 'success', text: "Success! Redirecting to login..." });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus({ type: 'error', text: "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] bg-[#0D2137] border border-white/10 p-10 rounded-[3rem] shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo className="w-56 mb-6" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-blue-200/60 mt-2 text-xs">{step === 1 ? "Enter your email to find your account." : "Create a strong new password."}</p>
        </div>

        {status.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-[11px] font-semibold">{status.text}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type="email" required value={email} placeholder="Registered Email" className="w-full bg-[#1A2E44] border border-white/5 rounded-2xl py-4 pl-11 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full bg-[#00E5FF] text-[#001B3D] font-extrabold py-4 rounded-2xl shadow-lg hover:bg-cyan-300 transition-all">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type={showNewPassword ? "text" : "password"} required value={newPassword} placeholder="New Password"  className="w-full bg-[#1A2E44] border border-white/5 rounded-2xl py-4 pl-11 pr-12 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} placeholder="Confirm New Password"  className="w-full bg-[#1A2E44] border border-white/5 rounded-2xl py-4 pl-11 pr-12 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
              <CheckCircle size={18} /> {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
        <div className="mt-8 text-center pt-2 border-t border-white/5">
          <Link to="/login" className="text-gray-400 hover:text-white text-xs flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;