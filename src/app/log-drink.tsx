import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHydration } from '../context/HydrationContext';
import { useAppTheme } from '../context/ThemeContext';
import { DrinkType } from '../types';
import { DRINK_TYPES } from '../constants/drinks';

interface BeverageItem {
  id: string;
  type: DrinkType;
  name: string;
  defaultMl: number;
  icon: string;
  color: string;
}

const QUICK_BEVERAGES: BeverageItem[] = [
  { id: 'water', type: 'water', name: 'Water', defaultMl: 250, icon: 'water', color: '#00D2EE' },
  { id: 'tea', type: 'tea', name: 'Tea', defaultMl: 250, icon: 'leaf', color: '#10B981' },
  { id: 'coffee', type: 'coffee', name: 'Coffee', defaultMl: 250, icon: 'cafe', color: '#8B5CF6' },
  { id: 'juice', type: 'juice', name: 'Juice', defaultMl: 250, icon: 'nutrition', color: '#F59E0B' },
  { id: 'soda', type: 'soda', name: 'Soda', defaultMl: 330, icon: 'sparkles', color: '#EC4899' },
  { id: 'sports', type: 'electrolytes', name: 'Sports Drink', defaultMl: 500, icon: 'flash', color: '#3B82F6' },
];

const CONTAINER_SIZES = [
  { id: 'small', label: 'Small Glass', ml: 150, icon: 'water-outline' },
  { id: 'standard', label: 'Standard', ml: 250, icon: 'cafe-outline' },
  { id: 'mug', label: 'Mug / Cup', ml: 350, icon: 'beer-outline' },
  { id: 'bottle', label: 'Bottle', ml: 500, icon: 'flask-outline' },
  { id: 'flask', label: 'Sports Flask', ml: 750, icon: 'fitness-outline' },
];

