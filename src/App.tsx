/**
 * BreatheSG - Singapore Live PSI & Air Quality Alert Monitor
 * Full frontend application tracking live NEA PSI & PM2.5 with interactive map and push notifications.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AirAlertRecord,
  AirQualityState,
  PushNotificationSettings,
  RegionId,
} from './types/psi';
import { airQualityService } from './services/airQualityService';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { HeroOverview } from './components/HeroOverview';
import { SimulationControls } from './components/SimulationControls';
import { SingaporeMap } from './components/SingaporeMap';
import { RegionalOverview } from './components/RegionalOverview';
import { HealthAdvisory } from './components/HealthAdvisory';
import { TrendChart } from './components/TrendChart';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { SINGAPORE_REGIONS } from './constants/psiData';
import { RefreshCw, Bell, Shield, MapPin, Activity, HelpCircle } from 'lucide-react';

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: true,
  permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  psiThreshold: 101, // Singapore NEA Unhealthy threshold
  pm25Threshold: 56, // Singapore NEA Band II Elevated threshold
  alertOnPsi: true,
  alertOnPm25: true,
  subscribedRegions: ['national', 'north', 'south', 'east', 'west', 'central'],
  soundEnabled: true,
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

export default function App() {
  const [data, setData] = useState<AirQualityState | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [activeMetric, setActiveMetric] = useState<'psi24h' | 'pm25OneHour'>('psi24h');
  const [currentScenario, setCurrentScenario] = useState<string>('live');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<AirAlertRecord[]>([]);
  const [alertHistory, setAlertHistory] = useState<AirAlertRecord[]>([]);

  // Push notification settings with localStorage persistence
  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('breathe_sg_notification_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
        };
      }
    } catch {
      // LocalStorage error fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Load alert history from storage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('breathe_sg_alert_history');
      if (savedHistory) {
        setAlertHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Fail quietly
    }
  }, []);

  // Save settings when changed
  const updateSettings = useCallback((newSettings: PushNotificationSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('breathe_sg_notification_settings', JSON.stringify(newSettings));
    } catch {
      // Fail quietly
    }
  }, []);

  // Save alert history helper
  const addAlertsToHistory = useCallback((newAlerts: AirAlertRecord[]) => {
    setAlertHistory((prev) => {
      const combined = [...newAlerts, ...prev].slice(0, 50); // keep last 50
      try {
        localStorage.setItem('breathe_sg_alert_history', JSON.stringify(combined));
      } catch {
        // Fail quietly
      }
      return combined;
    });
  }, []);

  // Fetch air quality data
  const loadData = useCallback(async (scenarioKey: string = 'live') => {
    setData((prev) => (prev ? { ...prev, isLoading: true } : null));
    try {
      const result = await airQualityService.fetchLiveAirQuality(scenarioKey);
      setData(result);

      // Evaluate active alerts against user notification thresholds
      const alerts = airQualityService.evaluateAlertThresholds(result.readings, settings);
      setActiveAlerts(alerts);

      if (alerts.length > 0) {
        // Send push notification for primary breach
        airQualityService.triggerPushNotification(alerts[0], settings.soundEnabled);
        addAlertsToHistory(alerts);
      }
    } catch (err) {
      console.error('Failed to load air quality data', err);
    }
  }, [settings, addAlertsToHistory]);

  // Initial load
  useEffect(() => {
    loadData(currentScenario);
  }, []);

  // Periodic refresh every 5 minutes (standard NEA refresh interval)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(currentScenario);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentScenario, loadData]);

  // Handle switching scenario (e.g. testing unhealthy haze vs live NEA)
  const handleSelectScenario = async (scenarioKey: string) => {
    setCurrentScenario(scenarioKey);
    await loadData(scenarioKey);
  };

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        updateSettings({ ...settings, permission });
        if (permission === 'granted') {
          // Send friendly welcome test alert
          const testAlert: AirAlertRecord = {
            id: `perm-granted-${Date.now()}`,
            timestamp: new Date().toISOString(),
            region: 'national',
            metric: 'PSI',
            value: data?.readings.national.psi24h ?? 52,
            threshold: settings.psiThreshold,
            category: 'Good',
            advisory: 'Browser push notifications successfully enabled for BreatheSG air alerts.',
            dismissed: false,
          };
          airQualityService.triggerPushNotification(testAlert, settings.soundEnabled);
          addAlertsToHistory([testAlert]);
        }
      } catch (e) {
        console.error('Permission request failed', e);
      }
    }
  };

  // Trigger explicit test push notification
  const handleSendTestNotification = () => {
    const testAlert: AirAlertRecord = {
      id: `test-alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      region: selectedRegion !== 'national' ? selectedRegion : 'west',
      metric: 'PSI',
      value: 125,
      threshold: settings.psiThreshold,
      category: 'Unhealthy',
      advisory: 'TEST PUSH ALERT: Unhealthy PSI threshold breached. Outdoor exertion should be reduced.',
      dismissed: false,
    };

    airQualityService.triggerPushNotification(testAlert, settings.soundEnabled);
    setActiveAlerts((prev) => [testAlert, ...prev]);
    addAlertsToHistory([testAlert]);
  };

  const handleDismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearHistory = () => {
    setAlertHistory([]);
    try {
      localStorage.removeItem('breathe_sg_alert_history');
    } catch {
      // Fail quietly
    }
  };

  const handleOpenAlertSettingsWithRegion = (targetRegion?: RegionId) => {
    if (targetRegion && !settings.subscribedRegions.includes(targetRegion)) {
      updateSettings({
        ...settings,
        subscribedRegions: [...settings.subscribedRegions, targetRegion],
      });
    }
    setIsAlertModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Header following strict 3-zone contract */}
      <Header
        onOpenAlertSettings={() => setIsAlertModalOpen(true)}
        activeAlertCount={activeAlerts.length}
      />

      {/* Threshold Breach Alert Banner (Sticky alert bar if active) */}
      <AlertBanner
        activeAlerts={activeAlerts}
        onOpenAlertSettings={() => setIsAlertModalOpen(true)}
        onDismiss={handleDismissAlert}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {data ? (
          <>
            {/* Hero & National KPI Overview */}
            <HeroOverview
              data={data}
              onOpenAlertSettings={() => setIsAlertModalOpen(true)}
            />

            {/* Simulation & Live Feed Control Toolbar */}
            <SimulationControls
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
              onRefreshLive={() => loadData(currentScenario)}
              isLoading={data.isLoading}
              dataSource={data.source}
              lastUpdated={data.updateTimestamp}
            />

            {/* Interactive Singapore Map Section */}
            <section id="live-map" className="scroll-mt-20">
              <SingaporeMap
                readings={data.readings}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                activeMetric={activeMetric}
                onChangeMetric={setActiveMetric}
                windSpeedKmh={data.windSpeedKmh}
                windDirectionDegrees={data.windDirectionDegrees}
                windDirectionLabel={data.windDirectionLabel}
              />
            </section>

            {/* Regional Breakdown Cards */}
            <section id="regions" className="scroll-mt-20">
              <RegionalOverview
                readings={data.readings}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                onOpenAlertSettings={handleOpenAlertSettingsWithRegion}
              />
            </section>

            {/* Official Singapore NEA / MOH Health Advisory */}
            <section id="advisory" className="scroll-mt-20">
              <HealthAdvisory
                selectedRegion={selectedRegion}
                readings={data.readings}
              />
            </section>

            {/* 24-Hour Trend Chart */}
            <section id="trends" className="scroll-mt-20">
              <TrendChart
                history={data.history}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            </section>
          </>
        ) : (
          /* Loading State */
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-slate-900">
              Connecting to Singapore Air Quality Telemetry...
            </h3>
            <p className="text-xs text-slate-500">
              Querying National Environment Agency (NEA) open data API
            </p>
          </div>
        )}
      </main>

      {/* Push Notification & Threshold Settings Modal */}
      <NotificationSettingsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onRequestPermission={handleRequestPermission}
        onSendTestNotification={handleSendTestNotification}
        alertHistory={alertHistory}
        onClearHistory={handleClearHistory}
        onDismissAlert={handleDismissAlert}
      />

      {/* Quiet, Human Editorial Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">BreatheSG</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Ambient Air Monitoring System</span>
            <span aria-hidden="true">·</span>
            <span>Data source: api.data.gov.sg (NEA)</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://www.nea.gov.sg/our-services/pollution-control/air-pollution/faqs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              NEA PSI Guide
            </a>
            <a
              href="https://www.moh.gov.sg/resources-statistics/educational-resources/haze"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              MOH Health Guidance
            </a>
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Push Notification Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
