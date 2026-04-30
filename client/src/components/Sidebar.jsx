import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, LogOut, Archive, PiggyBank } from 'lucide-react';
import api from '../services/api'; // Tiyaking tama ang path na ito
import Logo from './Logo'; // Magkatabi sila sa components folder

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [archiveCount, setArchiveCount] = useState(0);

  // Real-time update para sa badge ng Archive Bin
  const fetchArchiveCount = async () => {
    try {
      const res = await api.get('/expenses/archived-count');
      if (res.data && typeof res.data.count !== 'undefined') {
        setArchiveCount(res.data.count);
      }
    } catch (err) {
      // Silent fail para hindi makaabala sa user experience
      console.warn("Badge sync failed...");
    }
  };

  useEffect(() => {
    fetchArchiveCount();
    const interval = setInterval(fetchArchiveCount, 5000); // Nag-uupdate bawat 5 segundo
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Archive Bin', path: '/archive', icon: Archive },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-72 h-screen bg-[#001B3D] border-r border-white/5 flex flex-col px-6 py-4 sticky top-0 z-50">
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
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-neon' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-semibold tracking-wide text-sm">{item.name}</span>

              {/* Archive Count Badge */}
              {item.name === 'Archive Bin' && archiveCount > 0 && (
                <div className="absolute right-4 bg-rose-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full animate-pulse">
                  {archiveCount}
                </div>
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