import { describe, it, expect } from 'vitest';
import { readStored, writeStored, validSettings, loadSettings, defaultSettings } from './storage';
describe('settings storage', () => {
  it('validates and restores settings', () => {
    writeStored('settings', { reversed: false, motion: true, history: true });
    expect(loadSettings()).toMatchObject({
      version: 2,
      reversed: false,
      persona: 'gentle',
      spice: 1,
    });
    expect(readStored('settings', null, validSettings)?.reversed).toBe(false);
    localStorage.setItem('starlit:settings', '{"reversed":"yes"}');
    expect(readStored('settings', null, validSettings)).toBeNull();
  });
  it('uses the new default style and rejects unsupported versions without rewriting the source', () => {
    localStorage.clear();
    expect(loadSettings()).toEqual(defaultSettings());
    writeStored('settings', { ...defaultSettings(), version: 99 });
    expect(loadSettings().persona).toBe('blunt');
    expect(JSON.parse(localStorage.getItem('starlit:settings')!).version).toBe(99);
  });
});