export default function LogDrinkScreen() {
  const { palette } = useAppTheme();
  const { logDrink, userPreferences } = useHydration();

  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  // Quick Add state
  const [selectedBev, setSelectedBev] = useState<BeverageItem>(QUICK_BEVERAGES[0]);
  const [selectedContainer, setSelectedContainer] = useState<string>('standard');
  const [amountMl, setAmountMl] = useState<number>(250);

  // Custom state
  const [customType, setCustomType] = useState<DrinkType>('water');
  const [customAmountStr, setCustomAmountStr] = useState<string>('300');
  const [customNote, setCustomNote] = useState<string>('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const displayUnit = userPreferences.unit;
  const formatAmount = (ml: number) => {
    if (displayUnit === 'oz') {
      return `${Math.round(ml * 0.033814)} oz`;
    }
    return `${ml} ml`;
  };

  // Quick Add handlers
  const handleSelectBeverage = (bev: BeverageItem) => {
    setSelectedBev(bev);
    setAmountMl(bev.defaultMl);
  };

  const handleSelectContainer = (sizeMl: number, containerId: string) => {
    setSelectedContainer(containerId);
    setAmountMl(sizeMl);
  };

  const handleAdjustAmount = (delta: number) => {
    setAmountMl((prev) => Math.max(50, Math.min(3000, prev + delta)));
  };

  // Custom tab calculated values
  const currentCustomTypeInfo =
    DRINK_TYPES.find((d) => d.type === customType) || DRINK_TYPES[0];
  const customMlVal = parseInt(customAmountStr, 10) || 0;
  const effectiveCustomMl = Math.round(customMlVal * currentCustomTypeInfo.factor);

  const handleDismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLogDrink = async () => {
    if (activeTab === 'quick') {
      await logDrink(amountMl, selectedBev.type);
      setFeedbackMessage(`Logged ${formatAmount(amountMl)} of ${selectedBev.name}!`);
    } else {
      const mlToLog = Math.max(25, customMlVal);
      await logDrink(mlToLog, customType, customNote.trim() || undefined);
      setFeedbackMessage(
        `Logged custom ${formatAmount(mlToLog)} of ${currentCustomTypeInfo.label}!`
      );
    }
    setTimeout(() => {
      handleDismiss();
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      {/* Modal Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
          onPress={handleDismiss}
        >
          <Ionicons name="close" size={22} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Add Drink</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs: Quick Add / Custom */}
      <View style={[styles.tabBar, { backgroundColor: palette.surfaceSecondary }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'quick' && [styles.activeTab, { backgroundColor: palette.primary }],
          ]}
          onPress={() => setActiveTab('quick')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'quick' ? '#FFFFFF' : palette.textSecondary },
            ]}
          >
            Quick Add
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'custom' && [styles.activeTab, { backgroundColor: palette.primary }],
          ]}
          onPress={() => setActiveTab('custom')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'custom' ? '#FFFFFF' : palette.textSecondary },
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: QUICK ADD ================= */}
        {activeTab === 'quick' && (
          <>
            {/* 6 Beverage Grid (2 cols x 3 rows) */}
            <Text style={[styles.sectionHeading, { color: palette.text }]}>Popular Beverages</Text>
            <View style={styles.bevGrid}>
              {QUICK_BEVERAGES.map((bev) => {
                const isSelected = selectedBev.id === bev.id;
                return (
                  <TouchableOpacity
                    key={bev.id}
                    style={[
                      styles.bevTile,
                      {
                        backgroundColor: palette.card,
                        borderColor: isSelected ? palette.primary : palette.cardBorder,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectBeverage(bev)}
                  >
                    <View style={[styles.bevIconWrap, { backgroundColor: palette.backgroundSecondary }]}>
                      <Ionicons name={bev.icon as any} size={28} color={bev.color} />
                    </View>
                    <Text style={[styles.bevName, { color: palette.text }]}>{bev.name}</Text>
                    <Text style={[styles.bevVolume, { color: palette.textSecondary }]}>
                      {formatAmount(bev.defaultMl)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Container Size Presets */}
            <Text style={[styles.sectionHeading, { color: palette.text, marginTop: 18 }]}>
              Container Sizes
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.containerSizesRow}>
              {CONTAINER_SIZES.map((c) => {
                const isSelected = amountMl === c.ml;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.containerChip,
                      {
                        backgroundColor: isSelected ? '#E0F2FE' : palette.card,
                        borderColor: isSelected ? palette.primary : palette.cardBorder,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleSelectContainer(c.ml, c.id)}
                  >
                    <Ionicons
                      name={c.icon as any}
                      size={20}
                      color={isSelected ? palette.primaryDark : palette.textSecondary}
                    />
                    <Text
                      style={[
                        styles.containerChipText,
                        { color: isSelected ? palette.primaryDark : palette.text },
                      ]}
                    >
                      {c.label}
                    </Text>
                    <Text style={[styles.containerChipMl, { color: palette.textSecondary }]}>
                      {formatAmount(c.ml)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Stepper Section: [-] 250 ml [+] */}
            <View style={[styles.stepperCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
              <TouchableOpacity
                style={styles.circleStepperBtn}
                onPress={() => handleAdjustAmount(-50)}
              >
                <Ionicons name="remove" size={22} color="#0284C7" />
              </TouchableOpacity>

              <View style={styles.stepperCenter}>
                <Text style={[styles.stepperAmountText, { color: palette.text }]}>
                  {formatAmount(amountMl)}
                </Text>
                <Text style={[styles.stepperSubText, { color: palette.textSecondary }]}>
                  Selected Portion
                </Text>
              </View>

              <TouchableOpacity
                style={styles.circleStepperBtn}
                onPress={() => handleAdjustAmount(+50)}
              >
                <Ionicons name="add" size={22} color="#0284C7" />
              </TouchableOpacity>
            </View>

            {/* Cheerful Mascot Reaction Banner */}
            <View style={[styles.reactionCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
              <Image
                source={require('../../assets/images/poses/cheering.png')}
                style={styles.reactionMascot}
                resizeMode="contain"
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.reactionToastText}>
                  {feedbackMessage || `Great choice! ${formatAmount(amountMl)} of ${selectedBev.name}!`}
                </Text>
                <Text style={styles.reactionSubText}>
                  Counts towards your daily hydration goal
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ================= TAB 2: CUSTOM ================= */}
        {activeTab === 'custom' && (
          <>
            {/* Custom Direct Milliliter Input */}
            <View style={[styles.customInputCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
              <Text style={[styles.customCardLabel, { color: palette.textSecondary }]}>
                Exact Intake Volume ({displayUnit})
              </Text>
              <View style={styles.customNumberRow}>
                <TextInput
                  style={[styles.customLargeInput, { color: palette.text, borderBottomColor: palette.primary }]}
                  keyboardType="numeric"
                  value={customAmountStr}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, '');
                    setCustomAmountStr(clean);
                  }}
                  placeholder="300"
                  placeholderTextColor={palette.textMuted}
                />
                <Text style={[styles.customUnitLabel, { color: palette.primaryDark }]}>{displayUnit}</Text>
              </View>

              {/* Quick Delta Stepper Chips */}
              <View style={styles.quickChipsRow}>
                {[-100, -50, +50, +100, +250].map((delta) => (
                  <TouchableOpacity
                    key={delta}
                    style={[styles.quickChipBtn, { backgroundColor: palette.backgroundSecondary }]}
                    onPress={() => {
                      const cur = parseInt(customAmountStr, 10) || 0;
                      const next = Math.max(25, Math.min(3000, cur + delta));
                      setCustomAmountStr(next.toString());
                    }}
                  >
                    <Text style={[styles.quickChipText, { color: palette.primaryDark }]}>
                      {delta > 0 ? `+${delta}` : delta}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Beverage Selector with Hydration Factors */}
            <Text style={[styles.sectionHeading, { color: palette.text, marginTop: 18 }]}>
              Beverage Category
            </Text>
            <View style={styles.beverageChipsGrid}>
              {DRINK_TYPES.map((dt) => {
                const isSelected = customType === dt.type;
                return (
                  <TouchableOpacity
                    key={dt.type}
                    style={[
                      styles.customTypeChip,
                      {
                        backgroundColor: isSelected ? palette.primary : palette.card,
                        borderColor: isSelected ? palette.primary : palette.cardBorder,
                      },
                    ]}
                    onPress={() => setCustomType(dt.type)}
                  >
                    <Ionicons
                      name={dt.icon as any}
                      size={20}
                      color={isSelected ? '#FFFFFF' : dt.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.customTypeChipText,
                        { color: isSelected ? '#FFFFFF' : palette.text },
                      ]}
                    >
                      {dt.label}
                    </Text>
                    <View
                      style={[
                        styles.factorBadge,
                        { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : palette.backgroundSecondary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.factorBadgeText,
                          { color: isSelected ? '#FFFFFF' : palette.primaryDark },
                        ]}
                      >
                        {Math.round(dt.factor * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Effective Hydration Calculation Card */}
            <View style={[styles.hydrationCreditCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
              <View style={styles.creditHeaderRow}>
                <Ionicons name="water" size={24} color="#00D2EE" />
                <Text style={styles.creditTitle}>Effective Hydration Credit</Text>
                <Text style={styles.creditValue}>
                  {formatAmount(effectiveCustomMl)}
                </Text>
              </View>
              <Text style={styles.creditExplanation}>
                {customMlVal} {displayUnit} of {currentCustomTypeInfo.label} has a {Math.round(currentCustomTypeInfo.factor * 100)}% hydration factor, crediting {formatAmount(effectiveCustomMl)} toward your daily target.
              </Text>
            </View>

            {/* Custom Note or Name Input */}
            <View style={[styles.noteCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
              <Ionicons name="create-outline" size={20} color={palette.primaryDark} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.noteInput, { color: palette.text }]}
                placeholder="Add note (e.g. Green Tea, Pre-workout)..."
                placeholderTextColor={palette.textMuted}
                value={customNote}
                onChangeText={setCustomNote}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer "Log Drink" Cyan Pill Button */}
      <View style={[styles.footer, { backgroundColor: palette.background, borderTopColor: palette.cardBorder }]}>
        <TouchableOpacity
          style={styles.logDrinkBtn}
          activeOpacity={0.85}
          onPress={handleLogDrink}
        >
          <Ionicons name="water" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logDrinkBtnText}>
            {activeTab === 'quick'
              ? `Log Drink (${formatAmount(amountMl)})`
              : `Log Custom Drink (${formatAmount(customMlVal)})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },

  /* Quick Add Styles */
  bevGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  bevTile: {
    width: '48%',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bevIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bevName: {
    fontSize: 15,
    fontWeight: '800',
  },
  bevVolume: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  containerSizesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  containerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
  },
  containerChipText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  containerChipMl: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  circleStepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCenter: {
    alignItems: 'center',
  },
  stepperAmountText: {
    fontSize: 26,
    fontWeight: '900',
  },
  stepperSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  reactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
  },
  reactionMascot: {
    width: 54,
    height: 54,
  },
  reactionToastText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  reactionSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  /* Custom Tab Styles */
  customInputCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  customCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  customNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  customLargeInput: {
    fontSize: 44,
    fontWeight: '900',
    minWidth: 140,
    textAlign: 'center',
    borderBottomWidth: 3,
    paddingBottom: 4,
  },
  customUnitLabel: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 10,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  beverageChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  customTypeChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  factorBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  factorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  hydrationCreditCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    marginTop: 16,
  },
  creditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
    marginLeft: 8,
    flex: 1,
  },
  creditValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284C7',
  },
  creditExplanation: {
    fontSize: 12,
    color: '#476582',
    lineHeight: 18,
    marginTop: 8,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    marginTop: 14,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  logDrinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D2EE',
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logDrinkBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
