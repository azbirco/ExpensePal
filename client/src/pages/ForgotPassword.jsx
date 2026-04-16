import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from './api'; 
import Logo from './Logo'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email });
      if (res.data.exists) {
        setStep(2);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Email not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      alert("Password updated successfully!");
      navigate('/login');
    } catch (err) {
      alert("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] relative overflow-hidden font-sans p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-[440px] p-10 rounded-[2.5rem] z-10 bg-navy-800/50 backdrop-blur-xl border border-white/5 shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo className="w-[220px] -mb-2" />
          <h1 className="text-2xl font-bold text-white tracking-tight mt-4">Reset Password</h1>
          <p className="text-gray-400 mt-2 text-xs">
            {step === 1 ? "Enter your email to find your account." : "Create a strong new password."}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="email" required value={email} placeholder="Registered Email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm outline-none focus:border-cyan-400/50 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full bg-cyan-400 text-navy-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type={showNewPassword ? "text" : "password"}
                required value={newPassword} placeholder="New Password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-12 text-white text-sm outline-none focus:border-cyan-400/50 transition-all"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                required value={confirmPassword} placeholder="Confirm New Password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-12 text-white text-sm outline-none focus:border-cyan-400/50 transition-all"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button disabled={loading} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
              <CheckCircle size={18} /> {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Link to="/login" className="text-gray-500 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;