import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { MascotLiquidFill } from './MascotLiquidFill';
import { MascotAccessories } from './MascotAccessories';
import { RewardItem } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

interface MascotInteractiveProps {
  progressPercent: number;
  size?: number;
  equippedRewards?: RewardItem[];
  reducedMotion?: boolean;
  hapticsEnabled?: boolean;
  reactionTrigger?: number; // Increment to trigger drink-logged reaction
  speechMessage?: string | null;
}

export const MascotInteractive: React.FC<MascotInteractiveProps> = ({
  progressPercent,
  size = 280,
  equippedRewards = [],
  reducedMotion = false,
  hapticsEnabled = true,
  reactionTrigger = 0,
  speechMessage = null,
}) => {
  const { palette } = useAppTheme();
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated values
  const idleTranslateY = useSharedValue(0);
  const idleRotate = useSharedValue(0);
  const idleScaleX = useSharedValue(1);
  const idleScaleY = useSharedValue(1);

  const gestureTranslateX = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);
  const gestureRotate = useSharedValue(0);
  const gestureScaleX = useSharedValue(1);
  const gestureScaleY = useSharedValue(1);

  const reactionTranslateY = useSharedValue(0);
  const reactionScaleX = useSharedValue(1);
  const reactionScaleY = useSharedValue(1);

  // Trigger speech bubble helper
  const showSpeechBubble = (text: string) => {
    setBubbleText(text);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 2800);
  };

  useEffect(() => {
    if (speechMessage) {
      showSpeechBubble(speechMessage);
    }
  }, [speechMessage]);

  // Continuous Idle Motion
  useEffect(() => {
    if (reducedMotion) {
      idleTranslateY.value = 0;
      idleRotate.value = 0;
      idleScaleX.value = 1;
      idleScaleY.value = 1;
      return;
    }

    idleTranslateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(8, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    idleRotate.value = withRepeat(
      withSequence(
        withTiming(-1.8, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.8, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    idleScaleX.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.98, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    idleScaleY.value = withRepeat(
      withSequence(
        withTiming(0.98, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.02, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Drink-logging reaction
  useEffect(() => {
    if (reactionTrigger === 0) return;

    if (reducedMotion) {
      showSpeechBubble('Good choice! 💧');
      return;
    }

    // Anticipatory squash -> celebratory jump -> settle
    reactionScaleX.value = withSequence(
      withTiming(1.15, { duration: 150 }),
      withSpring(0.92, { damping: 6, stiffness: 220 }),
      withSpring(1, { damping: 10, stiffness: 180 })
    );

    reactionScaleY.value = withSequence(
      withTiming(0.85, { duration: 150 }),
      withSpring(1.12, { damping: 6, stiffness: 220 }),
      withSpring(1, { damping: 10, stiffness: 180 })
    );

    reactionTranslateY.value = withSequence(
      withTiming(6, { duration: 150 }),
      withSpring(-28, { damping: 6, stiffness: 200 }),
      withSpring(0, { damping: 8, stiffness: 160 })
    );

    const compliments = [
      'Good choice! 💧',
      'Refreshing! ✨',
      'Hydration level UP! 🌊',
      'Droplet is happy! 💙',
      'Keep it flowing! 🌟',
    ];
    showSpeechBubble(compliments[Math.floor(Math.random() * compliments.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionTrigger, reducedMotion]);

  // Touch Haptic Helper
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {}
    }
  };

  // Gestures
  // 1. Single Tap: Playful bounce
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      'worklet';
      reactionTranslateY.value = withSequence(
        withTiming(-14, { duration: 120 }),
        withSpring(0, { damping: 8, stiffness: 250 })
      );
      reactionScaleX.value = withSequence(
        withTiming(1.08, { duration: 100 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      reactionScaleY.value = withSequence(
        withTiming(0.94, { duration: 100 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
      const responses = ['Hi friend! 😊', 'Need water? 💧', 'Stay cool! ❄️', 'Feeling fresh! 🌊'];
      runOnJS(showSpeechBubble)(responses[Math.floor(Math.random() * responses.length)]);
    });

  // 2. Double Tap: Happy Jump
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      'worklet';
      reactionTranslateY.value = withSequence(
        withTiming(8, { duration: 80 }),
        withSpring(-38, { damping: 5, stiffness: 240 }),
        withSpring(0, { damping: 7, stiffness: 180 })
      );
      reactionScaleY.value = withSequence(
        withTiming(0.88, { duration: 80 }),
        withSpring(1.18, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 9, stiffness: 180 })
      );
      reactionScaleX.value = withSequence(
        withTiming(1.12, { duration: 80 }),
        withSpring(0.9, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 9, stiffness: 180 })
      );
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(showSpeechBubble)('Yay! Double tap! 🎉');
    });

  // 3. Pan Gesture: Drag, Tilt & Stretch/Squash
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      // Limit translation
      gestureTranslateX.value = e.translationX * 0.4;
      gestureTranslateY.value = e.translationY * 0.4;

      // Tilt based on horizontal motion
      gestureRotate.value = (e.translationX / 140) * 12;

      // Squash and stretch based on vertical drag
      const vertFactor = e.translationY / 250;
      gestureScaleY.value = Math.max(0.75, Math.min(1.25, 1 - vertFactor * 0.3));
      gestureScaleX.value = Math.max(0.75, Math.min(1.25, 1 + vertFactor * 0.2));
    })
    .onEnd(() => {
      'worklet';
      gestureTranslateX.value = withSpring(0, { damping: 10, stiffness: 180 });
      gestureTranslateY.value = withSpring(0, { damping: 10, stiffness: 180 });
      gestureRotate.value = withSpring(0, { damping: 10, stiffness: 180 });
      gestureScaleX.value = withSpring(1, { damping: 8, stiffness: 180 });
      gestureScaleY.value = withSpring(1, { damping: 8, stiffness: 180 });
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
    });

  // 4. Long Press: Water ripple swirl
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      'worklet';
      gestureRotate.value = withSequence(
        withTiming(-8, { duration: 120 }),
        withTiming(8, { duration: 120 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withSpring(0, { damping: 10, stiffness: 200 })
      );
      reactionScaleX.value = withSequence(
        withTiming(1.12, { duration: 180 }),
        withSpring(1, { damping: 9, stiffness: 180 })
      );
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Heavy);
      runOnJS(showSpeechBubble)('Wobbly water drop! 🌀');
    });

  // Combine gestures
  const composedGesture = Gesture.Exclusive(
    doubleTapGesture,
    panGesture,
    longPressGesture,
    tapGesture
  );

  // Animated Style
  const animatedMascotStyle = useAnimatedStyle(() => {
    const totalX = gestureTranslateX.value;
    const totalY = idleTranslateY.value + gestureTranslateY.value + reactionTranslateY.value;
    const totalRotate = idleRotate.value + gestureRotate.value;
    const totalScaleX = idleScaleX.value * gestureScaleX.value * reactionScaleX.value;
    const totalScaleY = idleScaleY.value * gestureScaleY.value * reactionScaleY.value;

    return {
      transform: [
        { translateX: totalX },
        { translateY: totalY },
        { rotate: `${totalRotate}deg` },
        { scaleX: totalScaleX },
        { scaleY: totalScaleY },
      ],
    };
  });

  return (
    <View style={[styles.root, { width: size + 40, height: size + 40 }]}>
      {/* Contextual Speech Bubble */}
      {bubbleText && (
        <View style={[styles.speechBubble, { backgroundColor: palette.card, borderColor: palette.primary }]}>
          <Text style={[styles.speechText, { color: palette.text }]}>{bubbleText}</Text>
          <View style={[styles.bubbleArrow, { borderTopColor: palette.primary }]} />
        </View>
      )}

      {/* Interactive Mascot with Gestures */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mascotWrapper, animatedMascotStyle]}>
          {/* True Silhouette Liquid Fill */}
          <MascotLiquidFill
            progressPercent={progressPercent}
            size={size}
            waveActive={!reducedMotion}
          />

          {/* Equipped Cosmetic Accessories */}
          <MascotAccessories equippedRewards={equippedRewards} size={size} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 50,
  },
  speechText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
