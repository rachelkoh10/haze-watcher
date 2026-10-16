import React, { useState } from 'react';
import { HourlyHistoricalRecord, RegionId } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/psiData';

interface TrendChartProps {
  history: HourlyHistoricalRecord[];
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  history,
  selectedRegion,
  onSelectRegion,
}) => {
  const [metricType, setMetricType] = useState<'psi' | 'pm25'>('psi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
        No historical telemetry available
      </div>
    );
  }

  // Chart dimensions
  const width = 860;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  // Determine max value for Y-scale
  const allValues: number[] = [];
  history.forEach((h) => {
    const dataObj = metricType === 'psi' ? h.readings : h.pm25Readings;
    Object.values(dataObj).forEach((v) => allValues.push(v));
  });

  const rawMax = Math.max(...allValues, metricType === 'psi' ? 120 : 60);
  // Round up to nearest 50 for clean grid
  const yMax = Math.ceil(rawMax / 50) * 50;

  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right;
    return padding.left + (index / (history.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = height - padding.top - padding.bottom;
    const clamped = Math.max(0, Math.min(yMax, val));
    return height - padding.bottom - (clamped / yMax) * usableHeight;
  };

  const regionColors: Record<RegionId, string> = {
    national: '#0f172a', // Slate 900
    north: '#0284c7', // Sky 600
    south: '#059669', // Emerald 600
    east: '#d97706', // Amber 600
    west: '#7c3aed', // Violet 600
    central: '#db2777', // Pink 600
  };

  const generatePath = (reg: RegionId) => {
    const points = history.map((h, idx) => {
      const val = metricType === 'psi' ? h.readings[reg] : h.pm25Readings[reg];
      return `${getX(idx)},${getY(val)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const activeHoverRecord = hoverIndex !== null ? history[hoverIndex] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            24-Hour Historical Progression
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {metricType === 'psi' ? 'PSI Hourly Curve' : '1-Hour PM2.5 Progression (µg/m³)'}
          </h2>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMetricType('psi')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                metricType === 'psi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour PSI
            </button>
            <button
              onClick={() => setMetricType('pm25')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                metricType === 'pm25'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Hour PM2.5
            </button>
          </div>
        </div>
      </div>

      {/* Region Filter Selector */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-xs shrink-0">Filter Zone:</span>
        <button
          onClick={() => onSelectRegion('national')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
            selectedRegion === 'national'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Regions (Overlay)
        </button>
        {(['north', 'south', 'east', 'west', 'central'] as RegionId[]).map((r) => (
          <button
            key={r}
            onClick={() => onSelectRegion(r)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedRegion === r
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {SINGAPORE_REGIONS[r].shortName}
          </button>
        ))}
      </div>

      {/* SVG Canvas Area */}
      <div className="relative mt-4 w-full aspect-[21/9] min-h-[260px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Background Grid & Threshold Bands */}
          {metricType === 'psi' && (
            <>
              {/* Moderate threshold line 50 */}
              <line
                x1={padding.left}
                y1={getY(50)}
                x2={width - padding.right}
                y2={getY(50)}
                stroke="#059669"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={width - padding.right}
                y={getY(50) - 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-emerald-700 font-semibold"
              >
                GOOD THRESHOLD (50)
              </text>

              {/* Unhealthy threshold line 100 */}
              <line
                x1={padding.left}
                y1={getY(100)}
                x2={width - padding.right}
                y2={getY(100)}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <text
                x={width - padding.right}
                y={getY(100) - 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-amber-700 font-semibold"
              >
                UNHEALTHY ALERT (100)
              </text>

              {/* Very Unhealthy threshold line 200 (if in range) */}
              {yMax >= 200 && (
                <>
                  <line
                    x1={padding.left}
                    y1={getY(200)}
                    x2={width - padding.right}
                    y2={getY(200)}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    opacity="0.7"
                  />
                  <text
                    x={width - padding.right}
                    y={getY(200) - 4}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-rose-700 font-bold"
                  >
                    VERY UNHEALTHY (200)
                  </text>
                </>
              )}
            </>
          )}

          {metricType === 'pm25' && (
            <>
              {/* Elevated threshold 55 */}
              <line
                x1={padding.left}
                y1={getY(55)}
                x2={width - padding.right}
                y2={getY(55)}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <text
                x={width - padding.right}
                y={getY(55) - 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-amber-700 font-semibold"
              >
                ELEVATED BAND II (55 µg/m³)
              </text>
            </>
          )}

          {/* Y Axis ticks */}
          {[0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax].map((tickVal) => (
            <g key={tickVal}>
              <line
                x1={padding.left}
                y1={getY(tickVal)}
                x2={width - padding.right}
                y2={getY(tickVal)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={getY(tickVal) + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 tabular-nums"
              >
                {Math.round(tickVal)}
              </text>
            </g>
          ))}

          {/* X Axis labels (Every 4 hours) */}
          {history.map((h, idx) => {
            if (idx % 4 === 0 || idx === history.length - 1) {
              return (
                <text
                  key={idx}
                  x={getX(idx)}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-500 tabular-nums"
                >
                  {h.hourLabel}
                </text>
              );
            }
            return null;
          })}

          {/* Render Curve Lines */}
          {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionId[]).map((reg) => {
            const isTarget = selectedRegion === 'national' || selectedRegion === reg;
            const strokeColor = regionColors[reg];
            const strokeWidth = selectedRegion === reg ? 3 : selectedRegion === 'national' && reg === 'national' ? 2.5 : 1.5;
            const opacity = isTarget ? 1 : 0.15;

            return (
              <path
                key={reg}
                d={generatePath(reg)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                className="transition-opacity duration-200"
              />
            );
          })}

          {/* Interactive vertical crosshair guide */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={height - padding.bottom}
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.8"
            />
          )}

          {/* Invisible interactive hover rects */}
          {history.map((_, idx) => {
            const x = getX(idx);
            const sliceWidth = (width - padding.left - padding.right) / (history.length - 1);
            return (
              <rect
                key={idx}
                x={x - sliceWidth / 2}
                y={padding.top}
                width={sliceWidth}
                height={height - padding.top - padding.bottom}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Tooltip HUD overlay */}
        {activeHoverRecord && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none p-3 bg-slate-900/95 text-white rounded-lg shadow-lg border border-slate-800 text-xs transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
              top: `${(getY(
                metricType === 'psi'
                  ? activeHoverRecord.readings[selectedRegion]
                  : activeHoverRecord.pm25Readings[selectedRegion]
              ) / height) * 100}%`,
            }}
          >
            <div className="font-mono text-slate-300 text-[11px] mb-1.5 pb-1 border-b border-slate-700/80 flex items-center justify-between gap-4">
              <span>Time: {activeHoverRecord.hourLabel}</span>
              <span className="text-sky-400 font-semibold uppercase">{SINGAPORE_REGIONS[selectedRegion].shortName}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">PSI:</span>{' '}
                <span className="font-bold text-white tabular-nums">
                  {activeHoverRecord.readings[selectedRegion]}
                </span>
              </div>
              <div>
                <span className="text-slate-400">PM2.5:</span>{' '}
                <span className="font-bold text-white tabular-nums">
                  {activeHoverRecord.pm25Readings[selectedRegion]} µg
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-900 rounded-full" />
            <span>National Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-600 rounded-full" />
            <span>North</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
            <span>South</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-600 rounded-full" />
            <span>East</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-purple-600 rounded-full" />
            <span>West</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-pink-600 rounded-full" />
            <span>Central</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Source: NEA Continuous Ambient Monitoring Network
        </div>
      </div>
    </div>
  );
};
