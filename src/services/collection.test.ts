import { beforeEach, it, expect, vi } from 'vitest';
import { collectionState, recordCollection, foilFace } from './collection';
import type { Reading } from '../data/types';
import { PREFIX } from './storage';
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
beforeEach(() => localStorage.clear());
it('counts real draws once across styles and unlocks the Tower milestone only at three distinct draws', () => {
  recordCollection(r);
  recordCollection({ ...r, persona: 'mu', spice: 3 });
  expect(collectionState().readings).toBe(1);
  for (const seed of [2, 3]) recordCollection({ ...r, seed });
  const state = collectionState();
  expect(state.counts[16]).toBe(3);
  expect(state.achievements.find((a) => a.id === 'tower')?.unlocked).toBe(true);
  expect(state.achievements.find((a) => a.id === 'all')?.unlocked).toBe(false);
  expect(state.achievements.length).toBeGreaterThanOrEqual(25);
});
it('represents all78slots and accurate topic/reversal stats, with deterministic cosmetic foil near one in25', () => {
  for (let index = 0; index < 78; index++)
    recordCollection({ ...r, cards: [{ index, reversed: index % 2 === 0 }], seed: index });
  const state = collectionState();
  expect(state.unlocked.size).toBe(78);
  expect(state.reversedRatio).toBe(0.5);
  expect(state.favorite).toBe('general');
  expect(state.backs.every((b) => b.unlocked)).toBe(true);
  let foil = 0;
  for (let seed = 0; seed < 5000; seed++) foil += Number(foilFace({ ...r, seed }, 0));
  expect(foil / 5000).toBeGreaterThan(0.03);
  expect(foil / 5000).toBeLessThan(0.05);
});
it('never overwrites malformed or unsupported albums and survives quota denial', () => {
  const raw = '{"version":99,"codes":[]}';
  localStorage.setItem(PREFIX + 'collection', raw);
  expect(recordCollection(r)).toBe(false);
  expect(localStorage.getItem(PREFIX + 'collection')).toBe(raw);
  localStorage.clear();
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw Error('Quota');
  });
  expect(recordCollection(r)).toBe(false);
  write.mockRestore();
});
