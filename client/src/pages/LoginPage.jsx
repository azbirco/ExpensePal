import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // UI-based error
  const navigate = useNavigate();

  useEffect(() => {
    // Clear old session to prevent stale token bugs
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001B3D] p-6">
      <div className="w-full max-w-md bg-navy-800/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Expense<span className="text-cyan-400">Pal</span></h2>
        <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest">Sign in to manage your wealth</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-tight italic">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-400 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-400 outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)} required 
          />
          <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-[#001B3D] font-black rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;