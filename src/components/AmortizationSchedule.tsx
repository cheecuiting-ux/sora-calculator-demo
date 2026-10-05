import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Calendar, 
  Filter, 
  ArrowUpDown, 
  TrendingDown, 
  Info,
  DollarSign
} from 'lucide-react';
import { generateAmortizationSchedule, formatSGD, exportAmortizationCSV } from '../utils/soraCalculator';
import { LoanInputState } from '../types/sora';

interface AmortizationScheduleProps {
  input: LoanInputState;
  effectiveRate: number;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  input,
  effectiveRate
}) => {
  const [viewMode, setViewMode] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'ALL'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate complete schedule
  const scheduleData = useMemo(() => {
    return generateAmortizationSchedule(input.loanAmount, effectiveRate, input.tenureYears);
  }, [input.loanAmount, effectiveRate, input.tenureYears]);

  // Handle Export CSV
  const handleExportCSV = () => {
    exportAmortizationCSV(
      scheduleData.monthlySchedule,
      input.loanAmount,
      effectiveRate,
      input.tenureYears
    );
  };

  // Handle Copy Summary
  const handleCopySummary = async () => {
    const summaryText = `Singapore SORA Loan Summary:
Loan Principal: ${formatSGD(input.loanAmount)}
Tenure: ${input.tenureYears} Years (${input.tenureYears * 12} Months)
Effective Interest Rate: ${effectiveRate.toFixed(4)}% p.a. (MAS Act/365)
Estimated Monthly Installment: ${formatSGD(scheduleData.monthlyPayment)}
Total Interest Payable: ${formatSGD(scheduleData.totalInterestPaid)}
Total Lifetime Repayment: ${formatSGD(scheduleData.totalPayment)}
Generated via Singapore SORA Loan Engine`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Filtered monthly records if viewing monthly
  const filteredMonthly = useMemo(() => {
    if (selectedYearFilter === 'ALL') {
      return scheduleData.monthlySchedule;
    }
    return scheduleData.monthlySchedule.filter(m => m.year === selectedYearFilter);
  }, [scheduleData.monthlySchedule, selectedYearFilter]);

  // Balance progression chart (SVG)
  const chartWidth = 750;
  const chartHeight = 160;
  const padding = { top: 15, right: 30, bottom: 25, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = input.loanAmount;
  const yearly = scheduleData.yearlySchedule;

  const pointsBalance = yearly.map((y, idx) => {
    const x = padding.left + (idx / (yearly.length - 1)) * graphWidth;
    const yCoord = padding.top + graphHeight - (y.endingBalance / maxVal) * graphHeight;
    return `${x.toFixed(1)},${yCoord.toFixed(1)}`;
  }).join(' L ');

  const pointsInterest = yearly.map((y, idx) => {
    const x = padding.left + (idx / (yearly.length - 1)) * graphWidth;
    const yCoord = padding.top + graphHeight - (y.accumulatedInterest / maxVal) * graphHeight;
    return `${x.toFixed(1)},${yCoord.toFixed(1)}`;
  }).join(' L ');

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Recap */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Amortization Schedule & Balance Trajectory
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monthly breakdown calculated under Singapore interbank conventions (Actual/365).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Excel)</span>
            </button>
          </div>
        </div>

        {/* Visual Balance Decline Chart */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-semibold text-slate-300">Loan Balance Decline vs. Cumulative Interest</span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                Remaining Principal
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-400 inline-block" />
                Accumulated Interest
              </span>
            </div>
          </div>

          <div className="overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-slate-500 select-none">
              {/* Gridlines */}
              <line x1={padding.left} y1={padding.top} x2={chartWidth - padding.right} y2={padding.top} stroke="#334155" strokeDasharray="3 3" />
              <line x1={padding.left} y1={padding.top + graphHeight / 2} x2={chartWidth - padding.right} y2={padding.top + graphHeight / 2} stroke="#334155" strokeDasharray="3 3" />
              <line x1={padding.left} y1={padding.top + graphHeight} x2={chartWidth - padding.right} y2={padding.top + graphHeight} stroke="#334155" />

              {/* Y Labels */}
              <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">
                {formatSGD(maxVal, 0)}
              </text>
              <text x={padding.left - 6} y={padding.top + graphHeight / 2 + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">
                {formatSGD(maxVal / 2, 0)}
              </text>
              <text x={padding.left - 6} y={padding.top + graphHeight + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">
                SGD 0
              </text>

              {/* Balance Curve */}
              <path d={`M ${pointsBalance}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              {/* Interest Curve */}
              <path d={`M ${pointsInterest}`} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />

              {/* X Axis Labels */}
              <text x={padding.left} y={chartHeight - 6} className="text-[10px] font-mono fill-slate-500">
                Year 1
              </text>
              <text x={chartWidth - padding.right} y={chartHeight - 6} textAnchor="end" className="text-[10px] font-mono fill-slate-500">
                Year {input.tenureYears}
              </text>
            </svg>
          </div>
        </div>

        {/* View Toggle & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Annual vs Monthly Segmented Button */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setViewMode('ANNUAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'ANNUAL'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual Summary ({scheduleData.yearlySchedule.length} Years)
            </button>
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'MONTHLY'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Monthly Payments ({scheduleData.monthlySchedule.length} Months)
            </button>
          </div>

          {/* If Monthly, Filter by Year */}
          {viewMode === 'MONTHLY' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filter Year:</span>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Years</option>
                {scheduleData.yearlySchedule.map((y) => (
                  <option key={y.year} value={y.year}>
                    Year {y.year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Schedule Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto max-h-[500px]">
          {viewMode === 'ANNUAL' ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3 text-right">Starting Balance</th>
                  <th className="py-2.5 px-3 text-right">Annual Payment</th>
                  <th className="py-2.5 px-3 text-right">Principal Paid</th>
                  <th className="py-2.5 px-3 text-right">Interest Paid</th>
                  <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {scheduleData.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 text-white font-bold font-sans">
                      Year {row.year}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatSGD(row.startingBalance)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 font-semibold">
                      {formatSGD(row.totalPayment)}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      {formatSGD(row.principalPaid)}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-400">
                      {formatSGD(row.interestPaid)}
                    </td>
                    <td className="py-2 px-3 text-right text-white font-medium">
                      {formatSGD(row.endingBalance)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">
                      {formatSGD(row.accumulatedInterest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2.5 px-3">Month #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Beginning Balance</th>
                  <th className="py-2.5 px-3 text-right">Payment</th>
                  <th className="py-2.5 px-3 text-right">Principal</th>
                  <th className="py-2.5 px-3 text-right">Interest</th>
                  <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMonthly.map((m) => (
                  <tr key={m.period} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-1.5 px-3 text-slate-400">
                      #{m.period}
                    </td>
                    <td className="py-1.5 px-3 text-slate-200 font-sans">
                      {m.dateStr}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-300">
                      {formatSGD(m.beginningBalance)}
                    </td>
                    <td className="py-1.5 px-3 text-right text-white font-semibold">
                      {formatSGD(m.monthlyPayment)}
                    </td>
                    <td className="py-1.5 px-3 text-right text-emerald-400">
                      {formatSGD(m.principalPaid)}
                    </td>
                    <td className="py-1.5 px-3 text-right text-rose-400">
                      {formatSGD(m.interestPaid)}
                    </td>
                    <td className="py-1.5 px-3 text-right text-white font-medium">
                      {formatSGD(m.endingBalance)}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-400">
                      {formatSGD(m.totalInterestPaid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
