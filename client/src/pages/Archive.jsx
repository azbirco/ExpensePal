import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Trash2, Archive as ArchiveIcon, 
  Utensils, Bus, FileText, User, Users, GraduationCap, 
  PiggyBank, Tag, CreditCard, ReceiptText, Wallet, Calendar, Timer
} from 'lucide-react';
import api from '../services/api';

const iconMap = {
  'utensils': Utensils, 'bus': Bus, 'file-text': FileText, 'user': User,
  'users': Users, 'graduation-cap': GraduationCap, 'piggy-bank': PiggyBank,
  'tag': Tag, 'credit-card': CreditCard, 'file-invoice-dollar': ReceiptText
};

const Archive = () => {
  const [expenseArchived, setExpenseArchived] = useState([]);
  const [savingsArchived, setSavingsArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const [expenseRes, savingsRes] = await Promise.all([
        api.get('/expenses/archived'),
        api.get('/savings/archived-list')
      ]);
      setExpenseArchived(expenseRes.data);
      setSavingsArchived(savingsRes.data);
      window.dispatchEvent(new Event('badgeUpdate'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleRestore = async (id, isSavings) => {
    try {
      await api.put(isSavings ? `/savings/restore/${id}` : `/expenses/restore/${id}`);
      fetchArchived();
    } catch (err) { console.error(err); }
  };

  const handlePermanentDelete = async (id, name, isSavings) => {
    if (window.confirm(`Delete "${name}" permanently?`)) {
      try {
        await api.delete(isSavings ? `/savings/delete/${id}` : `/expenses/delete/${id}`);
        fetchArchived();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="p-8 space-y-12 bg-[#001226] min-h-screen text-left animate-in fade-in duration-500">
      {/* Main Header */}
      <div>
        <h1 className="text-4xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
          <ArchiveIcon className="text-cyan-400" size={36} /> 
          ARCHIVE <span className="text-cyan-400">BIN</span>
        </h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-cyan-400 font-black animate-pulse uppercase tracking-widest">Loading Archives...</div>
      ) : (
        <div className="space-y-16">
          
          {/* --- ARCHIVED EXPENSES --- */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-4 border-cyan-400 pl-4">
              <ReceiptText className="text-cyan-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Archived Expenses</h2>
            </div>

            {/* Expenses Table Header */}
            <div className="grid grid-cols-12 px-14 mb-6 text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">
              <div className="col-span-4">Item Detail</div>
              <div className="col-span-2 text-center">Date</div>
              <div className="col-span-2 text-center">Amount</div>
              <div className="col-span-2 text-center">Labor Investment</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="space-y-4">
              {expenseArchived.length > 0 ? expenseArchived.map((exp) => (
                <div key={exp._id} className="bg-[#05192e]/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-all group">
                  
                  {/* Item Detail - Sinunod ang layout ng Notebook sa image_84e4ad.png */}
                  <div className="col-span-4 flex items-center gap-6 pl-4">
                    <div className="h-16 w-16 rounded-2xl border flex items-center justify-center bg-[#0a1d2e] border-white/10 text-cyan-400 shadow-xl">
                      {React.createElement(iconMap[exp.category_id?.category_icon] || Tag, { size: 28 })}
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white tracking-tight uppercase leading-none">{exp.item_name}</div>
                      <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-[10px] text-indigo-300 uppercase font-black mt-2 tracking-widest border border-indigo-500/30">
                        {exp.category_id?.category_name}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-gray-400 font-bold text-xl tracking-tight text-center">
                    {new Date(exp.date_added).toLocaleDateString()}
                  </div>

                  {/* Amount - Cyan color like image_84e4ad.png */}
                  <div className="col-span-2 text-4xl font-black text-cyan-400 italic tracking-tighter text-center">
                    ₱{parseFloat(exp.amount).toLocaleString()}
                  </div>

                  {/* Labor Investment Pill - Inayos para maging dynamic base sa amount */}
                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center gap-2 px-8 py-4 rounded-3xl bg-yellow-400/5 border border-yellow-400/20 text-yellow-400 font-black text-lg shadow-lg">
                      <Timer size={22} className="text-yellow-400" />
                      {/* Nag-calculate base sa amount para maging kapareho sa dashboard/expenses */}
                      {Math.floor(exp.amount / 100)}S
                    </div>
                  </div>

                  {/* Actions - May Icon at Text (Restore/Delete) */}
                  <div className="col-span-2 flex flex-col gap-2 items-end pr-6">
                    <button 
                      onClick={() => handleRestore(exp._id, false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-navy-900 transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center"
                    >
                      <RotateCcw size={14} /> RESTORE
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(exp._id, exp.item_name, false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center"
                    >
                      <Trash2 size={14} /> DELETE
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] text-gray-600 font-black uppercase text-sm tracking-[0.3em]">
                  No archived expenses found
                </div>
              )}
            </div>
          </section>

          {/* --- ARCHIVED SAVINGS --- */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-400 pl-4">
              <PiggyBank className="text-emerald-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Archived Savings Goals</h2>
            </div>

            <div className="grid grid-cols-12 px-14 mb-6 text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">
              <div className="col-span-4">Fund Description</div>
              <div className="col-span-3 text-center">Transaction Date</div>
              <div className="col-span-3 text-center">Balance</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="space-y-6">
              {savingsArchived.length > 0 ? savingsArchived.map((sav) => (
                <div key={sav._id} className="relative group bg-[#05192e]/40 border border-white/5 rounded-[2.5rem] p-10 grid grid-cols-12 items-center gap-4 hover:border-emerald-500/30 transition-all shadow-2xl">
                  
                  <div className="col-span-4 flex items-center gap-8">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-[#0a2540] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                      <Wallet size={32} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">{sav.description}</h3>
                      <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 italic">Archived Goal</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                    <div className="px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 text-sm">
                      <Calendar size={18} className="text-gray-500" />
                      <span className="text-gray-400 font-bold">{new Date(sav.date_added).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="col-span-3 text-center">
                    <div className="text-4xl font-black text-white italic tracking-tighter">
                      ₱{parseFloat(sav.amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-2 items-end pr-4">
                    <button 
                      onClick={() => handleRestore(sav._id, true)} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-navy-900 transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center"
                    >
                      <RotateCcw size={14} /> RESTORE
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(sav._id, sav.description, true)} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center"
                    >
                      <Trash2 size={14} /> DELETE
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-24 text-center bg-[#05192e]/20 border border-dashed border-white/5 rounded-[3rem] text-gray-600 font-black uppercase tracking-[0.3em]">
                  No archived savings goals
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default Archive;