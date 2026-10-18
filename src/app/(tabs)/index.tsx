import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHydration } from '../../context/HydrationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { MascotInteractive } from '../../components/mascot/MascotInteractive';
import { CircularProgressRing } from '../../components/progress/CircularProgressRing';
import { QuickAddButton } from '../../components/common/QuickAddButton';
import { StreakBadge } from '../../components/common/StreakBadge';
import { UndoSnackbar } from '../../components/common/UndoSnackbar';
import { QUICK_ADD_PRESETS } from '../../constants/drinks';
import { DrinkPreset } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { palette } = useAppTheme();
  const {
    todayEffectiveMl,
    dailyTargetMl,
    progressPercent,
    remainingMl,
    streakDays,
    todayEntries,
    equippedRewards,
    userPreferences,
    lastToast,
    logDrink,
    deleteDrink,
    undoLastDrink,
    clearToast,
  } = useHydration();

  const [reactionCounter, setReactionCounter] = useState(0);

  // Quick log preset directly from home
  const handleQuickAdd = async (preset: DrinkPreset) => {
    setReactionCounter((prev) => prev + 1);
    await logDrink(preset.amountMl, preset.type);
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const displayUnit = userPreferences.unit;
  const formatVolume = (ml: number) => {
    if (displayUnit === 'oz') {
      return `${Math.round(ml * 0.033814)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  // Ring dimension
  const ringSize = Math.min(300, SCREEN_WIDTH - 80);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerGreeting, { color: palette.textSecondary }]}>
              {todayDateFormatted}
            </Text>
            <Text style={[styles.headerTitle, { color: palette.text }]}>
              {userPreferences.userName && userPreferences.userName !== 'Friend'
                ? `Hi, ${userPreferences.userName}`
                : 'Hydrilo'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
              onPress={() => router.push('/(tabs)/learn')}
              activeOpacity={0.7}
            >
              <Ionicons name="book-outline" size={20} color={palette.primaryDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: palette.card, borderColor: palette.cardBorder, marginLeft: 8 }]}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color={palette.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Banner */}
        <StreakBadge
          streakDays={streakDays}
          onPress={() => router.push('/(tabs)/progress')}
        />

        {/* Scenic Center Card: Mascot with Circular Progress Ring */}
        <View style={[styles.centerCard, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}>
          <CircularProgressRing
            size={ringSize}
            strokeWidth={14}
            progressPercent={progressPercent}
            showBadge={true}
          >
            <MascotInteractive
              progressPercent={progressPercent}
              size={ringSize * 0.72}
              equippedRewards={equippedRewards}
              reducedMotion={userPreferences.reducedMotion}
              hapticsEnabled={userPreferences.hapticsEnabled}
              reactionTrigger={reactionCounter}
            />
          </CircularProgressRing>

          {/* Volume Readout */}
          <View style={styles.statsReadout}>
            <Text style={[styles.volumeMain, { color: palette.text }]}>
              {formatVolume(todayEffectiveMl)}
            </Text>
            <Text style={[styles.volumeTarget, { color: palette.textSecondary }]}>
              ({Math.round(progressPercent)}% of {formatVolume(dailyTargetMl)})
            </Text>
            <View
              style={[
                styles.remainingBadge,
                { backgroundColor: progressPercent >= 100 ? '#DCFCE7' : palette.backgroundSecondary },
              ]}
            >
              <Text
                style={[
                  styles.remainingText,
                  { color: progressPercent >= 100 ? '#16A34A' : palette.primaryDark },
                ]}
              >
                {remainingMl > 0 ? `${formatVolume(remainingMl)} remaining` : '🎉 Daily Goal Reached!'}
              </Text>
            </View>
          </View>
        </View>

        {/* Big Action Button: Full-width Cyan Pill "+ Log Drink" */}
        <TouchableOpacity
          style={styles.logDrinkFullBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/log-drink')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logDrinkFullBtnText}>Log Drink</Text>
        </TouchableOpacity>

        {/* Quick Add Presets Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick Add</Text>
          <TouchableOpacity onPress={() => router.push('/log-drink')}>
            <Text style={[styles.sectionAction, { color: palette.primaryDark }]}>Custom &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAddRow}>
          {QUICK_ADD_PRESETS.slice(0, 4).map((preset) => (
            <QuickAddButton
              key={preset.id}
              preset={preset}
              onPress={handleQuickAdd}
              displayUnit={displayUnit}
            />
          ))}
        </View>

        {/* Recent Activity Card */}
        {todayEntries.length > 0 && (
          <View style={[styles.recentCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: palette.text }]}>Today&apos;s Logs</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={[styles.seeAllText, { color: palette.primaryDark }]}>
                  View All ({todayEntries.length})
                </Text>
              </TouchableOpacity>
            </View>
            {todayEntries.slice(0, 4).map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={[styles.drinkDot, { backgroundColor: palette.primary }]} />
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryType, { color: palette.text }]}>
                    {entry.drinkType.toUpperCase()}
                  </Text>
                  <Text style={[styles.entryTime, { color: palette.textSecondary }]}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={[styles.entryAmount, { color: palette.text }]}>
                  +{formatVolume(entry.amountMl)}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteDrink(entry.id)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={16} color={palette.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Undo Toast */}
      <UndoSnackbar
        visible={!!lastToast}
        message={`+${formatVolume(lastToast?.amountMl || 0)} ${lastToast?.drinkName || ''} logged`}
        onUndo={undoLastDrink}
        onDismiss={clearToast}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  headerGreeting: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  centerCard: {
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  statsReadout: {
    alignItems: 'center',
    marginTop: 14,
  },
  volumeMain: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  volumeTarget: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  remainingBadge: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '800',
  },
  logDrinkFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D2EE',
    paddingVertical: 16,
    borderRadius: 28,
    marginVertical: 10,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logDrinkFullBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentCard: {
    marginTop: 20,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  drinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryType: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryTime: {
    fontSize: 11,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 12,
  },
  deleteBtn: {
    padding: 4,
  },
});
