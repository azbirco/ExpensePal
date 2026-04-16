import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, DollarSign, Clock, ArrowRight, Globe, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from './api';
import Logo from './Logo'; 

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', 
        email: '', 
        password: '', 
        monthly_salary: '', 
        work_hours: '160', 
        currency_code: 'PHP'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            alert("Account Verified & Created!");
            navigate('/login'); 
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#001B3D] relative overflow-hidden p-4 font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-[420px] pt-4 px-9 pb-10 rounded-[2.5rem] z-10 border border-white/5 shadow-2xl bg-navy-800/50 backdrop-blur-xl"
            >
                <div className="flex flex-col items-center mb-6 text-center">
                    <Logo className="w-[240px] max-w-none -mb-4" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-gray-400 mt-1 text-xs">Join ExpensePal to track your labor cost.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" required placeholder="Username"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="email" required placeholder="Email Address"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                            <input 
                                type="number" required placeholder="Salary"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-white text-xs focus:border-cyan-400/50 outline-none"
                                onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})}
                            />
                        </div>
                        <div className="relative group">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                            <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-white text-xs focus:border-cyan-400/50 outline-none appearance-none cursor-pointer"
                                onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
                            >
                                <option value="PHP" className="bg-navy-800">PHP (₱)</option>
                                <option value="USD" className="bg-navy-800">USD ($)</option>
                                <option value="EUR" className="bg-navy-800">EUR (€)</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="number" required placeholder="Monthly Hours" value={formData.work_hours}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, work_hours: e.target.value})}
                        />
                    </div>

                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-sm focus:border-cyan-400/50 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-cyan-400 hover:bg-cyan-300 text-navy-900 font-bold py-3.5 rounded-xl mt-2 transition-all flex items-center justify-center gap-2 group text-md shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    >
                        {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-gray-400 text-xs">
                        Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium ml-1">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;