import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Archive as ArchiveIcon, Tag, Clock } from 'lucide-react';
import api from '../services/api';

const Archive = () => {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      // Direct call sa archived endpoint
      const res = await api.get('/expenses/archived'); 
      setArchived(res.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchArchived(); 
  }, []);

  const handleRestore = async (id, itemName) => {
    try {
      await api.put(`/expenses/restore/${id}`);
      alert(`Item restored: ${itemName}`); 
      fetchArchived();
    } catch (err) { alert("Restore failed"); }
  };

  const handlePermanentDelete = async (id, itemName) => {
    if (window.confirm(`WARNING: Permanently delete "${itemName}"?`)) {
      try {
        await api.delete(`/expenses/delete/${id}`);
        fetchArchived();
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
          <ArchiveIcon className="text-orange-400" /> Archive <span className="text-orange-400">Bin</span>
        </h1>
        <p className="text-gray-400 text-sm italic font-semibold tracking-wide">Review or permanently remove your archived records.</p>
      </div>

      <div className="bg-navy-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="p-8">Item Detail</th>
                <th className="p-8">Date</th>
                <th className="p-8 text-cyan-400">Amount</th>
                <th className="p-8 text-center">Labor Hours</th>
                <th className="p-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/5">
              {loading ? (
                 <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-black animate-pulse uppercase tracking-widest">Loading archive...</td></tr>
              ) : archived.length > 0 ? (
                archived.map((exp) => (
                  <tr key={exp.expense_id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-navy-700 border border-white/10 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors shadow-inner" style={{ color: exp.category_color }}>
                          <Tag size={20} />
                        </div>
                        <div>
                          <div className="font-extrabold text-base tracking-tight capitalize text-white group-hover:text-cyan-400 transition-colors">
                            {exp.item_name}
                          </div>
                          <div 
                            className="inline-block mt-1 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest"
                            style={{ 
                              color: exp.category_color, 
                              borderColor: `${exp.category_color}50`, 
                              backgroundColor: `${exp.category_color}15` 
                            }}
                          >
                            {exp.category_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-sm font-bold text-gray-400">{new Date(exp.date_added).toLocaleDateString()}</td>
                    <td className="p-8"><span className="text-xl font-black text-cyan-400 tracking-tighter italic">₱{parseFloat(exp.amount).toLocaleString()}</span></td>
                    <td className="p-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl text-yellow-400 shadow-sm font-black text-sm">
                        <Clock size={14} /> {parseFloat(exp.labor_hours_equivalent).toFixed(2)} hrs
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col xl:flex-row justify-center gap-3">
                        <button onClick={() => handleRestore(exp.expense_id, exp.item_name)} className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400 hover:text-navy-900 transition-all font-black text-[11px] uppercase">
                          Restore <RotateCcw size={14} />
                        </button>
                        <button onClick={() => handlePermanentDelete(exp.expense_id, exp.item_name)} className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black text-[11px] uppercase">
                          Delete <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-32 text-center text-gray-600 font-black uppercase opacity-30 italic"><ArchiveIcon size={48} className="mx-auto mb-4" />Archive is empty</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Archive;