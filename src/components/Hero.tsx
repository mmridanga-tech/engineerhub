import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, Sparkles, Search, CheckCircle2, ShieldCheck, Zap, Activity, Layers, Wrench } from 'lucide-react';
import { BRAND_INFO } from '../data/portfolioData';

interface HeroProps {
  onOpenAIAssistant: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenAIAssistant,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-grid-pattern">
      {/* Background Radial Glow Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/15 dark:bg-indigo-600/15 light:bg-indigo-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-violet-600/15 dark:bg-violet-600/15 light:bg-violet-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Status Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 text-xs font-semibold mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{BRAND_INFO.status}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-semibold">{BRAND_INFO.uptime} Uptime</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900 leading-[1.08] mb-6"
          >
            {BRAND_INFO.name}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 mb-8"
          >
            {BRAND_INFO.heroSubtitle}
          </motion.p>

          {/* Short Bio / Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {BRAND_INFO.shortBio}
          </motion.p>

          {/* Primary CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <a
              href="#tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <button
              onClick={onOpenAIAssistant}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>AI Assistant</span>
            </button>
          </motion.div>

          {/* Search Bar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70 pointer-events-none" />
              <div className="relative flex items-center glass-panel rounded-2xl border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 shadow-2xl overflow-hidden p-2">
                <Search className="w-6 h-6 text-indigo-400 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search engineering tools..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent py-3 px-2 text-base text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-md"
                >
                  Search
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-3">
              <span>Popular: Cable Size</span>
              <span>•</span>
              <span>Voltage Drop</span>
              <span>•</span>
              <span>Unit Converter</span>
              <span>•</span>
              <span>PDF Merge</span>
            </p>
          </motion.div>

          {/* Metric Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80"
          >
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl font-bold text-white dark:text-white light:text-slate-900 font-heading">10+</div>
              <div className="text-xs text-slate-400 mt-0.5">Popular Utilities</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl font-bold text-indigo-400 font-heading">8</div>
              <div className="text-xs text-slate-400 mt-0.5">Engineering Domains</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl font-bold text-emerald-400 font-heading">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Free & Browser Native</div>
            </div>
            <div className="p-4 rounded-2xl glass-card text-center">
              <div className="text-2xl font-bold text-violet-400 font-heading">IEEE/NEC</div>
              <div className="text-xs text-slate-400 mt-0.5">Code Compliant</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

