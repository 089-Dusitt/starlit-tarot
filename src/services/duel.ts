import type { Reading } from '../data/types';
import { cards } from '../data/cards';
import { draw } from '../engine/draw';
import { randomSeed } from '../engine/rng';
import { decodeReading, encodeReading, validReading } from '../engine/share-code';
import { readingStyle } from '../data/personas';
import { localDate } from './daily';
import { SITE } from '../config';
import { duelCopy } from '../i18n/duel';
import { recordCollection } from './collection';
export const validDuelReading = (v: unknown): v is Reading =>
  validReading(v) && v.topic === 'general' && v.spread === 'timeline';
export function newDuelReading(
  style: Pick<Reading, 'persona' | 'spice'>,
  reversed: boolean,
): Reading {
  const reading: Reading = {
    version: 2,
    topic: 'general',
    spread: 'timeline',
    cards: draw(3, reversed),
    seed: randomSeed(),
    date: localDate(),
    persona: style.persona || 'blunt',
    spice: style.spice || 2,
  };
  recordCollection(reading);
  return reading;
}
export function duelName(name: string) {
  const value = name.trim();
  return value.length <= 24 &&
    Array.from(value).every((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
    ? value
    : null;
}
export function decodeDuel(params: URLSearchParams) {
  const c = params.get('c');
  const r = params.get('r');
  const challenger = c ? decodeReading(c) : null;
  const friend = r ? decodeReading(r) : null;
  const name = duelName(params.get('n') || '');
  const friendName = duelName(params.get('f') || '');
  if (
    !challenger ||
    !validDuelReading(challenger) ||
    (r && !validDuelReading(friend)) ||
    name === null ||
    friendName === null
  )
    return null;
  return { challenger, friend, name, friendName };
}
export function duelUrl(challenger: Reading, friend?: Reading, name = '', friendName = '') {
  if (
    !validDuelReading(challenger) ||
    (friend && !validDuelReading(friend)) ||
    duelName(name) === null ||
    duelName(friendName) === null
  )
    throw Error('Invalid duel');
  const url = new URL('duel', SITE.url.replace(/\/$/, '') + '/');
  url.searchParams.set('c', encodeReading(challenger));
  if (friend) url.searchParams.set('r', encodeReading(friend));
  if (name.trim()) url.searchParams.set('n', name.trim());
  if (friendName.trim()) url.searchParams.set('f', friendName.trim());
  return url.href;
}
export function compareDuel(challenger: Reading, friend: Reading) {
  const score = (r: Reading) =>
    Math.round(
      50 +
        (r.cards.reduce(
          (sum, c) => sum + cards[c.index].tone[c.reversed ? 'reversed' : 'upright'],
          0,
        ) /
          r.cards.length) *
          25,
    );
  const left = score(challenger),
    right = score(friend);
  const suits = (r: Reading) => r.cards.map((c) => cards[c.index].suit || 'major');
  const common = suits(challenger).some((s) => suits(friend).includes(s));
  return {
    left,
    right,
    winner: left === right ? 'tie' : left > right ? 'challenger' : 'friend',
    compatibility: common ? duelCopy.compatible : duelCopy.different,
    line: duelCopy.voices[readingStyle(challenger).persona],
  };
}
