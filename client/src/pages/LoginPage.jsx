import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from './api'; 
import Logo from './Logo'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Siguraduhing malinis ang storage bago mag-login ng bago
    localStorage.removeItem('token');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Force refresh ng page logic ay hindi na kailangan dahil sa Interceptor sa api.js
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] relative overflow-hidden font-sans p-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-[420px] pt-4 px-8 pb-10 rounded-[2.5rem] z-10 bg-navy-800/50 backdrop-blur-xl border border-white/5 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8 text-center overflow-visible">
          <Logo className="w-[240px] max-w-none -mb-4" /> 
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 mt-1 text-xs px-4">Log in to track your expenses like a pro.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
            <input 
              type="email" required value={email} placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
              <input 
                type={showPassword ? "text" : "password"} 
                required value={password} placeholder="Password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex justify-start ml-2">
              <Link 
                to="/forgot-password" 
                className="text-[12px] text-gray-400 hover:text-cyan-400 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-navy-900 font-bold py-3.5 rounded-xl mt-2 transition-all flex items-center justify-center gap-2 group text-md shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-400 text-xs">
            Don't have an account? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium ml-1">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;