import React from 'react';
import { Bell, BellRing } from 'lucide-react';

interface HeaderProps {
  onOpenAlertSettings: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlertSettings,
  activeAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          BreatheSG
        </a>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#live-map"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Live Map
          </a>
          <a
            href="#regions"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Regional PSI
          </a>
          <a
            href="#advisory"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Health Advisory
          </a>
          <a
            href="#trends"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            24h Trends
          </a>
          <button
            onClick={onOpenAlertSettings}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Push Alerts
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAlertSettings}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {activeAlertCount > 0 ? (
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4 text-slate-300" />
            )}
            <span>Alert Preferences</span>
            {activeAlertCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
