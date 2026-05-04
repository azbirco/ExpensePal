import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Banknote, Eye, EyeOff, Globe, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', monthly_salary: '', currency: 'PHP (₱)', work_hours: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: 'loading', text: 'Creating your account...' });
    try {
      const submissionData = {
        ...formData,
        work_hours: formData.work_hours || '180'
      };
      await api.post('/auth/register', submissionData);
      setMessage({ type: 'success', text: 'Account created! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) { 
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] font-sans p-6">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-4xl bg-[#0D2137] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/5 relative z-10">
        
        {/* LEFT SIDE: Branding */}
        <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center items-center px-10 bg-gradient-to-br from-[#0D2137] to-[#001B3D] border-r border-white/5 text-center">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[60px] rounded-full" />
          
          <div className="relative z-10">
            {/* Binawasan ang mb-4 para mas dikit ang logo sa text */}
            <Logo className="w-64 mb-4 mx-auto" /> 
            <div className="space-y-2"> {/* Binawasan ang space-y-4 to space-y-2 */}
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Track money in <span className="text-[#00E5FF]">Work Hours.</span>
              </h2>
              <p className="text-sm text-blue-200/50 leading-relaxed mx-auto max-w-[250px]">
                Know the true labor cost of your lifestyle.
              </p>
              
              <div className="pt-2 flex items-center justify-center gap-2 text-cyan-400">
                <CheckCircle2 size={14} />
                <span className="font-medium text-[11px] text-gray-300">Financial mindfulness.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-8 md:p-10 bg-[#0D2137]">
          <div className="w-full max-w-[380px]">
            <div className="flex flex-col items-center mb-6 text-center"> {/* Binawasan mb-8 to mb-6 */}
              <div className="lg:hidden mb-4">
                 <Logo className="w-40" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-gray-400 text-xs mt-1">Start your journey to financial freedom.</p>
            </div>

            {/* Form with autoComplete="off" para walang automatic email/password */}
            <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Username" 
                  autoComplete="none"
                  required 
                  className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  autoComplete="none"
                  required 
                  className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="number" placeholder="Salary" required className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})} />
                </div>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <select className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none appearance-none" onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                    <option>PHP (₱)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="number" placeholder="Work Hours per Day / Month" value={formData.work_hours} className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" onChange={(e) => setFormData({...formData, work_hours: e.target.value})} />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  autoComplete="new-password"
                  required 
                  className="w-full p-3.5 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button className="w-full py-3.5 bg-[#00E5FF] hover:bg-cyan-300 text-[#001B3D] font-bold rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2 group transition-all">
                Register Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-6 text-center text-gray-400 text-xs">
              Already have an account? <Link to="/login" className="text-[#00E5FF] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;