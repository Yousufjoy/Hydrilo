import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

interface StreakBadgeProps {
  streakDays: number;
  onPress?: () => void;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streakDays, onPress }) => {
  const { palette } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: palette.card,
          borderColor: palette.cardBorder,
          shadowColor: palette.shadow,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.flameCircle, { backgroundColor: '#FEF3C7' }]}>
        <Ionicons name="flame" size={24} color="#F59E0B" />
      </View>
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: palette.text }]}>
          {streakDays} Day Streak
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {streakDays > 0 ? "You're doing great! Keep it up" : 'Start your streak today!'}
        </Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 10,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
