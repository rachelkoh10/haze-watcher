import React from 'react';
import { AirAlertRecord } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/psiData';
import { ShieldAlert, AlertTriangle, ArrowRight, X, Volume2 } from 'lucide-react';

interface AlertBannerProps {
  activeAlerts: AirAlertRecord[];
  onOpenAlertSettings: () => void;
  onDismiss: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  activeAlerts,
  onOpenAlertSettings,
  onDismiss,
}) => {
  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const regionName = SINGAPORE_REGIONS[topAlert.region]?.name || topAlert.region;
  const isCritical = topAlert.category === 'Very Unhealthy' || topAlert.category === 'Hazardous';

  return (
    <div
      className={`border-b transition-colors py-3 px-4 sm:px-6 relative ${
        isCritical
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight mr-1.5 uppercase">
              AIR QUALITY THRESHOLD TRIGGERED:
            </span>
            <span className="font-semibold text-slate-900">{regionName}</span>{' '}
            <span className="font-mono font-bold">
              ({topAlert.metric} {topAlert.value})
            </span>
            <span className="hidden md:inline text-slate-700 ml-1.5">
              · {topAlert.advisory}
            </span>
            {activeAlerts.length > 1 && (
              <span className="ml-2 font-mono text-[11px] bg-white/80 px-1.5 py-0.5 rounded border border-slate-300">
                +{activeAlerts.length - 1} more alert{activeAlerts.length > 2 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAlertSettings}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 ${
              isCritical
                ? 'bg-rose-900 text-white hover:bg-rose-950'
                : 'bg-amber-900 text-white hover:bg-amber-950'
            }`}
          >
            <span>Manage Push Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDismiss(topAlert.id)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-slate-600"
            aria-label="Dismiss banner alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
