import { describe, expect, it, vi } from 'vitest';
import { cards } from '../data/cards';
import { spreads } from '../data/spreads';
import type { Position } from '../data/types';
import { draw } from './draw';
import { faceScore, meter, meterThresholds, pressureClassification } from './meter';
import { hashSeed, seededRng } from './rng';

const samples = 20_000;
const cases = spreads.flatMap((spread) => spread.topics.map((topic) => ({ topic, spread })));

function distribution(count: number, positions: Position[], seed: number) {
  const rng = seededRng(seed);
  const buckets = [0, 0, 0, 0, 0];
  for (let i = 0; i < samples; i++) buckets[meter(draw(count, true, rng), positions).step]++;
  return {
    low: (buckets[0] + buckets[1]) / samples,
    high: (buckets[3] + buckets[4]) / samples,
    buckets,
  };
}

function expectBalanced(value: ReturnType<typeof distribution>) {
  expect(value.low, `bottom two: ${JSON.stringify(value.buckets)}`).toBeGreaterThanOrEqual(0.3);
  expect(value.low, `bottom two: ${JSON.stringify(value.buckets)}`).toBeLessThanOrEqual(0.45);
  expect(value.high, `top two: ${JSON.stringify(value.buckets)}`).toBeGreaterThanOrEqual(0.25);
  expect(value.high, `top two: ${JSON.stringify(value.buckets)}`).toBeLessThanOrEqual(0.4);
}

describe('authored meter calibration', () => {
  it('preserves every traditional tone sign and bounds the authored nuance to one eighth', () => {
    for (const card of cards) {
      for (const reversed of [false, true]) {
        const tone = card.tone[reversed ? 'reversed' : 'upright'];
        const score = faceScore(card, reversed);
        expect(Math.sign(score)).toBe(Math.sign(tone));
        expect(Math.abs(score - tone)).toBeLessThanOrEqual(0.125);
        if (tone !== -1) expect(score).toBe(tone);
        else expect(score).toBe(pressureClassification(card) ? -1.125 : -0.875);
      }
    }
  });

  it('documents why an integer-only one-card cutoff cannot meet the lower-bucket budget', () => {
    const faces = cards.flatMap((card) => Object.values(card.tone));
    const belowMinusOne = faces.filter((tone) => tone < -1).length / faces.length;
    const throughMinusOne = faces.filter((tone) => tone <= -1).length / faces.length;
    expect(belowMinusOne).toBeLessThan(0.3);
    expect(throughMinusOne).toBeGreaterThan(0.45);
  });

  it('uses only actual faces and weights, with no random labelling or input mutation', () => {
    const selected = draw(3, true, seededRng(194));
    const positions = spreads.find((spread) => spread.id === 'timeline')!.positions;
    const snapshot = JSON.stringify({ selected, positions });
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw Error('A meter must never draw random labels');
    });
    try {
      const result = meter(selected, positions);
      expect(meter(selected, positions)).toEqual(result);
      const expected =
        selected.reduce(
          (sum, face, i) =>
            sum + faceScore(cards[face.index], face.reversed) * (positions[i].weight ?? 1),
          0,
        ) / positions.reduce((sum, position) => sum + (position.weight ?? 1), 0);
      expect(result.score).toBeCloseTo(expected, 12);
      expect(JSON.stringify({ selected, positions })).toBe(snapshot);
      expect(result).not.toHaveProperty('percentage');
    } finally {
      random.mockRestore();
    }
  });

  it.each(cases)(
    'balances 20,000 $topic readings for $spread.id at 50% reversal',
    ({ topic, spread }) => {
      expect(meterThresholds[spread.positions.length]).toBeDefined();
      expectBalanced(
        distribution(
          spread.positions.length,
          spread.positions,
          hashSeed(`meter-v2:${topic}:${spread.id}`),
        ),
      );
    },
  );

  it.each([4, 7, 10])(
    'measures future %i-card layouts with the actual final-position weight',
    (count) => {
      const positions: Position[] = Array.from({ length: count }, (_, i) => ({
        id: `p${i}`,
        label: `position ${i}`,
        prompt: '',
        layout: { x: i % 3, y: Math.floor(i / 3) },
        weight: i === count - 1 ? 1.2 : 1,
      }));
      expectBalanced(distribution(count, positions, hashSeed(`meter-v2:future:${count}`)));
    },
  );
});
