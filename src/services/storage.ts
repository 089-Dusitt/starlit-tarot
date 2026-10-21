import type { Persona, Spice } from '../data/types';
import { isPersona, isSpice } from '../data/personas';
export const PREFIX = 'starlit:';
export function readStored<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
  session = false,
): T {
  try {
    const raw = (session ? sessionStorage : localStorage).getItem(PREFIX + key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function writeStored(key: string, value: unknown, session = false): boolean {
  try {
    (session ? sessionStorage : localStorage).setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function clearData() {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    try {
      const storage = globalThis[key];
      Object.keys(storage)
        .filter((key) => key.startsWith(PREFIX))
        .forEach((key) => storage.removeItem(key));
    } catch {
      /* Restricted in-app storage leaves the active session usable. */
    }
  }
}
export interface Settings {
  version: 2;
  reversed: boolean;
  motion: boolean;
  history: boolean;
  persona: Persona;
  spice: Spice;
  onboarded: boolean;
  spiceConfirmed: boolean;
  sound: boolean;
  haptics: boolean;
}
export const validSettings = (v: unknown): v is Settings =>
  typeof v === 'object' &&
  v !== null &&
  (v as Settings).version === 2 &&
  isPersona((v as Settings).persona) &&
  isSpice((v as Settings).spice) &&
  ['reversed', 'motion', 'history', 'onboarded', 'spiceConfirmed', 'sound', 'haptics'].every(
    (k) => typeof (v as Record<string, unknown>)[k] === 'boolean',
  );
export function defaultSettings(): Settings {
  return {
    version: 2,
    reversed: true,
    motion:
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
    history: true,
    persona: 'blunt',
    spice: 2,
    onboarded: false,
    spiceConfirmed: false,
    sound: false,
    haptics: false,
  };
}
export function migrateSettings(value: unknown): Settings | null {
  if (validSettings(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const old = value as Record<string, unknown>;
  if (old.version !== undefined && old.version !== 1) return null;
  if (!['reversed', 'motion', 'history'].every((k) => typeof old[k] === 'boolean')) return null;
  return {
    ...defaultSettings(),
    reversed: old.reversed as boolean,
    motion: old.motion as boolean,
    history: old.history as boolean,
    persona: 'gentle',
    spice: 1,
    onboarded: true,
  };
}
export function loadSettings(): Settings {
  const raw = readStored<unknown>('settings', null, (v): v is unknown => v !== undefined);
  const migrated = migrateSettings(raw);
  if (migrated) writeStored('settings', migrated);
  return migrated || defaultSettings();
}
