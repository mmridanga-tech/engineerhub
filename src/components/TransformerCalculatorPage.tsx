import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Download,
  Info,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Cpu,
  Gauge,
  Printer,
  ChevronDown,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TransformerCalculatorPageProps {
  onBackToHome: () => void;
  onOpenAIAssistant: () => void;
  onOpenCableSizeCalculator?: () => void;
  onOpenVoltageDropCalculator?: () => void;
  onOpenLoadCalculator?: () => void;
  onOpenMotorCalculator?: () => void;
}

// Preset Transformer Configuration Type
interface TransformerPreset {
  name: string;
  ratingValue: number;
  ratingUnit: 'kVA' | 'MVA';
  primaryVoltage: number;
  secondaryVoltage: number;
  systemType: 'Three Phase' | 'Single Phase';
  cableMaterial: 'Copper' | 'Aluminium';
  powerFactor: number;
  efficiency: number;
  ambientTemp: number;
  impedanceZ: number;
  description: string;
}

const PRESETS: TransformerPreset[] = [
  {
    name: '25 kVA Distribution',
    ratingValue: 25,
    ratingUnit: 'kVA',
    primaryVoltage: 11000,
    secondaryVoltage: 415,
    systemType: 'Three Phase',
    cableMaterial: 'Copper',
    powerFactor: 0.85,
    efficiency: 98.0,
    ambientTemp: 40,
    impedanceZ: 4.5,
    description: 'Rural & small commercial pole-mounted distribution transformer',
  },
  {
    name: '63 kVA Commercial',
    ratingValue: 63,
    ratingUnit: 'kVA',
    primaryVoltage: 11000,
    secondaryVoltage: 415,
    systemType: 'Three Phase',
    cableMaterial: 'Copper',
    powerFactor: 0.85,
    efficiency: 98.2,
    ambientTemp: 40,
    impedanceZ: 4.5,
    description: 'Small commercial building / office feeder transformer',
  },
  {
    name: '160 kVA Industrial',
    ratingValue: 160,
    ratingUnit: 'kVA',
    primaryVoltage: 11000,
    secondaryVoltage: 415,
    systemType: 'Three Phase',
    cableMaterial: 'Copper',
    powerFactor: 0.85,
    efficiency: 98.5,
    ambientTemp: 40,
    impedanceZ: 4.5,
    description: 'Medium industrial shopfloor & manufacturing distribution transformer',
  },
  {
    name: '500 kVA Substation',
    ratingValue: 500,
    ratingUnit: 'kVA',
    primaryVoltage: 11000,
    secondaryVoltage: 415,
    systemType: 'Three Phase',
    cableMaterial: 'Copper',
    powerFactor: 0.90,
    efficiency: 98.8,
    ambientTemp: 40,
    impedanceZ: 5.0,
    description: 'Commercial complex & heavy manufacturing step-down substation',
  },
  {
    name: '1000 kVA Power',
    ratingValue: 1000,
    ratingUnit: 'kVA',
    primaryVoltage: 33000,
    secondaryVoltage: 415,
    systemType: 'Three Phase',
    cableMaterial: 'Copper',
    powerFactor: 0.90,
    efficiency: 99.1,
    ambientTemp: 40,
    impedanceZ: 5.75,
    description: 'Heavy industrial plant & main grid indoor power transformer',
  },
];

// Standard XLPE Ampacity Reference Table (IEC 60364-5-52)
const CABLE_TABLE = [
  { size: 1.5, cuAmp: 20, alAmp: 15 },
  { size: 2.5, cuAmp: 28, alAmp: 21 },
  { size: 4, cuAmp: 37, alAmp: 28 },
  { size: 6, cuAmp: 48, alAmp: 36 },
  { size: 10, cuAmp: 66, alAmp: 50 },
  { size: 16, cuAmp: 88, alAmp: 67 },
  { size: 25, cuAmp: 117, alAmp: 89 },
  { size: 35, cuAmp: 144, alAmp: 110 },
  { size: 50, cuAmp: 175, alAmp: 134 },
  { size: 70, cuAmp: 222, alAmp: 171 },
  { size: 95, cuAmp: 269, alAmp: 207 },
  { size: 120, cuAmp: 312, alAmp: 239 },
  { size: 150, cuAmp: 355, alAmp: 272 },
  { size: 185, cuAmp: 403, alAmp: 310 },
  { size: 240, cuAmp: 475, alAmp: 364 },
  { size: 300, cuAmp: 540, alAmp: 415 },
  { size: 400, cuAmp: 625, alAmp: 480 },
  { size: 500, cuAmp: 710, alAmp: 545 },
  { size: 630, cuAmp: 810, alAmp: 620 },
];

