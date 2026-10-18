import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useHydration } from '../context/HydrationContext';
import { useAppTheme } from '../context/ThemeContext';
import { DRINK_TYPES } from '../constants/drinks';

export default function HistoryScreen() {
  const { palette } = useAppTheme();
  const { allEntries, deleteDrink, userPreferences } = useHydration();

  const displayUnit = userPreferences.unit;
  const formatVolume = (ml: number) => {
    if (displayUnit === 'oz') {
      return `${Math.round(ml * 0.033814)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  const handleDelete = (id: string, amount: number) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete this ${formatVolume(amount)} entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDrink(id),
        },
      ]
    );
  };

  // Group entries by dateString
  const grouped = allEntries.reduce((acc, entry) => {
    if (!acc[entry.dateString]) {
      acc[entry.dateString] = [];
    }
    acc[entry.dateString].push(entry);
    return acc;
  }, {} as Record<string, typeof allEntries>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>Drink History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="water-outline" size={64} color={palette.textMuted} />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>No drinks logged yet</Text>
            <Text style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
              Log your first glass of water from the home screen!
            </Text>
          </View>
        ) : (
          sortedDates.map((dateStr) => {
            const entries = grouped[dateStr];
            const dayTotal = entries.reduce((s, e) => s + e.amountMl, 0);

            return (
              <View key={dateStr} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <Text style={[styles.dateText, { color: palette.text }]}>{dateStr}</Text>
                  <Text style={[styles.dateTotal, { color: palette.primaryDark }]}>
                    Total: {formatVolume(dayTotal)}
                  </Text>
                </View>

                {entries.map((entry) => {
                  const typeInfo = DRINK_TYPES.find((d) => d.type === entry.drinkType) || DRINK_TYPES[0];

                  return (
                    <View
                      key={entry.id}
                      style={[styles.entryCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
                    >
                      <View style={[styles.typeIcon, { backgroundColor: palette.backgroundSecondary }]}>
                        <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
                      </View>

                      <View style={styles.entryDetails}>
                        <Text style={[styles.typeName, { color: palette.text }]}>{typeInfo.label}</Text>
                        <Text style={[styles.entryTime, { color: palette.textSecondary }]}>
                          {new Date(entry.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {entry.notes ? ` • ${entry.notes}` : ''}
                        </Text>
                      </View>

                      <Text style={[styles.entryVolume, { color: palette.text }]}>
                        +{formatVolume(entry.amountMl)}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(entry.id, entry.amountMl)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryDetails: {
    flex: 1,
  },
  typeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryTime: {
    fontSize: 12,
    marginTop: 2,
  },
  entryVolume: {
    fontSize: 15,
    fontWeight: '800',
    marginRight: 12,
  },
  deleteBtn: {
    padding: 6,
  },
});
