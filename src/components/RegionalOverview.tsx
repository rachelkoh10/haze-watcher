import React from 'react';
import { RegionId, RegionalReadingMap } from '../types/psi';
import { SINGAPORE_REGIONS, PSI_BANDS, getPSICategory, getPM25Category } from '../constants/psiData';
import { ChevronRight, Wind, Activity, ArrowUpRight, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

interface RegionalOverviewProps {
  readings: RegionalReadingMap;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  onOpenAlertSettings: (targetRegion?: RegionId) => void;
}

export const RegionalOverview: React.FC<RegionalOverviewProps> = ({
  readings,
  selectedRegion,
  onSelectRegion,
  onOpenAlertSettings,
}) => {
  const regionList: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Official NEA Telemetry
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Regional Air Quality Breakdown
          </h2>
        </div>
        <div className="text-xs text-slate-500">
          Click any zone to focus map &amp; view pollutant sub-indices
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {regionList.map((regId) => {
          const meta = SINGAPORE_REGIONS[regId];
          const data = readings[regId];
          const psiCat = data ? getPSICategory(data.psi24h) : 'Good';
          const psiBand = PSI_BANDS[psiCat];
          const pmInfo = data ? getPM25Category(data.pm25OneHour) : null;
          const isSelected = selectedRegion === regId;
          const isUnhealthy = data && data.psi24h > 100;

          return (
            <div
              key={regId}
              onClick={() => onSelectRegion(regId)}
              className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 bg-white'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {regId === 'national' ? 'Islandwide' : 'Region Station'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {meta.name}
                      {isSelected && (
                        <span className="text-[10px] font-mono text-slate-500">
                          (ACTIVE)
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Status Indicator text */}
                  <div className="text-right">
                    <span
                      className="text-xs font-bold"
                      style={{ color: psiBand.color }}
                    >
                      {psiCat}
                    </span>
                  </div>
                </div>

                {/* Landmarks unboxed text */}
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {meta.landmarks.join(' · ')}
                </div>

                {/* Primary Metric Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">
                      24h PSI Level
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                        {data?.psi24h ?? '—'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">PSI</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">
                      1h PM2.5
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                        {data?.pm25OneHour ?? '—'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">µg/m³</span>
                    </div>
                  </div>
                </div>

                {/* Pollutant Sub-index Matrix */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">O3 8h</span>
                    <span className="tabular-nums font-semibold">{data?.o3EightHour ?? '—'}</span>
                    <span className="text-[9px] text-slate-400 font-sans ml-0.5">µg/m³</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">PM10 24h</span>
                    <span className="tabular-nums font-semibold">{data?.pm10TwentyFourHour ?? '—'}</span>
                    <span className="text-[9px] text-slate-400 font-sans ml-0.5">µg/m³</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-sans">SO2 24h</span>
                    <span className="tabular-nums font-semibold">{data?.so2TwentyFourHour ?? '—'}</span>
                    <span className="text-[9px] text-slate-400 font-sans ml-0.5">µg/m³</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] truncate max-w-[160px]">
                  {pmInfo?.label.split('·')[1]?.trim() || 'Normal Airflow'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAlertSettings(regId);
                  }}
                  className="font-medium text-sky-600 hover:text-sky-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Alert Rules</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
