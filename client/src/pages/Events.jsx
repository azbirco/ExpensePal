import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Trash2, UserPlus, Search, Edit2, ChevronRight, X,
  Target, PiggyBank, Filter, Wallet, ArrowRight, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // UI Flow Logic
  const [step, setStep] = useState(1); 
  const [selectedMode, setSelectedMode] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  // Search/Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to sync event logs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const addMember = () => {
    if (!memberInput.trim()) return;
    if (members.length >= 15) {
      toast.error('Limit reached: Maximum of 15 members.');
      return;
    }
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberInput.trim())}`;
    setMembers([...members, {
      name: memberInput.trim(),
      avatar: avatarUrl,
      amount_paid: 0,
      is_paid: false,
      payments: []
    }]);
    setMemberInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(targetAmount) <= 0 || !targetAmount) {
      toast.error(`Please enter a valid ${selectedMode === 'fixed' ? 'budget' : 'goal'}.`);
      return;
    }
    if (members.length === 0) {
      toast.error('Please add at least one member.');
      return;
    }

    const loadId = toast.loading("Processing event...");
    try {
      const eventData = {
        title: title.trim(),
        type: selectedMode,
        target_amount: parseFloat(targetAmount),
        members: members
      };

      if (isEditing) {
        await api.put(`/events/${isEditing}`, eventData);
        toast.success("Event updated successfully!", { id: loadId });
      } else {
        await api.post('/events', eventData);
        toast.success("New event launched!", { id: loadId });
      }

      closeAndReset();
      fetchEvents();
      window.dispatchEvent(new Event('badgeUpdate'));
    } catch (err) {
      toast.error("Error saving event.", { id: loadId });
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-sm">Delete this event permanently?</span>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            const loadId = toast.loading("Deleting...");
            await api.delete(`/events/${id}`);
            fetchEvents();
            toast.success("Deleted.", { id: loadId });
          }} className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Confirm</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-white/10 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Cancel</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleEditInit = (event) => {
    setIsEditing(event._id);
    setTitle(event.title);
    setSelectedMode(event.type);
    setTargetAmount(event.target_amount);
    setMembers(event.members);
    setStep(2); 
    setShowModal(true);
  };

  const closeAndReset = () => {
    setShowModal(false);
    setStep(1);
    setIsEditing(null);
    setTitle('');
    setTargetAmount('');
    setMembers([]);
    setSelectedMode(null);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#001B3D] font-sans relative text-left">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-[#05192e]/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
            <Users className="text-cyan-400" size={32} />
            Group <span className="text-cyan-400">Events</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-widest italic opacity-70">
            Organize, track, and split expenses with your team.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-cyan-400 hover:bg-cyan-300 text-[#001B3D] px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.3)] uppercase text-xs tracking-widest">
          <Plus size={20} strokeWidth={3} /> Create New Event
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400" size={20} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search event title..." className="w-full bg-[#05192e]/60 border border-white/5 rounded-2xl py-4 pl-14 text-white font-bold outline-none focus:border-cyan-400/50 transition-all shadow-inner" />
        </div>
        <div className="bg-[#05192e]/60 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Filter className="text-cyan-400" size={18} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent text-white text-xs font-black uppercase outline-none cursor-pointer">
            <option value="all">All Modes</option>
            <option value="fixed">Fixed Splitting</option>
            <option value="flexible">Flexible Tracking</option>
          </select>
        </div>
      </div>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-cyan-400 font-black uppercase tracking-[0.3em]">Synchronizing Logs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {filteredEvents.map((event) => {
            const totalCollected = event.members.reduce((sum, m) => sum + (m.amount_paid || 0), 0);
            const progress = event.target_amount > 0 ? Math.min((totalCollected / event.target_amount) * 100, 100) : 0;
            
            return (
              <div key={event._id} className="bg-[#0D2137]/80 border border-white/5 rounded-[3rem] p-10 hover:border-cyan-400/30 transition-all flex flex-col shadow-2xl relative group overflow-hidden">
                
                {/* 1. TOP HEADER: BADGE + ACTION BUTTONS */}
                <div className="flex justify-between items-center mb-10">
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    event.type === 'fixed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                  }`}>
                    {event.type === 'fixed' ? 'Fixed Splitting' : 'Flexible Tracking'}
                  </span>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleEditInit(event)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all text-[10px] font-black uppercase tracking-widest">
                       <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-[10px] font-black uppercase tracking-widest">
                       <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
                
                {/* 2. TITLE & MEMBER COUNT */}
                <h3 className="text-4xl font-black text-white uppercase mb-4 tracking-tighter italic">{event.title}</h3>
                
                <div className="flex items-center gap-3 mb-10">
                  <div className="flex -space-x-3">
                    {event.members.slice(0, 4).map((m, i) => (
                      <img
                        key={i}
                        src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                        className="w-10 h-10 rounded-full border-4 border-[#0D2137] bg-[#001B3D] shadow-lg"
                        alt={m.name}
                      />
                    ))}
                    {event.members.length > 4 && (
                      <div className="w-10 h-10 rounded-full border-4 border-[#0D2137] bg-[#1A2E44] flex items-center justify-center text-[10px] font-black text-cyan-400">
                        +{event.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    {event.members.length} Members
                  </span>
                </div>
                
                {/* 3. PROGRESS SECTION: TEXT BAR AMOUNTS */}
                <div className="space-y-5 mb-10">
                    <div className="flex justify-between text-[11px] font-black uppercase text-gray-500 tracking-[0.2em]">
                        <span>Collection Progress</span>
                        <span className="text-cyan-400">{progress.toFixed(0)}%</span>
                    </div>
                    
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                        <div className="h-full bg-[#00E5FF] transition-all duration-1000 shadow-[0_0_20px_rgba(0,229,255,0.6)]" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">₱{totalCollected.toLocaleString()} Collected</span>
                        <span className="text-gray-600">₱{event.target_amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* 4. FOOTER: BIG PRICE + VIEW BUTTON */}
                <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-6">
                   <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-[0.3em]">
                        {event.type === 'fixed' ? 'Target Budget' : 'Contribution Goal'}
                      </p>
                      <p className="text-5xl font-black text-white italic tracking-tighter">
                        ₱{event.target_amount.toLocaleString()}
                      </p>
                   </div>
                   
                   <button 
                     onClick={() => navigate(`/events/${event._id}`)} 
                     className="w-full bg-[#00E5FF]/5 hover:bg-[#00E5FF] text-white hover:text-[#001B3D] py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 border border-[#00E5FF]/20 group/btn shadow-xl active:scale-95"
                   >
                      View Event Details 
                      <ChevronRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL (Kept working from previous version) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000a1a]/95 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="bg-[#0D2137] border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 animate-in zoom-in duration-300 relative">
            {step === 1 ? (
              <div className="space-y-10 py-4">
                <div className="text-left space-y-2">
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Setup Group Event</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest opacity-60">Configure your target & members</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <button onClick={() => { setSelectedMode('fixed'); setStep(2); }} className="group relative overflow-hidden text-left bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/20 hover:border-cyan-400/50 rounded-[2.5rem] p-10 transition-all hover:-translate-y-2">
                    <div className="w-16 h-16 bg-cyan-400/20 rounded-[1.5rem] flex items-center justify-center text-cyan-400 mb-8"><Target size={32} /></div>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">Fixed Splitting</h4>
                    <p className="text-cyan-100/50 text-sm font-semibold leading-relaxed">Equal contribution with a specific goal.</p>
                    <div className="mt-10 flex items-center gap-3 text-cyan-400 font-black uppercase text-[10px] tracking-[0.2em]">Continue Setup <ChevronRight size={14} /></div>
                  </button>
                  <button onClick={() => { setSelectedMode('flexible'); setStep(2); }} className="group relative overflow-hidden text-left bg-gradient-to-br from-emerald-500/10 to-green-700/10 border border-emerald-400/20 hover:border-emerald-400/50 rounded-[2.5rem] p-10 transition-all hover:-translate-y-2">
                    <div className="w-16 h-16 bg-emerald-400/20 rounded-[1.5rem] flex items-center justify-center text-emerald-400 mb-8"><PiggyBank size={32} /></div>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">Flexible Tracking</h4>
                    <p className="text-emerald-100/50 text-sm font-semibold leading-relaxed">Open-ended savings or contribution tracking.</p>
                    <div className="mt-10 flex items-center gap-3 text-emerald-400 font-black uppercase text-[10px] tracking-[0.2em]">Continue Setup <ChevronRight size={14} /></div>
                  </button>
                </div>
                <button onClick={closeAndReset} className="absolute top-10 right-10 p-3 bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={24} /></button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                     <div className={`p-4 rounded-2xl ${selectedMode === 'fixed' ? 'bg-cyan-400/20 text-cyan-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
                        {selectedMode === 'fixed' ? <Target size={24} /> : <PiggyBank size={24} />}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected Mode</p>
                        <h3 className={`text-lg font-black uppercase italic ${selectedMode === 'fixed' ? 'text-cyan-400' : 'text-emerald-400'}`}>{selectedMode === 'fixed' ? 'Fixed Splitting' : 'Flexible Tracking'}</h3>
                     </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">Event Description</label>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Team Dinner Outing" className="w-full bg-[#05192e] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-cyan-400 shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">{selectedMode === 'fixed' ? 'Target Budget (₱)' : 'Contribution Goal (₱)'}</label>
                    <input type="number" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#05192e] border border-white/10 rounded-2xl p-4 text-white font-black text-2xl outline-none focus:border-cyan-400 shadow-inner" />
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="w-full py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all">Change Tracking Mode</button>
                </div>
                <div className="flex flex-col h-full text-left">
                  <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest mb-2">Add Group Member ({members.length}/15)</label>
                  <div className="flex gap-2 mb-4">
                    <input value={memberInput} onChange={(e) => setMemberInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())} placeholder="Member Name" className="flex-1 bg-[#05192e] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" />
                    <button type="button" onClick={addMember} className="bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 p-4 rounded-2xl hover:bg-cyan-400/40"><UserPlus size={24} /></button>
                  </div>
                  <div className="flex-1 bg-[#05192e]/40 border border-white/5 rounded-[2.5rem] p-4 max-h-[200px] overflow-y-auto">
                    {members.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {members.map((m, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-xl">
                            <div className="flex items-center gap-3">
                               <img src={m.avatar} alt="avatar" className="w-8 h-8 rounded-lg bg-[#001B3D]" />
                               <span className="text-[10px] font-black text-white uppercase">{m.name}</span>
                            </div>
                            <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-rose-500"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] text-gray-700 font-black uppercase italic">Members list is empty</div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button type="button" onClick={closeAndReset} className="flex-1 py-5 bg-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase">Cancel Process</button>
                    <button type="submit" className="flex-[2] py-5 bg-cyan-400 text-[#001B3D] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.3)]">Launch Event</button>
                  </div>
                </div>
                <button type="button" onClick={closeAndReset} className="absolute top-10 right-10 p-3 bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={24} /></button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;