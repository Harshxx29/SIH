import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import api from '../../services/api';
import Logo from '../../components/ui/Logo';

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'Customer' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[90vh] bg-gemini-bg flex items-center justify-center relative overflow-hidden p-4 py-12">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gemini-bg to-gemini-bg pointer-events-none"></div>
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gemini-card/80 backdrop-blur-xl border border-gemini-border rounded-[2rem] shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500" />
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Join CoopSeva</h2>
          <p className="text-gemini-muted font-medium">Create your account to get started</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-bold p-3 rounded-xl mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'Customer'})}
                className={`py-2 rounded-xl text-sm font-bold border transition-all ${formData.role === 'Customer' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-gemini-bg border-gemini-border text-gemini-muted hover:text-white'}`}
              >
                Customer
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'Worker'})}
                className={`py-2 rounded-xl text-sm font-bold border transition-all ${formData.role === 'Worker' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gemini-bg border-gemini-border text-gemini-muted hover:text-white'}`}
              >
                Worker
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="John Doe" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="name@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="••••••••" />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-purple-500/25 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus size={18} /> Create Account
          </button>
        </form>

        <p className="text-center text-gemini-muted mt-8 font-medium">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold ml-1">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
