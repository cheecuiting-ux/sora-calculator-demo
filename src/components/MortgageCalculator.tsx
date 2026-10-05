import React, { useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Calendar, 
  Percent, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Info
} from 'lucide-react';
import { LoanInputState, MASRateRecord, SoraTenor } from '../types/sora';
import { POPULAR_SORA_PACKAGES, MAS_BENCHMARKS } from '../data/mockMasRates';
import { calculateMonthlyPayment, formatSGD, formatPercent } from '../utils/soraCalculator';

interface MortgageCalculatorProps {
  input: LoanInputState;
  onChangeInput: (next: Partial<LoanInputState>) => void;
  latestRecord?: MASRateRecord;
  onViewAmortization: () => void;
  onViewCompounding: () => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  input,
  onChangeInput,
  latestRecord,
  onViewAmortization,
  onViewCompounding
}) => {
  // Resolve base SORA rate based on selected tenor
  const baseRate = useMemo(() => {
    if (input.selectedTenor === 'CUSTOM' && input.customBaseRate !== undefined) {
      return input.customBaseRate;
    }
    if (!latestRecord) return 3.1250;

    switch (input.selectedTenor) {
      case '1M_SORA':
        return latestRecord.comp_sora_1m ?? 2.9421;
      case '3M_SORA':
        return latestRecord.comp_sora_3m ?? 3.1250;
      case '6M_SORA':
        return latestRecord.comp_sora_6m ?? 3.2840;
      case 'DAILY_SORA':
        return latestRecord.sor_average ?? 2.8850;
      case 'CUSTOM':
      default:
        return input.customBaseRate ?? 3.1250;
    }
  }, [input.selectedTenor, input.customBaseRate, latestRecord]);

  // Effective rate = Base SORA + Bank Spread + Rate Adjustment
  const effectiveRate = Math.max(0.01, baseRate + input.bankSpread + input.rateAdjustment);

  // Normal monthly payment
  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(input.loanAmount, effectiveRate, input.tenureYears);
  }, [input.loanAmount, effectiveRate, input.tenureYears]);

  // Total interest and total cost
  const totalMonths = input.tenureYears * 12;
  const totalRepayment = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalRepayment - input.loanAmount);

  // MAS 4.00% Stress Test calculation
  const stressTestMonthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(input.loanAmount, input.stressTestRate, input.tenureYears);
  }, [input.loanAmount, input.stressTestRate, input.tenureYears]);

  const stressDelta = stressTestMonthlyPayment - monthlyPayment;

  // HDB Concessionary Loan comparison (2.60%)
  const hdbConcessionaryMonthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(input.loanAmount, MAS_BENCHMARKS.HDB_CONCESSIONARY_RATE, Math.min(input.tenureYears, 25));
  }, [input.loanAmount, input.tenureYears]);

  // TDSR and MSR calculations
  const tdsrPercent = input.monthlyIncome > 0 ? (monthlyPayment / input.monthlyIncome) * 100 : 0;
  const stressTdsrPercent = input.monthlyIncome > 0 ? (stressTestMonthlyPayment / input.monthlyIncome) * 100 : 0;
  const isTdsrPassed = stressTdsrPercent <= (MAS_BENCHMARKS.TDSR_CAP * 100);

  const isHdbOrEc = input.propertyType === 'HDB' || input.propertyType === 'EC';
  const msrPercent = (isHdbOrEc && input.monthlyIncome > 0) ? (monthlyPayment / input.monthlyIncome) * 100 : 0;
  const isMsrPassed = !isHdbOrEc || msrPercent <= (MAS_BENCHMARKS.MSR_CAP * 100);

  // Preset property price buttons
  const propertyPricePresets = [
    { label: '500K (3-rm HDB)', value: 500000 },
    { label: '800K (4/5-rm HDB)', value: 800000 },
    { label: '1.2M (EC/Suburban)', value: 1200000 },
    { label: '1.8M (City Condo)', value: 1800000 },
    { label: '2.5M (Prime Condo)', value: 2500000 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Controls & Parameters */}
      <div className="lg:col-span-7 space-y-6">
        {/* Loan Amount & Property Configuration Card */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Property & Loan Structure
              </h2>
            </div>
            {/* Property Type Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['HDB', 'EC', 'PRIVATE_CONDO', 'LANDED'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChangeInput({ propertyType: type })}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    input.propertyType === type
                      ? 'bg-slate-800 text-emerald-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'PRIVATE_CONDO' ? 'Condo' : type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Property Price */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <label htmlFor="prop-price" className="font-medium">Property Purchase Price</label>
                <span className="font-mono text-emerald-400 font-semibold text-sm">
                  {formatSGD(input.propertyPrice)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                  SGD
                </span>
                <input
                  id="prop-price"
                  type="number"
                  step="10000"
                  min="100000"
                  max="10000000"
                  value={input.propertyPrice}
                  onChange={(e) => {
                    const price = Math.max(0, parseFloat(e.target.value) || 0);
                    const lAmount = Math.round(price * (1 - input.downpaymentPercent / 100));
                    onChangeInput({ propertyPrice: price, loanAmount: lAmount });
                  }}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {propertyPricePresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      const lAmount = Math.round(preset.value * (1 - input.downpaymentPercent / 100));
                      onChangeInput({ propertyPrice: preset.value, loanAmount: lAmount });
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      input.propertyPrice === preset.value
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Downpayment & LTV Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="font-medium">
                  Downpayment (LTV: {100 - input.downpaymentPercent}%)
                </span>
                <span className="font-mono text-slate-300">
                  {input.downpaymentPercent}% ({formatSGD(input.propertyPrice * (input.downpaymentPercent / 100))})
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                step="5"
                value={input.downpaymentPercent}
                onChange={(e) => {
                  const downPercent = parseFloat(e.target.value);
                  const lAmount = Math.round(input.propertyPrice * (1 - downPercent / 100));
                  onChangeInput({ downpaymentPercent: downPercent, loanAmount: lAmount });
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>15% (Min. HDB)</span>
                <span className="text-emerald-400 font-medium">25% (Standard MAS Bank LTV 75%)</span>
                <span>50%</span>
                <span>75%</span>
              </div>
            </div>

            {/* Loan Principal & Loan Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Loan Principal Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                    SGD
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={input.loanAmount}
                    onChange={(e) => onChangeInput({ loanAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full pl-12 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <label className="font-medium">Loan Tenure</label>
                  <span className="font-mono text-emerald-400 font-medium">
                    {input.tenureYears} Years ({input.tenureYears * 12} Mos)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[15, 20, 25, 30].map((yrs) => (
                    <button
                      key={yrs}
                      onClick={() => onChangeInput({ tenureYears: yrs })}
                      className={`flex-1 py-2 text-xs font-mono font-medium rounded-xl border transition-colors cursor-pointer ${
                        input.tenureYears === yrs
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {yrs}y
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SORA Package & Bank Margin Configuration Card */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                SORA Benchmark & Bank Spread
              </h2>
            </div>

            {/* Quick SORA Period inspector link */}
            <button
              onClick={onViewCompounding}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Inspect MAS Daily Rates</span>
            </button>
          </div>

          {/* SORA Tenor selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                MAS Compounded SORA Tenor
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '3M_SORA' as SoraTenor, label: '3M SORA', sub: 'Quarterly reset', rec: true },
                  { id: '1M_SORA' as SoraTenor, label: '1M SORA', sub: 'Monthly reset' },
                  { id: '6M_SORA' as SoraTenor, label: '6M SORA', sub: 'Semi-annual' },
                  { id: 'CUSTOM' as SoraTenor, label: 'Custom Rate', sub: 'Manual input' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeInput({ selectedTenor: item.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      input.selectedTenor === item.id
                        ? 'bg-slate-800 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                      {item.rec && (
                        <span className="text-[10px] text-cyan-400 font-mono">Popular</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Spread and Custom Rate inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <label className="font-medium">Base SORA Rate</label>
                  <span className="font-mono text-cyan-400 font-medium">
                    {baseRate.toFixed(4)}% p.a.
                  </span>
                </div>
                {input.selectedTenor === 'CUSTOM' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="10"
                      value={input.customBaseRate ?? 3.1250}
                      onChange={(e) => onChangeInput({ customBaseRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-cyan-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-xs font-mono">
                      %
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-sm flex items-center justify-between">
                    <span>{input.selectedTenor.replace('_', ' ')}</span>
                    <span className="text-cyan-400 font-semibold">{baseRate.toFixed(4)}%</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <label className="font-medium">Bank Spread / Margin</label>
                  <span className="font-mono text-emerald-400 font-medium">
                    +{input.bankSpread.toFixed(2)}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="3.0"
                    value={input.bankSpread}
                    onChange={(e) => onChangeInput({ bankSpread: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-xs font-mono">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Bank Preset Packages */}
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-1.5">
                Load Standard Singapore Bank Packages:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_SORA_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      onChangeInput({
                        selectedTenor: pkg.tenor,
                        bankSpread: pkg.spreadYear1to3
                      });
                    }}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 hover:border-slate-700 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 group-hover:text-white">
                        {pkg.bankName} · {pkg.tenor.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-emerald-400 font-medium">
                        +{pkg.spreadYear1to3.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {pkg.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Effective Rate Highlight */}
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Effective Interest Rate</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Base ({baseRate.toFixed(4)}%) + Spread ({input.bankSpread.toFixed(2)}%)
                  {input.rateAdjustment !== 0 && ` + Shift (${input.rateAdjustment > 0 ? '+' : ''}${input.rateAdjustment.toFixed(2)}%)`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {effectiveRate.toFixed(4)}%
                </span>
                <span className="text-xs text-slate-400 block">p.a. (Actual/365)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Rate Sensitivity Simulator */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Interest Rate Shift / Stress Simulator
              </h3>
            </div>
            <button
              onClick={() => onChangeInput({ rateAdjustment: 0 })}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Reset Shift
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Simulate future interest rate movements in Singapore (e.g. MAS tightening or rate cuts).
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Simulated Rate Change:</span>
              <span className={`font-bold ${input.rateAdjustment > 0 ? 'text-rose-400' : input.rateAdjustment < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {input.rateAdjustment > 0 ? `+${input.rateAdjustment.toFixed(2)}%` : `${input.rateAdjustment.toFixed(2)}%`}
              </span>
            </div>

            <input
              type="range"
              min="-1.50"
              max="2.50"
              step="0.25"
              value={input.rateAdjustment}
              onChange={(e) => onChangeInput({ rateAdjustment: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-1.50% (Sharp Cut)</span>
              <span>-0.50%</span>
              <span className="text-slate-300">0.00% (Current)</span>
              <span>+1.00%</span>
              <span>+2.50% (High Surge)</span>
            </div>

            {input.rateAdjustment !== 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center justify-between font-mono">
                <span>Monthly Payment Impact:</span>
                <span className="font-bold">
                  {input.rateAdjustment > 0 ? '+' : ''}
                  {formatSGD(monthlyPayment - calculateMonthlyPayment(input.loanAmount, baseRate + input.bankSpread, input.tenureYears))}/mo
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results, KPIs & Singapore Regulatory Benchmarks */}
      <div className="lg:col-span-5 space-y-6">
        {/* Primary Calculation Result Card */}
        <div className="bg-gradient-to-b from-slate-850 to-slate-900 rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Estimated Monthly Installment
          </span>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {formatSGD(monthlyPayment)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ month</span>
          </div>

          {/* Breakdown summary */}
          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Loan Principal</span>
              <span className="font-mono text-slate-200 font-medium">
                {formatSGD(input.loanAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Interest Payable</span>
              <span className="font-mono text-rose-300 font-medium">
                {formatSGD(totalInterest)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Lifetime Repayment</span>
              <span className="font-mono text-white font-bold text-sm">
                {formatSGD(totalRepayment)}
              </span>
            </div>

            {/* Principal vs Interest Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Principal: {((input.loanAmount / totalRepayment) * 100).toFixed(1)}%</span>
                <span>Interest: {((totalInterest / totalRepayment) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(input.loanAmount / totalRepayment) * 100}%` }}
                  className="bg-emerald-500 h-full"
                />
                <div
                  style={{ width: `${(totalInterest / totalRepayment) * 100}%` }}
                  className="bg-rose-500/80 h-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Schedule Navigation Button */}
          <button
            onClick={onViewAmortization}
            className="w-full mt-5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Calendar className="w-4 h-4" />
            <span>View Full Amortization Schedule & Export CSV</span>
          </button>
        </div>

        {/* MAS Regulatory TDSR / MSR Stress Test Assessment */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">
                MAS TDSR & Stress Test Check
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
              MAS 4.00% Floor
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Singapore banks are required by the Monetary Authority of Singapore (MAS) to stress test borrowers at a minimum interest rate of <strong>{MAS_BENCHMARKS.STRESS_TEST_FLOOR_RESIDENTIAL.toFixed(2)}%</strong> under the Total Debt Servicing Ratio (TDSR) framework.
          </p>

          {/* Comparison box */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Current SORA Rate</span>
              <span className="font-mono text-base font-bold text-emerald-400 block">
                {formatSGD(monthlyPayment)}/mo
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                At {effectiveRate.toFixed(2)}% p.a.
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-rose-950/60">
              <span className="text-slate-400 block text-[11px] mb-1">MAS 4.00% Stress Test</span>
              <span className="font-mono text-base font-bold text-rose-400 block">
                {formatSGD(stressTestMonthlyPayment)}/mo
              </span>
              <span className="text-[10px] text-rose-400/80 font-mono">
                +{formatSGD(stressDelta)}/mo buffer
              </span>
            </div>
          </div>

          {/* Monthly Income Input for TDSR / MSR */}
          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gross Monthly Household Income (for TDSR assessment)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                SGD
              </span>
              <input
                type="number"
                step="500"
                value={input.monthlyIncome}
                onChange={(e) => onChangeInput({ monthlyIncome: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full pl-12 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* TDSR Result */}
            {input.monthlyIncome > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">TDSR at Stress Rate (4.00%):</span>
                  <span className={`font-mono font-bold ${isTdsrPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stressTdsrPercent.toFixed(1)}% / 55.0% Max
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  {isTdsrPassed ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Eligible: Meets MAS 55% TDSR requirement.
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warning: Exceeds MAS 55% TDSR threshold. Consider increasing downpayment or lengthening tenure.
                    </span>
                  )}
                </div>

                {isHdbOrEc && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">MSR for HDB/EC:</span>
                    <span className={`font-mono font-semibold ${isMsrPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {msrPercent.toFixed(1)}% / 30.0% Max
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HDB Concessionary Benchmark card */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-300">Vs. HDB Concessionary Loan</span>
            <span className="font-mono text-cyan-400">2.60% fixed</span>
          </div>
          <p className="text-slate-400 mb-2">
            HDB concessionary loans are pegged to CPF OA (2.50%) + 0.10%. Installment would be <strong>{formatSGD(hdbConcessionaryMonthlyPayment)}/mo</strong> (max 25y tenure).
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            {monthlyPayment < hdbConcessionaryMonthlyPayment ? (
              <span className="text-emerald-400">
                Current SORA saves {formatSGD(hdbConcessionaryMonthlyPayment - monthlyPayment)}/mo compared to HDB loan.
              </span>
            ) : (
              <span className="text-amber-400">
                HDB loan is currently {formatSGD(monthlyPayment - hdbConcessionaryMonthlyPayment)}/mo lower than this SORA package.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
