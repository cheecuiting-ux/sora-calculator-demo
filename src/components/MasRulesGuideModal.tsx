import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { MAS_BENCHMARKS } from '../data/mockMasRates';

interface MasRulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasRulesGuideModal: React.FC<MasRulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Singapore SORA & MAS Mortgage Guide
              </h3>
              <p className="text-xs text-slate-400">
                Official Monetary Authority of Singapore (MAS) and ABS Standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* SORA Explanation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 text-sm">
              What is SORA (Singapore Overnight Rate Average)?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              SORA is the volume-weighted average rate of unsecured overnight interbank SGD borrowing transactions in Singapore between 8:00 AM and 6:30 PM. It is administered and published directly by MAS every business day by 9:00 AM SGT for the previous business day.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Unlike the discontinued SIBOR (which was survey-based) and SOR (which relied on USD FX swap markets), SORA is backed by actual, verified domestic transactional cash volume (typically SGD 3B to 5B+ daily), making it robust, transparent, and manipulation-proof.
            </p>
          </div>

          {/* 1M vs 3M SORA */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white text-sm">
              1-Month vs 3-Month Compounded SORA
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">1-Month Compounded SORA</span>
                <p className="text-slate-400 text-[11px]">
                  Resets monthly. During falling interest rate cycles, your mortgage rate drops faster. However, monthly payments fluctuate 12 times a year.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">3-Month Compounded SORA</span>
                <p className="text-slate-400 text-[11px]">
                  Resets every 90 days. Singapore's most widely adopted floating mortgage benchmark (DBS, OCBC, UOB). Offers quarterly payment predictability.
                </p>
              </div>
            </div>
          </div>

          {/* Actual/365 Convention */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white text-sm">
              Singapore Actual/365 Day-Count Standard
            </h4>
            <p className="text-slate-400 leading-relaxed">
              In Singapore money markets, interest is calculated using exact calendar days divided by 365 days (even in a leap year).
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-300">
              Interest = Outstanding Principal × (Annual Rate / 365) × Days in Period
            </div>
            <p className="text-slate-400 text-[11px]">
              Friday's published rate carries through Saturday and Sunday (weighting factor $n_i = 3$), which is factored into the MAS compounding formula.
            </p>
          </div>

          {/* MAS Regulatory Rules */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-rose-400 text-sm">
              MAS TDSR, MSR & 4.00% Stress Test Mandate
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc pl-4">
              <li>
                <strong className="text-slate-200">TDSR (Total Debt Servicing Ratio):</strong> Capped at 55%. Total monthly debt obligations (mortgage, car loans, personal loans, credit cards) cannot exceed 55% of borrower's gross monthly income.
              </li>
              <li>
                <strong className="text-slate-200">MSR (Mortgage Servicing Ratio):</strong> Capped at 30% for HDB flats and Executive Condominiums (ECs).
              </li>
              <li>
                <strong className="text-slate-200">MAS 4.00% Stress Floor:</strong> When banks evaluate your TDSR and loan eligibility, they must calculate your monthly payment assuming an interest rate of at least 4.00% p.a. (not the current nominal rate).
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/95 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
