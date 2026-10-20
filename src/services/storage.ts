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
  reversed: boolean;
  motion: boolean;
  history: boolean;
}
export const validSettings = (v: unknown): v is Settings =>
  typeof v === 'object' &&
  v !== null &&
  ['reversed', 'motion', 'history'].every(
    (k) => typeof (v as Record<string, unknown>)[k] === 'boolean',
  );
