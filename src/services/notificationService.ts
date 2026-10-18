import { Platform } from 'react-native';

// Safely require expo-notifications to prevent crashing in Expo Go where
// newer native modules like ExpoTopicSubscriptionModule are not bundled.
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  console.log('[NotificationService] Expo Notifications native module not available in this environment.');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

function parseTimeToMinutes(timeStr: string, defaultMinutes: number): number {
  if (!timeStr) return defaultMinutes;
  const isPM = timeStr.toUpperCase().includes('PM');
  const isAM = timeStr.toUpperCase().includes('AM');
  const clean = timeStr.replace(/[^0-9:]/g, '').trim();
  const parts = clean.split(':').map((v) => parseInt(v, 10));
  let h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export async function scheduleHydrationReminders(
  wakeTime: string, // "07:00 AM" or "07:00"
  sleepTime: string, // "11:00 PM" or "23:00"
  intervalMins: number = 90
): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const wakeMinutes = parseTimeToMinutes(wakeTime, 7 * 60);
    const sleepMinutes = parseTimeToMinutes(sleepTime, 23 * 60);

    const activeMinutes = sleepMinutes > wakeMinutes ? sleepMinutes - wakeMinutes : 16 * 60;
    const count = Math.min(8, Math.max(1, Math.floor(activeMinutes / intervalMins)));

    const friendlyMessages = [
      { title: 'Time for a sip! 💧', body: 'A quick sip of water keeps Droplet happy and energized!' },
      { title: 'Hydration Check 🌊', body: 'Stay on track for today’s hydration goal with a glass of water.' },
      { title: 'Droplet says Hello! 💙', body: 'How about a refreshing glass of water right now?' },
      { title: 'Boost your focus ⚡', body: 'Did you know a quick drink can clear afternoon brain fog?' },
    ];

    for (let i = 1; i <= count; i++) {
      const triggerMinute = wakeMinutes + i * intervalMins;
      if (triggerMinute >= sleepMinutes) break;

      const hour = Math.floor(triggerMinute / 60) % 24;
      const minute = triggerMinute % 60;

      const msg = friendlyMessages[(i - 1) % friendlyMessages.length];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { url: 'hydrilo://log-drink' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  } catch (err) {
    console.warn('Failed to schedule hydration reminders:', err);
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
