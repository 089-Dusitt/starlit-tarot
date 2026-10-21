import { cards } from '../data/cards';
import { dailyFates, type DailyFate } from '../data/daily-fates';
import type { Reading } from '../data/types';
import { hashSeed } from '../engine/rng';
import { validReading } from '../engine/share-code';
import { dailyReading, localDate } from './daily';
import { PREFIX } from './storage';

export const DAILY_LEDGER_KEY = `${PREFIX}daily-fate`;
interface DayEntry {
  reading: Reading;
  opened: boolean;
}
interface DailyLedger {
  version: 2;
  entries: DayEntry[];
}
interface Snapshot {
  entries: DayEntry[];
  raw: string | null;
  source: string;
  writable: boolean;
}
let pending: { source: string; entries: DayEntry[] } | undefined;

function dateNumber(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(time)) return null;
  const date = new Date(time);
  return date.toISOString().slice(0, 10) === value &&
    date.getUTCFullYear() >= 2020 &&
    date.getUTCFullYear() <= 2199
    ? Math.floor(time / 86400000)
    : null;
}
function requireDate(value: string) {
  const day = dateNumber(value);
  if (day === null) throw new RangeError('Invalid daily calendar date');
  return day;
}
function validDaily(value: unknown): value is Reading {
  return (
    validReading(value) &&
    value.topic === 'general' &&
    value.spread === 'one' &&
    value.cards.length === 1
  );
}
function copyReading(reading: Reading): Reading {
  return {
    version: reading.version,
    ...(reading.version === 2 ? { persona: reading.persona, spice: reading.spice } : {}),
    topic: reading.topic,
    spread: reading.spread,
    cards: reading.cards.map(({ index, reversed }) => ({ index, reversed })),
    seed: reading.seed,
    date: reading.date,
  };
}
function validLedger(value: unknown): value is DailyLedger {
  if (!value || typeof value !== 'object') return false;
  const ledger = value as Partial<DailyLedger>;
  if (ledger.version !== 2 || !Array.isArray(ledger.entries)) return false;
  const dates = new Set<string>();
  for (const value of ledger.entries) {
    if (
      !value ||
      typeof value !== 'object' ||
      !validDaily(value.reading) ||
      typeof value.opened !== 'boolean' ||
      dates.has(value.reading.date)
    )
      return false;
    dates.add(value.reading.date);
  }
  return true;
}
function loadLedger(): Snapshot {
  let raw: string | null = null;
  let source = 'unavailable';
  let entries: DayEntry[] = [];
  let writable = false;
  try {
    raw = localStorage.getItem(DAILY_LEDGER_KEY);
    source = raw === null ? 'empty' : `stored:${raw}`;
    if (raw === null) writable = true;
    else {
      const value: unknown = JSON.parse(raw);
      if (validLedger(value)) {
        entries = value.entries;
        writable = true;
      }
    }
  } catch {
    /* Keep unreadable or corrupt source bytes untouched. */
  }
  if (pending?.source === source) entries = pending.entries;
  else pending = undefined;
  return { entries, raw, source, writable };
}
function persist(snapshot: Snapshot, entries: DayEntry[]): boolean {
  const ledger: DailyLedger = { version: 2, entries };
  if (snapshot.writable) {
    try {
      const raw = JSON.stringify(ledger);
      if (raw !== snapshot.raw) localStorage.setItem(DAILY_LEDGER_KEY, raw);
      pending = undefined;
      return true;
    } catch {
      /* A full or restricted store still leaves today's card usable. */
    }
  }
  pending = { source: snapshot.source, entries };
  return false;
}
function statistics(entries: DayEntry[], date: string) {
  const today = requireDate(date);
  const opened = new Set(
    entries.filter((entry) => entry.opened).map((entry) => requireDate(entry.reading.date)),
  );
  // Yesterday's chain stays visible until today's first open; a missed day breaks it.
  let cursor = opened.has(today) ? today : today - 1;
  let streak = 0;
  while (opened.has(cursor)) {
    streak++;
    cursor--;
  }
  return { streak, total: opened.size };
}

/** Freeze the first assignment, keeping the v1 device/day seeded draw for new days. */
export function getDailyReading(reversed: boolean, date = localDate()): Reading {
  requireDate(date);
  const snapshot = loadLedger();
  const existing = snapshot.entries.find((entry) => entry.reading.date === date);
  if (existing) return copyReading(existing.reading);
  const reading = copyReading(dailyReading(reversed, date));
  persist(snapshot, [...snapshot.entries, { reading, opened: false }]);
  return copyReading(reading);
}

export function dailyFate(reading: Reading): DailyFate {
  const face = reading.cards[0];
  const card = cards[face.index];
  const tone = card.tone[face.reversed ? 'reversed' : 'upright'];
  const seed = hashSeed(`${reading.seed}:${card.id}:${face.reversed}:daily-fate`);
  const kind = tone < 0 ? 'curse' : tone > 0 ? 'blessing' : seed % 2 ? 'curse' : 'blessing';
  const group = card.suit ?? 'major';
  const candidates = dailyFates.filter(
    (fate) =>
      fate.kind === kind && fate.suit === group && (!fate.topic || fate.topic === reading.topic),
  );
  if (!candidates.length) throw new Error(`Missing daily fate: ${group}/${kind}/${reading.topic}`);
  return candidates[seed % candidates.length];
}

export function recordDailyOpen(reading: Reading): {
  streak: number;
  total: number;
  saved: boolean;
} {
  const snapshot = loadLedger();
  if (!validDaily(reading)) return { ...statistics(snapshot.entries, localDate()), saved: false };
  const existing = snapshot.entries.find((entry) => entry.reading.date === reading.date);
  const entries = existing
    ? snapshot.entries.map((entry) => (entry === existing ? { ...entry, opened: true } : entry))
    : [...snapshot.entries, { reading: copyReading(reading), opened: true }];
  const saved = persist(snapshot, entries);
  return { ...statistics(entries, reading.date), saved };
}

export function dailyStats(date = localDate()): { streak: number; total: number } {
  requireDate(date);
  return statistics(loadLedger().entries, date);
}

export function muItem(reading: Reading): { color: string; day: string; direction: string } {
  const day = requireDate(reading.date);
  const weekdays = [
    'วันอาทิตย์',
    'วันจันทร์',
    'วันอังคาร',
    'วันพุธ',
    'วันพฤหัสบดี',
    'วันศุกร์',
    'วันเสาร์',
  ];
  const directions = [
    'ทิศเหนือ',
    'ทิศตะวันออกเฉียงเหนือ',
    'ทิศตะวันออก',
    'ทิศตะวันออกเฉียงใต้',
    'ทิศใต้',
    'ทิศตะวันตกเฉียงใต้',
    'ทิศตะวันตก',
    'ทิศตะวันตกเฉียงเหนือ',
  ];
  return {
    color: cards[reading.cards[0].index].luckyColor.th,
    day: weekdays[(((day + 4) % 7) + 7) % 7],
    direction: directions[hashSeed(`${reading.seed}:mu-direction`) % directions.length],
  };
}
