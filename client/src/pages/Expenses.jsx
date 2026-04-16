import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Tag, Edit2, Archive, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import api from './api'; 

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(''); 

  const CHAR_LIMIT = 30;

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setDbCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0].category_name);
    } catch (err) { console.error("Error categories:", err); }
  };

  const fetchExpenses = async () => {
    setFetching(true);
    try {
      const res = await api.get('/expenses'); 
      setExpenses(res.data);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { 
    fetchExpenses(); 
    fetchCategories(); 
  }, []);

  const filteredExpenses = expenses.filter(exp => {
    if (exp.is_archived === 1) return false;
    return exp.item_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleArchive = async (id) => {
    const confirmMove = window.confirm("Are you sure you want to remove the item?");
    if (confirmMove) {
      try {
        await api.put(`/expenses/archive/${id}`); 
        fetchExpenses();
      } catch (err) { alert("Archive failed"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || description.length > CHAR_LIMIT) return;
    setLoading(true);

    const selectedCat = dbCategories.find(c => c.category_name === category);
    const payload = { 
      item_name: description, 
      amount: parseFloat(amount), 
      category_id: selectedCat ? selectedCat.category_id : 1 
    };

    try {
        if (editingExpense) await api.put(`/expenses/update/${editingExpense.expense_id}`, payload);
        else await api.post('/expenses/add', payload);
        handleCloseModal();
        fetchExpenses();
    } catch (err) { 
        console.error(err);
        alert("Transaction failed.");
    } finally { setLoading(false); }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); 
    setEditingExpense(null);
    setDescription(''); 
    setAmount(''); 
    if (dbCategories.length > 0) setCategory(dbCategories[0].category_name);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">My <span className="text-cyan-400">Expenses</span></h1>
          <p className="text-gray-500 text-sm italic">Track your spending vs labor hours.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-cyan-400 text-navy-900 font-bold py-2.5 px-6 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
            <Plus size={18} /> <span className="font-black uppercase tracking-wider text-xs">Add New</span>
        </button>
      </div>

      <div className="bg-navy-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <tr>
                    <th className="p-6">Item Detail</th>
                    <th className="p-6">Date</th>
                    <th className="p-6 text-right">Amount</th>
                    <th className="p-6 text-center">Labor Hours</th>
                    <th className="p-6 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/5">
                {fetching ? (
                   <tr><td colSpan="5" className="p-20 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Loading data...</td></tr>
                ) : filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
                <tr key={exp.expense_id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: `${exp.category_color}40`, backgroundColor: `${exp.category_color}10`, color: exp.category_color }}><Tag size={16}/></div>
                            <div>
                                <div className="font-bold text-sm tracking-tight capitalize">{exp.item_name}</div>
                                <div className="text-[9px] mt-1.5 px-2 py-0.5 rounded-md font-black uppercase tracking-widest inline-block border" style={{ color: exp.category_color, borderColor: `${exp.category_color}50`, backgroundColor: `${exp.category_color}20` }}>{exp.category_name}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-6 text-sm font-semibold text-gray-400">{new Date(exp.date_added).toLocaleDateString()}</td>
                    <td className="p-6 font-bold text-cyan-400 text-lg text-right">₱{parseFloat(exp.amount).toLocaleString()}</td>
                    <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full font-mono font-black text-amber-400 text-xs">
                            <Clock size={12}/> {parseFloat(exp.labor_hours_equivalent).toFixed(2)} hrs
                        </div>
                    </td>
                    <td className="p-6 text-center">
                        <button onClick={() => { setEditingExpense(exp); setDescription(exp.item_name); setAmount(exp.amount); setCategory(exp.category_name); setIsModalOpen(true); }} className="p-2.5 bg-white/5 hover:bg-cyan-400/10 rounded-xl text-gray-500 hover:text-cyan-400 transition-all mr-2"><Edit2 size={14}/></button>
                        <button onClick={() => handleArchive(exp.expense_id)} className="p-2.5 bg-white/5 hover:bg-rose-400/10 rounded-xl text-gray-500 hover:text-rose-400 transition-all"><Archive size={14}/></button>
                    </td>
                </tr>
                )) : (
                   <tr><td colSpan="5" className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs italic">No records found.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-navy-800 border border-white/10 p-10 rounded-[3rem] relative shadow-3xl">
              <button onClick={handleCloseModal} className="absolute right-8 top-8 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
              
              <h2 className="text-2xl font-black text-white uppercase text-center mb-8">{editingExpense ? "Edit" : "Add"} <span className="text-cyan-400">Expense</span></h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400"> Item Description</label>
                    <span className={`text-[10px] font-bold ${description.length >= CHAR_LIMIT ? 'text-rose-500' : 'text-cyan-400'}`}>
                      {description.length}/{CHAR_LIMIT}
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Electric Bill" 
                      className={`w-full bg-navy-900/50 border rounded-2xl py-4 px-5 text-white outline-none transition-all
                        ${description.length >= CHAR_LIMIT ? 'border-rose-500/50 ring-1 ring-rose-500/20' : 'border-white/10 focus:border-cyan-400/40'}`} 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                    />
                    {description.length >= CHAR_LIMIT && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500">
                        <AlertCircle size={18} />
                      </div>
                    )}
                  </div>
                  {description.length >= CHAR_LIMIT && (
                    <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">You've reached character limit</p>
                  )}
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 px-1">Amount</label>
                   <input type="number" required placeholder="0.00" className="w-full bg-navy-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-cyan-400/40" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 px-1">Category</label>
                  <div className="relative">
                    <select className="w-full bg-navy-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none appearance-none cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {dbCategories.map(cat => <option key={cat.category_id} value={cat.category_name} className="bg-navy-800 text-white">{cat.category_name}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <button disabled={loading || description.length > CHAR_LIMIT} className="w-full bg-cyan-400 text-navy-900 font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm mt-4 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500">
                  {loading ? "Saving..." : "Submit Record"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;