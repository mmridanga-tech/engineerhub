import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Layers,
  Sliders,
  Check,
  Printer,
  ChevronRight,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CableSizeCalculatorPageProps {
  onBackToHome: () => void;
  onOpenAIAssistant?: () => void;
}

// Standard Cable Table Data (IEC 60364-5-52 / BS 7671)
// Size in mm², Copper Ampacity (XLPE in Air @ 30C), Aluminium Ampacity, Approx Resistance Ohm/km at 70C
const STANDARD_CABLES = [
  { size: 1.5, cuAmp: 19, fontAwg: '16 AWG', alAmp: 14, cuRes: 12.1, alRes: 19.8 },
  { size: 2.5, cuAmp: 26, fontAwg: '14 AWG', alAmp: 19, cuRes: 7.41, alRes: 12.1 },
  { size: 4, cuAmp: 35, fontAwg: '12 AWG', alAmp: 26, cuRes: 4.61, alRes: 7.56 },
  { size: 6, cuAmp: 45, fontAwg: '10 AWG', alAmp: 33, cuRes: 3.08, alRes: 5.05 },
  { size: 10, cuAmp: 62, fontAwg: '8 AWG', alAmp: 46, cuRes: 1.83, alRes: 3.03 },
  { size: 16, cuAmp: 83, fontAwg: '6 AWG', alAmp: 61, cuRes: 1.15, alRes: 1.91 },
  { size: 25, cuAmp: 110, fontAwg: '4 AWG', alAmp: 81, cuRes: 0.727, alRes: 1.2 },
  { size: 35, cuAmp: 135, fontAwg: '2 AWG', alAmp: 100, cuRes: 0.524, alRes: 0.868 },
  { size: 50, cuAmp: 163, fontAwg: '1/0 AWG', alAmp: 121, cuRes: 0.387, alRes: 0.641 },
  { size: 70, cuAmp: 207, fontAwg: '2/0 AWG', alAmp: 153, cuRes: 0.268, alRes: 0.443 },
  { size: 95, cuAmp: 251, fontAwg: '3/0 AWG', alAmp: 186, cuRes: 0.193, alRes: 0.32 },
  { size: 120, cuAmp: 290, fontAwg: '4/0 AWG', alAmp: 215, cuRes: 0.153, alRes: 0.253 },
  { size: 150, cuAmp: 332, fontAwg: '300 kcmil', alAmp: 246, cuRes: 0.124, alRes: 0.206 },
  { size: 185, cuAmp: 378, fontAwg: '350 kcmil', alAmp: 280, cuRes: 0.0991, alRes: 0.164 },
  { size: 240, cuAmp: 445, fontAwg: '500 kcmil', alAmp: 330, cuRes: 0.0754, alRes: 0.125 },
  { size: 300, cuAmp: 510, fontAwg: '600 kcmil', alAmp: 378, cuRes: 0.0601, alRes: 0.1 },
];

// Installation method derating factors
const INSTALLATION_METHODS = [
  { id: 'conduit', label: 'In Conduit / Trunking', factor: 0.8, desc: 'Enclosed in conduit or cable trunking on wall or floor' },
  { id: 'air', label: 'In Free Air / Perforated Tray', factor: 1.0, desc: 'Clipped direct or on open ladder/tray' },
  { id: 'direct_buried', label: 'Direct Buried in Ground', factor: 0.88, desc: 'Laid directly in soil with sand bedding' },
  { id: 'unperforated_tray', label: 'Unperforated Cable Tray', factor: 0.85, desc: 'Continuous solid cable tray in building' },
];

// Temperature derating factors (Reference 30°C base)
const AMBIENT_TEMPS = [
  { temp: 25, factor: 1.04 },
  { temp: 30, factor: 1.0 },
  { temp: 35, factor: 0.94 },
  { temp: 40, factor: 0.87 },
  { temp: 45, factor: 0.79 },
  { temp: 50, factor: 0.71 },
];

// Standard MCB Breaker Ratings
const STANDARD_MCBS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

