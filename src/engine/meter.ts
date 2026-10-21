import { cards } from '../data/cards';
import type { DrawnCard, Position, Suit, TarotCard } from '../data/types';
import { th } from '../i18n/th';

type PressureRule = {
  reason: string;
  arcana?: TarotCard['arcana'];
  suit?: Suit;
  ranks?: readonly number[];
};

/**
 * Authored tie-breaks within tone -1, never a shuffled/hashed label.
 * Major shadows and these traditional themes exert immediate pressure; other
 * reversed Minor faces describe a less acute caution. Both remain negative.
 */
export const cautionPressureRules: readonly PressureRule[] = [
  { arcana: 'major', reason: 'major-shadow: stalled or resisted turning point' },
  { suit: 'swords', reason: 'swords: conflict, difficult truth or constrained thought' },
  { suit: 'wands', ranks: [5, 9, 10], reason: 'wands: conflict, defensive siege or burden' },
  { suit: 'cups', ranks: [4, 7, 8], reason: 'cups: withdrawal, illusion or departure' },
  {
    suit: 'pentacles',
    ranks: [4, 5, 6, 7],
    reason: 'pentacles: control, scarcity, unequal exchange or sunk effort',
  },
];

export function pressureClassification(card: TarotCard): string | null {
  return (
    cautionPressureRules.find(
      (rule) =>
        (!rule.arcana || rule.arcana === card.arcana) &&
        (!rule.suit || rule.suit === card.suit) &&
        (!rule.ranks || rule.ranks.includes(card.number)),
    )?.reason ?? null
  );
}

export function faceScore(card: TarotCard, reversed: boolean): number {
  const tone = card.tone[reversed ? 'reversed' : 'upright'];
  if (tone !== -1) return tone;
  return tone + (pressureClassification(card) ? -0.125 : 0.125);
}

/**
 * Fixed editorial cutoffs on the actual position-weighted score.
 * Calibrated offline with 20,000 distinct-card draws, 50% reversal, and the
 * spread convention of final-position weight 1.2. Single faces need the
 * authored nuance above: integer tones alone put either 10.9% or 57.7% in
 * the bottom two buckets, so a 30–45% target is otherwise impossible.
 * These are relative narrative buckets, not probabilities of real outcomes.
 * Sizes 4/7/10 are measured in advance for the Phase 2 spreads; no RNG or
 * per-reading quantile computation runs inside the meter.
 */
export const meterThresholds: Readonly<Record<number, readonly [number, number, number, number]>> =
  {
    1: [-1.5, -1, 0.5, 1.5],
    2: [-1.13, -0.61, 0.18, 0.91],
    3: [-1.05, -0.46, 0.07, 0.69],
    4: [-0.95, -0.49, 0.05, 0.52],
    5: [-0.84, -0.45, 0.02, 0.44],
    6: [-0.78, -0.41, 0.02, 0.39],
    7: [-0.74, -0.4, -0.005, 0.34],
    8: [-0.7, -0.39, -0.02, 0.3],
    9: [-0.68, -0.38, -0.035, 0.26],
    10: [-0.65, -0.37, -0.055, 0.23],
  };

export function meter(draw: DrawnCard[], positions: Position[]) {
  const weights = draw.map((_, i) => {
    const weight = positions[i]?.weight ?? 1;
    return Number.isFinite(weight) && weight > 0 ? weight : 1;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const score = totalWeight
    ? draw.reduce((sum, c, i) => sum + faceScore(cards[c.index], c.reversed) * weights[i], 0) /
      totalWeight
    : 0;
  const thresholds = meterThresholds[draw.length || 1] ?? meterThresholds[10];
  const bucket = thresholds.findIndex((cutoff) => score < cutoff);
  const step = bucket < 0 ? 4 : bucket;
  return { step, label: th.reading.labels[step], score };
}
