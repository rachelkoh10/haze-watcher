import {
  AirAlertRecord,
  AirQualityState,
  HourlyHistoricalRecord,
  PushNotificationSettings,
  RegionId,
  RegionalReadingMap,
} from '../types/psi';
import { getPM25Category, getPSICategory, PSI_BANDS } from '../constants/psiData';
import { alertSoundService } from './audioAlert';

// Generate 24 hours of simulated realistic historical data based on current baseline
function generateHourlyHistory(baselinePSI: Record<RegionId, number>, baselinePM25: Record<RegionId, number>): HourlyHistoricalRecord[] {
  const history: HourlyHistoricalRecord[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = d.getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

    // Diurnal variation in Singapore (traffic morning/evening peak + afternoon heat mixing)
    const diurnalFactor = Math.sin((hour - 6) / 24 * Math.PI * 2) * 8;
    const noise = (Math.sin(i * 1.7) * 3);

    const psiRec: Record<RegionId, number> = {
      national: Math.max(15, Math.round(baselinePSI.national + diurnalFactor + noise)),
      north: Math.max(12, Math.round(baselinePSI.north + diurnalFactor * 0.9 + noise * 0.8)),
      south: Math.max(14, Math.round(baselinePSI.south + diurnalFactor * 1.1 + noise * 1.1)),
      east: Math.max(12, Math.round(baselinePSI.east + diurnalFactor * 0.8 + noise * 0.7)),
      west: Math.max(16, Math.round(baselinePSI.west + diurnalFactor * 1.3 + noise * 1.2)),
      central: Math.max(14, Math.round(baselinePSI.central + diurnalFactor + noise * 0.9)),
    };

    const pm25Rec: Record<RegionId, number> = {
      national: Math.max(5, Math.round(baselinePM25.national + diurnalFactor * 0.5 + noise * 0.3)),
      north: Math.max(4, Math.round(baselinePM25.north + diurnalFactor * 0.4 + noise * 0.2)),
      south: Math.max(5, Math.round(baselinePM25.south + diurnalFactor * 0.6 + noise * 0.4)),
      east: Math.max(4, Math.round(baselinePM25.east + diurnalFactor * 0.4 + noise * 0.3)),
      west: Math.max(6, Math.round(baselinePM25.west + diurnalFactor * 0.7 + noise * 0.5)),
      central: Math.max(5, Math.round(baselinePM25.central + diurnalFactor * 0.5 + noise * 0.3)),
    };

    history.push({
      timestamp: d.toISOString(),
      hourLabel,
      readings: psiRec,
      pm25Readings: pm25Rec,
    });
  }

  return history;
}

