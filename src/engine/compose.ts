import { cards } from '../data/cards';
import { getSpread } from '../data/spreads';
import type { Reading } from '../data/types';
import { engineCopy, th } from '../i18n/th';
import { seededRng } from './rng';
import { patterns } from './patterns';
import { meter } from './meter';
import { readingStyle } from '../data/personas';
import { voiceBanks, meterLabels } from '../data/voice-banks';
import { findCombos } from '../data/combos';
import { positionFrame } from './position';
export function examSeed(seed: number, days: string): number {
  const bucket = days === '' ? 0 : Number(days) <= 3 ? 1 : Number(days) <= 14 ? 2 : 3;
  return ((seed & 0x3fffffff) | (bucket << 30)) >>> 0;
}
export function compose(reading: Reading) {
  const spread = getSpread(reading.spread);
  if (!spread || reading.cards.length !== spread.positions.length)
    throw Error('Unknown or incomplete spread');
  const { persona, spice } = readingStyle(reading);
  const rng = seededRng(reading.seed);
  const bank = voiceBanks[persona];
  const pick = (items: string[]) => items[Math.floor(rng() * items.length)];
  const slots = reading.cards.map((drawn, i) => {
    const card = cards[drawn.index];
    const orientation = drawn.reversed ? 'reversed' : 'upright';
    const position = spread.positions[i];
    const meaning = (persona === 'gentle' ? card.gentleMeanings : card.meanings)[reading.topic][
      orientation
    ];
    return {
      ...drawn,
      card,
      position,
      orientation,
      meaning,
      positionFrame: positionFrame(card, drawn.reversed, reading.topic, position.label, persona),
      advice: card.advice[orientation],
      bite: card.bite[reading.topic][orientation],
      voice: card.voice[persona][orientation],
      omen: card.omen[orientation],
      tone: card.tone[orientation],
      keywords: card.keywords[orientation],
      summary: `${position.label}: ${card.name.th}${drawn.reversed ? ` (${th.common.reversed})` : ''}`,
    };
  });
  const weakest = slots.reduce((a, b) => (b.tone < a.tone ? b : a));
  const strongest = slots.reduce((a, b) => (b.tone > a.tone ? b : a));
  const gauge = meter(reading.cards, spread.positions);
  const focus = gauge.step >= 3 ? strongest : weakest;
  const label = meterLabels[persona][gauge.step];
  const values: Record<string, string> = {
    card: focus.card.name.th,
    position: focus.position.label,
    key: focus.keywords[0],
    label,
    omen: focus.omen,
  };
  const fill = (line: string) => line.replace(/\{(\w+)\}/g, (_, key: string) => values[key] || '');
  const matched = findCombos(reading.cards, spread.positions)
    .sort(
      (a, b) =>
        Number(b.cards.includes(weakest.card.id)) - Number(a.cards.includes(weakest.card.id)) ||
        b.cards.length - a.cards.length,
    )
    .slice(0, 2);
  const comboLines = matched.map(
    (combo) => combo.lines[reading.topic][spice === 3 ? 'hot' : 'medium'],
  );
  const truthCombo = matched.find((combo) => combo.cards.includes(weakest.card.id));
  const hardTruth =
    spice >= 2
      ? truthCombo?.lines[reading.topic][spice === 3 ? 'hot' : 'medium'] || weakest.bite
      : '';
  const omens =
    spice >= 2
      ? [weakest.omen, ...comboLines.filter((line) => line !== hardTruth)].slice(0, 2)
      : [];
  const headline = fill(pick(bank.headline));
  const overview = `${fill(pick(bank.opening))} ${slots.map((s) => s.summary).join(' · ')}`;
  const tips =
    reading.topic === 'exam'
      ? (reading.seed >>> 30 === 1
          ? engineCopy.exam.soon
          : reading.seed >>> 30 === 2
            ? engineCopy.exam.middle
            : engineCopy.exam.far
        ).map(
          (tip, i) =>
            `${slots[i % slots.length].card.name.th}: ${persona === 'gentle' ? '' : pick(bank.tip)}${tip}`,
        )
      : slots
          .slice(0, spice === 1 ? 2 : 1)
          .map((slot) => `${persona === 'gentle' ? '' : pick(bank.tip)}${slot.advice}`);
  return {
    headline,
    overview,
    slots,
    insights: spice === 1 ? patterns(reading.cards) : comboLines,
    meter: { ...gauge, label },
    tips,
    persona,
    spice,
    hardTruth,
    omens,
    closing: fill(pick(bank.closing)),
    verdict: spice === 3 ? fill(pick(bank.verdict)) : '',
    cliffhanger: spice === 3 ? fill(pick(bank.cliffhanger)) : '',
    weakestIndex: slots.indexOf(weakest),
    matchedCombos: matched.map((c) => c.id),
  };
}
