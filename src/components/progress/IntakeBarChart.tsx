import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { DailyProgressSummary } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

interface IntakeBarChartProps {
  summaries: DailyProgressSummary[];
  period: 'day' | 'week' | 'month';
}

export const IntakeBarChart: React.FC<IntakeBarChartProps> = ({ summaries, period }) => {
  const { palette } = useAppTheme();

  const maxVal = 2500;
  const gridLines = [2500, 1500, 500, 0];
  const chartHeight = 160;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getLabel = (s: DailyProgressSummary, idx: number) => {
    if (period === 'week') {
      return daysOfWeek[idx % 7];
    }
    if (period === 'month') {
      const parts = s.dateString.split('-');
      const dNum = parseInt(parts[2], 10);
      return dNum % 5 === 0 || dNum === 1 ? `${dNum}` : '';
    }
    return s.dateString.slice(5);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: '#BAE6FD' }]}>
      <View style={styles.chartArea}>
        {/* Y-Axis Labels & Dashed Grid Lines */}
        <View style={styles.gridContainer}>
          {gridLines.map((val) => {
            const yPos = chartHeight - (val / maxVal) * chartHeight;
            const labelText = val === 0 ? '0.0' : val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`;
            return (
              <View key={val} style={[styles.gridRow, { top: yPos }]}>
                <Text style={styles.yAxisLabel}>{labelText}</Text>
                <View style={styles.dashedLine} />
              </View>
            );
          })}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {summaries.slice(0, period === 'week' ? 7 : 31).map((s, idx) => {
            const barHeight = Math.min(chartHeight, Math.max(6, (s.effectiveMl / maxVal) * chartHeight));
            return (
              <View key={s.dateString} style={styles.barColumn}>
                <View style={[styles.barTrack, { height: chartHeight }]}>
                  <Svg width="100%" height={barHeight} style={styles.barSvg}>
                    <Defs>
                      <LinearGradient id={`barGrad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#22D3EE" />
                        <Stop offset="100%" stopColor="#0284C7" />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0"
                      y="0"
                      width="100%"
                      height={barHeight}
                      rx="8"
                      ry="8"
                      fill={`url(#barGrad-${idx})`}
                      opacity={s.effectiveMl > 0 ? 1 : 0.25}
                    />
                  </Svg>
                </View>
                <Text style={styles.dayLabel}>{getLabel(s, idx)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    marginVertical: 12,
    shadowColor: '#00D2EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  chartArea: {
    height: 195,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabel: {
    width: 32,
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    marginLeft: 6,
  },
  barsContainer: {
    position: 'absolute',
    left: 38,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  barTrack: {
    width: '100%',
    maxWidth: 24,
    justifyContent: 'flex-end',
  },
  barSvg: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
    marginTop: 8,
  },
});
