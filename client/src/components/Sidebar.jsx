import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  LogOut, 
  Archive, 
  PiggyBank, 
  Users,
  Shield 
} from 'lucide-react';
import api from '../services/api';
import Logo from './Logo';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [counts, setCounts] = useState({ active: 0, archived: 0, savings: 0, events: 0 });
  const [user, setUser] = useState({ name: '', email: '', avatar: '', role: 'user' });

  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) {
        setUser({
          name: res.data.username || 'User',
          email: res.data.email || '',
          avatar: res.data.profile_photo || '',
          role: res.data.role || 'user'
        });
      }
    } catch (err) {
      console.warn("Failed to fetch user profile for sidebar");
    }
  };

  const fetchSidebarCounts = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?.role === 'admin') return;

      const expenseRes = await api.get('/expenses/sidebar-counts');
      const activeSavingsRes = await api.get('/savings');
      const archivedSavingsRes = await api.get('/savings/archived-list');
      const eventsRes = await api.get('/events');

      if (expenseRes.data) {
        setCounts({
          active: expenseRes.data.active || 0,
          archived: (expenseRes.data.archived || 0) + (archivedSavingsRes.data?.length || 0),
          savings: Array.isArray(activeSavingsRes.data) ? activeSavingsRes.data.length : 0,
          events: Array.isArray(eventsRes.data) ? eventsRes.data.length : 0
        });
      }
    } catch (err) {
      console.warn("Sidebar counts sync failed...");
    }
  };

  useEffect(() => {
    fetchSidebarCounts();
    fetchUserData();
    window.addEventListener('badgeUpdate', fetchSidebarCounts);
    window.addEventListener('profileUpdate', fetchUserData); 
    const interval = setInterval(fetchSidebarCounts, 5000);
    return () => {
      window.removeEventListener('badgeUpdate', fetchSidebarCounts);
      window.removeEventListener('profileUpdate', fetchUserData);
      clearInterval(interval);
    };
  }, []);

  const userMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt, badge: counts.active, badgeColor: 'bg-cyan-400 text-[#001B3D]' },
    { name: 'Savings', path: '/savings', icon: PiggyBank, badge: counts.savings, badgeColor: 'bg-emerald-400 text-[#001B3D]' },
    { name: 'Group Events', path: '/events', icon: Users, badge: counts.events, badgeColor: 'bg-indigo-400 text-[#001B3D]' },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Archive Bin', path: '/archive', icon: Archive, badge: counts.archived, badgeColor: 'bg-rose-400 text-[#001B3D]' },
  ];

  const adminMenu = [
    { name: 'Admin Panel', path: '/admin', icon: Shield, badge: 0, badgeColor: 'bg-cyan-400 text-[#001B3D]' }
  ];

  const activeMenu = user.role === 'admin' ? adminMenu : userMenu;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-72 h-screen bg-[#001B3D] border-r border-white/5 flex flex-col px-6 py-4 sticky top-0 z-50 overflow-hidden text-left">
      
      <div className="mb-10 flex justify-center pt-6">
        <Logo className="w-48 h-auto transition-transform hover:scale-105" />
      </div>
      
      <nav className="flex-1 space-y-1">
        {/* Tinanggal na ang Role Indicator Label */}
        
        {activeMenu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'} />
              <span className={`font-semibold tracking-wide text-sm ${isActive ? 'text-cyan-400' : ''}`}>
                {item.name}
              </span>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute right-4 ${item.badgeColor} text-[10px] font-black h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="bg-[#05192e] border border-white/5 rounded-[2rem] p-4 flex flex-col gap-3 shadow-2xl">
          <Link 
            to="/profile" 
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-all group"
          >
            <div className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-navy-900 flex-shrink-0 group-hover:border-cyan-400 transition-colors ${user.role === 'admin' ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-cyan-400/50'}`}>
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cyan-400 font-black text-lg bg-cyan-400/10">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <div className="overflow-hidden">
              <p className="text-white text-sm font-black truncate uppercase tracking-tight italic">
                {user.name || 'Loading...'}
              </p>
              <p className="text-cyan-400/60 text-[10px] font-bold uppercase tracking-widest">
                {user.role === 'admin' ? 'System Master' : 'View Profile'}
              </p>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all group w-full border border-transparent hover:border-rose-400/20"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase tracking-widest text-[10px]">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;