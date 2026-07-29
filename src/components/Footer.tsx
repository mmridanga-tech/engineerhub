import React from 'react';
import { ArrowUp, Zap, Github, Twitter, Disc as Discord, ShieldCheck } from 'lucide-react';
import { BRAND_INFO } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/90 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/60">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/25">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 text-lg tracking-tight">
                {BRAND_INFO.name}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {BRAND_INFO.tagline}
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">
            <a href="#categories" className="hover:text-indigo-400 transition-colors">Categories</a>
            <a href="#tools" className="hover:text-indigo-400 transition-colors">Popular Tools</a>
            <a href="#why-us" className="hover:text-indigo-400 transition-colors">Why EngineerHub</a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>

          {/* Social Icons & Back to Top */}
          <div className="flex items-center gap-3">
            <a
              href={BRAND_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={BRAND_INFO.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={BRAND_INFO.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors"
              aria-label="Discord"
            >
              <Discord className="w-4 h-4" />
            </a>

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-indigo-600/80 text-white hover:bg-indigo-600 shadow-md transition-all ml-2"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {BRAND_INFO.name}. {BRAND_INFO.tagline}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>IEEE / NEC / ISO Engineering Standards Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

