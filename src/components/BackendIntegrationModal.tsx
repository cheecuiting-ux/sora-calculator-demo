import React, { useState } from 'react';
import { X, Server, Copy, Check, ExternalLink, Code2, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { MASDataSourceConfig } from '../types/sora';
import { MAS_BASE_URL, MAS_OFFICIAL_API_RESOURCE_ID } from '../services/masService';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MASDataSourceConfig;
  onSaveConfig: (newProxyUrl: string) => void;
  onTestConnection: (url: string) => Promise<boolean>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection
}) => {
  if (!isOpen) return null;

  const [proxyUrl, setProxyUrl] = useState(config.customProxyUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection(proxyUrl);
      if (ok) {
        setTestResult({ success: true, message: 'Backend connected successfully! SORA rates synced.' });
      } else {
        setTestResult({ success: false, message: 'Could not connect or endpoint returned invalid format. Check server CORS & response.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection error' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(proxyUrl);
    onClose();
  };

  // Sample serverless backend code snippet
  const sampleServerlessSnippet = `// /api/sora.ts (Serverless Function)
export const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req, res) {
  const masKeyId = process.env.MAS_KEY_ID;
  if (!masKeyId) {
    return res.status(401).json({ error: 'MAS_KEY_ID not set' });
  }

  const response = await fetch(MAS_SORA_ENDPOINT, {
    headers: {
      'KeyId': masKeyId.trim(),
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  res.json(data);
}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sampleServerlessSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Backend SORA Integration Hookup
              </h3>
              <p className="text-xs text-slate-400">
                Connect your backend proxy or custom API to feed live MAS overnight rates
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

        {/* Modal Content */}
        <div className="p-5 space-y-5 text-xs text-slate-300">
          {/* Status info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Current Data Source Mode:</span>
              <span className="font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {config.mode === 'CUSTOM_PROXY'
                  ? 'Custom Backend Proxy'
                  : config.mode === 'DIRECT_MAS'
                  ? 'MAS Datastore Live'
                  : 'MAS Verified Benchmark'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The frontend is currently powered by authentic MAS benchmark overnight rates (with full daily compounding precision). When you are ready to plug in your backend, simply enter your backend route URL below.
            </p>
          </div>

          {/* Endpoint configuration */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-200">
              Custom Backend API Proxy Endpoint URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. /api/mas-sora or http://localhost:3000/api/mas-sora"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleTest}
                disabled={isTesting || !proxyUrl.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border font-mono text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Sample Backend Implementation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Ready-to-Use Express / Node.js Backend Code</span>
              </div>
              <button
                onClick={copyCode}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-slate-400 text-[11px]">
              Because the official MAS API (`eservices.mas.gov.sg`) enforces strict CORS policies for browser origins, this lightweight backend proxy fetches and caches the daily SORA data on the server side:
            </p>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {sampleServerlessSnippet}
            </pre>
          </div>

          {/* Official MAS resource details */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold">Active Serverless Endpoints:</div>
            <div>
              <span className="text-slate-500 font-mono">/api/sora:</span>{' '}
              <span className="text-slate-300">Pulls daily SORA + compounded averages from MAS with <code className="text-cyan-400 font-mono">KeyId: &lt;MAS_KEY_ID&gt;</code></span>
            </div>
            <div>
              <span className="text-slate-500 font-mono">/api/health:</span>{' '}
              <span className="text-slate-300">Health check & MAS key configuration status</span>
            </div>
            <div>
              <span className="text-slate-500 font-mono">MAS Gateway:</span>{' '}
              <code className="text-cyan-400 font-mono break-all text-[10px]">
                https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
              </code>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900/95 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-cyan-950/40"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
