import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHydration } from '../../context/HydrationContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { palette, themeMode, setThemeMode } = useAppTheme();
  const {
    userPreferences,
    dailyTargetMl,
    streakDays,
    updateDailyTarget,
    updatePreferences,
    resetAllData,
  } = useHydration();

  const [activeModal, setActiveModal] = useState<
    'goal' | 'units' | 'reminders' | 'times' | 'appearance' | null
  >(null);

  const displayUnit = userPreferences.unit;
  const formatVolume = (ml: number) => {
    if (displayUnit === 'oz') {
      return `${Math.round(ml * 0.033814)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Hydration Data?',
      'This will clear all drink logs and restart your streaks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Reset Complete', 'All local data has been cleared.');
          },
        },
      ]
    );
  };

  const timeOptions = [
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 PM', '10:30 PM',
    '11:00 PM', '11:30 PM', '12:00 AM',
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
        </View>

        {/* Profile / Journey Card matching Batch 1, Image 2 */}
        <View style={[styles.journeyCard, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="water" size={32} color="#00D2EE" />
          </View>
          <View style={styles.journeyInfo}>
            <Text style={[styles.journeyTitle, { color: palette.text }]}>Your Hydration Journey</Text>
            <View style={styles.streakRow}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={styles.streakText}>
                {streakDays > 0 ? `${streakDays} day streak` : '0 day streak'}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings List Rows matching screenshot */}
        <View style={[styles.listCard, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}>
          {/* 1. Daily Goal */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('goal')}
          >
            <Text style={[styles.settingLabel, { color: palette.text }]}>Daily Goal</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValueText}>{formatVolume(dailyTargetMl)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 2. Units */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('units')}
          >
            <Text style={[styles.settingLabel, { color: palette.text }]}>Units</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValueText}>
                {userPreferences.unit === 'ml' ? 'Metric (ml / L)' : 'Imperial (fl oz)'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 3. Reminders */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('reminders')}
          >
            <Text style={[styles.settingLabel, { color: palette.text }]}>Reminders</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValueText}>
                {userPreferences.reminderEnabled
                  ? `On • ${userPreferences.reminderFrequency || 3} times/day`
                  : 'Off'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 4. Wake & Sleep */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('times')}
          >
            <Text style={[styles.settingLabel, { color: palette.text }]}>Wake & Sleep</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValueText}>
                {userPreferences.wakeTime || '07:00 AM'} – {userPreferences.sleepTime || '11:00 PM'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 5. Appearance */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setActiveModal('appearance')}
          >
            <Text style={[styles.settingLabel, { color: palette.text }]}>Appearance</Text>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValueText, { textTransform: 'capitalize' }]}>
                {themeMode}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tactile & Motion Settings */}
        <View style={[styles.listCard, { backgroundColor: palette.card, borderColor: '#BAE6FD', marginTop: 16 }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: palette.text }]}>Haptic Tactile Feedback</Text>
            <Switch
              value={userPreferences.hapticsEnabled}
              onValueChange={(val) => updatePreferences({ hapticsEnabled: val })}
              trackColor={{ false: palette.cardBorder, true: palette.primary }}
            />
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: palette.text }]}>Reduced Motion</Text>
            <Switch
              value={userPreferences.reducedMotion}
              onValueChange={(val) => updatePreferences({ reducedMotion: val })}
              trackColor={{ false: palette.cardBorder, true: palette.primary }}
            />
          </View>
        </View>

        {/* Clear Data */}
        <TouchableOpacity style={styles.dangerRow} onPress={handleReset}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.dangerText}>Clear & Reset Local Data</Text>
        </TouchableOpacity>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerLogo}>Hydrilo</Text>
          <Text style={styles.footerSub}>100% Offline • Private & Secure</Text>
        </View>
      </ScrollView>

      {/* Goal Modal */}
      <Modal visible={activeModal === 'goal'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adjust Daily Goal</Text>
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => updateDailyTarget(Math.max(1000, dailyTargetMl - 100))}
              >
                <Ionicons name="remove" size={24} color="#0284C7" />
              </TouchableOpacity>
              <Text style={styles.stepperDisplay}>{formatVolume(dailyTargetMl)}</Text>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => updateDailyTarget(Math.min(5000, dailyTargetMl + 100))}
              >
                <Ionicons name="add" size={24} color="#0284C7" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Units Modal */}
      <Modal visible={activeModal === 'units'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Preferred Units</Text>
            <TouchableOpacity
              style={[
                styles.modalOptionRow,
                userPreferences.unit === 'ml' && styles.modalOptionSelected,
              ]}
              onPress={() => {
                updatePreferences({ unit: 'ml' });
                setActiveModal(null);
              }}
            >
              <Text style={styles.modalOptionText}>Metric (ml / L)</Text>
              {userPreferences.unit === 'ml' && <Ionicons name="checkmark" size={20} color="#00D2EE" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalOptionRow,
                userPreferences.unit === 'oz' && styles.modalOptionSelected,
              ]}
              onPress={() => {
                updatePreferences({ unit: 'oz' });
                setActiveModal(null);
              }}
            >
              <Text style={styles.modalOptionText}>Imperial (fl oz)</Text>
              {userPreferences.unit === 'oz' && <Ionicons name="checkmark" size={20} color="#00D2EE" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reminders Modal */}
      <Modal visible={activeModal === 'reminders'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Hydration Reminders</Text>
            <View style={styles.switchRowModal}>
              <Text style={styles.modalOptionText}>Enable Reminders</Text>
              <Switch
                value={userPreferences.reminderEnabled}
                onValueChange={(val) => updatePreferences({ reminderEnabled: val })}
                trackColor={{ false: palette.cardBorder, true: palette.primary }}
              />
            </View>
            <Text style={[styles.subLabel, { marginTop: 14 }]}>Frequency during waking hours:</Text>
            <View style={styles.freqRow}>
              {[2, 3, 4, 6].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.freqChip,
                    (userPreferences.reminderFrequency || 3) === freq && styles.freqChipSelected,
                  ]}
                  onPress={() => updatePreferences({ reminderFrequency: freq })}
                >
                  <Text
                    style={[
                      styles.freqText,
                      (userPreferences.reminderFrequency || 3) === freq && styles.freqTextSelected,
                    ]}
                  >
                    {freq}x / day
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wake & Sleep Modal */}
      <Modal visible={activeModal === 'times'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Waking & Bedtime Hours</Text>
            <Text style={styles.subLabel}>Waking Time:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {timeOptions.slice(0, 10).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.freqChip, userPreferences.wakeTime === t && styles.freqChipSelected]}
                  onPress={() => updatePreferences({ wakeTime: t })}
                >
                  <Text style={[styles.freqText, userPreferences.wakeTime === t && styles.freqTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subLabel}>Bedtime:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {timeOptions.slice(10).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.freqChip, userPreferences.sleepTime === t && styles.freqChipSelected]}
                  onPress={() => updatePreferences({ sleepTime: t })}
                >
                  <Text style={[styles.freqText, userPreferences.sleepTime === t && styles.freqTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Appearance Modal */}
      <Modal visible={activeModal === 'appearance'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Appearance</Text>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modalOptionRow, themeMode === mode && styles.modalOptionSelected]}
                onPress={() => {
                  setThemeMode(mode);
                  setActiveModal(null);
                }}
              >
                <Text style={[styles.modalOptionText, { textTransform: 'capitalize' }]}>{mode}</Text>
                {themeMode === mode && <Ionicons name="checkmark" size={20} color="#00D2EE" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  journeyInfo: {
    marginLeft: 16,
    flex: 1,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 4,
  },
  listCard: {
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0284C7',
    marginRight: 6,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#BAE6FD',
    marginLeft: 20,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  dangerText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00D2EE',
  },
  footerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F2942',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 20,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisplay: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0284C7',
    minWidth: 120,
    textAlign: 'center',
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  modalOptionSelected: {
    backgroundColor: '#E0F2FE',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2942',
  },
  switchRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  freqChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  freqChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00D2EE',
  },
  freqText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  freqTextSelected: {
    color: '#0284C7',
  },
  modalCloseBtn: {
    marginTop: 18,
    backgroundColor: '#00D2EE',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
