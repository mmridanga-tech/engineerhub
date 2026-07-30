import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
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
  TrendingUp,
  Shield,
  Cog,
  ZapOff,
  Flame,
  Award,
  Maximize2,
  ListOrdered,
  Printer,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MotorCurrentCalculatorPageProps {
  onBackToHome: () => void;
  onOpenAIAssistant?: () => void;
  onOpenCableSizeCalculator?: () => void;
  onOpenVoltageDropCalculator?: () => void;
  onOpenLoadCalculator?: () => void;
}

// Preset Engineering Motor Scenarios
const MOTOR_PRESETS = [
  {
    name: '1 HP Water Pump (Single Phase)',
    systemType: 'Single Phase' as const,
    ratingUnit: 'HP' as const,
    motorPower: 1,
    voltage: 230,
    efficiency: 78,
    powerFactor: 0.82,
    motorType: 'Induction' as const,
    duty: 'Continuous' as const,
    startingMethod: 'DOL' as const,
    cableMaterial: 'Copper' as const,
    ambientTemp: 30,
    futureExpansion: 10,
  },
  {
    name: '5 HP Compressor (3-Phase DOL)',
    systemType: 'Three Phase' as const,
    ratingUnit: 'HP' as const,
    motorPower: 5,
    voltage: 415,
    efficiency: 85,
    powerFactor: 0.84,
    motorType: 'Induction' as const,
    duty: 'Continuous' as const,
    startingMethod: 'DOL' as const,
    cableMaterial: 'Copper' as const,
    ambientTemp: 35,
    futureExpansion: 15,
  },
  {
    name: '15 HP Industrial Motor (Star-Delta)',
    systemType: 'Three Phase' as const,
    ratingUnit: 'HP' as const,
    motorPower: 15,
    voltage: 415,
    efficiency: 89,
    powerFactor: 0.86,
    motorType: 'Induction' as const,
    duty: 'Continuous' as const,
    startingMethod: 'Star Delta' as const,
    cableMaterial: 'Copper' as const,
    ambientTemp: 40,
    futureExpansion: 20,
  },
  {
    name: '50 HP Production Line (VFD Drive)',
    systemType: 'Three Phase' as const,
    ratingUnit: 'HP' as const,
    motorPower: 50,
    voltage: 415,
    efficiency: 93,
    powerFactor: 0.89,
    motorType: 'Induction' as const,
    duty: 'Continuous' as const,
    startingMethod: 'VFD' as const,
    cableMaterial: 'Copper' as const,
    ambientTemp: 40,
    futureExpansion: 20,
  },
];

// Standard Breaker Ratings (Amps)
const BREAKER_RATINGS = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
];

// Cable Ampacity Mapping (XLPE Copper / Aluminium in air @ 30°C)
const CABLE_TABLE = [
  { size: 1.5, cuAmp: 20, alAmp: 14 },
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
];

