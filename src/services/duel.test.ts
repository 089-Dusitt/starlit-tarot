import { it, expect } from 'vitest';
import { decodeDuel, duelUrl, compareDuel, duelName } from './duel';
import type { Reading } from '../data/types';
const left: Reading = {
  version: 2,
  persona: 'blunt',
  spice: 2,
  topic: 'general',
  spread: 'timeline',
  cards: [
    { index: 19, reversed: false },
    { index: 17, reversed: false },
    { index: 21, reversed: false },
  ],
  seed: 1,
  date: '2026-10-22',
};
const right: Reading = {
  ...left,
  cards: [
    { index: 16, reversed: false },
    { index: 15, reversed: false },
    { index: 18, reversed: false },
  ],
};
it('shares both exact faces and only explicitly typed names', () => {
  const decoded = decodeDuel(new URL(duelUrl(left, right, 'ผู้ท้า', 'เพื่อน')).searchParams);
  expect(decoded).toEqual({
    challenger: left,
    friend: right,
    name: 'ผู้ท้า',
    friendName: 'เพื่อน',
  });
  expect(new URL(duelUrl(left)).searchParams.has('n')).toBe(false);
});
it('rejects malformed challenges, invalid result readings and overlong/control names', () => {
  expect(decodeDuel(new URLSearchParams('c=oops'))).toBeNull();
  expect(duelName('a'.repeat(25))).toBeNull();
  expect(duelName('a\nb')).toBeNull();
  expect(() => duelUrl({ ...left, spread: 'one' })).toThrow();
});
it('compares actual tones deterministically and allows ties without claiming probabilities', () => {
  expect(compareDuel(left, right).winner).toBe('challenger');
  expect(compareDuel(left, left).winner).toBe('tie');
  expect(compareDuel(left, right)).toEqual(compareDuel(left, right));
  expect(compareDuel(left, right)).not.toHaveProperty('probability');
});