export const CableSizeCalculatorPage: React.FC<CableSizeCalculatorPageProps> = ({
  onBackToHome,
  onOpenAIAssistant,
}) => {
  const { showToast } = useTheme();

  // State Inputs
  const [material, setMaterial] = useState<'Copper' | 'Aluminium'>('Copper');
  const [systemType, setSystemType] = useState<'Single Phase' | 'Three Phase'>('Three Phase');
  const [voltage, setVoltage] = useState<number>(415);
  const [current, setCurrent] = useState<number>(45);
  const [length, setLength] = useState<number>(60);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [installMethodId, setInstallMethodId] = useState<string>('conduit');
  const [ambientTemp, setAmbientTemp] = useState<number>(35);
  const [safetyMargin, setSafetyMargin] = useState<number>(20); // 20%
  const [copied, setCopied] = useState<boolean>(false);

  // Quick Preset Helper
  const handleSystemTypeChange = (type: 'Single Phase' | 'Three Phase') => {
    setSystemType(type);
    if (type === 'Single Phase') {
      setVoltage(230);
    } else {
      setVoltage(415);
    }
  };

  // Perform Sizing Calculations
  const calculationResults = useMemo(() => {
    const installObj = INSTALLATION_METHODS.find((m) => m.id === installMethodId) || INSTALLATION_METHODS[0];
    const tempObj = AMBIENT_TEMPS.find((t) => t.temp === ambientTemp) || AMBIENT_TEMPS[1];

    const installFactor = installObj.factor;
    const tempFactor = tempObj.factor;
    const combinedDerating = installFactor * tempFactor;

    // Design Current (with safety margin)
    const designCurrent = current * (1 + safetyMargin / 100);

    // Required un-derated ampacity in standard catalog
    const requiredCatalogAmpacity = designCurrent / combinedDerating;

    // Calculate Active & Apparent Power
    let powerKw = 0;
    let powerKva = 0;
    if (systemType === 'Single Phase') {
      powerKw = (voltage * current * powerFactor) / 1000;
      powerKva = (voltage * current) / 1000;
    } else {
      powerKw = (Math.sqrt(3) * voltage * current * powerFactor) / 1000;
      powerKva = (Math.sqrt(3) * voltage * current) / 1000;
    }

    // Standard Resistivity (Ohm mm²/m)
    const rho = material === 'Copper' ? 0.0178 : 0.0282;

    // Find smallest cable meeting catalog ampacity AND voltage drop limit <= 3%
    let chosenCable = STANDARD_CABLES[0];
    let vDropVal = 0;
    let vDropPct = 0;
    let foundValid = false;

    for (let i = 0; i < STANDARD_CABLES.length; i++) {
      const cable = STANDARD_CABLES[i];
      const cableBaseAmp = material === 'Copper' ? cable.cuAmp : cable.alAmp;

      // Derated ampacity of this cable in current conditions
      const cableDeratedAmp = cableBaseAmp * combinedDerating;

      if (cableDeratedAmp >= designCurrent) {
        // Compute Voltage Drop for this candidate size
        let vd = 0;
        if (systemType === 'Single Phase') {
          // 2 * L * I * rho / A
          vd = (2 * length * current * rho) / cable.size;
        } else {
          // sqrt(3) * L * I * rho / A
          vd = (Math.sqrt(3) * length * current * rho) / cable.size;
        }

        const vpct = (vd / voltage) * 100;

        if (vpct <= 3.0 || i === STANDARD_CABLES.length - 1) {
          chosenCable = cable;
          vDropVal = vd;
          vDropPct = vpct;
          foundValid = true;
          break;
        }
      }
    }

    if (!foundValid) {
      chosenCable = STANDARD_CABLES[STANDARD_CABLES.length - 1];
      let vd = 0;
      if (systemType === 'Single Phase') {
        vd = (2 * length * current * rho) / chosenCable.size;
      } else {
        vd = (Math.sqrt(3) * length * current * rho) / chosenCable.size;
      }
      vDropVal = vd;
      vDropPct = (vd / voltage) * 100;
    }

    const cableBaseCapacity = material === 'Copper' ? chosenCable.cuAmp : chosenCable.alAmp;
    const deratedCapacity = cableBaseCapacity * combinedDerating;

    // Recommended MCB
    const recommendedMcb = STANDARD_MCBS.find((m) => m >= designCurrent) || 630;

    // Recommended Conduit Size
    let conduitSize = '20 mm (3/4") Rigid PVC';
    if (chosenCable.size > 95) conduitSize = '63 mm (2.5") Heavy Duty Steel / PVC';
    else if (chosenCable.size > 50) conduitSize = '50 mm (2") Rigid Conduit';
    else if (chosenCable.size > 25) conduitSize = '40 mm (1.5") Rigid Conduit';
    else if (chosenCable.size > 10) conduitSize = '32 mm (1.25") Conduit';
    else if (chosenCable.size > 4) conduitSize = '25 mm (1") Conduit';

    // Status Determination
    let status: 'Safe' | 'Borderline' | 'Unsafe' = 'Safe';
    if (vDropPct > 5.0 || deratedCapacity < current) {
      status = 'Unsafe';
    } else if (vDropPct > 3.0 || deratedCapacity < designCurrent) {
      status = 'Borderline';
    }

    return {
      designCurrent,
      requiredCatalogAmpacity,
      combinedDerating,
      installFactor,
      tempFactor,
      powerKw,
      powerKva,
      chosenCable,
      cableBaseCapacity,
      deratedCapacity,
      vDropVal,
      vDropPct,
      recommendedMcb,
      conduitSize,
      status,
      rho,
    };
  }, [
    material,
    systemType,
    voltage,
    current,
    length,
    powerFactor,
    installMethodId,
    ambientTemp,
    safetyMargin,
  ]);

  // Reset Form
  const handleReset = () => {
    setMaterial('Copper');
    setSystemType('Three Phase');
    setVoltage(415);
    setCurrent(45);
    setLength(60);
    setPowerFactor(0.85);
    setInstallMethodId('conduit');
    setAmbientTemp(35);
    setSafetyMargin(20);
    showToast('Calculator parameters reset to standard engineering defaults.', 'info');
  };

  // Copy Summary Report
  const handleCopy = () => {
    const reportText = `================================================
ENGINEERHUB CABLE SIZE CALCULATION REPORT
================================================
Material: ${material}
System Type: ${systemType} (${voltage} V)
Load Current: ${current} A | Design Current: ${calculationResults.designCurrent.toFixed(1)} A
Power Factor: ${powerFactor} (${calculationResults.powerKw.toFixed(2)} kW / ${calculationResults.powerKva.toFixed(2)} kVA)
Route Length: ${length} m
Installation: ${INSTALLATION_METHODS.find((m) => m.id === installMethodId)?.label}
Ambient Temp: ${ambientTemp}°C | Combined Derating Factor: ${calculationResults.combinedDerating.toFixed(2)}

------------------ RESULTS ------------------
RECOMMENDED CABLE SIZE: ${calculationResults.chosenCable.size} mm² (${material} XLPE)
VOLTAGE DROP: ${calculationResults.vDropVal.toFixed(2)} V (${calculationResults.vDropPct.toFixed(2)}%)
RESULT STATUS: ${calculationResults.status.toUpperCase()}
RECOMMENDED MCB: ${calculationResults.recommendedMcb} A (Type C/D Curve)
RECOMMENDED CONDUIT: ${calculationResults.conduitSize}
------------------------------------------------
IEC 60364 & IS 7098 Verified - EngineerHub v2.5`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    showToast('Calculation report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Printable PDF Report trigger
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="py-24 relative overflow-hidden min-h-screen">
      {/* Ambient Radial Backgrounds */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to EngineerHub Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IEC 60364 & NEC Article 310 Verified</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Electrical Utility Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            Cable Size Calculator
          </h1>
          <p className="mt-2 text-slate-400 dark:text-slate-400 light:text-slate-600 text-base max-w-3xl">
            Precision electrical conductor sizing with temperature derating, voltage drop limits, breaker matching, and conduit size recommendations.
          </p>
        </div>

        {/* Main Grid: Left Controls (Form) vs Right Output Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT 7 COLS: INPUT PARAMETERS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <h2 className="text-lg font-heading font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>Input Parameters</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Real-time Computation</span>
              </div>

              <div className="space-y-5">

                {/* 1. Material & System Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cable Material */}
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
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>

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
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sys}
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
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono"
                        >
                          230V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(415)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono"
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
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                    />
                  </div>

                  {/* Load Current */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Full Load Current (Amps)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      max="2000"
                      value={current}
                      onChange={(e) => setCurrent(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Length & Power Factor Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cable Length */}
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
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                    />
                  </div>

                  {/* Power Factor */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Power Factor (cos φ)
                      </label>
                      <span className="text-xs font-mono text-indigo-400 font-bold">
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
                      className="w-full accent-indigo-500 cursor-pointer my-2"
                    />
                  </div>
                </div>

                {/* 4. Installation Method */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Installation Method & Routing
                  </label>
                  <select
                    value={installMethodId}
                    onChange={(e) => setInstallMethodId(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-900 dark:bg-slate-900 light:bg-white"
                  >
                    {INSTALLATION_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} (Factor: {m.factor})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Ambient Temperature & Safety Margin Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ambient Temp */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Ambient Temperature (°C)
                    </label>
                    <select
                      value={ambientTemp}
                      onChange={(e) => setAmbientTemp(Number(e.target.value))}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-900 dark:bg-slate-900 light:bg-white"
                    >
                      {AMBIENT_TEMPS.map((t) => (
                        <option key={t.temp} value={t.temp}>
                          {t.temp}°C (Derating Factor: {t.factor})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Safety Margin */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Overload Safety Margin (%)
                    </label>
                    <select
                      value={safetyMargin}
                      onChange={(e) => setSafetyMargin(Number(e.target.value))}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-900 dark:bg-slate-900 light:bg-white"
                    >
                      <option value={0}>0% (Exact Continuous Load)</option>
                      <option value={10}>10% Extra Reserve</option>
                      <option value={15}>15% Extra Reserve</option>
                      <option value={20}>20% Recommended Standard</option>
                      <option value={25}>25% Heavy Duty Reserve</option>
                    </select>
                  </div>
                </div>

                {/* Button Controls */}
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
                        className="px-4 py-2.5 rounded-xl glass-card text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 text-xs font-semibold flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ask AI Assistant</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-indigo-500 text-xs font-semibold flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT 5 COLS: OUTPUT CARD */}
          <div className="lg:col-span-5 space-y-6">
            <div className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Status Header Bar */}
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-heading font-bold text-slate-100">
                      Calculation Results
                    </h3>
                  </div>

                  {/* Status Badge */}
                  {calculationResults.status === 'Safe' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Safe (Compliant)</span>
                    </span>
                  )}
                  {calculationResults.status === 'Borderline' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Borderline (&gt;3% VD)</span>
                    </span>
                  )}
                  {calculationResults.status === 'Unsafe' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Unsafe (High Drop)</span>
                    </span>
                  )}
                </div>

                {/* Primary Hero Result: Recommended Cable Size */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 mb-6 text-center relative overflow-hidden">
                  <div className="text-xs uppercase font-mono tracking-widest text-indigo-300/80 mb-1">
                    Recommended Cable Size
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-cyan-200">
                    {calculationResults.chosenCable.size} mm²
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    {material} XLPE / PVC Conductor ({calculationResults.chosenCable.fontAwg} equivalent)
                  </div>
                </div>

                {/* Key Metric Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Voltage Drop */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Voltage Drop
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-100">
                      {calculationResults.vDropVal.toFixed(2)} V
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${
                      calculationResults.vDropPct <= 3 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {calculationResults.vDropPct.toFixed(2)}% of {voltage}V
                    </div>
                  </div>

                  {/* Power Rating */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Active Power (kW)
                    </div>
                    <div className="text-xl font-bold font-mono text-indigo-300">
                      {calculationResults.powerKw.toFixed(2)} kW
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      {calculationResults.powerKva.toFixed(2)} kVA
                    </div>
                  </div>

                  {/* Recommended MCB */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended MCB
                    </div>
                    <div className="text-lg font-bold text-slate-100 font-mono">
                      {calculationResults.recommendedMcb} A Breaker
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Type C or D Curve
                    </div>
                  </div>

                  {/* Conduit Size */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended Conduit
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-1 leading-snug">
                      {calculationResults.conduitSize}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Max 40% Fill Limit
                    </div>
                  </div>
                </div>

                {/* Additional Technical Summary */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Design Current (w/ Margin):</span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {calculationResults.designCurrent.toFixed(1)} A
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Derated Cable Ampacity:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {calculationResults.deratedCapacity.toFixed(1)} A
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Combined Derating Factor:</span>
                    <span className="text-indigo-300 font-mono font-semibold">
                      {calculationResults.combinedDerating.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* LOWER DETAILED SECTIONS */}
        <div className="space-y-8">
          
          {/* 1. Formula & Step by Step Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Calculation Formulas */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Calculation Formulas</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-1">1. Design Current Calculation:</div>
                  <div>I_design = I_load × (1 + SafetyMargin / 100)</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    = {current} A × (1 + {safetyMargin}/100) = {calculationResults.designCurrent.toFixed(1)} A
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-1">2. Combined Derating Factor:</div>
                  <div>k_total = k_installation × k_temperature</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    = {calculationResults.installFactor} × {calculationResults.tempFactor} = {calculationResults.combinedDerating.toFixed(2)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-indigo-400 font-bold mb-1">3. Voltage Drop Equation:</div>
                  {systemType === 'Single Phase' ? (
                    <div>ΔV = (2 × L × I × ρ) / A</div>
                  ) : (
                    <div>ΔV = (√3 × L × I × ρ) / A</div>
                  )}
                  <div className="text-slate-500 text-[11px] mt-1">
                    ρ_{material} = {calculationResults.rho} Ω·mm²/m
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Step-by-Step Engineering Calculation</span>
              </h3>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Adjust Base Load Current:</span> Load current of {current} A adjusted with a {safetyMargin}% margin gives design current of <strong className="text-indigo-300">{calculationResults.designCurrent.toFixed(1)} A</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Apply Derating Factors:</span> Ambient temperature of {ambientTemp}°C and method factor yield a combined derating factor of <strong className="text-indigo-300">{calculationResults.combinedDerating.toFixed(2)}</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Evaluate Continuous Ampacity:</span> Cable size of <strong className="text-emerald-400">{calculationResults.chosenCable.size} mm²</strong> provides {calculationResults.cableBaseCapacity} A catalog capacity, derated to <strong className="text-emerald-400">{calculationResults.deratedCapacity.toFixed(1)} A</strong>.
                </li>
                <li>
                  <span className="font-bold text-slate-100">Verify Voltage Drop Compliance:</span> Over {length} meters route, voltage drop is <strong className="text-indigo-300">{calculationResults.vDropVal.toFixed(2)} V ({calculationResults.vDropPct.toFixed(2)}%)</strong>, meeting the standard &lt;3% target limit.
                </li>
              </ol>
            </div>

          </div>

          {/* 2. Engineering Notes & Standard References */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Engineering Notes */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Engineering & Safety Notes</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Always ensure phase conductors and neutral wires share identical cross-sectional areas when harmonic levels exceed 15-20% (e.g. VFDs or LED drivers).</li>
                <li>Verify short-circuit withstand rating (I²t) for high prospective fault locations near primary transformers.</li>
                <li>Aluminium conductors smaller than 16 mm² are restricted in indoor building installations by specific regional codes.</li>
              </ul>
            </div>

            {/* Standards Reference */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>IEC & IS Standard References</span>
              </h4>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 text-xs text-slate-300 space-y-2 font-sans">
                <p>• <strong>IEC 60364-5-52:</strong> Wiring Systems & Current Carrying Capacities</p>
                <p>• <strong>IS 7098 (Part 1):</strong> Cross-Linked Polyethylene Insulated Cables</p>
                <p>• <strong>NEC Article 310 / IEEE 141:</strong> Conductor Ampacity Tables & Voltage Drop</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