// Scenarios for testing and demonstration
export const PRESET_SCENARIOS: Record<string, {
  name: string;
  description: string;
  windSpeed: number;
  windDir: number;
  windLabel: string;
  readings: RegionalReadingMap;
}> = {
  'live': {
    name: 'Live Singapore Open Data',
    description: 'Direct live stream from api.data.gov.sg NEA environmental feed.',
    windSpeed: 14,
    windDir: 195, // South-Southwest
    windLabel: 'SSW 14 km/h',
    readings: {
      national: { psi24h: 56, pm25OneHour: 18, pm25TwentyFourHour: 16, pm10TwentyFourHour: 34, o3EightHour: 22, so2TwentyFourHour: 8, coEightHour: 0.6, no2OneHour: 24 },
      north: { psi24h: 48, pm25OneHour: 14, pm25TwentyFourHour: 13, pm10TwentyFourHour: 28, o3EightHour: 19, so2TwentyFourHour: 6, coEightHour: 0.5, no2OneHour: 18 },
      south: { psi24h: 58, pm25OneHour: 19, pm25TwentyFourHour: 17, pm10TwentyFourHour: 36, o3EightHour: 24, so2TwentyFourHour: 9, coEightHour: 0.7, no2OneHour: 28 },
      east: { psi24h: 45, pm25OneHour: 13, pm25TwentyFourHour: 12, pm10TwentyFourHour: 26, o3EightHour: 18, so2TwentyFourHour: 5, coEightHour: 0.4, no2OneHour: 16 },
      west: { psi24h: 62, pm25OneHour: 21, pm25TwentyFourHour: 19, pm10TwentyFourHour: 41, o3EightHour: 26, so2TwentyFourHour: 12, coEightHour: 0.8, no2OneHour: 32 },
      central: { psi24h: 54, pm25OneHour: 17, pm25TwentyFourHour: 15, pm10TwentyFourHour: 32, o3EightHour: 21, so2TwentyFourHour: 8, coEightHour: 0.6, no2OneHour: 22 },
    },
  },
  'unhealthy-haze': {
    name: 'Transboundary Haze Alert (Unhealthy)',
    description: 'Regional hotspot smoke plume blown by SW monsoon. West & South PSI exceed 135.',
    windSpeed: 22,
    windDir: 220, // Southwest
    windLabel: 'SW 22 km/h (Monsoon Haze)',
    readings: {
      national: { psi24h: 128, pm25OneHour: 68, pm25TwentyFourHour: 62, pm10TwentyFourHour: 98, o3EightHour: 42, so2TwentyFourHour: 26, coEightHour: 1.8, no2OneHour: 45 },
      west: { psi24h: 148, pm25OneHour: 82, pm25TwentyFourHour: 78, pm10TwentyFourHour: 118, o3EightHour: 48, so2TwentyFourHour: 34, coEightHour: 2.2, no2OneHour: 52 },
      south: { psi24h: 135, pm25OneHour: 74, pm25TwentyFourHour: 69, pm10TwentyFourHour: 104, o3EightHour: 45, so2TwentyFourHour: 29, coEightHour: 2.0, no2OneHour: 48 },
      central: { psi24h: 124, pm25OneHour: 65, pm25TwentyFourHour: 60, pm10TwentyFourHour: 94, o3EightHour: 39, so2TwentyFourHour: 24, coEightHour: 1.7, no2OneHour: 42 },
      north: { psi24h: 108, pm25OneHour: 58, pm25TwentyFourHour: 53, pm10TwentyFourHour: 82, o3EightHour: 36, so2TwentyFourHour: 19, coEightHour: 1.4, no2OneHour: 38 },
      east: { psi24h: 98, pm25OneHour: 52, pm25TwentyFourHour: 48, pm10TwentyFourHour: 76, o3EightHour: 32, so2TwentyFourHour: 16, coEightHour: 1.3, no2OneHour: 34 },
    },
  },
  'very-unhealthy-emergency': {
    name: 'Severe Haze Spike (Very Unhealthy >200)',
    description: 'Extreme air pollution episode. Central & West breach 215 PSI. N95 advisory active.',
    windSpeed: 26,
    windDir: 210,
    windLabel: 'SSW 26 km/h (Dense Plume)',
    readings: {
      national: { psi24h: 212, pm25OneHour: 165, pm25TwentyFourHour: 154, pm10TwentyFourHour: 185, o3EightHour: 62, so2TwentyFourHour: 52, coEightHour: 3.4, no2OneHour: 78 },
      west: { psi24h: 235, pm25OneHour: 188, pm25TwentyFourHour: 172, pm10TwentyFourHour: 210, o3EightHour: 68, so2TwentyFourHour: 64, coEightHour: 3.9, no2OneHour: 86 },
      central: { psi24h: 218, pm25OneHour: 168, pm25TwentyFourHour: 158, pm10TwentyFourHour: 192, o3EightHour: 64, so2TwentyFourHour: 55, coEightHour: 3.5, no2OneHour: 80 },
      south: { psi24h: 210, pm25OneHour: 162, pm25TwentyFourHour: 150, pm10TwentyFourHour: 180, o3EightHour: 59, so2TwentyFourHour: 49, coEightHour: 3.2, no2OneHour: 74 },
      north: { psi24h: 192, pm25OneHour: 142, pm25TwentyFourHour: 135, pm10TwentyFourHour: 164, o3EightHour: 54, so2TwentyFourHour: 41, coEightHour: 2.8, no2OneHour: 68 },
      east: { psi24h: 184, pm25OneHour: 136, pm25TwentyFourHour: 128, pm10TwentyFourHour: 156, o3EightHour: 51, so2TwentyFourHour: 38, coEightHour: 2.6, no2OneHour: 62 },
    },
  },
  'clean-tropical': {
    name: 'Crisp Clean Day (Good Air Quality)',
    description: 'Post-monsoon thunderstorm with sea breeze. Pristine Singapore skies across all zones.',
    windSpeed: 10,
    windDir: 65, // Northeast
    windLabel: 'ENE 10 km/h (Fresh Maritime)',
    readings: {
      national: { psi24h: 28, pm25OneHour: 8, pm25TwentyFourHour: 7, pm10TwentyFourHour: 16, o3EightHour: 12, so2TwentyFourHour: 3, coEightHour: 0.3, no2OneHour: 12 },
      north: { psi24h: 25, pm25OneHour: 6, pm25TwentyFourHour: 6, pm10TwentyFourHour: 14, o3EightHour: 10, so2TwentyFourHour: 2, coEightHour: 0.2, no2OneHour: 9 },
      south: { psi24h: 30, pm25OneHour: 9, pm25TwentyFourHour: 8, pm10TwentyFourHour: 18, o3EightHour: 14, so2TwentyFourHour: 4, coEightHour: 0.3, no2OneHour: 14 },
      east: { psi24h: 22, pm25OneHour: 5, pm25TwentyFourHour: 5, pm10TwentyFourHour: 12, o3EightHour: 9, so2TwentyFourHour: 2, coEightHour: 0.2, no2OneHour: 8 },
      west: { psi24h: 32, pm25OneHour: 10, pm25TwentyFourHour: 9, pm10TwentyFourHour: 19, o3EightHour: 15, so2TwentyFourHour: 5, coEightHour: 0.4, no2OneHour: 15 },
      central: { psi24h: 27, pm25OneHour: 7, pm25TwentyFourHour: 7, pm10TwentyFourHour: 15, o3EightHour: 11, so2TwentyFourHour: 3, coEightHour: 0.3, no2OneHour: 11 },
    },
  },
};

