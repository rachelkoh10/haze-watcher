import { RegionId, RegionMetadata, PSIBandInfo, PSICategory, PM25Category } from '../types/psi';

export const SINGAPORE_REGIONS: Record<RegionId, RegionMetadata> = {
  national: {
    id: 'national',
    name: 'Singapore Overall',
    shortName: 'Overall',
    latitude: 1.3521,
    longitude: 103.8198,
    landmarks: ['Islandwide Aggregate', 'Changi to Tuas', 'Woodlands to Sentosa'],
  },
  north: {
    id: 'north',
    name: 'North Region',
    shortName: 'North',
    latitude: 1.41803,
    longitude: 103.82,
    landmarks: ['Woodlands', 'Sembawang', 'Yishun', 'Mandai', 'Kranji'],
  },
  south: {
    id: 'south',
    name: 'South Region',
    shortName: 'South',
    latitude: 1.29587,
    longitude: 103.82,
    landmarks: ['Marina Bay', 'Sentosa', 'Tanjong Pagar', 'Bukit Merah', 'Telok Blangah'],
  },
  east: {
    id: 'east',
    name: 'East Region',
    shortName: 'East',
    latitude: 1.35735,
    longitude: 103.94,
    landmarks: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar'],
  },
  west: {
    id: 'west',
    name: 'West Region',
    shortName: 'West',
    latitude: 1.35735,
    longitude: 103.7,
    landmarks: ['Jurong East', 'Jurong West', 'Tuas', 'Clementi', 'Bukit Batok'],
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortName: 'Central',
    latitude: 1.35735,
    longitude: 103.82,
    landmarks: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Novena', 'Orchard'],
  },
};

export const PSI_BANDS: Record<PSICategory, PSIBandInfo> = {
  Good: {
    category: 'Good',
    range: [0, 50],
    color: '#059669', // Emerald 600
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    textColor: '#065f46',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    summary: 'Air quality is satisfactory and poses little to no risk.',
    healthyAdvisory: 'Normal outdoor activities may be continued as usual.',
    vulnerableAdvisory: 'Normal outdoor activities may be continued as usual.',
    chronicAdvisory: 'Normal outdoor activities may be continued as usual.',
  },
  Moderate: {
    category: 'Moderate',
    range: [51, 100],
    color: '#0284c7', // Sky 600
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    textColor: '#075985',
    badgeClass: 'bg-sky-50 text-sky-800 border border-sky-200',
    summary: 'Air quality is acceptable. Very few sensitive individuals may experience minor symptoms.',
    healthyAdvisory: 'Normal outdoor activities can proceed.',
    vulnerableAdvisory: 'Normal outdoor activities can proceed.',
    chronicAdvisory: 'Individuals unusually sensitive should monitor respiratory symptoms.',
  },
  Unhealthy: {
    category: 'Unhealthy',
    range: [101, 200],
    color: '#d97706', // Amber 600
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#92400e',
    badgeClass: 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold',
    summary: 'Everyone may begin to experience health effects. High-risk groups may experience more serious effects.',
    healthyAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Minimize prolonged or strenuous outdoor physical exertion.',
    chronicAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion. Keep reliever medication handy.',
  },
  'Very Unhealthy': {
    category: 'Very Unhealthy',
    range: [201, 300],
    color: '#e11d48', // Rose 600
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
    textColor: '#9f1239',
    badgeClass: 'bg-rose-50 text-rose-900 border border-rose-300 font-semibold',
    summary: 'Health alert: Risk of health effects is heightened for the general population.',
    healthyAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Avoid outdoor activities. Stay indoors and use air purifiers (HEPA filter).',
    chronicAdvisory: 'Remain indoors. Keep windows closed. Seek medical attention if experiencing chest discomfort or shortness of breath.',
  },
  Hazardous: {
    category: 'Hazardous',
    range: [301, 500],
    color: '#701a75', // Fuchsia 900 / Deep Maroon
    bgColor: '#fdf4ff',
    borderColor: '#f5d0fe',
    textColor: '#581c87',
    badgeClass: 'bg-purple-900 text-white border border-purple-950 font-bold',
    summary: 'Health warning of emergency conditions. The entire population is likely to be affected.',
    healthyAdvisory: 'Minimize outdoor activity. Wear properly fitted N95 masks if outdoors.',
    vulnerableAdvisory: 'Stay indoors with air conditioning/HEPA purifiers. Avoid going outside.',
    chronicAdvisory: 'Stay strictly indoors. Vulnerable and chronic patients should adhere to medical emergency plans.',
  },
};

export function getPSICategory(psi: number): PSICategory {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getPM25Category(pm25: number): { category: PM25Category; color: string; label: string; advisory: string } {
  if (pm25 <= 55) {
    return {
      category: 'Normal',
      color: '#059669',
      label: 'Band I · Normal (0-55 µg/m³)',
      advisory: 'Normal outdoor activities can proceed.',
    };
  }
  if (pm25 <= 150) {
    return {
      category: 'Elevated',
      color: '#d97706',
      label: 'Band II · Elevated (56-150 µg/m³)',
      advisory: 'Vulnerable persons should reduce strenuous outdoor exertion.',
    };
  }
  if (pm25 <= 250) {
    return {
      category: 'High',
      color: '#e11d48',
      label: 'Band III · High (151-250 µg/m³)',
      advisory: 'Everyone should reduce strenuous outdoor physical exertion.',
    };
  }
  return {
    category: 'Very High',
    color: '#701a75',
    label: 'Band IV · Very High (>250 µg/m³)',
    advisory: 'Avoid outdoor activities. Stay indoors with HEPA air filters.',
  };
}
