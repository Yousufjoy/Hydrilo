import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHydration } from '../../context/HydrationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { MascotInteractive } from '../../components/mascot/MascotInteractive';
import { RewardItem } from '../../types';

export default function RewardsScreen() {
  const { palette } = useAppTheme();
  const {
    rewards,
    equippedRewards,
    toggleEquipReward,
    progressPercent,
    userPreferences,
  } = useHydration();

  const unlockedCount = rewards.filter((r) => r.isUnlocked).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Rewards & Collection</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            Collect cute items as you reach your goals! ({unlockedCount}/{rewards.length} Unlocked)
          </Text>
        </View>

        {/* Mascot Dress-Up Preview Stage */}
        <View style={[styles.stageCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <Text style={[styles.stageBadge, { color: palette.primaryDark, backgroundColor: palette.backgroundSecondary }]}>
            ✨ Live Fitting Stage
          </Text>
          <MascotInteractive
            progressPercent={progressPercent}
            size={180}
            equippedRewards={equippedRewards}
            reducedMotion={userPreferences.reducedMotion}
            hapticsEnabled={userPreferences.hapticsEnabled}
          />
          <Text style={[styles.stageHint, { color: palette.textSecondary }]}>
            Tap any unlocked accessory below to dress Droplet!
          </Text>
        </View>

        {/* Rewards Grid */}
        <View style={styles.grid}>
          {rewards.map((reward: RewardItem) => {
            return (
              <View
                key={reward.id}
                style={[
                  styles.rewardCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: reward.isEquipped
                      ? palette.primary
                      : palette.cardBorder,
                    borderWidth: reward.isEquipped ? 2 : 1,
                  },
                ]}
              >
                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: reward.isUnlocked
                        ? palette.backgroundSecondary
                        : palette.surfaceSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={reward.icon as any}
                    size={32}
                    color={reward.isUnlocked ? palette.primaryDark : palette.textMuted}
                  />
                  {!reward.isUnlocked && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Details */}
                <Text style={[styles.rewardName, { color: palette.text }]}>{reward.name}</Text>
                <Text style={[styles.rewardDesc, { color: palette.textSecondary }]}>
                  {reward.description}
                </Text>

                {/* Condition */}
                <View style={[styles.condBadge, { backgroundColor: palette.backgroundSecondary }]}>
                  <Text style={[styles.condText, { color: palette.textSecondary }]}>
                    {reward.unlockCondition}
                  </Text>
                </View>

                {/* Equip / Unlock Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    reward.isUnlocked
                      ? reward.isEquipped
                        ? { backgroundColor: palette.surfaceSecondary }
                        : { backgroundColor: palette.primary }
                      : { backgroundColor: palette.surfaceSecondary, opacity: 0.6 },
                  ]}
                  disabled={!reward.isUnlocked}
                  onPress={() => toggleEquipReward(reward.id)}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      {
                        color: reward.isUnlocked
                          ? reward.isEquipped
                            ? palette.primaryDark
                            : '#FFFFFF'
                          : palette.textMuted,
                      },
                    ]}
                  >
                    {!reward.isUnlocked
                      ? 'Locked'
                      : reward.isEquipped
                      ? 'Equipped ✓'
                      : 'Equip'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
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
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  stageCard: {
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  stageBadge: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  stageHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#64748B',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  rewardDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 28,
  },
  condBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  condText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