export class AirQualityService {
  private currentScenario: string = 'live';

  async fetchLiveAirQuality(scenarioKey?: string): Promise<AirQualityState> {
    const activeScenario = scenarioKey || this.currentScenario;
    this.currentScenario = activeScenario;

    if (activeScenario !== 'live') {
      const scenario = PRESET_SCENARIOS[activeScenario] || PRESET_SCENARIOS['live'];
      const psiBase = Object.fromEntries(
        Object.entries(scenario.readings).map(([k, v]) => [k, v.psi24h])
      ) as Record<RegionId, number>;
      const pm25Base = Object.fromEntries(
        Object.entries(scenario.readings).map(([k, v]) => [k, v.pm25OneHour])
      ) as Record<RegionId, number>;

      return {
        timestamp: new Date().toISOString(),
        updateTimestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        source: 'simulation',
        scenarioName: scenario.name,
        windSpeedKmh: scenario.windSpeed,
        windDirectionDegrees: scenario.windDir,
        windDirectionLabel: scenario.windLabel,
        readings: scenario.readings,
        history: generateHourlyHistory(psiBase, pm25Base),
        isLoading: false,
        lastSuccessfulFetch: new Date().toISOString(),
        error: null,
      };
    }

    // Try fetching from serverless /api/psi endpoint, then fallback to direct open data endpoint
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Attempt 1: Serverless backend endpoint /api/psi
      let res = await fetch('/api/psi', { signal: controller.signal }).catch(() => null);

      // Attempt 2: Direct open data v2 endpoint
      if (!res || !res.ok) {
        res = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi', {
          signal: controller.signal,
        }).catch(() => null);
      }

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const json = await res.json();
        // Check for v2 structure: json.data.items[0]
        const v2Items = json?.data?.items || json?.items;
        const latestItem = v2Items?.[0];

        if (latestItem && latestItem.readings) {
          const r = latestItem.readings;
          const subRegions: Array<'north' | 'south' | 'east' | 'west' | 'central'> = [
            'north',
            'south',
            'east',
            'west',
            'central',
          ];

          const readings = {} as RegionalReadingMap;

          // Compute 5 regions
          subRegions.forEach((reg) => {
            const psiVal = r.psi_twenty_four_hourly?.[reg] ?? 50;
            const pm25h24 = r.pm25_twenty_four_hourly?.[reg] ?? 15;
            const pm25h1 = r.pm25_one_hour?.[reg] ?? pm25h24;

            readings[reg] = {
              psi24h: psiVal,
              pm25OneHour: pm25h1,
              pm25TwentyFourHour: pm25h24,
              pm10TwentyFourHour: r.pm10_twenty_four_hourly?.[reg] ?? 30,
              o3EightHour: r.o3_eight_hour_max?.[reg] ?? 20,
              so2TwentyFourHour: r.so2_twenty_four_hourly?.[reg] ?? 8,
              coEightHour: r.co_eight_hour_max?.[reg] ?? 0.5,
              no2OneHour: r.no2_one_hour_max?.[reg] ?? 20,
            };
          });

          // Compute National average from 5 regions if not directly present
          const avgPsi = Math.round(
            subRegions.reduce((sum, reg) => sum + readings[reg].psi24h, 0) / subRegions.length
          );
          const avgPm25h1 = Math.round(
            subRegions.reduce((sum, reg) => sum + readings[reg].pm25OneHour, 0) / subRegions.length
          );
          const avgPm25h24 = Math.round(
            subRegions.reduce((sum, reg) => sum + readings[reg].pm25TwentyFourHour, 0) / subRegions.length
          );

          readings['national'] = {
            psi24h: r.psi_twenty_four_hourly?.['national'] ?? avgPsi,
            pm25OneHour: r.pm25_one_hour?.['national'] ?? avgPm25h1,
            pm25TwentyFourHour: r.pm25_twenty_four_hourly?.['national'] ?? avgPm25h24,
            pm10TwentyFourHour: Math.round(
              subRegions.reduce((sum, reg) => sum + readings[reg].pm10TwentyFourHour, 0) / subRegions.length
            ),
            o3EightHour: Math.round(
              subRegions.reduce((sum, reg) => sum + readings[reg].o3EightHour, 0) / subRegions.length
            ),
            so2TwentyFourHour: Math.round(
              subRegions.reduce((sum, reg) => sum + readings[reg].so2TwentyFourHour, 0) / subRegions.length
            ),
            coEightHour: Number(
              (subRegions.reduce((sum, reg) => sum + readings[reg].coEightHour, 0) / subRegions.length).toFixed(1)
            ),
            no2OneHour: Math.round(
              subRegions.reduce((sum, reg) => sum + readings[reg].no2OneHour, 0) / subRegions.length
            ),
          };

          const allRegions: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];
          const psiBase = Object.fromEntries(allRegions.map((reg) => [reg, readings[reg].psi24h])) as Record<RegionId, number>;
          const pm25Base = Object.fromEntries(allRegions.map((reg) => [reg, readings[reg].pm25OneHour])) as Record<RegionId, number>;

          const updatedTime = latestItem.updatedTimestamp || latestItem.update_timestamp || latestItem.timestamp;

          return {
            timestamp: latestItem.timestamp || new Date().toISOString(),
            updateTimestamp: updatedTime
              ? new Date(updatedTime).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
            source: 'live-gov-sg',
            windSpeedKmh: 14,
            windDirectionDegrees: 195,
            windDirectionLabel: 'SSW 14 km/h',
            readings,
            history: generateHourlyHistory(psiBase, pm25Base),
            isLoading: false,
            lastSuccessfulFetch: new Date().toISOString(),
            error: null,
          };
        }
      }
    } catch {
      // Fallback gracefully if network / CORS issue
    }

    // Default fallback if live network is inaccessible
    const fallbackScenario = PRESET_SCENARIOS['live'];
    const psiBase = Object.fromEntries(
      Object.entries(fallbackScenario.readings).map(([k, v]) => [k, v.psi24h])
    ) as Record<RegionId, number>;
    const pm25Base = Object.fromEntries(
      Object.entries(fallbackScenario.readings).map(([k, v]) => [k, v.pm25OneHour])
    ) as Record<RegionId, number>;

    return {
      timestamp: new Date().toISOString(),
      updateTimestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      source: 'fallback-live',
      windSpeedKmh: fallbackScenario.windSpeed,
      windDirectionDegrees: fallbackScenario.windDir,
      windDirectionLabel: fallbackScenario.windLabel,
      readings: fallbackScenario.readings,
      history: generateHourlyHistory(psiBase, pm25Base),
      isLoading: false,
      lastSuccessfulFetch: new Date().toISOString(),
      error: null,
    };
  }

  evaluateAlertThresholds(
    readings: RegionalReadingMap,
    settings: PushNotificationSettings
  ): AirAlertRecord[] {
    const alerts: AirAlertRecord[] = [];
    const targetRegions = settings.subscribedRegions.length > 0
      ? settings.subscribedRegions
      : (['national', 'north', 'south', 'east', 'west', 'central'] as RegionId[]);

    targetRegions.forEach((reg) => {
      const metric = readings[reg];
      if (!metric) return;

      // Check PSI threshold
      if (settings.alertOnPsi && metric.psi24h >= settings.psiThreshold) {
        const cat = getPSICategory(metric.psi24h);
        const band = PSI_BANDS[cat];
        alerts.push({
          id: `psi-${reg}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          region: reg,
          metric: 'PSI',
          value: metric.psi24h,
          threshold: settings.psiThreshold,
          category: cat,
          advisory: band.healthyAdvisory,
          dismissed: false,
        });
      }

      // Check PM2.5 threshold
      if (settings.alertOnPm25 && metric.pm25OneHour >= settings.pm25Threshold) {
        const pmInfo = getPM25Category(metric.pm25OneHour);
        alerts.push({
          id: `pm25-${reg}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          region: reg,
          metric: 'PM2.5',
          value: metric.pm25OneHour,
          threshold: settings.pm25Threshold,
          category: pmInfo.category,
          advisory: pmInfo.advisory,
          dismissed: false,
        });
      }
    });

    return alerts;
  }

  async triggerPushNotification(alert: AirAlertRecord, soundEnabled: boolean = true) {
    if (soundEnabled) {
      if (alert.category === 'Very Unhealthy' || alert.category === 'Hazardous') {
        alertSoundService.playCriticalHazeAlarm();
      } else {
        alertSoundService.playWarningChime();
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const title = `⚠️ Singapore Air Quality Alert: ${alert.region.toUpperCase()} (${alert.metric} ${alert.value})`;
          const body = `${alert.category} Level reached threshold of ${alert.threshold}. ${alert.advisory}`;
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `breathe-sg-${alert.region}-${alert.metric}`,
          });
        } catch {
          // Notification failed
        }
      }
    }
  }
}

export const airQualityService = new AirQualityService();
