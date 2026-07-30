import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Menu, X, FileText, Send, Sparkles, Cpu, Zap, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BRAND_INFO } from '../data/portfolioData';

interface NavbarProps {
  onOpenSpecs: () => void;
  onOpenAIAssistant: () => void;
  onOpenCableCalculator?: () => void;
  onOpenVoltageDropCalculator?: () => void;
  onOpenLoadCalculator?: () => void;
  onOpenMotorCalculator?: () => void;
  onOpenTransformerCalculator?: () => void;
  currentView?: string;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSpecs,
  onOpenAIAssistant,
  onOpenCableCalculator,
  onOpenVoltageDropCalculator,
  onOpenLoadCalculator,
  onOpenMotorCalculator,
  onOpenTransformerCalculator,
  currentView = 'home',
  onGoHome,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['hero', 'categories', 'tools', 'why-us', 'faq', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Categories', href: '#categories', id: 'categories' },
    { name: 'Popular Tools', href: '#tools', id: 'tools' },
    { name: 'Why Us', href: '#why-us', id: 'why-us' },
    { name: 'FAQ', href: '#faq', id: 'faq' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/85 backdrop-blur-xl border-b border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80 shadow-xl shadow-black/10'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Brand */}
        <button
          onClick={() => {
            if (onGoHome) onGoHome();
            else window.location.hash = '#hero';
          }}
          className="group flex items-center gap-3 text-slate-100 dark:text-slate-100 light:text-slate-900 font-heading font-bold text-xl tracking-tight text-left cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5 font-extrabold tracking-tight">
              {BRAND_INFO.name}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold hidden sm:inline-block">
                v2.5
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal hidden md:inline-block">
              {BRAND_INFO.tagline}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => {
                if (currentView !== 'home' && onGoHome) {
                  e.preventDefault();
                  onGoHome();
                  setTimeout(() => {
                    const el = document.getElementById(link.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeSection === link.id && currentView === 'home'
                  ? 'text-white dark:text-white light:text-slate-900 font-semibold'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-900'
              }`}
            >
              {activeSection === link.id && currentView === 'home' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-indigo-600/20 dark:bg-indigo-600/30 light:bg-indigo-50 border border-indigo-500/30 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </a>
          ))}
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cable Calculator Page Direct Button */}
          {onOpenCableCalculator && (
            <button
              onClick={onOpenCableCalculator}
              className={`hidden xl:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                currentView === 'cable-calculator'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 border border-indigo-400'
                  : 'glass-card text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Cable Size</span>
            </button>
          )}

          {/* Load Calculator Direct Button */}
          {onOpenLoadCalculator && (
            <button
              onClick={onOpenLoadCalculator}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                currentView === 'load-calculator'
                  ? 'bg-amber-600 text-white shadow-amber-600/30 border border-amber-400'
                  : 'glass-card text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Load Calc</span>
            </button>
          )}

          {/* Motor Current Calculator Direct Button */}
          {onOpenMotorCalculator && (
            <button
              onClick={onOpenMotorCalculator}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                currentView === 'motor-calculator'
                  ? 'bg-cyan-600 text-white shadow-cyan-600/30 border border-cyan-400'
                  : 'glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Motor Calc</span>
            </button>
          )}

          {/* Transformer Calculator Direct Button */}
          {onOpenTransformerCalculator && (
            <button
              onClick={onOpenTransformerCalculator}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                currentView === 'transformer-calculator'
                  ? 'bg-amber-600 text-white shadow-amber-600/30 border border-amber-400'
                  : 'glass-card text-amber-300 border border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Transformer</span>
            </button>
          )}

          {/* Voltage Drop Calculator Direct Button */}
          {onOpenVoltageDropCalculator && (
            <button
              onClick={onOpenVoltageDropCalculator}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                currentView === 'voltage-drop'
                  ? 'bg-cyan-600 text-white shadow-cyan-600/30 border border-cyan-400'
                  : 'glass-card text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Voltage Drop</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-card text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </motion.div>
          </button>

          {/* AI Assistant CTA */}
          <button
            onClick={onOpenAIAssistant}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl glass-card text-indigo-300 dark:text-indigo-300 light:text-indigo-700 border border-indigo-500/30 hover:border-indigo-500/60 transition-all hover:bg-indigo-500/10 shadow-sm"
          >
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          {/* Specs / Manual Button */}
          <button
            onClick={onOpenSpecs}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl glass-card text-slate-200 dark:text-slate-200 light:text-slate-800 hover:border-indigo-500/50 transition-all hover:bg-indigo-500/10"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Docs & Specs</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl glass-card text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-slate-800 dark:border-slate-800 light:border-slate-200 px-4 py-6 mt-3"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between ${
                    activeSection === link.id
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{link.name}</span>
                  <Sparkles className="w-4 h-4 opacity-50" />
                </a>
              ))}

              <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAIAssistant();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Launch AI Assistant</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSpecs();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-xl glass-card text-slate-200 dark:text-slate-200 light:text-slate-800"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Platform Specifications</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

