import React, { useState } from 'react';
import { RegionId, RegionalReadingMap } from '../types/psi';
import { SINGAPORE_REGIONS, PSI_BANDS, getPSICategory, getPM25Category } from '../constants/psiData';
import { Wind, MapPin, Info, Compass, ShieldAlert, Sparkles } from 'lucide-react';

interface SingaporeMapProps {
  readings: RegionalReadingMap;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  activeMetric: 'psi24h' | 'pm25OneHour';
  onChangeMetric: (metric: 'psi24h' | 'pm25OneHour') => void;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirectionLabel: string;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  readings,
  selectedRegion,
  onSelectRegion,
  activeMetric,
  onChangeMetric,
  windSpeedKmh,
  windDirectionDegrees,
  windDirectionLabel,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  // Helper to get color for a region based on the selected metric
  const getRegionFillColor = (regionId: RegionId) => {
    const reading = readings[regionId];
    if (!reading) return '#94a3b8';

    if (activeMetric === 'psi24h') {
      const cat = getPSICategory(reading.psi24h);
      return PSI_BANDS[cat].color;
    } else {
      const pmInfo = getPM25Category(reading.pm25OneHour);
      return pmInfo.color;
    }
  };

  const getRegionValue = (regionId: RegionId) => {
    const r = readings[regionId];
    if (!r) return 0;
    return activeMetric === 'psi24h' ? r.psi24h : r.pm25OneHour;
  };

  const activeInspectRegion = hoveredRegion || (selectedRegion !== 'national' ? selectedRegion : 'central');
  const inspectReading = readings[activeInspectRegion];
  const inspectMeta = SINGAPORE_REGIONS[activeInspectRegion];
  const inspectPsiCat = inspectReading ? getPSICategory(inspectReading.psi24h) : 'Good';
  const inspectPsiBand = PSI_BANDS[inspectPsiCat];
  const inspectPmInfo = inspectReading ? getPM25Category(inspectReading.pm25OneHour) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Map Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Interactive Geospatial Radar
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Singapore Regional Air Quality Map
          </h2>
        </div>

