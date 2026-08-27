import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md"
      >
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hammer size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Under Construction</h2>
        <p className="text-slate-500 font-medium mb-8">This page or feature is currently being built by our engineering team. Check back soon!</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-slate-800 transition"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  );
}
