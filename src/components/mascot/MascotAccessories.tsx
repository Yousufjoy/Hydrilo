import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RewardItem } from '../../types';

interface MascotAccessoriesProps {
  equippedRewards: RewardItem[];
  size?: number;
}

export const MascotAccessories: React.FC<MascotAccessoriesProps> = ({
  equippedRewards,
  size = 280,
}) => {
  const scale = size / 280;

  const hasItem = (id: string) => equippedRewards.some((r) => r.id === id);

  return (
    <View style={[StyleSheet.absoluteFill, { width: size, height: size }]} pointerEvents="none">
      {/* Aurora Glow */}
      {hasItem('aurora-glow') && (
        <View
          style={[
            styles.auroraRing,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              top: size * 0.05,
              left: size * 0.05,
            },
          ]}
        />
      )}

      {/* Sprout Leaf Hat */}
      {hasItem('leaf-hat') && (
        <View style={[styles.accessoryItem, { top: 12 * scale, left: 135 * scale }]}>
          <Ionicons name="leaf" size={38 * scale} color="#22C55E" />
        </View>
      )}

      {/* Flower Crown */}
      {hasItem('flower-crown') && (
        <View style={[styles.accessoryItem, { top: 38 * scale, left: 88 * scale, flexDirection: 'row' }]}>
          <Ionicons name="flower" size={24 * scale} color="#EC4899" />
          <Ionicons name="flower" size={26 * scale} color="#FBBF24" style={{ marginHorizontal: 4 * scale }} />
          <Ionicons name="flower" size={24 * scale} color="#A855F7" />
        </View>
      )}

      {/* Cool Aqua Shades */}
      {hasItem('cool-sunglasses') && (
        <View style={[styles.accessoryItem, { top: 110 * scale, left: 85 * scale }]}>
          <View
            style={[
              styles.sunglassesFrame,
              { width: 110 * scale, height: 32 * scale, borderRadius: 16 * scale },
            ]}
          >
            <View style={[styles.sunglassesLens, { width: 44 * scale, height: 24 * scale }]} />
            <View style={[styles.sunglassesBridge, { width: 12 * scale }]} />
            <View style={[styles.sunglassesLens, { width: 44 * scale, height: 24 * scale }]} />
          </View>
        </View>
      )}

      {/* Diver Mask */}
      {hasItem('snorkel') && (
        <View style={[styles.accessoryItem, { top: 105 * scale, left: 80 * scale }]}>
          <View
            style={[
              styles.snorkelGoggles,
              { width: 120 * scale, height: 42 * scale, borderRadius: 20 * scale },
            ]}
          >
            <View style={[styles.snorkelGlass, { width: 106 * scale, height: 30 * scale }]} />
          </View>
        </View>
      )}

      {/* Explorer Backpack */}
      {hasItem('backpack') && (
        <View style={[styles.accessoryItem, { top: 155 * scale, right: 18 * scale }]}>
          <Ionicons name="briefcase" size={44 * scale} color="#D97706" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accessoryItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  auroraRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
  sunglassesFrame: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  sunglassesLens: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  sunglassesBridge: {
    height: 3,
    backgroundColor: '#0F172A',
  },
  snorkelGoggles: {
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#38BDF8',
  },
  snorkelGlass: {
    backgroundColor: 'rgba(224, 242, 254, 0.5)',
    borderRadius: 14,
  },
});
