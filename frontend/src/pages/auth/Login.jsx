import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import api from '../../services/api';
import Logo from '../../components/ui/Logo';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.role);
      
      const role = res.data.role;
      if (role === 'Customer') {
        navigate('/customer/dashboard');
      } else if (role === 'Worker') {
        navigate('/worker/dashboard');
      } else if (role === 'SuperAdmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gemini-bg flex items-center justify-center relative overflow-hidden p-4 font-sans">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gemini-bg to-gemini-bg pointer-events-none"></div>
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gemini-card/80 backdrop-blur-xl border border-gemini-border rounded-[2rem] shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500" />
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gemini-muted font-medium">Sign in to your CoopSeva account</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-bold p-3 rounded-xl mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-bold text-gemini-muted uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:text-blue-300">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gemini-muted" size={18} />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-gemini-bg border border-gemini-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-purple-500/25 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gemini-muted mt-8 font-medium text-xs">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
