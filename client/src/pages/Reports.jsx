import React, { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { FileText, Image as ImageIcon, TrendingUp, Target, BarChart3, Clock, Users, List, Loader2 } from 'lucide-react'; 
import api from '../services/api';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';
import toast, { Toaster } from 'react-hot-toast';

const Reports = () => {
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  // CUSTOM PREMIUM TOAST STYLE
  const toastStyle = {
    style: {
      background: 'rgba(13, 33, 55, 0.95)',
      color: '#fff',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      padding: '16px 24px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      minWidth: '300px',
      textAlign: 'center'
    },
    success: {
      iconTheme: { primary: '#22d3ee', secondary: '#0D2137' },
      style: { border: '1px solid rgba(34, 211, 238, 0.5)' }
    },
    error: {
      iconTheme: { primary: '#f43f5e', secondary: '#0D2137' },
      style: { border: '1px solid rgba(244, 63, 94, 0.5)' }
    },
    loading: {
      style: { border: '1px solid rgba(255, 255, 255, 0.1)' }
    }
  };

  const formatLaborTime = (decimalHours) => {
    if (!decimalHours || decimalHours <= 0) return "0m";
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const fetchReportData = async () => {
    try {
      const [expenseRes, eventRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/events')
      ]);
      
      const expenses = expenseRes.data;
      setGroupEvents(eventRes.data);
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = {};
      const catMap = {};

      expenses.forEach(exp => {
        const amount = parseFloat(exp.amount || 0);
        const date = new Date(exp.date_added || new Date());
        const monthName = months[date.getMonth()];
        const labor = parseFloat(exp.labor_hours_equivalent || 0);
        
        if (!monthlyMap[monthName]) monthlyMap[monthName] = { amount: 0 };
        monthlyMap[monthName].amount += amount;
        
        const catName = exp.category_id?.category_name || exp.category_name || "General";
        const catColor = exp.category_id?.category_color || '#22d3ee';

        if (!catMap[catName]) {
          catMap[catName] = { name: catName, value: 0, labor: 0, color: catColor };
        }
        catMap[catName].value += amount;
        catMap[catName].labor += labor;
      });

      setChartData(months.map(m => ({ name: m, amount: monthlyMap[m]?.amount || 0 })));
      setCategoryData(Object.values(catMap).sort((a, b) => b.value - a.value));
      setLoading(false);
    } catch (err) { 
        console.error("Fetch Error:", err);
        setLoading(false);
        toast.error("SYSTEM SYNC FAILED", toastStyle);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  const getReportImage = async () => {
    if (!reportRef.current) return null;
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      return await domToPng(reportRef.current, {
        scale: 2, 
        backgroundColor: '#010b1a', 
        features: { copyDefaultStyles: true }
      });
    } catch (err) {
      console.error("Capture Error:", err);
      return null;
    }
  };

  const exportPDF = async () => {
    const loadingToast = toast.loading("SYNCHRONIZING EXPORT DATA...", toastStyle);
    try {
      const dataUrl = await getReportImage();
      if (!dataUrl) throw new Error("Capture failed");

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`ExpensePal_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF EXPORT SUCCESSFUL", { id: loadingToast, ...toastStyle });
    } catch (err) {
      toast.error("PDF GENERATION FAILED", { id: loadingToast, ...toastStyle });
    }
  };

  const exportImage = async () => {
    const loadingToast = toast.loading("GENERATING HIGH-RES CAPTURE...", toastStyle);
    try {
      const dataUrl = await getReportImage();
      if (!dataUrl) throw new Error("Capture failed");

      const link = document.createElement('a');
      link.download = `ExpensePal_Analytics_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("IMAGE SAVED TO LOCAL STORAGE", { id: loadingToast, ...toastStyle });
    } catch (err) {
      toast.error("CAPTURE ENGINE ERROR", { id: loadingToast, ...toastStyle });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#010b1a]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <div className="text-white text-lg font-black uppercase animate-pulse tracking-[0.3em]">Generating Report...</div>
        </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 bg-[#001226] min-h-screen text-left">
      {/* IMPROVED TOASTER: Centered and using the custom style */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={toastStyle}
      />
      
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3 italic">
            <BarChart3 className="text-cyan-400" size={32} />
            Financial <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm italic font-bold mt-2 uppercase tracking-widest opacity-60">Comprehensive labor & spending analysis</p>
        </div>
        <div className="flex gap-3">
            <button onClick={exportImage} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl">
              <ImageIcon size={16} className="text-cyan-400"/> Save Image
            </button>
            <button onClick={exportPDF} className="bg-cyan-400 hover:bg-cyan-300 text-[#001226] px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <FileText size={16} /> Export PDF
            </button>
        </div>
      </header>

      <div ref={reportRef} className="p-10 rounded-[2.5rem] border border-white/5 space-y-10 bg-[#010b1a] shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 border border-white/5 rounded-[2.5rem] p-8 bg-white/[0.02] shadow-inner">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3"><TrendingUp size={18} className="text-cyan-400" /> Spending Trend</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="black" dy={10} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="black" dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D2137', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff' }} 
                    itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorCyan)" isAnimationActive={false} />
                  <defs><linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient></defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 border border-white/5 rounded-[2.5rem] p-8 flex flex-col bg-white/[0.02] shadow-inner">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3"><Target size={18} className="text-cyan-400" /> Category Share</h3>
            <div className="h-[220px] shrink-0 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none" isAnimationActive={false}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto space-y-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex justify-between items-center p-3.5 rounded-2xl border border-white/5 bg-[#05192e]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-cyan-400 font-black text-xs italic">₱{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 ml-2">
            <List size={18} className="text-cyan-400" /> Spending Breakdown
          </h3>
          <div className="border border-white/5 rounded-[2.5rem] overflow-hidden bg-white/[0.01] shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] bg-white/[0.04]">
                <tr>
                  <th className="px-12 py-8">Category</th>
                  <th className="px-12 py-8 text-center">Labor Investment</th>
                  <th className="px-12 py-8 text-right">Total Expenditures</th>
                </tr>
              </thead>
              <tbody className="text-white text-[13px] font-bold">
                {categoryData.map((cat, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-all">
                    <td className="px-12 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-6 rounded-full shadow-lg" style={{ backgroundColor: cat.color }}></div>
                         <span className="tracking-widest uppercase text-[11px] font-black">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-12 py-6 text-center text-orange-400 font-black flex items-center justify-center gap-3 tracking-[0.2em] italic">
                      <Clock size={14} className="opacity-50"/> {formatLaborTime(cat.labor)}
                    </td>
                    <td className="px-12 py-6 text-right text-cyan-400 font-black text-lg italic tracking-tight">₱{cat.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 ml-2">
            <Users size={18} className="text-indigo-400" /> Group Events Overview
          </h3>
          <div className="border border-white/5 rounded-[2.5rem] overflow-hidden bg-white/[0.01] shadow-2xl">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] bg-white/[0.04]">
                <tr>
                  <th className="px-12 py-8">Event Title</th>
                  <th className="px-12 py-8 text-center">Protocol Type</th>
                  <th className="px-12 py-8 text-center">Collection Status</th>
                  <th className="px-12 py-8 text-right">Target Goal</th>
                </tr>
              </thead>
              <tbody className="text-white text-[13px] font-bold">
                {groupEvents.length > 0 ? groupEvents.map((evt, i) => {
                  const totalPaid = evt.members.reduce((sum, m) => sum + (m.amount_paid || 0), 0);
                  const progress = Math.min((totalPaid / evt.target_amount) * 100, 100).toFixed(0);
                  return (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-all">
                      <td className="px-12 py-6">
                        <span className="tracking-widest uppercase text-[11px] font-black block text-white italic">{evt.title}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1 block opacity-50">{evt.members.length} Entities involved</span>
                      </td>
                      <td className="px-12 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                          evt.type === 'fixed' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                        }`}>
                          {evt.type === 'fixed' ? 'Fixed' : 'Flexible'}
                        </span>
                      </td>
                      <td className="px-12 py-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-indigo-400 font-black text-[10px] tracking-widest">{progress}%</span>
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-6 text-right text-white font-black text-lg italic tracking-tight">₱{evt.target_amount.toLocaleString()}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="px-12 py-16 text-center text-gray-700 italic uppercase text-[10px] font-black tracking-[0.3em]">No active group synchronizations</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;