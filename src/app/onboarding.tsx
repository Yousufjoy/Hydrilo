import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHydration } from '../context/HydrationContext';
import { useAppTheme } from '../context/ThemeContext';
import { DrinkType } from '../types';
import { MascotInteractive } from '../components/mascot/MascotInteractive';
import { requestNotificationPermissions } from '../services/notificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scientific Hydration Calculation based on EFSA & National Academies guidelines
function calculatePersonalizedGoal(
  weightKg: number,
  category: 'male' | 'female' | 'pregnant' | 'breastfeeding',
  activity: 'low' | 'moderate' | 'high',
  climate: 'cool' | 'moderate' | 'hot'
): number {
  let baseRate = category === 'male' ? 35 : 31;
  let totalFluidMl = weightKg * baseRate;

  if (category === 'pregnant') totalFluidMl += 300;
  if (category === 'breastfeeding') totalFluidMl += 700;

  if (activity === 'moderate') totalFluidMl += 350;
  if (activity === 'high') totalFluidMl += 700;

  if (climate === 'moderate') totalFluidMl += 150;
  if (climate === 'hot') totalFluidMl += 450;

  const beverageGoal = totalFluidMl * 0.8;
  const rounded = Math.round(beverageGoal / 100) * 100;
  return Math.min(4500, Math.max(1200, rounded));
}

