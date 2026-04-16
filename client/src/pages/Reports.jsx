import React, { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { FileText, Image as ImageIcon, TrendingUp, Target, Tag } from 'lucide-react';
import api from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const fetchReportData = async () => {
    try {
      // Kunin ang active expenses na may kasamang category_color mula sa backend JOIN logic
      const res = await api.get('/expenses'); 
      const expenses = res.data;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = {};
      const catMap = {};
      let total = 0;

      expenses.forEach(exp => {
        const amount = parseFloat(exp.amount || 0);
        total += amount;

        const date = new Date(exp.date_added || new Date());
        const monthName = months[date.getMonth()];
        if (!monthlyMap[monthName]) monthlyMap[monthName] = { amount: 0 };
        monthlyMap[monthName].amount += amount;
        
        const cat = exp.category_name;
        if (!catMap[cat]) {
          catMap[cat] = { 
            name: cat, 
            value: 0, 
            labor: 0, 
            // DYNAMIC COLOR: Gamitin ang kulay mula sa database
            color: exp.category_color || "#94a3b8" 
          };
        }
        catMap[cat].value += amount;
        catMap[cat].labor += parseFloat(exp.labor_hours_equivalent || 0);
      });

      setTotalExpenses(total);
      setChartData(months.map(m => ({ name: m, amount: monthlyMap[m]?.amount || 0 })));
      setCategoryData(Object.values(catMap).sort((a, b) => b.value - a.value));
      setLoading(false);
    } catch (err) { 
        console.error("Fetch Error:", err);
        setLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  const exportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: "#001B3D", 
        scale: 2, 
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("ExpensePal_Report.pdf");
    } catch (error) { alert("PDF export failed."); }
  };

  const exportImage = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: "#001B3D", scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = 'ExpensePal_Report.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) { alert("Image export failed."); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#001B3D]">
        <div className="text-white text-lg font-black uppercase tracking-widest animate-pulse">Analyzing Data...</div>
    </div>
  );

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-4">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight">
            Labor <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-400 text-xs font-medium italic">Data driven insights for your expenditures.</p>
        </div>

        <div className="flex gap-2">
            <button onClick={exportImage} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all flex items-center gap-2">
                <ImageIcon size={16} className="text-cyan-400"/> 
                <span className="text-[9px] font-black uppercase tracking-widest">Image</span>
            </button>
            <button onClick={exportPDF} className="bg-cyan-400 hover:bg-cyan-300 text-navy-900 font-black px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-400/20 transition-all">
                <FileText size={16} /> 
                <span className="uppercase tracking-widest text-[9px]">Download PDF</span>
            </button>
        </div>
      </header>

      <div ref={reportRef} className="space-y-4 bg-[#001B3D] p-4 rounded-2xl border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> Spending VS Labor Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#001B3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={3} fill="url(#colorCyan)" />
                  <defs>
                    <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-2">
              <Target size={14} className="text-cyan-400" /> Category Share
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
              {categoryData.slice(0, 5).map((cat, i) => (
                <div key={i} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                    {((cat.value / totalExpenses) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-inner">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-center">Labor Hours Equivalent</th>
                <th className="px-8 py-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {categoryData.map((cat, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5" style={{ color: cat.color }}>
                        <Tag size={14} />
                      </div>
                      <div className="text-[12px] font-black uppercase tracking-tight">{cat.name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-[10px] font-black italic">
                        {cat.labor.toFixed(2)} HOURS
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="text-base font-black text-cyan-400 italic">₱{cat.value.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;