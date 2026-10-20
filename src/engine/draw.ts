import { shuffle } from './deck';
import { randomFloat, type Rng } from './rng';
import type { DrawnCard } from '../data/types';
export function draw(count: number, reversed = true, rng?: Rng): DrawnCard[] {
  if (!Number.isInteger(count) || count < 1 || count > 78) throw Error('Invalid draw count');
  return shuffle(
    Array.from({ length: 78 }, (_, i) => i),
    rng,
  )
    .slice(0, count)
    .map((index) => ({ index, reversed: reversed && (rng || randomFloat)() < 0.5 }));
}
