export type Rng = () => number;
export function seededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
export function randomSeed(): number {
  return typeof globalThis.crypto?.getRandomValues === 'function'
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 4294967296);
}
export function randomIndex(bound: number, rng?: Rng): number {
  if (!Number.isInteger(bound) || bound < 1) throw Error('Invalid random bound');
  if (rng) return Math.floor(rng() * bound);
  const limit = Math.floor(4294967296 / bound) * bound;
  let value: number;
  do {
    value = randomSeed();
  } while (value >= limit);
  return value % bound;
}
export const randomFloat: Rng = () => randomSeed() / 4294967296;
