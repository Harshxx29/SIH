import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import Logo from './ui/Logo';

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const getDashboardPath = () => {
    if (userRole === 'Customer') return '/customer/dashboard';
    if (userRole === 'Worker') return '/worker/dashboard';
    if (userRole === 'SuperAdmin') return '/admin/dashboard';
    return '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="bg-gemini-bg/80 backdrop-blur-xl border-b border-gemini-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to={token ? getDashboardPath() : "/"} className="group">
            <Logo className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 group-hover:scale-105 transition-transform" textClass="text-2xl font-black text-white tracking-tight" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/services" className="text-sm font-bold text-gemini-text hover:text-blue-400 transition-colors">{t('nav.services')}</Link>
            <Link to="/cooperatives" className="text-sm font-bold text-gemini-text hover:text-blue-400 transition-colors">{t('nav.cooperatives')}</Link>
            <Link to="/about" className="text-sm font-bold text-gemini-text hover:text-blue-400 transition-colors">{t('nav.about')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gemini-card border border-gemini-border text-gemini-text text-xs font-bold rounded-full px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            <div className="hidden md:flex items-center gap-4">
              {token ? (
                <>
                  <Link 
                    to={getDashboardPath()} 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:opacity-90 transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <User size={16}/> Go to Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-bold text-gemini-muted hover:text-white transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-gemini-muted hover:text-white transition-colors">{t('nav.login')}</Link>
                  <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:opacity-90 transition-all hover:scale-105">
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
