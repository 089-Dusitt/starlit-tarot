import type { Orientation, Tone } from '../types';
export const personaIds = ['blunt', 'oracle', 'bestie', 'mu', 'gentle'] as const;
export type Persona = (typeof personaIds)[number];
export type Spice = 1 | 2 | 3;
export type Pair = Record<Orientation, string>;
export type CoreTopic = 'general' | 'love' | 'exam' | 'weather';
export interface CardUpgrade {
  id: string;
  tone: Record<Orientation, Tone>;
  meanings: Record<CoreTopic, Pair>;
  bite: Record<CoreTopic, Pair>;
  voice: Record<Exclude<Persona, 'gentle'>, Pair>;
  omen: Pair;
}
