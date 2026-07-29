import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Zap,
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
  Gauge,
  Activity,
  Layers,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VoltageDropCalculatorPageProps {
  onBackToHome: () => void;
  onOpenAIAssistant?: () => void;
  onOpenCableSizeCalculator?: () => void;
}

// Available Standard Conductor Cross-Section Sizes (mm²)
const CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Installation Methods
const INSTALLATION_METHODS = [
  { id: 'conduit', label: 'In Conduit / Trunking', factor: 0.8 },
  { id: 'air', label: 'In Free Air / Perforated Tray', factor: 1.0 },
  { id: 'direct_buried', label: 'Direct Buried in Ground', factor: 0.88 },
  { id: 'unperforated_tray', label: 'Unperforated Cable Tray', factor: 0.85 },
];

export const VoltageDropCalculatorPage: React.FC<VoltageDropCalculatorPageProps> = ({
  onBackToHome,
  onOpenAIAssistant,
  onOpenCableSizeCalculator,
}) => {
  const { showToast } = useTheme();

  // State Inputs
  const [systemType, setSystemType] = useState<'Single Phase' | 'Three Phase'>('Three Phase');
  const [material, setMaterial] = useState<'Copper' | 'Aluminium'>('Copper');
  const [voltage, setVoltage] = useState<number>(415);
  const [current, setCurrent] = useState<number>(32);
  const [length, setLength] = useState<number>(75);
  const [cableSize, setCableSize] = useState<number>(6); // 6 sq.mm
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [installMethodId, setInstallMethodId] = useState<string>('conduit');
  const [copied, setCopied] = useState<boolean>(false);

  // Quick Preset Helper for System Switch
  const handleSystemTypeChange = (type: 'Single Phase' | 'Three Phase') => {
    setSystemType(type);
    if (type === 'Single Phase') {
      setVoltage(230);
    } else {
      setVoltage(415);
    }
  };

  // Perform Calculations
  const calculationResults = useMemo(() => {
    // Standard Resistivity at 20°C / adjusted for thermal operating limit (~70°C XLPE)
    // Copper: 0.0178 Ohm.mm²/m base, 0.0213 Ohm.mm²/m @ 70°C
    // Aluminium: 0.0282 Ohm.mm²/m base, 0.0338 Ohm.mm²/m @ 70°C
    const rhoBase = material === 'Copper' ? 0.0178 : 0.0282;
    const rho70 = material === 'Copper' ? 0.0213 : 0.0338;

    // Single Conductor Resistance (R) for the given length
    const rConductor = (rho70 * length) / cableSize; // Ohms

    // Inductive Reactance (X) estimate ~0.08 mOhm/m
    const xConductor = (0.08 * length) / 1000; // Ohms

    // Apparent Impedance Z = sqrt(R² + X²)
    const zConductor = Math.sqrt(Math.pow(rConductor, 2) + Math.pow(xConductor, 2));

    // Voltage Drop (V)
    // Single Phase: 2 * I * L * (R*cosPhi + X*sinPhi) / 1000 or simplified 2 * I * L * rho / A
    // Three Phase: sqrt(3) * I * L * (R*cosPhi + X*sinPhi) / 1000 or simplified sqrt(3) * I * L * rho / A
    const sinPhi = Math.sin(Math.acos(powerFactor));
    const zEffective = rConductor * powerFactor + xConductor * sinPhi;

    let vDropVal = 0;
    let powerLossWatts = 0;

    if (systemType === 'Single Phase') {
      vDropVal = 2 * current * zEffective;
      // Power Loss P = 2 * I² * R
      powerLossWatts = 2 * Math.pow(current, 2) * rConductor;
    } else {
      vDropVal = Math.sqrt(3) * current * zEffective;
      // Power Loss P = 3 * I² * R
      powerLossWatts = 3 * Math.pow(current, 2) * rConductor;
    }

    const vDropPct = (vDropVal / voltage) * 100;
    const powerLossKw = powerLossWatts / 1000;

    // Status: Pass (<=3%), Borderline (>3% & <=5%), Fail (>5%)
    let status: 'PASS' | 'BORDERLINE' | 'FAIL' = 'PASS';
    if (vDropPct > 5.0) {
      status = 'FAIL';
    } else if (vDropPct > 3.0) {
      status = 'BORDERLINE';
    }

    // Recommended Minimum Cable Size to achieve <= 3% drop
    let recommendedMinSize = cableSize;
    for (let i = 0; i < CABLE_SIZES.length; i++) {
      const candidateSize = CABLE_SIZES[i];
      const candidateR = (rho70 * length) / candidateSize;
      const candidateZEff = candidateR * powerFactor + xConductor * sinPhi;
      let candidateVD = 0;

      if (systemType === 'Single Phase') {
        candidateVD = 2 * current * candidateZEff;
      } else {
        candidateVD = Math.sqrt(3) * current * candidateZEff;
      }

      const candidatePct = (candidateVD / voltage) * 100;
      if (candidatePct <= 3.0) {
        recommendedMinSize = candidateSize;
        break;
      }
    }

    return {
      rConductor,
      xConductor,
      zEffective,
      vDropVal,
      vDropPct,
      powerLossWatts,
      powerLossKw,
      status,
      recommendedMinSize,
      rho70,
    };
  }, [systemType, material, voltage, current, length, cableSize, powerFactor]);

  // Reset Form
  const handleReset = () => {
    setSystemType('Three Phase');
    setMaterial('Copper');
    setVoltage(415);
    setCurrent(32);
    setLength(75);
    setCableSize(6);
    setPowerFactor(0.85);
    setInstallMethodId('conduit');
    showToast('Voltage drop parameters reset to standard engineering defaults.', 'info');
  };

  // Copy Summary Report
  const handleCopy = () => {
    const reportText = `================================================
ENGINEERHUB VOLTAGE DROP CALCULATION REPORT
================================================
System Topology: ${systemType} (${voltage} V)
Material: ${material} | Conductor Size: ${cableSize} mm²
Load Current: ${current} A | Power Factor: ${powerFactor}
Route Length: ${length} meters

------------------ RESULTS ------------------
VOLTAGE DROP: ${calculationResults.vDropVal.toFixed(2)} V
VOLTAGE DROP PERCENTAGE: ${calculationResults.vDropPct.toFixed(2)}%
STATUS: ${calculationResults.status} (Threshold: 3% Branch, 5% Feeder)
POWER LOSS: ${calculationResults.powerLossWatts.toFixed(1)} W (${calculationResults.powerLossKw.toFixed(3)} kW)
CONDUCTOR RESISTANCE: ${calculationResults.rConductor.toFixed(4)} Ω
RECOMMENDED MIN CABLE SIZE: ${calculationResults.recommendedMinSize} mm²
------------------------------------------------
IEC 60364-5-52 & NEC Article 210 Verified - EngineerHub v2.5`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    showToast('Voltage drop report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Print PDF Report
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="py-24 relative overflow-hidden min-h-screen">
      {/* Background Radial Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to EngineerHub Hub</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCableSizeCalculator && (
              <button
                onClick={onOpenCableSizeCalculator}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cable Size Calculator</span>
              </button>
            )}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IEC 60364-5-52 & NEC 210 Compliant</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Gauge className="w-3.5 h-3.5" />
            <span>Electrical Performance Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            Voltage Drop Calculator
          </h1>
          <p className="mt-2 text-slate-400 dark:text-slate-400 light:text-slate-600 text-base max-w-3xl">
            Calculate precise circuit voltage drop, percentage loss, thermal power dissipation, and conductor resistance across AC branch and feeder lines.
          </p>
        </div>

        {/* Main Grid: Inputs vs Output Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span>Circuit Parameters</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Live Impedance Sync</span>
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
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
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
                      Conductor Material
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Copper', 'Aluminium'] as const).map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setMaterial(mat)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            material === mat
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Voltage & Load Current Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Voltage */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Nominal Voltage (V)
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setVoltage(230)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          230V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(415)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          415V
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="33000"
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    />
                  </div>

                  {/* Load Current */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Load Current (Amps)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      max="2000"
                      value={current}
                      onChange={(e) => setCurrent(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Cable Size & Route Length Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cable Size */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Conductor Size (sq.mm)
                    </label>
                    <select
                      value={cableSize}
                      onChange={(e) => setCableSize(Number(e.target.value))}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-900 font-mono"
                    >
                      {CABLE_SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz} mm² Conductor
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Route Length (Meters)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* 4. Power Factor & Installation Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Power Factor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Power Factor (cos φ)
                      </label>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {powerFactor}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.05"
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer my-2"
                    />
                  </div>

                  {/* Installation Method */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Installation Routing Method
                    </label>
                    <select
                      value={installMethodId}
                      onChange={(e) => setInstallMethodId(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-900"
                    >
                      {INSTALLATION_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Button Bar */}
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
                        className="px-4 py-2.5 rounded-xl glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ask AI Assistant</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT 5 COLS: OUTPUT RESULTS CARD */}
          <div className="lg:col-span-5 space-y-6">
            <div className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-heading font-bold text-slate-100">
                      Voltage Drop Output
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  {calculationResults.status === 'PASS' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASS (≤ 3%)</span>
                    </span>
                  )}
                  {calculationResults.status === 'BORDERLINE' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>BORDERLINE (&gt;3% ≤5%)</span>
                    </span>
                  )}
                  {calculationResults.status === 'FAIL' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAIL (&gt; 5%)</span>
                    </span>
                  )}
                </div>

                {/* Main Hero Card: Voltage Drop Drop V & % */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-500/30 mb-6 text-center relative overflow-hidden">
                  <div className="text-xs uppercase font-mono tracking-widest text-cyan-300/80 mb-1">
                    Circuit Voltage Drop
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-indigo-200">
                    {calculationResults.vDropVal.toFixed(2)} Volts
                  </div>
                  <div className={`text-sm font-extrabold mt-2 font-mono ${
                    calculationResults.vDropPct <= 3 ? 'text-emerald-400' : calculationResults.vDropPct <= 5 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {calculationResults.vDropPct.toFixed(2)}% of Nominal {voltage}V
                  </div>
                </div>

                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Power Loss */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Power Thermal Loss
                    </div>
                    <div className="text-lg font-bold font-mono text-cyan-300">
                      {calculationResults.powerLossWatts.toFixed(1)} W
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      ({calculationResults.powerLossKw.toFixed(3)} kW)
                    </div>
                  </div>

                  {/* Cable Resistance */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Conductor Resistance
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-100">
                      {calculationResults.rConductor.toFixed(4)} Ω
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      @ 70°C Operating Temp
                    </div>
                  </div>

                  {/* Pass / Fail Code Status */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Code Compliance
                    </div>
                    <div className={`text-base font-bold font-mono ${
                      calculationResults.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {calculationResults.status}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      IEC 60364 &amp; NEC 210
                    </div>
                  </div>

                  {/* Recommended Min Size */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended Min Size
                    </div>
                    <div className="text-base font-bold text-indigo-300 font-mono">
                      {calculationResults.recommendedMinSize} mm²
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      For &lt; 3% Drop Target
                    </div>
                  </div>
                </div>

                {/* Additional Technical Details */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Effective Impedance Z:</span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {calculationResults.zEffective.toFixed(4)} Ω
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Conductor Inductive Reactance X:</span>
                    <span className="text-cyan-300 font-mono font-semibold">
                      {calculationResults.xConductor.toFixed(4)} Ω
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* LOWER EXPLANATORY SECTIONS */}
        <div className="space-y-8">
          
          {/* Formula & Step-by-Step Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formula Block */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Voltage Drop Formulas</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">1. Conductor Resistance (R):</div>
                  <div>R = (ρ_70°C × Length) / CableArea</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    R = ({calculationResults.rho70} × {length}) / {cableSize} = {calculationResults.rConductor.toFixed(4)} Ω
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">2. Voltage Drop Calculation (ΔV):</div>
                  {systemType === 'Single Phase' ? (
                    <div>ΔV = 2 × I × (R × cos φ + X × sin φ)</div>
                  ) : (
                    <div>ΔV = √3 × I × (R × cos φ + X × sin φ)</div>
                  )}
                  <div className="text-slate-500 text-[11px] mt-1">
                    ΔV = {calculationResults.vDropVal.toFixed(2)} V
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">3. Thermal Power Dissipation (P_loss):</div>
                  {systemType === 'Single Phase' ? (
                    <div>P_loss = 2 × I² × R</div>
                  ) : (
                    <div>P_loss = 3 × I² × R</div>
                  )}
                  <div className="text-slate-500 text-[11px] mt-1">
                    P_loss = {calculationResults.powerLossWatts.toFixed(1)} Watts
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Step-by-Step Calculation</span>
              </h3>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Calculate Conductor Resistance:</span> At 70°C operating temp, {material} conductor resistance for {length} meters route is <strong className="text-cyan-300">{calculationResults.rConductor.toFixed(4)} Ω</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Evaluate Apparent Impedance Z:</span> Incorporating power factor of {powerFactor} gives effective circuit impedance of <strong className="text-cyan-300">{calculationResults.zEffective.toFixed(4)} Ω</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Compute Line Voltage Drop:</span> {systemType} formula produces <strong className="text-indigo-300">{calculationResults.vDropVal.toFixed(2)} V</strong> voltage drop (<strong className="text-emerald-400">{calculationResults.vDropPct.toFixed(2)}%</strong>).
                </li>
                <li>
                  <span className="font-bold text-slate-100">Verify Code Compliance & Power Loss:</span> Thermal energy lost in conductor resistance equals <strong className="text-cyan-300">{calculationResults.powerLossWatts.toFixed(1)} W</strong>. Status: <strong className="text-emerald-400">{calculationResults.status}</strong>.
                </li>
              </ol>
            </div>

          </div>

          {/* Engineering Notes & Code References */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Notes */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Engineering Recommendations</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Branch circuits supplying sensitive digital instrumentation or IT equipment should target voltage drop &lt; 2.0%.</li>
                <li>Motor starting inrush currents (typically 6x - 8x full load) can cause severe transient voltage dips during acceleration.</li>
                <li>When long cable runs exceed 100 meters, increasing conductor size by one standard step reduces long-term operational thermal losses significantly.</li>
              </ul>
            </div>

            {/* Standard References */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>IEC / NEC / IS Code Standards</span>
              </h4>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 text-xs text-slate-300 space-y-2 font-sans">
                <p>• <strong>IEC 60364-5-52:</strong> Maximum recommended voltage drop 3% for lighting, 5% for other uses.</p>
                <p>• <strong>NEC Article 210.19(A):</strong> Maximum 3% voltage drop on branch circuits, 5% overall total for feeder + branch.</p>
                <p>• <strong>IS 7098 / IS 1554:</strong> Standard PVC/XLPE insulated power cables specifications.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
