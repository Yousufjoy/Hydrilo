import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { HYDRATION_TIPS } from '../../constants/tips';

interface TopicItem {
  id: string;
  title: string;
  icon: string;
  summary: string;
  details: string;
}

const TOPICS: TopicItem[] = [
  {
    id: 'benefits',
    title: 'Benefits of Hydration',
    icon: 'water-outline',
    summary: 'Optimal physical performance, cognitive sharpness, and kidney health.',
    details:
      'Drinking enough water maintains blood volume, regulates core body temperature, lubricates joints, cushions sensitive tissues, and helps your kidneys flush metabolic waste efficiently. Staying hydrated can also improve mood and energy levels throughout your day.',
  },
  {
    id: 'foods',
    title: 'Foods with Water',
    icon: 'nutrition-outline',
    summary: 'Cucumbers, watermelon, strawberries, and oranges provide rich cellular hydration.',
    details:
      'About 20% of your daily water intake naturally comes from solid foods! Cucumbers and lettuce are over 95% water, while watermelon, cantaloupe, and grapefruit provide both fluid and key electrolyte minerals like potassium and magnesium.',
  },
  {
    id: 'signs',
    title: 'Signs of Dehydration',
    icon: 'warning-outline',
    summary: 'Dark urine, dry mouth, afternoon fatigue, and mild tension headaches.',
    details:
      'By the time you feel noticeably thirsty, your body is already 1-2% dehydrated. Monitor your urine color: pale straw or light yellow signifies optimal hydration, while dark amber indicates it is time for a generous glass of water.',
  },
  {
    id: 'electrolytes',
    title: 'Electrolytes & Balance',
    icon: 'flash-outline',
    summary: 'Sodium, potassium, and magnesium work alongside water to hydrate cells.',
    details:
      'Hydration is not just about water volume—it requires osmotic balance. When you sweat during workouts or hot weather, you lose essential electrolytes. Replenish with coconut water, a pinch of sea salt in lemon water, or balanced electrolyte beverages.',
  },
];

export default function LearnScreen() {
  const { palette } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'tips' | 'breaks'>('tips');
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Learn</Text>
        </View>

        {/* Tab Selector: Daily Tip / Breaks */}
        <View style={[styles.segmentedControl, { backgroundColor: palette.surfaceSecondary }]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'tips' && [styles.segmentActive, { backgroundColor: palette.primary }],
            ]}
            onPress={() => setActiveTab('tips')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'tips' ? '#FFFFFF' : palette.textSecondary },
              ]}
            >
              Daily Tip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'breaks' && [styles.segmentActive, { backgroundColor: palette.primary }],
            ]}
            onPress={() => setActiveTab('breaks')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'breaks' ? '#FFFFFF' : palette.textSecondary },
              ]}
            >
              Breaks
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'tips' ? (
          <>
            {/* Featured Insight Card matching screenshot */}
            <View style={[styles.featuredCard, { backgroundColor: '#FEF9EE', borderColor: '#FDE68A' }]}>
              <View style={styles.featuredContentRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[styles.featuredText, { color: '#1E293B' }]}>
                    Water helps your brain work better. Even mild dehydration can affect focus, mood and energy levels.
                  </Text>
                </View>
                <View style={styles.featuredMascotWrap}>
                  <Image
                    source={require('../../../assets/images/poses/thinking.png')}
                    style={styles.thinkingMascot}
                    resizeMode="contain"
                  />
                  <View style={styles.bulbBadge}>
                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                  </View>
                </View>
              </View>
            </View>

            {/* Topic List Rows matching screenshot */}
            <View style={styles.topicList}>
              {TOPICS.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicRow,
                    { backgroundColor: palette.card, borderColor: palette.cardBorder },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <View style={[styles.topicIconWrap, { backgroundColor: palette.backgroundSecondary }]}>
                    <Ionicons name={topic.icon as any} size={22} color={palette.primaryDark} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[styles.topicTitle, { color: palette.text }]}>{topic.title}</Text>
                    <Text style={[styles.topicSummary, { color: palette.textSecondary }]} numberOfLines={1}>
                      {topic.summary}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* More Scientific Hydration Facts */}
            <Text style={[styles.sectionHeading, { color: palette.text }]}>Quick Science Facts</Text>
            {HYDRATION_TIPS.slice(0, 3).map((tip) => (
              <View
                key={tip.id}
                style={[styles.factCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
              >
                <View style={styles.factHeader}>
                  <Text style={[styles.factCategory, { color: palette.primaryDark }]}>
                    {tip.category.toUpperCase()}
                  </Text>
                  <Text style={[styles.factTitle, { color: palette.text }]}>{tip.title}</Text>
                </View>
                <Text style={[styles.factSummary, { color: palette.textSecondary }]}>{tip.summary}</Text>
              </View>
            ))}
          </>
        ) : (
          /* Breaks tab */
          <View style={styles.breaksContainer}>
            <View style={[styles.breakCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
              <View style={[styles.breakIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="alarm-outline" size={28} color={palette.primaryDark} />
              </View>
              <Text style={[styles.breakTitle, { color: palette.text }]}>The 60-Minute Sip Rule</Text>
              <Text style={[styles.breakDesc, { color: palette.textSecondary }]}>
                Standing up every hour to stretch and drink 100–150 ml of cool water helps maintain steady circulation, prevents dry eyes from screen fatigue, and sustains alertness.
              </Text>
            </View>

            <View style={[styles.breakCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
              <View style={[styles.breakIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="sunny-outline" size={28} color="#16A34A" />
              </View>
              <Text style={[styles.breakTitle, { color: palette.text }]}>Morning Kickstart</Text>
              <Text style={[styles.breakDesc, { color: palette.textSecondary }]}>
                You lose 300–500 ml of moisture during sleep through respiration. Drinking a full glass of room-temperature water upon waking activates your metabolism and rehydrates vital organs.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Detail Topic Modal */}
      <Modal
        visible={!!selectedTopic}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTopic(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: palette.backgroundSecondary }]}>
                <Ionicons
                  name={selectedTopic ? (selectedTopic.icon as any) : 'water-outline'}
                  size={24}
                  color={palette.primaryDark}
                />
              </View>
              <Text style={[styles.modalTitle, { color: palette.text }]}>
                {selectedTopic?.title}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedTopic(null)}
              >
                <Ionicons name="close" size={22} color={palette.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDetails, { color: palette.textSecondary }]}>
              {selectedTopic?.details}
            </Text>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: palette.primary }]}
              onPress={() => setSelectedTopic(null)}
            >
              <Text style={styles.modalBtnText}>Got it!</Text>
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
    marginBottom: 20,
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
  featuredCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  featuredContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  featuredMascotWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thinkingMascot: {
    width: 68,
    height: 68,
  },
  bulbBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  topicList: {
    marginBottom: 24,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topicIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  topicSummary: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  factCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  factHeader: {
    marginBottom: 6,
  },
  factCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  factTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  factSummary: {
    fontSize: 13,
    lineHeight: 19,
  },
  breaksContainer: {
    marginTop: 4,
  },
  breakCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  breakIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  breakTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  breakDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDetails: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
