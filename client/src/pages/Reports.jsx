import React, { useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, FileText, Image as ImageIcon, BarChart3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports = ({ data, categoryData }) => {
  const reportRef = useRef();

  const exportPDF = async () => {
    const element = reportRef.current;
    // Temporarily switch to solid bg for export clarity
    element.style.backgroundColor = "#001B3D";
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ExpensePal-Report.pdf');
    element.style.backgroundColor = "transparent";
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Financial <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Visualized spending patterns & trends</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all text-xs font-bold uppercase tracking-widest">
            <FileText size={16} className="text-cyan-400" /> Export PDF
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8 rounded-[2.5rem]">
        {/* Main Spending Trend */}
        <div className="bg-navy-800/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase tracking-widest text-sm">
            <BarChart3 size={18} className="text-cyan-400" /> Expense Timeline
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{dy: 10}} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#001B3D', border: '1px solid #ffffff10', borderRadius: '15px', color: '#fff' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={3} 
                  fillOpacity={1} fill="url(#colorAmount)" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-navy-800/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Category Split</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#22d3ee'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-md border border-cyan-400/20 p-8 rounded-[2.5rem] flex flex-col justify-center">
             <div className="text-center">
                <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Total Monthly Flow</p>
                <h4 className="text-5xl font-black text-white italic tracking-tighter">
                  ₱{data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </h4>
                <p className="text-gray-500 text-[10px] mt-4 uppercase font-bold tracking-widest">
                  Based on current filtered records
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;