import { DrinkPreset, DrinkType } from '../types';

export const DRINK_TYPES: {
  type: DrinkType;
  label: string;
  factor: number;
  icon: string;
  color: string;
  description: string;
}[] = [
  {
    type: 'water',
    label: 'Water',
    factor: 1.0,
    icon: 'water-outline',
    color: '#00D2EE',
    description: 'Pure hydration, essential for bodily function',
  },
  {
    type: 'electrolytes',
    label: 'Electrolyte',
    factor: 1.05,
    icon: 'flash-outline',
    color: '#10B981',
    description: 'Rapid absorption with sodium & potassium',
  },
  {
    type: 'tea',
    label: 'Herbal/Tea',
    factor: 0.95,
    icon: 'leaf-outline',
    color: '#34D399',
    description: 'High water content with light antioxidants',
  },
  {
    type: 'coffee',
    label: 'Coffee',
    factor: 0.85,
    icon: 'cafe-outline',
    color: '#D97706',
    description: 'Hydrating, with mild diuretic caffeine balance',
  },
  {
    type: 'juice',
    label: 'Juice',
    factor: 0.85,
    icon: 'nutrition-outline',
    color: '#F97316',
    description: 'Vitamins with natural fruit sugars',
  },
  {
    type: 'smoothie',
    label: 'Smoothie',
    factor: 0.8,
    icon: 'ice-cream-outline',
    color: '#EC4899',
    description: 'Nutrient-rich, fiber-dense hydration',
  },
  {
    type: 'other',
    label: 'Other',
    factor: 0.85,
    icon: 'wine-outline',
    color: '#8B5CF6',
    description: 'General beverage hydration credit',
  },
];

export const QUICK_ADD_PRESETS: DrinkPreset[] = [
  {
    id: 'glass-250',
    name: 'Small Glass',
    type: 'water',
    amountMl: 250,
    icon: 'water-outline',
    hydrationFactor: 1.0,
    color: '#38BDF8',
  },
  {
    id: 'mug-300',
    name: 'Mug / Cup',
    type: 'tea',
    amountMl: 300,
    icon: 'cafe-outline',
    hydrationFactor: 0.95,
    color: '#34D399',
  },
  {
    id: 'bottle-500',
    name: 'Standard Bottle',
    type: 'water',
    amountMl: 500,
    icon: 'wine-outline',
    hydrationFactor: 1.0,
    color: '#00D2EE',
  },
  {
    id: 'flask-750',
    name: 'Sports Flask',
    type: 'water',
    amountMl: 750,
    icon: 'fitness-outline',
    hydrationFactor: 1.0,
    color: '#0284C7',
  },
];
