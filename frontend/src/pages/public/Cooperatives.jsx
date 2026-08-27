import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, ShieldCheck, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Cooperatives() {
  const [stats, setStats] = useState({ workersCount: 0, totalDisbursed: 0 });

  useEffect(() => {
    api.get('/cooperatives/public/stats')
       .then(res => setStats(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text overflow-hidden relative">
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 grid md:grid-cols-2 gap-16 items-center">
        
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gemini-card border border-gemini-border text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">
            <Building size={14}/> For Societies
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
            Digitize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Labour Cooperative.</span>
          </h1>
          <p className="text-xl text-gemini-muted mb-10 leading-relaxed">
            Join the national network. Track your workers in real-time, automate welfare settlements, and scale your society's reach instantly.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
              Register Society
            </Link>
            <Link to="/login" className="bg-gemini-card border border-gemini-border text-white font-bold py-4 px-8 rounded-full hover:bg-gemini-hover transition-colors">
              Admin Login
            </Link>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-4 translate-y-8">
            <div className="bg-gemini-card p-6 rounded-3xl border border-gemini-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4"><Users size={20}/></div>
              <div className="text-3xl font-black text-white mb-1">{stats.workersCount}+</div>
              <div className="text-sm font-bold text-gemini-muted uppercase tracking-wider">Workers Verified</div>
            </div>
            <div className="bg-gemini-card p-6 rounded-3xl border border-gemini-border">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4"><ShieldCheck size={20}/></div>
              <div className="text-3xl font-black text-white mb-1">Automated</div>
              <div className="text-sm font-bold text-gemini-muted uppercase tracking-wider">Welfare & KYC</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gemini-card p-6 rounded-3xl border border-gemini-border">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4"><TrendingUp size={20}/></div>
              <div className="text-3xl font-black text-white mb-1">₹{(stats.totalDisbursed || 0).toLocaleString()}</div>
              <div className="text-sm font-bold text-gemini-muted uppercase tracking-wider">Disbursed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-3xl text-white shadow-xl">
              <h3 className="text-xl font-black mb-2">Zero Platform Fees.</h3>
              <p className="text-sm text-blue-100 font-medium">100% of network fees go back into the cooperative ecosystem.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
