import { personaIds, type Persona, type Spice } from './cards/phase2-types';
import type { Reading } from './types';
export { personaIds };
export const personas: Record<
  Persona,
  { name: string; hint: string; accent: string; symbol: string }
> = {
  blunt: {
    name: 'ซินแสปากตรง',
    hint: 'พูดสั้น แทงตรง ไม่ห่อน้ำตาล',
    accent: '#efba76',
    symbol: '✧',
  },
  oracle: {
    name: 'ราตรีมืด',
    hint: 'ประตูที่ปิด อาจมีใครรออีกฝั่ง',
    accent: '#c0a6ed',
    symbol: '☾',
  },
  bestie: {
    name: 'เพื่อนสนิทปากร้าย',
    hint: 'แก ไพ่เห็นแล้ว เลิกทำเป็นไม่รู้',
    accent: '#f0a7c6',
    symbol: '♡',
  },
  mu: {
    name: 'แม่หมอสายมู',
    hint: 'มูพอเป็นพิธี แต่ชีวิตต้องลงมือ',
    accent: '#8dd6c6',
    symbol: '✺',
  },
  gentle: { name: 'ใจดี', hint: 'ค่อยๆ อ่าน ให้ใจมีที่พัก', accent: '#b1c8e9', symbol: '❋' },
};
export const spiceNames: Record<Spice, string> = { 1: 'ไม่เผ็ด', 2: 'เผ็ดกลาง', 3: 'เผ็ดสะใจ' };
export function isPersona(value: unknown): value is Persona {
  return personaIds.includes(value as Persona);
}
export function isSpice(value: unknown): value is Spice {
  return value === 1 || value === 2 || value === 3;
}
export function readingStyle(reading: Reading): { persona: Persona; spice: Spice } {
  return reading.version === 1
    ? { persona: 'gentle', spice: 1 }
    : { persona: reading.persona || 'blunt', spice: reading.spice || 2 };
}
export function upgradeReading(reading: Reading): Reading {
  return { ...reading, version: 2, ...readingStyle(reading) };
}
