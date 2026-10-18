export type DrinkType =
  | 'water'
  | 'tea'
  | 'coffee'
  | 'juice'
  | 'smoothie'
  | 'electrolytes'
  | 'soda'
  | 'other';

export interface DrinkPreset {
  id: string;
  name: string;
  type: DrinkType;
  amountMl: number;
  icon: string;
  hydrationFactor: number;
  color: string;
}

export interface DrinkEntry {
  id: string;
  amountMl: number;
  effectiveMl: number;
  drinkType: DrinkType;
  hydrationFactor: number;
  timestamp: number; // Unix timestamp ms
  dateString: string; // YYYY-MM-DD
  notes?: string;
}

export interface DailyGoal {
  dateString: string; // YYYY-MM-DD
  targetMl: number;
}

export interface DailyProgressSummary {
  dateString: string;
  totalMl: number;
  effectiveMl: number;
  targetMl: number;
  progressPercent: number;
  completed: boolean;
  entriesCount: number;
}

export interface UserPreferences {
  unit: 'ml' | 'oz';
  dailyTargetMl: number;
  wakeTime: string; // "07:00" or "07:00 AM"
  sleepTime: string; // "23:00" or "11:00 PM"
  reminderIntervalMins: number; // 60, 90, 120
  reminderFrequency?: number; // 3, 5, 8 times/day
  reminderEnabled: boolean;
  darkMode: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  onboarded: boolean;
  userName: string;
  genderCategory?: 'male' | 'female' | 'pregnant' | 'breastfeeding';
  weightKg?: number;
  activityLevel?: 'low' | 'moderate' | 'high';
  climate?: 'cool' | 'moderate' | 'hot';
}

export interface RewardItem {
  id: string;
  name: string;
  category: 'hat' | 'accessory' | 'environment' | 'theme';
  icon: string;
  description: string;
  unlockCondition: string;
  isUnlocked: boolean;
  isEquipped: boolean;
  requiredStreakDays?: number;
  requiredGoalCompletions?: number;
  requiredTotalMl?: number;
}

export interface HydrationTip {
  id: string;
  title: string;
  summary: string;
  category: 'habit' | 'health' | 'science' | 'wellness';
  icon: string;
}

export type MascotPose =
  | 'idle'
  | 'happy_jump'
  | 'drinking'
  | 'excited'
  | 'goal_reached'
  | 'sleeping'
  | 'thinking'
  | 'cheering'
  | 'sad'
  | 'celebration';
