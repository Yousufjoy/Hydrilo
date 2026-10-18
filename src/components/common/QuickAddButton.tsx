import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrinkPreset } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

interface QuickAddButtonProps {
  preset: DrinkPreset;
  onPress: (preset: DrinkPreset) => void;
  displayUnit?: 'ml' | 'oz';
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  preset,
  onPress,
  displayUnit = 'ml',
}) => {
  const { palette } = useAppTheme();

  const formattedAmount =
    displayUnit === 'oz'
      ? `${Math.round(preset.amountMl * 0.033814)} oz`
      : `${preset.amountMl} ml`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: palette.card,
          borderColor: palette.cardBorder,
          shadowColor: palette.shadow,
        },
      ]}
      onPress={() => onPress(preset)}
    >
      <View style={[styles.iconCircle, { backgroundColor: palette.backgroundSecondary }]}>
        <Ionicons name={preset.icon as any} size={22} color={preset.color} />
      </View>
      <Text style={[styles.amountText, { color: palette.text }]}>{formattedAmount}</Text>
      <Text style={[styles.nameText, { color: palette.textSecondary }]}>{preset.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 72,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
