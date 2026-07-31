import EarthPitCalculatorPage from "./components/EarthPitCalculatorPage";
import DashboardWelcome from "./components/DashboardWelcome";
import DashboardCards from "./components/DashboardCards";
import AppRouter from "./routes/AppRouter";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoriesGrid } from './components/CategoriesGrid';
import { PopularToolsGrid } from './components/PopularToolsGrid';
import { WhyEngineerHub } from './components/WhyEngineerHub';
import { FaqSection } from './components/FaqSection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SpecsModal } from './components/SpecsModal';
import { Toast } from './components/Toast';
import { CableSizeCalculatorPage } from './components/CableSizeCalculatorPage';
import { VoltageDropCalculatorPage } from './components/VoltageDropCalculatorPage';
import { LoadCalculatorPage } from './components/LoadCalculatorPage';
import { MotorCurrentCalculatorPage } from './components/MotorCurrentCalculatorPage';
import { TransformerCalculatorPage } from './components/TransformerCalculatorPage';

export function EngineerHubContent() {
  const [currentView, setCurrentView] = useState<'home' | 'cable-calculator' | 'voltage-drop' | 'load-calculator' | 'motor-calculator' | 'transformer-calculator'>('transformer-calculator');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSelectCategoryFromGrid = (catName: string) => {
    setCurrentView('home');
    setSelectedCategory(catName);
    setTimeout(() => {
      const toolsSection = document.getElementById('tools');
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar
        onOpenAIAssistant={() => setIsAIOpen(true)}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenCableCalculator={() => {
          setCurrentView('cable-calculator');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenVoltageDropCalculator={() => {
          setCurrentView('voltage-drop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLoadCalculator={() => {
          setCurrentView('load-calculator');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMotorCalculator={() => {
          setCurrentView('motor-calculator');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTransformerCalculator={() => {
          setCurrentView('transformer-calculator');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
        onGoHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections with Smooth Fade */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'cable-calculator' ? (
            <motion.div
              key="cable-calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CableSizeCalculatorPage
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenVoltageDropCalculator={() => {
                  setCurrentView('voltage-drop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenLoadCalculator={() => {
                  setCurrentView('load-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMotorCalculator={() => {
                  setCurrentView('motor-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenTransformerCalculator={() => {
                  setCurrentView('transformer-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : currentView === 'voltage-drop' ? (
            <motion.div
              key="voltage-drop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <VoltageDropCalculatorPage
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenCableSizeCalculator={() => {
                  setCurrentView('cable-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenLoadCalculator={() => {
                  setCurrentView('load-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMotorCalculator={() => {
                  setCurrentView('motor-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenTransformerCalculator={() => {
                  setCurrentView('transformer-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : currentView === 'load-calculator' ? (
            <motion.div
              key="load-calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <LoadCalculatorPage
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenCableSizeCalculator={() => {
                  setCurrentView('cable-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenVoltageDropCalculator={() => {
                  setCurrentView('voltage-drop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMotorCalculator={() => {
                  setCurrentView('motor-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenTransformerCalculator={() => {
                  setCurrentView('transformer-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : currentView === 'motor-calculator' ? (
            <motion.div
              key="motor-calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <MotorCurrentCalculatorPage
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenCableSizeCalculator={() => {
                  setCurrentView('cable-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenVoltageDropCalculator={() => {
                  setCurrentView('voltage-drop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenLoadCalculator={() => {
                  setCurrentView('load-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenTransformerCalculator={() => {
                  setCurrentView('transformer-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : currentView === 'transformer-calculator' ? (
            <motion.div
              key="transformer-calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <TransformerCalculatorPage
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenCableSizeCalculator={() => {
                  setCurrentView('cable-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenVoltageDropCalculator={() => {
                  setCurrentView('voltage-drop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenLoadCalculator={() => {
                  setCurrentView('load-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMotorCalculator={() => {
                  setCurrentView('motor-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* 1. Hero Section & 2. Search Bar */}
              <Hero
                onOpenAIAssistant={() => setIsAIOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
<DashboardWelcome />

<div className="max-w-7xl mx-auto px-6 mt-10">
  <DashboardCards />
</div>
              {/* 3. Categories Grid */}
              <CategoriesGrid onSelectCategory={handleSelectCategoryFromGrid} />

              {/* 4. Popular Tools */}
              <PopularToolsGrid
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onOpenAIAssistant={() => setIsAIOpen(true)}
                onOpenCableCalculator={() => {
                  setCurrentView('cable-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenVoltageDropCalculator={() => {
                  setCurrentView('voltage-drop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenLoadCalculator={() => {
                  setCurrentView('load-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenMotorCalculator={() => {
                  setCurrentView('motor-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenTransformerCalculator={() => {
                  setCurrentView('transformer-calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* 5. Why EngineerHub */}
              <WhyEngineerHub />

              {/* 6. FAQ */}
              <FaqSection />

              {/* 7. Contact */}
              <Contact />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Modals & Notifications */}
      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <SpecsModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <EngineerHubContent />
    </ThemeProvider>
  );
}
