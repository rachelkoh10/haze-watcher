export type RegionId = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionMetadata {
  id: RegionId;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  landmarks: string[];
}

export type PSICategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export type PM25Category = 'Normal' | 'Elevated' | 'High' | 'Very High';

export interface PSIBandInfo {
  category: PSICategory;
  range: [number, number];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
  summary: string;
  healthyAdvisory: string;
  vulnerableAdvisory: string;
  chronicAdvisory: string;
}

export interface MetricReading {
  psi24h: number;
  pm25OneHour: number;
  pm25TwentyFourHour: number;
  pm10TwentyFourHour: number;
  o3EightHour: number;
  so2TwentyFourHour: number;
  coEightHour: number;
  no2OneHour: number;
}

export interface RegionalReadingMap {
  national: MetricReading;
  north: MetricReading;
  south: MetricReading;
  east: MetricReading;
  west: MetricReading;
  central: MetricReading;
}

export interface HourlyHistoricalRecord {
  timestamp: string; // ISO or '14:00'
  hourLabel: string;
  readings: Record<RegionId, number>; // PSI value
  pm25Readings: Record<RegionId, number>; // PM2.5 1-hr value
}

export interface AirQualityState {
  timestamp: string;
  updateTimestamp: string;
  source: 'live-gov-sg' | 'fallback-live' | 'simulation';
  scenarioName?: string;
  windSpeedKmh: number;
  windDirectionDegrees: number; // e.g., 210 for SW monsoon
  windDirectionLabel: string;
  readings: RegionalReadingMap;
  history: HourlyHistoricalRecord[];
  isLoading: boolean;
  lastSuccessfulFetch: string | null;
  error: string | null;
}

export interface PushNotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  psiThreshold: number; // default 101 for Unhealthy
  pm25Threshold: number; // default 56 for Elevated
  alertOnPsi: boolean;
  alertOnPm25: boolean;
  subscribedRegions: RegionId[];
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietStart: string; // "22:00"
  quietEnd: string; // "07:00"
}

export interface AirAlertRecord {
  id: string;
  timestamp: string;
  region: RegionId;
  metric: 'PSI' | 'PM2.5';
  value: number;
  threshold: number;
  category: PSICategory | PM25Category;
  advisory: string;
  dismissed: boolean;
}
