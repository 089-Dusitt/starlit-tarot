import { describe, expect, it } from 'vitest';
import { cards } from '../data/cards';
import { major } from '../data/cards/major';
import { wands } from '../data/cards/wands';
import { cups } from '../data/cards/cups';
import { swords } from '../data/cards/swords';
import { pentacles } from '../data/cards/pentacles';
import { personaIds } from '../data/personas';
import { spreads } from '../data/spreads';
import { topicIds } from '../data/topic-ids';
import type { Persona, Reading, Spice, Topic } from '../data/types';
import { voiceBanks } from '../data/voice-banks';
import { lintTone } from '../../scripts/lint-tone';
import { validateContent } from '../../scripts/validate-content';
import { compose } from './compose';
import { draw } from './draw';
import { hashSeed, seededRng } from './rng';
import { decodeReading, encodeReading } from './share-code';

const legacyCode = 'AQMAASEAANQxAAm1MQ';
const oldDeck = [...major, ...wands, ...cups, ...swords, ...pentacles];
const legacyTopics = ['love', 'exam', 'weather', 'general'] as const;
const modes = personaIds.flatMap((persona) =>
  ([1, 2, 3] as const).flatMap((spice) => topicIds.map((topic) => ({ persona, spice, topic }))),
);

function readingFor(topic: Topic, persona: Persona, spice: Spice): Reading {
  const spread =
    spreads.find(
      (candidate) =>
        !candidate.baseId && candidate.topics.includes(topic) && candidate.positions.length === 3,
    ) ?? spreads.find((candidate) => !candidate.baseId && candidate.topics.includes(topic))!;
  const seed = hashSeed(`phase2:${topic}:${persona}:${spice}`);
  return {
    version: 2,
    persona,
    spice,
    topic,
    spread: spread.id,
    cards: draw(spread.positions.length, true, seededRng(seed)),
    seed,
    date: '2026-10-21',
  };
}

