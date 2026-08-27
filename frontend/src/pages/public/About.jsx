import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, Zap, Globe } from 'lucide-react';

export default function About() {
  const values = [
    { icon: <ShieldCheck size={32}/>, title: "Verified Trust", desc: "Every cooperative worker undergoes strict KYC and skill verification." },
    { icon: <HeartHandshake size={32}/>, title: "Fair Wages", desc: "We eliminate exploitative middlemen, ensuring 85% of revenue goes directly to workers." },
    { icon: <Zap size={32}/>, title: "Instant Dispatch", desc: "Our AI-driven emergency allocation connects you to help in under 3 minutes." },
    { icon: <Globe size={32}/>, title: "Network Scale", desc: "Empowering thousands of local Labour Cooperative Societies nationwide." }
  ];

  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gemini-card border border-gemini-border text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Our Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Service</span> through Unity.
          </h1>
          <p className="text-xl text-gemini-muted leading-relaxed">
            CoopSeva is not just a marketplace. It is a technological bridge empowering Labour Cooperatives, guaranteeing fair wages for workers and verified trust for consumers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gemini-card p-8 rounded-3xl border border-gemini-border hover:border-purple-500/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-gemini-hover rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
              <p className="text-gemini-muted">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
