import type { Reading } from '../data/types';
import { validReading, encodeReading } from '../engine/share-code';
import { readStored, writeStored } from './storage';
import type { ReadingContext } from '../features/flow/state';
import { upgradeReading } from '../data/personas';
export interface HistoryEntry {
  id: string;
  reading: Reading;
  question?: string;
  days?: string;
  examType?: string;
}
export function validEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || !value) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    e.id.length <= 96 &&
    validReading(e.reading) &&
    e.id === encodeReading(e.reading) &&
    (e.question === undefined || (typeof e.question === 'string' && e.question.length <= 140)) &&
    (e.days === undefined || (typeof e.days === 'string' && /^\d{0,4}$/.test(e.days))) &&
    (e.examType === undefined || (typeof e.examType === 'string' && e.examType.length < 60))
  );
}
const validHistory = (value: unknown): value is HistoryEntry[] =>
  Array.isArray(value) && value.length <= 50 && value.every(validEntry);
export function getHistory() {
  const raw = readStored<unknown>('history', [], (v): v is unknown => v !== undefined);
  if (validHistory(raw)) {
    const entries = raw.map((entry) => {
      const reading = upgradeReading(entry.reading);
      return { ...entry, reading, id: encodeReading(reading) };
    });
    if (raw.length) writeStored('history', { version: 2, entries });
    return entries;
  }
  if (raw && typeof raw === 'object' && (raw as { version?: unknown }).version === 2) {
    const entries = (raw as { entries?: unknown }).entries;
    if (validHistory(entries)) return entries;
  }
  return [];
}
export function saveHistory(reading: Reading, context?: ReadingContext): boolean {
  if (!validReading(reading)) return false;
  reading = upgradeReading(reading);
  const id = encodeReading(reading);
  const entry: HistoryEntry = {
    id,
    reading,
    ...(context?.remember && context.question ? { question: context.question } : {}),
    ...(context?.days ? { days: context.days } : {}),
    ...(context?.examType ? { examType: context.examType } : {}),
  };
  return writeStored('history', {
    version: 2,
    entries: [entry, ...getHistory().filter((item) => item.id !== id)].slice(0, 50),
  });
}
export function deleteHistory(id?: string) {
  const next = id ? getHistory().filter((entry) => entry.id !== id) : [];
  writeStored('history', { version: 2, entries: next });
  return next;
}
