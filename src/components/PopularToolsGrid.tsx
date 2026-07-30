import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Activity, Gauge, Layers, Shield, Cog, RefreshCw, Calculator, FileText, Image, ExternalLink, X, Search, Sparkles, CheckCircle, Info } from 'lucide-react';
import { POPULAR_TOOLS } from '../data/portfolioData';
import { ToolItem } from '../types';

interface PopularToolsGridProps {
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenAIAssistant: () => void;
  onOpenCableCalculator?: () => void;
  onOpenVoltageDropCalculator?: () => void;
  onOpenLoadCalculator?: () => void;
  onOpenMotorCalculator?: () => void;
  onOpenTransformerCalculator?: () => void;
}

const getToolIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap': return Zap;
    case 'Activity': return Activity;
    case 'Gauge': return Gauge;
    case 'Layers': return Layers;
    case 'Shield': return Shield;
    case 'Cog': return Cog;
    case 'RefreshCw': return RefreshCw;
    case 'Calculator': return Calculator;
    case 'FileText': return FileText;
    case 'Image': return Image;
    default: return Sparkles;
  }
};

export const PopularToolsGrid: React.FC<PopularToolsGridProps> = ({
  searchQuery = '',
  selectedCategory = 'All',
  onSelectCategory,
  onOpenAIAssistant,
  onOpenCableCalculator,
  onOpenVoltageDropCalculator,
  onOpenLoadCalculator,
  onOpenMotorCalculator,
  onOpenTransformerCalculator,
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  const categories = ['All', 'Electrical', 'Civil', 'Mechanical', 'PDF Tools', 'General'];

  const queryStr = (searchQuery || '').trim().toLowerCase();
  const catStr = (selectedCategory || 'All').trim().toLowerCase();

  // Filter tools by search query & category
  const filteredTools = POPULAR_TOOLS.filter((tool) => {
    const matchesSearch =
      queryStr === '' ||
      (tool.title && tool.title.toLowerCase().includes(queryStr)) ||
      (tool.description && tool.description.toLowerCase().includes(queryStr)) ||
      (tool.category && tool.category.toLowerCase().includes(queryStr)) ||
      (tool.tags && tool.tags.some((t) => t && t.toLowerCase().includes(queryStr)));

    const matchesCategory =
      catStr === 'all' ||
      (tool.category && tool.category.toLowerCase() === catStr) ||
      (catStr === 'mechanical' && (tool.category === 'Mechanical' || tool.category === 'Construction')) ||
      (catStr === 'civil' && (tool.category === 'Civil' || tool.category === 'Construction'));

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="tools" className="py-20 relative overflow-hidden bg-slate-950/40">
      {/* Radial Background Light */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Popular Engineering Utilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mb-4">
            Popular Tools
          </h2>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-base sm:text-lg">
            High-precision, code-compliant calculators and document utilities used daily by engineers worldwide.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                (selectedCategory || '').toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                  : 'glass-card text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: ToolItem, idx: number) => {
            const IconComponent = getToolIcon(tool.iconName);

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group glass-card rounded-3xl p-6 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-lg"
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-indigo-300 border border-slate-800">
                      {tool.category}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-heading font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-1 group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h3>
                  {tool.subtitle && (
                    <p className="text-xs text-indigo-400/90 font-medium mb-3">
                      {tool.subtitle}
                    </p>
                  )}

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-5">
                    {tool.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <button
                  onClick={() => {
                    const titleLower = (tool.title || '').toLowerCase();
                    if ((tool.id === 'cable-size' || titleLower.includes('cable size')) && onOpenCableCalculator) {
                      onOpenCableCalculator();
                    } else if ((tool.id === 'voltage-drop' || titleLower.includes('voltage drop')) && onOpenVoltageDropCalculator) {
                      onOpenVoltageDropCalculator();
                    } else if ((tool.id === 'load-calculator' || titleLower.includes('load calculator')) && onOpenLoadCalculator) {
                      onOpenLoadCalculator();
                    } else if ((tool.id === 'motor-current-calc' || titleLower.includes('motor current') || titleLower.includes('motor calculator')) && onOpenMotorCalculator) {
                      onOpenMotorCalculator();
                    } else if ((tool.id === 'transformer-calc' || titleLower.includes('transformer')) && onOpenTransformerCalculator) {
                      onOpenTransformerCalculator();
                    } else {
                      setSelectedTool(tool);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl glass-panel text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-indigo-600/20 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-semibold group-hover:shadow-md"
                >
                  <span>
                    {tool.id === 'cable-size' || tool.title.toLowerCase().includes('cable size') || tool.id === 'voltage-drop' || tool.title.toLowerCase().includes('voltage drop') || tool.id === 'load-calculator' || tool.title.toLowerCase().includes('load calculator') || tool.id === 'motor-current-calc' || tool.title.toLowerCase().includes('motor current') || tool.id === 'transformer-calc' || tool.title.toLowerCase().includes('transformer')
                      ? 'Launch Dedicated Calculator'
                      : 'Open Tool'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl border border-slate-800 max-w-xl mx-auto my-8">
            <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">No tools matched your filter</h3>
            <p className="text-xs text-slate-400 mb-4">Try clearing your search or category filter.</p>
            <button
              onClick={() => {
                onSelectCategory('All');
              }}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Tool Modal Preview */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedTool(null)}
                className="absolute top-5 right-5 p-2 rounded-xl glass-card text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                    {selectedTool.category}
                  </span>
                  <h3 className="text-2xl font-bold font-heading text-slate-100 mt-1">
                    {selectedTool.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {selectedTool.fullDetails || selectedTool.description}
              </p>

              {/* Specs Table */}
              {selectedTool.specs && (
                <div className="p-4 rounded-2xl glass-card border border-slate-800 mb-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Engine & Standard Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedTool.specs.map((spec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-[11px] text-slate-400">{spec.label}</div>
                        <div className="text-xs font-bold text-indigo-300 mt-0.5">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white block mb-0.5">Homepage Tool Preview Active</span>
                  This tool specifications card represents the homepage interface. Full multi-input interactive calculation sliders and PDF rendering canvas controls will unlock in v2.5.
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    onOpenAIAssistant();
                  }}
                  className="px-5 py-2.5 rounded-xl glass-card text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 text-xs font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Ask AI Assistant About This Tool</span>
                </button>

                <button
                  onClick={() => setSelectedTool(null)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Close Preview
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
