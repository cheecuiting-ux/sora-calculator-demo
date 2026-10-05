import React from 'react';
import { TrendingDown, TrendingUp, Info, Check, ArrowRight } from 'lucide-react';
import { MASRateRecord, SoraTenor } from '../types/sora';
import { MAS_BENCHMARKS } from '../data/mockMasRates';

interface MasRatesBarProps {
  latestRecord?: MASRateRecord;
  selectedTenor: SoraTenor;
  onSelectTenor: (tenor: SoraTenor) => void;
  onSelectCustomRate: (rate: number) => void;
}

export const MasRatesBar: React.FC<MasRatesBarProps> = ({
  latestRecord,
  selectedTenor,
  onSelectTenor,
  onSelectCustomRate
}) => {
  if (!latestRecord) return null;

  const rateCards = [
    {
      label: '3-Month Comp. SORA',
      subtext: 'Most common SG home loan benchmark',
      rate: latestRecord.comp_sora_3m || 3.1250,
      tenor: '3M_SORA' as SoraTenor,
      popular: true,
      tag: 'Primary Bank Peg'
    },
    {
      label: '1-Month Comp. SORA',
      subtext: 'Fastest adjustment to rate drops',
      rate: latestRecord.comp_sora_1m || 2.9421,
      tenor: '1M_SORA' as SoraTenor,
      popular: false,
      tag: 'Monthly Reset'
    },
    {
      label: '6-Month Comp. SORA',
      subtext: 'Greater repayment stability',
      rate: latestRecord.comp_sora_6m || 3.2840,
      tenor: '6M_SORA' as SoraTenor,
      popular: false,
      tag: 'Semi-Annual'
    },
    {
      label: 'Daily Overnight SORA',
      subtext: 'Volume-weighted interbank rate',
      rate: latestRecord.sor_average || 2.8850,
      tenor: 'DAILY_SORA' as SoraTenor,
      popular: false,
      tag: 'MAS Spot Rate'
    },
    {
      label: 'MAS Stress Test Floor',
      subtext: 'TDSR / MSR regulatory benchmark',
      rate: MAS_BENCHMARKS.STRESS_TEST_FLOOR_RESIDENTIAL,
      tenor: 'CUSTOM' as SoraTenor,
      isBenchmark: true,
      tag: 'Regulatory Floor'
    },
    {
      label: 'HDB Concessionary',
      subtext: 'CPF Ordinary Account (2.50%) + 0.10%',
      rate: MAS_BENCHMARKS.HDB_CONCESSIONARY_RATE,
      tenor: 'CUSTOM' as SoraTenor,
      isBenchmark: true,
      tag: 'Fixed Reference'
    }
  ];

  return (
    <section className="bg-slate-950/70 border-b border-slate-800/80 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">MAS-Backed Interest Benchmarks</span>
            <span aria-hidden="true">·</span>
            <span>As of {latestRecord.end_of_day}</span>
            <span aria-hidden="true">·</span>
            <span className="hidden md:inline">Click any rate to apply to loan calculation</span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span>SORA Index: <span className="font-mono text-slate-300">{latestRecord.sora_index?.toFixed(4) || '1.1394'}</span></span>
            <span aria-hidden="true">·</span>
            <span>Daily Volume: <span className="font-mono text-slate-300">SGD {latestRecord.sora_volume ? `${latestRecord.sora_volume.toLocaleString()}M` : '3,850M'}</span></span>
          </div>
        </div>

        {/* Unboxed Grid of Rates */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {rateCards.map((card) => {
            const isSelected = 
              card.tenor === selectedTenor && card.tenor !== 'CUSTOM';

            return (
              <button
                key={card.label}
                onClick={() => {
                  if (card.isBenchmark) {
                    onSelectCustomRate(card.rate);
                  } else {
                    onSelectTenor(card.tenor);
                  }
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/80 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                    <span className="font-medium truncate">{card.label}</span>
                    {card.popular && (
                      <span className="text-[10px] text-emerald-400 font-medium">Top</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-xl font-bold font-mono text-white tracking-tight">
                      {card.rate.toFixed(4)}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">p.a.</span>
                  </div>
                </div>

                <div className="mt-1 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{card.tag}</span>
                  {isSelected ? (
                    <span className="text-emerald-400 flex items-center font-medium">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
