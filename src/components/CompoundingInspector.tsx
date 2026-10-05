import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Search,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';
import { MASRateRecord, CompoundingResult } from '../types/sora';
import { calculateCompoundedSora } from '../services/masService';
import { RateChart } from './RateChart';

interface CompoundingInspectorProps {
  records: MASRateRecord[];
  onApplyCalculatedRate: (rate: number, tenorLabel: string) => void;
}

export const CompoundingInspector: React.FC<CompoundingInspectorProps> = ({
  records,
  onApplyCalculatedRate
}) => {
  const [periodDays, setPeriodDays] = useState<number>(30); // 30 days (1M) or 90 days (3M)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFormulaExplanation, setShowFormulaExplanation] = useState<boolean>(true);

  // Compute compounded rate using exact MAS formula
  const compoundingResult: CompoundingResult = useMemo(() => {
    return calculateCompoundedSora(records, periodDays);
  }, [records, periodDays]);

  const filteredSteps = useMemo(() => {
    if (!searchTerm.trim()) return compoundingResult.steps;
    return compoundingResult.steps.filter(s => s.date.includes(searchTerm));
  }, [compoundingResult.steps, searchTerm]);

  return (
    <div className="space-y-6">
      {/* SORA Trend Chart */}
      <RateChart records={records} currentSelectedRate={compoundingResult.compoundedRate} />

      {/* Main Compounding Engine Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                MAS Compounded SORA Calculation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Computes exact volume-weighted overnight compounding using the official MAS Actual/365 convention.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setPeriodDays(30)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                periodDays === 30
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Month (30 Days)
            </button>
            <button
              onClick={() => setPeriodDays(90)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                periodDays === 90
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3-Month (90 Days)
            </button>
            <button
              onClick={() => setPeriodDays(180)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                periodDays === 180
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6-Month (180 Days)
            </button>
          </div>
        </div>

        {/* Calculation Result Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-950/80">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">
              Calculated Compounded SORA Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                {compoundingResult.compoundedRate.toFixed(4)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">p.a.</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Rounded to 4 decimal places per MAS standard
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Calculation Window</span>
            <div className="text-xs font-mono text-slate-200 font-medium">
              {compoundingResult.startDate || 'N/A'} → {compoundingResult.endDate || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{compoundingResult.totalCalendarDays} Total Calendar Days (d)</span>
              <span className="mx-1.5">·</span>
              <span>{compoundingResult.businessDaysCount} Business Days (d₀)</span>
            </div>
          </div>

          <div className="flex items-center md:justify-end">
            <button
              onClick={() => onApplyCalculatedRate(compoundingResult.compoundedRate, `${periodDays === 30 ? '1M' : periodDays === 90 ? '3M' : '6M'} SORA`)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Loan Calculator</span>
            </button>
          </div>
        </div>

        {/* MAS Formula Mathematical Breakdown */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">
              Official Monetary Authority of Singapore (MAS) Compounding Formula
            </span>
            <button
              onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {showFormulaExplanation ? 'Hide Details' : 'Show Explanation'}
            </button>
          </div>

          {showFormulaExplanation && (
            <div className="space-y-3 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto text-center">
                Compounded SORA = [ ∏ ( 1 + (rᵢ × nᵢ) / 365 ) - 1 ] × (365 / d) × 100%
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400">
                <div>
                  <strong className="text-slate-200">d₀:</strong> Number of business days in calculation period ({compoundingResult.businessDaysCount})<br />
                  <strong className="text-slate-200">rᵢ:</strong> Overnight SORA rate on business day i (%)<br />
                  <strong className="text-slate-200">nᵢ:</strong> Number of calendar days for which rate rᵢ applies (Friday rates apply for 3 days over weekends)
                </div>
                <div>
                  <strong className="text-slate-200">d:</strong> Total number of calendar days in calculation period ({compoundingResult.totalCalendarDays})<br />
                  <strong className="text-slate-200">365:</strong> Singapore SGD money market day-count convention (Actual/365)<br />
                  <strong className="text-slate-200">Result:</strong> {compoundingResult.formulaString}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Daily Compounding Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-slate-200">
              Step-by-Step Daily Compounding Breakdown ({compoundingResult.steps.length} Business Days)
            </h4>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search date (e.g. 2024-09)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2.5 px-3">Business Date (i)</th>
                  <th className="py-2.5 px-3 text-right">Daily SORA (rᵢ)</th>
                  <th className="py-2.5 px-3 text-right">Calendar Days (nᵢ)</th>
                  <th className="py-2.5 px-3 text-right">Daily Factor (1 + rᵢnᵢ/365)</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSteps.map((step, idx) => (
                  <tr
                    key={step.date}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      step.calendarDays > 1 ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-white font-medium flex items-center gap-1.5">
                      <span>{step.date}</span>
                      {step.calendarDays > 1 && (
                        <span className="text-[10px] text-amber-400 font-sans px-1 rounded bg-amber-950/40">
                          Weekend/Holiday (+{step.calendarDays}d)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-400 font-semibold">
                      {step.dailyRate.toFixed(4)}%
                    </td>
                    <td className="py-2 px-3 text-right">
                      {step.calendarDays}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {step.factor.toFixed(8)}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                      {step.cumulativeProduct.toFixed(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
