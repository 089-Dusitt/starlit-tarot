import { describe, it, expect, beforeEach } from 'vitest';
import { decodeReading, encodeReading, validReading } from './share-code';
import { personaIds } from '../data/personas';
import type { Reading } from '../data/types';
import { getHistory } from '../services/history';
const legacy: Reading = {
  version: 1,
  topic: 'general',
  spread: 'one',
  cards: [{ index: 16, reversed: true }],
  seed: 54321,
  date: '2026-10-21',
};
beforeEach(() => localStorage.clear());
describe('legacy migration and style replay', () => {
  it('decodes v1 as gentle spice one without changing the cards or seed', () => {
    const code = encodeReading(legacy);
    expect(decodeReading(code)).toEqual({ ...legacy, version: 2, persona: 'gentle', spice: 1 });
    expect(decodeReading(encodeReading(decodeReading(code)!))).toEqual(decodeReading(code));
  });
  it('round trips every persona and spice in v2 and rejects out-of-range styles', () => {
    for (const persona of personaIds)
      for (const spice of [1, 2, 3] as const) {
        const current: Reading = { ...legacy, version: 2, persona, spice };
        expect(decodeReading(encodeReading(current))).toEqual(current);
      }
    expect(validReading({ ...legacy, version: 2, persona: 'unknown', spice: 3 })).toBe(false);
    expect(validReading({ ...legacy, version: 2, persona: 'blunt', spice: 4 })).toBe(false);
  });
  it('migrates v1 history preserving opted-in private context', () => {
    localStorage.setItem(
      'starlit:history',
      JSON.stringify([
        { id: encodeReading(legacy), reading: legacy, question: 'เก็บไว้ด้วย', days: '3' },
      ]),
    );
    expect(getHistory()[0]).toMatchObject({
      question: 'เก็บไว้ด้วย',
      days: '3',
      reading: { version: 2, persona: 'gentle', spice: 1, cards: legacy.cards },
    });
    expect(getHistory()).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('starlit:history')!).version).toBe(2);
  });
});
