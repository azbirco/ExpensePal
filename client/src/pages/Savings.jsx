import React, { useState, useEffect } from 'react';
import { PiggyBank, History, Wallet, CalendarDays, Trash2, AlertCircle, Search, Clock, PlusCircle, Settings2, Loader2 } from 'lucide-react';
import api from '../services/api';

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Debug log to check if component mounts
    console.log("Savings Component Mounted");
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log("Attempting to fetch savings from API...");
      const res = await api.get('/savings');
      
      console.log("API Response Data:", res.data);

      const activeSavings = Array.isArray(res.data) 
        ? res.data.filter(item => !item.isArchived) 
        : [];
      
      setSavings(activeSavings);
    } catch (err) {
      console.error("Critical Error fetching savings:", err);
      setFetchError(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const groupedSavings = savings.reduce((acc, curr) => {
    const key = curr.description || "Uncategorized";
    if (!acc[key]) {
      acc[key] = { 
        description: key,
        totalAmount: 0, 
        lastDate: curr.date_added,
        target_amount: curr.target_amount || 0,
        history: [],
        user_id: curr.user_id,
      };
    }
    acc[key].totalAmount += parseFloat(curr.amount) || 0;
    acc[key].history.push({
      amount: curr.amount,
      date: curr.date_added,
      _id: curr._id
    });
    return acc;
  }, {});

  const displayData = Object.values(groupedSavings)
    .filter(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

  const totalBalance = savings.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const handleAddDeposit = async (item) => {
    if (isSubmitting) return;
    const amountToAdd = prompt(`Magkano ang ihuhulog mo sa "${item.description}"?`);
    if (amountToAdd && !isNaN(amountToAdd) && parseFloat(amountToAdd) > 0) {
      setIsSubmitting(true);
      try {
        const newDeposit = {
          description: item.description,
          amount: parseFloat(amountToAdd),
          date_added: new Date().toISOString(),
          user_id: item.user_id || null,
          target_amount: item.target_amount || 0, 
          isArchived: false 
        };
        await api.post('/savings', newDeposit);
        await fetchSavings();
      } catch (err) {
        console.error("Deposit Error:", err);
        alert("Hindi nagawa ang deposit. Pakitingnan ang console.");
      } finally { setIsSubmitting(false); }
    }
  };

  const handleArchiveEntry = async (id, description) => {
    if (window.confirm(`Ilipat sa Archive ang transaction na ito mula sa ${description}?`)) {
      try {
        await api.put(`/savings/archive/${id}`); 
        await fetchSavings(); 
      } catch (err) {
        console.error("Archive Error:", err);
      }
    }
  };

  const handleDeleteCategory = async (description) => {
    if (window.confirm(`Sigurado ka bang gusto mong i-delete lahat ng records sa ilalim ng "${description}"?`)) {
      try {
        const itemsToDelete = savings.filter(s => s.description === description);
        await Promise.all(itemsToDelete.map(item => api.put(`/savings/archive/${item._id}`)));
        await fetchSavings();
      } catch (err) {
        console.error("Delete Category Error:", err);
      }
    }
  };

  return (
    <div className="p-8 space-y-10 min-h-screen bg-[#001226] text-white font-sans">
      
      {/* HEADER & TOTAL BALANCE BANNER */}
      <div className="space-y-6">
        <div className="px-2 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <PiggyBank className="text-cyan-400" size={24} />
                    SAVINGS <span className="text-cyan-400">TRACKER</span>
                </h1>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Monitoring your accumulated wealth and emergency funds.</p>
            </div>
            {loading && <Loader2 className="animate-spin text-cyan-400" size={20} />}
        </div>

        <div className="relative w-full bg-gradient-to-r from-[#00A3FF] to-[#0066FF] rounded-[2.5rem] p-12 overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                    <PiggyBank size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Current Savings Balance</span>
                </div>
                <div className="text-7xl font-black italic tracking-tighter text-white drop-shadow-lg">
                    ₱{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>
            <PiggyBank 
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 text-white/10 rotate-[-15deg]" 
                size={320} 
                strokeWidth={1}
            />
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={18} />
            {fetchError} - Check if backend is running at {api.defaults.baseURL}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 items-center bg-[#05192e]/40 p-4 rounded-[2rem] border border-white/5">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH FUND DESCRIPTION OR KEYWORDS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05192e] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-cyan-400/40 transition-all placeholder:text-gray-600"
          />
        </div>
        <div className="flex items-center gap-3 bg-[#05192e] border border-white/5 rounded-2xl px-6 py-4">
          <Clock size={16} className="text-cyan-400" />
          <select 
            className="bg-transparent text-xs font-black uppercase tracking-[0.2em] focus:outline-none cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">View All Time</option>
            <option value="month">Monthly View</option>
            <option value="year">Annual View</option>
          </select>
        </div>
      </div>

      {/* FUND MANAGEMENT TABLE */}
      <div className="bg-[#05192e]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="text-cyan-400" size={22} />
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">Fund Management</h2>
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {displayData.length} active descriptions detected
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-cyan-400" size={40} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Synchronizing Data...</span>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black border-b border-white/5">
                  <th className="p-8 text-center w-1/4">Fund Description</th>
                  <th className="p-8 text-center w-1/4">Transaction History</th>
                  <th className="p-8 text-center w-1/4">Current Balance</th>
                  <th className="p-8 text-center w-1/4">Action Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayData.length > 0 ? displayData.map((item) => (
                  <tr key={item.description} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-[#0a2540] flex items-center justify-center text-gray-400 border border-white/5 group-hover:border-cyan-400/30 transition-all shrink-0">
                          <Wallet size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-lg uppercase tracking-tighter mb-0.5 group-hover:text-cyan-400 transition-colors">
                              {item.description}
                          </div>
                          <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            {item.target_amount > 0 ? `Limit: ₱${item.target_amount.toLocaleString()}` : "No Allocation Limit"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-8">
                      <div className="max-h-[120px] overflow-y-auto space-y-2 px-2 custom-scrollbar">
                        {item.history.sort((a,b) => new Date(b.date) - new Date(a.date)).map((log) => (
                          <div key={log._id} className="flex justify-between items-center bg-white/[0.03] px-4 py-3 rounded-xl border border-white/5 hover:border-cyan-400/20 transition-all group/log">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              <CalendarDays size={12} className="text-cyan-400/50" />
                              {new Date(log.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-cyan-400 text-xs italic">+ ₱{parseFloat(log.amount).toLocaleString()}</span>
                              <button onClick={() => handleArchiveEntry(log._id, item.description)} className="opacity-0 group-hover/log:opacity-100 p-1 text-red-500/50 hover:text-red-500 transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-8 text-center">
                      <div className="text-4xl font-black italic tracking-tighter group-hover:scale-110 transition-transform duration-300">
                        ₱{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    <td className="p-8">
                      <div className="flex flex-col xl:flex-row items-center justify-center gap-3">
                        <button 
                          onClick={() => handleAddDeposit(item)}
                          className="w-full xl:w-auto flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-cyan-400/20"
                        >
                          <PlusCircle size={16} />
                          Deposit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(item.description)}
                          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <PiggyBank size={64} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Savings Records Detected</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-center gap-2 text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] py-10">
          <AlertCircle size={12} />
          Management Protocol: Records are archived upon deletion for security.
      </footer>
    </div>
  );
};

export default Savings;