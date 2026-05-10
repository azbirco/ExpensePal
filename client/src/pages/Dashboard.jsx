import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Wallet, Clock, Activity, Target, ChevronRight, 
  Utensils, Bus, FileText, User, Users, GraduationCap, 
  PiggyBank, Tag, Sparkles, CreditCard, ReceiptText,
  LayoutDashboard, ArrowRight 
} from 'lucide-react';
import api from '../services/api';

const iconMap = {
  'utensils': Utensils, 'bus': Bus, 'file-text': FileText, 'user': User,
  'users': Users, 'graduation-cap': GraduationCap, 'piggy-bank': PiggyBank,
  'tag': Tag, 'credit-card': CreditCard, 'file-invoice-dollar': ReceiptText 
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    total: 0, hours: 0, savings: 0, recent: [], allocation: [] 
  });
  const [activeEvents, setActiveEvents] = useState([]);
  const [userName, setUserName] = useState("");

  const formatLaborTime = (decimalHours) => {
    if (!decimalHours || decimalHours <= 0) return "0m";
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    const savedUserData = localStorage.getItem('user');
    if (savedUserData) {
      const user = JSON.parse(savedUserData);
      setUserName(user.username || user.name || "Aivelle");
    } else {
      setUserName("Aivelle");
    }

    const fetchData = async () => {
      try {
        const [expenseRes, eventRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/events')
        ]);
        
        const data = expenseRes.data;
        setActiveEvents(eventRes.data.slice(0, 3)); 

        const total = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        const hours = data.reduce((sum, item) => sum + parseFloat(item.labor_hours_equivalent || 0), 0);
        
        const savings = data
          .filter(item => {
            const catName = (item.category_id?.category_name || item.category_name || "").toLowerCase();
            return catName.includes('savings') || catName.includes('emergency');
          })
          .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        const groups = data.reduce((acc, item) => {
          const name = item.category_id?.category_name || item.category_name || "General";
          const color = item.category_id?.category_color || item.category_color || "#22d3ee";
          if (!acc[name]) acc[name] = { amount: 0, color: color };
          acc[name].amount += parseFloat(item.amount || 0);
          return acc;
        }, {});

        const allocation = Object.keys(groups).map(name => ({
          name,
          amount: groups[name].amount,
          percentage: total > 0 ? (groups[name].amount / total) * 100 : 0,
          color: groups[name].color
        })).sort((a, b) => b.amount - a.amount);

        setStats({ total, hours, savings, recent: data.slice(0, 5), allocation });
      } catch (err) { 
        console.error("Error fetching dashboard data:", err); 
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-10 animate-in fade-in zoom-in duration-700 bg-[#001226] min-h-screen text-left">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <LayoutDashboard className="text-cyan-400" size={32} />
            Financial <span className="text-cyan-400">Overview</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium italic">
            Welcome back, <span className="text-cyan-400 font-black not-italic text-base">{userName}</span>! "Your work hours are your most valuable currency."
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Live Metrics</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Outflow', val: `₱${stats.total.toLocaleString()}`, icon: <Wallet className="text-rose-400" size={20}/> },
          { label: 'Work Investment', val: formatLaborTime(stats.hours), icon: <Clock className="text-orange-400" size={20}/> },
          { label: 'Total Saved', val: `₱${stats.savings.toLocaleString()}`, icon: <PiggyBank className="text-emerald-400" size={20}/> },
          { label: 'Group Active', val: activeEvents.length, icon: <Users className="text-indigo-400" size={20}/> }
        ].map((card, i) => (
          <div key={i} className="bg-[#05192e]/60 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group shadow-xl">
            <div className="bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-white/5 group-hover:scale-110 transition-all duration-500">
              {card.icon}
            </div>
            <p className="text-gray-500 text-[11px] uppercase font-black tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tight italic">{card.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-7 bg-[#05192e]/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-orange-500 rounded-full" />
                 <h3 className="text-white font-black uppercase tracking-widest text-base">Recent Transactions</h3>
              </div>
              <button onClick={() => navigate('/expenses')} className="text-[10px] text-gray-500 hover:text-cyan-400 font-black flex items-center gap-2 uppercase group">
                View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>
          </div>

          <div className="space-y-5 relative z-10">
            {stats.recent.map((exp, i) => {
              const IconComponent = iconMap[exp.category_id?.category_icon || exp.category_icon] || Tag;
              const color = exp.category_id?.category_color || exp.category_color || '#22d3ee';
              return (
                <div key={i} className="group bg-[#001226]/40 hover:bg-[#001226]/80 border border-white/5 p-6 rounded-[2.2rem] transition-all flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2" style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, color: color }}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-base uppercase">{exp.item_name}</h4>
                      <span className="inline-block mt-2 px-4 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider" style={{ borderColor: `${color}30`, color: color }}>
                        {exp.category_id?.category_name || exp.category_name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-black text-xl italic tracking-tighter">₱{parseFloat(exp.amount).toLocaleString()}</div>
                    <div className="text-orange-400/80 text-[10px] font-black uppercase flex items-center gap-2 justify-end mt-2 tracking-widest">
                      <Clock size={12} /> {formatLaborTime(parseFloat(exp.labor_hours_equivalent))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Active Group Events Widget */}
          <div className="bg-[#05192e]/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h3 className="text-white font-black uppercase tracking-widest text-base">Active Events</h3>
              </div>
              <button onClick={() => navigate('/events')} className="text-[10px] text-gray-500 hover:text-indigo-400 font-black uppercase">Manage</button>
            </div>
            <div className="space-y-4">
              {activeEvents.length > 0 ? activeEvents.map((evt, i) => (
                <div key={i} onClick={() => navigate(`/events/${evt._id}`)} className="cursor-pointer bg-white/5 p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-white font-black text-sm uppercase truncate w-32">{evt.title}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{evt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-black text-sm italic">₱{evt.target_amount.toLocaleString()}</p>
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-white transition-all ml-auto mt-1"/>
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-xs italic text-center py-4 uppercase font-bold tracking-widest">No active group events</p>
              )}
            </div>
          </div>

          {/* Resource Allocation - FIXED: All categories shown */}
          <div className="bg-[#05192e]/60 border border-white/5 rounded-[3rem] p-10 flex-1 shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-8 bg-cyan-400 rounded-full" />
              <h3 className="text-white font-black uppercase tracking-widest text-base">Resource Allocation</h3>
            </div>
            <div className="space-y-9 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.allocation.length > 0 ? stats.allocation.map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                    <span className="text-gray-500">{item.name}</span>
                    <span className="text-white italic">₱{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%`, backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}40` }} />
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-xs italic">No allocation data.</p>
              )}
            </div>
          </div>

          {/* System Insight - FIXED: Ibinalik ang original design at posisyon */}
          <div className="bg-gradient-to-br from-cyan-900/20 to-indigo-900/20 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group shadow-2xl">
            <Sparkles className="absolute -right-4 -top-4 text-cyan-400/5 group-hover:text-cyan-400/10 transition-all duration-1000" size={150} />
            <div className="relative z-10">
              <h4 className="text-cyan-400 text-[11px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <Target size={16} /> System Insight
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed italic font-medium">
                {stats.allocation[0] ? (
                  <>Your labor capital is primarily focused on <span className="text-cyan-400 font-black uppercase border-b border-cyan-400/50">{stats.allocation[0].name}</span>. 
                  This represents <span className="text-cyan-400 font-black text-lg">{stats.allocation[0].percentage.toFixed(1)}%</span> of your total productivity investment.</>
                ) : "Processing your financial data for strategic insights..."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;