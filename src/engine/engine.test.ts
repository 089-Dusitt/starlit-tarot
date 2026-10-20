import { describe, it, expect } from 'vitest';
import { shuffle } from './deck';
import { draw } from './draw';
import { hashSeed, seededRng } from './rng';
import { meter } from './meter';
import { patterns } from './patterns';
import { compose, examSeed } from './compose';
import { encodeReading, decodeReading, validReading } from './share-code';
import { cards } from '../data/cards';
import { spreads } from '../data/spreads';
import type { Reading } from '../data/types';
const reading: Reading = {
  version: 1,
  topic: 'love',
  spread: 'connection',
  cards: [
    { index: 0, reversed: false },
    { index: 37, reversed: false },
    { index: 54, reversed: true },
  ],
  seed: 7188,
  date: '2026-10-21',
};
describe('random deck and draw', () => {
  it('shuffles a permutation without mutating its source', () => {
    const source = Array.from({ length: 78 }, (_, i) => i);
    const mixed = shuffle(source, seededRng(42));
    expect(mixed).not.toEqual(source);
    expect([...mixed].sort((a, b) => a - b)).toEqual(source);
    expect(source[0]).toBe(0);
  });
  it('reproduces seeded runs and draws unique cards', () => {
    expect(draw(20, true, seededRng(7))).toEqual(draw(20, true, seededRng(7)));
    expect(new Set(draw(78).map((c) => c.index)).size).toBe(78);
    expect(() => draw(79)).toThrow();
  });
  it('respects orientation settings and roughly half reversed', () => {
    const rng = seededRng(31);
    const all = Array.from({ length: 100 }, () => draw(78, true, rng)).flat();
    const ratio = all.filter((c) => c.reversed).length / all.length;
    expect(ratio).toBeGreaterThan(0.47);
    expect(ratio).toBeLessThan(0.53);
    expect(draw(78, false, rng).every((c) => !c.reversed)).toBe(true);
  });
  it('hashes stable device/day inputs', () => {
    expect(hashSeed('2026-10-21:device')).toBe(hashSeed('2026-10-21:device'));
    expect(hashSeed('2026-10-22:device')).not.toBe(hashSeed('2026-10-21:device'));
  });
});
describe('readings', () => {
  it('shares identical practical study plans while preserving the chosen preparation window', () => {
    for (const days of ['', '2', '10', '30']) {
      const exam: Reading = {
        ...reading,
        topic: 'exam',
        spread: 'study',
        seed: examSeed(reading.seed, days),
      };
      expect(compose(decodeReading(encodeReading(exam))!).tips).toEqual(compose(exam).tips);
      expect(compose(exam).tips).toHaveLength(3);
    }
    const soon = {
      ...reading,
      topic: 'exam' as const,
      spread: 'study',
      seed: examSeed(reading.seed, '2'),
    };
    expect(compose(soon).tips[0]).toContain('ทวนสรุป');
  });
  it('uses weighted qualitative labels within bounds', () => {
    for (let seed = 0; seed < 50; seed++) {
      const value = meter(draw(3, true, seededRng(seed)), spreads[1].positions);
      expect(value.step).toBeGreaterThanOrEqual(0);
      expect(value.step).toBeLessThanOrEqual(4);
      expect(value.label).toBeTruthy();
      expect(value).not.toHaveProperty('percentage');
    }
  });
  it('composes deterministically and names every actual card and position', () => {
    const value = compose(reading);
    expect(value).toEqual(compose(reading));
    for (const c of reading.cards) expect(value.overview).toContain(cards[c.index].name.th);
    for (const p of spreads.find((s) => s.id === reading.spread)!.positions)
      expect(value.overview).toContain(p.label);
  });
  it('detects major, suit, reverse, court and repeated themes only when relevant', () => {
    expect(
      patterns([
        { index: 0, reversed: true },
        { index: 1, reversed: true },
        { index: 2, reversed: false },
      ]).length,
    ).toBe(2);
    expect(
      patterns([
        { index: 22, reversed: false },
        { index: 23, reversed: false },
        { index: 33, reversed: false },
      ]).length,
    ).toBe(2);
    expect(
      patterns([
        { index: 23, reversed: false },
        { index: 37, reversed: false },
        { index: 51, reversed: false },
      ]).length,
    ).toBe(1);
    expect(patterns([{ index: 0, reversed: false }])).toEqual([]);
  });
});
describe('compact untrusted share codes', () => {
  it('round-trips every spread and keeps replay identical', () => {
    for (const spread of spreads) {
      const r: Reading = {
        ...reading,
        topic: spread.topics[0],
        spread: spread.id,
        cards: draw(spread.positions.length, true, seededRng(11)),
      };
      const result = decodeReading(encodeReading(r));
      expect(result).toEqual(r);
      expect(compose(result!)).toEqual(compose(r));
    }
  });
  it('rejects garbage, altered codes, invalid indices, duplicate cards and dates', () => {
    for (const code of ['', '<script>', 'AAAAAA', 'A'.repeat(1000), encodeReading(reading) + 'A'])
      expect(decodeReading(code)).toBeNull();
    expect(validReading({ ...reading, date: '2026-02-31' })).toBe(false);
    expect(validReading({ ...reading, cards: [{ index: 99, reversed: false }] })).toBe(false);
    expect(
      validReading({ ...reading, cards: [reading.cards[0], reading.cards[0], reading.cards[2]] }),
    ).toBe(false);
    expect(() => encodeReading({ ...reading, seed: -1 })).toThrow();
  });
  it('does not encode arbitrary question or private fields', () => {
    const extra = { ...reading, question: 'private question', latitude: 13.7 };
    expect(decodeReading(encodeReading(extra))).not.toHaveProperty('question');
    expect(decodeReading(encodeReading(extra))).not.toHaveProperty('latitude');
  });
});