export const TransformerCalculatorPage: React.FC<TransformerCalculatorPageProps> = ({
  onBackToHome,
  onOpenAIAssistant,
  onOpenCableSizeCalculator,
  onOpenVoltageDropCalculator,
  onOpenLoadCalculator,
  onOpenMotorCalculator,
}) => {
  const { showToast } = useTheme();

  // Input States
  const [ratingValue, setRatingValue] = useState<number>(500);
  const [ratingUnit, setRatingUnit] = useState<'kVA' | 'MVA'>('kVA');
  const [primaryVoltage, setPrimaryVoltage] = useState<number>(11000);
  const [secondaryVoltage, setSecondaryVoltage] = useState<number>(415);
  const [systemType, setSystemType] = useState<'Three Phase' | 'Single Phase'>('Three Phase');
  const [cableMaterial, setCableMaterial] = useState<'Copper' | 'Aluminium'>('Copper');
  const [installationMethod, setInstallationMethod] = useState<string>('Air');
  const [ambientTemp, setAmbientTemp] = useState<number>(40);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [efficiency, setEfficiency] = useState<number>(98.5);
  const [impedanceZ, setImpedanceZ] = useState<number>(5.0);
  const [futureExpansion, setFutureExpansion] = useState<number>(15);

  // UI state
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'derivation' | 'standards'>('overview');

  // Apply Preset
  const handleApplyPreset = (preset: TransformerPreset) => {
    setRatingValue(preset.ratingValue);
    setRatingUnit(preset.ratingUnit);
    setPrimaryVoltage(preset.primaryVoltage);
    setSecondaryVoltage(preset.secondaryVoltage);
    setSystemType(preset.systemType);
    setCableMaterial(preset.cableMaterial);
    setPowerFactor(preset.powerFactor);
    setEfficiency(preset.efficiency);
    setAmbientTemp(preset.ambientTemp);
    setImpedanceZ(preset.impedanceZ);
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  // Calculations Engine
  const calculationResults = useMemo(() => {
    // 1. Total Power Sizing in kVA & VA
    const totalKva = ratingUnit === 'MVA' ? ratingValue * 1000 : ratingValue;
    const totalVa = totalKva * 1000;

    // 2. Full Load Current (FLC)
    let ip = 0; // Primary FLC (Amps)
    let is = 0; // Secondary FLC (Amps)

    if (systemType === 'Single Phase') {
      // I = S / V
      ip = totalVa / primaryVoltage;
      is = totalVa / secondaryVoltage;
    } else {
      // Three Phase: I = S / (sqrt(3) * V)
      ip = totalVa / (Math.sqrt(3) * primaryVoltage);
      is = totalVa / (Math.sqrt(3) * secondaryVoltage);
    }

    // Expanded FLC (+ Future expansion %)
    const ipExp = ip * (1 + futureExpansion / 100);
    const isExp = is * (1 + futureExpansion / 100);

    // Turns / Voltage Ratio
    const turnsRatio = primaryVoltage / secondaryVoltage;

    // 3. Thermal Derating
    let tempDerating = 1.0;
    if (ambientTemp >= 55) tempDerating = 0.76;
    else if (ambientTemp >= 50) tempDerating = 0.82;
    else if (ambientTemp >= 45) tempDerating = 0.87;
    else if (ambientTemp >= 40) tempDerating = 0.91;
    else if (ambientTemp >= 35) tempDerating = 0.96;

    let installDerating = 1.0;
    if (installationMethod === 'Underground Conduit') installDerating = 0.85;
    else if (installationMethod === 'Cable Tray') installDerating = 0.95;
    else if (installationMethod === 'Direct Buried') installDerating = 0.80;

    const combinedDerating = tempDerating * installDerating;

    // Cable Ampacity Requirements (125% continuous feeder rule)
    const reqAmpPrimary = (ipExp * 1.25) / combinedDerating;
    const reqAmpSecondary = (isExp * 1.25) / combinedDerating;

    // 4. Primary Cable Sizing
    const selectCable = (reqAmp: number, mat: 'Copper' | 'Aluminium') => {
      // Determine single or parallel runs
      let runCount = 1;
      let singleReqAmp = reqAmp;

      if (reqAmp > 630) {
        runCount = Math.ceil(reqAmp / 500);
        singleReqAmp = reqAmp / runCount;
      }

      let selectedSize = 300;
      let selectedAmpacity = 540;

      for (let i = 0; i < CABLE_TABLE.length; i++) {
        const row = CABLE_TABLE[i];
        const amp = mat === 'Copper' ? row.cuAmp : row.alAmp;
        if (amp >= singleReqAmp) {
          selectedSize = row.size;
          selectedAmpacity = amp;
          break;
        }
      }

      return {
        runCount,
        size: selectedSize,
        singleAmpacity: selectedAmpacity,
        totalAmpacity: selectedAmpacity * runCount,
        description: runCount > 1 ? `${runCount}x (${selectedSize} mm²)` : `${selectedSize} mm²`,
      };
    };

    const primaryCuCable = selectCable(reqAmpPrimary, 'Copper');
    const primaryAlCable = selectCable(reqAmpPrimary, 'Aluminium');
    const secondaryCuCable = selectCable(reqAmpSecondary, 'Copper');
    const secondaryAlCable = selectCable(reqAmpSecondary, 'Aluminium');

    const selectedPrimaryCable = cableMaterial === 'Copper' ? primaryCuCable : primaryAlCable;
    const selectedSecondaryCable = cableMaterial === 'Copper' ? secondaryCuCable : secondaryAlCable;

    // 5. Recommended LV Busbar Size (Secondary side for high currents)
    // Copper busbar density ~ 1.5 A/mm², Aluminium ~ 0.9 A/mm²
    const reqBusbarAreaCu = isExp / 1.5;
    const reqBusbarAreaAl = isExp / 0.9;

    let cuBusbarSpec = '25 x 5 mm (125 mm²)';
    if (reqBusbarAreaCu > 2000) cuBusbarSpec = '4 x (100 x 10 mm) Cu';
    else if (reqBusbarAreaCu > 1000) cuBusbarSpec = '2 x (100 x 10 mm) Cu';
    else if (reqBusbarAreaCu > 600) cuBusbarSpec = '100 x 10 mm Cu (1000 mm²)';
    else if (reqBusbarAreaCu > 400) cuBusbarSpec = '80 x 8 mm Cu (640 mm²)';
    else if (reqBusbarAreaCu > 250) cuBusbarSpec = '50 x 6 mm Cu (300 mm²)';
    else if (reqBusbarAreaCu > 100) cuBusbarSpec = '30 x 5 mm Cu (150 mm²)';

    let alBusbarSpec = '30 x 6 mm (180 mm²)';
    if (reqBusbarAreaAl > 2000) alBusbarSpec = '4 x (100 x 12 mm) Al';
    else if (reqBusbarAreaAl > 1000) alBusbarSpec = '2 x (100 x 10 mm) Al';
    else if (reqBusbarAreaAl > 600) alBusbarSpec = '100 x 12 mm Al (1200 mm²)';
    else if (reqBusbarAreaAl > 400) alBusbarSpec = '80 x 10 mm Al (800 mm²)';
    else if (reqBusbarAreaAl > 250) alBusbarSpec = '60 x 8 mm Al (480 mm²)';

    // 6. Protective Earth (PE) & Neutral Sizing
    let peCableSize = 16;
    if (selectedSecondaryCable.size <= 16) peCableSize = selectedSecondaryCable.size;
    else if (selectedSecondaryCable.size <= 35) peCableSize = 16;
    else peCableSize = Math.max(16, Math.ceil(selectedSecondaryCable.size / 2));

    const earthStripSpec = totalKva >= 500 ? '50 x 6 mm GI Earth Flat Strip (Dual Pit)' : '25 x 3 mm Cu Earth Strip';

    // 7. Protective Switchgear Recommendations
    // Primary Protection
    let primaryProtection = 'MV VCB (Vacuum Circuit Breaker) / HV Fuse';
    let primaryBreakerRating = Math.ceil(ip * 1.25);
    if (primaryVoltage < 1000) {
      primaryProtection = `MCCB / MPCB rated @ ${primaryBreakerRating} A`;
    } else {
      primaryProtection = `HV HT Fuse / VCB @ ${primaryBreakerRating} A (Breaking capacity 25kA)`;
    }

    // Secondary Protection
    let secondaryProtection = 'MCCB / ACB';
    let secondaryBreakerRating = Math.ceil(is * 1.25);
    if (is <= 125) {
      secondaryProtection = `MCB / MCCB ${secondaryBreakerRating} A (Curve C/D)`;
    } else if (is <= 800) {
      secondaryProtection = `MCCB ${secondaryBreakerRating} A (Adjustable Microprocessor Release)`;
    } else {
      secondaryProtection = `ACB (Air Circuit Breaker) ${secondaryBreakerRating} A (4-Pole LSIG Protection)`;
    }

    // 8. Transformer Losses & Efficiency Model (IS 1180 / IEC 60076)
    // No load loss P0 ~ 0.20% of kVA, Load loss Pk ~ 1.2% of kVA
    const p0Kw = totalKva * 0.002; // Core loss
    const pkKw = totalKva * 0.012; // Copper loss at 100% load

    // Total Loss at loads
    const loss50Kw = p0Kw + Math.pow(0.5, 2) * pkKw;
    const loss75Kw = p0Kw + Math.pow(0.75, 2) * pkKw;
    const loss100Kw = p0Kw + Math.pow(1.0, 2) * pkKw;

    // Active power output at load x (P = x * S * cos phi)
    const pOut50Kw = 0.5 * totalKva * powerFactor;
    const pOut75Kw = 0.75 * totalKva * powerFactor;
    const pOut100Kw = 1.0 * totalKva * powerFactor;

    // Efficiency at loads
    const eff50 = (pOut50Kw / (pOut50Kw + loss50Kw)) * 100;
    const eff75 = (pOut75Kw / (pOut75Kw + loss75Kw)) * 100;
    const eff100 = (pOut100Kw / (pOut100Kw + loss100Kw)) * 100;

    // Max Efficiency Load Ratio (x_max = sqrt(P0/Pk))
    const maxEffLoadRatio = Math.sqrt(p0Kw / pkKw) * 100;

    // Short Circuit Current
    const shortCircuitCurrentKA = (is / (impedanceZ / 100)) / 1000;

    // Voltage Regulation
    // %VR = %R * cos(phi) + %X * sin(phi)
    const percentR = (pkKw / totalKva) * 100;
    const percentX = Math.sqrt(Math.max(0, Math.pow(impedanceZ, 2) - Math.pow(percentR, 2)));
    const sinPhi = Math.sqrt(1 - Math.pow(powerFactor, 2));
    const voltageRegulationPercent = percentR * powerFactor + percentX * sinPhi;

    // Cooling Recommendation
    let coolingMethod = 'ONAN (Oil Natural Air Natural)';
    if (totalKva <= 100) coolingMethod = 'ONAN / Dry-Type AN (Natural Air Cooling)';
    else if (totalKva <= 2500) coolingMethod = 'ONAN (Oil Natural Air Natural) Radiator Cooled';
    else coolingMethod = 'ONAF (Oil Natural Air Forced) Fans & Pump Assembly';

    return {
      totalKva,
      totalVa,
      ip,
      is,
      ipExp,
      isExp,
      turnsRatio,
      combinedDerating,
      primaryCuCable,
      primaryAlCable,
      secondaryCuCable,
      secondaryAlCable,
      selectedPrimaryCable,
      selectedSecondaryCable,
      cuBusbarSpec,
      alBusbarSpec,
      peCableSize,
      earthStripSpec,
      primaryProtection,
      primaryBreakerRating,
      secondaryProtection,
      secondaryBreakerRating,
      p0Kw,
      pkKw,
      loss100Kw,
      eff50,
      eff75,
      eff100,
      maxEffLoadRatio,
      shortCircuitCurrentKA,
      voltageRegulationPercent,
      coolingMethod,
    };
  }, [ratingValue, ratingUnit, primaryVoltage, secondaryVoltage, systemType, cableMaterial, installationMethod, ambientTemp, powerFactor, impedanceZ, futureExpansion]);

  // Executive Engineering Report Text
  const engineeringSummary = useMemo(() => {
    return `Transformer feeder and switchgear design for a ${calculationResults.totalKva} kVA ${systemType} transformer (${primaryVoltage}V / ${secondaryVoltage}V, %Z=${impedanceZ}%, cos φ=${powerFactor}). The calculated primary Full Load Current (FLC) is ${calculationResults.ip.toFixed(2)} A and secondary FLC is ${calculationResults.is.toFixed(2)} A (expanded secondary design current: ${calculationResults.isExp.toFixed(2)} A with +${futureExpansion}% future expansion buffer). Under NEC 450 & IEC 60364-5-52 continuous duty guidelines and ${ambientTemp}°C thermal derating, the primary circuit requires ${calculationResults.selectedPrimaryCable.description} ${cableMaterial} XLPE cables protected by a ${calculationResults.primaryProtection}. The secondary LV distribution circuit requires ${calculationResults.selectedSecondaryCable.description} ${cableMaterial} XLPE cables or ${cableMaterial === 'Copper' ? calculationResults.cuBusbarSpec : calculationResults.alBusbarSpec} busbars, backed by a ${calculationResults.secondaryProtection}. System earthing is provisioned via a ${calculationResults.peCableSize} mm² PE conductor and ${calculationResults.earthStripSpec}. Recommended transformer thermal cooling class is ${calculationResults.coolingMethod}, exhibiting an operating efficiency of ${calculationResults.eff100.toFixed(2)}% at full load and peak efficiency at ${calculationResults.maxEffLoadRatio.toFixed(1)}% loading. Estimated short-circuit current capability is ${calculationResults.shortCircuitCurrentKA.toFixed(2)} kA with a voltage regulation of ${calculationResults.voltageRegulationPercent.toFixed(2)}%.`;
  }, [calculationResults, systemType, primaryVoltage, secondaryVoltage, impedanceZ, powerFactor, futureExpansion, ambientTemp, cableMaterial]);

  // Reset function
  const handleReset = () => {
    setRatingValue(500);
    setRatingUnit('kVA');
    setPrimaryVoltage(11000);
    setSecondaryVoltage(415);
    setSystemType('Three Phase');
    setCableMaterial('Copper');
    setInstallationMethod('Air');
    setAmbientTemp(40);
    setPowerFactor(0.85);
    setEfficiency(98.5);
    setImpedanceZ(5.0);
    setFutureExpansion(15);
    showToast('Transformer parameters reset to default 500 kVA substation specs.', 'info');
  };

  // Generate full text report
  const generateReportText = () => {
    return `================================================================================
                    ENGINEERHUB CONSULTING • TRANSFORMER DATASHEET
                         IEC 60076 & NEC 450 ENGINEERING REPORT
================================================================================
Document Ref : EH-TRF-${calculationResults.totalKva}KVA-${primaryVoltage}V-${secondaryVoltage}V
Generated On : ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

--------------------------------------------------------------------------------
1. TRANSFORMER INPUT SPECIFICATIONS
--------------------------------------------------------------------------------
Transformer Power Rating     : ${calculationResults.totalKva} kVA (${(calculationResults.totalKva / 1000).toFixed(3)} MVA)
System Voltage Topology      : ${systemType} (Primary: ${primaryVoltage} V / Secondary: ${secondaryVoltage} V)
Turns Voltage Ratio (a)      : ${calculationResults.turnsRatio.toFixed(2)} : 1
Percent Impedance (%Z)       : ${impedanceZ}%
Power Factor (cos φ)          : ${powerFactor}
Selected Cable Material       : ${cableMaterial}
Installation Routing         : ${installationMethod} (Ambient Temp: ${ambientTemp} °C)
Future Design Expansion      : +${futureExpansion}%

--------------------------------------------------------------------------------
2. CALCULATED ELECTRICAL RESULTS
--------------------------------------------------------------------------------
Primary Full Load Current (Ip) : ${calculationResults.ip.toFixed(2)} Amps
Primary Design Current (+${futureExpansion}%): ${calculationResults.ipExp.toFixed(2)} Amps

Secondary Full Load Current(Is): ${calculationResults.is.toFixed(2)} Amps
Secondary Design Current (+${futureExpansion}%): ${calculationResults.isExp.toFixed(2)} Amps

Short Circuit Current (Isc)    : ${calculationResults.shortCircuitCurrentKA.toFixed(2)} kA

Recommended Phase Cable Sizing:
  - Primary HV Phase Cable    : ${calculationResults.selectedPrimaryCable.description} ${cableMaterial} XLPE
  - Secondary LV Phase Cable  : ${calculationResults.selectedSecondaryCable.description} ${cableMaterial} XLPE
  - Secondary LV Busbar Size  : ${calculationResults.cuBusbarSpec} (Copper) / ${calculationResults.alBusbarSpec} (Aluminium)

Earthing & Protective Neutral:
  - Protective Earth (PE)     : ${calculationResults.peCableSize} mm² Cu
  - Substation Earth Flat     : ${calculationResults.earthStripSpec}

Protective Switchgear Recommendations:
  - Primary HT/HV Switchgear  : ${calculationResults.primaryProtection}
  - Secondary LV Switchgear   : ${calculationResults.secondaryProtection}

Thermal & Efficiency Performance:
  - Core / No-Load Loss (P0)  : ${calculationResults.p0Kw.toFixed(2)} kW
  - Copper / Load Loss (Pk)   : ${calculationResults.pkKw.toFixed(2)} kW
  - Full Load Efficiency η(100): ${calculationResults.eff100.toFixed(2)}%
  - Peak Efficiency Load Point: ${calculationResults.maxEffLoadRatio.toFixed(1)}% Load
  - Voltage Regulation        : ${calculationResults.voltageRegulationPercent.toFixed(2)}%
  - Recommended Cooling Class : ${calculationResults.coolingMethod}

--------------------------------------------------------------------------------
3. EXECUTIVE DESIGN SUMMARY
--------------------------------------------------------------------------------
${engineeringSummary}

--------------------------------------------------------------------------------
4. CODE STANDARDS & COMPLIANCE REFERENCES
--------------------------------------------------------------------------------
• IEC 60076-1 to 5  : Power Transformers - General, Temperature Rise & Short Circuit
• IEC 60364-5-52    : Low-Voltage Electrical Installations - Wiring Systems & Ampacity
• IS 1180 (Part 1)  : Outdoor Type Oil Immersed Distribution Transformers Specifications
• NEC Article 450    : Transformers and Transformer Vaults Safety Regulations
• IEEE C57.12.00    : Standard General Requirements for Liquid-Immersed Distribution Transformers

================================================================================
Certified by EngineerHub Electrical Calculation Engine v2.5
================================================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    showToast('Transformer calculation report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportTxt = () => {
    const reportText = generateReportText();
    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `EngineerHub_Transformer_Datasheet_${calculationResults.totalKva}kVA.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Transformer report exported as text file!', 'success');
  };

  return (
    <div className="py-24 relative overflow-hidden min-h-screen">
      {/* Background Radial Glow Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-600/10 via-cyan-600/10 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TOP NAVIGATION / BREADCRUMB BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Tools</span>
          </button>

          {/* Quick Switch Calculator Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenCableSizeCalculator && (
              <button
                type="button"
                onClick={onOpenCableSizeCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cable Size</span>
              </button>
            )}
            {onOpenVoltageDropCalculator && (
              <button
                type="button"
                onClick={onOpenVoltageDropCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voltage Drop</span>
              </button>
            )}
            {onOpenLoadCalculator && (
              <button
                type="button"
                onClick={onOpenLoadCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 text-xs font-semibold cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Calc</span>
              </button>
            )}
            {onOpenMotorCalculator && (
              <button
                type="button"
                onClick={onOpenMotorCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motor Current</span>
              </button>
            )}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IEC 60076 & NEC 450 Compliant</span>
            </span>
          </div>
        </div>

        {/* HEADER TITLE SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Power & Distribution Switchgear Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 tracking-tight mb-3">
            Transformer Calculator
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Calculate transformer current, cable sizing, protection devices, busbar sizing, losses, and engineering recommendations.
          </p>
        </div>

        {/* QUICK PRESETS SELECTION BAR */}
        <div className="mb-10 p-4 rounded-3xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Transformer Rating Presets:</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PRESETS.map((preset) => {
              const isSelected = ratingValue === preset.ratingValue && ratingUnit === preset.ratingUnit;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold font-mono text-slate-100">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN TWO-COLUMN WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PARAMETER INPUT CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-heading">
                      Transformer Parameters
                    </h3>
                    <p className="text-[11px] text-slate-400">Configure ratings & site conditions</p>
                  </div>
                </div>
              </div>

              {/* Input 1: Rating Value & Unit Toggle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Transformer Rating</label>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRatingUnit('kVA')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${ratingUnit === 'kVA' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                      kVA
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingUnit('MVA')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${ratingUnit === 'MVA' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                      MVA
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={ratingUnit === 'MVA' ? 100 : 100000}
                    value={ratingValue}
                    onChange={(e) => setRatingValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-slate-500">
                    {ratingUnit}
                  </span>
                </div>
              </div>

              {/* Input 2: Primary & Secondary Voltages */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Voltage (V)</label>
                  <select
                    value={primaryVoltage}
                    onChange={(e) => setPrimaryVoltage(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value={33000}>33,000 V (33kV HT)</option>
                    <option value={22000}>22,000 V (22kV HT)</option>
                    <option value={11000}>11,000 V (11kV HT)</option>
                    <option value={6600}>6,600 V (6.6kV)</option>
                    <option value={3300}>3,300 V (3.3kV)</option>
                    <option value={415}>415 V (LV 3-Phase)</option>
                    <option value={230}>230 V (LV 1-Phase)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Secondary Voltage (V)</label>
                  <select
                    value={secondaryVoltage}
                    onChange={(e) => setSecondaryVoltage(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value={11000}>11,000 V (11kV)</option>
                    <option value={6600}>6,600 V (6.6kV)</option>
                    <option value={3300}>3,300 V (3.3kV)</option>
                    <option value={415}>415 V (LV 3-Phase)</option>
                    <option value={230}>230 V (LV 1-Phase)</option>
                    <option value={110}>110 V (Control LV)</option>
                  </select>
                </div>
              </div>

              {/* Input 3: System Phase & Conductor Material */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">System Topology</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSystemType('Three Phase')}
                      className={`py-1.5 rounded-lg transition-all ${systemType === 'Three Phase' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      3-Phase
                    </button>
                    <button
                      type="button"
                      onClick={() => setSystemType('Single Phase')}
                      className={`py-1.5 rounded-lg transition-all ${systemType === 'Single Phase' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      1-Phase
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cable Material</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCableMaterial('Copper')}
                      className={`py-1.5 rounded-lg transition-all ${cableMaterial === 'Copper' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Copper
                    </button>
                    <button
                      type="button"
                      onClick={() => setCableMaterial('Aluminium')}
                      className={`py-1.5 rounded-lg transition-all ${cableMaterial === 'Aluminium' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Aluminium
                    </button>
                  </div>
                </div>
              </div>

              {/* Input 4: Installation Method & Ambient Temperature */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Installation Routing</label>
                  <select
                    value={installationMethod}
                    onChange={(e) => setInstallationMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Air">In Air / Perforated Tray</option>
                    <option value="Underground Conduit">Underground Duct / Conduit</option>
                    <option value="Cable Tray">Enclosed Cable Trench</option>
                    <option value="Direct Buried">Direct Buried Earth</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={ambientTemp}
                    onChange={(e) => setAmbientTemp(parseFloat(e.target.value) || 40)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Input 5: Power Factor & Percent Impedance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Power Factor (cos φ)</label>
                  <input
                    type="number"
                    step={0.01}
                    min={0.5}
                    max={1.0}
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(parseFloat(e.target.value) || 0.85)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Impedance (%Z)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={1.0}
                    max={15.0}
                    value={impedanceZ}
                    onChange={(e) => setImpedanceZ(parseFloat(e.target.value) || 5.0)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Input 6: Future Expansion % */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Design Future Expansion Buffer</label>
                  <span className="text-xs font-mono font-bold text-cyan-400">+{futureExpansion}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={futureExpansion}
                  onChange={(e) => setFutureExpansion(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Action AI Button */}
              <button
                type="button"
                onClick={onOpenAIAssistant}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Ask AI About This Transformer Sizing</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CALCULATED RESULTS & CARDS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* HERO CALCULATION HIGHLIGHT BOX */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Secondary Current Main Hero Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Secondary Full Load Current (LV FLC)
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300 tracking-tight flex items-baseline gap-2">
                      <span>{calculationResults.is.toFixed(2)}</span>
                      <span className="text-lg font-sans text-cyan-400 font-semibold">Amps</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Design Continuous FLC (+{futureExpansion}% expansion): <strong className="text-slate-200">{calculationResults.isExp.toFixed(2)} A</strong>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Primary Full Load Current (HV FLC)
                    </span>
                    <div className="text-2xl font-bold font-mono text-indigo-300">
                      {calculationResults.ip.toFixed(2)} A
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      HV Voltage: {primaryVoltage} V
                    </div>
                  </div>
                </div>

                {/* Key Electrical Output Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Primary & Secondary Cable Sizes */}
                  <div className="col-span-2 p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase font-semibold text-slate-400">
                        Recommended Cable Sizing (XLPE 3-Core / 4-Core)
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        PE: {calculationResults.peCableSize} mm² Cu
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold">Primary HV Cable</div>
                        <div className="text-sm font-bold text-indigo-300 mt-0.5">{calculationResults.selectedPrimaryCable.description} {cableMaterial}</div>
                        <div className="text-[10px] text-slate-400">Ampacity: {calculationResults.selectedPrimaryCable.totalAmpacity} A</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                        <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold">Secondary LV Cable</div>
                        <div className="text-sm font-bold text-cyan-200 mt-0.5">{calculationResults.selectedSecondaryCable.description} {cableMaterial}</div>
                        <div className="text-[10px] text-slate-400">Ampacity: {calculationResults.selectedSecondaryCable.totalAmpacity} A</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Busbar Size */}
                  <div className="col-span-2 p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Recommended LV Secondary Busbar Trunking
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>{cableMaterial === 'Copper' ? calculationResults.cuBusbarSpec : calculationResults.alBusbarSpec}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Required Density Rating for {calculationResults.isExp.toFixed(1)} A LV Trunking
                    </div>
                  </div>

                  {/* Switchgear Protection */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Primary HT Switchgear
                    </div>
                    <div className="text-xs font-bold text-slate-100 font-mono">
                      {calculationResults.primaryProtection}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Secondary LV Breaker
                    </div>
                    <div className="text-xs font-bold text-cyan-300 font-mono">
                      {calculationResults.secondaryProtection}
                    </div>
                  </div>

                  {/* Core & Copper Loss */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Power Losses (Core & Copper)
                    </div>
                    <div className="text-sm font-bold text-rose-300 font-mono">
                      {calculationResults.loss100Kw.toFixed(2)} kW
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Core P0: {calculationResults.p0Kw.toFixed(2)}kW | Cu Pk: {calculationResults.pkKw.toFixed(2)}kW
                    </div>
                  </div>

                  {/* Efficiency & Voltage Regulation */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Full Load Efficiency & VR
                    </div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">
                      {calculationResults.eff100.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      VR: {calculationResults.voltageRegulationPercent.toFixed(2)}% | Peak @ {calculationResults.maxEffLoadRatio.toFixed(0)}% Load
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* FORMAL ENGINEERING CONSULTANT REPORT SECTION */}
        <div className="mt-12 mb-12 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-cyan-400">
            <ShieldCheck className="w-64 h-64" />
          </div>

          {/* Report Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-2">
                  <span>EngineerHub Consulting</span>
                  <span>•</span>
                  <span>Transformer Engineering Datasheet</span>
                </div>
                <h3 className="text-xl font-heading font-extrabold text-slate-100 flex items-center gap-2.5 mt-0.5">
                  <span>Professional Engineering Report</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    VERIFIED
                  </span>
                </h3>
              </div>
            </div>

            {/* Report Action Bar */}
            <div className="flex items-center gap-2 flex-wrap relative z-10">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF / Text</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed text-slate-300 font-sans space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px] font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Transformer Design Executive Summary</span>
            </div>
            <p>{engineeringSummary}</p>
          </div>

          {/* Specifications Datasheet Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Column 1: Inputs */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold font-mono text-cyan-400 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                1. Transformer Input Specifications
              </h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Power Rating:</span>
                  <span className="font-bold text-slate-100">{calculationResults.totalKva} kVA ({(calculationResults.totalKva / 1000).toFixed(3)} MVA)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Voltages (Primary / Secondary):</span>
                  <span className="font-bold text-slate-100">{primaryVoltage} V / {secondaryVoltage} V ({systemType})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Percent Impedance (%Z):</span>
                  <span className="font-bold text-slate-100">{impedanceZ}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Power Factor (cos φ):</span>
                  <span className="font-bold text-slate-100">{powerFactor}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Conductor Material:</span>
                  <span className="font-bold text-slate-100">{cableMaterial}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Ambient Temperature:</span>
                  <span className="font-bold text-slate-100">{ambientTemp} °C (Combined Derating: {calculationResults.combinedDerating.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Column 2: Calculated Engineering Outputs */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold font-mono text-cyan-400 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                2. Calculated Engineering Recommendations
              </h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Primary HV Current (Ip):</span>
                  <span className="font-bold text-indigo-300">{calculationResults.ip.toFixed(2)} A (Design: {calculationResults.ipExp.toFixed(2)} A)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Secondary LV Current (Is):</span>
                  <span className="font-bold text-cyan-300">{calculationResults.is.toFixed(2)} A (Design: {calculationResults.isExp.toFixed(2)} A)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Primary HV Cable Sizing:</span>
                  <span className="font-bold text-indigo-300">{calculationResults.selectedPrimaryCable.description} {cableMaterial}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Secondary LV Cable Sizing:</span>
                  <span className="font-bold text-cyan-300">{calculationResults.selectedSecondaryCable.description} {cableMaterial}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Secondary LV Busbar:</span>
                  <span className="font-bold text-emerald-300">{cableMaterial === 'Copper' ? calculationResults.cuBusbarSpec : calculationResults.alBusbarSpec}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Earthing & Grounding:</span>
                  <span className="font-bold text-emerald-400">{calculationResults.peCableSize} mm² Cu | {calculationResults.earthStripSpec}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Primary HT Switchgear:</span>
                  <span className="font-bold text-slate-100">{calculationResults.primaryProtection}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Secondary LV Breaker:</span>
                  <span className="font-bold text-cyan-300">{calculationResults.secondaryProtection}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
            <div className="text-slate-400 font-mono text-[11px] font-semibold">
              Standards Compliance Verified:
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                IEC 60076 (Power Transformers)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 border border-slate-800">
                IEC 60364-5-52 & 54
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300 border border-slate-800">
                IS 1180 (Distribution)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-slate-800">
                IEEE C57 References
              </span>
            </div>
          </div>
        </div>

        {/* STEP-BY-STEP DERIVATION & FORMULAS SECTION */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-slate-100">
                  Engineering Formulas & Step-by-Step Derivation
                </h3>
                <p className="text-xs text-slate-400">
                  Mathematical proof & standard reference guide
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              
              {/* Formula Block 1: FLC Equations */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                <div className="text-cyan-400 font-bold uppercase text-[11px] font-sans">
                  1. Transformer Full Load Current (FLC)
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <div>• Three Phase: <strong className="text-cyan-300">I = (kVA × 1000) / (√3 × V)</strong></div>
                  <div className="mt-1">• Single Phase: <strong className="text-cyan-300">I = (kVA × 1000) / V</strong></div>
                </div>
                <p className="text-slate-400 font-sans text-[11px]">
                  Where <i>kVA</i> is apparent power rating and <i>V</i> is line-to-line RMS voltage.
                </p>
              </div>

              {/* Formula Block 2: Short Circuit Current */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                <div className="text-cyan-400 font-bold uppercase text-[11px] font-sans">
                  2. Symmetrical Short-Circuit Current (Isc)
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <div>• Formula: <strong className="text-amber-300">I_sc = I_secondary / (%Z / 100)</strong></div>
                  <div className="mt-1">• Current kA: <strong className="text-amber-300">{calculationResults.shortCircuitCurrentKA.toFixed(2)} kA</strong></div>
                </div>
                <p className="text-slate-400 font-sans text-[11px]">
                  Used for selecting breaking capacity rating of LV secondary circuit breakers (MCCB/ACB).
                </p>
              </div>

              {/* Formula Block 3: Voltage Regulation */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                <div className="text-cyan-400 font-bold uppercase text-[11px] font-sans">
                  3. Voltage Regulation & Efficiency
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <div>• Voltage Regulation: <strong className="text-emerald-300">%VR = %R·cos(φ) + %X·sin(φ)</strong></div>
                  <div className="mt-1">• Max Efficiency Ratio: <strong className="text-emerald-300">x_max = √(P0 / Pk) = {calculationResults.maxEffLoadRatio.toFixed(1)}% Load</strong></div>
                </div>
                <p className="text-slate-400 font-sans text-[11px]">
                  Peak transformer efficiency occurs where core losses (P0) equal copper load losses (Pk).
                </p>
              </div>

              {/* Formula Block 4: Cable & Busbar Ampacity */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
                <div className="text-cyan-400 font-bold uppercase text-[11px] font-sans">
                  4. Conductor Ampacity & Feeder Rule
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <div>• Feeder Ampacity: <strong className="text-indigo-300">I_req = (I_design × 1.25) / (Kt × Km)</strong></div>
                  <div className="mt-1">• Busbar Density: <strong className="text-indigo-300">Cu ~ 1.5 A/mm² | Al ~ 0.9 A/mm²</strong></div>
                </div>
                <p className="text-slate-400 font-sans text-[11px]">
                  Compliant with NEC 450 continuous feeder rules & IEC 60364-5-52 installation factors.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
