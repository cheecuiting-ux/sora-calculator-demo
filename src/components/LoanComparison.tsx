import React from 'react';
import { Check, AlertCircle, ArrowRight, ShieldCheck, Scale, Zap } from 'lucide-react';
import { LoanInputState, MASRateRecord } from '../types/sora';
import { calculateMonthlyPayment, formatSGD } from '../utils/soraCalculator';
import { MAS_BENCHMARKS } from '../data/mockMasRates';

interface LoanComparisonProps {
  input: LoanInputState;
  latestRecord?: MASRateRecord;
  onSelectOption: (tenor: any, spread: number, customRate?: number) => void;
}

export const LoanComparison: React.FC<LoanComparisonProps> = ({
  input,
  latestRecord,
  onSelectOption
}) => {
  const sora3m = latestRecord?.comp_sora_3m ?? 3.1250;
  const sora1m = latestRecord?.comp_sora_1m ?? 2.9421;
  const sora6m = latestRecord?.comp_sora_6m ?? 3.2840;

  const options = [
    {
      id: 'current',
      title: 'Current Active Selection',
      badge: 'Active Loan',
      tenor: input.selectedTenor,
      spread: input.bankSpread,
      rate: (input.selectedTenor === '1M_SORA' ? sora1m : input.selectedTenor === '6M_SORA' ? sora6m : sora3m) + input.bankSpread,
      description: 'Your configured SORA loan package.',
      lockIn: '2 Years',
      risk: 'Medium (Floating SORA)',
      isCurrent: true
    },
    {
      id: '3m-sora',
      title: 'Standard 3M SORA Package',
      badge: 'Singapore Most Popular',
      tenor: '3M_SORA',
      spread: 0.65,
      rate: sora3m + 0.65,
      description: 'Resets quarterly. Smooths out daily volatility while benefiting from rate cycle cuts.',
      lockIn: '2 Years',
      risk: 'Medium (Quarterly Reset)',
      isPopular: true
    },
    {
      id: '1m-sora',
      title: 'Dynamic 1M SORA Package',
      badge: 'Fast Rate Cut Capture',
      tenor: '1M_SORA',
      spread: 0.60,
      rate: sora1m + 0.60,
      description: 'Resets every 30 days. Most responsive during global interest rate loosening cycles.',
      lockIn: '2 Years',
      risk: 'Medium-High (Monthly Volatility)'
    },
    {
      id: 'hdb-concessionary',
      title: 'HDB Concessionary Loan',
      badge: 'CPF OA Pegged (Fixed)',
      tenor: 'CUSTOM',
      spread: 0,
      rate: MAS_BENCHMARKS.HDB_CONCESSIONARY_RATE,
      customRate: MAS_BENCHMARKS.HDB_CONCESSIONARY_RATE,
      description: 'Pegged to CPF Ordinary Account rate + 0.10%. Maximum 25-year tenure.',
      lockIn: 'No lock-in',
      risk: 'Very Low (Ultra stable)'
    },
    {
      id: 'mas-stress',
      title: 'MAS TDSR Stress Benchmark',
      badge: 'MAS Regulatory Floor',
      tenor: 'CUSTOM',
      spread: 0,
      rate: MAS_BENCHMARKS.STRESS_TEST_FLOOR_RESIDENTIAL,
      customRate: MAS_BENCHMARKS.STRESS_TEST_FLOOR_RESIDENTIAL,
      description: 'Regulatory test rate mandated for calculating debt servicing capacity.',
      lockIn: 'N/A',
      risk: 'Stress Test'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Singapore Mortgage Benchmark Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side analysis for loan amount of <strong>{formatSGD(input.loanAmount)}</strong> over <strong>{input.tenureYears} Years</strong>.
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {options.map((opt) => {
            const monthly = calculateMonthlyPayment(input.loanAmount, opt.rate, input.tenureYears);
            const totalCost = monthly * input.tenureYears * 12;
            const totalInt = totalCost - input.loanAmount;
            const threeYearInt = monthly * 36 * (opt.rate / 100); // Approximate 3-year interest paid

            return (
              <div
                key={opt.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  opt.isCurrent
                    ? 'bg-slate-850 border-emerald-500/80 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      {opt.badge}
                    </span>
                    {opt.isCurrent && (
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">Selected</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {opt.description}
                  </p>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-400">Effective Rate</span>
                      <span className="text-base font-mono font-bold text-emerald-400">
                        {opt.rate.toFixed(4)}% p.a.
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                      <span className="text-xs text-slate-400">Monthly Payment</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {formatSGD(monthly)}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1.5 text-xs text-slate-400 font-mono mb-4">
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="text-slate-200">{formatSGD(totalInt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime Cost:</span>
                      <span className="text-slate-200">{formatSGD(totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Volatility:</span>
                      <span className="text-slate-300 font-sans text-[11px]">{opt.risk}</span>
                    </div>
                  </div>
                </div>

                {!opt.isCurrent && opt.id !== 'mas-stress' && (
                  <button
                    onClick={() => onSelectOption(opt.tenor, opt.spread, opt.customRate)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <span>Apply This Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Singapore MAS Loan Rules Reference Table */}
        <div className="mt-6 p-5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-3">
          <h4 className="font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Key Singapore Monetary Authority (MAS) Home Loan Regulations
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 pt-1">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1">Total Debt Servicing Ratio (TDSR)</strong>
              Borrowers cannot allocate more than <strong>55%</strong> of their gross monthly income to total monthly debt repayments across all credit cards, personal loans, car loans, and property mortgages.
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1">Mortgage Servicing Ratio (MSR)</strong>
              Applicable only to HDB flats and Executive Condominiums (ECs). Maximum monthly mortgage repayment is capped at <strong>30%</strong> of gross monthly income.
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1">MAS Stress Test Rate (4.00%)</strong>
              When assessing loan eligibility for TDSR and MSR, banks must test repayment capacity using an interest rate floor of at least <strong>4.00%</strong> for residential properties (5.00% for commercial).
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1">Actual/365 Day-Count Convention</strong>
              Under MAS and ABS (Association of Banks in Singapore) standards, SGD money market loans compound daily on an <strong>Actual/365</strong> basis (not Actual/360 as used for USD).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
