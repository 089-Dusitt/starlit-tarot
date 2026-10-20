import type { Reading } from '../data/types';
import { draw } from '../engine/draw';
import { hashSeed, randomSeed, seededRng } from '../engine/rng';
import { readStored, writeStored } from './storage';
let memoryDevice: string | undefined;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dailyReading(reversed: boolean, date = localDate()): Reading {
  const validId = (v: unknown): v is string => typeof v === 'string' && /^[a-f\d]{8,32}$/i.test(v);
  const device =
    readStored('device', memoryDevice || '', validId) ||
    `${randomSeed().toString(16).padStart(8, '0')}${randomSeed().toString(16).padStart(8, '0')}`;
  memoryDevice = device;
  writeStored('device', device);
  const seed = hashSeed(`${date}:${device}`);
  return {
    version: 1,
    topic: 'general',
    spread: 'one',
    seed,
    date,
    cards: draw(1, reversed, seededRng(seed)),
  };
}