export const MotorCurrentCalculatorPage: React.FC<MotorCurrentCalculatorPageProps> = ({
  onBackToHome,
  onOpenAIAssistant,
  onOpenCableSizeCalculator,
  onOpenVoltageDropCalculator,
  onOpenLoadCalculator,
}) => {
  const { showToast } = useTheme();

  // Inputs State
  const [systemType, setSystemType] = useState<'Single Phase' | 'Three Phase'>('Three Phase');
  const [ratingUnit, setRatingUnit] = useState<'HP' | 'kW'>('HP');
  const [motorPower, setMotorPower] = useState<number>(15); // e.g. 15 HP
  const [voltage, setVoltage] = useState<number>(415);
  const [efficiency, setEfficiency] = useState<number>(89); // %
  const [powerFactor, setPowerFactor] = useState<number>(0.86);
  const [motorType, setMotorType] = useState<'Induction' | 'Synchronous'>('Induction');
  const [duty, setDuty] = useState<'Continuous' | 'Intermittent'>('Continuous');
  const [startingMethod, setStartingMethod] = useState<'DOL' | 'Star Delta' | 'Soft Starter' | 'VFD'>('Star Delta');
  const [cableMaterial, setCableMaterial] = useState<'Copper' | 'Aluminium'>('Copper');
  const [ambientTemp, setAmbientTemp] = useState<number>(40); // °C
  const [futureExpansion, setFutureExpansion] = useState<number>(20); // %
  const [copied, setCopied] = useState<boolean>(false);

  // Switch system type handler
  const handleSystemTypeChange = (type: 'Single Phase' | 'Three Phase') => {
    setSystemType(type);
    if (type === 'Single Phase') {
      setVoltage(230);
    } else {
      setVoltage(415);
    }
  };

  // Apply preset scenario
  const handleApplyPreset = (preset: typeof MOTOR_PRESETS[0]) => {
    setSystemType(preset.systemType);
    setRatingUnit(preset.ratingUnit);
    setMotorPower(preset.motorPower);
    setVoltage(preset.voltage);
    setEfficiency(preset.efficiency);
    setPowerFactor(preset.powerFactor);
    setMotorType(preset.motorType);
    setDuty(preset.duty);
    setStartingMethod(preset.startingMethod);
    setCableMaterial(preset.cableMaterial);
    setAmbientTemp(preset.ambientTemp);
    setFutureExpansion(preset.futureExpansion);
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  // Calculations Engine
  const calculationResults = useMemo(() => {
    // 1. Output Power Conversions (1 HP = 0.746 kW per standard)
    const outputKw = ratingUnit === 'HP' ? motorPower * 0.746 : motorPower;
    const outputHp = ratingUnit === 'HP' ? motorPower : motorPower / 0.746;

    // 2. Input Power & Thermal Loss
    const effDecimal = efficiency / 100;
    const inputKw = outputKw / effDecimal;
    const inputKva = inputKw / powerFactor;
    const powerLossKw = inputKw - outputKw;
    const powerLossWatts = powerLossKw * 1000;

    // 3. Full Load Current (FLC / FLA)
    let flc = 0;
    if (systemType === 'Single Phase') {
      // Single Phase: I = (P_kw * 1000) / (V * PF * Eff)
      flc = (outputKw * 1000) / (voltage * powerFactor * effDecimal);
    } else {
      // Three Phase: I = (P_kw * 1000) / (sqrt(3) * V * PF * Eff)
      flc = (outputKw * 1000) / (Math.sqrt(3) * voltage * powerFactor * effDecimal);
    }

    // Include Future Expansion Buffer on Current
    const expandedFlc = flc * (1 + futureExpansion / 100);

    // 4. Starter Recommendation based on Motor HP Rating:
    // Up to 5 HP -> DOL
    // 5–25 HP -> Star Delta
    // 25–75 HP -> Soft Starter
    // Above 75 HP -> VFD
    let starterRecommendation = 'DOL (Direct On Line)';
    if (outputHp <= 5) {
      starterRecommendation = 'DOL (Direct On Line Starter)';
    } else if (outputHp <= 25) {
      starterRecommendation = 'Star Delta Starter';
    } else if (outputHp <= 75) {
      starterRecommendation = 'Soft Starter';
    } else {
      starterRecommendation = 'VFD (Variable Frequency Drive)';
    }

    // 5. Starting Current (Locked Rotor Surge)
    let startingMultiplier = 6.0; // DOL standard 6x FLC
    if (startingMethod === 'Star Delta') startingMultiplier = 2.0;
    else if (startingMethod === 'Soft Starter') startingMultiplier = 2.5;
    else if (startingMethod === 'VFD') startingMultiplier = 1.1;

    const startingCurrent = flc * startingMultiplier;

    // 6. Ambient Temperature Derating Factor (Kt)
    let tempDerating = 1.0;
    if (ambientTemp >= 55) tempDerating = 0.76;
    else if (ambientTemp >= 50) tempDerating = 0.82;
    else if (ambientTemp >= 45) tempDerating = 0.87;
    else if (ambientTemp >= 40) tempDerating = 0.91;
    else if (ambientTemp >= 35) tempDerating = 0.96;

    // NEC Article 430 continuous motor feeder ampacity = 125% FLC
    const requiredCableAmpacity = (expandedFlc * 1.25) / tempDerating;

    // 7. Recommended Cable Size for Copper & Aluminium
    let cuCableSize = 300;
    let cuAmpacity = 510;
    for (let i = 0; i < CABLE_TABLE.length; i++) {
      const row = CABLE_TABLE[i];
      if (row.cuAmp >= requiredCableAmpacity) {
        cuCableSize = row.size;
        cuAmpacity = row.cuAmp;
        break;
      }
    }

    let alCableSize = 300;
    let alAmpacity = 378;
    for (let i = 0; i < CABLE_TABLE.length; i++) {
      const row = CABLE_TABLE[i];
      if (row.alAmp >= requiredCableAmpacity) {
        alCableSize = row.size;
        alAmpacity = row.alAmp;
        break;
      }
    }

    const recommendedCableSize = cableMaterial === 'Copper' ? cuCableSize : alCableSize;
    const cableAmpacity = cableMaterial === 'Copper' ? cuAmpacity : alAmpacity;

    // Protective Earth (PE) Conductor sizing per IEC 60364-5-54 & NEC 250
    let peCableSize = 2.5;
    if (recommendedCableSize <= 16) {
      peCableSize = recommendedCableSize;
    } else if (recommendedCableSize <= 35) {
      peCableSize = 16;
    } else {
      peCableSize = Math.max(16, Math.ceil(recommendedCableSize / 2));
    }

    // 8. Protection Device Recommendations (MCB & MCCB)
    const breakerMultiplier = startingMethod === 'DOL' ? 2.5 : 1.5;
    const requiredBreakerCurrent = flc * breakerMultiplier;
    const recommendedBreaker = BREAKER_RATINGS.find((r) => r >= requiredBreakerCurrent) || 1250;
    
    // MCB vs MCCB specific ratings
    const recommendedMcb = BREAKER_RATINGS.filter((r) => r <= 125).find((r) => r >= requiredBreakerCurrent) || 125;
    const recommendedMccb = BREAKER_RATINGS.find((r) => r >= Math.max(63, requiredBreakerCurrent)) || 1250;

    // 9. Recommended Contactor Rating (AC-3)
    let contactorAmp = flc * 1.15;
    let contactorNote = 'Rated for full line current AC-3 switching duty.';
    if (startingMethod === 'Star Delta') {
      const phaseCurrent = flc / Math.sqrt(3);
      contactorAmp = phaseCurrent * 1.15;
      contactorNote = `Main & Delta Contactors @ ${contactorAmp.toFixed(1)}A (AC-3), Star Contactor @ ${(flc * 0.33 * 1.15).toFixed(1)}A.`;
    }

    // 10. Overload Relay Setting
    const relayMin = flc * 0.85;
    const relayMax = flc * 1.20;
    const relaySet = flc * 1.00;

    // 11. Starter Analysis
    let starterAnalysis = '';
    if (startingMethod === 'DOL') {
      starterAnalysis = outputHp > 5
        ? 'High starting surge (6x FLC). Consider Star Delta or VFD as recommended per HP rating to prevent line voltage dip.'
        : 'Suitable for small motors (≤ 5 HP). Simple, robust, low-cost electromagnetic starter.';
    } else if (startingMethod === 'Star Delta') {
      starterAnalysis = 'Reduces starting torque and surge current to ~33% of DOL values during star transition.';
    } else if (startingMethod === 'Soft Starter') {
      starterAnalysis = 'Smooth voltage ramp control reduces mechanical stress on gearboxes and eliminates fluid water hammer.';
    } else if (startingMethod === 'VFD') {
      starterAnalysis = 'Full speed control, maximum energy efficiency, near-zero inrush surge, and built-in electronic protection.';
    }

    // 12. Voltage Drop Check (50m feeder assumption)
    const approxResPerKm = 18.1 / recommendedCableSize;
    const feederLengthMeters = 50;
    const vDropVolts = systemType === 'Single Phase'
      ? (2 * flc * feederLengthMeters * (approxResPerKm / 1000))
      : (Math.sqrt(3) * flc * feederLengthMeters * (approxResPerKm / 1000));
    const vDropPercent = (vDropVolts / voltage) * 100;
    const isVDropCompliant = vDropPercent <= 3.0;

    // 13. Efficiency Grade
    let efficiencyGrade = 'IE1 (Standard Efficiency)';
    if (efficiency >= 93) efficiencyGrade = 'IE4 (Super Premium Efficiency)';
    else if (efficiency >= 90) efficiencyGrade = 'IE3 (Premium Efficiency)';
    else if (efficiency >= 86) efficiencyGrade = 'IE2 (High Efficiency)';

    return {
      outputKw,
      outputHp,
      inputKw,
      inputKva,
      powerLossKw,
      powerLossWatts,
      flc,
      expandedFlc,
      startingCurrent,
      startingMultiplier,
      tempDerating,
      requiredCableAmpacity,
      recommendedCableSize,
      cableAmpacity,
      cuCableSize,
      cuAmpacity,
      alCableSize,
      alAmpacity,
      peCableSize,
      requiredBreakerCurrent,
      recommendedBreaker,
      recommendedMcb,
      recommendedMccb,
      contactorAmp,
      contactorNote,
      relayMin,
      relayMax,
      relaySet,
      starterRecommendation,
      starterAnalysis,
      vDropVolts,
      vDropPercent,
      isVDropCompliant,
      efficiencyGrade,
    };
  }, [systemType, ratingUnit, motorPower, voltage, efficiency, powerFactor, startingMethod, cableMaterial, ambientTemp, futureExpansion]);

  // Executive Engineering Summary Paragraph
  const engineeringSummary = useMemo(() => {
    return `Electrical feeder and switchgear design for a ${calculationResults.outputHp.toFixed(1)} HP (${calculationResults.outputKw.toFixed(2)} kW) ${systemType} motor operating at ${voltage}V AC, ${efficiency}% efficiency, and ${powerFactor} power factor. The calculated Full Load Current (FLC) is ${calculationResults.flc.toFixed(2)} A (expanded design FLC: ${calculationResults.expandedFlc.toFixed(2)} A with +${futureExpansion}% expansion buffer). Under NEC 430.22 continuous duty rules (125% FLC ampacity requirement) and ${ambientTemp}°C thermal derating (${calculationResults.tempDerating.toFixed(2)} factor), the circuit requires a minimum phase conductor size of ${calculationResults.cuCableSize} mm² Copper XLPE or ${calculationResults.alCableSize} mm² Aluminium XLPE, coupled with a ${calculationResults.peCableSize} mm² Protective Earth (PE) earthing conductor. Per standard motor power classification, the recommended starting configuration is ${calculationResults.starterRecommendation} to limit locked-rotor starting current surge from ${calculationResults.startingCurrent.toFixed(1)} A. Feeder circuit protection is assigned to a ${calculationResults.recommendedMccb} A MCCB (or ${calculationResults.recommendedMcb} A Motor Duty MCB), paired with a ${calculationResults.contactorAmp.toFixed(1)} A AC-3 Contactor and Thermal Overload Relay calibrated to ${calculationResults.relaySet.toFixed(1)} A (adjustable range: ${calculationResults.relayMin.toFixed(1)} A - ${calculationResults.relayMax.toFixed(1)} A). Estimated feeder voltage drop over 50m is ${calculationResults.vDropVolts.toFixed(2)} V (${calculationResults.vDropPercent.toFixed(2)}%), which ${calculationResults.isVDropCompliant ? 'fully satisfies' : 'exceeds'} NEC 210.19 3.0% feeder guidelines.`;
  }, [calculationResults, systemType, voltage, efficiency, powerFactor, futureExpansion, ambientTemp]);

  // Reset parameters
  const handleReset = () => {
    setSystemType('Three Phase');
    setRatingUnit('HP');
    setMotorPower(15);
    setVoltage(415);
    setEfficiency(89);
    setPowerFactor(0.86);
    setMotorType('Induction');
    setDuty('Continuous');
    setStartingMethod('Star Delta');
    setCableMaterial('Copper');
    setAmbientTemp(40);
    setFutureExpansion(20);
    showToast('Motor parameters reset to default 15 HP industrial specifications.', 'info');
  };

  // Generate full text report
  const generateReportText = () => {
    return `================================================================================
                    ENGINEERHUB CONSULTING • MOTOR DATASHEET
                         IEC & NEC ENGINEERING REPORT
================================================================================
Document Ref : EH-MTR-${motorPower}${ratingUnit}-${voltage}V
Generated On : ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

--------------------------------------------------------------------------------
1. MOTOR INPUT SPECIFICATIONS
--------------------------------------------------------------------------------
Motor Power Output            : ${motorPower} ${ratingUnit} (${calculationResults.outputKw.toFixed(2)} kW / ${calculationResults.outputHp.toFixed(2)} HP)
System Topology               : ${systemType} (${voltage} V AC)
Power Factor (cos φ)          : ${powerFactor}
Motor Efficiency (η)          : ${efficiency}% (${calculationResults.efficiencyGrade})
Motor Type & Duty Cycle       : ${motorType} (${duty} Duty)
Selected Starting Method      : ${startingMethod}
Ambient Operating Temp        : ${ambientTemp} °C (Derating Kt: ${calculationResults.tempDerating.toFixed(2)})
Future Expansion Buffer       : +${futureExpansion}%

--------------------------------------------------------------------------------
2. CALCULATED ELECTRICAL RESULTS
--------------------------------------------------------------------------------
Full Load Current (FLC / FLA) : ${calculationResults.flc.toFixed(2)} Amps
Design Continuous FLC (+${futureExpansion}%): ${calculationResults.expandedFlc.toFixed(2)} Amps
Locked Rotor Surge Current    : ${calculationResults.startingCurrent.toFixed(1)} Amps (${calculationResults.startingMultiplier}x FLC)

Input Electrical Active Power : ${calculationResults.inputKw.toFixed(2)} kW
Input Electrical Apparent Pwr : ${calculationResults.inputKva.toFixed(2)} kVA
Thermal Motor Power Loss      : ${calculationResults.powerLossKw.toFixed(2)} kW (${calculationResults.powerLossWatts.toFixed(0)} Watts)

Recommended Cable Sizes:
  - Copper XLPE Phase Cable   : ${calculationResults.cuCableSize} mm² (Ampacity: ${calculationResults.cuAmpacity} A)
  - Aluminium XLPE Phase Cable: ${calculationResults.alCableSize} mm² (Ampacity: ${calculationResults.alAmpacity} A)
  - Protective Earth (PE)     : ${calculationResults.peCableSize} mm² Cu

Circuit Protection Switchgear:
  - Miniature Circuit Breaker : MCB ${calculationResults.recommendedMcb} A (Motor Duty Curve C/D)
  - Moulded Case Breaker      : MCCB ${calculationResults.recommendedMccb} A
  - Contactor Switching Rating: ${calculationResults.contactorAmp.toFixed(1)} A (AC-3 Duty)
  - Thermal Overload Relay    : ${calculationResults.relaySet.toFixed(1)} A (Range: ${calculationResults.relayMin.toFixed(1)} A - ${calculationResults.relayMax.toFixed(1)} A)

Recommended Starter (HP Rule): ${calculationResults.starterRecommendation}
Feeder Voltage Drop (50m)     : ${calculationResults.vDropVolts.toFixed(2)} V (${calculationResults.vDropPercent.toFixed(2)}% - ${calculationResults.isVDropCompliant ? 'NEC 210 Compliant [<3%]' : 'Exceeds Recommended 3% Limit'})

--------------------------------------------------------------------------------
3. ENGINEERING SUMMARY
--------------------------------------------------------------------------------
${engineeringSummary}

--------------------------------------------------------------------------------
4. CODE STANDARDS & COMPLIANCE REFERENCES
--------------------------------------------------------------------------------
• IEC 60034-1 & IEC 60034-30-1 : Rotating Electrical Machines & Efficiency Classes (IE1-IE4)
• IEC 60364-5-52 & IEC 60364-5-54: Low-Voltage Electrical Installations (Ampacity & PE Earthing)
• NEC Article 430 & 210.19      : Motors, Motor Circuits, Controllers & Feeder Voltage Drop
• IEEE Std 141 (Red Book) & 399 : Electric Power Distribution & Motor Starting Inrush Analysis

================================================================================
Certified by EngineerHub Electrical Calculation Engine v2.5
================================================================================`;
  };

  // Copy full calculation report
  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    showToast('Motor calculation report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Print PDF Report
  const handleDownloadPdf = () => {
    window.print();
  };

  // Export Text / PDF Datasheet
  const handleExportTxt = () => {
    const reportText = generateReportText();
    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `EngineerHub_Motor_Datasheet_${motorPower}${ratingUnit}_${voltage}V.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Motor engineering report exported!', 'success');
  };

  return (
    <div className="py-24 relative overflow-hidden min-h-screen">
      {/* Background Radial Glow Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb & Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to EngineerHub Hub</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCableSizeCalculator && (
              <button
                onClick={onOpenCableSizeCalculator}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cable Size</span>
              </button>
            )}
            {onOpenLoadCalculator && (
              <button
                onClick={onOpenLoadCalculator}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 text-xs font-semibold"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Calculator</span>
              </button>
            )}
            {onOpenVoltageDropCalculator && (
              <button
                onClick={onOpenVoltageDropCalculator}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-semibold"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voltage Drop</span>
              </button>
            )}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IEC 60034 & NEC 430 Compliant</span>
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cog className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Heavy Machinery & Motor Drive Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            Motor Current Calculator
          </h1>
          <p className="mt-2 text-slate-400 dark:text-slate-400 light:text-slate-600 text-base max-w-3xl">
            Calculate Full Load Current (FLC), starting surge, feeder cable size, MCCB protection rating, AC-3 contactor rating, overload relay setting, starter selection, and efficiency grade.
          </p>
        </div>

        {/* Preset Scenarios Row */}
        <div className="mb-10 p-4 rounded-2xl glass-card border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Quick Industrial Motor Presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {MOTOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-xl glass-panel border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {preset.systemType} • {preset.motorPower} {preset.ratingUnit} @ {preset.voltage}V ({preset.startingMethod})
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Input Form vs Output Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span>Motor Specifications</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">Real-time FLC Matrix</span>
              </div>

              <div className="space-y-5">

                {/* 1. System Topology & Power Unit Toggle */}
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

                  {/* Rating Unit (HP / kW) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Motor Rating Unit
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['HP', 'kW'] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setRatingUnit(unit)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            ratingUnit === unit
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Motor Power & Nominal Voltage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Motor Power Rating */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Motor Power ({ratingUnit})
                    </label>
                    <input
                      type="number"
                      min="0.25"
                      step="0.5"
                      max="2000"
                      value={motorPower}
                      onChange={(e) => setMotorPower(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    />
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Equiv: {ratingUnit === 'HP' ? `${(motorPower * 0.7457).toFixed(2)} kW` : `${(motorPower / 0.7457).toFixed(2)} HP`}
                    </div>
                  </div>

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
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          230V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(380)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          380V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(415)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          415V
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltage(460)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                        >
                          460V
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="110"
                      max="11000"
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Efficiency (%) & Power Factor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Efficiency % */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Efficiency η (%)
                      </label>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {efficiency}% ({calculationResults.efficiencyGrade.split(' ')[0]})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="98"
                      step="1"
                      value={efficiency}
                      onChange={(e) => setEfficiency(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer my-2"
                    />
                  </div>

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
                      min="0.50"
                      max="0.98"
                      step="0.01"
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer my-2"
                    />
                  </div>
                </div>

                {/* 4. Motor Type & Starting Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Motor Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Motor Construction
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Induction', 'Synchronous'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMotorType(m)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            motorType === m
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                              : 'glass-card text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Starting Method */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Starting Method
                    </label>
                    <select
                      value={startingMethod}
                      onChange={(e) => setStartingMethod(e.target.value as any)}
                      className="w-full px-4 py-3 text-sm rounded-xl glass-card text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-slate-900 font-semibold"
                    >
                      <option value="DOL">Direct On Line (DOL - 6x Surge)</option>
                      <option value="Star Delta">Star-Delta Starter (2x Surge)</option>
                      <option value="Soft Starter">Soft Starter (2.5x Surge)</option>
                      <option value="VFD">Variable Frequency Drive (VFD - 1.1x Surge)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Duty, Conductor Material, Ambient Temp & Reserve */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Cable Material */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Conductor Material
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Copper', 'Aluminium'] as const).map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setCableMaterial(mat)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            cableMaterial === mat
                              ? 'bg-cyan-600 text-white border-cyan-400'
                              : 'glass-card text-slate-400 border-slate-800'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ambient Temp */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Ambient Temp (°C)
                    </label>
                    <select
                      value={ambientTemp}
                      onChange={(e) => setAmbientTemp(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs rounded-xl glass-card text-slate-100 border border-slate-800 bg-slate-900"
                    >
                      <option value={30}>30°C (Standard Rating)</option>
                      <option value={35}>35°C (Warm Enclosure)</option>
                      <option value={40}>40°C (Tropical Standard)</option>
                      <option value={45}>45°C (High Temp Plant)</option>
                      <option value={50}>50°C (Extreme Plant)</option>
                    </select>
                  </div>

                  {/* Future Expansion */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Design Reserve Buffer
                    </label>
                    <select
                      value={futureExpansion}
                      onChange={(e) => setFutureExpansion(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs rounded-xl glass-card text-slate-100 border border-slate-800 bg-slate-900"
                    >
                      <option value={0}>0% (Exact Motor FLC)</option>
                      <option value={10}>10% Standard Growth</option>
                      <option value={20}>20% Industrial Standard</option>
                      <option value={25}>25% Heavy Expansion</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Controls */}
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

          {/* RIGHT 5 COLS: OUTPUT RESULTS CARDS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-heading font-bold text-slate-100">
                      Calculated Motor Results
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>IEC 60034 Verified</span>
                  </span>
                </div>

                {/* Primary Hero Output Card: Full Load Current */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-950 border border-cyan-500/40 mb-6 text-center relative overflow-hidden shadow-xl">
                  <div className="text-xs uppercase font-mono tracking-widest text-cyan-300/80 mb-1">
                    FULL LOAD CURRENT (FLC / FLA)
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-200">
                    {calculationResults.flc.toFixed(2)} Amps
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-center gap-2">
                    <span>Design Buffer (+{futureExpansion}%):</span>
                    <strong className="text-cyan-300">{calculationResults.expandedFlc.toFixed(2)} A</strong>
                  </div>
                </div>

                {/* Key Electrical Output Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Power Output & Input */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Power Output & Input
                    </div>
                    <div className="text-base font-bold font-mono text-cyan-300">
                      Out: {calculationResults.outputKw.toFixed(2)} kW ({calculationResults.outputHp.toFixed(2)} HP)
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      In: {calculationResults.inputKw.toFixed(2)} kW ({calculationResults.inputKva.toFixed(2)} kVA)
                    </div>
                  </div>

                  {/* Efficiency Thermal Loss */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Efficiency & Thermal Loss
                    </div>
                    <div className="text-base font-bold font-mono text-rose-300">
                      Loss: {calculationResults.powerLossKw.toFixed(2)} kW
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      {calculationResults.powerLossWatts.toFixed(0)} Watts @ η={efficiency}%
                    </div>
                  </div>

                  {/* Recommended Starter by HP */}
                  <div className="col-span-2 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] uppercase font-semibold text-cyan-400">
                        Recommended Starter (Per Motor Rating)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        HP Rule Verified
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>{calculationResults.starterRecommendation}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {calculationResults.starterAnalysis}
                    </div>
                  </div>

                  {/* Recommended Cable Sizes (Copper & Aluminium) */}
                  <div className="col-span-2 p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase font-semibold text-slate-400">
                        Recommended Cable Sizes (XLPE 3-Core / 4-Core)
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        PE: {calculationResults.peCableSize} mm² Cu
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className={`p-2.5 rounded-xl border ${cableMaterial === 'Copper' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                        <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold">Copper Cable</div>
                        <div className="text-base font-bold text-emerald-300">{calculationResults.cuCableSize} mm²</div>
                        <div className="text-[10px] text-slate-400">Ampacity: {calculationResults.cuAmpacity} A</div>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${cableMaterial === 'Aluminium' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                        <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold">Aluminium Cable</div>
                        <div className="text-base font-bold text-cyan-300">{calculationResults.alCableSize} mm²</div>
                        <div className="text-[10px] text-slate-400">Ampacity: {calculationResults.alAmpacity} A</div>
                      </div>
                    </div>
                  </div>

                  {/* Protection Devices: MCB & MCCB */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Circuit Breakers (MCB & MCCB)
                    </div>
                    <div className="text-xs font-mono space-y-1">
                      <div className="text-slate-200">• MCB: <strong className="text-cyan-300">{calculationResults.recommendedMcb} A</strong> (Curve C/D)</div>
                      <div className="text-slate-200">• MCCB: <strong className="text-indigo-300">{calculationResults.recommendedMccb} A</strong> (Motor Duty)</div>
                    </div>
                  </div>

                  {/* Contactor & Overload Relay */}
                  <div className="p-4 rounded-2xl glass-card border border-slate-800">
                    <div className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                      Contactor & Thermal Relay
                    </div>
                    <div className="text-xs font-mono space-y-1">
                      <div className="text-slate-200">• Contactor: <strong className="text-indigo-300">{calculationResults.contactorAmp.toFixed(1)} A</strong> (AC-3)</div>
                      <div className="text-slate-200">• Overload: <strong className="text-yellow-300">{calculationResults.relaySet.toFixed(1)} A</strong></div>
                    </div>
                  </div>
                </div>

                {/* Efficiency Grade & Power Loss Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Efficiency Class & Power Loss</span>
                    </div>
                    <span className="text-emerald-400 font-mono">{calculationResults.efficiencyGrade.split(' ')[0]}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>• Motor Efficiency Grade:</span>
                      <span className="font-bold text-amber-300">{calculationResults.efficiencyGrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Thermal Power Loss:</span>
                      <span className="font-bold text-rose-300">{calculationResults.powerLossKw.toFixed(2)} kW ({calculationResults.powerLossWatts.toFixed(0)} W)</span>
                    </div>
                  </div>
                </div>

                {/* Feeder Voltage Drop Summary */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>50m Cable Voltage Drop:</span>
                    <span className={`font-mono font-bold ${calculationResults.isVDropCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {calculationResults.vDropVolts.toFixed(2)} V ({calculationResults.vDropPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {calculationResults.isVDropCompliant
                      ? '✓ Compliant with NEC 210.19 feeder limit (<3.0% drop)'
                      : '⚠️ Warning: Exceeds 3% recommended feeder voltage drop. Consider upgrading cable size.'}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* FORMAL ENGINEERING CONSULTANT REPORT SECTION */}
        <div className="mt-8 mb-12 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-6 relative overflow-hidden">
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
                  <span>Electrical Motor Datasheet</span>
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
                className="px-3.5 py-2 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 rounded-xl glass-card text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF / Text</span>
              </button>
            </div>
          </div>

          {/* Report Executive Summary Paragraph */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed text-slate-300 font-sans space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px] font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Engineering Design Executive Summary</span>
            </div>
            <p>{engineeringSummary}</p>
          </div>

          {/* Document Datasheet Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Column 1: Motor Input Details */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold font-mono text-cyan-400 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                1. Motor Specifications
              </h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Power Rating:</span>
                  <span className="font-bold text-slate-100">{motorPower} {ratingUnit} ({calculationResults.outputKw.toFixed(2)} kW / {calculationResults.outputHp.toFixed(2)} HP)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• System Voltage & Phase:</span>
                  <span className="font-bold text-slate-100">{voltage} V ({systemType})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Power Factor (cos φ):</span>
                  <span className="font-bold text-slate-100">{powerFactor}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Efficiency (η):</span>
                  <span className="font-bold text-slate-100">{efficiency}% ({calculationResults.efficiencyGrade})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Starting Method:</span>
                  <span className="font-bold text-slate-100">{startingMethod}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Operating Temperature:</span>
                  <span className="font-bold text-slate-100">{ambientTemp} °C (Derating Kt = {calculationResults.tempDerating.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Column 2: Calculated Engineering Recommendations */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold font-mono text-cyan-400 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                2. Calculated Engineering Recommendations
              </h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Full Load Current (FLC):</span>
                  <span className="font-bold text-cyan-300">{calculationResults.flc.toFixed(2)} A (Design: {calculationResults.expandedFlc.toFixed(2)} A)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Locked Rotor Surge Current:</span>
                  <span className="font-bold text-amber-400">{calculationResults.startingCurrent.toFixed(1)} A ({calculationResults.startingMultiplier}x FLC)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Feeder Phase Cable Size:</span>
                  <span className="font-bold text-emerald-300">{calculationResults.cuCableSize} mm² Cu / {calculationResults.alCableSize} mm² Al</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Protective Earth (PE):</span>
                  <span className="font-bold text-emerald-400">{calculationResults.peCableSize} mm² Cu</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Protective Breaker:</span>
                  <span className="font-bold text-slate-100">MCB {calculationResults.recommendedMcb}A / MCCB {calculationResults.recommendedMccb}A</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Contactor & Overload:</span>
                  <span className="font-bold text-indigo-300">{calculationResults.contactorAmp.toFixed(1)} A AC-3 | O/L: {calculationResults.relaySet.toFixed(1)} A</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Starter Recommendation:</span>
                  <span className="font-bold text-cyan-300">{calculationResults.starterRecommendation}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">• Feeder Voltage Drop:</span>
                  <span className={`font-bold ${calculationResults.isVDropCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {calculationResults.vDropVolts.toFixed(2)} V ({calculationResults.vDropPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Standards & References */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
            <div className="text-slate-400 font-mono text-[11px] font-semibold">
              Standards Compliance Verified:
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                IEC 60034-1 & 30-1
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 border border-slate-800">
                IEC 60364-5-52 & 54
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300 border border-slate-800">
                NEC Article 430
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-slate-800">
                IEEE Std 141 & 399
              </span>
            </div>
          </div>
        </div>

        {/* LOWER DETAILED EXPLANATION & ENGINEERING BREAKDOWN */}
        <div className="space-y-8">
          
          {/* Formula & Step-by-Step Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formula Block */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Motor Current Formulas</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">1. Full Load Current (Three Phase):</div>
                  <div>FLC = (Output_kW × 1000) / (√3 × Voltage × PF × Efficiency)</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    FLC = ({calculationResults.outputKw.toFixed(2)} × 1000) / (1.732 × {voltage} × {powerFactor} × {efficiency/100}) = {calculationResults.flc.toFixed(2)} A
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">2. Input Electrical Power:</div>
                  <div>P_in = P_out / Efficiency</div>
                  <div>S_in = P_in / Power Factor</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    P_in = {calculationResults.outputKw.toFixed(2)} / {(efficiency/100)} = {calculationResults.inputKw.toFixed(2)} kW ({calculationResults.inputKva.toFixed(2)} kVA)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">3. Thermal Motor Power Loss:</div>
                  <div>P_loss = P_in - P_out</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    P_loss = {calculationResults.inputKw.toFixed(2)} - {calculationResults.outputKw.toFixed(2)} = {calculationResults.powerLossKw.toFixed(2)} kW ({calculationResults.powerLossWatts.toFixed(0)} W)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">4. Protective Breaker & Overload Sizing:</div>
                  <div>I_breaker = FLC × {startingMethod === 'DOL' ? '2.50 (DOL Inverse Time)' : '1.50 (Reduced Surge)'}</div>
                  <div>Thermal Relay = FLC × 1.00 (Set at {calculationResults.relaySet.toFixed(1)} A)</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Req Breaker Threshold = {calculationResults.requiredBreakerCurrent.toFixed(1)} A → {calculationResults.recommendedBreaker} A Selected
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-cyan-400" />
                <span>Step-by-Step Calculation Derivation</span>
              </h3>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Convert Mechanical Shaft Output:</span> Motor rating of {motorPower} {ratingUnit} translates to <strong className="text-cyan-300">{calculationResults.outputKw.toFixed(2)} kW ({calculationResults.outputHp.toFixed(2)} HP)</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Determine Total Electrical Power Draw:</span> Factoring {efficiency}% motor efficiency and {powerFactor} power factor yields active input electrical power of <strong className="text-cyan-300">{calculationResults.inputKw.toFixed(2)} kW</strong> and apparent power of <strong className="text-cyan-300">{calculationResults.inputKva.toFixed(2)} kVA</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Calculate Full Load Amperes (FLC):</span> At {voltage}V ({systemType}), full load continuous running current is <strong className="text-cyan-300">{calculationResults.flc.toFixed(2)} A</strong>. Applying +{futureExpansion}% design buffer yields <strong className="text-cyan-300">{calculationResults.expandedFlc.toFixed(2)} A</strong>.
                </li>
                <li className="pb-2 border-b border-slate-800/60">
                  <span className="font-bold text-slate-100">Evaluate Starting Surge & Switchgear:</span> Operating under {startingMethod} starter produces locked-rotor surge of <strong className="text-amber-400">{calculationResults.startingCurrent.toFixed(1)} A</strong>. Selected breaker: <strong className="text-slate-100">{calculationResults.recommendedBreaker} A ({calculationResults.breakerType})</strong>, paired with <strong className="text-indigo-300">{calculationResults.contactorAmp.toFixed(1)} A AC-3 contactor</strong> and <strong className="text-emerald-300">{calculationResults.recommendedCableSize} mm² {cableMaterial} XLPE feeder cable</strong>.
                </li>
                <li>
                  <span className="font-bold text-slate-100">Set Thermal Overload Protection:</span> Adjust bimetallic overload relay dial to <strong className="text-yellow-300">{calculationResults.relaySet.toFixed(1)} A</strong> to ensure 100% motor thermal protection under overload.
                </li>
              </ol>
            </div>

          </div>

          {/* Engineering Notes & Code Standards */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Starter Comparison Notes */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Starter Selection Engineering Notes</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Direct On Line (DOL):</strong> Full voltage applied immediately. Highest starting torque (150-200%), but produces 6x to 8x inrush current surge. Preferred for small motors &lt; 7.5 kW.</li>
                <li><strong>Star-Delta Starter:</strong> Starts motor in Star configuration (reducing voltage per phase to 1/√3 = 58% and current/torque to ~33%). Switches to Delta once motor reaches 80% speed.</li>
                <li><strong>Soft Starter:</strong> Uses solid-state thyristors to smoothly ramp up applied AC voltage. Eliminates mechanical gear stress and fluid pressure surges (water hammer).</li>
                <li><strong>Variable Frequency Drive (VFD):</strong> Controls both frequency (f) and voltage (V) to maintain constant V/f ratio. Enables continuous variable speed control and energy savings up to 40% on centrifugal pumps and fans.</li>
              </ul>
            </div>

            {/* Standards References */}
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>IEC / NEC / IEEE Standards Compliance</span>
              </h4>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 text-xs text-slate-300 space-y-2 font-sans">
                <p>• <strong>IEC 60034-1:</strong> Rotating Electrical Machines - Rating and Performance</p>
                <p>• <strong>NEC Article 430:</strong> Motors, Motor Circuits, and Controllers</p>
                <p>• <strong>IEC 60947-4-1:</strong> Low-Voltage Switchgear & Controlgear - Contactors and Motor-Starters</p>
                <p>• <strong>IEEE Std 141 (Red Book):</strong> Electric Power Distribution for Industrial Plants</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
