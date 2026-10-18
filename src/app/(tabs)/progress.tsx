import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHydration } from '../../context/HydrationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { IntakeBarChart } from '../../components/progress/IntakeBarChart';
import { CircularProgressRing } from '../../components/progress/CircularProgressRing';

export default function ProgressScreen() {
  const { palette } = useAppTheme();
  const {
    streakDays,
    todayEffectiveMl,
    dailyTargetMl,
    progressPercent,
    userPreferences,
    getWeeklySummaries,
    getMonthlySummaries,
  } = useHydration();

  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const summaries = period === 'month' ? getMonthlySummaries() : getWeeklySummaries();

  const displayUnit = userPreferences.unit;
  const formatVolume = (ml: number) => {
    if (displayUnit === 'oz') {
      return `${Math.round(ml * 0.033814)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Progress</Text>
        </View>

        {/* Segmented Control Tabs: Day | Week | Month */}
        <View style={[styles.segmentedControl, { backgroundColor: palette.surfaceSecondary }]}>
          {(['day', 'week', 'month'] as const).map((p) => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.segmentButton,
                  isSelected && [styles.segmentActive, { backgroundColor: palette.primary }],
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? '#FFFFFF' : palette.textSecondary,
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weekly Bar Chart */}
        <IntakeBarChart summaries={summaries} period={period} />

        {/* Today Summary Card matching screenshot */}
        <View style={[styles.todayCard, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}>
          <View style={styles.todayTextWrap}>
            <Text style={[styles.todayLabel, { color: palette.textSecondary }]}>Today</Text>
            <Text style={[styles.todayAmount, { color: palette.text }]}>
              {formatVolume(todayEffectiveMl)}
            </Text>
            <Text style={[styles.todayTarget, { color: palette.textSecondary }]}>
              ({Math.round(progressPercent)}% of {formatVolume(dailyTargetMl)})
            </Text>
          </View>

          {/* Mini Mascot with Circular Progress Ring & 50% badge */}
          <View style={styles.miniRingWrap}>
            <CircularProgressRing
              size={96}
              strokeWidth={8}
              progressPercent={progressPercent}
              showBadge={true}
            >
              <Image
                source={require('../../../assets/images/poses/cheering.png')}
                style={styles.miniMascotImg}
                resizeMode="contain"
              />
            </CircularProgressRing>
          </View>
        </View>

        {/* 7 Day Streak Card matching screenshot */}
        <TouchableOpacity
          style={[styles.streakCard, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/rewards')}
        >
          <View style={styles.flameCircle}>
            <Text style={{ fontSize: 24 }}>🔥</Text>
          </View>
          <View style={styles.streakTextWrap}>
            <Text style={[styles.streakTitle, { color: palette.text }]}>
              {streakDays > 0 ? `${streakDays} Day Streak` : 'Start Your Streak!'}
            </Text>
            <Text style={[styles.streakSub, { color: palette.textSecondary }]}>
              {streakDays > 0 ? 'Keep it going!' : 'Drink water today to begin'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#00D2EE" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    marginVertical: 12,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  todayTextWrap: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  todayAmount: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  todayTarget: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  miniRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMascotImg: {
    width: 52,
    height: 52,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  flameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  streakSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
