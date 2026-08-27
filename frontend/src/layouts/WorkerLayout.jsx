import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Bell, User, Clock, Wallet, Shield } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function WorkerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/worker/dashboard', icon: <Home size={20} /> },
    { name: 'Jobs & Requests', path: '/worker/jobs', icon: <Briefcase size={20} /> },
    { name: 'Earnings & Ledgers', path: '/worker/earnings', icon: <Wallet size={20} /> },
    { name: 'Welfare & Insurance', path: '/worker/welfare', icon: <Shield size={20} /> },
    { name: 'My Profile', path: '/worker/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl z-20">
        <div className="p-6 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => navigate('/worker/dashboard')}>
          <Logo className="w-8 h-8 text-blue-500" textClass="text-xl font-black text-white tracking-tight" />
        </div>
        
        <div className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Worker Portal</div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium">Log out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-10 shadow-md">
          <div className="cursor-pointer" onClick={() => navigate('/worker/dashboard')}>
            <Logo className="w-6 h-6 text-blue-500" textClass="text-lg font-black text-white tracking-tight" />
          </div>
          <button onClick={handleLogout} className="text-sm text-slate-300 hover:text-white">Logout</button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-20 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-slate-500'}`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1">{item.name.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
