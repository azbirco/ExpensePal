import React, { useState, useEffect } from 'react';
import { 
  Wallet, Clock, Activity, Target, ChevronRight, 
  Utensils, Bus, FileText, User, Users, GraduationCap, PiggyBank, Tag, Sparkles
} from 'lucide-react';
import api from './api';

// Icon Map: Matches database strings to Lucide components
const iconMap = {
  'utensils': Utensils,
  'bus': Bus,
  'file-text': FileText,
  'user': User,
  'users': Users,
  'graduation-cap': GraduationCap,
  'piggy-bank': PiggyBank,
  'tag': Tag
};

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    total: 0, 
    hours: 0, 
    savings: 0,
    recent: [], 
    allocation: [] 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/expenses');
        const data = res.data;

        // Calculate Totals and Savings
        const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const hours = data.reduce((sum, item) => sum + parseFloat(item.labor_hours_equivalent), 0);
        
        // Dynamic Savings calculation based on 'Savings & Emergency' category
        const savings = data
          .filter(item => item.category_name === 'Savings & Emergency')
          .reduce((sum, item) => sum + parseFloat(item.amount), 0);

        // Group for Resource Allocation
        const groups = data.reduce((acc, item) => {
          acc[item.category_name] = (acc[item.category_name] || 0) + parseFloat(item.amount);
          return acc;
        }, {});

        const allocation = Object.keys(groups).map(name => ({
          name,
          amount: groups[name],
          percentage: (groups[name] / total) * 100,
          color: data.find(d => d.category_name === name)?.category_color || '#22d3ee'
        })).sort((a, b) => b.amount - a.amount);

        setStats({ 
          total, 
          hours, 
          savings,
          recent: data.slice(0, 4), 
          allocation 
        });
      } catch (err) { 
        console.error("Error fetching dashboard data:", err); 
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Financial <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Analyzing financial impact through labor-value metrics.
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Live Metrics</span>
        </div>
      </div>

      {/* Top 4 Stat Cards: Optimized with Savings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Outflow', val: `₱${stats.total.toLocaleString()}`, icon: <Wallet className="text-rose-400" size={18}/> },
          { label: 'Work Investment', val: `${stats.hours.toFixed(1)} Hrs`, icon: <Clock className="text-orange-400" size={18}/> },
          { label: 'Total Saved', val: `₱${stats.savings.toLocaleString()}`, icon: <PiggyBank className="text-emerald-400" size={18}/> },
          { label: 'Budget Health', val: '94%', icon: <Activity className="text-cyan-400" size={18}/> }
        ].map((card, i) => (
          <div key={i} className="bg-navy-800/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="bg-navy-900/50 w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{card.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Transactions (Left Side: The Action) */}
        <div className="lg:col-span-7 bg-navy-800/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">Recent Transactions</h3>
             </div>
             <button className="text-[10px] text-gray-500 hover:text-white font-bold tracking-widest flex items-center gap-1 uppercase group">
               View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
             </button>
          </div>

          <div className="space-y-4">
            {stats.recent.map((exp, i) => {
              const IconComponent = iconMap[exp.category_icon] || Tag;
              return (
                <div key={i} className="group bg-navy-900/40 hover:bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] transition-all flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div 
                      className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center border transition-all duration-300"
                      style={{ 
                        backgroundColor: `${exp.category_color}15`, 
                        borderColor: `${exp.category_color}40`,
                        color: exp.category_color 
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm capitalize">{exp.item_name}</h4>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{exp.category_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">₱{parseFloat(exp.amount).toLocaleString()}</div>
                    <div className="text-orange-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 justify-end mt-1">
                      <Clock size={10}/> {parseFloat(exp.labor_hours_equivalent).toFixed(1)} Hours
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Allocation (Right Side: The Insight) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-navy-800/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-2xl flex-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-6 bg-cyan-400 rounded-full" />
              <h3 className="text-white font-bold uppercase tracking-wider text-sm">Resource Allocation</h3>
            </div>
            
            <div className="space-y-8">
              {stats.allocation.map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-white">₱{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Style Smart Insight Box */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden">
            <Sparkles className="absolute -right-2 -top-2 text-cyan-400/20" size={80} />
            <div className="relative z-10">
              <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">System Insight</h4>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "Your work effort is currently concentrated on <span className="text-white font-bold">{stats.allocation[0]?.name || 'analyzing data'}</span>. Consider optimizing this area to reclaim more labor hours."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;