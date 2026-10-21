import { it, expect } from 'vitest';
import { combos, findCombos } from './combos';
import { identities } from './cards/identities';
import type { Position } from './types';
it('authors at least80 unique notable sets with complete distinct topic/spice lines', () => {
  expect(combos.length).toBeGreaterThanOrEqual(80);
  expect(new Set(combos.map((c) => c.id)).size).toBe(combos.length);
  expect(new Set(combos.map((c) => [...c.cards].sort().join('|'))).size).toBe(combos.length);
  const lines = new Set<string>();
  for (const combo of combos) {
    expect([2, 3]).toContain(combo.cards.length);
    for (const id of combo.cards) expect(identities.some((c) => c.id === id)).toBe(true);
    for (const pair of Object.values(combo.lines))
      for (const line of Object.values(pair)) {
        expect(line.length).toBeGreaterThan(15);
        expect(lines.has(line)).toBe(false);
        lines.add(line);
        expect(line).not.toMatch(/TODO|เสียชีวิต|ตั้งครรภ์|เลขเด็ด|รับรองผล|แน่นอน/);
      }
  }
});
it('matches presence in either orientation and honors positional stories', () => {
  for (const combo of combos) {
    const selected = combo.cards.map((id) => ({
      index: identities.findIndex((c) => c.id === id),
      reversed: true,
    }));
    const positions: Position[] = selected.map((_, i) => ({
      id: combo.positions?.[i] || `p${i}`,
      label: '',
      prompt: '',
      layout: { x: i, y: 0 },
    }));
    expect(findCombos(selected, positions).some((c) => c.id === combo.id)).toBe(true);
    expect(findCombos(selected.slice(1), positions.slice(1)).some((c) => c.id === combo.id)).toBe(
      false,
    );
    if (combo.positions) expect(findCombos(selected).some((c) => c.id === combo.id)).toBe(false);
  }
});
