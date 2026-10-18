import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { DrinkEntry, DrinkType, UserPreferences, RewardItem, DailyProgressSummary } from '../types';
import { DatabaseRepository, getLocalDateString } from '../db/database';
import { DRINK_TYPES } from '../constants/drinks';
import { scheduleHydrationReminders, cancelAllReminders } from '../services/notificationService';

interface ToastData {
  id: string;
  amountMl: number;
  drinkName: string;
  effectiveMl: number;
}

interface HydrationContextType {
  todayEntries: DrinkEntry[];
  allEntries: DrinkEntry[];
  todayTotalMl: number;
  todayEffectiveMl: number;
  dailyTargetMl: number;
  progressPercent: number;
  remainingMl: number;
  streakDays: number;
  bestStreakDays: number;
  userPreferences: UserPreferences;
  rewards: RewardItem[];
  equippedRewards: RewardItem[];
  canUndo: boolean;
  lastToast: ToastData | null;
  logDrink: (amountMl: number, drinkType: DrinkType, notes?: string) => Promise<void>;
  deleteDrink: (id: string) => Promise<void>;
  undoLastDrink: () => Promise<void>;
  updateDailyTarget: (newTargetMl: number) => Promise<void>;
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>;
  toggleEquipReward: (rewardId: string) => Promise<void>;
  clearToast: () => void;
  resetAllData: () => Promise<void>;
  getWeeklySummaries: () => DailyProgressSummary[];
  getMonthlySummaries: () => DailyProgressSummary[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  unit: 'ml',
  dailyTargetMl: 2000,
  wakeTime: '07:00 AM',
  sleepTime: '11:00 PM',
  reminderIntervalMins: 90,
  reminderFrequency: 3,
  reminderEnabled: true,
  darkMode: 'light',
  reducedMotion: false,
  hapticsEnabled: true,
  onboarded: false,
  userName: 'Friend',
  genderCategory: 'male',
  weightKg: 70,
  activityLevel: 'moderate',
  climate: 'moderate',
};

const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

export const HydrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [todayEntries, setTodayEntries] = useState<DrinkEntry[]>([]);
  const [allEntries, setAllEntries] = useState<DrinkEntry[]>([]);
  const [dailyTargetMl, setDailyTargetMl] = useState<number>(2000);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [undoStack, setUndoStack] = useState<DrinkEntry[]>([]);
  const [lastToast, setLastToast] = useState<ToastData | null>(null);

  const todayStr = getLocalDateString();

