import { topicIds } from './topic-ids';
import type { Persona, Spice } from './cards/phase2-types';
import type { Pair, CoreTopic } from './cards/phase2-types';
export type { Persona, Spice } from './cards/phase2-types';
export type Topic = (typeof topicIds)[number];
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Orientation = 'upright' | 'reversed';
export type Tone = -2 | -1 | 0 | 1 | 2;
export type SkyMood =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'windy'
  | 'misty'
  | 'clear-night'
  | 'rainbow'
  | 'changeable';
export interface CardIdentity {
  keywords?: Record<Orientation, string[]>;
  id: string;
  arcana: 'major' | 'minor';
  suit?: Suit;
  number: number;
  name: { th: string; en: string };
  element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
}
export interface TarotCard extends CardIdentity {
  contentVersion: 1 | 2;
  keywords: Record<Orientation, string[]>;
  tone: Record<Orientation, Tone>;
  skyMood: SkyMood;
  luckyColor: { th: string; hex: string };
  meanings: Record<Topic, Record<Orientation, string>>;
  advice: Record<Orientation, string>;
  gentleMeanings: Record<Topic, Pair>;
  bite: Record<Topic, Pair>;
  voice: Record<Persona, Pair>;
  omen: Pair;
}
export type CoreTarotCard = Omit<TarotCard, 'meanings' | 'gentleMeanings' | 'bite'> & {
  meanings: Record<CoreTopic, Pair>;
  gentleMeanings: Record<CoreTopic, Pair>;
  bite: Record<CoreTopic, Pair>;
};
export interface Position {
  id: string;
  label: string;
  prompt: string;
  layout: { x: number; y: number };
  weight?: number;
}
export interface Spread {
  id: string;
  name: { th: string; en: string };
  topics: Topic[];
  positions: Position[];
  minutes: number;
}
export interface DrawnCard {
  index: number;
  reversed: boolean;
}
export interface Reading {
  version: 1 | 2;
  persona?: Persona;
  spice?: Spice;
  topic: Topic;
  spread: string;
  cards: DrawnCard[];
  seed: number;
  date: string;
}
