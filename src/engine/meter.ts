import { cards } from '../data/cards';
import type { DrawnCard, Position } from '../data/types';
import { th } from '../i18n/th';
export function meter(draw: DrawnCard[], positions: Position[]) {
  const weights = draw.map((_, i) => positions[i]?.weight ?? 1);
  const mean =
    draw.reduce(
      (sum, c, i) => sum + cards[c.index].tone[c.reversed ? 'reversed' : 'upright'] * weights[i],
      0,
    ) / weights.reduce((a, b) => a + b, 0);
  const step = Math.min(4, Math.max(0, Math.round(Number.isFinite(mean) ? mean + 2 : 2)));
  return { step, label: th.reading.labels[step] };
}
