import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Briefcase, BrainCircuit, Banknote, Activity } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'System Overview', path: '/admin/dashboard', icon: <Activity size={20} /> },
    { name: 'Worker Verification', path: '/admin/verification', icon: <Users size={20} /> },
    { name: 'Services Config', path: '/admin/services', icon: <Briefcase size={20} /> },
    { name: 'Financial Settlements', path: '/admin/financials', icon: <Banknote size={20} /> },
    { name: 'AI Demand Forecast', path: '/admin/forecasting', icon: <BrainCircuit size={20} /> },
    { name: 'Admin Profile', path: '/admin/profile', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => navigate('/admin/dashboard')}>
          <Logo className="w-8 h-8 text-purple-500" textClass="text-lg font-black text-white tracking-tight" />
        </div>
        
        <div className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Admin Portal</div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 border border-blue-500/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full py-2 text-sm text-slate-400 hover:text-white font-bold hover:bg-slate-800 rounded-lg transition-colors">Terminate Session</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-slate-950 text-white p-4 flex justify-between items-center z-10 shadow-md">
          <div className="cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <Logo className="w-6 h-6 text-purple-500" textClass="text-lg font-black text-white tracking-tight" />
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-slate-400 uppercase hover:text-white">Logout</button>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          <Outlet />
        </div>
      </main>
      
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-950 border-t border-slate-800 flex justify-around p-2 z-30 pb-safe">
        {navItems.slice(0,4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-blue-500 bg-slate-900' : 'text-slate-500 hover:text-slate-400'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1 tracking-tighter truncate max-w-[60px] text-center">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
