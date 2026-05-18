import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Added useLocation
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access state from navigate

  useEffect(() => {
    localStorage.clear();

    // SAFE HANDSHAKE: Check if user redirected from Register with credentials
    if (location.state?.autoEmail && location.state?.autoPass) {
      setEmail(location.state.autoEmail);
      setPassword(location.state.autoPass);
      setStatus({ type: 'success', text: 'Registration successful! Please sign in.' });
      
      // CLEANUP: Remove state so refresh results in empty fields
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
      // FIX: Improved error checking for Admin Approval (403) and general failures
      const errorMsg = err.response?.data?.message || "Invalid credentials.";
      
      if (err.response?.status === 403) {
        setStatus({ type: 'error', text: "Access Denied: Your account is pending Admin approval." });
      } else {
        setStatus({ type: 'error', text: errorMsg });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] font-sans p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl min-h-[550px] flex flex-col lg:flex-row bg-[#0D2137] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 relative z-10">
        
        {/* LEFT SIDE: Branding */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-center items-center px-10 bg-[#001B3D]/50 border-r border-white/5 text-center">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[60px] rounded-full" />
          <div className="relative z-10">
            <Logo className="w-56 mb-12 mx-auto" />
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Value your time, <br />
                <span className="text-[#00E5FF]">master your spend.</span>
              </h2>
              <p className="text-[13px] text-blue-200/50 leading-relaxed mx-auto max-w-[260px]">
                Log in to see how many hours of work your latest expenses actually cost you.
              </p>
              <div className="pt-12 flex items-center justify-center gap-2 text-cyan-400/60">
                <CheckCircle2 size={12} />
                <span className="font-medium text-[10px] text-gray-400 tracking-wide italic">Financial mindfulness.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-14 bg-[#0D2137]">
          <div className="w-full max-w-[340px]">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="lg:hidden mb-6">
                <Logo className="w-40" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-gray-400 text-[11px] mt-1.5 tracking-wide">Log in to track your expenses like a pro.</p>
            </div>

            {status.text && (
              <div className={`mb-5 p-3 rounded-xl flex items-center gap-3 text-[11px] font-medium border animate-in fade-in duration-300 ${
                status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {status.text}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5" autoComplete="new-password">
              <input type="text" style={{ display: 'none' }} name="prevent_autofill_email" />
              <input type="password" style={{ display: 'none' }} name="prevent_autofill_password" />

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                <input
                  type="email"
                  value={email}
                  placeholder="Email address"
                  required
                  autoComplete="off"
                  className="w-full p-3.5 pl-12 bg-[#1A2E44]/50 rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Password"
                    required
                    autoComplete="new-password"
                    className="w-full p-3.5 pl-12 bg-[#1A2E44]/50 rounded-xl text-white text-sm border border-white/5 outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" intrinsic="false" className="text-gray-500 hover:text-white text-[10px] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-[#00E5FF] hover:bg-cyan-300 text-[#001B3D] font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                  Sign In
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-gray-400 text-[11px] tracking-wide">
              Don't have an account? <Link to="/register" className="text-[#00E5FF] font-bold hover:text-cyan-300 transition-colors ml-1">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;