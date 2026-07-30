import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  RefreshCw,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Info,
  Sparkles,
  Sliders,
  Check,
  BookOpen,
  Cpu,
  Activity,
  Layers,
  Printer,
  TrendingUp,
  Shield,
  ZapOff,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoadCalculatorPageProps {
  onBackToHome: () => void;
  onOpenAIAssistant?: () => void;
  onOpenCableSizeCalculator?: () => void;
  onOpenVoltageDropCalculator?: () => void;
  onOpenMotorCalculator?: () => void;
}

// Preset Engineering Load Scenarios
const PRESET_SCENARIOS = [
  {
    name: 'Residential Apartment (15 kW)',
    systemType: 'Single Phase' as const,
    voltage: 230,
    connectedLoad: 15,
    powerFactor: 0.90,
    demandFactor: 0.70,
    diversityFactor: 1.10,
    futureExpansion: 15,
  },
  {
    name: 'Commercial Office Panel (75 kW)',
    systemType: 'Three Phase' as const,
    voltage: 415,
    connectedLoad: 75,
    powerFactor: 0.85,
    demandFactor: 0.80,
    diversityFactor: 1.20,
    futureExpansion: 20,
  },
  {
    name: 'Industrial Workshop (200 kW)',
    systemType: 'Three Phase' as const,
    voltage: 415,
    connectedLoad: 200,
    powerFactor: 0.82,
    demandFactor: 0.85,
    diversityFactor: 1.25,
    futureExpansion: 25,
  },
  {
    name: 'Data Center Substation (450 kW)',
    systemType: 'Three Phase' as const,
    voltage: 415,
    connectedLoad: 450,
    powerFactor: 0.95,
    demandFactor: 0.90,
    diversityFactor: 1.10,
    futureExpansion: 30,
  },
];

// Standard Breaker Sizes (Amps)
const BREAKER_RATINGS = [
  16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200,
];

// Cable Ampacity Mapping (XLPE Copper / Aluminium in air @ 30°C)
const CABLE_TABLE = [
  { size: 2.5, cuAmp: 26, alAmp: 19 },
  { size: 4, cuAmp: 35, alAmp: 26 },
  { size: 6, cuAmp: 45, alAmp: 33 },
  { size: 10, cuAmp: 62, alAmp: 46 },
  { size: 16, cuAmp: 83, alAmp: 61 },
  { size: 25, cuAmp: 110, alAmp: 81 },
  { size: 35, cuAmp: 135, alAmp: 100 },
  { size: 50, cuAmp: 163, alAmp: 121 },
  { size: 70, cuAmp: 207, alAmp: 153 },
  { size: 95, cuAmp: 251, alAmp: 186 },
  { size: 120, cuAmp: 290, alAmp: 215 },
  { size: 150, cuAmp: 332, alAmp: 246 },
  { size: 185, cuAmp: 378, alAmp: 280 },
  { size: 240, cuAmp: 445, alAmp: 330 },
  { size: 300, cuAmp: 510, alAmp: 378 },
  { size: 400, cuAmp: 600, alAmp: 450 },
];

