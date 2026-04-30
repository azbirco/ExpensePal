import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api'; 

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safe reduction with fallback to 0
  const totalAmount = savings.reduce((sum, item) => {
    const val = parseFloat(item.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const fetchSavings = async () => {
    try {
      const res = await api.get('/savings');
      setSavings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching savings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#001B3D]">
        <div className="text-cyan-400 font-black animate-pulse tracking-widest">LOADING SAVINGS DATA...</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Savings <span className="text-cyan-400">Tracker</span>
        </h1>
        <p className="text-gray-400 text-xs mt-1 italic">Monitoring your accumulated wealth and emergency funds.</p>
      </header>

      {/* Summary Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(34,211,238,0.3)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <PiggyBank size={140} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 text-white/80 mb-2">
                <PiggyBank size={18} />
                <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Total Savings Balance</span>
            </div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter">
                ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
        </div>
      </motion.div>

      {/* History List */}
      <div className="bg-navy-800/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl">
        <h3 className="text-white font-bold mb-8 flex items-center gap-3 text-lg uppercase tracking-tight">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
                <TrendingUp size={20} className="text-cyan-400" />
            </div> 
            Growth History
        </h3>
        
        <div className="space-y-4">
          {savings.length > 0 ? (
            savings.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                key={item.savings_id} 
                className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-400/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-navy-900 flex items-center justify-center text-cyan-400 font-black border border-white/10 shadow-lg">
                      S
                  </div>
                  <div>
                      <div className="text-white font-bold group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-tight">{item.description}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1 uppercase tracking-wider font-medium">
                        <Calendar size={12} className="text-gray-600" /> {new Date(item.date_added).toLocaleDateString()}
                      </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-black text-xl italic">+ ₱{parseFloat(item.amount).toLocaleString()}</div>
                  <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Asset Logged</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
              <AlertCircle size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-sm">Walang record ng savings.</p>
              <p className="text-gray-600 text-xs mt-2 italic px-4 text-balance">Mag-add ng expense gamit ang 'Savings & Emergency' category para mag-appear dito.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;