import { cards } from '../data/cards';
import { getSpread } from '../data/spreads';
import type { Reading } from '../data/types';
import { engineCopy, th } from '../i18n/th';
import { seededRng } from './rng';
import { patterns } from './patterns';
import { meter } from './meter';
import { readingStyle } from '../data/personas';
// Two high bits preserve the coarse study-plan window without sharing an exam date.
export function examSeed(seed: number, days: string): number {
  const bucket = days === '' ? 0 : Number(days) <= 3 ? 1 : Number(days) <= 14 ? 2 : 3;
  return ((seed & 0x3fffffff) | (bucket << 30)) >>> 0;
}
export function compose(reading: Reading) {
  const spread = getSpread(reading.spread);
  if (!spread) throw Error('Unknown spread');
  const rng = seededRng(reading.seed);
  const { persona } = readingStyle(reading);
  const slots = reading.cards.map((drawn, i) => {
    const card = cards[drawn.index];
    const orientation = drawn.reversed ? 'reversed' : 'upright';
    const position = spread.positions[i];
    const prefix = engineCopy.slots[Math.floor(rng() * 3)];
    const meaning = (persona === 'gentle' ? card.gentleMeanings : card.meanings)[reading.topic][
      orientation
    ];
    return {
      ...drawn,
      card,
      position,
      meaning,
      advice: card.advice[orientation],
      keywords: card.keywords[orientation],
      summary: `${prefix} “${position.label}” ${card.name.th}${drawn.reversed ? ` (${th.common.reversed})` : ''} ${meaning}`,
    };
  });
  const headline = engineCopy.headlines[reading.topic][Math.floor(rng() * 3)];
  const overview = `${engineCopy.openings[reading.topic][Math.floor(rng() * 3)]} ${slots.map((s) => s.summary).join(' ')}`;
  return {
    headline,
    overview,
    slots,
    insights: patterns(reading.cards),
    meter: meter(reading.cards, spread.positions),
    tips:
      reading.topic === 'exam'
        ? (reading.seed >>> 30 === 1
            ? engineCopy.exam.soon
            : reading.seed >>> 30 === 2
              ? engineCopy.exam.middle
              : engineCopy.exam.far
          ).map(
            (tip, i) =>
              `${slots[i % slots.length].card.name.th}: ${tip} — ${slots[i % slots.length].advice}`,
          )
        : slots.map((s) => s.advice).slice(0, 3),
  };
}
