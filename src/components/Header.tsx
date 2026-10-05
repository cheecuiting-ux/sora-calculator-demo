import React from 'react';
import { Database, RefreshCw, Server, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { MASDataSourceConfig } from '../types/sora';

interface HeaderProps {
  config: MASDataSourceConfig;
  onRefreshRates: () => void;
  onOpenBackendModal: () => void;
  onOpenGuideModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onRefreshRates,
  onOpenBackendModal,
  onOpenGuideModal
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & MAS Context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/40 text-white font-bold tracking-tight">
              <span className="text-sm font-mono tracking-tighter">SG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  SORA Loan Engine
                </h1>
                <span className="text-xs px-2 py-0.5 rounded text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  MAS Standard Act/365
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Singapore Overnight Rate Average · Home Loan & Mortgage Interest Calculator
              </p>
            </div>
          </div>

          {/* MAS Data Connection Indicator & Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  config.status === 'success' || config.mode === 'FALLBACK' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  config.status === 'success' || config.mode === 'FALLBACK' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="font-medium text-slate-200">
                {config.mode === 'CUSTOM_PROXY'
                  ? 'Custom Backend Proxy'
                  : config.mode === 'DIRECT_MAS'
                  ? 'MAS Datastore Live'
                  : 'MAS Verified Benchmark'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono">
                {config.lastSyncTime ? `Updated ${config.lastSyncTime.slice(0, 10)}` : 'Published daily 9AM SGT'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefreshRates}
              disabled={config.status === 'loading'}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh MAS overnight rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${config.status === 'loading' ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Backend Integration Hookup */}
            <button
              onClick={onOpenBackendModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-cyan-200 border border-cyan-800/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Configure backend integration or proxy endpoint"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backend API</span>
            </button>

            {/* MAS Guide */}
            <button
              onClick={onOpenGuideModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Learn MAS SORA rules"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">MAS Rules</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
