import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Search, Calendar, User, AlertTriangle } from 'lucide-react';
import Logo from '../components/ui/Logo';

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/customer/dashboard', icon: <Home size={20} /> },
    { name: 'Live Nearby', path: '/customer/live-nearby', icon: <Search size={20} />, activeClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
    { name: 'My Bookings', path: '/customer/bookings', icon: <Calendar size={20} /> },
    { name: 'Emergency', path: '/customer/emergency', icon: <AlertTriangle size={20} />, activeClass: 'text-red-500', bgClass: 'bg-red-50' },
    { name: 'My Profile', path: '/customer/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => navigate('/customer/dashboard')}>
          <Logo className="w-8 h-8 text-coop-600" textClass="text-xl font-black text-slate-900 tracking-tight" />
        </div>
        
        <div className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Household Services</div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? item.bgClass ? `${item.bgClass} ${item.activeClass} border border-red-200 shadow-sm` : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full py-3 text-sm text-slate-500 font-bold hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">Log out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10 shadow-sm">
          <div className="cursor-pointer" onClick={() => navigate('/customer/dashboard')}>
            <Logo className="w-6 h-6 text-coop-600" textClass="text-lg font-black text-slate-900 tracking-tight" />
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-slate-900">Logout</button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-20 md:pb-0">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 z-30 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)] rounded-t-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? item.activeClass || 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
