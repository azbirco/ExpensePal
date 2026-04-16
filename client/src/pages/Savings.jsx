import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from './api'; 

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalAmount = savings.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const fetchSavings = async () => {
    try {
      const res = await api.get('/savings');
      setSavings(res.data);
    } catch (err) {
      console.error("Error fetching savings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  if (loading) return <div className="p-8 text-white font-mono">Loading tracking data...</div>;

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Savings Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">Monitoring your accumulated wealth and emergency funds.</p>
      </div>

      {/* Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(34,211,238,0.2)] mb-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
            <PiggyBank size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 text-white/80 mb-2">
            <PiggyBank size={20} />
            <span className="font-bold uppercase tracking-[0.2em] text-xs">Total Savings Balance</span>
            </div>
            <h2 className="text-5xl font-black text-white italic">
                ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
        </div>
      </motion.div>

      {/* History List */}
      <div className="bg-navy-800/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <h3 className="text-white font-bold mb-8 flex items-center gap-3 text-lg">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
                <TrendingUp size={20} className="text-cyan-400" />
            </div> 
            Savings History
        </h3>
        
        <div className="space-y-4">
          {savings.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.savings_id} 
              className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-400/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-cyan-400 font-bold border border-white/10">
                    S
                </div>
                <div>
                    <div className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{item.description}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                    <Calendar size={12} className="text-gray-600" /> {new Date(item.date_added).toLocaleDateString()}
                    </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-black text-lg">+ ₱{parseFloat(item.amount).toLocaleString()}</div>
                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Confirmed</div>
              </div>
            </motion.div>
          ))}

          {savings.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle size={40} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 italic text-sm">Walang record ng savings. <br/>Mag-add ng expense gamit ang 'Savings & Emergency' category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;