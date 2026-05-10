import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Archive, Clock, Tag, Edit2, X, ChevronDown,
  Utensils, Bus, FileText, User, Users, GraduationCap, 
  PiggyBank, CreditCard, ReceiptText, 
  Receipt, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const iconMap = {
  'utensils': Utensils, 'bus': Bus, 'file-text': FileText,
  'user': User, 'users': Users, 'graduation-cap': GraduationCap,
  'piggy-bank': PiggyBank, 'tag': Tag, 'credit-card': CreditCard,
  'file-invoice-dollar': ReceiptText
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ item_name: '', amount: '', category_id: '' });

  const CHAR_LIMIT = 30;

  const formatLaborTime = (decimalHours) => {
    if (!decimalHours || decimalHours <= 0) return "0s";
    const totalSeconds = Math.round(decimalHours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(" ");
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/categories')
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      window.dispatchEvent(new Event('badgeUpdate'));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const filteredExpenses = expenses
    .filter(exp => {
      const matchesSearch = exp.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const catName = exp.category_id?.category_name || "Uncategorized";
      const matchesCategory = categoryFilter === "All" || catName === categoryFilter;

      const expDate = new Date(exp.date_added);
      const now = new Date();
      let matchesTime = true;

      if (timeFilter === "7 Days") {
        const sevenDaysAgo = new Date().setDate(now.getDate() - 7);
        matchesTime = expDate >= sevenDaysAgo;
      } else if (timeFilter === "1 Month") {
        const oneMonthAgo = new Date().setMonth(now.getMonth() - 1);
        matchesTime = expDate >= oneMonthAgo;
      }

      return matchesSearch && matchesCategory && matchesTime;
    })
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        item_name: item.item_name, 
        amount: item.amount, 
        category_id: item.category_id?._id || item.category_id 
      });
    } else {
      setEditingItem(null);
      setFormData({ item_name: '', amount: '', category_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ item_name: '', amount: '', category_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.item_name.length > CHAR_LIMIT) return;
    try {
      if (editingItem) {
        await api.put(`/expenses/${editingItem._id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      window.dispatchEvent(new Event('badgeUpdate'));
      handleCloseModal();
      fetchInitialData();
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.response?.data?.message || "Error saving record.");
    }
  };

  const handleArchive = async (id, itemName) => {
    if (window.confirm(`Are you sure you want to archive "${itemName}"?`)) {
      try {
        await api.put(`/expenses/archive/${id}`);
        window.dispatchEvent(new Event('badgeUpdate'));
        fetchInitialData();
      } catch (err) {
        console.error("Archive error:", err);
        alert("Archive failed.");
      }
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#001226] text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Receipt className="text-cyan-400" size={32} />
            My <span className="text-cyan-400">Expenses</span>
          </h1>
          <p className="text-gray-500 text-sm italic font-bold tracking-wide mt-1">Track your spending vs labor hours.</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="bg-cyan-400 hover:bg-cyan-300 text-[#001226] px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 uppercase text-xs tracking-[0.15em] shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> ADD EXPENSE
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-[#05192e]/40 p-4 rounded-[1.5rem] border border-white/5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full bg-[#0a213a]/50 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-white focus:outline-none focus:border-cyan-400/50 font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/50" size={14} />
          <select 
            className="bg-[#0a213a]/50 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-cyan-400/50 font-bold text-xs uppercase tracking-widest appearance-none cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.category_name}>{cat.category_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
        </div>

        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/50" size={14} />
          <select 
            className="bg-[#0a213a]/50 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-cyan-400/50 font-bold text-xs uppercase tracking-widest appearance-none cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="All">All Time</option>
            <option value="7 Days">Last 7 Days</option>
            <option value="1 Month">Last 1 Month</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#05192e]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-white/[0.02] text-gray-500 text-[11px] uppercase tracking-[0.25em] font-black">
              <tr>
                <th className="p-8 text-center">Item Detail</th>
                <th className="p-8 text-center">Date</th>
                <th className="p-8 text-center">Amount</th>
                <th className="p-8 text-center">Labor Investment</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/5 font-medium">
              {loading ? (
                <tr><td colSpan="5" className="p-24 text-center text-gray-500 font-black animate-pulse uppercase tracking-[0.3em]">Syncing...</td></tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => {
                  const IconComponent = iconMap[exp.category_id?.category_icon] || Tag;
                  const color = exp.category_id?.category_color || "#22d3ee";
                  return (
                    <tr key={exp._id} className="hover:bg-white/[0.03] transition-all group">
                      
                      {/* ITEM DETAIL CELL - PINANTAY NA ALIGNMENT */}
                      <td className="p-8">
                        <div className="flex justify-center">
                          <div className="flex items-center gap-6 w-full max-w-[260px]"> 
                            <div className="h-12 w-12 flex-shrink-0 rounded-2xl border flex items-center justify-center shadow-inner"
                              style={{ color: color, backgroundColor: `${color}10`, borderColor: `${color}25` }}>
                              <IconComponent size={20} />
                            </div>
                            <div className="text-left flex flex-col min-w-0">
                              <div className="font-extrabold text-base tracking-tight capitalize leading-tight truncate">
                                {exp.item_name}
                              </div>
                              <div className="mt-1">
                                <span className="inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-widest"
                                  style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                                  {exp.category_id?.category_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-8 text-center text-sm font-bold text-gray-400">
                        {new Date(exp.date_added).toLocaleDateString()}
                      </td>

                      <td className="p-8 text-center font-black text-cyan-400 italic text-2xl">
                        ₱{parseFloat(exp.amount).toLocaleString()}
                      </td>

                      <td className="p-8 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl text-yellow-400 font-black text-xs uppercase tracking-wider">
                          <Clock size={14} strokeWidth={3} /> {formatLaborTime(exp.labor_hours_equivalent)}
                        </div>
                      </td>

                      <td className="p-8">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleOpenModal(exp)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400 hover:text-[#001226] transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
                            Edit <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleArchive(exp._id, exp.item_name)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
                            Archive <Archive size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="p-24 text-center text-gray-600 font-bold uppercase tracking-widest">No matching records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000d1a]/95 backdrop-blur-md text-white">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#051930] w-full max-w-[420px] rounded-[3rem] relative p-8 shadow-2xl border border-white/5 overflow-visible">
              
              <button onClick={handleCloseModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-8">
                {editingItem ? 'EDIT' : 'ADD'} <span className="text-cyan-400">EXPENSE</span>
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Description</label>
                    <span className={`text-[9px] font-black ${formData.item_name.length >= CHAR_LIMIT ? 'text-rose-500' : 'text-cyan-400'}`}>{formData.item_name.length}/{CHAR_LIMIT}</span>
                  </div>
                  <input type="text" placeholder="e.g. Electric Bill" className="w-full bg-[#0a2342] border border-white/5 rounded-xl p-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
                    value={formData.item_name} maxLength={CHAR_LIMIT} onChange={(e) => setFormData({...formData, item_name: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Amount</label>
                  <input type="number" placeholder="0.00" className="w-full bg-[#0a2342] border border-white/5 rounded-xl p-4 text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Category</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#0a2342] border border-white/5 rounded-xl p-4 text-white font-bold text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
                      value={formData.category_id} 
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(cat => (<option key={cat._id} value={cat._id} className="bg-[#0a2342] text-white">{cat.category_name}</option>))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#051930] font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">
                    {editingItem ? 'Update Record' : 'Submit Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;