import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Banknote, Eye, EyeOff, Globe, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', monthly_salary: '', currency: 'PHP (₱)', work_hours: '180'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: 'loading', text: 'Creating your account...' });
    try {
      await api.post('/auth/register', formData);
      setMessage({ type: 'success', text: 'Account created! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) { 
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] font-sans p-4 md:p-8">
      {/* Background Decorative Glows (Outside the container) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* MAIN CONTAINER: Floating 2-Split Card */}
      <div className="w-full max-w-6xl min-h-[700px] bg-[#0D2137] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/5 relative z-10">
        
        {/* LEFT SIDE: Branding Section */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 bg-gradient-to-br from-[#0D2137] to-[#001B3D] border-r border-white/5">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <Logo className="w-64 mb-12 justify-start" />
            <div className="space-y-6">
              <h2 className="text-5xl font-extrabold text-white leading-tight">
                Track your money in <span className="text-[#00E5FF]">Work Hours.</span>
              </h2>
              <p className="text-lg text-blue-200/60 leading-relaxed max-w-md">
                Know the true labor cost of your lifestyle. Convert every expense into hours of your life.
              </p>
              
              <div className="pt-8 flex items-center gap-3 text-cyan-400">
                <CheckCircle2 size={20} />
                <span className="font-medium text-sm text-gray-300">Financial mindfulness at your fingertips.</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-16 text-blue-200/20 text-xs italic">
            Part of your journey to financial discipline.
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-[#0D2137]">
          <div className="w-full max-w-[440px]">
            <div className="flex flex-col items-center mb-8 text-center lg:items-start lg:text-left">
              <div className="lg:hidden mb-6">
                 <Logo className="w-48" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-gray-400 text-sm mt-2">Start your journey to financial freedom.</p>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300 ${
                message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' : 
                message.type === 'error' ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 
                'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-[11px] font-semibold tracking-wide uppercase">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group col-span-1 md:col-span-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="text" placeholder="Username" required className="w-full p-4 pl-12 bg-[#E8F0FE] rounded-2xl text-[#001B3D] text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
                
                <div className="relative group col-span-1 md:col-span-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="email" placeholder="Email" required className="w-full p-4 pl-12 bg-[#1A2E44] rounded-2xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="relative group">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="number" placeholder="Salary" required className="w-full p-4 pl-12 bg-[#1A2E44] rounded-2xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})} />
                </div>

                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <select className="w-full p-4 pl-12 bg-[#1A2E44] rounded-2xl text-white text-sm border border-white/5 outline-none appearance-none" onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                    <option>PHP (₱)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="number" placeholder="Work Hours/Month" value={formData.work_hours} className="w-full p-4 pl-12 bg-[#1A2E44] rounded-2xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, work_hours: e.target.value})} />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" required className="w-full p-4 pl-12 bg-[#E8F0FE] rounded-2xl text-[#001B3D] text-sm outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button className="w-full py-4 bg-[#00E5FF] hover:bg-cyan-300 text-[#001B3D] font-extrabold rounded-2xl shadow-lg mt-2 flex items-center justify-center gap-2 group transition-all">
                Register Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-gray-400 text-xs">
              Already have an account? <Link to="/login" className="text-[#00E5FF] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;