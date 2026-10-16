import React from 'react';
import { RegionId, RegionalReadingMap } from '../types/psi';
import { SINGAPORE_REGIONS, PSI_BANDS, getPSICategory, getPM25Category } from '../constants/psiData';
import { HeartPulse, Users, ShieldAlert, Sparkles, CheckCircle, AlertOctagon, HelpCircle } from 'lucide-react';

interface HealthAdvisoryProps {
  selectedRegion: RegionId;
  readings: RegionalReadingMap;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({
  selectedRegion,
  readings,
}) => {
  const currentData = readings[selectedRegion] || readings['national'];
  const psiVal = currentData?.psi24h ?? 50;
  const pm25Val = currentData?.pm25OneHour ?? 15;
  const psiCat = getPSICategory(psiVal);
  const band = PSI_BANDS[psiCat];
  const pmInfo = getPM25Category(pm25Val);
  const regionName = SINGAPORE_REGIONS[selectedRegion].name;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Official Singapore MOH &amp; NEA Advisory
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Health Guidance for {regionName}
          </h2>
        </div>
        <div className="text-xs text-slate-500">
          Based on 24h PSI of <strong className="font-mono text-slate-900">{psiVal}</strong> ({psiCat})
        </div>
      </div>

      {/* Primary Category Banner */}
      <div
        className="mt-5 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: band.bgColor,
          borderColor: band.borderColor,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: band.color, color: '#ffffff' }}
          >
            {psiCat === 'Good' || psiCat === 'Moderate' ? (
              <CheckCircle className="w-5 h-5" />
            ) : psiCat === 'Unhealthy' ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertOctagon className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Current Advisory Level
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span
                className="text-xs font-bold"
                style={{ color: band.textColor }}
              >
                {band.category}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {band.summary}
            </p>
          </div>
        </div>

        {/* Mask Advisory Callout */}
        <div className="bg-white/80 backdrop-blur-xs border border-slate-200/60 rounded-lg px-3 py-2 text-xs text-slate-700 shrink-0">
          <span className="font-semibold block text-slate-900">
            N95 Mask Guidance:
          </span>
          {psiVal > 200 ? (
            <span className="text-rose-700 font-semibold">
              Recommended for prolonged outdoor exposure
            </span>
          ) : psiVal > 100 ? (
            <span className="text-amber-800 font-medium">
              Optional for vulnerable individuals outdoors
            </span>
          ) : (
            <span className="text-slate-600">
              Not required for normal activities
            </span>
          )}
        </div>
      </div>

      {/* 3-Tier Official Demographic Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Tier 1: Healthy Individuals */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Healthy Persons</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {band.healthyAdvisory}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
            {psiVal <= 100 ? 'No restrictions on jogging or workouts.' : 'Switch strenuous runs to air-conditioned gym.'}
          </div>
        </div>

        {/* Tier 2: Elderly, Pregnant & Children */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Elderly, Pregnant &amp; Kids</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {band.vulnerableAdvisory}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
            {psiVal <= 100 ? 'Monitor for any sudden throat irritation.' : 'Stay indoors; run HEPA air cleaners if available.'}
          </div>
        </div>

        {/* Tier 3: Chronic Lung / Heart Disease */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Chronic Lung or Heart</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {band.chronicAdvisory}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
            Keep inhalers / prescribed medicines accessible at all times.
          </div>
        </div>
      </div>

      {/* Practical Protection Guidelines */}
      <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-900 block mb-0.5">Indoor Air Care</span>
          Keep windows closed during haze hours. Turn on air-conditioning with clean filters.
        </div>
        <div>
          <span className="font-semibold text-slate-900 block mb-0.5">Hydration &amp; Rest</span>
          Drink plenty of water to soothe mucous membranes and flush fine particulates.
        </div>
        <div>
          <span className="font-semibold text-slate-900 block mb-0.5">Proper N95 Fit</span>
          Surgical masks do NOT seal against PM2.5. Only snug N95 respirators filter 0.3μm particles.
        </div>
      </div>
    </div>
  );
};
