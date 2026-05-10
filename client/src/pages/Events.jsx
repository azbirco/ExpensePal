import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Trash2, UserPlus, ArrowRight, 
  Search, Filter, Calendar, Edit2, Target, 
  ChevronRight, LayoutGrid, MoreHorizontal, X
} from 'lucide-react';
import api from '../services/api';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // State para sa Edit mode

  // Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('fixed'); 
  const [targetAmount, setTargetAmount] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    if (!memberInput.trim()) return;
    if (members.length >= 15) {
      alert("Maximum of 15 members only.");
      return;
    }
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberInput.trim())}`;
    setMembers([...members, { 
      name: memberInput.trim(), 
      avatar: avatarUrl, 
      style: 'avataaars', 
      amount_paid: 0, 
      is_paid: false 
    }]);
    setMemberInput('');
  };

  const toggleAvatarStyle = (index) => {
    const styles = ['avataaars', 'pixel-art-neutral', 'bottts', 'adventurer'];
    const currentStyle = members[index].style;
    const nextStyle = styles[(styles.indexOf(currentStyle) + 1) % styles.length];
    const updatedMembers = [...members];
    updatedMembers[index].style = nextStyle;
    updatedMembers[index].avatar = `https://api.dicebear.com/7.x/${nextStyle}/svg?seed=${encodeURIComponent(updatedMembers[index].name)}`;
    setMembers(updatedMembers);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (members.length === 0) return alert("Please add at least one member.");
    try {
      const eventData = { title: title.trim(), type, target_amount: Number(targetAmount), members };
      
      if (isEditing) {
        await api.put(`/events/${isEditing}`, eventData);
      } else {
        await api.post('/events', eventData);
      }
      
      setShowModal(false);
      resetForm();
      fetchEvents();
      window.dispatchEvent(new Event('badgeUpdate'));
    } catch (err) {
      alert("Error saving event.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event tracker?")) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
        window.dispatchEvent(new Event('badgeUpdate'));
      } catch (err) {
        alert("Failed to delete event.");
      }
    }
  };

  const handleEditInit = (event) => {
    setIsEditing(event._id);
    setTitle(event.title);
    setType(event.type);
    setTargetAmount(event.target_amount);
    setMembers(event.members);
    setShowModal(true);
  };

  const resetForm = () => {
    setTitle(''); setType('fixed'); setTargetAmount('');
    setMembers([]); setMemberInput(''); setIsEditing(null);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-left bg-[#001B3D] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-[#05192e]/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase text-left">
            <div className="bg-cyan-500/20 p-3 rounded-2xl">
              <Users className="text-cyan-400" size={32} /> 
            </div>
            Group <span className="text-cyan-400">Events</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-2 italic text-left">Organize, track, and split expenses with your team.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-cyan-400 hover:bg-cyan-300 text-[#001B3D] px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)] uppercase text-xs tracking-widest"
        >
          <Plus size={20} strokeWidth={3} /> Create New Event
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
          <input 
            placeholder="Search events by title..." 
            className="w-full bg-[#05192e]/60 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-cyan-400/50 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Events Grid Section */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-cyan-400 font-black uppercase tracking-[0.3em]">Loading Trackers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="bg-[#05192e]/60 border border-white/5 rounded-[2.5rem] p-8 hover:border-cyan-400/30 transition-all group relative overflow-hidden flex flex-col shadow-2xl">
                
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    event.type === 'fixed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                  }`}>
                    {event.type === 'fixed' ? 'Fixed Splitting' : 'Flexible Tracking'}
                  </span>
                  
                  {/* Actions: Edit & Delete with Labels */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditInit(event)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all group/edit"
                    >
                      <Edit2 size={13} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all group/del"
                    >
                      <Trash2 size={13} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 truncate text-left">{event.title}</h3>
                
                <div className="flex items-center gap-2 mb-6 text-left">
                  <div className="flex -space-x-3">
                    {event.members.slice(0, 4).map((m, i) => (
                      <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-10 h-10 rounded-full border-4 border-[#05192e] bg-[#001B3D]" alt={m.name} />
                    ))}
                    {event.members.length > 4 && (
                      <div className="w-10 h-10 rounded-full border-4 border-[#05192e] bg-navy-800 flex items-center justify-center text-[10px] font-black text-cyan-400">
                        +{event.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{event.members.length} Members</span>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-4 text-left">
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Target Budget</p>
                    <p className="text-3xl font-black text-white italic">₱{event.target_amount.toLocaleString()}</p>
                  </div>

                  <button 
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="w-full bg-white/5 hover:bg-cyan-400 hover:text-[#001B3D] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    View Event Details <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-[#05192e]/20 border border-dashed border-white/10 rounded-[3rem]">
              <Users className="mx-auto text-gray-700 mb-4" size={48} />
              <div className="text-gray-600 font-black uppercase tracking-[0.3em] italic text-center">No active group trackers found</div>
            </div>
          )}
        </div>
      )}

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000a1a]/95 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#001B3D] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {isEditing ? 'Update Group Event' : 'Setup Group Event'}
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Configure your target & members</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="bg-white/5 p-3 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">Event Description</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#05192e] border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 outline-none text-white font-bold transition-all shadow-inner" placeholder="e.g. Team Dinner Outing" />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">Target Budget (₱)</label>
                  <input type="number" required value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full bg-[#05192e] border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 outline-none text-white font-black text-2xl" placeholder="0.00" />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">Tracking Logic</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setType('fixed')} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${type === 'fixed' ? 'bg-cyan-400 border-cyan-400 text-[#001B3D]' : 'bg-white/5 border-white/10 text-gray-500'}`}>Fixed Split</button>
                    <button type="button" onClick={() => setType('flexible')} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${type === 'flexible' ? 'bg-cyan-400 border-cyan-400 text-[#001B3D]' : 'bg-white/5 border-white/10 text-gray-500'}`}>Flexible</button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-cyan-400 uppercase ml-2 tracking-widest">Add Group Member ({members.length}/15)</label>
                  <div className="flex gap-2 text-left">
                    <input value={memberInput} onChange={(e) => setMemberInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())} className="flex-1 bg-[#05192e] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-cyan-400 shadow-inner" placeholder="Member Name" />
                    <button type="button" onClick={addMember} className="bg-cyan-400/20 text-cyan-400 p-4 rounded-2xl hover:bg-cyan-400/30 transition-all border border-cyan-400/30"><UserPlus size={24} /></button>
                  </div>
                </div>

                <div className="flex-1 bg-[#05192e]/40 border border-white/5 rounded-[2rem] p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {members.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {members.map((m, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl group/item border border-white/5">
                          <div className="flex items-center gap-3">
                            <div onClick={() => toggleAvatarStyle(index)} className="relative cursor-pointer hover:scale-110 transition-transform active:rotate-12" title="Toggle Avatar Style">
                              <img src={m.avatar} className="w-10 h-10 rounded-xl bg-[#001B3D] border border-cyan-400/30" alt="avatar" />
                              <div className="absolute -bottom-1 -right-1 bg-cyan-400 rounded-full p-1 shadow-lg shadow-cyan-400/50"><Plus size={8} className="text-[#001B3D]" /></div>
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">{m.name}</span>
                          </div>
                          <button type="button" onClick={() => removeMember(index)} className="text-gray-600 hover:text-rose-500 p-2 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] font-black text-gray-700 uppercase tracking-widest italic text-center">Members list is empty</div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-500 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Cancel Process</button>
                <button type="submit" className="flex-[2] bg-cyan-400 hover:bg-cyan-300 text-[#001B3D] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all active:scale-95">
                  {isEditing ? 'Update Tracker' : 'Finalize and Launch Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;