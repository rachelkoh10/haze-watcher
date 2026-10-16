import React from 'react';
import { PRESET_SCENARIOS } from '../services/airQualityService';
import { RefreshCw, PlayCircle, Radio, Sparkles } from 'lucide-react';

interface SimulationControlsProps {
  currentScenario: string;
  onSelectScenario: (scenarioKey: string) => void;
  onRefreshLive: () => void;
  isLoading: boolean;
  dataSource: 'live-gov-sg' | 'fallback-live' | 'simulation';
  lastUpdated: string;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentScenario,
  onSelectScenario,
  onRefreshLive,
  isLoading,
  dataSource,
  lastUpdated,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Info & Live Source Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live Feed &amp; Alert Simulation Environment
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-500">
              Updated: {lastUpdated}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Active Pipeline:</span>
            {dataSource === 'live-gov-sg' ? (
              <span className="font-mono text-emerald-700 font-semibold">
                ● Live api.data.gov.sg (Official NEA)
              </span>
            ) : dataSource === 'simulation' ? (
              <span className="font-mono text-sky-700 font-semibold">
                ● Interactive Simulator Scenario
              </span>
            ) : (
              <span className="font-mono text-slate-700">
                ● Fallback Telemetry (Simulated NEA)
              </span>
            )}
          </div>
        </div>

        {/* Preset Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline mr-1">
            Test Scenarios:
          </span>

          <button
            onClick={() => onSelectScenario('live')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentScenario === 'live'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Live NEA Feed
          </button>

          <button
            onClick={() => onSelectScenario('unhealthy-haze')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentScenario === 'unhealthy-haze'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
            title="Simulate regional haze exceeding 100 PSI to test push notifications"
          >
            <span>Simulate Haze (148 PSI)</span>
          </button>

          <button
            onClick={() => onSelectScenario('very-unhealthy-emergency')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentScenario === 'very-unhealthy-emergency'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
            title="Simulate severe haze crisis (>200 PSI) to test emergency alerts"
          >
            <span>Severe Spike (235 PSI)</span>
          </button>

          <button
            onClick={() => onSelectScenario('clean-tropical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentScenario === 'clean-tropical'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Clean Day (28 PSI)
          </button>

          <button
            onClick={onRefreshLive}
            disabled={isLoading}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Fetch latest reading"
            aria-label="Refresh live data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
