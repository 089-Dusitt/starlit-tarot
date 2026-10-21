import type { Reading, Persona, Spice } from '../data/types';
import { cards } from '../data/cards';
import { readingStyle } from '../data/personas';
import { draw } from '../engine/draw';
import { randomSeed } from '../engine/rng';
import { localDate } from './daily';
import { needsSupport } from './crisis';
import { readStored, writeStored } from './storage';
import { recordCollection } from './collection';
const seen = new Map<string, number>();
let memoryAt = 0;
import { oracleCopy } from '../i18n/oracle';
export { oracleCopy } from '../i18n/oracle';
export function oracleAnswer(reading: Reading) {
  const card = cards[reading.cards[0].index];
  const orientation = reading.cards[0].reversed ? 'reversed' : 'upright';
  const tone = card.tone[orientation];
  const answer = tone > 0 ? 'yes' : tone < 0 ? 'no' : 'wait';
  const { persona, spice } = readingStyle(reading);
  return {
    title: oracleCopy.answers[answer],
    body: `${oracleCopy.lines[persona][answer]}${spice >= 2 ? ' ' + card.voice[persona][orientation] : ''}${spice === 3 ? ' ' + card.bite.general[orientation] : ''}`,
  };
}
export function oracleRemaining(now = Date.now()) {
  const stored = readStored(
    'oracle-clock',
    { version: 1, at: memoryAt },
    (v): v is { version: number; at: number } =>
      !!v &&
      typeof v === 'object' &&
      (v as { version?: unknown }).version === 1 &&
      typeof (v as { at?: unknown }).at === 'number' &&
      Number.isFinite((v as { at: number }).at),
  );
  const elapsed = now - Math.max(memoryAt, stored.at);
  return elapsed >= 0 && elapsed < 60000 ? Math.ceil((60000 - elapsed) / 1000) : 0;
}
export type OracleResult =
  | { kind: 'reading'; reading: Reading }
  | { kind: 'cooldown'; seconds: number }
  | { kind: 'refusal' | 'sensitive' | 'crisis' };
export function askOracle(
  question: string,
  persona: Persona,
  spice: Spice,
  reversed: boolean,
  now = Date.now(),
): OracleResult {
  if (needsSupport(question)) return { kind: 'crisis' };
  if (
    !question.trim() ||
    /เงิน|รวย|มรดก|หนี้|คดี|กฎหมาย|ตั้งท้อง|ท้องหรือ|ผลสอบ|ได้เกรด|สอบติด|สอบได้|ตายไหม|ตายหรือ|รถชน|โดนชน|เสียชีวิต|จะตาย|ป่วย|โรค|มะเร็ง|ท้องไหม|ตั้งครรภ์|ชนะคดี|ติดคุก|หุ้น|กำไร|ลงทุน|หวย|พนัน|นอกใจ|อุบัติเหตุ|สอบผ่าน|สอบตก|คะแนน|ฝนจะตก/.test(
      question,
    )
  )
    return { kind: 'sensitive' };
  const seconds = oracleRemaining(now);
  if (seconds) return { kind: 'cooldown', seconds };
  const key = question
    .normalize('NFKC')
    .replace(/[\p{P}\s]/gu, '')
    .toLocaleLowerCase('th');
  const count = (seen.get(key) || 0) + 1;
  seen.set(key, count);
  memoryAt = now;
  writeStored('oracle-clock', { version: 1, at: now });
  if (count >= 3) return { kind: 'refusal' };
  const reading: Reading = {
    version: 2,
    persona,
    spice,
    topic: 'general',
    spread: 'one',
    cards: draw(1, reversed),
    seed: randomSeed(),
    date: localDate(),
  };
  recordCollection(reading);
  return { kind: 'reading', reading };
}
