import { it, expect } from 'vitest';
import { revealOrder } from './reveal';
it('holds the lowest-tone card until last at spice3 without moving its spread position', () => {
  const selected = [
    { index: 16, reversed: false },
    { index: 19, reversed: false },
    { index: 18, reversed: false },
  ];
  expect(revealOrder(selected, 3)).toEqual([1, 2, 0]);
  expect(revealOrder(selected, 2)).toEqual([0, 1, 2]);
  expect(selected[0].index).toBe(16);
  expect(revealOrder([selected[0]], 3)).toEqual([0]);
});
