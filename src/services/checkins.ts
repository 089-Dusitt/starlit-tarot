import type { Reading } from '../data/types';
import { decodeReading, encodeReading } from '../engine/share-code';
import { readStored, writeGuarded } from './storage';
import type { Place } from './weather';
export interface CheckIn {
  code: string;
  due: string;
  answer?: 0 | 1 | 2;
  weather?: { place: Place; date: string; wet: boolean; actual?: boolean };
}
interface Ledger {
  version: 1;
  entries: CheckIn[];
}
const dateValid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const valid = (v: unknown): v is Ledger => {
  if (!v || typeof v !== 'object') return false;
  const l = v as Ledger;
  return (
    l.version === 1 &&
    Array.isArray(l.entries) &&
    new Set(l.entries.map((e) => e?.code)).size === l.entries.length &&
    l.entries.every((e) => {
      if (
        !e ||
        typeof e.code !== 'string' ||
        !decodeReading(e.code) ||
        !dateValid(e.due) ||
        (e.answer !== undefined && ![0, 1, 2].includes(e.answer))
      )
        return false;
      const w = e.weather;
      return (
        !w ||
        (dateValid(w.date) &&
          typeof w.wet === 'boolean' &&
          (w.actual === undefined || typeof w.actual === 'boolean') &&
          !!w.place &&
          typeof w.place.name === 'string' &&
          w.place.name.length <= 140 &&
          Number.isFinite(w.place.latitude) &&
          Math.abs(w.place.latitude) <= 90 &&
          Number.isFinite(w.place.longitude) &&
          Math.abs(w.place.longitude) <= 180)
      );
    })
  );
};
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function checkIns() {
  return readStored<Ledger>('checkins', { version: 1, entries: [] }, valid).entries;
}
export function scheduleCheckIn(
  reading: Reading,
  days: 1 | 3 | 7,
  weather?: CheckIn['weather'],
  now = new Date(),
) {
  const code = encodeReading({ ...reading, version: 1 });
  const entries = checkIns();
  if (entries.some((e) => e.code === code)) return true;
  const day = new Date(`${localDate(now)}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + days);
  return writeGuarded(
    'checkins',
    {
      version: 1,
      entries: [
        ...entries,
        { code, due: day.toISOString().slice(0, 10), ...(weather ? { weather } : {}) },
      ],
    },
    valid,
  );
}
export function answerCheckIn(code: string, answer: 0 | 1 | 2, now = new Date()) {
  return writeGuarded(
    'checkins',
    {
      version: 1,
      entries: checkIns().map((e) =>
        e.code === code && e.answer === undefined && e.due <= localDate(now) ? { ...e, answer } : e,
      ),
    },
    valid,
  );
}
export function saveWeatherComparison(code: string, actual: boolean) {
  return writeGuarded(
    'checkins',
    {
      version: 1,
      entries: checkIns().map((e) =>
        e.code === code && e.weather && e.weather.actual === undefined
          ? { ...e, weather: { ...e.weather, actual } }
          : e,
      ),
    },
    valid,
  );
}
export function wetCode(code: number | null): boolean | null {
  if (code === null) return null;
  if ([0, 1, 2, 3, 45, 48].includes(code)) return false;
  return [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
  ].includes(code)
    ? true
    : null;
}
