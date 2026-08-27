import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './ui/Logo';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { language, setLanguage } = useLanguage();

  return (
    <footer className="bg-gemini-bg text-gemini-muted py-12 border-t border-gemini-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <Logo showText={true} textClass="text-xl font-black text-white tracking-tight" className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500" />
          </div>
          <p className="text-sm font-medium mb-4">Strengthening Labour Cooperative Societies through transparent technology.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/services" className="hover:text-white transition-colors">Find Services</Link></li>
            <li><Link to="/customer/emergency" className="hover:text-white transition-colors">Emergency Booking</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Fees</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Network</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/worker" className="hover:text-white transition-colors">For Workers</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">For Cooperatives</Link></li>
            <li><Link to="/welfare" className="hover:text-white transition-colors">Worker Welfare Fund</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm font-medium flex justify-between items-center">
        <p>&copy; {new Date().getFullYear()} CoopSeva Federation. All rights reserved.</p>
        <div className="flex gap-4">
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
        </div>
      </div>
    </footer>
  );
}
