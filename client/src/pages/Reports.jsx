import React, { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { FileText, Image as ImageIcon, TrendingUp, Target, BarChart3, Clock, Users } from 'lucide-react'; 
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]); // BAGONG STATE
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

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
      // Pinagsabay ang fetch ng expenses at events
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
        const catColor = exp.category_id?.category_color || exp.category_color || "#22d3ee";

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
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  const captureReport = async () => {
    const element = reportRef.current;
    if (!element) return null;
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: "#010b1a",
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.report-container');
          if (el) el.style.padding = "40px"; 
        }
      });
      return canvas;
    } catch (err) { return null; }
  };

  const exportPDF = async () => {
    const canvas = await captureReport();
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`ExpensePal_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  const exportImage = async () => {
    const canvas = await captureReport();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ExpensePal_Analytics_${new Date().toLocaleDateString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#010b1a]">
        <div className="text-white text-lg font-black uppercase animate-pulse tracking-[0.3em]">Generating Report...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 bg-[#001226] min-h-screen text-left">
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <BarChart3 className="text-cyan-400" size={32} />
            Financial <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm italic font-bold mt-2">Comprehensive labor & spending analysis.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={exportImage} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"><ImageIcon size={16} className="text-cyan-400"/> Save Image</button>
            <button onClick={exportPDF} className="bg-cyan-500 hover:bg-cyan-400 text-[#001226] px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20"><FileText size={16} /> Export PDF</button>
        </div>
      </header>

      <div ref={reportRef} className="report-container p-8 bg-[#010b1a] rounded-[2.5rem] border border-white/5 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3"><TrendingUp size={18} className="text-cyan-400" /> Spending Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="black" />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="black" />
                  <Tooltip contentStyle={{ backgroundColor: '#001B3D', border: 'none', borderRadius: '10px', color: '#fff' }} />
                  <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorCyan)" isAnimationActive={false} />
                  <defs><linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient></defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-3"><Target size={18} className="text-cyan-400" /> Category Share</h3>
            <div className="h-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={false}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex justify-between items-center bg-[#050f1d] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-cyan-400 font-black text-xs">₱{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Category Data Table --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.04] text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6 text-center">Labor Cost</th>
                <th className="px-10 py-6 text-right">Total Expenses</th>
              </tr>
            </thead>
            <tbody className="text-white text-[13px] font-bold">
              {categoryData.map((cat, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-all">
                  <td className="px-10 py-5"><span className="tracking-wide uppercase text-[11px]">{cat.name}</span></td>
                  <td className="px-10 py-5 text-center text-orange-400 font-black flex items-center justify-center gap-2 tracking-widest"><Clock size={12}/> {formatLaborTime(cat.labor)}</td>
                  <td className="px-10 py-5 text-right text-cyan-400 font-black text-base italic">₱{cat.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- BAGONG ADD: Group Events Summary Section --- */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3 ml-2">
            <Users size={18} className="text-indigo-400" /> Group Events Overview
          </h3>
          <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.04] text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Event Title</th>
                  <th className="px-10 py-6 text-center">Tracking Type</th>
                  <th className="px-10 py-6 text-center">Progress</th>
                  <th className="px-10 py-6 text-right">Target Amount</th>
                </tr>
              </thead>
              <tbody className="text-white text-[13px] font-bold">
                {groupEvents.length > 0 ? groupEvents.map((evt, i) => {
                  const totalPaid = evt.members.reduce((sum, m) => sum + m.amount_paid, 0);
                  const progress = Math.min((totalPaid / evt.target_amount) * 100, 100).toFixed(0);
                  return (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-all">
                      <td className="px-10 py-5">
                        <span className="tracking-wide uppercase text-[11px] block">{evt.title}</span>
                        <span className="text-[9px] text-gray-500 uppercase">{evt.members.length} Members</span>
                      </td>
                      <td className="px-10 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          evt.type === 'fixed' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                        }`}>
                          {evt.type === 'fixed' ? 'Fixed Split' : 'Flexible Goal'}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-indigo-400 font-black">{progress}%</span>
                          <div className="w-20 h-1 bg-navy-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right text-white font-black text-base italic">₱{evt.target_amount.toLocaleString()}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-10 text-center text-gray-600 italic uppercase text-[10px] font-black tracking-widest">No Group Events Found</td>
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