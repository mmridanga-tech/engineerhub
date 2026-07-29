import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Send, Sparkles, Bot, User, Zap, Terminal } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your EngineerHub AI Assistant powered by Gemini models. Ask me about cable ampacity, voltage drop calculations, transformer sizing, earth pit design, or building standards (NEC/IEEE/IEC).',
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate intelligent AI engineering response
    setTimeout(() => {
      let aiReply = "Based on standard engineering guidelines (NEC/IEEE):\n\nFor most electrical installations, wire sizing is governed by temperature ratings and voltage drop limits (<3% branch circuits). You can use our Cable Size Calculator or Voltage Drop Calculator on the homepage to compute exact mm²/AWG dimensions.";

      if (userText.toLowerCase().includes('cable') || userText.toLowerCase().includes('wire') || userText.toLowerCase().includes('amp')) {
        aiReply = "Cable Ampacity & Size Calculation Rule:\n\n• Required Current (I) = Power (kW) / (√3 × Voltage × Power Factor)\n• For a 50A 3-phase load at 415V (0.85 PF), standard copper XLPE cables require a minimum 10mm² conductor size to stay below 3% voltage drop over 50 meters.\n• Check out the 'Cable Size Calculator' card on the homepage for detailed phase configurations.";
      } else if (userText.toLowerCase().includes('voltage') || userText.toLowerCase().includes('drop')) {
        aiReply = "Voltage Drop Formula:\n\nVD = (2 × L × I × R) / 1000 for 1-Phase AC/DC\nVD = (√3 × L × I × R) / 1000 for 3-Phase AC\n\nNEC Article 210 recommends keeping voltage drop under 3% for branch circuits and under 5% total for feeder + branch circuits.";
      } else if (userText.toLowerCase().includes('earth') || userText.toLowerCase().includes('pit') || userText.toLowerCase().includes('ground')) {
        aiReply = "Earth Pit Design (IS 3043 / IEEE 80):\n\nResistance R = (ρ / 2πL) × ln(4L / d)\nWhere ρ = soil resistivity (Ohm-m), L = electrode length, d = diameter.\nTarget earth pit resistance should be under 1.0 Ohm for sub-stations and critical equipment.";
      }

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl glass-panel rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>EngineerHub AI Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  Online
                </span>
              </h3>
              <p className="text-xs text-slate-400">Gemini Engineering Knowledge Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-card text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono py-2">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>AI Assistant is deriving engineering formula...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about cable sizes, voltage drops, motor load, or standards..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-colors shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
