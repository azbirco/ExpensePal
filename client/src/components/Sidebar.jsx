import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  LogOut, 
  Archive, 
  PiggyBank, 
  Users 
} from 'lucide-react';
import api from '../services/api';
import Logo from './Logo';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // State for all counts including the new group events badge
  const [counts, setCounts] = useState({ active: 0, archived: 0, savings: 0, events: 0 });

  const fetchSidebarCounts = async () => {
    try {
      // 1. Get Expenses counts (Active and Archived)
      const expenseRes = await api.get('/expenses/sidebar-counts');
      
      // 2. Get Active Savings
      const activeSavingsRes = await api.get('/savings');

      // 3. Get Archived Savings
      const archivedSavingsRes = await api.get('/savings/archived-list');

      // 4. Get Active Group Events (The logic we just added)
      const eventsRes = await api.get('/events');

      if (expenseRes.data) {
        setCounts({
          // Expenses count
          active: expenseRes.data.active || 0,
          
          // Combined Archived count (Expenses + Savings)
          archived: (expenseRes.data.archived || 0) + (archivedSavingsRes.data?.length || 0),
          
          // Savings count
          savings: Array.isArray(activeSavingsRes.data) ? activeSavingsRes.data.length : 0,

          // Group Events count
          events: Array.isArray(eventsRes.data) ? eventsRes.data.length : 0
        });
      }
    } catch (err) {
      console.warn("Sidebar counts sync failed...");
    }
  };

  useEffect(() => {
    fetchSidebarCounts();
    
    // Listen for manual updates
    window.addEventListener('badgeUpdate', fetchSidebarCounts);
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSidebarCounts, 5000);

    return () => {
      window.removeEventListener('badgeUpdate', fetchSidebarCounts);
      clearInterval(interval);
    };
  }, []);

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Expenses', 
      path: '/expenses', 
      icon: Receipt, 
      badge: counts.active, 
      badgeColor: 'bg-cyan-400 text-[#001B3D]' 
    },
    { 
      name: 'Savings', 
      path: '/savings', 
      icon: PiggyBank, 
      badge: counts.savings, 
      badgeColor: 'bg-emerald-400 text-[#001B3D]' 
    },
    { 
      name: 'Group Events', 
      path: '/events', 
      icon: Users, 
      badge: counts.events, 
      badgeColor: 'bg-indigo-400 text-[#001B3D]' 
    },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { 
      name: 'Archive Bin', 
      path: '/archive', 
      icon: Archive, 
      badge: counts.archived, 
      badgeColor: 'bg-rose-400 text-[#001B3D]' 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-72 h-screen bg-[#001B3D] border-r border-white/5 flex flex-col px-6 py-4 sticky top-0 z-50 text-left">
      <div className="mb-8 flex justify-center py-4">
        <Logo className="w-48 h-auto transition-transform hover:scale-105" />
      </div>
      
      <nav className="flex-1 space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive 
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-semibold tracking-wide text-sm">{item.name}</span>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute right-4 ${item.badgeColor} text-[12px] font-black h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full shadow-lg border border-black/10 animate-in zoom-in duration-300`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-wider text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;