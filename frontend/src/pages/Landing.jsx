import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Users, Wrench, HardHat, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    { icon: <ShieldCheck className="text-coop-600"/>, title: t('feat.1.title'), desc: t('feat.1.desc') },
    { icon: <HeartHandshake className="text-brand-600"/>, title: t('feat.2.title'), desc: t('feat.2.desc') },
    { icon: <Wrench className="text-accent-500"/>, title: t('feat.3.title'), desc: t('feat.3.desc') },
  ];

  return (
    <div className="font-sans bg-gemini-bg text-gemini-text selection:bg-purple-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Gemini glowing orb effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gemini-card border border-gemini-border text-xs font-bold text-gemini-muted uppercase tracking-widest mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              {t('hero.badge')}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white"
            >
              {t('hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {t('hero.title2')}
              </span> <br />
              {t('hero.title3')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gemini-muted font-medium mb-10 max-w-2xl leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link to="/services" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-105">
                {t('hero.cta.book')} <ArrowRight size={20}/>
              </Link>
              <Link to="/worker" className="bg-gemini-card text-white font-bold py-4 px-8 rounded-full border border-gemini-border hover:bg-gemini-hover transition-all text-center">
                {t('hero.cta.worker')}
              </Link>
            </motion.div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[3rem] transform rotate-3 scale-105 blur-sm"></div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gemini-card p-8 rounded-[2rem] border border-gemini-border shadow-2xl relative z-10 w-96 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-8 border-b border-gemini-border pb-4">
                 <div className="font-black text-white text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center rounded-lg">C</div> CoopSeva
                 </div>
                 <div className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full flex items-center gap-1 border border-blue-500/20"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {t('hero.gps')}</div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gemini-bg rounded-xl border border-gemini-border flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gemini-hover rounded-full flex-shrink-0 border border-gemini-border"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gemini-hover rounded mb-2"></div>
                    <div className="h-3 w-32 bg-gemini-hover rounded"></div>
                  </div>
                  <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase">{t('hero.verified')}</div>
                </div>
                <div className="p-4 bg-gemini-bg rounded-xl border border-gemini-border flex gap-4 items-center opacity-70">
                  <div className="w-12 h-12 bg-gemini-hover rounded-full flex-shrink-0 border border-gemini-border"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gemini-hover rounded mb-2"></div>
                    <div className="h-3 w-32 bg-gemini-hover rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
           <div>
             <div className="text-4xl font-black text-white mb-2">45k+</div>
             <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('stats.workers')}</div>
           </div>
           <div>
             <div className="text-4xl font-black text-white mb-2">120+</div>
             <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('stats.coops')}</div>
           </div>
           <div>
             <div className="text-4xl font-black text-coop-500 mb-2">₹12M</div>
             <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('stats.welfare')}</div>
           </div>
           <div>
             <div className="text-4xl font-black text-brand-500 mb-2">4.8</div>
             <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('stats.rating')}</div>
           </div>
        </div>
      </section>

      {/* Why CoopSeva */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{t('feat.title')}</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">{t('feat.subtitle')}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Callout */}
      <section className="bg-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl font-black mb-2">{t('emergency.title')}</h2>
            <p className="text-accent-50 text-lg font-medium">{t('emergency.subtitle')}</p>
          </div>
          <Link to="/customer/emergency" className="px-8 py-4 bg-white text-accent-600 rounded-xl font-black text-lg transition-all shadow-xl hover:scale-105 uppercase tracking-wider">
            {t('emergency.btn')}
          </Link>
        </div>
      </section>

    </div>
  );
}
