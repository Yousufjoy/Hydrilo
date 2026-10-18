import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, {
  Defs,
  ClipPath,
  Path,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  G,
  RadialGradient,
} from 'react-native-svg';
import {
  MASCOT_VIEWBOX,
  MASCOT_WIDTH,
  MASCOT_HEIGHT,
  MASCOT_SILHOUETTE_PATH,
  MASCOT_BOUNDS,
} from '../../constants/mascotPath';

interface MascotLiquidFillProps {
  progressPercent: number; // 0 to 100+
  size?: number;
  waveActive?: boolean;
}

export const MascotLiquidFill: React.FC<MascotLiquidFillProps> = ({
  progressPercent,
  size = 280,
  waveActive = true,
}) => {
  const [phase1, setPhase1] = useState(0);
  const [phase2, setPhase2] = useState(Math.PI);
  const [bubbleTick, setBubbleTick] = useState(0);

  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const [displayProgress, setDisplayProgress] = useState(clampedProgress);
  const targetProgressRef = React.useRef(clampedProgress);
  const currentProgressRef = React.useRef(clampedProgress);

  useEffect(() => {
    targetProgressRef.current = clampedProgress;
  }, [clampedProgress]);

  // Animate wave phases continuously and smoothly lerp water level
  useEffect(() => {
    let animId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const speed = waveActive ? 3.0 : 1.5;
      setPhase1((prev) => (prev + speed * dt) % (Math.PI * 2));
      setPhase2((prev) => (prev - speed * 0.8 * dt) % (Math.PI * 2));
      setBubbleTick((prev) => (prev + dt * 0.8) % 1);

      // Smooth liquid level rising
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.1) {
        currentProgressRef.current += diff * Math.min(1, dt * 6);
        setDisplayProgress(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setDisplayProgress(targetProgressRef.current);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [waveActive]);

  // Map progress (0 - 100%) to Y coordinate in mascot viewBox space
  // Mascot bounds: minY = 95 (top peak), maxY = 935 (bottom base)
  const waterY =
    MASCOT_BOUNDS.maxY - (displayProgress / 100) * (MASCOT_BOUNDS.maxY - MASCOT_BOUNDS.minY);

  // Generate wave paths
  const wavePath1 = useMemo(() => {
    const width = MASCOT_WIDTH;
    const amp = clampedProgress <= 0 || clampedProgress >= 98 ? 0 : 16;
    let d = `M 0 ${MASCOT_HEIGHT} L 0 ${waterY} `;

    const step = 32;
    for (let x = 0; x <= width; x += step) {
      const y = waterY + Math.sin(x * 0.015 + phase1) * amp;
      d += `L ${x} ${y.toFixed(1)} `;
    }

    d += `L ${width} ${MASCOT_HEIGHT} Z`;
    return d;
  }, [waterY, phase1, clampedProgress]);

  const wavePath2 = useMemo(() => {
    const width = MASCOT_WIDTH;
    const amp = clampedProgress <= 0 || clampedProgress >= 98 ? 0 : 12;
    let d = `M 0 ${MASCOT_HEIGHT} L 0 ${waterY} `;

    const step = 32;
    for (let x = 0; x <= width; x += step) {
      const y = waterY + Math.sin(x * 0.012 + phase2) * amp;
      d += `L ${x} ${y.toFixed(1)} `;
    }

    d += `L ${width} ${MASCOT_HEIGHT} Z`;
    return d;
  }, [waterY, phase2, clampedProgress]);

  // Bubbles rising inside liquid
  const bubbles = useMemo(() => {
    if (clampedProgress < 5) return [];

    const basePositions = [
      { x: 380, speed: 1.2, r: 14 },
      { x: 480, speed: 0.9, r: 18 },
      { x: 580, speed: 1.4, r: 12 },
      { x: 430, speed: 1.1, r: 16 },
      { x: 530, speed: 1.3, r: 10 },
      { x: 640, speed: 0.8, r: 15 },
    ];

    const liquidHeight = MASCOT_BOUNDS.maxY - waterY;

    return basePositions.map((b, idx) => {
      const progressInColumn = (bubbleTick * b.speed + idx * 0.22) % 1;
      const curY = MASCOT_BOUNDS.maxY - progressInColumn * liquidHeight;
      const wobbleX = b.x + Math.sin(progressInColumn * Math.PI * 4) * 8;
      const opacity = curY < waterY + 20 ? 0.2 : 0.65;

      return {
        key: `b-${idx}`,
        cx: wobbleX,
        cy: curY,
        r: b.r,
        opacity,
      };
    });
  }, [clampedProgress, waterY, bubbleTick]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Base Translucent Empty Shell */}
      <Image
        source={require('../../../assets/images/mascot_empty.png')}
        style={[StyleSheet.absoluteFill, { width: size, height: size }]}
        resizeMode="contain"
      />

      {/* SVG Masked Liquid Layer */}
      <Svg
        viewBox={MASCOT_VIEWBOX}
        style={[StyleSheet.absoluteFill, { width: size, height: size }]}
      >
        <Defs>
          {/* Silhouette Clipping Path */}
          <ClipPath id="mascotClip">
            <Path d={MASCOT_SILHOUETTE_PATH} />
          </ClipPath>

          {/* Primary Liquid Gradient */}
          <LinearGradient id="waterGradDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
            <Stop offset="40%" stopColor="#00D2EE" stopOpacity="0.95" />
            <Stop offset="80%" stopColor="#0284C7" stopOpacity="0.98" />
            <Stop offset="100%" stopColor="#0369A1" stopOpacity="1.0" />
          </LinearGradient>

          {/* Secondary Wave Gradient */}
          <LinearGradient id="waterGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#67E8F9" stopOpacity="0.75" />
            <Stop offset="30%" stopColor="#38BDF8" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
          </LinearGradient>

          {/* Bubble Gradient */}
          <RadialGradient id="bubbleGrad" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#A5F3FC" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#00D2EE" stopOpacity="0.1" />
          </RadialGradient>
        </Defs>

        {/* Liquid and Bubbles Clipped Strictly Inside the Silhouette */}
        <G clipPath="url(#mascotClip)">
          {/* Subtle translucent blue tint for entire body */}
          <Rect
            x="0"
            y="0"
            width={MASCOT_WIDTH}
            height={MASCOT_HEIGHT}
            fill="#E0F2FE"
            opacity={0.3}
          />

          {/* Background Wave */}
          <Path d={wavePath1} fill="url(#waterGradDeep)" />

          {/* Foreground Wave */}
          <Path d={wavePath2} fill="url(#waterGradFront)" />

          {/* Rising Bubbles */}
          {bubbles.map((b) => (
            <Circle
              key={b.key}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill="url(#bubbleGrad)"
              opacity={b.opacity}
            />
          ))}

          {/* Water Surface Foam Line */}
          {clampedProgress > 2 && clampedProgress < 98 && (
            <Path
              d={wavePath2}
              stroke="#E0F2FE"
              strokeWidth="4"
              fill="none"
              opacity={0.8}
            />
          )}
        </G>
      </Svg>

      {/* Glossy Highlights & Specular Reflections Layer */}
      <Image
        source={require('../../../assets/images/mascot_highlights.png')}
        style={[StyleSheet.absoluteFill, { width: size, height: size }]}
        resizeMode="contain"
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
