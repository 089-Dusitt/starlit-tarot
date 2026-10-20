import type { Reading, Topic } from '../data/types';
import { spreads, getSpread } from '../data/spreads';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
import { topicIds } from '../data/topic-ids';
const epoch = Date.UTC(2020, 0, 1);
export function validReading(value: unknown): value is Reading {
  if (typeof value !== 'object' || !value) return false;
  const r = value as Record<string, unknown>;
  if (
    r.version !== 1 ||
    !topicIds.includes(r.topic as Topic) ||
    typeof r.spread !== 'string' ||
    !Number.isInteger(r.seed) ||
    (r.seed as number) < 0 ||
    (r.seed as number) > 4294967295 ||
    typeof r.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(r.date)
  )
    return false;
  const d = new Date(`${r.date}T00:00:00Z`);
  if (
    !Number.isFinite(d.getTime()) ||
    d.toISOString().slice(0, 10) !== r.date ||
    d.getUTCFullYear() < 2020 ||
    d.getUTCFullYear() > 2199
  )
    return false;
  const spread = getSpread(r.spread);
  if (
    !spread?.topics.includes(r.topic as Topic) ||
    !Array.isArray(r.cards) ||
    r.cards.length !== spread.positions.length
  )
    return false;
  const seen = new Set<number>();
  for (const entry of r.cards) {
    if (typeof entry !== 'object' || entry === null) return false;
    const c = entry as Record<string, unknown>;
    if (
      !Number.isInteger(c.index) ||
      (c.index as number) < 0 ||
      (c.index as number) > 77 ||
      typeof c.reversed !== 'boolean' ||
      seen.has(c.index as number)
    )
      return false;
    seen.add(c.index as number);
  }
  return true;
}
function pack(bytes: number[]): string {
  let buffer = 0,
    bits = 0,
    result = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      result += alphabet[(buffer >>> bits) & 63];
    }
  }
  if (bits) result += alphabet[(buffer << (6 - bits)) & 63];
  return result;
}
function unpack(text: string): number[] {
  let buffer = 0,
    bits = 0;
  const bytes: number[] = [];
  for (const char of text) {
    const value = alphabet.indexOf(char);
    if (value < 0) throw Error('Invalid alphabet');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 255);
    }
  }
  if (bits && buffer & ((1 << bits) - 1)) throw Error('Invalid trailing bits');
  return bytes;
}
export function encodeReading(reading: Reading): string {
  if (!validReading(reading)) throw Error('Invalid reading');
  const days = Math.round((Date.parse(`${reading.date}T00:00:00Z`) - epoch) / 86400000);
  const bytes = [
    1,
    topicIds.indexOf(reading.topic),
    spreads.findIndex((s) => s.id === reading.spread),
    reading.cards.length,
    ...reading.cards.map((c) => c.index * 2 + Number(c.reversed)),
    reading.seed >>> 24,
    (reading.seed >>> 16) & 255,
    (reading.seed >>> 8) & 255,
    reading.seed & 255,
    days >>> 16,
    (days >>> 8) & 255,
    days & 255,
  ];
  let check = 0;
  for (const byte of bytes) check = (check * 31 + byte) & 255;
  return pack([...bytes, check]);
}
export function decodeReading(code: string): Reading | null {
  try {
    if (code.length < 16 || code.length > 96 || !/^[\w-]+$/.test(code)) return null;
    const bytes = unpack(code);
    const count = bytes[3];
    if (bytes.length !== count + 12) return null;
    const checksum = bytes.slice(0, -1).reduce((sum, b) => (sum * 31 + b) & 255, 0);
    if (checksum !== bytes.at(-1)) return null;
    const offset = 4 + count;
    const seed =
      (bytes[offset] * 16777216 +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3]) >>>
      0;
    const days = bytes[offset + 4] * 65536 + bytes[offset + 5] * 256 + bytes[offset + 6];
    const reading: Reading = {
      version: bytes[0] as 1,
      topic: topicIds[bytes[1]],
      spread: spreads[bytes[2]]?.id,
      cards: bytes.slice(4, offset).map((v) => ({ index: v >>> 1, reversed: Boolean(v & 1) })),
      seed,
      date: new Date(epoch + days * 86400000).toISOString().slice(0, 10),
    };
    return validReading(reading) && encodeReading(reading) === code ? reading : null;
  } catch {
    return null;
  }
}
