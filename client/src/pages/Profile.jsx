import React, { useState, useEffect } from 'react';
import {
  User, Mail, Camera, Save, Wallet, Clock3, Target, ShieldCheck,
  Building2, MapPin, Sparkles, BadgeDollarSign, PiggyBank,
  TrendingUp, Briefcase, Activity, Coins, X, Quote
} from 'lucide-react';

import api from '../services/api';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    profile_photo: '',
    created_at: '',
    monthly_salary: 0,
    work_hours_per_month: 160, // Default constant set to 160
    monthly_budget_limit: 0,
    occupation: '',
    institution: '',
    location: '',
    bio: '',
    badge_level: 'Novice',
    role: 'user',
    savings_target: 0,
    emergency_fund_goal: 0,
    preferred_currency: 'PHP',
    payday_cycle: 'Monthly',
  });

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');

        if (res.data) {
          setUserData({
            ...res.data,
            // Sinisiguradong 160 ang lalabas kung ang record sa DB ay 0, null, o less than 1
            work_hours_per_month: res.data.work_hours_per_month > 0 ? res.data.work_hours_per_month : 160,
            profile_photo: res.data.profile_photo || avatars[0],
            occupation: res.data.occupation || 'Professional',
            institution: res.data.institution || 'Not Specified',
            location: res.data.location || 'Not Specified',
            bio: res.data.bio || 'Disciplined financial tracking transforms effort into freedom.',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', userData);
      window.dispatchEvent(new Event('profileUpdate'));
      alert('Profile synced and updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Update failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const calculateHourlyRate = () => {
    const salary = parseFloat(userData.monthly_salary) || 0;
    const hours = parseFloat(userData.work_hours_per_month) || 160;
    return salary > 0 ? (salary / hours).toFixed(2) : "0.00";
  };

  const calculateDailyRate = () => (parseFloat(calculateHourlyRate()) * 8).toFixed(2);
  const calculateMinuteValue = () => (parseFloat(calculateHourlyRate()) / 60).toFixed(2);

  const glassInput =
    'w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/[0.06] hover:border-white/20 font-medium';

  return (
    <div className="min-h-screen bg-[#020617] p-6 lg:p-10 text-left">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">

        {/* HEADER */}
        <div className="mb-12 text-left">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white uppercase italic leading-none">
            User <span className="text-cyan-400">Profile</span>
          </h1>
          <p className="mt-5 text-slate-500 uppercase tracking-[0.35em] text-[11px] font-bold">
            Personal Identity • Labor Valuation Engine • Financial Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-4">
            <div className="sticky top-8 space-y-6">

              {/* PROFILE CARD */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#071226] to-[#020617] backdrop-blur-2xl shadow-2xl p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_35%)]" />

                <div className="absolute top-6 right-6 px-4 py-1 rounded-full bg-cyan-400 text-[#020617] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-400/20">
                  {userData.badge_level}
                </div>

                <div className="relative flex justify-center mt-4">
                  <div className="relative group">
                    <div className="w-44 h-44 rounded-full overflow-hidden border-[5px] border-cyan-400/20 shadow-[0_0_50px_rgba(34,211,238,0.25)] bg-slate-900">
                      <img
                        src={userData.profile_photo || avatars[0]}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Camera size={28} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="text-center mt-8 relative z-10">
                  <h2 className="text-white text-3xl font-black uppercase italic tracking-tight">
                    {userData.username || "Loading..."}
                  </h2>
                  <p className="text-cyan-400 uppercase tracking-[0.3em] text-[11px] font-bold mt-2">
                    {userData.occupation}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-[10px] tracking-widest uppercase">
                    <Mail size={12} className="text-cyan-400/50" />
                    <span>{userData.email}</span>
                  </div>

                  {/* BIO DISPLAY IN CARD (NEW) */}
                  <div className="mt-6 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl relative">
                    <Quote size={12} className="absolute -top-2 -left-1 text-cyan-400 opacity-50 rotate-180" />
                    <p className="text-slate-400 text-[11px] italic leading-relaxed line-clamp-3">
                      {userData.bio}
                    </p>
                  </div>

                  <div className="mt-8 bg-black/30 border border-white/5 rounded-3xl p-6">
                    <div className="grid grid-cols-2 gap-5 text-left">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Monthly</p>
                        <h3 className="text-white text-xl font-black mt-1">
                          ₱{Number(userData.monthly_salary).toLocaleString()}
                        </h3>
                      </div>
                      <div className="border-l border-white/10 pl-5 text-right">
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Hourly</p>
                        <h3 className="text-emerald-400 text-xl font-black mt-1">
                          ₱{calculateHourlyRate()}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ANALYTICS */}
              <div className="grid grid-cols-1 gap-4">
                <div className="group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Labor Cost Per Minute</p>
                      <h3 className="text-white text-2xl font-black mt-2">₱{calculateMinuteValue()}</h3>
                    </div>
                    <Clock3 className="text-cyan-400 group-hover:rotate-12 transition-all duration-300" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="xl:col-span-8 space-y-8">

            {/* AVATAR PICKER POPUP */}
            {showAvatarPicker && (
              <div className="rounded-[2rem] border border-white/10 bg-[#071226]/90 backdrop-blur-2xl p-8 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-black uppercase tracking-wider">Select visual identity</h3>
                  <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-white transition-all"><X size={20} /></button>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {avatars.map((av, index) => (
                    <button
                      key={index}
                      onClick={() => setUserData({ ...userData, profile_photo: av })}
                      className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                        userData.profile_photo === av ? 'border-cyan-400 shadow-lg shadow-cyan-400/40' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="avatar" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PERSONAL IDENTITY SECTION */}
            <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#071226] to-[#020617] backdrop-blur-2xl p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-10">
                <User className="text-cyan-400" size={20} />
                <h3 className="text-white text-lg font-black uppercase tracking-widest">Personal Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Username</label>
                  <input type="text" value={userData.username} onChange={(e) => setUserData({...userData, username: e.target.value})} className={glassInput} />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Registered Email (Locked)</label>
                  <input type="email" value={userData.email} disabled className={`${glassInput} cursor-not-allowed bg-black/20`} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Occupation</label>
                  <input type="text" value={userData.occupation} onChange={(e) => setUserData({ ...userData, occupation: e.target.value })} className={glassInput} />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Institution</label>
                  <input type="text" value={userData.institution} onChange={(e) => setUserData({ ...userData, institution: e.target.value })} className={glassInput} />
                </div>
                <div className="md:col-span-2 space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Location</label>
                  <input type="text" value={userData.location} onChange={(e) => setUserData({ ...userData, location: e.target.value })} className={glassInput} />
                </div>
                <div className="md:col-span-2 space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Financial Goal / Bio</label>
                  <textarea rows="3" value={userData.bio} onChange={(e) => setUserData({ ...userData, bio: e.target.value })} className={`${glassInput} resize-none`} placeholder="What are you working for?" />
                </div>
              </div>
            </div>

            {/* LABOR VALUATION ENGINE SECTION */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-[#071226]/50 p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <Sparkles className="text-cyan-400" size={20} />
                <h3 className="text-white text-lg font-black uppercase tracking-widest">Earnings Tracker</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black ml-1">Monthly Salary (PHP)</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input type="number" value={userData.monthly_salary} onChange={(e) => setUserData({ ...userData, monthly_salary: e.target.value })} className={`${glassInput} pl-12 font-black text-xl text-emerald-400`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black ml-1">Work Hours / Month</label>
                  <div className="relative">
                    <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                    <input type="number" value={userData.work_hours_per_month} onChange={(e) => setUserData({ ...userData, work_hours_per_month: e.target.value })} className={`${glassInput} pl-12 font-black text-xl`} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 relative z-10 text-center">
                <div className="rounded-3xl bg-black/40 border border-white/5 p-6 hover:bg-black/60 transition-all">
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Hourly Value</p>
                  <h3 className="text-cyan-400 text-3xl font-black mt-3 italic">₱{calculateHourlyRate()}</h3>
                </div>
                <div className="rounded-3xl bg-black/40 border border-white/5 p-6 hover:bg-black/60 transition-all">
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Daily Value</p>
                  <h3 className="text-emerald-400 text-3xl font-black mt-3 italic">₱{calculateDailyRate()}</h3>
                </div>
                <div className="rounded-3xl bg-black/40 border border-white/5 p-6 hover:bg-black/60 transition-all">
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black text-center">Minute Worth</p>
                  <h3 className="text-orange-400 text-3xl font-black mt-3 italic">₱{calculateMinuteValue()}</h3>
                </div>
              </div>
            </div>

            {/* FINANCIAL INTELLIGENCE SECTION */}
            <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#071226] to-[#020617] backdrop-blur-2xl p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-10">
                <TrendingUp className="text-emerald-400" size={20} />
                <h3 className="text-white text-lg font-black uppercase tracking-widest">Financial Goals</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Monthly Budget Limit</label>
                  <input type="number" value={userData.monthly_budget_limit} onChange={(e) => setUserData({ ...userData, monthly_budget_limit: e.target.value })} className={glassInput} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Savings Target</label>
                  <input type="number" value={userData.savings_target} onChange={(e) => setUserData({ ...userData, savings_target: e.target.value })} className={glassInput} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Emergency Fund Goal</label>
                  <input type="number" value={userData.emergency_fund_goal} onChange={(e) => setUserData({ ...userData, emergency_fund_goal: e.target.value })} className={glassInput} />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">Payday Cycle</label>
                  <div className="relative">
                  <select value={userData.payday_cycle} onChange={(e) => setUserData({ ...userData, payday_cycle: e.target.value })} className={`${glassInput} appearance-none cursor-pointer`}>
                    <option className="bg-[#020617]" value="Weekly">Weekly</option>
                    <option className="bg-[#020617]" value="Bi-Weekly">Bi-Weekly</option>
                    <option className="bg-[#020617]" value="Monthly">Monthly</option>
                  </select>
                  <Activity size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* SYNC BUTTON */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="group w-full rounded-2xl bg-cyan-400 hover:bg-white text-[#020617] font-black py-6 uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:scale-[1.01] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-3">
                <Save size={20} className="group-hover:animate-pulse" />
                {loading ? 'SYNCING DATA...' : 'SYNC PROFILE DATA'}
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;