export default function OnboardingScreen() {
  const { palette } = useAppTheme();
  const { updatePreferences, updateDailyTarget, logDrink } = useHydration();

  // Step 0 = Welcome, 1 = Personalization, 2 = Daily Goal, 3 = Units & Times, 4 = Reminders, 5 = First Drink
  const [step, setStep] = useState<number>(0);

  // Mascot dynamic interaction state
  const [mascotSpeech, setMascotSpeech] = useState<string | null>(
    'Hi! I’m Droplet, your hydration buddy! 💧'
  );
  const [mascotReaction, setMascotReaction] = useState<number>(0);

  // Personalization state
  const [category, setCategory] = useState<'male' | 'female' | 'pregnant' | 'breastfeeding'>('male');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activity, setActivity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [climate, setClimate] = useState<'cool' | 'moderate' | 'hot'>('moderate');

  // Goal state
  const [dailyTargetMl, setDailyTargetMl] = useState<number>(2000);
  const [isCustomTargetOpen, setIsCustomTargetOpen] = useState<boolean>(false);

  // Preferences state
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [wakeTime, setWakeTime] = useState<string>('07:00 AM');
  const [sleepTime, setSleepTime] = useState<string>('11:00 PM');
  const [timePickerType, setTimePickerType] = useState<'wake' | 'sleep' | null>(null);

  // Reminders state
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true);

  // First drink state
  const [selectedFirstDrink, setSelectedFirstDrink] = useState<DrinkType>('water');
  const [firstDrinkLoggedPercent, setFirstDrinkLoggedPercent] = useState<number>(0);

  // Trigger speech & reaction helper
  const triggerMascotCue = (speech: string) => {
    setMascotSpeech(speech);
    setMascotReaction((prev) => prev + 1);
  };

  // Recalculate suggested target when personalization attributes change
  useEffect(() => {
    const calculated = calculatePersonalizedGoal(weightKg, category, activity, climate);
    setDailyTargetMl(calculated);
  }, [weightKg, category, activity, climate]);

  // Context-aware mascot reaction on step change
  useEffect(() => {
    if (step === 0) {
      triggerMascotCue('Hi! I’m Droplet! Tap or drag me! 💙');
    } else if (step === 1) {
      triggerMascotCue('Tell me about your lifestyle! ✨');
    } else if (step === 2) {
      triggerMascotCue('Here’s your daily hydration goal! 🎯');
    } else if (step === 3) {
      triggerMascotCue('Pick your units and waking hours! ⏰');
    } else if (step === 4) {
      triggerMascotCue('I’ll nudge you gently while awake! 🔔');
    } else if (step === 5) {
      triggerMascotCue('Pick your drink and take a first sip! 💧');
    }
  }, [step]);

  // Handle Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (step > 0) {
        setStep((prev) => prev - 1);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [step]);

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setRemindersEnabled(granted);
    triggerMascotCue(granted ? 'Yay! Reminders enabled! 🌟' : 'No worries! Maybe later 😊');
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const handleSelectFirstDrink = (dType: DrinkType, dLabel: string) => {
    setSelectedFirstDrink(dType);
    setFirstDrinkLoggedPercent(15);
    triggerMascotCue(`Yum! ${dLabel} selected! 🥤`);
  };

  const handleFinishOnboarding = async () => {
    triggerMascotCue('Let’s hydrate! Here we go! 🚀');
    await updateDailyTarget(dailyTargetMl);
    await updatePreferences({
      onboarded: true,
      unit,
      wakeTime,
      sleepTime,
      reminderEnabled: remindersEnabled,
      reminderFrequency: 3,
      genderCategory: category,
      weightKg,
      activityLevel: activity,
      climate,
    });

    const firstAmount = unit === 'oz' ? 240 : 250;
    await logDrink(firstAmount, selectedFirstDrink, 'First sip from onboarding! 💧');

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 500);
  };

  const timeOptions = [
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 PM', '10:30 PM',
    '11:00 PM', '11:30 PM', '12:00 AM',
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F0F9FF' }]}>
      {/* ================= STEP 0: WELCOME SCREEN ================= */}
      {step === 0 && (
        <View style={styles.welcomeContainer}>
          {/* Top Brand & Tagline */}
          <View style={styles.welcomeHeaderWrap}>
            <Text style={styles.bubbleLogo}>Hydrilo</Text>
            <Text style={styles.welcomeTitle}>A little hydration goes a long way.</Text>
            <Text style={styles.welcomeSubtitle}>
              Build a better hydration habit, one sip at a time.
            </Text>
          </View>

          {/* Interactive Animated Mascot Centerpiece */}
          <View style={styles.mascotHeroCenter}>
            <MascotInteractive
              progressPercent={50}
              size={210}
              speechMessage={mascotSpeech}
              reactionTrigger={mascotReaction}
            />
            <Text style={styles.tapHintText}>Tap, poke, or drag Droplet to play!</Text>
          </View>

          {/* Bottom Action & Pagination Dots */}
          <View style={styles.welcomeFooterWrap}>
            <TouchableOpacity
              style={styles.cyanPillBtn}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.cyanPillBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <View style={styles.paginationRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.paginationDot,
                    idx === step ? styles.paginationDotActive : styles.paginationDotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ================= STEPS 1 TO 5: WIZARD CARDS ================= */}
      {step > 0 && (
        <View style={styles.wizardScreenContainer}>
          {/* Step Header Title (OUTSIDE THE CARD AT THE TOP) */}
          <View style={styles.stepHeaderRow}>
            <Text style={styles.stepHeaderTitle}>
              {step === 1 && '2. Personalization'}
              {step === 2 && '3. Daily Hydration Goal'}
              {step === 3 && '4. Units and Preferences'}
              {step === 4 && '5. Reminders'}
              {step === 5 && '6. First Drink'}
            </Text>
          </View>

          {/* Main White Card with Light Cyan Glow */}
          <View style={styles.cardContainer}>
            <ScrollView
              contentContainerStyle={styles.cardScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ===== STEP 1: PERSONALIZATION ===== */}
              {step === 1 && (
                <>
                  {/* Interactive Mascot Mini Guide */}
                  <View style={styles.miniMascotHeaderRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cardTitle}>Tell us about yourself</Text>
                      <Text style={styles.cardSubtitle}>
                        This helps us estimate your personalized baseline hydration goal.
                      </Text>
                    </View>
                    <MascotInteractive
                      progressPercent={35}
                      size={100}
                      speechMessage={mascotSpeech}
                      reactionTrigger={mascotReaction}
                    />
                  </View>

                  {/* Gender / Category */}
                  <Text style={styles.fieldLabel}>Gender / Category</Text>
                  <View style={styles.categoryRow}>
                    {(['male', 'female', 'pregnant', 'breastfeeding'] as const).map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.choicePill,
                            isSelected ? styles.choicePillSelected : styles.choicePillNormal,
                          ]}
                          onPress={() => {
                            setCategory(cat);
                            triggerMascotCue(
                              cat === 'pregnant'
                                ? 'Extra water for mom & baby! 🍼'
                                : cat === 'breastfeeding'
                                ? 'Nursing requires high hydration! 💧'
                                : 'Noted with care! ✨'
                            );
                          }}
                        >
                          <Text
                            style={[
                              styles.choicePillText,
                              isSelected ? styles.choicePillTextSelected : styles.choicePillTextNormal,
                            ]}
                          >
                            {cat === 'breastfeeding'
                              ? 'Breastfeeding'
                              : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Body Weight Stepper */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Body weight</Text>
                  <View style={styles.weightStepperRow}>
                    <TouchableOpacity
                      style={styles.circleStepperBtn}
                      onPress={() => {
                        setWeightKg((w) => Math.max(35, w - 1));
                        triggerMascotCue(`Adjusting: ${weightKg - 1} kg`);
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#0284C7" />
                    </TouchableOpacity>
                    <Text style={styles.weightValueText}>{weightKg} kg</Text>
                    <TouchableOpacity
                      style={styles.circleStepperBtn}
                      onPress={() => {
                        setWeightKg((w) => Math.min(200, w + 1));
                        triggerMascotCue(`Adjusting: ${weightKg + 1} kg`);
                      }}
                    >
                      <Ionicons name="add" size={20} color="#0284C7" />
                    </TouchableOpacity>
                  </View>

                  {/* Activity Level */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Activity level</Text>
                  <View style={styles.optionsGrid}>
                    {(['low', 'moderate', 'high'] as const).map((lvl) => {
                      const isSelected = activity === lvl;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          style={[
                            styles.optionCard,
                            isSelected ? styles.optionCardSelected : styles.optionCardNormal,
                          ]}
                          onPress={() => {
                            setActivity(lvl);
                            triggerMascotCue(
                              lvl === 'high' ? 'High energy! 🏃‍♂️' : 'Perfect routine! 🌿'
                            );
                          }}
                        >
                          <Text
                            style={[
                              styles.optionCardText,
                              isSelected ? styles.optionCardTextSelected : styles.optionCardTextNormal,
                            ]}
                          >
                            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Climate */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Climate</Text>
                  <View style={styles.optionsGrid}>
                    {(['cool', 'moderate', 'hot'] as const).map((clm) => {
                      const isSelected = climate === clm;
                      return (
                        <TouchableOpacity
                          key={clm}
                          style={[
                            styles.optionCard,
                            isSelected ? styles.optionCardSelected : styles.optionCardNormal,
                          ]}
                          onPress={() => {
                            setClimate(clm);
                            triggerMascotCue(
                              clm === 'hot' ? 'Stay cool in the heat! ☀️' : 'Nice weather! ⛅'
                            );
                          }}
                        >
                          <Text
                            style={[
                              styles.optionCardText,
                              isSelected ? styles.optionCardTextSelected : styles.optionCardTextNormal,
                            ]}
                          >
                            {clm.charAt(0).toUpperCase() + clm.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* ===== STEP 2: DAILY HYDRATION GOAL ===== */}
              {step === 2 && (
                <>
                  <Text style={styles.cardTitle}>Your daily goal</Text>
                  <Text style={styles.cardSubtitle}>
                    Based on your profile, here is your estimated daily beverage target:
                  </Text>

                  {/* Interactive Mascot Hero Celebrating 100% Target Fill */}
                  <View style={styles.goalIllustrationContainer}>
                    <MascotInteractive
                      progressPercent={100}
                      size={150}
                      speechMessage={mascotSpeech}
                      reactionTrigger={mascotReaction}
                    />
                    <View style={styles.goalTargetBadge}>
                      <Text style={styles.goalTargetNumber}>
                        {unit === 'oz'
                          ? `${Math.round(dailyTargetMl * 0.033814)} oz`
                          : `${(dailyTargetMl / 1000).toFixed(1)} L`}
                      </Text>
                      <Text style={styles.goalTargetUnit}>per day</Text>
                    </View>
                  </View>

                  {/* Glasses Callout */}
                  <View style={styles.glassesBox}>
                    <Text style={styles.glassesBoxText}>
                      This is about {Math.round(dailyTargetMl / 250)} glasses of water (250 mL each).
                    </Text>
                  </View>

                  {/* Set Custom Target Button */}
                  <TouchableOpacity
                    style={styles.customTargetBtn}
                    onPress={() => {
                      setIsCustomTargetOpen((prev) => !prev);
                      triggerMascotCue('Feel free to customize your goal! ✏️');
                    }}
                  >
                    <Text style={styles.customTargetBtnText}>Set a custom target</Text>
                  </TouchableOpacity>

                  {isCustomTargetOpen && (
                    <View style={styles.customTargetStepperWrap}>
                      <TouchableOpacity
                        style={styles.circleStepperBtn}
                        onPress={() => {
                          setDailyTargetMl((prev) => Math.max(1000, prev - 100));
                          triggerMascotCue('Goal adjusted! 💧');
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#0284C7" />
                      </TouchableOpacity>
                      <Text style={styles.customValueDisplay}>
                        {unit === 'oz'
                          ? `${Math.round(dailyTargetMl * 0.033814)} oz`
                          : `${dailyTargetMl} ml`}
                      </Text>
                      <TouchableOpacity
                        style={styles.circleStepperBtn}
                        onPress={() => {
                          setDailyTargetMl((prev) => Math.min(4500, prev + 100));
                          triggerMascotCue('Aiming higher! 🚀');
                        }}
                      >
                        <Ionicons name="add" size={20} color="#0284C7" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Scientific Disclaimer */}
                  <Text style={styles.disclaimerText}>
                    Hydration needs vary by individual, health conditions, activity, climate and food intake.
                  </Text>
                </>
              )}

              {/* ===== STEP 3: UNITS AND PREFERENCES ===== */}
              {step === 3 && (
                <>
                  <View style={styles.miniMascotHeaderRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cardTitle}>Units and Preferences</Text>
                      <Text style={styles.cardSubtitle}>
                        Choose your preferred units and set your typical waking hours.
                      </Text>
                    </View>
                    <MascotInteractive
                      progressPercent={60}
                      size={95}
                      speechMessage={mascotSpeech}
                      reactionTrigger={mascotReaction}
                    />
                  </View>

                  {/* Units Selection Cards */}
                  <Text style={styles.fieldLabel}>Units</Text>
                  <View style={styles.unitsGrid}>
                    <TouchableOpacity
                      style={[
                        styles.unitCard,
                        unit === 'ml' ? styles.unitCardSelected : styles.unitCardNormal,
                      ]}
                      onPress={() => {
                        setUnit('ml');
                        triggerMascotCue('Metric (ml) selected! 💧');
                      }}
                    >
                      <Ionicons name="water" size={30} color={unit === 'ml' ? '#00D2EE' : '#94A3B8'} />
                      <Text style={[styles.unitCardTitle, unit === 'ml' && styles.unitCardTitleSelected]}>
                        Metric
                      </Text>
                      <Text style={styles.unitCardSub}>(ml / L)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.unitCard,
                        unit === 'oz' ? styles.unitCardSelected : styles.unitCardNormal,
                      ]}
                      onPress={() => {
                        setUnit('oz');
                        triggerMascotCue('Imperial (oz) selected! 🥛');
                      }}
                    >
                      <Ionicons name="beaker" size={30} color={unit === 'oz' ? '#00D2EE' : '#94A3B8'} />
                      <Text style={[styles.unitCardTitle, unit === 'oz' && styles.unitCardTitleSelected]}>
                        Imperial
                      </Text>
                      <Text style={styles.unitCardSub}>(fl oz)</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Waking Time Row */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Waking time</Text>
                  <TouchableOpacity
                    style={styles.timeCard}
                    onPress={() => setTimePickerType('wake')}
                  >
                    <View style={styles.timeCardLeft}>
                      <Ionicons name="alarm" size={22} color="#00D2EE" />
                      <View style={styles.timeDivider} />
                      <Text style={styles.timeValueText}>{wakeTime}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
                  </TouchableOpacity>

                  {/* Bedtime Row */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Bedtime</Text>
                  <TouchableOpacity
                    style={styles.timeCard}
                    onPress={() => setTimePickerType('sleep')}
                  >
                    <View style={styles.timeCardLeft}>
                      <Ionicons name="moon" size={22} color="#00D2EE" />
                      <View style={styles.timeDivider} />
                      <Text style={styles.timeValueText}>{sleepTime}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#00D2EE" />
                  </TouchableOpacity>
                </>
              )}

              {/* ===== STEP 4: REMINDERS ===== */}
              {step === 4 && (
                <>
                  <Text style={styles.cardTitle}>Gentle reminders, better habits</Text>
                  <Text style={styles.cardSubtitle}>
                    Friendly nudges during waking hours without interrupting your sleep.
                  </Text>

                  {/* Interactive Mascot with Notification Bell Cue */}
                  <View style={styles.remindersHeroContainer}>
                    <MascotInteractive
                      progressPercent={70}
                      size={140}
                      speechMessage={mascotSpeech}
                      reactionTrigger={mascotReaction}
                    />
                  </View>

                  {/* Action Buttons */}
                  <TouchableOpacity
                    style={styles.cyanFullBtn}
                    activeOpacity={0.85}
                    onPress={handleEnableNotifications}
                  >
                    <Ionicons name="notifications" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.cyanFullBtnText}>Enable Notifications</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.outlineFullBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      triggerMascotCue('No problem! You can turn them on anytime.');
                      handleNext();
                    }}
                  >
                    <Text style={styles.outlineFullBtnText}>Maybe Later</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.customizeLinkWrap}
                    onPress={() => router.push('/(tabs)/settings')}
                  >
                    <Text style={styles.customizeLinkText}>
                      Customize frequency and quiet hours &gt;
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ===== STEP 5: FIRST DRINK ===== */}
              {step === 5 && (
                <>
                  <Text style={styles.cardTitle}>Let&apos;s take your first sip!</Text>
                  <Text style={styles.cardSubtitle}>
                    Choose what you&apos;re drinking right now to kick off your progress.
                  </Text>

                  {/* Interactive Mascot Reacting to Selected Drink with Liquid Fill */}
                  <View style={styles.firstDrinkHeroWrap}>
                    <MascotInteractive
                      progressPercent={firstDrinkLoggedPercent > 0 ? firstDrinkLoggedPercent : 20}
                      size={130}
                      speechMessage={mascotSpeech}
                      reactionTrigger={mascotReaction}
                    />
                  </View>

                  {/* 6 Beverage Grid */}
                  <View style={styles.firstDrinkGrid}>
                    {[
                      { type: 'water' as DrinkType, label: 'Water', icon: 'water' },
                      { type: 'tea' as DrinkType, label: 'Tea', icon: 'leaf' },
                      { type: 'coffee' as DrinkType, label: 'Coffee', icon: 'cafe' },
                      { type: 'juice' as DrinkType, label: 'Juice', icon: 'nutrition' },
                      { type: 'soda' as DrinkType, label: 'Soda', icon: 'sparkles' },
                      { type: 'other' as DrinkType, label: 'Custom', icon: 'add-circle' },
                    ].map((drink) => {
                      const isSelected = selectedFirstDrink === drink.type;
                      return (
                        <TouchableOpacity
                          key={drink.type}
                          style={[
                            styles.firstDrinkTile,
                            isSelected ? styles.firstDrinkTileSelected : styles.firstDrinkTileNormal,
                          ]}
                          onPress={() => handleSelectFirstDrink(drink.type, drink.label)}
                        >
                          <Ionicons
                            name={drink.icon as any}
                            size={26}
                            color={isSelected ? '#00D2EE' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.firstDrinkTileLabel,
                              isSelected && styles.firstDrinkTileLabelSelected,
                            ]}
                          >
                            {drink.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Got It Button */}
                  <TouchableOpacity
                    style={[styles.cyanFullBtn, { marginTop: 16 }]}
                    activeOpacity={0.85}
                    onPress={handleFinishOnboarding}
                  >
                    <Text style={styles.cyanFullBtnText}>Got it!</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            {/* Bottom Navigation Buttons (Back & Next) for Steps 1-4 */}
            {step < 5 && (
              <View style={styles.navButtonsRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Time Picker Modal */}
      <Modal
        visible={timePickerType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalCard}>
            <Text style={styles.timeModalTitle}>
              Select {timePickerType === 'wake' ? 'Waking Time' : 'Bedtime'}
            </Text>
            <ScrollView style={{ maxHeight: 240 }}>
              {timeOptions.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.timeOptionRow}
                  onPress={() => {
                    if (timePickerType === 'wake') {
                      setWakeTime(t);
                      triggerMascotCue(`Wake time: ${t} ☀️`);
                    } else {
                      setSleepTime(t);
                      triggerMascotCue(`Bedtime: ${t} 🌙`);
                    }
                    setTimePickerType(null);
                  }}
                >
                  <Text style={styles.timeOptionText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.timeModalCloseBtn}
              onPress={() => setTimePickerType(null)}
            >
              <Text style={styles.timeModalCloseText}>Cancel</Text>
            </TouchableOpacity>
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

  /* ================= STEP 0: WELCOME SCREEN ================= */
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  welcomeHeaderWrap: {
    alignItems: 'center',
    paddingTop: 10,
  },
  bubbleLogo: {
    fontSize: 44,
    fontWeight: '900',
    color: '#00D2EE',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 210, 238, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F2942',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 32,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#476582',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  mascotHeroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  tapHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 10,
  },
  welcomeFooterWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  cyanPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D2EE',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cyanPillBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#00D2EE',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paginationDotInactive: {
    backgroundColor: '#BAE6FD',
  },

  /* ================= WIZARD LAYOUT (STEPS 1-5) ================= */
  wizardScreenContainer: {
    flex: 1,
    paddingTop: 4,
  },
  stepHeaderRow: {
    paddingHorizontal: 22,
    paddingVertical: 6,
  },
  stepHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: -0.3,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardScrollContent: {
    paddingBottom: 12,
  },
  miniMascotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2942',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#476582',
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2942',
    marginBottom: 8,
  },

  /* Choice Pills (Gender/Category) */
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  choicePillNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  choicePillSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00D2EE',
  },
  choicePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  choicePillTextNormal: {
    color: '#475569',
  },
  choicePillTextSelected: {
    color: '#0284C7',
  },

  /* Body Weight Stepper */
  weightStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  circleStepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightValueText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F2942',
  },

  /* Options Grid (Activity & Climate) */
  optionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00D2EE',
  },
  optionCardText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionCardTextNormal: {
    color: '#475569',
  },
  optionCardTextSelected: {
    color: '#0284C7',
  },

  /* Navigation Buttons */
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: '#00D2EE',
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Daily Goal Visuals */
  goalIllustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  goalTargetBadge: {
    alignItems: 'center',
    marginTop: 4,
  },
  goalTargetNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0284C7',
  },
  goalTargetUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  glassesBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
  },
  glassesBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
  },
  customTargetBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  customTargetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  customTargetStepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 16,
  },
  customValueDisplay: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2942',
    minWidth: 90,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 8,
  },

  /* Units Selection Cards */
  unitsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  unitCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitCardNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  unitCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#00D2EE',
  },
  unitCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginTop: 4,
  },
  unitCardTitleSelected: {
    color: '#0284C7',
  },
  unitCardSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },

  /* Time Cards */
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  timeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  timeValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2942',
  },

  /* Reminders */
  remindersHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  cyanFullBtn: {
    flexDirection: 'row',
    backgroundColor: '#00D2EE',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cyanFullBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  outlineFullBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineFullBtnText: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: '700',
  },
  customizeLinkWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  customizeLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },

  /* First Drink Grid */
  firstDrinkHeroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  firstDrinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  firstDrinkTile: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstDrinkTileNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  firstDrinkTileSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#00D2EE',
  },
  firstDrinkTileLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginTop: 4,
  },
  firstDrinkTileLabelSelected: {
    color: '#0284C7',
  },

  /* Time Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timeModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2942',
    marginBottom: 12,
    textAlign: 'center',
  },
  timeOptionRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
  },
  timeModalCloseBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeModalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
