/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  Layers, 
  Calendar, 
  Scale, 
  Server, 
  RefreshCw, 
  Sparkles,
  Info,
  ShieldCheck,
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import { LoanInputState, MASRateRecord, MASDataSourceConfig, SoraTenor } from './types/sora';
import { DEFAULT_MAS_RATES, MAS_BENCHMARKS } from './data/mockMasRates';
import { fetchMasSoraRates } from './services/masService';

import { Header } from './components/Header';
import { MasRatesBar } from './components/MasRatesBar';
import { MortgageCalculator } from './components/MortgageCalculator';
import { CompoundingInspector } from './components/CompoundingInspector';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { LoanComparison } from './components/LoanComparison';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { MasRulesGuideModal } from './components/MasRulesGuideModal';

type ActiveTab = 'CALCULATOR' | 'COMPOUNDING' | 'SCHEDULE' | 'COMPARISON';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('CALCULATOR');

  // MAS Data Source State
  const [masRecords, setMasRecords] = useState<MASRateRecord[]>(DEFAULT_MAS_RATES);
  const [config, setConfig] = useState<MASDataSourceConfig>({
    mode: 'FALLBACK',
    customProxyUrl: '',
    lastSyncTime: DEFAULT_MAS_RATES[0]?.end_of_day || new Date().toISOString(),
    status: 'idle',
    errorMessage: null
  });

  // Loan Configuration State
  const [loanInput, setLoanInput] = useState<LoanInputState>({
    propertyPrice: 1200000,
    downpaymentPercent: 25,
    loanAmount: 900000,
    tenureYears: 25,
    selectedTenor: '3M_SORA',
    bankSpread: 0.65,
    customBaseRate: 3.1250,
    dayCountMethod: 'ACT_365',
    stressTestRate: MAS_BENCHMARKS.STRESS_TEST_FLOOR_RESIDENTIAL,
    rateAdjustment: 0,
    propertyType: 'PRIVATE_CONDO',
    monthlyIncome: 12000
  });

  // Modals state
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Latest MAS record
  const latestRecord = masRecords[0];

  // Fetch MAS rates handler
  const loadRates = useCallback(async (customProxy?: string) => {
    setConfig(prev => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const result = await fetchMasSoraRates({
        customProxyUrl: customProxy !== undefined ? customProxy : config.customProxyUrl
      });

      setMasRecords(result.records);
      const newMode = result.source === 'BACKEND_PROXY' 
        ? 'CUSTOM_PROXY' 
        : result.source === 'MAS_LIVE_API' 
        ? 'DIRECT_MAS' 
        : 'FALLBACK';

      setConfig({
        mode: newMode,
        customProxyUrl: customProxy !== undefined ? customProxy : config.customProxyUrl,
        lastSyncTime: result.lastUpdated,
        status: 'success',
        errorMessage: null
      });

      setSyncToast(
        newMode === 'CUSTOM_PROXY'
          ? 'Synced latest SORA rates via Backend Proxy'
          : newMode === 'DIRECT_MAS'
          ? 'Live SORA rates synced from MAS Datastore'
          : 'Verified MAS benchmark overnight rates loaded'
      );
      setTimeout(() => setSyncToast(null), 3500);

      return true;
    } catch (err: any) {
      console.error('Error fetching MAS rates:', err);
      setConfig(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'Failed to fetch rates'
      }));
      return false;
    }
  }, [config.customProxyUrl]);

  // Initial load
  useEffect(() => {
    loadRates();
  }, []);

  // Update loan inputs
  const handleUpdateLoanInput = (next: Partial<LoanInputState>) => {
    setLoanInput(prev => ({ ...prev, ...next }));
  };

  // Quick tenor select from top rates bar
  const handleSelectTenor = (tenor: SoraTenor) => {
    handleUpdateLoanInput({ selectedTenor: tenor });
    setActiveTab('CALCULATOR');
  };

  // Quick custom rate select
  const handleSelectCustomRate = (rate: number) => {
    handleUpdateLoanInput({
      selectedTenor: 'CUSTOM',
      customBaseRate: rate
    });
    setActiveTab('CALCULATOR');
  };

  // Apply compounded rate calculated in the Compounding Inspector
  const handleApplyCalculatedRate = (rate: number, tenorLabel: string) => {
    handleUpdateLoanInput({
      selectedTenor: 'CUSTOM',
      customBaseRate: rate
    });
    setActiveTab('CALCULATOR');
    setSyncToast(`Applied ${tenorLabel} (${rate.toFixed(4)}%) to Loan Calculator`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Effective rate for Amortization Schedule
  const effectiveRate = useMemo(() => {
    let base = 3.1250;
    if (loanInput.selectedTenor === 'CUSTOM' && loanInput.customBaseRate !== undefined) {
      base = loanInput.customBaseRate;
    } else if (latestRecord) {
      if (loanInput.selectedTenor === '1M_SORA') base = latestRecord.comp_sora_1m ?? 2.9421;
      else if (loanInput.selectedTenor === '3M_SORA') base = latestRecord.comp_sora_3m ?? 3.1250;
      else if (loanInput.selectedTenor === '6M_SORA') base = latestRecord.comp_sora_6m ?? 3.2840;
      else if (loanInput.selectedTenor === 'DAILY_SORA') base = latestRecord.sor_average ?? 2.8850;
    }
    return Math.max(0.01, base + loanInput.bankSpread + loanInput.rateAdjustment);
  }, [loanInput, latestRecord]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header */}
      <Header
        config={config}
        onRefreshRates={() => loadRates()}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* MAS Key Benchmark Rates Bar */}
      <MasRatesBar
        latestRecord={latestRecord}
        selectedTenor={loanInput.selectedTenor}
        onSelectTenor={handleSelectTenor}
        onSelectCustomRate={handleSelectCustomRate}
      />

      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/80 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (Functional Segmented Control) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('CALCULATOR')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'CALCULATOR'
                  ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Mortgage Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('COMPOUNDING')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'COMPOUNDING'
                  ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>MAS Compounding Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'SCHEDULE'
                  ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Amortization Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('COMPARISON')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'COMPARISON'
                  ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Loan & Rule Comparison</span>
            </button>
          </div>

          {/* Quick Context Indicator */}
          <div className="text-xs text-slate-400 hidden lg:flex items-center gap-2 font-mono">
            <span>Active Rate:</span>
            <span className="text-emerald-400 font-bold">
              {effectiveRate.toFixed(4)}% p.a.
            </span>
            <span className="text-slate-600">|</span>
            <span>Tenure:</span>
            <span className="text-slate-200">{loanInput.tenureYears} Years</span>
          </div>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'CALCULATOR' && (
          <MortgageCalculator
            input={loanInput}
            onChangeInput={handleUpdateLoanInput}
            latestRecord={latestRecord}
            onViewAmortization={() => setActiveTab('SCHEDULE')}
            onViewCompounding={() => setActiveTab('COMPOUNDING')}
          />
        )}

        {activeTab === 'COMPOUNDING' && (
          <CompoundingInspector
            records={masRecords}
            onApplyCalculatedRate={handleApplyCalculatedRate}
          />
        )}

        {activeTab === 'SCHEDULE' && (
          <AmortizationSchedule
            input={loanInput}
            effectiveRate={effectiveRate}
          />
        )}

        {activeTab === 'COMPARISON' && (
          <LoanComparison
            input={loanInput}
            latestRecord={latestRecord}
            onSelectOption={(tenor, spread, customRate) => {
              handleUpdateLoanInput({
                selectedTenor: tenor,
                bankSpread: spread,
                customBaseRate: customRate
              });
              setActiveTab('CALCULATOR');
              setSyncToast('Loan package applied!');
              setTimeout(() => setSyncToast(null), 2500);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Singapore SORA Loan Calculator</span>
            <span>·</span>
            <span>MAS Overnight Compounded Benchmark Engine</span>
            <span>·</span>
            <span>Actual/365 Day-Count</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              MAS Guidelines
            </button>
            <span>·</span>
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Backend Integration Hookup
            </button>
            <span>·</span>
            <a
              href="https://eservices.mas.gov.sg/statistics/dir/sora.aspx"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>MAS SORA Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Backend Integration Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={config}
        onSaveConfig={(url) => {
          setConfig(prev => ({
            ...prev,
            customProxyUrl: url,
            mode: url.trim() ? 'CUSTOM_PROXY' : 'FALLBACK'
          }));
          loadRates(url);
        }}
        onTestConnection={async (url) => {
          return await loadRates(url);
        }}
      />

      {/* MAS Rules Guide Modal */}
      <MasRulesGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
