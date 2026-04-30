import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Banknote, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    monthly_salary: '',
    work_hours: 8
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001B3D] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-navy-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Join <span className="text-cyan-400">ExpensePal</span>
          </h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em]">Start tracking your financial growth</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500 text-xs font-bold uppercase italic text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" placeholder="Full Name" required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cyan-400 focus:bg-white/10 outline-none transition-all"
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="email" placeholder="Email Address" required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cyan-400 focus:bg-white/10 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="password" placeholder="Password" required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cyan-400 focus:bg-white/10 outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="number" min="0" step="0.01" placeholder="Monthly Salary (₱)" required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cyan-400 focus:bg-white/10 outline-none transition-all"
                onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})} 
              />
            </div>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="number" min="1" max="24" placeholder="Work Hours/Day" required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cyan-400 focus:bg-white/10 outline-none transition-all"
                onChange={(e) => setFormData({...formData, work_hours: e.target.value})} 
              />
            </div>
          </div>

          <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-[#001B3D] font-black rounded-2xl uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 group">
            Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-cyan-400 font-bold hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;