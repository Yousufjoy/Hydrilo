import * as SQLite from 'expo-sqlite';
import { DrinkEntry, RewardItem } from '../types';
import { INITIAL_REWARDS } from '../constants/rewards';

const DB_NAME = 'hydrilo.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS drinks (
      id TEXT PRIMARY KEY,
      amount_ml REAL NOT NULL,
      effective_ml REAL NOT NULL,
      drink_type TEXT NOT NULL,
      hydration_factor REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      date_string TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_goals (
      date_string TEXT PRIMARY KEY,
      target_ml REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      is_unlocked INTEGER NOT NULL DEFAULT 0,
      is_equipped INTEGER NOT NULL DEFAULT 0,
      unlocked_at INTEGER
    );
  `);

  // Initialize rewards table with defaults if empty
  const count = db.getFirstSync<{ count: number }>('SELECT count(*) as count FROM rewards');
  if (!count || count.count === 0) {
    INITIAL_REWARDS.forEach((item) => {
      db.runSync(
        'INSERT OR IGNORE INTO rewards (id, is_unlocked, is_equipped, unlocked_at) VALUES (?, ?, ?, ?)',
        [item.id, item.isUnlocked ? 1 : 0, item.isEquipped ? 1 : 0, null]
      );
    });
  }
}

// Format local date YYYY-MM-DD
export function getLocalDateString(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Database repository functions
export const DatabaseRepository = {
  // --- DRINKS ---
  insertDrink(entry: DrinkEntry): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO drinks (id, amount_ml, effective_ml, drink_type, hydration_factor, timestamp, date_string, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.amountMl,
        entry.effectiveMl,
        entry.drinkType,
        entry.hydrationFactor,
        entry.timestamp,
        entry.dateString,
        entry.notes || null,
      ]
    );
  },

  deleteDrink(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM drinks WHERE id = ?', [id]);
  },

  getDrinksForDate(dateString: string): DrinkEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      amount_ml: number;
      effective_ml: number;
      drink_type: string;
      hydration_factor: number;
      timestamp: number;
      date_string: string;
      notes: string | null;
    }>('SELECT * FROM drinks WHERE date_string = ? ORDER BY timestamp DESC', [dateString]);

    return rows.map((r) => ({
      id: r.id,
      amountMl: r.amount_ml,
      effectiveMl: r.effective_ml,
      drinkType: r.drink_type as any,
      hydrationFactor: r.hydration_factor,
      timestamp: r.timestamp,
      dateString: r.date_string,
      notes: r.notes || undefined,
    }));
  },

  getAllDrinks(): DrinkEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      amount_ml: number;
      effective_ml: number;
      drink_type: string;
      hydration_factor: number;
      timestamp: number;
      date_string: string;
      notes: string | null;
    }>('SELECT * FROM drinks ORDER BY timestamp DESC');

    return rows.map((r) => ({
      id: r.id,
      amountMl: r.amount_ml,
      effectiveMl: r.effective_ml,
      drinkType: r.drink_type as any,
      hydrationFactor: r.hydration_factor,
      timestamp: r.timestamp,
      dateString: r.date_string,
      notes: r.notes || undefined,
    }));
  },

  // --- GOALS ---
  getDailyGoal(dateString: string, fallbackTarget: number): number {
    const db = getDatabase();
    const row = db.getFirstSync<{ target_ml: number }>(
      'SELECT target_ml FROM daily_goals WHERE date_string = ?',
      [dateString]
    );
    return row ? row.target_ml : fallbackTarget;
  },

  setDailyGoal(dateString: string, targetMl: number): void {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO daily_goals (date_string, target_ml) VALUES (?, ?)',
      [dateString, targetMl]
    );
  },

  // --- PREFERENCES ---
  getPreference<T>(key: string, defaultValue: T): T {
    const db = getDatabase();
    const row = db.getFirstSync<{ value: string }>(
      'SELECT value FROM user_preferences WHERE key = ?',
      [key]
    );
    if (!row) return defaultValue;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return defaultValue;
    }
  },

  setPreference<T>(key: string, value: T): void {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
      [key, JSON.stringify(value)]
    );
  },

  // --- REWARDS ---
  getRewards(): RewardItem[] {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      is_unlocked: number;
      is_equipped: number;
    }>('SELECT * FROM rewards');

    const statusMap = new Map<string, { isUnlocked: boolean; isEquipped: boolean }>();
    rows.forEach((r) => {
      statusMap.set(r.id, {
        isUnlocked: r.is_unlocked === 1,
        isEquipped: r.is_equipped === 1,
      });
    });

    return INITIAL_REWARDS.map((item) => {
      const saved = statusMap.get(item.id);
      return {
        ...item,
        isUnlocked: saved ? saved.isUnlocked : item.isUnlocked,
        isEquipped: saved ? saved.isEquipped : item.isEquipped,
      };
    });
  },

  setRewardUnlocked(id: string, isUnlocked: boolean): void {
    const db = getDatabase();
    db.runSync(
      'UPDATE rewards SET is_unlocked = ?, unlocked_at = ? WHERE id = ?',
      [isUnlocked ? 1 : 0, Date.now(), id]
    );
  },

  setRewardEquipped(id: string, isEquipped: boolean): void {
    const db = getDatabase();
    // If equipping in a category that only allows 1, we can unequip same category if needed
    db.runSync('UPDATE rewards SET is_equipped = ? WHERE id = ?', [isEquipped ? 1 : 0, id]);
  },

  clearAllData(): void {
    const db = getDatabase();
    db.runSync('DELETE FROM drinks;');
    db.runSync('DELETE FROM daily_goals;');
    db.runSync('DELETE FROM user_preferences;');
    db.runSync('UPDATE rewards SET is_unlocked = 0, is_equipped = 0, unlocked_at = NULL;');
  },
};
