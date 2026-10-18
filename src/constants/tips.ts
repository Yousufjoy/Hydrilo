import { HydrationTip } from '../types';

export const HYDRATION_TIPS: HydrationTip[] = [
  {
    id: 'tip-1',
    title: 'Morning Awakening Sip',
    summary: 'Drinking a 250-300 ml glass of water right after waking replenishes fluid lost during sleep and kicks your metabolism into gear.',
    category: 'habit',
    icon: 'sunny-outline',
  },
  {
    id: 'tip-2',
    title: 'Thirst Is a Delayed Signal',
    summary: 'By the time you feel thirsty, your body is already approximately 1-2% dehydrated. Sip regularly throughout your active day.',
    category: 'science',
    icon: 'water-outline',
  },
  {
    id: 'tip-3',
    title: 'Brain Fog Buster',
    summary: 'Your brain tissue is about 75% water. Staying properly hydrated sharpens attention, speeds reaction times, and stabilizes mood.',
    category: 'wellness',
    icon: 'bulb-outline',
  },
  {
    id: 'tip-4',
    title: 'Electrolytes Matter',
    summary: 'During intense workouts or hot days, pair water with natural electrolytes like sodium and potassium to prevent cramping.',
    category: 'health',
    icon: 'flash-outline',
  },
  {
    id: 'tip-5',
    title: 'Pre-Meal Hydration',
    summary: 'Drinking a cup of water 30 minutes before meals aids enzymatic digestion and prevents confusing hunger with mild dehydration.',
    category: 'habit',
    icon: 'restaurant-outline',
  },
  {
    id: 'tip-6',
    title: 'Gentle Evening Hydration',
    summary: 'Taper off large water quantities 1-2 hours before sleep so your rest is uninterrupted, but keep a small sip handy.',
    category: 'wellness',
    icon: 'moon-outline',
  },
  {
    id: 'tip-7',
    title: 'Skin Glow from Within',
    summary: 'Consistent hydration maintains skin elasticity and moisture balance better than surface creams alone.',
    category: 'science',
    icon: 'sparkles-outline',
  },
  {
    id: 'tip-8',
    title: 'Hydrate with Whole Foods',
    summary: 'Cucumbers, watermelon, oranges, and strawberries are over 90% water and provide vitamins along with hydration.',
    category: 'health',
    icon: 'nutrition-outline',
  },
];

export function getDailyTips(dateString: string): HydrationTip[] {
  // Deterministic daily pick of 3 tips based on date
  const hash = dateString.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const tip1 = HYDRATION_TIPS[hash % HYDRATION_TIPS.length];
  const tip2 = HYDRATION_TIPS[(hash + 2) % HYDRATION_TIPS.length];
  const tip3 = HYDRATION_TIPS[(hash + 5) % HYDRATION_TIPS.length];
  return [tip1, tip2, tip3];
}
