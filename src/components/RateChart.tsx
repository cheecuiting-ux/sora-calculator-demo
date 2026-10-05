import React, { useState } from 'react';
import { MASRateRecord } from '../types/sora';

interface RateChartProps {
  records: MASRateRecord[];
  currentSelectedRate?: number;
}

export const RateChart: React.FC<RateChartProps> = ({ records, currentSelectedRate }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Take chronological ascending order (oldest to newest)
  const sortedRecords = [...records].sort((a, b) => new Date(a.end_of_day).getTime() - new Date(b.end_of_day).getTime());

  if (sortedRecords.length < 2) {
    return <div className="p-4 text-xs text-slate-500">Insufficient data points to plot chart.</div>;
  }

  // Dimensions
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Find min and max for Y-axis
  const allRates: number[] = [];
  sortedRecords.forEach(r => {
    if (r.sor_average) allRates.push(r.sor_average);
    if (r.comp_sora_1m) allRates.push(r.comp_sora_1m);
    if (r.comp_sora_3m) allRates.push(r.comp_sora_3m);
  });
  if (currentSelectedRate) allRates.push(currentSelectedRate);
  allRates.push(4.0); // Include MAS 4.0% stress line in view or adjust

  const rawMin = Math.min(...allRates);
  const rawMax = Math.max(...allRates);
  const minY = Math.max(0, Math.floor((rawMin - 0.2) * 10) / 10);
  const maxY = Math.ceil((rawMax + 0.2) * 10) / 10;

  const getX = (index: number) => {
    return padding.left + (index / (sortedRecords.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - ((val - minY) / (maxY - minY)) * graphHeight;
  };

  // Generate paths
  const generatePath = (getValue: (r: MASRateRecord) => number | undefined) => {
    const points: string[] = [];
    sortedRecords.forEach((r, idx) => {
      const v = getValue(r);
      if (v !== undefined) {
        points.push(`${getX(idx).toFixed(1)},${getY(v).toFixed(1)}`);
      }
    });
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  };

  const pathDaily = generatePath(r => r.sor_average);
  const path1M = generatePath(r => r.comp_sora_1m);
  const path3M = generatePath(r => r.comp_sora_3m);

  // Y-axis gridlines
  const yTicks = [minY, (minY + maxY) / 2, maxY];

  const hoveredRecord = hoverIndex !== null ? sortedRecords[hoverIndex] : sortedRecords[sortedRecords.length - 1];
  const hoveredX = hoverIndex !== null ? getX(hoverIndex) : getX(sortedRecords.length - 1);

  return (
    <div className="w-full bg-slate-900/80 rounded-xl p-4 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">MAS SORA Benchmark Trend</h4>
          <p className="text-xs text-slate-400">Daily Overnight SORA vs 1-Month vs 3-Month Compounded Rates</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" />
            <span className="text-slate-300">Daily SORA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />
            <span className="text-slate-300">1M Comp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />
            <span className="text-slate-300">3M Comp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-rose-400 inline-block" />
            <span className="text-slate-400">MAS 4.0% Floor</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-slate-400 select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const normalizedX = (relX - padding.left) / graphWidth;
            const idx = Math.round(normalizedX * (sortedRecords.length - 1));
            if (idx >= 0 && idx < sortedRecords.length) {
              setHoverIndex(idx);
            }
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y Gridlines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-500"
                >
                  {val.toFixed(2)}%
                </text>
              </g>
            );
          })}

          {/* MAS 4.00% TDSR Stress Test Guideline */}
          {maxY >= 4.0 && (
            <g>
              <line
                x1={padding.left}
                y1={getY(4.0)}
                x2={width - padding.right}
                y2={getY(4.0)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              <text
                x={width - padding.right}
                y={getY(4.0) - 6}
                textAnchor="end"
                className="text-[9px] font-mono fill-rose-400 font-semibold"
              >
                MAS 4.00% Stress Floor
              </text>
            </g>
          )}

          {/* Lines */}
          <path
            d={pathDaily}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />
          <path
            d={path1M}
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />
          <path
            d={path3M}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all"
          />

          {/* Hover crosshair line */}
          {hoveredRecord && (
            <g>
              <line
                x1={hoveredX}
                y1={padding.top}
                x2={hoveredX}
                y2={height - padding.bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.5"
              />
              {/* Daily point */}
              {hoveredRecord.sor_average && (
                <circle
                  cx={hoveredX}
                  cy={getY(hoveredRecord.sor_average)}
                  r="3.5"
                  fill="#22d3ee"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              )}
              {/* 3M point */}
              {hoveredRecord.comp_sora_3m && (
                <circle
                  cx={hoveredX}
                  cy={getY(hoveredRecord.comp_sora_3m)}
                  r="4"
                  fill="#fbbf24"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* X Axis Dates */}
          <text
            x={padding.left}
            y={height - 10}
            className="text-[10px] font-mono fill-slate-500"
          >
            {sortedRecords[0].end_of_day}
          </text>
          <text
            x={width - padding.right}
            y={height - 10}
            textAnchor="end"
            className="text-[10px] font-mono fill-slate-500"
          >
            {sortedRecords[sortedRecords.length - 1].end_of_day}
          </text>
        </svg>

        {/* Hover Inspector Box */}
        {hoveredRecord && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3 font-mono bg-slate-950/40 px-3 py-2 rounded-lg">
            <div className="text-slate-400">
              Date: <span className="text-white font-medium">{hoveredRecord.end_of_day}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-cyan-400">
                Daily SORA: <strong>{hoveredRecord.sor_average.toFixed(4)}%</strong>
              </span>
              {hoveredRecord.comp_sora_1m && (
                <span className="text-emerald-400">
                  1M Comp: <strong>{hoveredRecord.comp_sora_1m.toFixed(4)}%</strong>
                </span>
              )}
              {hoveredRecord.comp_sora_3m && (
                <span className="text-amber-400">
                  3M Comp: <strong>{hoveredRecord.comp_sora_3m.toFixed(4)}%</strong>
                </span>
              )}
              {hoveredRecord.sora_volume && (
                <span className="text-slate-400 hidden md:inline">
                  Vol: SGD {hoveredRecord.sora_volume.toLocaleString()}M
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
