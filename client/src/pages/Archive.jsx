import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, Trash2, Archive as ArchiveIcon, 
  Utensils, Bus, FileText, User, Users, GraduationCap, 
  PiggyBank, Tag, CreditCard, ReceiptText, Wallet, Calendar, Clock, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const iconMap = {
  'utensils': Utensils, 'bus': Bus, 'file-text': FileText, 'user': User,
  'users': Users, 'graduation-cap': GraduationCap, 'piggy-bank': PiggyBank,
  'tag': Tag, 'credit-card': CreditCard, 'file-invoice-dollar': ReceiptText
};

const Archive = () => {
  const [expenseArchived, setExpenseArchived] = useState([]);
  const [savingsArchived, setSavingsArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  // PREMIUM GLASSMORPHISM TOAST STYLE
  const toastStyle = {
    style: {
      background: 'rgba(13, 33, 55, 0.95)',
      color: '#fff',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      padding: '20px 30px',
      borderRadius: '25px',
      fontSize: '13px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      minWidth: '350px',
      textAlign: 'center'
    }
  };

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
    } catch (err) { 
      console.error(err); 
      toast.error("ARCHIVE SYNC FAILED", toastStyle);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleRestore = async (id, name, isSavings) => {
    const loadingToast = toast.loading(`RESTORING "${name.toUpperCase()}"...`, toastStyle);
    try {
      await api.put(isSavings ? `/savings/restore/${id}` : `/expenses/restore/${id}`);
      await fetchArchived();
      toast.success("RECORD RESTORED SUCCESSFULLY", { id: loadingToast, ...toastStyle });
    } catch (err) { 
      toast.error("RESTORE OPERATION FAILED", { id: loadingToast, ...toastStyle });
    }
  };

  const handlePermanentDelete = async (id, name, isSavings) => {
    // Custom Confirm Message Matching image_783319.png
    toast((t) => (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black tracking-tight">DELETE THIS {isSavings ? 'GOAL' : 'EXPENSE'} PERMANENTLY?</span>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase italic">
            Purging "{name}" cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const loadId = toast.loading("PURGING DATA FROM LEDGER...", toastStyle);
              try {
                await api.delete(isSavings ? `/savings/delete/${id}` : `/expenses/delete/${id}`);
                await fetchArchived();
                toast.success("DATA PURGED PERMANENTLY", { id: loadId, ...toastStyle });
              } catch (err) {
                toast.error("PURGE OPERATION FAILED", { id: loadId, ...toastStyle });
              }
            }} 
            className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
          >
            CONFIRM
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            CANCEL
          </button>
        </div>
      </div>
    ), { duration: 6000, ...toastStyle });
  };

  return (
    <div className="p-8 space-y-12 bg-[#001226] min-h-screen text-left animate-in fade-in duration-500 relative">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
          <ArchiveIcon className="text-cyan-400" size={36} /> 
          ARCHIVE <span className="text-cyan-400">BIN</span>
        </h1>
        {loading && <Loader2 className="animate-spin text-cyan-400" size={24} />}
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-cyan-400" size={48} />
          <div className="text-cyan-400 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Archives...</div>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* --- ARCHIVED EXPENSES --- */}
          <section>
            <div className="flex items-center gap-3 mb-8 border-l-4 border-cyan-400 pl-4">
              <ReceiptText className="text-cyan-400" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Archived Expenses</h2>
            </div>

            <div className="grid grid-cols-12 px-14 mb-6 text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">
              <div className="col-span-4">Item Detail</div>
              <div className="col-span-2 text-center">Date</div>
              <div className="col-span-2 text-center">Amount</div>
              <div className="col-span-2 text-center">Labor Investment</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="space-y-4">
              {expenseArchived.length > 0 ? expenseArchived.map((exp) => {
                const IconComponent = iconMap[exp.category_id?.category_icon] || Tag;
                const color = exp.category_id?.category_color || "#22d3ee";
                
                return (
                  <div key={exp._id} className="bg-[#05192e]/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-all group shadow-xl">
                    
                    <div className="col-span-4 flex items-center gap-6 pl-4">
                      <div className="h-14 w-14 rounded-2xl border flex items-center justify-center shadow-inner transition-transform group-hover:scale-105"
                        style={{ color: color, backgroundColor: `${color}10`, borderColor: `${color}25` }}>
                        <IconComponent size={24} />
                      </div>
                      <div className="text-left flex flex-col min-w-0">
                        <div className="font-extrabold text-2xl text-white tracking-tight uppercase leading-tight truncate italic">
                          {exp.item_name}
                        </div>
                        <div className="mt-1">
                          <span className="inline-block px-3 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-widest"
                            style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                            {exp.category_id?.category_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 text-gray-400 font-bold text-base tracking-tight text-center italic">
                      {new Date(exp.date_added).toLocaleDateString()}
                    </div>

                    <div className="col-span-2 text-3xl font-black text-cyan-400 italic tracking-tighter text-center">
                      ₱{parseFloat(exp.amount).toLocaleString()}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl text-yellow-400 font-black text-xs uppercase tracking-wider">
                        <Clock size={14} strokeWidth={3} /> {formatLaborTime(exp.labor_hours_equivalent)}
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-2 items-end pr-6">
                      <button 
                        onClick={() => handleRestore(exp._id, exp.item_name, false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-[#001226] transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center active:scale-95"
                      >
                        <RotateCcw size={14} /> RESTORE
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(exp._id, exp.item_name, false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center active:scale-95"
                      >
                        <Trash2 size={14} /> DELETE
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] text-gray-600 font-black uppercase text-sm tracking-[0.3em] italic">
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
                    <div className="h-16 w-16 rounded-2xl bg-[#0a2540] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                      <Wallet size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight italic">{sav.description}</h3>
                      <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 italic opacity-60">Archived Goal</p>
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
                      onClick={() => handleRestore(sav._id, sav.description, true)} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#001226] transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center active:scale-95"
                    >
                      <RotateCcw size={14} /> RESTORE
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(sav._id, sav.description, true)} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest w-32 justify-center active:scale-95"
                    >
                      <Trash2 size={14} /> DELETE
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-24 text-center bg-[#05192e]/20 border border-dashed border-white/5 rounded-[3rem] text-gray-600 font-black uppercase tracking-[0.3em] italic">
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