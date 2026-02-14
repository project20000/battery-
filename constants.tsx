
import { FactoryType } from './types';

export const FACTORY_LIMITS = {
  [FactoryType.SMALL]: { min: 50, max: 500 },
  [FactoryType.MEDIUM]: { min: 1000, max: 10000 },
  [FactoryType.LARGE]: { min: 100000, max: 1000000 }
};

export const PROCESS_STAGES = [
  { name: 'Electrode Preparation', durationMin: 2, durationMax: 3, color: '#3b82f6' },
  { name: 'Cell Assembly', durationMin: 2, durationMax: 3, color: '#8b5cf6' },
  { name: 'Formation & Testing', durationMin: 10, durationMax: 14, color: '#10b981' }
];

export const COMPONENT_DATA = [
  { name: 'Anode', collector: 'Copper', icon: '🔋' },
  { name: 'Cathode', collector: 'Aluminium', icon: '⚡' },
  { name: 'Electrolyte', material: 'Lithium Salt Solution', icon: '💧' },
  { name: 'Separator', icon: '🛡️' },
  { name: 'Casing', icon: '📦' }
];

export const TEMP_THRESHOLDS = {
  NORMAL: { min: 20, max: 40, label: 'Normal', color: 'text-green-500' },
  WARNING: { min: 41, max: 129, label: 'Warning', color: 'text-orange-500' },
  DANGER: { min: 130, max: 3000, label: 'Danger', color: 'text-red-500' }
};
