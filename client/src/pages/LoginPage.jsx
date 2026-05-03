import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: 'Authenticating...' });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setStatus({ type: 'success', text: `Welcome back!` });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || "Invalid credentials." });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] font-sans p-4 md:p-10">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* MAIN FLOATING CONTAINER */}
      <div className="w-full max-w-5xl min-h-[600px] flex flex-col lg:flex-row bg-[#0D2137] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative z-10">
        
        {/* LEFT SIDE: Visuals */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 bg-[#001B3D]/50 border-r border-white/5">
          <div className="relative z-10">
            <Logo className="w-64 mb-10" />
            <div className="space-y-6">
              <h2 className="text-5xl font-extrabold text-white leading-tight">
                Value your time, <br />
                <span className="text-[#00E5FF]">Master your spend.</span>
              </h2>
              <p className="text-lg text-blue-200/60 leading-relaxed">
                Log in to see how many hours of work your latest expenses actually cost you.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-10 md:p-16 bg-[#0D2137]">
          <div className="w-full max-w-[360px]">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="lg:hidden mb-6">
                 <Logo className="w-48" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-gray-400 text-xs mt-2">Log in to track your expenses like a pro.</p>
            </div>

            {status.text && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in duration-300 ${
                status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' : 
                status.type === 'error' ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 
                'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-[11px] font-semibold uppercase tracking-wider">{status.text}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="email" placeholder="Email Address" required className="w-full p-4 pl-12 bg-[#E8F0FE] rounded-2xl text-[#001B3D] text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" required className="w-full p-4 pl-12 bg-[#E8F0FE] rounded-2xl text-[#001B3D] text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" size={14} className="text-gray-500 hover:text-white text-[11px] transition-colors">Forgot Password?</Link>
                </div>
              </div>

              <button className="w-full py-4 bg-[#00E5FF] hover:bg-cyan-300 text-[#001B3D] font-extrabold rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2 group transition-all">
                Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-10 text-center text-gray-400 text-xs">
              Don't have an account? <Link to="/register" className="text-[#00E5FF] font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;