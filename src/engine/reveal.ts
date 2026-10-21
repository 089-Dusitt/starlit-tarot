import { cards } from '../data/cards';
import type { DrawnCard, Spice } from '../data/types';
export function revealOrder(draw: DrawnCard[], spice: Spice): number[] {
  const order = draw.map((_, i) => i);
  if (spice !== 3 || draw.length < 2) return order;
  const tone = (index: number) =>
    cards[draw[index].index].tone[draw[index].reversed ? 'reversed' : 'upright'];
  const lowest = order.reduce((a, b) => (tone(b) < tone(a) ? b : a));
  return [...order.filter((i) => i !== lowest), lowest];
}