describe('Phase 2 persona and spice composer contract', () => {
  it.each(modes)(
    '$persona / spice $spice / $topic is deterministic, specific and share-replayable',
    ({ persona, spice, topic }) => {
      const reading = readingFor(topic, persona, spice);
      const snapshot = JSON.stringify(reading);
      const result = compose(reading);
      expect(compose(reading)).toEqual(result);
      expect(compose(decodeReading(encodeReading(reading))!)).toEqual(result);
      expect(JSON.stringify(reading)).toBe(snapshot);
      expect(result.persona).toBe(persona);
      expect(result.spice).toBe(spice);
      expect(result.headline.trim().length).toBeGreaterThan(0);
      expect(result.headline.length).toBeLessThanOrEqual(60);
      expect(result.tips.length).toBeGreaterThanOrEqual(1);
      expect(result.tips.length).toBeLessThanOrEqual(3);
      expect(result.closing.trim()).not.toBe('');
      expect(JSON.stringify(result)).not.toMatch(/\{(?:card|position|key|label|omen)\}/);
      expect(result.slots).toHaveLength(reading.cards.length);
      result.slots.forEach((slot, i) => {
        expect(slot.index).toBe(reading.cards[i].index);
        expect(slot.reversed).toBe(reading.cards[i].reversed);
        expect(result.overview).toContain(slot.card.name.th);
        expect(result.overview).toContain(slot.position.label);
        const orientation = slot.reversed ? 'reversed' : 'upright';
        expect(slot.meaning).toBe(
          (persona === 'gentle' ? slot.card.gentleMeanings : slot.card.meanings)[topic][
            orientation
          ],
        );
        expect(slot.bite).toBe(slot.card.bite[topic][orientation]);
        expect(slot.voice).toBe(slot.card.voice[persona][orientation]);
      });
      if (spice === 1) {
        expect(result.hardTruth).toBe('');
        expect(result.omens).toEqual([]);
        expect(result.verdict).toBe('');
        expect(result.cliffhanger).toBe('');
      } else {
        expect(result.hardTruth.trim()).not.toBe('');
        expect(result.omens.length).toBeGreaterThanOrEqual(1);
        expect(result.omens.length).toBeLessThanOrEqual(2);
        expect(result.omens[0]).toBe(result.slots[result.weakestIndex].omen);
        if (spice === 3) {
          expect(result.verdict).toContain(result.meter.label);
          expect(result.verdict).not.toContain(result.hardTruth);
          expect(result.cliffhanger.trim()).not.toBe('');
          expect(result.slots.every((slot) => slot.bite && slot.voice)).toBe(true);
        } else {
          expect(result.verdict).toBe('');
          expect(result.cliffhanger).toBe('');
        }
      }
    },
  );

  it('keeps the same actual cards, orientations, positions and seed while switching every style', () => {
    const original = readingFor('general', 'blunt', 2);
    const snapshot = JSON.stringify(original);
    const fixedSlots = compose(original).slots.map((slot) => ({
      index: slot.index,
      reversed: slot.reversed,
      position: slot.position.id,
    }));
    const headlines = new Set<string>();
    for (const persona of personaIds) {
      for (const spice of [1, 2, 3] as const) {
        const restyled = { ...original, persona, spice };
        const result = compose(restyled);
        expect(restyled.seed).toBe(original.seed);
        expect(
          result.slots.map((slot) => ({
            index: slot.index,
            reversed: slot.reversed,
            position: slot.position.id,
          })),
        ).toEqual(fixedSlots);
        headlines.add(result.headline);
      }
    }
    expect(headlines.size).toBeGreaterThanOrEqual(5);
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it('has at least six distinct authored choices in every persona bank slot', () => {
    for (const persona of personaIds) {
      for (const [slot, variants] of Object.entries(voiceBanks[persona]) as [string, string[]][]) {
        expect(variants.length, `${persona}.${slot}`).toBeGreaterThanOrEqual(6);
        expect(new Set(variants).size, `${persona}.${slot}`).toBe(variants.length);
        expect(variants.every((line) => line.trim().length > 0)).toBe(true);
      }
      for (const template of voiceBanks[persona].headline)
        for (const card of cards)
          for (const omen of Object.values(card.omen)) {
            expect(
              template.replace('{omen}', omen).length,
              `${persona} ${card.id}`,
            ).toBeLessThanOrEqual(60);
          }
    }
  });

  it('identifies the true lowest-tone card for the final suspense reveal', () => {
    const reading: Reading = {
      version: 2,
      topic: 'general',
      spread: 'timeline',
      persona: 'oracle',
      spice: 3,
      cards: [
        { index: 19, reversed: false },
        { index: 16, reversed: false },
        { index: 0, reversed: false },
      ],
      seed: 54321,
      date: '2026-10-21',
    };
    const result = compose(reading);
    expect(result.weakestIndex).toBe(1);
    expect(result.slots[result.weakestIndex].card.id).toBe('major-16-tower');
  });
});

describe('Phase 2 content and v1 compatibility', () => {
  it('retains every v1 topic/orientation meaning and the gentle card voice', () => {
    expect(oldDeck).toHaveLength(78);
    cards.forEach((card, i) => {
      expect(card.id).toBe(oldDeck[i].id);
      for (const topic of legacyTopics)
        expect(card.gentleMeanings[topic]).toEqual(oldDeck[i].meanings[topic]);
      expect(card.voice.gentle).toEqual(oldDeck[i].meanings.general);
    });
    for (const topic of legacyTopics) {
      cards.forEach((card, index) => {
        for (const reversed of [false, true]) {
          const reading: Reading = {
            version: 1,
            topic,
            spread: topic === 'weather' ? 'sky' : 'one',
            cards: [{ index, reversed }],
            seed: 54321,
            date: '2026-10-21',
          };
          const result = compose(reading);
          expect(result.persona).toBe('gentle');
          expect(result.spice).toBe(1);
          expect(result.slots[0].meaning).toBe(
            oldDeck[index].meanings[topic][reversed ? 'reversed' : 'upright'],
          );
          expect(result.slots[0].card.id).toBe(card.id);
        }
      });
    }
  });

  it('opens a fixed, independently preserved v1 link as gentle spice 1', () => {
    const decoded = decodeReading(legacyCode);
    expect(decoded).toEqual({
      version: 2,
      topic: 'general',
      spread: 'one',
      cards: [{ index: 16, reversed: true }],
      seed: 54321,
      date: '2026-10-21',
      persona: 'gentle',
      spice: 1,
    });
    const result = compose(decoded!);
    expect(result.slots[0].meaning).toBe(oldDeck[16].meanings.general.reversed);
    expect(result.hardTruth).toBe('');
    expect(result.verdict).toBe('');
  });

  it('requires all 78 audited cards and enforces the Tone Bible as part of the test suite', () => {
    expect(cards).toHaveLength(78);
    expect(cards.every((card) => card.contentVersion === 2)).toBe(true);
    expect(validateContent(cards)).toEqual([]);
    expect(lintTone()).toEqual([]);
  });
});
