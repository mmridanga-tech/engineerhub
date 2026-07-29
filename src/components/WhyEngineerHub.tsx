import React from 'react';
import { motion } from 'motion/react';
import { Zap, Unlock, Award, CheckCircle2, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { WHY_ENGINEERHUB } from '../data/portfolioData';
import { WhyPillar } from '../types';

const getPillarIcon = (title: string) => {
  switch (title) {
    case 'Fast': return Zap;
    case 'Free': return Unlock;
    case 'Professional': return Award;
    case 'Accurate': return CheckCircle2;
    case 'Mobile Friendly': return Smartphone;
    default: return ShieldCheck;
  }
};

export const WhyEngineerHub: React.FC = () => {
  return (
    <section id="why-us" className="py-20 relative overflow-hidden border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mb-4">
            Why EngineerHub
          </h2>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-base sm:text-lg">
            Engineered with strict quality control to deliver instant, code-compliant answers in the office and out on site.
          </p>
        </div>

        {/* 5 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {WHY_ENGINEERHUB.map((pillar: WhyPillar, idx: number) => {
            const IconComponent = getPillarIcon(pillar.title);

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group glass-card rounded-3xl p-6 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {pillar.badgeText}
                    </span>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2 group-hover:text-indigo-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-4">
                    {pillar.shortDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{pillar.metrics}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Banner Bar */}
        <div className="mt-16 glass-panel rounded-3xl p-8 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">Zero Code Sign-Up</h4>
              <p className="text-xs text-slate-400">Instant access to all tools without account requirements.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">Client-Side Privacy</h4>
              <p className="text-xs text-slate-400">PDFs and parameters stay safe inside your browser memory.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">IEEE/NEC Verified</h4>
              <p className="text-xs text-slate-400">Calculations follow globally accepted engineering codes.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
