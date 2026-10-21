import { it, expect } from 'vitest';
import { compose } from './compose';
import type { Reading } from '../data/types';
const base: Reading = {
  version: 2,
  persona: 'blunt',
  spice: 2,
  topic: 'exam',
  spread: 'study',
  cards: [
    { index: 16, reversed: false },
    { index: 19, reversed: false },
    { index: 18, reversed: true },
  ],
  seed: 42,
  date: '2026-10-21',
};
it('explains heavy cards in strengths and bright cards in cautions without changing the drawn faces', () => {
  const result = compose(base);
  expect(result.slots[0].positionFrame).toContain('จับสัญญาณ');
  expect(result.slots[1].positionFrame).toContain('เกินพอดี');
  expect(result.slots[1].positionFrame).toContain(result.slots[1].card.bite.exam.reversed);
  expect(result.slots.map((s) => ({ index: s.index, reversed: s.reversed }))).toEqual(base.cards);
});
it('treats another-person positions as questions and never privileged access to their thoughts', () => {
  const result = compose({ ...base, topic: 'love', spread: 'connection' });
  expect(result.slots[1].positionFrame).toContain('ตั้งคำถาม');
});
