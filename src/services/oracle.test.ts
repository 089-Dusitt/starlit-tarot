import { it, expect, vi } from 'vitest';
import { askOracle, oracleAnswer, oracleRemaining } from './oracle';
it('applies persistent sixty-second cooldown and refuses the third repeated question without storing its text', async () => {
  localStorage.clear();
  vi.resetModules();
  const o = await import('./oracle');
  const now = 1000000;
  expect(o.askOracle('ควรเริ่มเขียนงานไหม', 'blunt', 2, true, now).kind).toBe('reading');
  expect(o.oracleRemaining(now + 1000)).toBe(59);
  expect(o.askOracle('คำถามอื่น', 'blunt', 2, true, now + 1000).kind).toBe('cooldown');
  expect(o.askOracle('ควรเริ่มเขียนงานไหม', 'blunt', 2, true, now + 60000).kind).toBe('reading');
  expect(o.askOracle('ควรเริ่มเขียนงานไหม?', 'blunt', 2, true, now + 120000).kind).toBe('refusal');
  expect(localStorage.getItem('starlit:oracle-clock')).not.toContain('เขียน');
});
it('guards crisis and sensitive outcome questions before issuing an answer', () => {
  expect(askOracle('ฉันอยากฆ่าตัวตาย', 'blunt', 3, true).kind).toBe('crisis');
  expect(askOracle('ฉันจะสอบผ่านไหม', 'blunt', 3, true).kind).toBe('sensitive');
  expect(askOracle('เขานอกใจไหม', 'bestie', 3, true).kind).toBe('sensitive');
  expect(oracleRemaining()).toBeGreaterThanOrEqual(0);
});
it('answers deterministically from the actual face and persona/spice', () => {
  const r = {
    version: 2 as const,
    persona: 'blunt' as const,
    spice: 3 as const,
    topic: 'general' as const,
    spread: 'one',
    cards: [{ index: 19, reversed: false }],
    seed: 1,
    date: '2026-10-22',
  };
  expect(oracleAnswer(r).title).toBe('ใช่');
  expect(oracleAnswer({ ...r, cards: [{ index: 16, reversed: false }] }).title).toBe('ไม่');
  expect(oracleAnswer(r)).toEqual(oracleAnswer(r));
});
