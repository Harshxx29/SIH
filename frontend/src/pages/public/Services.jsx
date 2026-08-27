import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Zap, Droplet, Paintbrush, Hammer, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const [search, setSearch] = useState("");

  const categories = [
    { icon: <Droplet/>, name: "Plumbing", desc: "Pipe repairs, installations, blockages", color: "from-blue-400 to-cyan-500" },
    { icon: <Zap/>, name: "Electrical", desc: "Wiring, appliance repair, power logic", color: "from-amber-400 to-orange-500" },
    { icon: <Hammer/>, name: "Carpentry", desc: "Furniture, doors, structural wood", color: "from-emerald-400 to-green-500" },
    { icon: <Paintbrush/>, name: "Painting", desc: "Interior, exterior, waterproofing", color: "from-purple-400 to-pink-500" },
    { icon: <Wrench/>, name: "Masonry", desc: "Concrete, bricks, tiling works", color: "from-slate-400 to-slate-500" },
  ];

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text py-20 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Explore Services</h1>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gemini-card border border-gemini-border rounded-full flex items-center px-6 py-4">
              <Search className="text-gemini-muted mr-4" />
              <input 
                type="text" 
                placeholder="What do you need help with?" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-gemini-card p-6 rounded-3xl border border-gemini-border hover:shadow-2xl hover:shadow-purple-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-gemini-muted font-medium mb-6">{cat.desc}</p>
              </div>
              <Link to="/customer/live-nearby" className="text-sm font-bold text-blue-400 flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                Book a Worker <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-gemini-muted">
              No services found matching "{search}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