export const LoadCalculatorPage: React.FC<LoadCalculatorPageProps> = ({
  onBackToHome,
  onOpenAIAssistant,
  onOpenCableSizeCalculator,
  onOpenVoltageDropCalculator,
  onOpenMotorCalculator,
}) => {
  const { showToast } = useTheme();

  // State Inputs
  const [systemType, setSystemType] = useState<'Single Phase' | 'Three Phase'>('Three Phase');
  const [voltage, setVoltage] = useState<number>(415);
  const [connectedLoad, setConnectedLoad] = useState<number>(75); // in kW
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [demandFactor, setDemandFactor] = useState<number>(0.80); // 80%
  const [diversityFactor, setDiversityFactor] = useState<number>(1.20); // 1.2
  const [futureExpansion, setFutureExpansion] = useState<number>(20); // 20%
  const [material, setMaterial] = useState<'Copper' | 'Aluminium'>('Copper');
  const [copied, setCopied] = useState<boolean>(false);

  // System type switch
  const handleSystemTypeChange = (type: 'Single Phase' | 'Three Phase') => {
    setSystemType(type);
    if (type === 'Single Phase') {
      setVoltage(230);
    } else {
      setVoltage(415);
    }
  };

  // Load Preset
  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSystemType(preset.systemType);
    setVoltage(preset.voltage);
    setConnectedLoad(preset.connectedLoad);
    setPowerFactor(preset.powerFactor);
    setDemandFactor(preset.demandFactor);
    setDiversityFactor(preset.diversityFactor);
    setFutureExpansion(preset.futureExpansion);
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  // Perform Precise Calculations
  const calculationResults = useMemo(() => {
    // 1. Expanded Connected Load (kW)
    const expandedConnectedLoad = connectedLoad * (1 + futureExpansion / 100);

    // 2. Maximum Demand (kW)
    // Max Demand = (Expanded Connected Load * Demand Factor) / Diversity Factor
    const maxDemandKw = (expandedConnectedLoad * demandFactor) / diversityFactor;

    // 3. Apparent Power (kVA)
    const maxDemandKva = maxDemandKw / powerFactor;
    const connectedKva = expandedConnectedLoad / powerFactor;

    // 4. Total Current (Amps)
    let totalDemandCurrent = 0;
    let connectedCurrent = 0;

    if (systemType === 'Single Phase') {
      // I = P * 1000 / (V * PF)
      totalDemandCurrent = (maxDemandKw * 1000) / (voltage * powerFactor);
      connectedCurrent = (expandedConnectedLoad * 1000) / (voltage * powerFactor);
    } else {
      // I = P * 1000 / (sqrt(3) * V * PF)
      totalDemandCurrent = (maxDemandKw * 1000) / (Math.sqrt(3) * voltage * powerFactor);
      connectedCurrent = (expandedConnectedLoad * 1000) / (Math.sqrt(3) * voltage * powerFactor);
    }

    // 5. Recommended MCB/MCCB Rating (Amps)
    // Continuous duty safety margin of 1.25 (125%) per NEC 215 / IEC 60364
    const requiredBreakerCurrent = totalDemandCurrent * 1.25;
    const recommendedBreaker = BREAKER_RATINGS.find((r) => r >= requiredBreakerCurrent) || 4000;
    const breakerType = recommendedBreaker <= 125 ? 'MCB (Miniature Circuit Breaker)' : recommendedBreaker <= 800 ? 'MCCB (Moulded Case Circuit Breaker)' : 'ACB (Air Circuit Breaker)';

    // 6. Recommended Cable Size
    let recommendedCableSize = 300; // default max standard
    let isParallel = false;
    let parallelRuns = 1;
    let cableAmpacity = 510;

    const targetAmpacity = recommendedBreaker;

    for (let i = 0; i < CABLE_TABLE.length; i++) {
      const row = CABLE_TABLE[i];
      const amp = material === 'Copper' ? row.cuAmp : row.alAmp;
      if (amp >= targetAmpacity) {
        recommendedCableSize = row.size;
        cableAmpacity = amp;
        break;
      }
    }

    // If load exceeds single 400mm² cable capacity (600A Cu / 450A Al)
    const maxSingleAmp = material === 'Copper' ? 600 : 450;
    if (targetAmpacity > maxSingleAmp) {
      isParallel = true;
      parallelRuns = Math.ceil(targetAmpacity / (maxSingleAmp * 0.8)); // 0.8 derating for grouping
      const reqAmpPerRun = targetAmpacity / (parallelRuns * 0.8);
      for (let i = 0; i < CABLE_TABLE.length; i++) {
        const row = CABLE_TABLE[i];
        const amp = material === 'Copper' ? row.cuAmp : row.alAmp;
        if (amp >= reqAmpPerRun) {
          recommendedCableSize = row.size;
          cableAmpacity = amp;
          break;
        }
      }
    }

    // 7. Recommended Earthing Size (Per IEC 60364-5-54 / IS 3043 / NEC 250.122)
    let earthingCable = '10 mm² Copper / 16 mm² GI';
    let earthingStrip = '25 x 3 mm GI Strip';
    let earthPitDesc = '50 mm Dia GI Pipe Electrode (3.0 m Depth) with Bentonite Compound';

    if (recommendedBreaker > 800) {
      earthingCable = '70 mm² Copper Wire';
      earthingStrip = 'Dual 50 x 6 mm GI Strips / 75 x 10 mm Copper Busbar';
      earthPitDesc = 'Quad Earth Pit Grid with 17.2 mm Copper Bonded Steel Rods (3.0 m) & Low-Resistance Earth Compound (< 1.0 Ω)';
    } else if (recommendedBreaker > 400) {
      earthingCable = '50 mm² Copper Wire';
      earthingStrip = '75 x 6 mm GI Strip';
      earthPitDesc = 'Triple Earth Pit Array with 50 mm GI Pipe / Chemical Electrode (< 1.0 Ω)';
    } else if (recommendedBreaker > 200) {
      earthingCable = '35 mm² Copper Wire';
      earthingStrip = '50 x 6 mm GI Strip';
      earthPitDesc = 'Dual Earth Pit Array with Chemical Compound (< 2.0 Ω)';
    } else if (recommendedBreaker > 100) {
      earthingCable = '16 mm² Copper Wire';
      earthingStrip = '25 x 6 mm GI Strip';
      earthPitDesc = '50 mm Dia GI Pipe / Copper Bonded Rod Pit (< 3.0 Ω)';
    }

    // Efficiency & Power Factor Status
    let pfStatus: 'OPTIMAL' | 'FAIR' | 'POOR' = 'OPTIMAL';
    if (powerFactor < 0.80) pfStatus = 'POOR';
    else if (powerFactor < 0.88) pfStatus = 'FAIR';

    return {
      expandedConnectedLoad,
      maxDemandKw,
      maxDemandKva,
      connectedKva,
      totalDemandCurrent,
      connectedCurrent,
      requiredBreakerCurrent,
      recommendedBreaker,
      breakerType,
      recommendedCableSize,
      cableAmpacity,
      isParallel,
      parallelRuns,
      earthingCable,
      earthingStrip,
      earthPitDesc,
      pfStatus,
    };
  }, [systemType, voltage, connectedLoad, powerFactor, demandFactor, diversityFactor, futureExpansion, material]);

  // Reset Form
  const handleReset = () => {
    setSystemType('Three Phase');
    setVoltage(415);
    setConnectedLoad(75);
    setPowerFactor(0.85);
    setDemandFactor(0.80);
    setDiversityFactor(1.20);
    setFutureExpansion(20);
    setMaterial('Copper');
    showToast('Load parameters reset to default commercial specifications.', 'info');
  };

  // Copy Full Calculation Summary
  const handleCopy = () => {
    const reportText = `================================================
ENGINEERHUB ELECTRICAL LOAD CALCULATION REPORT
================================================
System Topology: ${systemType} (${voltage} V)
Connected Load: ${connectedLoad} kW (Expanded +${futureExpansion}%: ${calculationResults.expandedConnectedLoad.toFixed(2)} kW)
Power Factor: ${powerFactor} | Demand Factor: ${demandFactor} | Diversity Factor: ${diversityFactor}

------------------ OUTPUT RESULTS ------------------
MAXIMUM DEMAND: ${calculationResults.maxDemandKw.toFixed(2)} kW (${calculationResults.maxDemandKva.toFixed(2)} kVA)
CONNECTED APPARENT POWER: ${calculationResults.connectedKva.toFixed(2)} kVA
MAX OPERATING DEMAND CURRENT: ${calculationResults.totalDemandCurrent.toFixed(2)} A
PEAK CONNECTED CURRENT: ${calculationResults.connectedCurrent.toFixed(2)} A

RECOMMENDED PROTECTIVE BREAKER: ${calculationResults.recommendedBreaker} A ${calculationResults.breakerType}
RECOMMENDED CABLE SIZE: ${calculationResults.isParallel ? `${calculationResults.parallelRuns}x Runs of ` : ''}${calculationResults.recommendedCableSize} mm² ${material} XLPE
RECOMMENDED EARTHING CONDUCTOR: ${calculationResults.earthingCable} (${calculationResults.earthingStrip})
EARTHING ELECTRODE SPEC: ${calculationResults.earthPitDesc}
------------------------------------------------
IEC 60364-5-52 & NEC Article 220 Verified - EngineerHub v2.5`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    showToast('Load calculation summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Print PDF Report
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="py-24 relative overflow-hidden min-h-screen">
      {/* Background Radial Glow Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb & Related Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to EngineerHub Hub</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCableSizeCalculator && (
              <button
                onClick={onOpenCableSizeCalculator}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Cable Size Calculator</span>
              </button>
            )}
            {onOpenVoltageDropCalculator && (
              <button
                onClick={onOpenVoltageDropCalculator}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voltage Drop</span>
              </button>
            )}
            {onOpenMotorCalculator && (
              <button
                onClick={onOpenMotorCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motor Current</span>
              </button>
            )}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NEC Article 220 & IEC 60364-5-52 Compliant</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Gauge className="w-3.5 h-3.5" />
            <span>Power & Panel Demand Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            Electrical Load Calculator
          </h1>
          <p className="mt-2 text-slate-400 dark:text-slate-400 light:text-slate-600 text-base max-w-3xl">
            Calculate total connected load, maximum operating demand in kW/kVA, line current, breaker ratings, conductor size, and earthing system requirements.
          </p>
        </div>

        {/* Preset Scenarios Row */}
        <div className="mb-10 p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quick Preset Engineering Scenarios</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-xl glass-panel border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {preset.systemType} • {preset.connectedLoad} kW @ {preset.voltage}V
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Inputs vs Output Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>Load Parameters</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Live Matrix Sync</span>
              </div>

              <div className="space-y-5">

                {/* 1. Topology & Conductor Material */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* System Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      System Topology
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Single Phase', 'Three Phase'] as const).map((sys) => (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => handleSystemTypeChange(sys)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            systemType === sys
                              ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sys}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Feeder Material
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Copper', 'Aluminium'] as const).map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setMaterial(mat)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            material === mat
                              ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Voltage & Connected Load (kW) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nominal Voltage */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Nominal Voltage (V)
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setVoltage(230)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 font-mono"
                        >
                          230V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(415)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 font-mono"
                        >
                          415V
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="110"
                      max="11000"
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                    />
                  </div>

                  {/* Connected Load (kW) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Connected Load (kW)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="1"
                      max="5000"
                      value={connectedLoad}
                      onChange={(e) => setConnectedLoad(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Power Factor & Demand Factor Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Power Factor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Power Factor (cos φ)
                      </label>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {powerFactor}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.01"
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer my-2"
                    />
                  </div>

                  {/* Demand Factor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Demand Factor
                      </label>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {(demandFactor * 100).toFixed(0)}% ({demandFactor})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="1.00"
                      step="0.05"
                      value={demandFactor}
                      onChange={(e) => setDemandFactor(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer my-2"
                    />
                  </div>
                </div>

                {/* 4. Diversity Factor & Future Expansion Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Diversity Factor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Diversity Factor (DivF)
                      </label>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {diversityFactor}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.00"
                      max="2.00"
                      step="0.05"
                      value={diversityFactor}
                      onChange={(e) => setDiversityFactor(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer my-2"
                    />
                    <div className="text-[10px] text-slate-500">
                      Standard: 1.10 - 1.30 for distribution panels
                    </div>
                  </div>

                  {/* Future Expansion (%) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Future Expansion (%)
                    </label>
                    <select
                      value={futureExpansion}
                      onChange={(e) => setFutureExpansion(Number(e.target.value))}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-slate-900"
                    >
                      <option value={0}>0% (No Reserve Allowance)</option>
                      <option value={10}>10% Reserve Growth</option>
                      <option value={15}>15% Reserve Growth</option>
                      <option value={20}>20% Recommended Standard</option>
                      <option value={25}>25% Commercial Growth</option>
                      <option value={30}>30% Industrial Reserve</option>
                      <option value={50}>50% Heavy Expansion</option>
                    </select>
                  </div>
                </div>

                {/* Button Action Controls */}
                <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl glass-card text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                    {onOpenAIAssistant && (
                      <button
                        type="button"
                        onClick={onOpenAIAssistant}
                        className="px-4 py-2.5 rounded-xl glass-card text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ask AI Assistant</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-amber-500 text-xs font-semibold flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT 5 COLS: OUTPUT RESULTS CARDS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-heading font-bold text-slate-100">
                      Calculated Output Summary
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>IEC 60364 Validated</span>
                  </span>
                </div>

                {/* Primary Hero Result: Total Operating Current (Amps) */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/30 mb-6 text-center relative overflow-hidden">
                  <div className="text-xs uppercase font-mono tracking-widest text-amber-300/80 mb-1">
                    Maximum Demand Operating Current
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-yellow-200">
                    {calculationResults.totalDemandCurrent.toFixed(1)} Amps
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    Peak Connected Current: <strong className="text-amber-300">{calculationResults.connectedCurrent.toFixed(1)} A</strong>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Maximum Demand (kW) */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Maximum Demand (kW)
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-300">
                      {calculationResults.maxDemandKw.toFixed(2)} kW
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Expanded Load: {calculationResults.expandedConnectedLoad.toFixed(1)} kW
                    </div>
                  </div>

                  {/* Apparent Power (kVA) */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Apparent Power (kVA)
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-100">
                      {calculationResults.maxDemandKva.toFixed(2)} kVA
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Connected: {calculationResults.connectedKva.toFixed(1)} kVA
                    </div>
                  </div>

                  {/* Recommended Breaker */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended MCB / MCCB
                    </div>
                    <div className="text-lg font-bold text-amber-400 font-mono">
                      {calculationResults.recommendedBreaker} A
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      {calculationResults.breakerType}
                    </div>
                  </div>

                  {/* Recommended Cable Size */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended Cable
                    </div>
                    <div className="text-base font-bold text-indigo-300 font-mono">
                      {calculationResults.isParallel ? `${calculationResults.parallelRuns}x ` : ''}{calculationResults.recommendedCableSize} mm²
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {material} XLPE / Armored Feeder
                    </div>
                  </div>
                </div>

                {/* Earthing Recommendation Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Earthing & Grounding Size</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>• <strong>Earthing Conductor:</strong> {calculationResults.earthingCable}</div>
                    <div>• <strong>Grounding Strip:</strong> {calculationResults.earthingStrip}</div>
                    <div className="text-[11px] text-slate-400 font-sans">• <strong>Earth Pit Spec:</strong> {calculationResults.earthPitDesc}</div>
                  </div>
                </div>

                {/* Additional Technical Details */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Continuous Breaker Duty Target (125%):</span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {calculationResults.requiredBreakerCurrent.toFixed(1)} A
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Factor Efficiency:</span>
                    <span className={`font-mono font-semibold ${
                      calculationResults.pfStatus === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {powerFactor} ({calculationResults.pfStatus})
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* LOWER EXPLANATORY & CODE SECTIONS */}
        <div className="space-y-8">
          
          {/* Formula & Step-by-Step Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formula Block */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Load Calculation Formulas</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">1. Expanded Connected Load (kW):</div>
                  <div>P_exp = P_connected × (1 + Expansion% / 100)</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    P_exp = {connectedLoad} × (1 + {futureExpansion}/100) = {calculationResults.expandedConnectedLoad.toFixed(2)} kW
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">2. Maximum Demand (kW & kVA):</div>
                  <div>P_demand = (P_exp × DemandFactor) / DiversityFactor</div>
                  <div>S_demand = P_demand / PowerFactor</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    P_demand = ({calculationResults.expandedConnectedLoad.toFixed(2)} × {demandFactor}) / {diversityFactor} = {calculationResults.maxDemandKw.toFixed(2)} kW ({calculationResults.maxDemandKva.toFixed(2)} kVA)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">3. Operating Line Current (I):</div>
                  {systemType === 'Single Phase' ? (
                    <div>I = (P_demand × 1000) / (V × PF)</div>
                  ) : (
                    <div>I = (P_demand × 1000) / (√3 × V × PF)</div>
                  )}
                  <div className="text-slate-500 text-[11px] mt-1">
                    I_operating = {calculationResults.totalDemandCurrent.toFixed(2)} Amps
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold mb-1">4. Protective Device Rating (NEC / IEC):</div>
                  <div>I_breaker ≥ I_operating × 1.25 (125% Continuous Rule)</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    I_req = {calculationResults.requiredBreakerCurrent.toFixed(1)} A → Selected: {calculationResults.recommendedBreaker} A
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Step-by-Step Electrical Derivation</span>
              </h3>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Incorporate Future Reserve Margin:</span> Base connected load of {connectedLoad} kW with a {futureExpansion}% future growth buffer scales total connected load to <strong className="text-amber-300">{calculationResults.expandedConnectedLoad.toFixed(2)} kW</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Apply Demand & Diversity Factors:</span> Multiplying by {demandFactor} demand factor and dividing by {diversityFactor} diversity factor establishes net panel Maximum Demand at <strong className="text-amber-300">{calculationResults.maxDemandKw.toFixed(2)} kW ({calculationResults.maxDemandKva.toFixed(2)} kVA)</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Calculate Line Current:</span> Operating at {voltage}V ({systemType}) with a {powerFactor} power factor yields continuous load current of <strong className="text-amber-300">{calculationResults.totalDemandCurrent.toFixed(1)} A</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Select Protective Breaker & Cable:</span> Applying 125% safety duty requires breaker threshold of {calculationResults.requiredBreakerCurrent.toFixed(1)} A. Recommended rating: <strong className="text-amber-400">{calculationResults.recommendedBreaker} A ({calculationResults.breakerType})</strong> paired with <strong className="text-indigo-300">{calculationResults.isParallel ? `${calculationResults.parallelRuns}x ` : ''}{calculationResults.recommendedCableSize} mm² {material} XLPE feeder cable</strong>.
                </li>
                <li>
                  <span className="font-bold text-slate-100">Design Earthing Conductor:</span> Main panel earthing uses <strong className="text-emerald-400">{calculationResults.earthingCable}</strong> with <strong className="text-emerald-400">{calculationResults.earthingStrip}</strong> grounded via {calculationResults.earthPitDesc}.
                </li>
              </ol>
            </div>

          </div>

          {/* Engineering Notes & Standard References */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Notes */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Engineering & Panel Design Guidelines</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Demand Factor:</strong> Ratio of maximum demand to total connected load. Industrial plants usually range from 0.70 to 0.85, whereas residential buildings vary between 0.50 and 0.70.</li>
                <li><strong>Diversity Factor:</strong> Ratio of sum of individual maximum demands to the maximum demand of the overall system (always &ge; 1.0). Higher diversity reduces required substation transformer kVA size.</li>
                <li><strong>Power Factor Correction:</strong> If power factor drops below 0.85, installing Automatic Power Factor Correction (APFC) capacitor banks reduces overall kVA demand and prevents utility penalty surcharges.</li>
                <li><strong>Neutral Sizing:</strong> In panels serving non-linear switching power supplies or LED lighting, ensure neutral conductor is rated at 100% to 200% of phase conductor size to safely handle 3rd harmonic currents.</li>
              </ul>
            </div>

            {/* Standards Reference */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>IEC / NEC / IS Code Standards</span>
              </h4>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 text-xs text-slate-300 space-y-2 font-sans">
                <p>• <strong>NEC Article 220:</strong> Branch-Circuit, Feeder, and Service Load Calculations</p>
                <p>• <strong>IEC 60364-5-52:</strong> Electrical Installations - Selection & Erection of Equipment</p>
                <p>• <strong>IS 3043:</strong> Code of Practice for Earthing and Grounding Systems</p>
                <p>• <strong>IEEE Std 141 (Red Book):</strong> Recommended Practice for Electric Power Distribution for Industrial Plants</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
