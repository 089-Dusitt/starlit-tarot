import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cards } from '../data/cards';
import type { Reading } from '../data/types';
import { dailyReading } from './daily';
import {
  DAILY_LEDGER_KEY,
  dailyFate,
  dailyStats,
  getDailyReading,
  muItem,
  recordDailyOpen,
} from './daily-fate';

function reading(date: string, index = 19, reversed = false): Reading {
  return {
    version: 1,
    topic: 'general',
    spread: 'one',
    cards: [{ index, reversed }],
    seed: 54321,
    date,
  };
}
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  localStorage.setItem('starlit:device', '0123456789abcdef');
});

describe('frozen local daily assignment', () => {
  it('starts from the exact v1 draw and freezes it across settings and module refresh', async () => {
    const date = '2026-10-21';
    const expected = dailyReading(true, date);
    const first = getDailyReading(true, date);
    expect(first).toEqual(expected);
    expect(getDailyReading(false, date)).toEqual(first);
    const raw = localStorage.getItem(DAILY_LEDGER_KEY);
    vi.resetModules();
    const refreshed = await import('./daily-fate');
    expect(refreshed.getDailyReading(false, date)).toEqual(first);
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).toBe(raw);
  });
  it('does not allow callers to mutate frozen cards and does not store private extras', () => {
    const first = getDailyReading(true, '2026-11-01');
    const expected = JSON.parse(JSON.stringify(first));
    first.cards[0].index = (first.cards[0].index + 1) % 78;
    expect(getDailyReading(false, '2026-11-01')).toEqual(expected);
    recordDailyOpen({ ...reading('2026-11-02'), question: 'private question' } as Reading);
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).not.toContain('question');
  });
  it('rejects malformed and impossible calendar dates before changing storage', () => {
    const before = localStorage.getItem(DAILY_LEDGER_KEY);
    for (const date of ['2026-02-30', '2026-2-03', '2026-10-21T23:00:00Z', '2019-12-31']) {
      expect(() => getDailyReading(true, date)).toThrow(RangeError);
      expect(() => dailyStats(date)).toThrow(RangeError);
    }
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).toBe(before);
  });
});

describe('blessings, harmless curses and mu items', () => {
  it('has a stable matching fate for every face, including deterministic neutral choices', () => {
    cards.forEach((card, index) => {
      for (const reversed of [false, true]) {
        const source = reading('2026-10-21', index, reversed);
        const fate = dailyFate(source);
        expect(dailyFate(source)).toEqual(fate);
        expect(fate.suit).toBe(card.suit ?? 'major');
        if (fate.topic) expect(fate.topic).toBe(source.topic);
        const tone = card.tone[reversed ? 'reversed' : 'upright'];
        if (tone < 0) expect(fate.kind).toBe('curse');
        if (tone > 0) expect(fate.kind).toBe('blessing');
        expect(fate.line.trim()).not.toBe('');
        expect(dailyFate({ ...source, version: 2, persona: 'mu', spice: 3 })).toEqual(fate);
      }
    });
  });
  it('gives a stable colour, correct local-calendar weekday and a named direction without lucky numbers', () => {
    const source = reading('2026-10-21');
    const item = muItem(source);
    expect(muItem(source)).toEqual(item);
    expect(item.color).toBe(cards[19].luckyColor.th);
    expect(item.day).toBe('วันพุธ');
    expect(item.direction).toMatch(/^ทิศ/);
    expect(JSON.stringify(item)).not.toMatch(/[0-9๐-๙]|หวย|เลข|พนัน/);
    expect(muItem(reading('2026-10-22')).day).toBe('วันพฤหัสบดี');
  });
});

describe('append-only daily opening ledger', () => {
  it('counts each date once, preserves all assignments, and bridges month/year/leap-day boundaries', () => {
    expect(recordDailyOpen(reading('2026-12-31'))).toEqual({ streak: 1, total: 1, saved: true });
    expect(recordDailyOpen(reading('2027-01-01'))).toEqual({ streak: 2, total: 2, saved: true });
    const raw = localStorage.getItem(DAILY_LEDGER_KEY);
    expect(recordDailyOpen(reading('2027-01-01'))).toEqual({ streak: 2, total: 2, saved: true });
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).toBe(raw);
    recordDailyOpen(reading('2028-02-28'));
    recordDailyOpen(reading('2028-02-29'));
    expect(recordDailyOpen(reading('2028-03-01'))).toEqual({ streak: 3, total: 5, saved: true });
    expect(JSON.parse(localStorage.getItem(DAILY_LEDGER_KEY)!).entries).toHaveLength(5);
  });
  it('keeps yesterday’s chain until today opens, resets on a missed day, and ignores mere assignment', () => {
    recordDailyOpen(reading('2026-03-07'));
    recordDailyOpen(reading('2026-03-08'));
    expect(dailyStats('2026-03-09')).toEqual({ streak: 2, total: 2 });
    getDailyReading(true, '2026-03-09');
    expect(dailyStats('2026-03-09')).toEqual({ streak: 2, total: 2 });
    expect(dailyStats('2026-03-10')).toEqual({ streak: 0, total: 2 });
    expect(recordDailyOpen(reading('2026-03-10'))).toEqual({ streak: 1, total: 3, saved: true });
    expect(dailyStats('2026-03-11')).toEqual({ streak: 1, total: 3 });
  });
  it('preserves the first assigned face even when a later open submits another card', () => {
    const first = getDailyReading(true, '2026-08-08');
    recordDailyOpen(reading('2026-08-08', (first.cards[0].index + 1) % 78));
    expect(getDailyReading(false, '2026-08-08')).toEqual(first);
    expect(dailyStats('2026-08-08').total).toBe(1);
  });
  it.each([
    '{broken-json',
    '{"version":99,"entries":[]}',
    '{"version":2,"entries":[{"reading":{},"opened":true}]}',
  ])('keeps corrupt/unsupported ledger bytes untouched and retains an active result: %s', (raw) => {
    localStorage.setItem(DAILY_LEDGER_KEY, raw);
    const assigned = getDailyReading(true, '2026-06-06');
    expect(getDailyReading(false, '2026-06-06')).toEqual(assigned);
    expect(recordDailyOpen(assigned)).toEqual({ streak: 1, total: 1, saved: false });
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).toBe(raw);
    expect(dailyStats('2026-06-06')).toEqual({ streak: 1, total: 1 });
  });
  it('keeps earlier data on quota failure, maintains the active day, and retries safely', () => {
    recordDailyOpen(reading('2026-07-01'));
    const raw = localStorage.getItem(DAILY_LEDGER_KEY);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    const assigned = getDailyReading(true, '2026-07-02');
    expect(getDailyReading(false, '2026-07-02')).toEqual(assigned);
    expect(recordDailyOpen(assigned)).toEqual({ streak: 2, total: 2, saved: false });
    expect(localStorage.getItem(DAILY_LEDGER_KEY)).toBe(raw);
    setItem.mockRestore();
    expect(recordDailyOpen(assigned)).toEqual({ streak: 2, total: 2, saved: true });
    expect(JSON.parse(localStorage.getItem(DAILY_LEDGER_KEY)!).entries).toHaveLength(2);
  });
  it('survives denied storage without deleting unrelated or app data', () => {
    localStorage.setItem('unrelated', 'keep');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    const assigned = getDailyReading(true, '2026-09-09');
    expect(getDailyReading(false, '2026-09-09')).toEqual(assigned);
    expect(recordDailyOpen(assigned).saved).toBe(false);
    expect(remove).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    get.mockRestore();
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
});
