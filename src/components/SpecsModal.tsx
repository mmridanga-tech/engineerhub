import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle2, ShieldCheck, Zap, Layers, Server, Code } from 'lucide-react';
import { BRAND_INFO } from '../data/portfolioData';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-card text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              v2.5 Release Specs
            </span>
            <h3 className="text-2xl font-bold font-heading text-slate-100 mt-0.5">
              EngineerHub Specifications
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          EngineerHub is designed as a client-first, zero-latency engineering platform built to assist licensed engineers, contractors, students, and architects.
        </p>

        {/* Specs Highlights */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Governing Engineering Codes</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>NEC Article 310 (Conductor Ampacities & Derating Factors)</li>
              <li>IEC 60364 (Electrical Installations of Buildings)</li>
              <li>IEEE Std 80 & IS 3043 (Substation Grounding & Earth Pit Sizing)</li>
              <li>ANSI/IEEE C57 (Transformer Rating Specifications)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>Technical Architecture</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Client-Side WebAssembly & Double-Precision JavaScript Math</li>
              <li>Zero Data Server Uploads for PDF Processing (100% In-Browser Privacy)</li>
              <li>Gemini API Server-Side Key Shielding for AI Assistance</li>
              <li>Responsive Motion Layout Engine with Dark & Light Themes</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
          >
            Close Specifications
          </button>
        </div>

      </motion.div>
    </div>
  );
};