  // Load initial data
  const loadData = useCallback(() => {
    try {
      const prefs = DatabaseRepository.getPreference<UserPreferences>('user_prefs', DEFAULT_PREFERENCES);
      setUserPreferences(prefs);

      const target = DatabaseRepository.getDailyGoal(todayStr, prefs.dailyTargetMl);
      setDailyTargetMl(target);

      const todayDrinks = DatabaseRepository.getDrinksForDate(todayStr);
      setTodayEntries(todayDrinks);

      const allDrinks = DatabaseRepository.getAllDrinks();
      setAllEntries(allDrinks);

      const loadedRewards = DatabaseRepository.getRewards();
      setRewards(loadedRewards);
    } catch (err) {
      console.warn('Error loading hydration data:', err);
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculations
  const todayTotalMl = todayEntries.reduce((sum, item) => sum + item.amountMl, 0);
  const todayEffectiveMl = todayEntries.reduce((sum, item) => sum + item.effectiveMl, 0);
  const progressPercent = dailyTargetMl > 0 ? (todayEffectiveMl / dailyTargetMl) * 100 : 0;
  const remainingMl = Math.max(0, dailyTargetMl - todayEffectiveMl);

  // Check and unlock rewards
  const checkRewardUnlocks = useCallback(
    (currentTotalMl: number, currentStreak: number, goalDaysCount: number) => {
      rewards.forEach((reward) => {
        if (!reward.isUnlocked) {
          let shouldUnlock = false;
          if (reward.requiredStreakDays && currentStreak >= reward.requiredStreakDays) {
            shouldUnlock = true;
          }
          if (reward.requiredGoalCompletions && goalDaysCount >= reward.requiredGoalCompletions) {
            shouldUnlock = true;
          }
          if (reward.requiredTotalMl && currentTotalMl >= reward.requiredTotalMl) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            DatabaseRepository.setRewardUnlocked(reward.id, true);
          }
        }
      });
      setRewards(DatabaseRepository.getRewards());
    },
    [rewards]
  );

  // Calculate streaks
  const calculateStreak = useCallback((): { streak: number; best: number; completedDays: number } => {
    // Group all entries by date
    const dateMap = new Map<string, number>();
    allEntries.forEach((e) => {
      const prev = dateMap.get(e.dateString) || 0;
      dateMap.set(e.dateString, prev + e.effectiveMl);
    });

    let currentStreak = 0;
    let completedDaysCount = 0;

    dateMap.forEach((effective, date) => {
      const target = DatabaseRepository.getDailyGoal(date, userPreferences.dailyTargetMl);
      if (effective >= target) {
        completedDaysCount++;
      }
    });

    const now = new Date();
    // Check backwards from today or yesterday
    let checkDate = new Date(now);
    const todayEff = dateMap.get(todayStr) || 0;
    const isTodayMet = todayEff >= dailyTargetMl;

    if (isTodayMet) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday met
      checkDate.setDate(checkDate.getDate() - 1);
      const yDateStr = getLocalDateString(checkDate.getTime());
      const yEff = dateMap.get(yDateStr) || 0;
      const yTarget = DatabaseRepository.getDailyGoal(yDateStr, userPreferences.dailyTargetMl);
      if (yEff < yTarget) {
        return { streak: 0, best: Math.max(1, completedDaysCount), completedDays: completedDaysCount };
      }
    }

    while (true) {
      const dStr = getLocalDateString(checkDate.getTime());
      const eff = dateMap.get(dStr) || 0;
      const target = DatabaseRepository.getDailyGoal(dStr, userPreferences.dailyTargetMl);
      if (eff >= target) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const savedBest = DatabaseRepository.getPreference<number>('best_streak', 0);
    const bestStreak = Math.max(savedBest, currentStreak);
    if (bestStreak > savedBest) {
      DatabaseRepository.setPreference('best_streak', bestStreak);
    }

    return { streak: currentStreak, best: bestStreak, completedDays: completedDaysCount };
  }, [allEntries, dailyTargetMl, todayStr, userPreferences.dailyTargetMl]);

  const { streak: streakDays, best: bestStreakDays, completedDays } = calculateStreak();

  // Log Drink
  const logDrink = async (amountMl: number, drinkType: DrinkType, notes?: string) => {
    const typeInfo = DRINK_TYPES.find((d) => d.type === drinkType) || DRINK_TYPES[0];
    const factor = typeInfo.factor;
    const effectiveMl = Math.round(amountMl * factor);

    const newEntry: DrinkEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amountMl,
      effectiveMl,
      drinkType,
      hydrationFactor: factor,
      timestamp: Date.now(),
      dateString: todayStr,
      notes,
    };

    DatabaseRepository.insertDrink(newEntry);

    // Haptics
    if (userPreferences.hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    // Update state
    setTodayEntries((prev) => [newEntry, ...prev]);
    setAllEntries((prev) => [newEntry, ...prev]);
    setUndoStack((prev) => [newEntry, ...prev]);

    setLastToast({
      id: newEntry.id,
      amountMl,
      drinkName: typeInfo.label,
      effectiveMl,
    });

    // Check rewards
    const allTotalMl = allEntries.reduce((s, e) => s + e.amountMl, 0) + amountMl;
    checkRewardUnlocks(allTotalMl, streakDays, completedDays);
  };

  // Delete Drink
  const deleteDrink = async (id: string) => {
    DatabaseRepository.deleteDrink(id);
    setTodayEntries((prev) => prev.filter((d) => d.id !== id));
    setAllEntries((prev) => prev.filter((d) => d.id !== id));
    setUndoStack((prev) => prev.filter((d) => d.id !== id));
    if (lastToast?.id === id) {
      setLastToast(null);
    }
    if (userPreferences.hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  };

  // Undo Last Drink
  const undoLastDrink = async () => {
    if (undoStack.length === 0) return;
    const last = undoStack[0];
    await deleteDrink(last.id);
    setUndoStack((prev) => prev.slice(1));
    setLastToast(null);
  };

  // Update Daily Target
  const updateDailyTarget = async (newTargetMl: number) => {
    DatabaseRepository.setDailyGoal(todayStr, newTargetMl);
    setDailyTargetMl(newTargetMl);
    await updatePreferences({ dailyTargetMl: newTargetMl });
  };

  // Update Preferences
  const updatePreferences = async (partial: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...partial };
    setUserPreferences(updated);
    DatabaseRepository.setPreference('user_prefs', updated);

    // Handle reminders
    if (updated.reminderEnabled) {
      scheduleHydrationReminders(updated.wakeTime, updated.sleepTime, updated.reminderIntervalMins);
    } else {
      cancelAllReminders();
    }
  };

  // Toggle Equip Reward
  const toggleEquipReward = async (rewardId: string) => {
    const target = rewards.find((r) => r.id === rewardId);
    if (!target || !target.isUnlocked) return;

    const nextState = !target.isEquipped;
    DatabaseRepository.setRewardEquipped(rewardId, nextState);
    setRewards(DatabaseRepository.getRewards());

    if (userPreferences.hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const clearToast = () => setLastToast(null);

  const resetAllData = async () => {
    DatabaseRepository.clearAllData();
    setUserPreferences(DEFAULT_PREFERENCES);
    setTodayEntries([]);
    setAllEntries([]);
    setDailyTargetMl(DEFAULT_PREFERENCES.dailyTargetMl);
    setRewards(DatabaseRepository.getRewards());
    setUndoStack([]);
    setLastToast(null);
  };

  // Summary helpers for charts
  const getWeeklySummaries = useCallback((): DailyProgressSummary[] => {
    const summaries: DailyProgressSummary[] = [];
    const now = new Date();
    // Monday to Sunday of current week
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = getLocalDateString(d.getTime());
      const drinks = allEntries.filter((e) => e.dateString === dStr);
      const total = drinks.reduce((sum, item) => sum + item.amountMl, 0);
      const effective = drinks.reduce((sum, item) => sum + item.effectiveMl, 0);
      const target = DatabaseRepository.getDailyGoal(dStr, userPreferences.dailyTargetMl);
      const percent = target > 0 ? Math.round((effective / target) * 100) : 0;

      summaries.push({
        dateString: dStr,
        totalMl: total,
        effectiveMl: effective,
        targetMl: target,
        progressPercent: percent,
        completed: effective >= target,
        entriesCount: drinks.length,
      });
    }
    return summaries;
  }, [allEntries, userPreferences.dailyTargetMl]);

  const getMonthlySummaries = useCallback((): DailyProgressSummary[] => {
    const summaries: DailyProgressSummary[] = [];
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const dStr = getLocalDateString(d.getTime());
      const drinks = allEntries.filter((e) => e.dateString === dStr);
      const total = drinks.reduce((sum, item) => sum + item.amountMl, 0);
      const effective = drinks.reduce((sum, item) => sum + item.effectiveMl, 0);
      const target = DatabaseRepository.getDailyGoal(dStr, userPreferences.dailyTargetMl);
      const percent = target > 0 ? Math.round((effective / target) * 100) : 0;

      summaries.push({
        dateString: dStr,
        totalMl: total,
        effectiveMl: effective,
        targetMl: target,
        progressPercent: percent,
        completed: effective >= target,
        entriesCount: drinks.length,
      });
    }
    return summaries;
  }, [allEntries, userPreferences.dailyTargetMl]);

  const equippedRewards = rewards.filter((r) => r.isEquipped);

  return (
    <HydrationContext.Provider
      value={{
        todayEntries,
        allEntries,
        todayTotalMl,
        todayEffectiveMl,
        dailyTargetMl,
        progressPercent,
        remainingMl,
        streakDays,
        bestStreakDays,
        userPreferences,
        rewards,
        equippedRewards,
        canUndo: undoStack.length > 0,
        lastToast,
        logDrink,
        deleteDrink,
        undoLastDrink,
        updateDailyTarget,
        updatePreferences,
        toggleEquipReward,
        clearToast,
        resetAllData,
        getWeeklySummaries,
        getMonthlySummaries,
      }}
    >
      {children}
    </HydrationContext.Provider>
  );
};

export function useHydration(): HydrationContextType {
  const ctx = useContext(HydrationContext);
  if (!ctx) throw new Error('useHydration must be used within HydrationProvider');
  return ctx;
}
