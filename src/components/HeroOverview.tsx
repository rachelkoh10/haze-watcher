import React from 'react';
import { AirQualityState, RegionId } from '../types/psi';
import { SINGAPORE_REGIONS, PSI_BANDS, getPSICategory, getPM25Category } from '../constants/psiData';
import { Wind, Activity, ArrowUpRight, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HeroOverviewProps {
  data: AirQualityState;
  onOpenAlertSettings: () => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  data,
  onOpenAlertSettings,
}) => {
  const nationalPSI = data.readings.national?.psi24h ?? 50;
  const nationalPM25 = data.readings.national?.pm25OneHour ?? 15;
  const psiCat = getPSICategory(nationalPSI);
  const psiBand = PSI_BANDS[psiCat];
  const pmInfo = getPM25Category(nationalPM25);

  // Find region with peak PSI reading
  const regions: RegionId[] = ['north', 'south', 'east', 'west', 'central'];
  let maxRegion: RegionId = 'west';
  let maxVal = -1;

  regions.forEach((r) => {
    const val = data.readings[r]?.psi24h ?? 0;
    if (val > maxVal) {
      maxVal = val;
      maxRegion = r;
    }
  });

  const isUnhealthy = nationalPSI > 100 || maxVal > 100;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Headline Area */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Republic of Singapore</span>
            <span aria-hidden="true">·</span>
            <span>National Environment Agency (NEA) Data</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-700">Updated {data.updateTimestamp} SGT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Real-Time PSI &amp; Air Quality Threshold Monitor
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Continuous islandwide surveillance of Singapore’s 24-Hour Pollutant Standards Index (PSI),
            1-Hour PM2.5 fine particulates, and transboundary haze risks with automated push notifications.
          </p>
        </div>

        {/* Right CTA / Push Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <button
            onClick={onOpenAlertSettings}
            className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Configure Push Notifications</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <div className="text-[11px] text-slate-500 text-center lg:text-right">
            Instant browser alerts when PSI exceeds unhealthy thresholds
          </div>
        </div>
      </div>

      {/* 4-Column Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
        {/* KPI 1: National 24h PSI */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Islandwide 24h PSI
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {nationalPSI}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: psiBand.color }}
            >
              {psiCat}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {psiBand.summary}
          </div>
        </div>

        {/* KPI 2: National 1h PM2.5 */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            1-Hour PM2.5
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {nationalPM25}
            </span>
            <span className="text-xs font-mono text-slate-500">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {pmInfo.label}
          </div>
        </div>

        {/* KPI 3: Highest Peak Region */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Peak Regional Reading
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
              {maxVal}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {SINGAPORE_REGIONS[maxRegion].shortName}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {maxVal > 100 ? 'Unhealthy threshold breached' : 'Nominal ambient dispersion'}
          </div>
        </div>

        {/* KPI 4: Surface Wind & Weather Vector */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Surface Wind Vector
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-bold text-slate-900">
              {data.windDirectionLabel}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {data.windDirectionDegrees >= 180 && data.windDirectionDegrees <= 250
              ? 'Southwest Monsoon (Haze Risk Season)'
              : 'Northeast Maritime Sea Breeze'}
          </div>
        </div>
      </div>
    </div>
  );
};
