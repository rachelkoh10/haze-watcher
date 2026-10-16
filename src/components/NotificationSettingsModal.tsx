import React, { useState } from 'react';
import { AirAlertRecord, PushNotificationSettings, RegionId } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/psiData';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Sliders,
  History,
  Trash2,
  Info,
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PushNotificationSettings;
  onUpdateSettings: (newSettings: PushNotificationSettings) => void;
  onRequestPermission: () => Promise<void>;
  onSendTestNotification: () => void;
  alertHistory: AirAlertRecord[];
  onClearHistory: () => void;
  onDismissAlert: (id: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRequestPermission,
  onSendTestNotification,
  alertHistory,
  onClearHistory,
  onDismissAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  if (!isOpen) return null;

  const toggleRegion = (region: RegionId) => {
    let updated: RegionId[];
    if (settings.subscribedRegions.includes(region)) {
      updated = settings.subscribedRegions.filter((r) => r !== region);
    } else {
      updated = [...settings.subscribedRegions, region];
    }
    onUpdateSettings({ ...settings, subscribedRegions: updated });
  };

  const selectAllRegions = () => {
    const all: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];
    onUpdateSettings({ ...settings, subscribedRegions: all });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Push Notifications &amp; Air Quality Alerts
              </h2>
              <div className="text-xs text-slate-500">
                Automated threshold monitoring for Singapore haze &amp; particulate spikes
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex border-b border-slate-100 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'settings'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Alert Thresholds &amp; Zones
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Alert Log ({alertHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'settings' ? (
            <>
              {/* Browser Permission Status Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                      Browser Push Permission
                    </span>
                    <span className="text-slate-400">·</span>
                    <span
                      className={`text-xs font-semibold ${
                        settings.permission === 'granted'
                          ? 'text-emerald-700'
                          : settings.permission === 'denied'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {settings.permission === 'granted'
                        ? 'Active (Granted)'
                        : settings.permission === 'denied'
                        ? 'Blocked in Browser'
                        : 'Action Required'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {settings.permission === 'granted'
                      ? 'Push alerts will display natively when threshold events occur.'
                      : settings.permission === 'denied'
                      ? 'Notifications are blocked. Please enable site permissions in your browser URL bar.'
                      : 'Enable notifications to receive alerts even when this tab is in background.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {settings.permission !== 'granted' && (
                    <button
                      onClick={onRequestPermission}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Enable Browser Alerts
                    </button>
                  )}
                  <button
                    onClick={onSendTestNotification}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-500" />
                    Test Push Alert
                  </button>
                </div>
              </div>

              {/* Threshold Sliders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Threshold Trigger Levels
                </h3>

                {/* PSI Threshold Slider */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        24-Hour PSI Alert Trigger
                      </div>
                      <div className="text-xs text-slate-500">
                        Default: 101 PSI (Singapore NEA 'Unhealthy' Level)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                        {settings.psiThreshold}
                      </span>
                      <span className="text-xs font-mono text-slate-500 ml-1">PSI</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="5"
                    value={settings.psiThreshold}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, psiThreshold: parseInt(e.target.value) })
                    }
                    className="w-full accent-slate-900 cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>50 (Moderate)</span>
                    <span className="text-amber-600 font-semibold">101 (Unhealthy)</span>
                    <span className="text-rose-600 font-semibold">201 (Very Unhealthy)</span>
                  </div>
                </div>

                {/* 1-hr PM2.5 Slider */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        1-Hour PM2.5 Alert Trigger
                      </div>
                      <div className="text-xs text-slate-500">
                        Default: 56 µg/m³ (Band II 'Elevated' fine particulate plume)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                        {settings.pm25Threshold}
                      </span>
                      <span className="text-xs font-mono text-slate-500 ml-1">µg/m³</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="25"
                    max="180"
                    step="5"
                    value={settings.pm25Threshold}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, pm25Threshold: parseInt(e.target.value) })
                    }
                    className="w-full accent-slate-900 cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>25 µg/m³</span>
                    <span className="text-amber-600 font-semibold">56 µg/m³ (Elevated)</span>
                    <span className="text-rose-600 font-semibold">151 µg/m³ (High)</span>
                  </div>
                </div>
              </div>

              {/* Subscribed Regions Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subscribed Monitoring Zones
                    </h3>
                    <div className="text-xs text-slate-500">
                      Receive alerts only when selected regions breach your trigger thresholds
                    </div>
                  </div>
                  <button
                    onClick={selectAllRegions}
                    className="text-xs font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                  >
                    Select All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionId[]).map((r) => {
                    const meta = SINGAPORE_REGIONS[r];
                    const isChecked = settings.subscribedRegions.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRegion(r)}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-semibold text-xs truncate">{meta.shortName}</span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isChecked ? 'bg-white text-slate-900' : 'border border-slate-300'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Audio Warning Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">
                      Web Audio Alert Chime
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Plays polite audible tone when air quality shifts into unhealthy territory
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    settings.soundEnabled
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {settings.soundEnabled ? 'Chime Enabled' : 'Muted'}
                </button>
              </div>
            </>
          ) : (
            /* Tab: Alert History Log */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <div className="text-xs text-slate-500">
                  Chronological record of recent threshold breaches &amp; push events
                </div>
                {alertHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {alertHistory.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-slate-900 text-sm">No Active Alert Breaches</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Air quality has remained within your configured safety thresholds.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alertHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 uppercase">
                            {SINGAPORE_REGIONS[item.region]?.name || item.region}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono font-bold text-rose-700">
                            {item.metric}: {item.value}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono">
                            Threshold: {item.threshold}
                          </span>
                        </div>
                        <p className="text-slate-600">{item.advisory}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('en-SG', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => onDismissAlert(item.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Dismiss alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Settings persist locally in your browser storage.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
