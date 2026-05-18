import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Trash2, Shield, Search, Mail, Calendar } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch system users.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/auth/users/${id}/status`, { status });
      toast.success(`User access set to ${status.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} from the system?`)) {
      try {
        await api.delete(`/auth/users/${id}`);
        toast.success("User purged successfully.");
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed.");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#001B3D] font-sans text-left">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-[#05192e]/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
            <Shield className="text-cyan-400" size={32} />
            Control <span className="text-cyan-400">Center</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-widest italic opacity-70">
            System Gatekeeper: Manage user access and approvals.
          </p>
        </div>
        <div className="bg-cyan-400/10 border border-cyan-400/20 px-6 py-3 rounded-2xl">
            <span className="text-cyan-400 font-black text-xl italic">{users.length}</span>
            <span className="ml-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Users</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400" size={20} />
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search user by name or email..." 
          className="w-full bg-[#05192e]/60 border border-white/5 rounded-2xl py-4 pl-14 text-white font-bold outline-none focus:border-cyan-400/50 transition-all shadow-inner" 
        />
      </div>

      {/* USERS TABLE */}
      <div className="bg-[#05192e]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
              <th className="p-6 pl-10">User Identity</th>
              <th className="p-6 text-center">Join Date</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-right pr-10">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center animate-pulse text-cyan-400 font-black uppercase tracking-widest">Synchronizing Database...</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6 pl-10">
                  <div className="flex items-center gap-4">
                    <img src={u.profile_photo} alt="avatar" className="w-12 h-12 rounded-2xl border border-white/10" />
                    <div>
                      <div className="text-white font-black uppercase tracking-tight italic flex items-center gap-2">
                        {u.username}
                        {u.role === 'admin' && <span className="bg-cyan-400 text-[#001B3D] text-[8px] px-2 py-0.5 rounded-full">MASTER</span>}
                      </div>
                      <div className="text-gray-500 text-[10px] font-bold flex items-center gap-1"><Mail size={10}/> {u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                   <div className="text-gray-400 text-xs font-bold flex items-center justify-center gap-2 italic">
                     <Calendar size={12} /> {new Date(u.created_at).toLocaleDateString()}
                   </div>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    u.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-6 text-right pr-10">
                  <div className="flex justify-end gap-2">
                    {u.status !== 'approved' && (
                      <button onClick={() => handleStatusUpdate(u._id, 'approved')} className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-400 hover:text-[#001B3D] transition-all active:scale-90 shadow-lg">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {u.status !== 'rejected' && (
                      <button onClick={() => handleStatusUpdate(u._id, 'rejected')} className="p-3 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-400 hover:text-[#001B3D] transition-all active:scale-90 shadow-lg">
                        <XCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteUser(u._id, u.username)} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-400 hover:text-white transition-all active:scale-90 shadow-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;