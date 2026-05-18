import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Banknote, Eye, EyeOff, Globe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    monthly_salary: '', 
    currency: 'PHP (₱)', 
    work_hours: '160'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (parseFloat(formData.monthly_salary) < 0 || parseFloat(formData.work_hours) <= 0) {
      setMessage({ type: 'error', text: 'Salary and work hours must be positive values.' });
      return;
    }

    setMessage({ type: 'loading', text: 'Creating your account...' });
    try {
      const submissionData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        monthly_salary: formData.monthly_salary,
        currency: formData.currency,
        work_hours: formData.work_hours || '160'
      };
      const res = await api.post('/auth/register', submissionData);
      
      setMessage({ type: 'success', text: res.data.message });
      
      setTimeout(() => navigate('/login', { 
        state: { 
          autoEmail: formData.email, 
          autoPass: formData.password 
        } 
      }), 4000);
    } catch (err) { 
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] font-sans p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Container resized to max-w-3xl for a more compact, centered look */}
      <div className="w-full max-w-3xl bg-[#0D2137] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/5 relative z-10">
        
        {/* LEFT SIDE: Branding */}
        <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center items-center px-8 bg-gradient-to-br from-[#0D2137] to-[#001B3D] border-r border-white/5 text-center">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[60px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            <Logo className="w-56 mb-6 mx-auto" />
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                Track money in <span className="text-[#00E5FF]">work hours.</span>
              </h2>
              <p className="text-xs text-blue-200/50 leading-relaxed mx-auto max-w-[200px]">
                Know the true labor cost of your lifestyle.
              </p>
              
              <div className="pt-10 flex items-center justify-center gap-2 text-cyan-400/60">
                <CheckCircle2 size={12} />
                <span className="font-medium text-[10px] text-gray-400 tracking-wide italic">Financial mindfulness.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-10 bg-[#0D2137]">
          <div className="w-full max-w-[320px]">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="lg:hidden mb-4"><Logo className="w-32" /></div>
              <h1 className="text-xl font-bold text-white tracking-tight">Create account</h1>
              <p className="text-gray-400 text-[10px] mt-1 tracking-wide">Start your journey to financial freedom.</p>
            </div>

            {message.text && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 text-[10px] font-medium border ${
                message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2.5" autoComplete="off">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input
                  type="text" placeholder="Username" autoComplete="none" required
                  className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input
                  type="email" placeholder="Email address" autoComplete="none" required
                  className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <input type="number" min="0" placeholder="Salary" required className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all" onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})} />
                </div>

                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <select className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none appearance-none cursor-pointer" onChange={(e) => setFormData({...formData, currency: e.target.value})} value={formData.currency}>
                    <option>PHP (₱)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input type="number" min="1" placeholder="Work hours / month" value={formData.work_hours} className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all" onChange={(e) => setFormData({...formData, work_hours: e.target.value})} />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"} placeholder="Password"
                  autoComplete="new-password" required
                  className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password"
                  required
                  className="w-full p-3 pl-12 bg-[#1A2E44] rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="pt-2">
                <button className="w-full py-3 bg-[#00E5FF] hover:bg-cyan-300 text-[#001B3D] font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                  Register Account
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-gray-400 text-[10px] tracking-wide">
              Already have an account? <Link to="/login" className="text-[#00E5FF] font-bold hover:text-cyan-300 transition-colors ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;