import { cards } from '../data/cards';
import type { DrawnCard, Suit } from '../data/types';
import { engineCopy } from '../i18n/th';
export function patterns(draw: DrawnCard[]): string[] {
  if (draw.length < 3) return [];
  const picked = draw.map((c) => cards[c.index]);
  const insights: string[] = [];
  if (picked.filter((c) => c.arcana === 'major').length >= Math.ceil(picked.length * 0.6))
    insights.push(engineCopy.patterns.major);
  for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as Suit[])
    if (picked.filter((c) => c.suit === suit).length >= Math.ceil(picked.length * 0.6))
      insights.push(engineCopy.patterns[suit]);
  if (draw.filter((c) => c.reversed).length > draw.length / 2)
    insights.push(engineCopy.patterns.reversed);
  if (picked.some((c) => c.arcana === 'minor' && c.number >= 11))
    insights.push(engineCopy.patterns.court);
  const numbers = picked.filter((c) => c.arcana === 'minor' && c.number <= 10).map((c) => c.number);
  if (new Set(numbers).size < numbers.length) insights.push(engineCopy.patterns.repeated);
  return insights;
}