        {/* Metric Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => onChangeMetric('psi24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeMetric === 'psi24h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour PSI
            </button>
            <button
              onClick={() => onChangeMetric('pm25OneHour')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeMetric === 'pm25OneHour'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Hour PM2.5 (µg/m³)
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative p-3 sm:p-6 bg-slate-950/5 flex flex-col items-center justify-center overflow-hidden">
        {/* Floating Weather & Wind Ribbon */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <Wind className="w-3.5 h-3.5 text-slate-500" />
          <span>Surface Wind:</span>
          <span className="font-mono text-slate-900 font-semibold">{windDirectionLabel}</span>
          <div
            className="w-4 h-4 flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${windDirectionDegrees}deg)` }}
            title={`Wind bearing: ${windDirectionDegrees}°`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
          </div>
        </div>

        {/* Selected Region Quick Badge */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 text-xs bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500">Selected Zone:</span>
          <span className="font-semibold text-slate-900">{SINGAPORE_REGIONS[selectedRegion].name}</span>
          {selectedRegion !== 'national' && (
            <button
              onClick={() => onSelectRegion('national')}
              className="text-xs text-sky-600 hover:text-sky-800 ml-1 underline cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        {/* SVG Singapore Regional Map */}
        <div className="w-full max-w-4xl aspect-[16/9] relative select-none">
          <svg
            viewBox="0 0 960 540"
            className="w-full h-full drop-shadow-sm filter"
            aria-label="Interactive map of Singapore showing air quality in North, South, East, West, and Central regions"
          >
            <defs>
              {/* Subtle regional drop shadows */}
              <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
              </filter>
              <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodOpacity="0.35" />
              </filter>

              {/* Water grid pattern */}
              <pattern id="straits-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.4" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Straits of Johor & Singapore Sea Backdrop */}
            <rect width="960" height="540" fill="#f1f5f9" opacity="0.6" />
            <rect width="960" height="540" fill="url(#straits-grid)" />

            {/* Maritime boundary guidelines */}
            <path
              d="M 50 140 Q 300 80 500 120 T 910 160"
              fill="none"
              stroke="#94a3b8"
              strokeDasharray="4 6"
              strokeWidth="1"
              opacity="0.4"
            />
            <text x="520" y="95" className="text-[11px] font-mono fill-slate-400 select-none">
              STRAITS OF JOHOR
            </text>
            <text x="440" y="515" className="text-[11px] font-mono fill-slate-400 select-none">
              SINGAPORE STRAIT
            </text>

            {/* ================= REGION: WEST ================= */}
            <path
              id="region-west"
              d="M 120 280
                 C 150 240, 210 210, 290 200
                 L 330 205
                 L 380 250
                 L 390 320
                 L 370 380
                 L 320 405
                 C 270 410, 200 420, 160 390
                 C 110 350, 90 310, 120 280 Z"
              fill={getRegionFillColor('west')}
              fillOpacity={selectedRegion === 'west' ? 0.95 : hoveredRegion === 'west' ? 0.88 : 0.72}
              stroke={selectedRegion === 'west' ? '#0f172a' : '#ffffff'}
              strokeWidth={selectedRegion === 'west' ? 3.5 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-105"
              onMouseEnter={() => setHoveredRegion('west')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion('west')}
            />

            {/* Western Offshore Islands (Jurong Island & Semakau) */}
            <path
              d="M 230 425 C 260 415, 300 420, 295 450 C 270 465, 235 460, 225 440 Z"
              fill={getRegionFillColor('west')}
              fillOpacity={0.7}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={() => onSelectRegion('west')}
            />
            <path
              d="M 195 435 C 215 430, 220 445, 205 450 Z"
              fill={getRegionFillColor('west')}
              fillOpacity={0.7}
              stroke="#ffffff"
              strokeWidth="1"
            />

            {/* ================= REGION: NORTH ================= */}
            <path
              id="region-north"
              d="M 290 200
                 C 320 150, 420 130, 520 145
                 C 550 150, 570 170, 580 200
                 L 570 240
                 L 510 260
                 L 450 250
                 L 380 250
                 L 330 205 Z"
              fill={getRegionFillColor('north')}
              fillOpacity={selectedRegion === 'north' ? 0.95 : hoveredRegion === 'north' ? 0.88 : 0.72}
              stroke={selectedRegion === 'north' ? '#0f172a' : '#ffffff'}
              strokeWidth={selectedRegion === 'north' ? 3.5 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-105"
              onMouseEnter={() => setHoveredRegion('north')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion('north')}
            />

            {/* ================= REGION: CENTRAL ================= */}
            <path
              id="region-central"
              d="M 380 250
                 L 450 250
                 L 510 260
                 L 570 240
                 L 610 280
                 L 590 340
                 L 520 370
                 L 460 380
                 L 390 320 Z"
              fill={getRegionFillColor('central')}
              fillOpacity={selectedRegion === 'central' ? 0.95 : hoveredRegion === 'central' ? 0.88 : 0.72}
              stroke={selectedRegion === 'central' ? '#0f172a' : '#ffffff'}
              strokeWidth={selectedRegion === 'central' ? 3.5 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-105"
              onMouseEnter={() => setHoveredRegion('central')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion('central')}
            />

            {/* ================= REGION: EAST ================= */}
            <path
              id="region-east"
              d="M 580 200
                 C 630 190, 720 195, 800 230
                 C 860 260, 875 310, 840 340
                 C 790 370, 690 380, 620 370
                 L 590 340
                 L 610 280
                 L 570 240 Z"
              fill={getRegionFillColor('east')}
              fillOpacity={selectedRegion === 'east' ? 0.95 : hoveredRegion === 'east' ? 0.88 : 0.72}
              stroke={selectedRegion === 'east' ? '#0f172a' : '#ffffff'}
              strokeWidth={selectedRegion === 'east' ? 3.5 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-105"
              onMouseEnter={() => setHoveredRegion('east')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion('east')}
            />

            {/* Eastern Islands: Pulau Ubin & Pulau Tekong */}
            <path
              d="M 700 170 C 730 160, 770 170, 760 190 C 735 195, 705 185, 700 170 Z"
              fill={getRegionFillColor('east')}
              fillOpacity={0.7}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path
              d="M 780 165 C 820 155, 850 180, 835 210 C 800 215, 780 195, 780 165 Z"
              fill={getRegionFillColor('east')}
              fillOpacity={0.7}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* ================= REGION: SOUTH ================= */}
            <path
              id="region-south"
              d="M 390 320
                 L 460 380
                 L 520 370
                 L 590 340
                 L 620 370
                 C 590 410, 520 440, 440 435
                 C 380 430, 360 400, 370 380 Z"
              fill={getRegionFillColor('south')}
              fillOpacity={selectedRegion === 'south' ? 0.95 : hoveredRegion === 'south' ? 0.88 : 0.72}
              stroke={selectedRegion === 'south' ? '#0f172a' : '#ffffff'}
              strokeWidth={selectedRegion === 'south' ? 3.5 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-105"
              onMouseEnter={() => setHoveredRegion('south')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onSelectRegion('south')}
            />

            {/* Southern Island: Sentosa */}
            <path
              d="M 430 450 C 470 445, 510 460, 480 475 C 445 475, 425 465, 430 450 Z"
              fill={getRegionFillColor('south')}
              fillOpacity={0.75}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={() => onSelectRegion('south')}
            />

            {/* ================= STATION RADAR BADGES & READINGS ================= */}
            {/* North Station Pin (x: 430, y: 195) */}
            <g
              transform="translate(430, 195)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('north')}
            >
              <rect
                x="-42"
                y="-26"
                width="84"
                height="46"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={selectedRegion === 'north' ? '#38bdf8' : '#ffffff'}
                strokeWidth={selectedRegion === 'north' ? 2 : 1}
              />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
                NORTH
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="text-[17px] font-mono font-bold fill-white tabular-nums"
              >
                {getRegionValue('north')}
              </text>
            </g>

            {/* West Station Pin (x: 245, y: 310) */}
            <g
              transform="translate(245, 310)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('west')}
            >
              <rect
                x="-42"
                y="-26"
                width="84"
                height="46"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={selectedRegion === 'west' ? '#38bdf8' : '#ffffff'}
                strokeWidth={selectedRegion === 'west' ? 2 : 1}
              />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
                WEST
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="text-[17px] font-mono font-bold fill-white tabular-nums"
              >
                {getRegionValue('west')}
              </text>
            </g>

            {/* Central Station Pin (x: 480, y: 310) */}
            <g
              transform="translate(480, 310)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('central')}
            >
              <rect
                x="-44"
                y="-26"
                width="88"
                height="46"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={selectedRegion === 'central' ? '#38bdf8' : '#ffffff'}
                strokeWidth={selectedRegion === 'central' ? 2 : 1}
              />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
                CENTRAL
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="text-[17px] font-mono font-bold fill-white tabular-nums"
              >
                {getRegionValue('central')}
              </text>
            </g>

            {/* East Station Pin (x: 710, y: 280) */}
            <g
              transform="translate(710, 280)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('east')}
            >
              <rect
                x="-42"
                y="-26"
                width="84"
                height="46"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={selectedRegion === 'east' ? '#38bdf8' : '#ffffff'}
                strokeWidth={selectedRegion === 'east' ? 2 : 1}
              />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
                EAST
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="text-[17px] font-mono font-bold fill-white tabular-nums"
              >
                {getRegionValue('east')}
              </text>
            </g>

            {/* South Station Pin (x: 470, y: 415) */}
            <g
              transform="translate(470, 415)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('south')}
            >
              <rect
                x="-42"
                y="-26"
                width="84"
                height="46"
                rx="6"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={selectedRegion === 'south' ? '#38bdf8' : '#ffffff'}
                strokeWidth={selectedRegion === 'south' ? 2 : 1}
              />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-semibold fill-slate-300">
                SOUTH
              </text>
              <text
                x="0"
                y="12"
                textAnchor="middle"
                className="text-[17px] font-mono font-bold fill-white tabular-nums"
              >
                {getRegionValue('south')}
              </text>
            </g>

            {/* National Aggregate Station Island Badge (Top Center) */}
            <g
              transform="translate(80, 80)"
              className="cursor-pointer"
              onClick={() => onSelectRegion('national')}
            >
              <rect
                x="0"
                y="0"
                width="140"
                height="56"
                rx="8"
                fill="#ffffff"
                stroke={selectedRegion === 'national' ? '#0f172a' : '#cbd5e1'}
                strokeWidth={selectedRegion === 'national' ? 2 : 1}
              />
              <text x="14" y="22" className="text-[10px] font-semibold fill-slate-500 uppercase">
                SG OVERALL
              </text>
              <text
                x="14"
                y="46"
                className="text-[22px] font-mono font-bold fill-slate-900 tabular-nums"
              >
                {getRegionValue('national')}
              </text>
              <circle
                cx="116"
                cy="28"
                r="10"
                fill={getRegionFillColor('national')}
                opacity="0.9"
              />
            </g>
          </svg>
        </div>

        {/* Selected Zone Quick Telemetry Footnote */}
        <div className="w-full mt-3 p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-900">{inspectMeta.name}:</span>
            <span className="text-slate-600 truncate max-w-md">
              {inspectMeta.landmarks.slice(0, 3).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 mr-1.5">24h PSI:</span>
              <span className="font-mono font-bold text-slate-900">{inspectReading?.psi24h}</span>
              <span className="ml-1 text-slate-500">({inspectPsiCat})</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">1h PM2.5:</span>
              <span className="font-mono font-bold text-slate-900">{inspectReading?.pm25OneHour}</span>
              <span className="ml-1 text-slate-500">µg/m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Singapore Air Quality Index Legend Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          {activeMetric === 'psi24h'
            ? 'Official NEA 24-Hour PSI Benchmark Bands'
            : 'Official NEA 1-Hour PM2.5 Health Bands'}
        </div>

        {activeMetric === 'psi24h' ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-md bg-white border border-emerald-200 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">Good</span>
                <span className="font-mono text-slate-500">0 – 50</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Normal activities</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-sky-200 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-700">Moderate</span>
                <span className="font-mono text-slate-500">51 – 100</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Normal activities</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-amber-300 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-800">Unhealthy</span>
                <span className="font-mono text-slate-500">101 – 200</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Reduce strenuous outdoors</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-rose-300 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-800">Very Unhealthy</span>
                <span className="font-mono text-slate-500">201 – 300</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Avoid strenuous outdoors</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-purple-300 flex flex-col col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-900">Hazardous</span>
                <span className="font-mono text-slate-500">&gt; 300</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Minimize outdoor stay</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-md bg-white border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">Band I · Normal</span>
                <span className="font-mono text-slate-500">0 – 55 µg/m³</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Normal outdoor activity</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-amber-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-800">Band II · Elevated</span>
                <span className="font-mono text-slate-500">56 – 150 µg/m³</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Vulnerable groups reduce exertion</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-rose-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-800">Band III · High</span>
                <span className="font-mono text-slate-500">151 – 250 µg/m³</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Everyone reduce outdoor exertion</span>
            </div>
            <div className="p-2 rounded-md bg-white border border-purple-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-900">Band IV · Very High</span>
                <span className="font-mono text-slate-500">&gt; 250 µg/m³</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Avoid outdoor activities</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
