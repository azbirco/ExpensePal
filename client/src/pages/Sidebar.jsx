import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, LogOut, Archive, PiggyBank } from 'lucide-react';
import api from './api'; 
import Logo from './Logo'; 

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [archiveCount, setArchiveCount] = useState(0);

  const fetchArchiveCount = async () => {
    try {
      const res = await api.get('/expenses/archived-count');
      if (res.data && typeof res.data.count !== 'undefined') {
        setArchiveCount(res.data.count);
      }
    } catch (err) {
      console.warn("Badge count sync...");
    }
  };

  useEffect(() => {
    fetchArchiveCount();
    const interval = setInterval(fetchArchiveCount, 5000); 
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20}/> },
    { name: 'Savings', path: '/savings', icon: <PiggyBank size={20}/> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20}/> },
    { name: 'Archive Bin', path: '/archive', icon: <Archive size={20}/> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-72 h-screen bg-[#001B3D] border-r border-white/5 flex flex-col px-6 py-4 sticky top-0 shadow-2xl">
      <div className="mb-4 flex justify-start items-center">
        <Logo className="w-[235px] h-auto transition-all duration-300 hover:brightness-110 -ml-4" />
      </div>
      
      <nav className="flex-1 space-y-1">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          const isArchive = item.name === 'Archive Bin';

          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </div>
              <span className="font-semibold tracking-wide text-sm">{item.name}</span>

              {isArchive && archiveCount > 0 && (
                <div className="absolute right-4 bg-rose-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-rose-500/40 animate-pulse">
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
          className="w-full flex items-center gap-4 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-wider text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;