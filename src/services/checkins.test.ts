import { beforeEach, expect, it, vi } from 'vitest';
import {
  answerCheckIn,
  checkIns,
  scheduleCheckIn,
  saveWeatherComparison,
  wetCode,
} from './checkins';
import { getPastWeather } from './weather';
import type { Reading } from '../data/types';
const r: Reading = {
  version: 2,
  persona: 'blunt',
  spice: 2,
  topic: 'general',
  spread: 'one',
  cards: [{ index: 16, reversed: false }],
  seed: 1,
  date: '2026-10-22',
};
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
it('schedules across month boundaries, avoids style duplicates, and permits one due vote', () => {
  const now = new Date(2026, 0, 30, 12);
  expect(scheduleCheckIn(r, 3, undefined, now)).toBe(true);
  scheduleCheckIn({ ...r, persona: 'mu' }, 7, undefined, now);
  expect(checkIns()).toHaveLength(1);
  expect(checkIns()[0].due).toBe('2026-02-02');
  answerCheckIn(checkIns()[0].code, 2, now);
  expect(checkIns()[0].answer).toBeUndefined();
  answerCheckIn(checkIns()[0].code, 2, new Date(2026, 1, 2, 12));
  answerCheckIn(checkIns()[0].code, 0, new Date(2026, 1, 3, 12));
  expect(checkIns()[0].answer).toBe(2);
  expect(localStorage.getItem('starlit:checkins')).not.toContain('question');
});
it('preserves unsupported and malformed data and reports quota failure', () => {
  for (const raw of ['{oops', '{"version":99,"entries":[]}']) {
    localStorage.setItem('starlit:checkins', raw);
    expect(scheduleCheckIn(r, 1)).toBe(false);
    expect(localStorage.getItem('starlit:checkins')).toBe(raw);
  }
  localStorage.clear();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw Error('Quota');
  });
  expect(scheduleCheckIn(r, 7)).toBe(false);
});
it('keeps unknown weather unknown and freezes a known comparison', async () => {
  const place = { name: 'Bangkok', latitude: 13, longitude: 100 };
  scheduleCheckIn(r, 1, { place, date: '2026-10-21', wet: true });
  saveWeatherComparison(checkIns()[0].code, false);
  saveWeatherComparison(checkIns()[0].code, true);
  expect(checkIns()[0].weather?.actual).toBe(false);
  expect(wetCode(null)).toBeNull();
  expect(wetCode(999)).toBeNull();
  expect(wetCode(95)).toBe(true);
  expect(wetCode(3)).toBe(false);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-23T12:00:00Z'));
  const fetcher = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(JSON.stringify({ daily: { time: ['2026-10-21'], weather_code: [null] } })),
    );
  expect(await getPastWeather(place, '2026-10-21')).toBeNull();
  expect(fetcher.mock.calls[0][0]).toContain('past_days=');
  expect(await getPastWeather(place, '2020-01-01')).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
