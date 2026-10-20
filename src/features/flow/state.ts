import type { DrawnCard, Reading, Topic } from '../../data/types';
import { getSpread } from '../../data/spreads';
import { draw } from '../../engine/draw';
import { randomSeed } from '../../engine/rng';
import { validReading } from '../../engine/share-code';
import { localDate } from '../../services/daily';
import { th } from '../../i18n/th';
export interface ReadingContext {
  question: string;
  remember: boolean;
  situation: string;
  examType: string;
  days: string;
  place: { name: string; latitude: number; longitude: number };
}
export const defaultContext: ReadingContext = {
  question: '',
  remember: false,
  situation: '',
  examType: '',
  days: '',
  place: { name: th.weather.bangkok, latitude: 13.7563, longitude: 100.5018 },
};
export type Stage = 'context' | 'breathe' | 'shuffle' | 'pick' | 'reveal' | 'reading' | 'crisis';
export interface FlowState {
  version: 1;
  topic: Topic;
  spread: string;
  context: ReadingContext;
  stage: Stage;
  deck: DrawnCard[];
  selected: number[];
  revealed: number[];
  seed: number;
  date: string;
}
export function createFlow(topic: Topic, spread: string, reversed: boolean): FlowState {
  return {
    version: 1,
    topic,
    spread,
    context: { ...defaultContext, place: { ...defaultContext.place } },
    stage: 'context',
    deck: draw(78, reversed),
    selected: [],
    revealed: [],
    seed: randomSeed(),
    date: localDate(),
  };
}
export function validContext(value: unknown): value is ReadingContext {
  if (typeof value !== 'object' || !value) return false;
  const c = value as Record<string, unknown>;
  const p = c.place as Record<string, unknown> | undefined;
  return (
    typeof c.question === 'string' &&
    c.question.length <= 140 &&
    typeof c.remember === 'boolean' &&
    typeof c.situation === 'string' &&
    c.situation.length < 40 &&
    typeof c.examType === 'string' &&
    c.examType.length < 60 &&
    typeof c.days === 'string' &&
    /^\d{0,4}$/.test(c.days) &&
    !!p &&
    typeof p.name === 'string' &&
    p.name.length < 150 &&
    typeof p.latitude === 'number' &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    typeof p.longitude === 'number' &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180
  );
}
export function validFlow(value: unknown): value is FlowState {
  if (typeof value !== 'object' || !value) return false;
  const s = value as FlowState;
  const spread = getSpread(s.spread);
  if (
    s.version !== 1 ||
    !spread ||
    !spread.topics.includes(s.topic) ||
    !validContext(s.context) ||
    !['context', 'breathe', 'shuffle', 'pick', 'reveal', 'reading', 'crisis'].includes(s.stage) ||
    !Array.isArray(s.deck) ||
    s.deck.length !== 78 ||
    !Array.isArray(s.selected) ||
    !Array.isArray(s.revealed)
  )
    return false;
  if (
    !s.deck.every(
      (c) =>
        c &&
        Number.isInteger(c.index) &&
        c.index >= 0 &&
        c.index < 78 &&
        typeof c.reversed === 'boolean',
    ) ||
    new Set(s.deck.map((c) => c.index)).size !== 78
  )
    return false;
  if (
    s.selected.length > spread.positions.length ||
    new Set(s.selected).size !== s.selected.length ||
    !s.selected.every((n) => Number.isInteger(n) && n >= 0 && n < 7) ||
    new Set(s.revealed).size !== s.revealed.length ||
    !s.revealed.every((n) => Number.isInteger(n) && n >= 0 && n < s.selected.length)
  )
    return false;
  if (['reveal', 'reading'].includes(s.stage) && s.selected.length !== spread.positions.length)
    return false;
  if (s.stage === 'reading' && s.revealed.length !== s.selected.length) return false;
  const probe: Reading = {
    version: 1,
    topic: s.topic,
    spread: s.spread,
    cards: s.deck.slice(0, spread.positions.length),
    seed: s.seed,
    date: s.date,
  };
  return validReading(probe);
}
export function flowReading(state: FlowState): Reading {
  return {
    version: 1,
    topic: state.topic,
    spread: state.spread,
    cards: state.selected.map((index) => state.deck[index]),
    seed: state.seed,
    date: state.date,
  };
}
