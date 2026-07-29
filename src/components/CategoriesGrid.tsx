import React from 'react';
import { motion } from 'motion/react';
import { Zap, Building2, Cog, HardHat, FileText, Cpu, Sun, ArrowUpRight, Grid } from 'lucide-react';
import { CATEGORIES } from '../data/portfolioData';
import { CategoryItem } from '../types';

interface CategoriesGridProps {
  selectedCategory?: string;
  onSelectCategory: (categoryName: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap': return Zap;
    case 'Building2': return Building2;
    case 'Cog': return Cog;
    case 'HardHat': return HardHat;
    case 'FileText': return FileText;
    case 'Cpu': return Cpu;
    case 'Sun': return Sun;
    default: return Grid;
  }
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ selectedCategory = 'All', onSelectCategory }) => {
  return (
    <section id="categories" className="py-20 relative overflow-hidden border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80">
      {/* Background Accent glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Grid className="w-3.5 h-3.5" />
            <span>Engineering Domains</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mb-4">
            Explore Categories
          </h2>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-base sm:text-lg">
            Select a specialized discipline to filter engineering calculators, PDF tools, and AI assistants.
          </p>
        </div>

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat: CategoryItem, idx: number) => {
            const IconComponent = getCategoryIcon(cat.iconName);
            const isSelected = (selectedCategory || '').toLowerCase() === (cat.name || '').toLowerCase();

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
                className={`group cursor-pointer rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
                  isSelected
                    ? 'glass-panel border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 bg-indigo-950/40'
                    : 'glass-card border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 hover:border-indigo-500/50 hover:bg-slate-900/60'
                }`}
              >
                {/* Glow Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3.5 rounded-2xl border bg-gradient-to-br ${cat.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono font-medium text-slate-300">
                    <span>{cat.toolCount} tools</span>
                  </div>
                </div>

                <h3 className="text-xl font-heading font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2 flex items-center justify-between group-hover:text-indigo-300 transition-colors">
                  <span>{cat.name}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-4">
                  {cat.description}
                </p>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-indigo-400">{cat.popularTag}</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    {isSelected ? 'Filter Active' : 'Filter Tools →'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
